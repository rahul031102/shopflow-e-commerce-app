import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscountAmount: '', usageLimit: '',
  expiresAt: '', isActive: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/coupons');
      setCoupons(res.data.coupons);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => { setEditCoupon(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => {
    setEditCoupon(c);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxDiscountAmount: c.maxDiscountAmount || '',
      usageLimit: c.usageLimit || '', isActive: c.isActive,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };
      if (editCoupon) {
        await API.put(`/admin/coupons/${editCoupon._id}`, payload);
        toast.success('Coupon updated!');
      } else {
        await API.post('/admin/coupons', payload);
        toast.success('Coupon created!');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await API.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Delete failed'); }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Coupons</h1>
        <button onClick={openCreate} className="admin-btn-primary">+ New Coupon</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : coupons.length === 0 ? (
        <div className="empty-state"><span>🎟️</span><p>No coupons yet. Create one!</p></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table full-table">
            <thead>
              <tr>
                <th>Code</th><th>Type</th><th>Value</th><th>Min Order</th>
                <th>Used / Limit</th><th>Expires</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c._id}>
                  <td><strong className="coupon-code-cell">{c.code}</strong></td>
                  <td>{c.discountType}</td>
                  <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                  <td>${c.minOrderAmount || 0}</td>
                  <td>{c.usageCount} / {c.usageLimit || '∞'}</td>
                  <td>
                    <span style={{ color: isExpired(c.expiresAt) ? 'var(--danger)' : 'var(--success)' }}>
                      {new Date(c.expiresAt).toLocaleDateString()}
                      {isExpired(c.expiresAt) && ' (Expired)'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${c.isActive ? 'active' : 'inactive'}`}>
                      {c.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => openEdit(c)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(c._id, c.code)} className="btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  required placeholder="e.g. SAVE20" disabled={!!editCoupon} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input type="number" min="0" step="0.01" value={form.discountValue}
                    onChange={e => setForm({...form, discountValue: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Order Amount ($)</label>
                  <input type="number" min="0" value={form.minOrderAmount}
                    onChange={e => setForm({...form, minOrderAmount: e.target.value})} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Max Discount Cap ($)</label>
                  <input type="number" min="0" value={form.maxDiscountAmount}
                    onChange={e => setForm({...form, maxDiscountAmount: e.target.value})} placeholder="Unlimited" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input type="number" min="1" value={form.usageLimit}
                    onChange={e => setForm({...form, usageLimit: e.target.value})} placeholder="Unlimited" />
                </div>
                <div className="form-group">
                  <label>Expires At *</label>
                  <input type="date" value={form.expiresAt}
                    onChange={e => setForm({...form, expiresAt: e.target.value})} required
                    min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})} />
                Active
              </label>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : editCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
