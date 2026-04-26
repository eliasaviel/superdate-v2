const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('../db/pool');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
}).single('photo');

async function uploadPhoto(req, res, next) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ ok: false, error: err.message });
    if (!req.file) return res.status(400).json({ ok: false, error: 'No file uploaded' });

    try {
      const { userId } = req.user;
      const url = `/uploads/${req.file.filename}`;

      const count = await pool.query('SELECT COUNT(*) FROM photos WHERE user_id = $1', [userId]);
      const isPrimary = parseInt(count.rows[0].count) === 0;

      const result = await pool.query(
        `INSERT INTO photos (user_id, url, is_primary, order_index)
         VALUES ($1, $2, $3, $4) RETURNING id, url, is_primary, order_index`,
        [userId, url, isPrimary, parseInt(count.rows[0].count)]
      );

      res.status(201).json({ ok: true, photo: result.rows[0] });
    } catch (e) {
      next(e);
    }
  });
}

async function deletePhoto(req, res, next) {
  try {
    const { userId } = req.user;
    const { photoId } = req.params;

    const photo = await pool.query(
      'SELECT * FROM photos WHERE id = $1 AND user_id = $2',
      [photoId, userId]
    );
    if (photo.rowCount === 0) return res.status(404).json({ ok: false, error: 'Photo not found' });

    const filePath = path.join(__dirname, '../../../', photo.rows[0].url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM photos WHERE id = $1', [photoId]);

    if (photo.rows[0].is_primary) {
      await pool.query(
        `UPDATE photos SET is_primary = TRUE
         WHERE user_id = $1 AND id = (SELECT id FROM photos WHERE user_id = $1 ORDER BY order_index LIMIT 1)`,
        [userId]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function setPrimary(req, res, next) {
  try {
    const { userId } = req.user;
    const { photoId } = req.params;

    await pool.query('UPDATE photos SET is_primary = FALSE WHERE user_id = $1', [userId]);
    const result = await pool.query(
      'UPDATE photos SET is_primary = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
      [photoId, userId]
    );

    if (result.rowCount === 0) return res.status(404).json({ ok: false, error: 'Photo not found' });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadPhoto, deletePhoto, setPrimary };
