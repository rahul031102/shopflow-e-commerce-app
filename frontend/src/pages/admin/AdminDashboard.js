import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const STATUS_COLORS = {
  pending: '#F59E0B', processing: '#3B82F6', shipped: '#8B5CF6',
  delivered: '#10B981', cancelled: '#EF4444', refunded: '#6B7280',
};

const StatCard = ({ label, value, icon, color, to }) => (
  <Link to={to || '#'} className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon" style={{ backgroundColor: color + '15' }}>{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!stats) return <div className="error-container"><p>Failed to load dashboard</p></div>;

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard label="Total Revenue" value={`$${stats.totalRevenue?.toFixed(2)}`} icon="💰" color="#10B981" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon="📦" color="#3B82F6" to="/admin/orders" />
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" color="#8B5CF6" to="/admin/users" />
        <StatCard label="Total Products" value={stats.totalProducts} icon="🛍️" color="#F59E0B" to="/admin/products" />
      </div>

      {/* Revenue Chart (simple bar) */}
      {stats.revenueByMonth?.length > 0 && (
        <div className="admin-card">
          <h2>Revenue (Last 6 Months)</h2>
          <div className="revenue-chart">
            {stats.revenueByMonth.map((m, i) => {
              const maxRev = Math.max(...stats.revenueByMonth.map(x => x.revenue));
              const pct = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
              return (
                <div key={i} className="chart-bar-wrapper">
                  <span className="chart-value">${m.revenue?.toFixed(0)}</span>
                  <div className="chart-bar" style={{ height: `${Math.max(pct, 4)}%` }} />
                  <span className="chart-label">{monthNames[m._id.month - 1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="admin-two-col">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="admin-see-all">See All</Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map(order => (
                <tr key={order._id}>
                  <td>#{order._id?.slice(-6).toUpperCase()}</td>
                  <td>{order.user?.name}</td>
                  <td>${order.totalPrice?.toFixed(2)}</td>
                  <td>
                    <span className="status-pill" style={{ background: STATUS_COLORS[order.orderStatus] + '20', color: STATUS_COLORS[order.orderStatus] }}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Top Products</h2>
            <Link to="/admin/products" className="admin-see-all">See All</Link>
          </div>
          <div className="top-products-list">
            {stats.topProducts?.map((product, i) => (
              <div key={product._id} className="top-product-item">
                <span className="rank-num">{i + 1}</span>
                <img src={product.images?.[0]?.url} alt={product.name} className="top-product-img" />
                <div className="top-product-info">
                  <p className="top-product-name">{product.name}</p>
                  <p className="top-product-meta">{product.numReviews} reviews · ★{product.averageRating?.toFixed(1)}</p>
                </div>
                <div className="top-product-stock">
                  <span className={product.stock > 10 ? 'stock-ok' : 'stock-low'}>{product.stock} left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
