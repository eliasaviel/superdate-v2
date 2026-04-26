const { verifyToken } = require('../utils/jwt');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'No token provided' });
  }
  const token = header.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
};
