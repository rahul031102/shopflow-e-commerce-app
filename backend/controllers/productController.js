const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json({ success: true, ...result });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, product });
});

const createProduct = asyncHandler(async (req, res) => {
  const images = req.files?.map((f) => ({ public_id: f.filename, url: f.path })) || [];
  const product = await productService.createProduct({ ...req.body, images }, req.user._id);
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.files?.length) {
    updateData.images = req.files.map((f) => ({ public_id: f.filename, url: f.path }));
  }
  const product = await productService.updateProduct(req.params.id, updateData);
  res.status(200).json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getFeaturedProducts(req.query.limit);
  res.status(200).json({ success: true, products });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  res.status(200).json({ success: true, categories });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getCategories,
};
