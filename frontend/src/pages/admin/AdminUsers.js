import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20, ...(search && { search }), ...(roleFilter && { role: roleFilter }) }).toString();
      const res = await API.get(`/admin/users?${q}`);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await API.put(`/admin/users/${userId}`, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Permanently delete user "${name}"?`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        {pagination && <span className="total-count">{pagination.total} users</span>}
      </div>

      <div className="admin-toolbar">
        <input
          type="text" placeholder="Search by name or email..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="admin-search"
        />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="admin-filter-select">
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state"><span>👥</span><p>No users found</p></div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table full-table">
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>Status</th>
                <th>Joined</th><th>Last Login</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className={!user.isActive ? 'inactive-row' : ''}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{user.name?.[0]?.toUpperCase()}</div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user._id, e.target.value)}
                      className={`role-select ${user.role}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                        className={user.isActive ? 'btn-deactivate' : 'btn-activate'}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(user._id, user.name)} className="btn-delete">
                        Delete
                      </button>
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
    </div>
  );
};

export default AdminUsers;
