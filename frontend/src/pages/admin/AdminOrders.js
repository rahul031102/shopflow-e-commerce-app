import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending','processing','shipped','delivered','cancelled','refunded'];
const STATUS_COLORS = {
  pending:'#F59E0B', processing:'#3B82F6', shipped:'#8B5CF6',
  delivered:'#10B981', cancelled:'#EF4444', refunded:'#6B7280',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20, ...(statusFilter && { status: statusFilter }) }).toString();
      const res = await API.get(`/orders?${q}`);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdatingId(null); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Orders</h1>
        {pagination && <span className="total-count">{pagination.total} total orders</span>}
      </div>

      <div className="admin-toolbar">
        <div className="status-filter-tabs">
          <button className={`filter-tab ${!statusFilter ? 'active' : ''}`} onClick={() => { setStatusFilter(''); setPage(1); }}>All</button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'active' : ''}`}
              style={statusFilter === s ? { backgroundColor: STATUS_COLORS[s], color: '#fff' } : {}}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><span>📦</span><p>No orders found</p></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table full-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="order-id-cell">#{order._id?.slice(-8).toUpperCase()}</td>
                  <td>
                    <div className="customer-cell">
                      <p>{order.user?.name}</p>
                      <small>{order.user?.email}</small>
                    </div>
                  </td>
                  <td>{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</td>
                  <td><strong>${order.totalPrice?.toFixed(2)}</strong></td>
                  <td>
                    <span className={`payment-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                      {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>
                    <span className="status-pill" style={{ background: STATUS_COLORS[order.orderStatus] + '20', color: STATUS_COLORS[order.orderStatus] }}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={order.orderStatus}
                      onChange={e => handleStatusUpdate(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className="status-select"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
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
    </div>
  );
};

export default AdminOrders;
