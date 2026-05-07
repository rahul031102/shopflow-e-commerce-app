const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate(
    'products',
    'name images price discountPrice averageRating numReviews stock isActive'
  );
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

const addToWishlist = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not found', 404);

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { new: true, upsert: true }
  ).populate('products', 'name images price discountPrice averageRating numReviews stock isActive');

  return wishlist;
};

const removeFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $pull: { products: productId } },
    { new: true }
  ).populate('products', 'name images price discountPrice averageRating numReviews stock isActive');

  if (!wishlist) throw new AppError('Wishlist not found', 404);
  return wishlist;
};

const clearWishlist = async (userId) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $set: { products: [] } },
    { new: true }
  );
  if (!wishlist) throw new AppError('Wishlist not found', 404);
  return wishlist;
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };
