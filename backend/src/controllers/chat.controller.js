const { pool } = require('../db/pool');

async function getMessages(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId } = req.params;

    const access = await pool.query(
      'SELECT id, chat_unlocked FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, userId]
    );
    if (access.rowCount === 0) return res.status(403).json({ ok: false, error: 'Access denied' });
    if (!access.rows[0].chat_unlocked) {
      return res.status(403).json({ ok: false, error: 'Chat is locked until both pay for the SuperDate.' });
    }

    const result = await pool.query(
      `SELECT id, match_id, sender_id, message_text, created_at
       FROM messages WHERE match_id = $1 ORDER BY created_at ASC`,
      [matchId]
    );

    res.json({ ok: true, messages: result.rows });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId } = req.params;
    const { message_text } = req.body;

    if (!message_text || !message_text.trim()) {
      return res.status(400).json({ ok: false, error: 'Message cannot be empty' });
    }

    const access = await pool.query(
      'SELECT id, chat_unlocked FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, userId]
    );
    if (access.rowCount === 0) return res.status(403).json({ ok: false, error: 'Access denied' });
    if (!access.rows[0].chat_unlocked) {
      return res.status(403).json({ ok: false, error: 'Chat is locked until both pay for the SuperDate.' });
    }

    const result = await pool.query(
      `INSERT INTO messages (match_id, sender_id, message_text)
       VALUES ($1, $2, $3) RETURNING id, match_id, sender_id, message_text, created_at`,
      [matchId, userId, message_text.trim()]
    );

    res.status(201).json({ ok: true, message: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMessages, sendMessage };
