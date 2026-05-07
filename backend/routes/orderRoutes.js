// orderRoutes.js
const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
