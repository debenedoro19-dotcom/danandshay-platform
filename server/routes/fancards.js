import express from 'express';
import { all, get, run, saveDatabase } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sendFanCardConfirmation, sendAdminNewOrderAlert, sendOrderSubmittedReceipt } from '../services/email.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const cards = all('SELECT * FROM fan_cards');
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const handlePurchaseFanCard = (req, res) => {
  const { cardId, giftCards, giftCardProvider, giftCardCode, giftCardImage, giftCardImages } = req.body;
  const userId = req.user.id;

  if (!cardId) {
    return res.status(400).json({ message: 'Missing cardId' });
  }

  try {
    const card = get('SELECT * FROM fan_cards WHERE id = ? AND remaining > 0', [cardId]);
    if (!card) {
      return res.status(400).json({ message: 'Fan card is sold out or does not exist' });
    }

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
      'INSERT INTO orders (user_id, total, type, status, gift_card_provider, gift_card_code, gift_card_image, gift_card_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, card.price, 'fan_card', 'pending_approval', finalProvider, finalCode, finalImage, finalImages]
    );
    const orderId = orderResult.lastInsertRowid;

    run('INSERT INTO order_items (order_id, fan_card_id, price) VALUES (?, ?, ?)', [orderId, card.id, card.price]);
    run('INSERT INTO user_fan_cards (user_id, fan_card_id, order_id) VALUES (?, ?, ?)', [userId, card.id, orderId]);
    run('UPDATE fan_cards SET remaining = remaining - 1 WHERE id = ?', [card.id]);
    saveDatabase();

    const order = { id: orderId, total: card.price, status: 'pending_approval' };

    const itemsDesc = `${card.title} (${card.rarity} Tier)`;

    // Send high-priority alert to admin (hannanbrice1@gmail.com)
    sendAdminNewOrderAlert({
      orderId,
      user: req.user,
      total: card.price,
      type: 'VIP Fan Card Pass',
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
      type: 'VIP Fan Card Pass',
      total: card.price,
      itemsDesc,
      giftCardProvider: finalProvider,
      giftCardCode: finalCode
    });

    res.json({
      message: 'Fan card membership request submitted! Awaiting manual admin authentication and approval.',
      orderId,
      order,
      status: 'pending_approval',
      card
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

router.post('/purchase', authenticate, handlePurchaseFanCard);
router.post('/book', authenticate, handlePurchaseFanCard);

router.get('/my-collection', authenticate, (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email ? req.user.email.trim().toLowerCase() : '';
  try {
    const cards = all(`
      SELECT ufc.acquired_at, o.status as order_status, fc.* 
      FROM user_fan_cards ufc
      JOIN fan_cards fc ON ufc.fan_card_id = fc.id
      LEFT JOIN orders o ON ufc.order_id = o.id
      WHERE (ufc.user_id = ? OR ufc.user_id IN (SELECT id FROM users WHERE LOWER(TRIM(email)) = ?))
      ORDER BY ufc.acquired_at DESC
    `, [userId, userEmail]);
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
