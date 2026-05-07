import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); dispatch(clearError()); };

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
      dispatch(fetchCart());
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ ShopFlow</Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email" type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              required autoComplete="email"
            />
          </div>
          <div className="form-group">
            <div className="form-label-row" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{fontSize:'0.85rem',color:'var(--primary)'}}>Forgot password?</Link>
            </div>
            <div className="password-wrapper">
              <input
                id="password" type={showPassword ? 'text' : 'password'} name="password"
                placeholder="Your password"
                value={form.password} onChange={handleChange}
                required autoComplete="current-password"
              />
              <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-demo">
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin@ecommerce.com / Admin1234</p>
          <p>User: john@example.com / User1234</p>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
