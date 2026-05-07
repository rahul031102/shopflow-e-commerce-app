import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import API from '../services/api';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    API.get('/wishlist')
      .then(res => setWishlist(res.data.wishlist))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId) => {
    try {
      await API.delete(`/wishlist/${productId}`);
      setWishlist(prev => ({ ...prev, products: prev.products.filter(p => p._id !== productId) }));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const handleAddToCart = async (productId, name) => {
    const result = await dispatch(addToCart({ productId, quantity: 1 }));
    if (addToCart.fulfilled.match(result)) toast.success(`${name} added to cart!`);
    else toast.error(result.payload || 'Failed to add to cart');
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear your entire wishlist?')) return;
    try {
      await API.delete('/wishlist/clear');
      setWishlist(prev => ({ ...prev, products: [] }));
      toast.success('Wishlist cleared');
    } catch { toast.error('Failed to clear'); }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1 className="page-title">My Wishlist</h1>
        {wishlist?.products?.length > 0 && (
          <button onClick={handleClearAll} className="clear-wishlist-btn">Clear All</button>
        )}
      </div>

      {!wishlist?.products?.length ? (
        <div className="empty-state">
          <span>❤️</span>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love and come back to them later.</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.products.map(product => {
            const effectivePrice = product.discountPrice && product.discountPrice < product.price
              ? product.discountPrice : product.price;
            return (
              <div key={product._id} className="wishlist-card">
                <button className="wishlist-remove-btn" onClick={() => handleRemove(product._id)} title="Remove">✕</button>
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="wishlist-img"
                  />
                </Link>
                <div className="wishlist-info">
                  <Link to={`/products/${product._id}`} className="wishlist-name">{product.name}</Link>
                  <div className="wishlist-rating">
                    {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
                    <span>({product.numReviews})</span>
                  </div>
                  <div className="wishlist-pricing">
                    <span className="wishlist-price">${effectivePrice?.toFixed(2)}</span>
                    {product.discountPrice && (
                      <span className="wishlist-original">${product.price?.toFixed(2)}</span>
                    )}
                  </div>
                  <span className={`stock-tag ${product.stock > 0 ? 'in' : 'out'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button
                  className="wishlist-cart-btn"
                  onClick={() => handleAddToCart(product._id, product.name)}
                  disabled={product.stock === 0}
                >
                  🛒 {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
