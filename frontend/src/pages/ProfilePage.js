import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from '../store/slices/authSlice';
import API from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addrForm, setAddrForm] = useState({ street: '', city: '', state: '', zipCode: '', country: 'US', isDefault: false });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/users/profile', profileForm);
      dispatch(fetchMe());
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    try {
      await API.put('/auth/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/users/addresses', addrForm);
      dispatch(fetchMe());
      setAddrForm({ street: '', city: '', state: '', zipCode: '', country: 'US', isDefault: false });
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally { setSaving(false); }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await API.delete(`/users/addresses/${addressId}`);
      dispatch(fetchMe());
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'password', label: '🔒 Password' },
    { id: 'addresses', label: '📍 Addresses' },
  ];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user?.name} className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>
          )}
        </div>
        <div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-card">
            <h2>Personal Information</h2>
            <form onSubmit={handleProfileSave} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  required minLength={2} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email} disabled className="input-disabled" />
                <small>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000" />
              </div>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="profile-card">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={pwdForm.currentPassword}
                  onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={pwdForm.newPassword}
                  onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} required minLength={8} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={pwdForm.confirmPassword}
                  onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="profile-card">
            <h2>My Addresses</h2>

            {user?.addresses?.length === 0 && (
              <p className="no-addresses">No addresses saved yet.</p>
            )}

            <div className="addresses-list">
              {user?.addresses?.map(addr => (
                <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                  {addr.isDefault && <span className="default-label">✓ Default</span>}
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p>{addr.country}</p>
                  <button className="delete-addr-btn" onClick={() => handleDeleteAddress(addr._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <h3>Add New Address</h3>
            <form onSubmit={handleAddAddress} className="profile-form">
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" value={addrForm.street}
                  onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={addrForm.city}
                    onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" value={addrForm.state}
                    onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input type="text" value={addrForm.zipCode}
                    onChange={e => setAddrForm({ ...addrForm, zipCode: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <select value={addrForm.country}
                    onChange={e => setAddrForm({ ...addrForm, country: e.target.value })}>
                    {['US','CA','GB','AU','DE','FR','IN'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={addrForm.isDefault}
                  onChange={e => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
                Set as default address
              </label>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Adding...' : 'Add Address'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
