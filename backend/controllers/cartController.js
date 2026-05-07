const asyncHandler = require('express-async-handler');
const cartService = require('../services/cartService');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  res.status(200).json({ success: true, cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(req.user._id, productId, quantity);
  res.status(200).json({ success: true, cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.updateCartItem(req.user._id, productId, quantity);
  res.status(200).json({ success: true, cart });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
  res.status(200).json({ success: true, cart });
});

const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  res.status(200).json({ success: true, message: 'Cart cleared' });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  const cart = await cartService.applyCoupon(req.user._id, couponCode);
  res.status(200).json({ success: true, cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon };
