const express = require('express');
const router = express.Router();
const { uploadImages, uploadUserAvatar } = require('../controllers/uploadController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/product-images', protect, authorize('admin'), uploadImages);
router.post('/avatar', protect, uploadUserAvatar);

module.exports = router;
