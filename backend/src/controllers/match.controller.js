const { pool } = require('../db/pool');

async function getMatches(req, res, next) {
  try {
    const { userId } = req.user;

    const result = await pool.query(
      `SELECT
        m.id AS match_id,
        m.created_at AS matched_at,
        m.stage,
        m.chat_unlocked,
        u.id, u.first_name, u.last_name,
        EXTRACT(YEAR FROM AGE(u.birth_date))::int AS age,
        u.city,
        (SELECT url FROM photos WHERE user_id = u.id AND is_primary = TRUE LIMIT 1) AS primary_photo,
        (SELECT message_text FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages WHERE match_id = m.id ORDER BY created_at DESC LIMIT 1) AS last_message_at
       FROM matches m
       JOIN users u ON u.id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
       WHERE m.user1_id = $1 OR m.user2_id = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

    res.json({ ok: true, matches: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMatches };
