const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService');

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const order = await orderService.createOrder(req.user._id, { shippingAddress, paymentMethod });
  res.status(201).json({ success: true, order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await orderService.getUserOrders(req.user._id, page, limit);
  res.status(200).json({ success: true, ...result });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role === 'admin');
  res.status(200).json({ success: true, order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  res.status(200).json({ success: true, ...result });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
