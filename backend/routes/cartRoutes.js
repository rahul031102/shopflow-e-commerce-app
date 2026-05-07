const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/item/:productId', removeFromCart);
router.post('/coupon', applyCoupon);

module.exports = router;
