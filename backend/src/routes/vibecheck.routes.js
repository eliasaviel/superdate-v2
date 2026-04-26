const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { scheduleVibeCheck, getVibeCheck, confirmVibeCheck } = require('../controllers/vibecheck.controller');

router.post('/', requireAuth, scheduleVibeCheck);
router.get('/:matchId', requireAuth, getVibeCheck);
router.post('/:matchId/confirm', requireAuth, confirmVibeCheck);

module.exports = router;
