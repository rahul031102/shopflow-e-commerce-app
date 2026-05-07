const asyncHandler = require('express-async-handler');
const wishlistService = require('../services/wishlistService');

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(req.user._id);
  res.status(200).json({ success: true, wishlist });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.addToWishlist(req.user._id, req.params.productId);
  res.status(200).json({ success: true, wishlist });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
  res.status(200).json({ success: true, wishlist });
});

const clearWishlist = asyncHandler(async (req, res) => {
  await wishlistService.clearWishlist(req.user._id);
  res.status(200).json({ success: true, message: 'Wishlist cleared' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };
