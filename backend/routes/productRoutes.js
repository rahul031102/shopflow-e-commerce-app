const express = require('express');
const router = express.Router();
const {
  getAllProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getFeaturedProducts, getCategories,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
