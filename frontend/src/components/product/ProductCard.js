import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import API from '../../services/api';

const StarRating = ({ rating, numReviews }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
    ))}
    <span className="review-count">({numReviews})</span>
  </div>
);

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in to add items to cart'); return; }
    const result = await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(result.payload || 'Failed to add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in'); return; }
    try {
      await API.post(`/wishlist/${product._id}`);
      toast.success('Added to wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const effectivePrice = product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice : product.price;
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        <div className="product-image-wrapper">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          {discountPct > 0 && <span className="discount-badge">-{discountPct}%</span>}
          {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
          <button className="wishlist-btn" onClick={handleWishlist} title="Add to wishlist">❤️</button>
        </div>
        <div className="product-info">
          <p className="product-brand">{product.brand}</p>
          <h3 className="product-name">{product.name}</h3>
          <StarRating rating={product.averageRating} numReviews={product.numReviews} />
          <div className="product-pricing">
            <span className="product-price">${effectivePrice.toFixed(2)}</span>
            {product.discountPrice && (
              <span className="product-original-price">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
