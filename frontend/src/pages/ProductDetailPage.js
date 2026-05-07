import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import API from '../services/api';
import toast from 'react-hot-toast';

const StarRating = ({ rating }) => (
  <span>{[1,2,3,4,5].map(s => <span key={s} style={{color: s <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}}>★</span>)}</span>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { dispatch(fetchProduct(id)); }, [dispatch, id]);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!product) return <div className="error-container"><h2>Product not found</h2></div>;

  const effectivePrice = product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice : product.price;
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    const result = await dispatch(addToCart({ productId: product._id, quantity }));
    if (addToCart.fulfilled.match(result)) toast.success('Added to cart!');
    else toast.error(result.payload || 'Failed');
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try { await API.post(`/wishlist/${product._id}`); toast.success('Added to wishlist!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await API.post(`/reviews/${product._id}`, reviewData);
      toast.success('Review submitted!');
      dispatch(fetchProduct(id));
      setReviewData({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-grid">
        {/* Images */}
        <div className="product-gallery">
          <div className="main-image-wrapper">
            <img
              src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="main-image"
            />
            {discountPct > 0 && <span className="detail-badge">-{discountPct}%</span>}
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnail-strip">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`view ${i+1}`}
                  className={`thumbnail ${selectedImage === i ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-detail-info">
          <p className="detail-brand">{product.brand}</p>
          <h1 className="detail-name">{product.name}</h1>

          <div className="detail-rating">
            <StarRating rating={product.averageRating} />
            <span className="detail-review-count">{product.numReviews} reviews</span>
          </div>

          <div className="detail-pricing">
            <span className="detail-price">${effectivePrice.toFixed(2)}</span>
            {product.discountPrice && (
              <span className="detail-original">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="detail-description">{product.description}</p>

          <div className="detail-meta">
            <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
            </span>
            <span className="category-tag">{product.category}</span>
          </div>

          {product.stock > 0 && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="qty-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>
          )}

          <div className="detail-actions">
            <button className="btn-add-cart" onClick={handleAddToCart} disabled={product.stock === 0}>
              🛒 Add to Cart
            </button>
            <button className="btn-wishlist" onClick={handleWishlist}>❤️ Wishlist</button>
          </div>

          <div className="shipping-info">
            <p>🚚 Free shipping on orders over $100</p>
            <p>↩️ 30-day return policy</p>
            <p>🔒 Secure checkout</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {/* Write review */}
        {user && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3>Write a Review</h3>
            <div className="review-rating-select">
              <label>Your Rating:</label>
              <select value={reviewData.rating} onChange={e => setReviewData({...reviewData, rating: Number(e.target.value)})}>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <textarea
              placeholder="Share your experience with this product..."
              value={reviewData.comment}
              onChange={e => setReviewData({...reviewData, comment: e.target.value})}
              required minLength={10} maxLength={500}
              className="review-textarea"
            />
            <button type="submit" disabled={submittingReview} className="submit-review-btn">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Review list */}
        <div className="reviews-list">
          {product.reviews?.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
          ) : (
            product.reviews?.map(review => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-avatar">{review.name?.[0]}</span>
                    <span className="reviewer-name">{review.name}</span>
                  </div>
                  <div>
                    <StarRating rating={review.rating} />
                    <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
