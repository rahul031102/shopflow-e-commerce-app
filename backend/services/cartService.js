const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');

/**
 * Returns the user's cart, populating product details.
 */
const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'name images price discountPrice stock isActive'
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

/**
 * Adds an item to the cart or increments its quantity.
 */
const addToCart = async (userId, productId, quantity = 1) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  const effectivePrice = product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) throw new AppError('Not enough stock available', 400);
    existingItem.quantity = newQuantity;
    existingItem.price = effectivePrice; // Refresh price
  } else {
    cart.items.push({ product: productId, quantity, price: effectivePrice });
  }

  await cart.save();
  return cart.populate('items.product', 'name images price discountPrice stock isActive');
};

/**
 * Updates quantity of a specific cart item.
 */
const updateCartItem = async (userId, productId, quantity) => {
  if (quantity < 1) throw new AppError('Quantity must be at least 1', 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.find((i) => i.product.toString() === productId.toString());
  if (!item) throw new AppError('Item not found in cart', 404);

  item.quantity = quantity;
  await cart.save();
  return cart.populate('items.product', 'name images price discountPrice stock isActive');
};

/**
 * Removes a single item from the cart.
 */
const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.items = cart.items.filter((item) => item.product.toString() !== productId.toString());
  await cart.save();
  return cart.populate('items.product', 'name images price discountPrice stock isActive');
};

/**
 * Clears all items from the cart.
 */
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.items = [];
  cart.couponCode = null;
  cart.discount = 0;
  await cart.save();
  return cart;
};

/**
 * Applies a coupon code to the cart.
 */
const applyCoupon = async (userId, couponCode) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'price discountPrice');
  if (!cart || cart.items.length === 0) throw new AppError('Your cart is empty', 400);

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
  if (!coupon) throw new AppError('Invalid coupon code', 400);
  if (new Date() > coupon.expiresAt) throw new AppError('Coupon has expired', 400);
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError('Coupon usage limit reached', 400);
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (subtotal < coupon.minOrderAmount) {
    throw new AppError(`Minimum order amount for this coupon is $${coupon.minOrderAmount}`, 400);
  }

  let discount =
    coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount) {
    discount = Math.min(discount, coupon.maxDiscountAmount);
  }

  cart.couponCode = coupon.code;
  cart.discount = Math.round(discount * 100) / 100;
  await cart.save();
  return cart;
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
};
