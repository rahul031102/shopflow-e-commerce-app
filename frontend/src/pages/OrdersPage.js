import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const STATUS_COLORS = {
  pending: '#F59E0B', processing: '#3B82F6', shipped: '#8B5CF6',
  delivered: '#10B981', cancelled: '#EF4444', refunded: '#6B7280',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    API.get(`/orders/my-orders?page=${page}&limit=10`)
      .then(res => { setOrders(res.data.orders); setPagination(res.data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="orders-page">
      <h1 className="page-title">My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <span>📦</span>
          <h2>No orders yet</h2>
          <p>Once you place an order, it will appear here.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
                <div className="order-card-header">
                  <div>
                    <p className="order-id">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className="order-status-badge" style={{ backgroundColor: STATUS_COLORS[order.orderStatus] + '20', color: STATUS_COLORS[order.orderStatus] }}>
                    {order.orderStatus}
                  </span>
                </div>
                <div className="order-card-body">
                  <div className="order-items-preview">
                    {order.orderItems?.slice(0, 3).map(item => (
                      <img key={item._id} src={item.image} alt={item.name} className="order-item-thumb" />
                    ))}
                    {order.orderItems?.length > 3 && (
                      <span className="more-items">+{order.orderItems.length - 3}</span>
                    )}
                  </div>
                  <div className="order-card-meta">
                    <p>{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                    <p className="order-total">${order.totalPrice?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="order-card-footer">
                  <span className={`payment-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                    {order.isPaid ? '✓ Paid' : '⏳ Payment Pending'}
                  </span>
                  <span className="view-details">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="page-btn">← Prev</button>
              <span>Page {page} of {pagination.pages}</span>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="page-btn">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
