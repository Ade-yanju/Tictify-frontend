import React, { useState, useEffect } from 'react';

const AdminOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrganizers();
  }, [filter]);

  const fetchOrganizers = async () => {
    try {
      const response = await fetch(`/api/v1/admin/organizers?filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setOrganizers(data.organizers || []);
    } catch (error) {
      console.error('Failed to fetch organizers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (organizerId) => {
    if (!window.confirm('Suspend this organizer?')) return;
    try {
      const response = await fetch(`/api/v1/admin/users/${organizerId}/suspend`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchOrganizers();
        alert('Organizer suspended');
      }
    } catch (error) {
      console.error('Failed to suspend organizer:', error);
    }
  };

  const handleUnSuspend = async (organizerId) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${organizerId}/unsuspend`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchOrganizers();
        alert('Organizer unsuspended');
      }
    } catch (error) {
      console.error('Failed to unsuspend organizer:', error);
    }
  };

  const handleApproveKYC = async (organizerId) => {
    try {
      const response = await fetch(`/api/v1/admin/kyc/${organizerId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchOrganizers();
        alert('KYC approved');
      }
    } catch (error) {
      console.error('Failed to approve KYC:', error);
    }
  };

  const handleRejectKYC = async (organizerId) => {
    try {
      const response = await fetch(`/api/v1/admin/kyc/${organizerId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchOrganizers();
        alert('KYC rejected');
      }
    } catch (error) {
      console.error('Failed to reject KYC:', error);
    }
  };

  if (loading) return <div className="admin-section">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Organizer Management</h2>
        <div className="filters">
          {['all', 'verified', 'pending-kyc', 'suspended', 'banned'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {organizers.length === 0 ? (
        <p className="no-data">No organizers found</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Email</th>
              <th>Events Created</th>
              <th>Total Revenue</th>
              <th>KYC Status</th>
              <th>Account Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizers.map(org => (
              <tr key={org._id}>
                <td><strong>{org.companyName || org.name}</strong></td>
                <td>{org.email}</td>
                <td>{org.eventsCreated || 0}</td>
                <td>₦{(org.totalRevenue || 0).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${(org.kycStatus || 'pending').toLowerCase()}`}>
                    {org.kycStatus || 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${(org.accountStatus || 'active').toLowerCase()}`}>
                    {org.accountStatus || 'Active'}
                  </span>
                </td>
                <td className="action-buttons">
                  {org.kycStatus === 'PENDING' && (
                    <>
                      <button
                        className="btn-small btn-success"
                        onClick={() => handleApproveKYC(org._id)}
                      >
                        Approve KYC
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleRejectKYC(org._id)}
                      >
                        Reject KYC
                      </button>
                    </>
                  )}
                  {org.accountStatus === 'ACTIVE' ? (
                    <button
                      className="btn-small btn-warning"
                      onClick={() => handleSuspend(org._id)}
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      className="btn-small btn-info"
                      onClick={() => handleUnSuspend(org._id)}
                    >
                      Unsuspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrganizers;
