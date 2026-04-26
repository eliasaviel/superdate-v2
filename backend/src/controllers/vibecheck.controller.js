const { pool } = require('../db/pool');
const axios = require('axios');

const DAILY_API = 'https://api.daily.co/v1';
const DAILY_KEY = process.env.DAILY_API_KEY;

async function createDailyRoom(matchId) {
  const roomName = `superdate-${matchId.slice(0, 8)}-${Date.now()}`;
  const resp = await axios.post(
    `${DAILY_API}/rooms`,
    {
      name: roomName,
      properties: {
        max_participants: 2,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h expiry
        eject_at_room_exp: true,
      },
    },
    { headers: { Authorization: `Bearer ${DAILY_KEY}` } }
  );
  return { name: resp.data.name, url: resp.data.url };
}

async function scheduleVibeCheck(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId, scheduledAt } = req.body;

    const matchRes = await pool.query(
      `SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );
    if (matchRes.rowCount === 0) return res.status(404).json({ ok: false, message: 'Match not found' });

    const existing = await pool.query(`SELECT id FROM vibe_checks WHERE match_id = $1`, [matchId]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ ok: false, message: 'Vibe check already exists for this match' });
    }

    const room = await createDailyRoom(matchId);

    const result = await pool.query(
      `INSERT INTO vibe_checks (match_id, daily_room_name, daily_room_url, scheduled_at, status)
       VALUES ($1, $2, $3, $4, 'scheduled') RETURNING *`,
      [matchId, room.name, room.url, scheduledAt || null]
    );

    await pool.query(`UPDATE matches SET stage = 'vibe_check' WHERE id = $1`, [matchId]);

    res.json({ ok: true, vibeCheck: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getVibeCheck(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId } = req.params;

    const matchRes = await pool.query(
      `SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );
    if (matchRes.rowCount === 0) return res.status(404).json({ ok: false, message: 'Match not found' });

    const result = await pool.query(`SELECT * FROM vibe_checks WHERE match_id = $1`, [matchId]);
    res.json({ ok: true, vibeCheck: result.rows[0] || null });
  } catch (err) {
    next(err);
  }
}

async function confirmVibeCheck(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId } = req.params;

    const matchRes = await pool.query(
      `SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );
    if (matchRes.rowCount === 0) return res.status(404).json({ ok: false, message: 'Match not found' });

    const match = matchRes.rows[0];
    const isUser1 = match.user1_id === userId;
    const field = isUser1 ? 'user1_confirmed' : 'user2_confirmed';

    const updated = await pool.query(
      `UPDATE vibe_checks SET ${field} = TRUE WHERE match_id = $1 RETURNING *`,
      [matchId]
    );
    const vc = updated.rows[0];

    if (vc.user1_confirmed && vc.user2_confirmed) {
      await pool.query(
        `UPDATE vibe_checks SET status = 'confirmed' WHERE match_id = $1`,
        [matchId]
      );
      await pool.query(`UPDATE matches SET stage = 'superdate' WHERE id = $1`, [matchId]);
      return res.json({ ok: true, bothConfirmed: true, vibeCheck: { ...vc, status: 'confirmed' } });
    }

    res.json({ ok: true, bothConfirmed: false, vibeCheck: vc });
  } catch (err) {
    next(err);
  }
}

module.exports = { scheduleVibeCheck, getVibeCheck, confirmVibeCheck };
