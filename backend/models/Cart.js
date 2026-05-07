const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: true, // Snapshot price at time of adding
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    couponCode: {
      type: String,
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: total items ─────────────────────────────────────────────────────
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ─── Virtual: subtotal ────────────────────────────────────────────────────────
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// ─── Virtual: total (after discount) ─────────────────────────────────────────
cartSchema.virtual('total').get(function () {
  return Math.max(0, this.subtotal - this.discount);
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
