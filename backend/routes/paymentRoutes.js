const express = require('express');
const router = express.Router();
const { createPaymentIntent, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Webhook uses raw body — registered before express.json() in server.js
router.post('/webhook', stripeWebhook);
router.post('/create-intent/:orderId', protect, createPaymentIntent);

module.exports = router;
