import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
    toast.success('Logged out');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/products', label: 'Products', icon: '📦' },
    { to: '/admin/orders', label: 'Orders', icon: '🛒' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
    { to: '/', label: 'View Store', icon: '🏪' },
  ];

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="logo">⚡ Admin</span>
          <button onClick={() => setCollapsed(!collapsed)} className="collapse-btn">
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-user">
            <span className="admin-avatar">👤</span>
            {!collapsed && (
              <div>
                <p className="admin-name">{user?.name}</p>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
