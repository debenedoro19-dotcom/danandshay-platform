import express from 'express';
import { all, get } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    // Auto-sort: upcoming events first (soonest at top), past events pushed to bottom
    const events = all(`
      SELECT e.*, 
        (SELECT MIN(price) FROM venue_seats WHERE event_id = e.id AND status = 'available') as min_price,
        CASE WHEN e.date < date('now') THEN 1 ELSE 0 END as is_past
      FROM events e
      ORDER BY 
        CASE WHEN e.date < date('now') THEN 1 ELSE 0 END ASC,
        CASE WHEN e.date >= date('now') THEN e.date END ASC,
        CASE WHEN e.date < date('now') THEN e.date END DESC
    `);
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  try {
    const event = get('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const seats = all('SELECT * FROM venue_seats WHERE event_id = ?', [eventId]);
    const meetGreetPackages = all('SELECT * FROM meet_greet_packages WHERE event_id = ?', [eventId]);
    
    res.json({ event, seats, meetGreetPackages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/seats', (req, res) => {
  const eventId = parseInt(req.params.id);
  try {
    const seats = all('SELECT * FROM venue_seats WHERE event_id = ?', [eventId]);
    res.json(seats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
