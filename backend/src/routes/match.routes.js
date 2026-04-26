const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { getMatches } = require('../controllers/match.controller');

router.get('/', requireAuth, getMatches);

module.exports = router;
