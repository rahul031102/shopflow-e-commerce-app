const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/clear', clearWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
