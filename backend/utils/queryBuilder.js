/**
 * Builds a Mongoose query from URL query parameters.
 * Supports: keyword search, category, brand, price range, rating, sort, pagination.
 */
const buildProductQuery = (queryParams) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    isFeatured,
    inStock,
    sort = '-createdAt',
    page = 1,
    limit = 12,
  } = queryParams;

  const query = { isActive: true };

  if (keyword) {
    query.$text = { $search: keyword };
  }

  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (isFeatured === 'true') query.isFeatured = true;
  if (inStock === 'true') query.stock = { $gt: 0 };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (minRating) {
    query.averageRating = { $gte: Number(minRating) };
  }

  const validSorts = ['-createdAt', 'createdAt', 'price', '-price', '-averageRating', '-numReviews'];
  const safeSort = validSorts.includes(sort) ? sort : '-createdAt';

  return {
    query,
    sort: safeSort,
    page: Math.max(1, parseInt(page)),
    limit: Math.min(50, Math.max(1, parseInt(limit))),
  };
};

module.exports = { buildProductQuery };
