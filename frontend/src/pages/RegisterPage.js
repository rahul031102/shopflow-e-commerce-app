import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => { setForm({ ...form, [e.target.name]: e.target.value }); dispatch(clearError()); };

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (strength < 2) { toast.error('Please choose a stronger password'); return; }
    const result = await dispatch(register({ name: form.name, email: form.email, password: form.password }));
    if (register.fulfilled.match(result)) {
      toast.success('Account created! Welcome aboard!');
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ ShopFlow</Link>
          <h1>Create Account</h1>
          <p>Join thousands of happy shoppers</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" name="name" placeholder="John Doe"
              value={form.name} onChange={handleChange} required minLength={2} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input id="password" type={showPassword ? 'text' : 'password'} name="password"
                placeholder="Min 8 chars, uppercase & number"
                value={form.password} onChange={handleChange} required minLength={8} />
              <button type="button" className="toggle-pwd" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="strength-segment"
                      style={{ backgroundColor: i <= strength ? strengthColors[strength] : '#E5E7EB' }} />
                  ))}
                </div>
                <span style={{ color: strengthColors[strength], fontSize: '12px' }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword} onChange={handleChange} required />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="field-error">Passwords don't match</p>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
