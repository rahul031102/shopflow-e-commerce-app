const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await productService.addReview(
    req.params.productId,
    req.user._id,
    req.user.name,
    { rating: Number(rating), comment }
  );
  res.status(201).json({ success: true, message: 'Review submitted', averageRating: product.averageRating, numReviews: product.numReviews });
});

const deleteReview = asyncHandler(async (req, res) => {
  await productService.deleteReview(
    req.params.productId,
    req.params.reviewId,
    req.user._id,
    req.user.role === 'admin'
  );
  res.status(200).json({ success: true, message: 'Review deleted' });
});

module.exports = { addReview, deleteReview };
