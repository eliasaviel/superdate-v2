const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { getMe, updateMe, updatePreferences } = require('../controllers/user.controller');

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/me/preferences', requireAuth, updatePreferences);

module.exports = router;
