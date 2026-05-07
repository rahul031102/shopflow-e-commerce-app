import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ ShopFlow</Link>
          <h1>Forgot Password?</h1>
          <p>Enter your email and we'll send a reset link.</p>
        </div>

        {sent ? (
          <div className="success-message">
            <div className="success-icon-sm">📧</div>
            <h3>Check your inbox!</h3>
            <p>We've sent a password reset link to <strong>{email}</strong>.</p>
            <p>The link expires in 15 minutes.</p>
            <Link to="/login" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remember your password? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
