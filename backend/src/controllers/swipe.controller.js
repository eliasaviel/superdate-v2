const { pool } = require('../db/pool');

async function swipe(req, res, next) {
  try {
    const { userId } = req.user;
    const { swiped_id, action } = req.body;

    if (!swiped_id || !['LIKE', 'PASS'].includes(action)) {
      return res.status(400).json({ ok: false, error: 'swiped_id and action (LIKE/PASS) are required' });
    }
    if (swiped_id === userId) {
      return res.status(400).json({ ok: false, error: 'Cannot swipe yourself' });
    }

    await pool.query(
      `INSERT INTO swipes (swiper_id, swiped_id, action) VALUES ($1, $2, $3)
       ON CONFLICT (swiper_id, swiped_id) DO NOTHING`,
      [userId, swiped_id, action]
    );

    let match = null;

    if (action === 'LIKE') {
      const mutualLike = await pool.query(
        `SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND action = 'LIKE'`,
        [swiped_id, userId]
      );

      if (mutualLike.rowCount > 0) {
        const existingMatch = await pool.query(
          `SELECT id FROM matches
           WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
          [userId, swiped_id]
        );

        if (existingMatch.rowCount === 0) {
          const newMatch = await pool.query(
            `INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) RETURNING id, created_at`,
            [userId, swiped_id]
          );
          match = newMatch.rows[0];
        }
      }
    }

    res.json({ ok: true, action, match });
  } catch (err) {
    next(err);
  }
}

module.exports = { swipe };
