import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await API.put(`/auth/reset-password/${token}`, { newPassword: form.newPassword });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ ShopFlow</Link>
          <h1>Reset Password</h1>
          <p>Choose a strong new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required minLength={8}
              />
              <button type="button" className="toggle-pwd" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="field-error">Passwords don't match</p>
            )}
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
