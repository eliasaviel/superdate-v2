const router = require('express').Router();
const requireAuth = require('../middleware/requireAuth');
const { uploadPhoto, deletePhoto, setPrimary } = require('../controllers/photo.controller');

router.post('/upload', requireAuth, uploadPhoto);
router.delete('/:photoId', requireAuth, deletePhoto);
router.patch('/:photoId/primary', requireAuth, setPrimary);

module.exports = router;
