const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { getMessages, sendMessage } = require('../controllers/chat.controller');

router.get('/:matchId/messages', requireAuth, getMessages);
router.post('/:matchId/messages', requireAuth, sendMessage);

module.exports = router;
