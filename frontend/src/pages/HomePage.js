import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';

const CATEGORY_ICONS = {
  Electronics: '💻', Clothing: '👕', Footwear: '👟', Accessories: '⌚',
  'Home & Kitchen': '🏠', Books: '📚', Sports: '⚽', Beauty: '💄', Toys: '🧸', Other: '📦',
};

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, categories } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Premium Products</h1>
          <p className="hero-subtitle">Shop the latest trends with unbeatable prices and fast shipping.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-hero-primary">Shop Now</Link>
            <Link to="/products?isFeatured=true" className="btn-hero-secondary">View Featured</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <span className="hero-emoji">🛍️</span>
            <p>10,000+ Products</p>
          </div>
          <div className="hero-card">
            <span className="hero-emoji">🚚</span>
            <p>Free Shipping over $100</p>
          </div>
          <div className="hero-card">
            <span className="hero-emoji">🔒</span>
            <p>Secure Payments</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products" className="see-all">See All →</Link>
        </div>
        <div className="categories-grid">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat._id}
              className="category-card"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat._id)}`)}
            >
              <span className="category-icon">{CATEGORY_ICONS[cat._id] || '📦'}</span>
              <span className="category-name">{cat._id}</span>
              <span className="category-count">{cat.count} items</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products?isFeatured=true" className="see-all">See All →</Link>
        </div>
        <div className="products-grid">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="value-props">
        <div className="value-prop">
          <span>🚚</span>
          <h3>Free Shipping</h3>
          <p>On all orders over $100</p>
        </div>
        <div className="value-prop">
          <span>↩️</span>
          <h3>Easy Returns</h3>
          <p>30-day hassle-free returns</p>
        </div>
        <div className="value-prop">
          <span>🔒</span>
          <h3>Secure Checkout</h3>
          <p>Your data is always protected</p>
        </div>
        <div className="value-prop">
          <span>💬</span>
          <h3>24/7 Support</h3>
          <p>We're here when you need us</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
