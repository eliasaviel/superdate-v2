const { pool } = require('../db/pool');

async function getDiscovery(req, res, next) {
  try {
    const { userId } = req.user;

    const meRes = await pool.query(
      'SELECT min_age_pref, max_age_pref, interested_in, city FROM users WHERE id = $1',
      [userId]
    );
    if (meRes.rowCount === 0) return res.status(404).json({ ok: false, error: 'User not found' });

    const me = meRes.rows[0];

    const { gender, religion, city, min_age, max_age } = req.query;
    const finalMinAge = parseInt(min_age) || me.min_age_pref;
    const finalMaxAge = parseInt(max_age) || me.max_age_pref;
    const filterGender = gender || (me.interested_in !== 'both' ? me.interested_in : null);
    const filterCity = city || me.city;
    const filterReligion = religion || null;

    const params = [userId, finalMinAge, finalMaxAge];
    const conditions = [
      `u.id <> $1`,
      `u.is_active = TRUE`,
      `EXTRACT(YEAR FROM AGE(u.birth_date))::int BETWEEN $2 AND $3`,
      `u.id NOT IN (
         SELECT swiped_id FROM swipes WHERE swiper_id = $1
       )`,
    ];

    if (filterGender) {
      params.push(filterGender);
      conditions.push(`u.gender = $${params.length}`);
    }
    if (filterReligion) {
      params.push(filterReligion);
      conditions.push(`u.religion = $${params.length}`);
    }
    if (filterCity) {
      params.push(filterCity);
      conditions.push(`u.city = $${params.length}`);
    }

    const sql = `
      SELECT
        u.id, u.first_name, u.last_name,
        EXTRACT(YEAR FROM AGE(u.birth_date))::int AS age,
        u.gender, u.religion, u.religious_lifestyle,
        u.bio, u.city,
        (SELECT url FROM photos WHERE user_id = u.id AND is_primary = TRUE LIMIT 1) AS primary_photo,
        ARRAY(SELECT url FROM photos WHERE user_id = u.id ORDER BY order_index) AS photos
      FROM users u
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.created_at DESC
      LIMIT 20
    `;

    const result = await pool.query(sql, params);
    res.json({ ok: true, count: result.rowCount, candidates: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDiscovery };
