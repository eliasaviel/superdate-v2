const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { getVenues } = require('../controllers/venues.controller');

router.get('/', requireAuth, getVenues);

module.exports = router;
