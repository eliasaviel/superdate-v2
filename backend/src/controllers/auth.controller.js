const bcrypt = require('bcryptjs');
const { pool } = require('../db/pool');
const { signToken } = require('../utils/jwt');

async function register(req, res, next) {
  try {
    const { phone, email, password, first_name, last_name } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }
    if (!email && !phone) {
      return res.status(400).json({ ok: false, error: 'Email or phone is required' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email || null, phone || null]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ ok: false, error: 'Email or phone already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (phone, email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, phone, first_name, last_name, created_at`,
      [phone || null, email || null, password_hash, first_name || null, last_name || null]
    );

    const user = result.rows[0];
    const token = signToken({ userId: user.id });

    res.status(201).json({ ok: true, token, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, phone, password } = req.body;

    if (!password) return res.status(400).json({ ok: false, error: 'Password is required' });
    if (!email && !phone) return res.status(400).json({ ok: false, error: 'Email or phone is required' });

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2 LIMIT 1',
      [email || null, phone || null]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id });
    const { password_hash, ...safeUser } = user;

    res.json({ ok: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
