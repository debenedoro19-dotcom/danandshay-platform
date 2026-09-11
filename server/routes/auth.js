import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, run, saveDatabase, getPgPool } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sendWelcomeRegistrationEmail } from '../services/email.js';

const router = express.Router();
const JWT_SECRET = 'danandshay_jwt_secret_2026';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  try {
    const existingUser = get('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?', [cleanEmail]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const result = run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [cleanName, cleanEmail, passwordHash]);
    saveDatabase();

    // Dispatch luxury welcome email
    sendWelcomeRegistrationEmail(cleanEmail, cleanName);

    const user = { id: result.lastInsertRowid, name: cleanName, email: cleanEmail, role: 'fan' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    let user = get('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?', [cleanEmail]);

    // Resilient Cloud Recovery: If user not found in SQLite memory, check PostgreSQL persistent_users
    if (!user) {
      try {
        const pool = getPgPool();
        if (pool) {
          const pgRes = await pool.query('SELECT * FROM persistent_users WHERE LOWER(TRIM(email)) = $1', [cleanEmail]);
          if (pgRes.rows && pgRes.rows.length > 0) {
            const pu = pgRes.rows[0];
            const insertRes = run(
              'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
              [pu.name, pu.email, pu.password_hash, pu.role || 'fan', pu.created_at ? new Date(pu.created_at).toISOString() : new Date().toISOString()]
            );
            saveDatabase();
            user = get('SELECT * FROM users WHERE id = ?', [insertRes.lastInsertRowid]);
            console.log(`[Auth Recovery] Successfully recovered user ${cleanEmail} from PostgreSQL into local database!`);
          }
        }
      } catch (err) {
        console.error('[Auth Recovery] PostgreSQL check error:', err.message);
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, (req, res) => {
  const user = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token, ...user });
});

router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  try {
    const user = get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    saveDatabase();

    // Mirror change to PostgreSQL cloud storage if active
    const pool = getPgPool();
    if (pool) {
      try {
        await pool.query('UPDATE persistent_users SET password_hash = $1 WHERE email = $2', [newHash, user.email]);
      } catch (e) {
        console.error('Cloud password sync error:', e.message);
      }
    }

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
