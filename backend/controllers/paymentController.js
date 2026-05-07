const asyncHandler = require('express-async-handler');
const paymentService = require('../services/paymentService');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createPaymentIntent(req.params.orderId, req.user._id);
  res.status(200).json({ success: true, ...result });
});

// Note: this route uses raw body (configured in server.js)
const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const result = await paymentService.handleStripeWebhook(req.body, signature);
  res.status(200).json(result);
});

module.exports = { createPaymentIntent, stripeWebhook };
