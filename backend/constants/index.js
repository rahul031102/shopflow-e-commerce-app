const ROLES = { USER: 'user', ADMIN: 'admin' };

const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing', 'Footwear', 'Accessories',
  'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Other',
];

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;

module.exports = { ROLES, ORDER_STATUS, PRODUCT_CATEGORIES, TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_COST };
