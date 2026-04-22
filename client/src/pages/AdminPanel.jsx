import { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setApproving(userId);
      const response = await api.patch(`/admin/approve/${userId}`);
      setUsers(
        users.map((user) => (user._id === userId ? { ...user, isApproved: true } : user))
      );
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setApproving(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="admin-container">
          <div className="loading">Loading admin dashboard...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h1 className="admin-title">Admin Panel</h1>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Section */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalDocuments}</div>
              <div className="stat-label">Total Documents</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalIssuers}</div>
              <div className="stat-label">Total Issuers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalRecipients}</div>
              <div className="stat-label">Total Recipients</div>
            </div>
          </div>
        )}

        {/* Users Table Section */}
        <div className="users-section">
          <h2>Registered Users</h2>
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>{user.role}</span>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${user.isApproved ? 'approved' : 'pending'}`}
                        >
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        {user.role === 'issuer' && !user.isApproved ? (
                          <button
                            className="approve-btn"
                            onClick={() => handleApproveUser(user._id)}
                            disabled={approving === user._id}
                          >
                            {approving === user._id ? 'Approving...' : 'Approve'}
                          </button>
                        ) : (
                          <span className="no-action">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPanel;
