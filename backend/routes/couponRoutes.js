const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes require admin
router.use(protect, authorize('admin'));

// GET /api/admin/coupons
router.get('/', asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, coupons });
}));

// POST /api/admin/coupons
router.post('/', asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, expiresAt } = req.body;
  if (!code || !discountType || !discountValue || !expiresAt) {
    throw new AppError('code, discountType, discountValue, and expiresAt are required', 400);
  }
  const coupon = await Coupon.create({
    code, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, expiresAt,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, coupon });
}));

// PUT /api/admin/coupons/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.status(200).json({ success: true, coupon });
}));

// DELETE /api/admin/coupons/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError('Coupon not found', 404);
  res.status(200).json({ success: true, message: 'Coupon deleted' });
}));

module.exports = router;
