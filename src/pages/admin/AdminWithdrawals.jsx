import React, { useState, useEffect } from 'react';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch(`/api/v1/admin/withdrawals?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    try {
      const response = await fetch(`/api/v1/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchWithdrawals();
        alert('Withdrawal approved');
      }
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
    }
  };

  const handleReject = async (withdrawalId, reason) => {
    const rejectReason = prompt('Reason for rejection:');
    if (!rejectReason) return;

    try {
      const response = await fetch(`/api/v1/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (response.ok) {
        fetchWithdrawals();
        alert('Withdrawal rejected');
      }
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
    }
  };

  if (loading) return <div className="admin-section">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Withdrawal Requests</h2>
        <div className="filters">
          {['pending', 'approved', 'processing', 'completed', 'rejected'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="withdrawal-stats">
        <div className="stat-item">
          <p className="stat-label">Pending Amount</p>
          <p className="stat-value">₦{withdrawals
            .filter(w => w.status === 'pending')
            .reduce((sum, w) => sum + (w.amount || 0), 0)
            .toLocaleString()}</p>
        </div>
        <div className="stat-item">
          <p className="stat-label">Total Pending Requests</p>
          <p className="stat-value">{withdrawals.filter(w => w.status === 'pending').length}</p>
        </div>
        <div className="stat-item">
          <p className="stat-label">Processing</p>
          <p className="stat-value">{withdrawals.filter(w => w.status === 'processing').length}</p>
        </div>
      </div>

      {withdrawals.length === 0 ? (
        <p className="no-data">No withdrawal requests</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Organizer</th>
              <th>Amount</th>
              <th>Bank Account</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(withdrawal => (
              <tr key={withdrawal._id}>
                <td>
                  <div>
                    <strong>{withdrawal.organizer?.companyName}</strong>
                    <p className="sub-text">{withdrawal.organizer?.email}</p>
                  </div>
                </td>
                <td className="amount-cell">₦{withdrawal.amount?.toLocaleString()}</td>
                <td>
                  <div className="bank-info">
                    <p>{withdrawal.bankAccount?.accountName}</p>
                    <p className="sub-text">{withdrawal.bankAccount?.accountNumber}</p>
                    <p className="sub-text">{withdrawal.bankAccount?.bankName}</p>
                  </div>
                </td>
                <td>{new Date(withdrawal.requestedDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${(withdrawal.status || 'pending').toLowerCase()}`}>
                    {withdrawal.status || 'Pending'}
                  </span>
                </td>
                <td className="action-buttons">
                  {withdrawal.status === 'pending' && (
                    <>
                      <button
                        className="btn-small btn-success"
                        onClick={() => handleApprove(withdrawal._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleReject(withdrawal._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {withdrawal.status === 'approved' && (
                    <span className="badge-info">Awaiting processing</span>
                  )}
                  {withdrawal.status === 'completed' && (
                    <span className="badge-success">Transferred</span>
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

export default AdminWithdrawals;
