const { pool } = require('../db/pool');

async function getMe(req, res, next) {
  try {
    const { userId } = req.user;
    const user = await pool.query(
      `SELECT id, phone, email, first_name, last_name, birth_date, gender, interested_in,
              religion, religious_lifestyle, bio, city, lat, lng, min_age_pref, max_age_pref,
              is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (user.rowCount === 0) return res.status(404).json({ ok: false, error: 'User not found' });

    const photos = await pool.query(
      'SELECT id, url, is_primary, order_index FROM photos WHERE user_id = $1 ORDER BY order_index ASC',
      [userId]
    );

    res.json({ ok: true, user: user.rows[0], photos: photos.rows });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { userId } = req.user;
    const {
      first_name, last_name, birth_date, gender, interested_in,
      religion, religious_lifestyle, bio, city, lat, lng,
    } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        birth_date = COALESCE($3, birth_date),
        gender = COALESCE($4, gender),
        interested_in = COALESCE($5, interested_in),
        religion = COALESCE($6, religion),
        religious_lifestyle = COALESCE($7, religious_lifestyle),
        bio = COALESCE($8, bio),
        city = COALESCE($9, city),
        lat = COALESCE($10, lat),
        lng = COALESCE($11, lng),
        updated_at = NOW()
       WHERE id = $12
       RETURNING id, phone, email, first_name, last_name, birth_date, gender, interested_in,
                 religion, religious_lifestyle, bio, city, lat, lng, min_age_pref, max_age_pref`,
      [first_name, last_name, birth_date, gender, interested_in,
       religion, religious_lifestyle, bio, city, lat, lng, userId]
    );

    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const { userId } = req.user;
    const { min_age_pref, max_age_pref, interested_in } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        min_age_pref = COALESCE($1, min_age_pref),
        max_age_pref = COALESCE($2, max_age_pref),
        interested_in = COALESCE($3, interested_in),
        updated_at = NOW()
       WHERE id = $4
       RETURNING min_age_pref, max_age_pref, interested_in`,
      [min_age_pref, max_age_pref, interested_in, userId]
    );

    res.json({ ok: true, preferences: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe, updatePreferences };
