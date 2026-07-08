import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/v1/admin/dashboard/overview', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setOverview(data.overview);
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '2rem',
      color: '#1f2937',
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '2px solid #e5e7eb',
      transition: 'all 0.3s',
    },
    statCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
      borderColor: '#667eea',
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      margin: '0 0 0.5rem 0',
      fontWeight: '500',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#667eea',
      margin: 0,
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      background: '#fff',
      padding: '1rem',
      borderRadius: '12px',
      borderBottom: '2px solid #e5e7eb',
    },
    tab: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '500',
      color: '#6b7280',
      borderRadius: '6px',
      transition: 'all 0.3s',
    },
    tabActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
    },
    tabContent: {
      background: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#1f2937',
    },
    metric: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '1rem',
      background: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '0.5rem',
      borderLeft: '4px solid #667eea',
    },
    metricValue: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#667eea',
    },
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <style>{`
        button:hover { opacity: 0.9; }
        @media (max-width: 768px) {
          .admin-tabs { flex-wrap: wrap; }
          .stats-row { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
        }
      `}</style>

      <h1 style={styles.title}>Admin Dashboard</h1>

      <div style={styles.statsRow}>
        <div style={styles.statCard} onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {transform: 'none', boxShadow: styles.statCard.boxShadow})}>
          <p style={styles.statLabel}>Total Users</p>
          <p style={styles.statValue}>{overview?.totalUsers || '0'}</p>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {transform: 'none', boxShadow: styles.statCard.boxShadow})}>
          <p style={styles.statLabel}>Total Events</p>
          <p style={styles.statValue}>{overview?.totalEvents || '0'}</p>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {transform: 'none', boxShadow: styles.statCard.boxShadow})}>
          <p style={styles.statLabel}>Platform Revenue</p>
          <p style={styles.statValue}>₦{overview?.totalRevenue?.toLocaleString() || '0'}</p>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {transform: 'none', boxShadow: styles.statCard.boxShadow})}>
          <p style={styles.statLabel}>Tickets Sold</p>
          <p style={styles.statValue}>{overview?.totalTicketsSold || '0'}</p>
        </div>
      </div>

      <div style={styles.tabs} className="admin-tabs">
        {['overview', 'users', 'events', 'payments', 'moderation'].map(tab => (
          <button
            key={tab}
            style={{...styles.tab, ...(activeTab === tab ? styles.tabActive : {})}}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.tabContent}>
        {activeTab === 'overview' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Platform Overview</h2>
            <div style={styles.metric}>
              <span>Payment Success Rate</span>
              <span style={styles.metricValue}>99.2%</span>
            </div>
            <div style={styles.metric}>
              <span>API Uptime</span>
              <span style={styles.metricValue}>99.98%</span>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={styles.section}>
            <h2>User Management</h2>
            <a href="/admin/users" className="btn">View All Users</a>
            <div className="user-stats">
              <div>Pending KYC: 24</div>
              <div>Suspended: 3</div>
              <div>Banned: 1</div>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="moderation-section">
            <h2>Moderation Queue</h2>
            <a href="/admin/moderation" className="btn">View Queue</a>
            <div>Flagged Content: 7</div>
            <div>Open Disputes: 2</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
