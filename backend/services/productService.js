const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { buildProductQuery } = require('../utils/queryBuilder');

/**
 * Fetches paginated, filtered, sorted products.
 */
const getAllProducts = async (queryParams) => {
  const { query, page, limit, sort } = buildProductQuery(queryParams);

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).select('-reviews').lean(),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Fetches a single product by ID, with populated reviews.
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId).populate('reviews.user', 'name avatar');
  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

/**
 * Creates a new product. Only admins should call this.
 */
const createProduct = async (productData, adminId) => {
  const product = await Product.create({ ...productData, createdBy: adminId });
  return product;
};

/**
 * Updates an existing product.
 */
const updateProduct = async (productId, updateData) => {
  const product = await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

/**
 * Soft-deletes a product by setting isActive = false.
 */
const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndUpdate(productId, { isActive: false }, { new: true });
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

/**
 * Adds or updates a review for a product.
 * One review per user per product is enforced.
 */
const addReview = async (productId, userId, userName, { rating, comment }) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not found', 404);

  const existingReview = product.reviews.find((r) => r.user.toString() === userId.toString());

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    product.reviews.push({ user: userId, name: userName, rating, comment });
  }

  // Recalculate aggregate rating
  product.numReviews = product.reviews.length;
  product.averageRating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.numReviews;

  await product.save();
  return product;
};

/**
 * Deletes a review. Users can only delete their own; admins can delete any.
 */
const deleteReview = async (productId, reviewId, userId, isAdmin) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  const review = product.reviews.id(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  if (!isAdmin && review.user.toString() !== userId.toString()) {
    throw new AppError('Not authorized to delete this review', 403);
  }

  review.deleteOne();

  product.numReviews = product.reviews.length;
  product.averageRating =
    product.numReviews > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.numReviews
      : 0;

  await product.save();
  return product;
};

/**
 * Returns featured products for homepage.
 */
const getFeaturedProducts = async (limit = 8) => {
  return Product.find({ isFeatured: true, isActive: true }).limit(limit).select('-reviews').lean();
};

/**
 * Returns distinct categories with product counts.
 */
const getCategories = async () => {
  return Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
  getFeaturedProducts,
  getCategories,
};
