import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-brand">
        <h3>⚡ ShopFlow</h3>
        <p>Your premier destination for quality products at great prices.</p>
      </div>
      <div className="footer-links">
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Electronics">Electronics</Link>
          <Link to="/products?category=Clothing">Clothing</Link>
          <Link to="/products?isFeatured=true">Featured</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/profile">My Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="mailto:support@shopflow.com">Contact Us</a>
          <a href="#faq">FAQ</a>
          <a href="#returns">Returns</a>
          <a href="#shipping">Shipping Info</a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} ShopFlow. All rights reserved.</p>
      <p>Payments secured by <strong>Stripe</strong></p>
    </div>
  </footer>
);

export default Footer;
