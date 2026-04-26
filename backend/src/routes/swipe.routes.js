const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { swipe } = require('../controllers/swipe.controller');

router.post('/', requireAuth, swipe);

module.exports = router;
