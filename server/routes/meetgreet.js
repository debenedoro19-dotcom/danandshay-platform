import express from 'express';
import { all, get, run, saveDatabase } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sendMeetGreetConfirmation, sendAdminNewOrderAlert, sendOrderSubmittedReceipt } from '../services/email.js';

const router = express.Router();

// List all packages — exactly 4 master categories
router.get('/', (req, res) => {
  try {
    const packages = all('SELECT * FROM meet_greet_packages ORDER BY price ASC');
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User's own VIP bookings (MUST be defined before /:eventId)
router.get('/my-bookings', authenticate, (req, res) => {
  const userId = req.user.id;
  try {
    const bookings = all(`
      SELECT o.id as order_id, o.total, o.status, o.created_at, o.location_state, o.location_city,
             m.title, m.description, m.perks, m.price,
             COALESCE(o.location_city, e.city, 'Local City') as event_city,
             COALESCE(o.location_state, e.state, 'USA') as event_state,
             COALESCE(e.venue, 'Private VIP Venue') as event_venue,
             COALESCE(e.title, 'Dan + Shay Meet & Greet') as event_title,
             COALESCE(e.date, '2026 Tour Season') as event_date,
             e.time as event_time, 
             e.image_url as event_image
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN meet_greet_packages m ON oi.meet_greet_id = m.id
      LEFT JOIN events e ON m.event_id = e.id
      WHERE o.user_id = ? AND o.type = 'meet_greet'
      ORDER BY o.created_at DESC
    `, [userId]);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Packages for specific event (fallback)
router.get('/:eventId', (req, res) => {
  try {
    const packages = all('SELECT * FROM meet_greet_packages ORDER BY price ASC');
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const handleBookMeetGreet = (req, res) => {
  const { packageId, locationState, locationCity, giftCards, giftCardProvider, giftCardCode, giftCardImage, giftCardImages } = req.body;
  const userId = req.user.id;

  if (!packageId) {
    return res.status(400).json({ message: 'Missing packageId' });
  }

  try {
    const pkg = get('SELECT * FROM meet_greet_packages WHERE id = ? AND spots_remaining > 0', [packageId]);
    if (!pkg) {
      return res.status(400).json({ message: 'Package is sold out or does not exist' });
    }

    const locState = locationState || 'Tennessee';
    const locCity = locationCity || 'Nashville';

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

    const orderResult = run(
      'INSERT INTO orders (user_id, event_id, total, type, status, gift_card_provider, gift_card_code, gift_card_image, gift_card_images, location_state, location_city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, pkg.event_id || 1, pkg.price, 'meet_greet', 'pending_approval', finalProvider, finalCode, finalImage, finalImages, locState, locCity]
    );
    const orderId = orderResult.lastInsertRowid;

    run('INSERT INTO order_items (order_id, meet_greet_id, price) VALUES (?, ?, ?)', [orderId, pkg.id, pkg.price]);
    run('UPDATE meet_greet_packages SET spots_remaining = spots_remaining - 1 WHERE id = ?', [pkg.id]);
    saveDatabase();

    const order = { id: orderId, total: pkg.price, status: 'pending_approval', location_state: locState, location_city: locCity };

    const itemsDesc = `${pkg.title} — Location: ${locCity}, ${locState} (Nationwide VIP Pass)`;

    // Send high-priority alert to admin (hannanbrice1@gmail.com)
    sendAdminNewOrderAlert({
      orderId,
      user: req.user,
      total: pkg.price,
      type: 'VIP Meet & Greet',
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
      type: 'VIP Meet & Greet',
      total: pkg.price,
      itemsDesc,
      giftCardProvider: finalProvider,
      giftCardCode: finalCode
    });

    res.json({
      message: 'VIP Meet & Greet reservation submitted! Awaiting manual admin authentication and approval.',
      orderId,
      order,
      status: 'pending_approval',
      booking: pkg
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

router.post('/book', authenticate, handleBookMeetGreet);
router.post('/purchase', authenticate, handleBookMeetGreet);

export default router;
