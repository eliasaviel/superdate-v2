const { pool } = require('../db/pool');

async function proposeDate(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId, venueId, proposedDate } = req.body;

    const matchRes = await pool.query(
      `SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND stage = 'superdate'`,
      [matchId, userId]
    );
    if (matchRes.rowCount === 0) return res.status(404).json({ ok: false, message: 'Match not ready for SuperDate' });

    const existing = await pool.query(`SELECT id FROM superdate_proposals WHERE match_id = $1`, [matchId]);
    if (existing.rowCount > 0) {
      return res.status(400).json({ ok: false, message: 'Proposal already exists' });
    }

    const result = await pool.query(
      `INSERT INTO superdate_proposals (match_id, venue_id, proposer_id, proposed_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [matchId, venueId, userId, proposedDate || null]
    );

    res.json({ ok: true, proposal: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getProposal(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId } = req.params;

    const matchRes = await pool.query(
      `SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );
    if (matchRes.rowCount === 0) return res.status(404).json({ ok: false, message: 'Match not found' });

    const result = await pool.query(
      `SELECT sp.*, v.name AS venue_name, v.address, v.price_per_person, v.image_url, v.category
       FROM superdate_proposals sp
       JOIN venues v ON v.id = sp.venue_id
       WHERE sp.match_id = $1`,
      [matchId]
    );
    res.json({ ok: true, proposal: result.rows[0] || null });
  } catch (err) {
    next(err);
  }
}

async function payHalf(req, res, next) {
  try {
    const { userId } = req.user;
    const { matchId } = req.params;

    const matchRes = await pool.query(
      `SELECT * FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [matchId, userId]
    );
    if (matchRes.rowCount === 0) return res.status(404).json({ ok: false, message: 'Match not found' });

    const proposalRes = await pool.query(
      `SELECT sp.*, v.price_per_person FROM superdate_proposals sp
       JOIN venues v ON v.id = sp.venue_id
       WHERE sp.match_id = $1`,
      [matchId]
    );
    if (proposalRes.rowCount === 0) return res.status(404).json({ ok: false, message: 'No proposal found' });

    const proposal = proposalRes.rows[0];
    const isProposer = proposal.proposer_id === userId;
    const field = isProposer ? 'proposer_paid' : 'receiver_paid';

    if (proposal[field]) {
      return res.status(400).json({ ok: false, message: 'Already paid' });
    }

    const updated = await pool.query(
      `UPDATE superdate_proposals SET ${field} = TRUE WHERE match_id = $1 RETURNING *`,
      [matchId]
    );
    const p = updated.rows[0];

    if (p.proposer_paid && p.receiver_paid) {
      await pool.query(
        `UPDATE superdate_proposals SET status = 'confirmed' WHERE match_id = $1`,
        [matchId]
      );
      await pool.query(
        `UPDATE matches SET chat_unlocked = TRUE, stage = 'dating' WHERE id = $1`,
        [matchId]
      );
      return res.json({ ok: true, chatUnlocked: true, proposal: { ...p, status: 'confirmed' } });
    }

    res.json({ ok: true, chatUnlocked: false, proposal: p });
  } catch (err) {
    next(err);
  }
}

module.exports = { proposeDate, getProposal, payHalf };
