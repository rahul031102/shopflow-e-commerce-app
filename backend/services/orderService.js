const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../utils/emailService');

const TAX_RATE = 0.08; // 8%
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;

/**
 * Calculates order prices consistently.
 */
const calculateOrderPrices = (items, discount = 0) => {
  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const discountedAmount = Math.min(discount, itemsPrice);
  const taxableAmount = itemsPrice - discountedAmount;
  const taxPrice = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((taxableAmount + shippingPrice + taxPrice) * 100) / 100;

  return { itemsPrice, shippingPrice, taxPrice, totalPrice, discount: discountedAmount };
};

/**
 * Creates a new order from the user's cart.
 */
const createOrder = async (userId, { shippingAddress, paymentMethod, couponCode }) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new AppError('Your cart is empty', 400);

  // Validate stock and build order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new AppError(`Product "${item.product?.name || 'unknown'}" is no longer available`, 400);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for "${product.name}"`, 400);
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: item.price,
      quantity: item.quantity,
    });
  }

  const prices = calculateOrderPrices(orderItems, cart.discount);

  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod,
    couponCode: cart.couponCode || null,
    ...prices,
  });

  // Decrement stock for each product
  const stockUpdates = orderItems.map((item) =>
    Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
  );
  await Promise.all(stockUpdates);

  // Clear cart
  cart.items = [];
  cart.couponCode = null;
  cart.discount = 0;
  await cart.save();

  // Send confirmation email
  const user = await User.findById(userId);
  if (user) sendOrderConfirmationEmail(user, order).catch(() => {});

  return order;
};

/**
 * Returns all orders for a specific user with pagination.
 */
const getUserOrders = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user: userId }),
  ]);
  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

/**
 * Returns a single order, ensuring user ownership unless admin.
 */
const getOrderById = async (orderId, userId, isAdmin) => {
  const order = await Order.findById(orderId).populate('user', 'name email');
  if (!order) throw new AppError('Order not found', 404);
  if (!isAdmin && order.user._id.toString() !== userId.toString()) {
    throw new AppError('Not authorized to view this order', 403);
  }
  return order;
};

/**
 * Updates order payment status after Stripe confirmation.
 */
const markOrderAsPaid = async (orderId, paymentResult) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.isPaid) throw new AppError('Order already paid', 400);

  order.isPaid = true;
  order.paidAt = new Date();
  order.orderStatus = 'processing';
  order.paymentResult = paymentResult;

  await order.save();
  return order;
};

/**
 * Admin: updates order delivery status.
 */
const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400);

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      orderStatus: status,
      ...(status === 'delivered' ? { isDelivered: true, deliveredAt: new Date() } : {}),
    },
    { new: true }
  );

  if (!order) throw new AppError('Order not found', 404);

  // Email the user about status change
  const user = await User.findById(order.user);
  if (user) sendOrderStatusEmail(user, order).catch(() => {});

  return order;
};

/**
 * Admin: returns all orders with filtering & pagination.
 */
const getAllOrders = async ({ page = 1, limit = 20, status, search }) => {
  const query = {};
  if (status) query.orderStatus = status;
  if (search) query._id = search; // Allow searching by order ID

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  markOrderAsPaid,
  updateOrderStatus,
  getAllOrders,
  calculateOrderPrices,
};
