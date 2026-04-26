const { pool } = require('../db/pool');

async function getVenues(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT * FROM venues WHERE is_active = TRUE ORDER BY category, name`
    );
    res.json({ ok: true, venues: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getVenues };
