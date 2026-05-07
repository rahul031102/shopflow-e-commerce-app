import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics','Clothing','Footwear','Accessories','Home & Kitchen','Books','Sports','Beauty','Toys','Other'];

const emptyForm = { name:'', description:'', price:'', discountPrice:'', category:'Electronics', brand:'', stock:'', isFeatured:false };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 15, ...(search && { keyword: search }) }).toString();
      const res = await API.get(`/products?${q}`);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openCreate = () => { setEditProduct(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice || '', category: p.category, brand: p.brand, stock: p.stock, isFeatured: p.isFeatured });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), discountPrice: form.discountPrice ? Number(form.discountPrice) : null };
      if (editProduct) {
        await API.put(`/products/${editProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        // For create, images would be handled separately via upload endpoint
        payload.images = [{ public_id: 'placeholder', url: 'https://via.placeholder.com/600x600?text=' + encodeURIComponent(form.name) }];
        await API.post('/products', payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action is irreversible.`)) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products</h1>
        <button onClick={openCreate} className="admin-btn-primary">+ Add Product</button>
      </div>

      <div className="admin-toolbar">
        <input
          type="text" placeholder="Search products..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="admin-search"
        />
        {pagination && <span className="total-count">{pagination.total} products</span>}
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table full-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Brand</th>
                <th>Price</th><th>Stock</th><th>Rating</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="product-cell">
                      <img src={p.images?.[0]?.url} alt={p.name} className="product-thumb" />
                      <span className="product-cell-name">{p.name}</span>
                    </div>
                  </td>
                  <td><span className="category-chip">{p.category}</span></td>
                  <td>{p.brand}</td>
                  <td>
                    <div>${p.price?.toFixed(2)}</div>
                    {p.discountPrice && <div className="discount-price">${p.discountPrice?.toFixed(2)}</div>}
                  </td>
                  <td><span className={p.stock <= 5 ? 'stock-critical' : p.stock <= 20 ? 'stock-low' : 'stock-ok'}>{p.stock}</span></td>
                  <td>★ {p.averageRating?.toFixed(1)} ({p.numReviews})</td>
                  <td>{p.isFeatured ? '⭐' : '—'}</td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => openEdit(p)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="page-btn">← Prev</button>
          <span>Page {page} of {pagination.pages}</span>
          <button disabled={page === pagination.pages} onClick={() => setPage(p => p+1)} className="page-btn">Next →</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Discount Price</label>
                  <input type="number" step="0.01" min="0" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} />
                    Featured Product
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
