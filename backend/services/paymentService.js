const stripe = require('../config/stripe');
const Order = require('../models/Order');
const { markOrderAsPaid } = require('./orderService');
const AppError = require('../utils/AppError');

/**
 * Creates a Stripe PaymentIntent for an order.
 * Returns the client_secret needed by the frontend.
 */
const createPaymentIntent = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== userId.toString()) {
    throw new AppError('Not authorized', 403);
  }
  if (order.isPaid) throw new AppError('Order already paid', 400);

  const amountInCents = Math.round(order.totalPrice * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    metadata: {
      orderId: orderId.toString(),
      userId: userId.toString(),
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: amountInCents,
  };
};

/**
 * Handles Stripe webhook events to confirm payment.
 * This ensures payment confirmation is server-side (not client-side trusting).
 */
const handleStripeWebhook = async (rawBody, signature) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    await markOrderAsPaid(orderId, {
      stripePaymentIntentId: paymentIntent.id,
      status: 'succeeded',
      updateTime: new Date().toISOString(),
      email: paymentIntent.receipt_email,
    });
  }

  return { received: true };
};

module.exports = { createPaymentIntent, handleStripeWebhook };
