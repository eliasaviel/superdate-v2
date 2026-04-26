const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { proposeDate, getProposal, payHalf } = require('../controllers/superdate.controller');

router.post('/', requireAuth, proposeDate);
router.get('/:matchId', requireAuth, getProposal);
router.post('/:matchId/pay', requireAuth, payHalf);

module.exports = router;
