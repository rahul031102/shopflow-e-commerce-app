import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">⚡ ShopFlow</Link>

        <form onSubmit={handleSearch} className="navbar-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/cart" className="nav-link cart-link">
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <button className="user-btn">
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="user-avatar" />
                ) : (
                  <span className="user-initial">{user.name[0]}</span>
                )}
                {user.name}
              </button>
              <div className="dropdown">
                <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                <Link to="/orders" className="dropdown-item">📦 Orders</Link>
                <Link to="/wishlist" className="dropdown-item">❤️ Wishlist</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="dropdown-item admin-link">⚙️ Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="dropdown-item logout">🚪 Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </nav>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
