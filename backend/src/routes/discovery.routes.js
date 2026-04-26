const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { getDiscovery } = require('../controllers/discovery.controller');

router.get('/', requireAuth, getDiscovery);

module.exports = router;
