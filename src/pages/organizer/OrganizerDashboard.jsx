import React, { useState, useEffect } from 'react';

const OrganizerDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/v1/organizer/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setStats(data.stats);
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: 0,
      color: '#1f2937',
    },
    btnCreate: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    statsGrid: {
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
    statCardTitle: {
      fontSize: '0.95rem',
      color: '#6b7280',
      margin: '0 0 0.5rem 0',
      fontWeight: '600',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#667eea',
      margin: '0.5rem 0',
    },
    statLabel: {
      fontSize: '0.85rem',
      color: '#9ca3af',
    },
    eventsSection: {
      background: '#fff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: '#1f2937',
    },
    eventsTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      background: '#f9fafb',
      borderBottom: '2px solid #e5e7eb',
    },
    tableHeaderCell: {
      padding: '1rem',
      textAlign: 'left',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#374151',
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'background 0.2s',
    },
    tableRowHover: {
      background: '#f9fafb',
    },
    tableCell: {
      padding: '1rem',
      fontSize: '0.9rem',
      color: '#6b7280',
    },
  };

  if (loading) return <div style={styles.container}>Loading...</div>;

  return (
    <div style={styles.container}>
      <style>{`
        button:hover { opacity: 0.9; }
        @media (max-width: 768px) {
          .organizer-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .stats-grid { grid-template-columns: 1fr; }
          .events-table { font-size: 0.85rem; }
        }
      `}</style>

      <div style={styles.header} className="organizer-header">
        <h1 style={styles.title}>Organizer Dashboard</h1>
        <button style={styles.btnCreate} onClick={() => window.location.href = '/organizer/create-event'}>
          + Create Event
        </button>
      </div>

      <div style={styles.statsGrid} className="stats-grid">
        <div style={styles.statCard} onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {transform: 'none', boxShadow: styles.statCard.boxShadow})}>
          <h3 style={styles.statCardTitle}>Total Events</h3>
          <p style={styles.statValue}>{stats.totalEvents}</p>
          <span style={styles.statLabel}>{stats.activeEvents} active</span>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {transform: 'none', boxShadow: styles.statCard.boxShadow})}>
          <h3 style={styles.statCardTitle}>Revenue</h3>
          <p style={styles.statValue}>₦{stats.totalRevenue?.toLocaleString()}</p>
          <span style={styles.statLabel}>From {stats.totalTicketsSold} tickets</span>
        </div>
        <div style={styles.statCard} onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.statCardHover)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {transform: 'none', boxShadow: styles.statCard.boxShadow})}>
          <h3 style={styles.statCardTitle}>Tickets Sold</h3>
          <p style={styles.statValue}>{stats.totalTicketsSold}</p>
          <span style={styles.statLabel}>Total across events</span>
        </div>
      </div>

      <div style={styles.eventsSection}>
        <h2 style={styles.sectionTitle}>Your Events</h2>
        {events.length === 0 ? (
          <p style={{color: '#6b7280'}}>No events yet. Create your first event!</p>
        ) : (
          <table style={styles.eventsTable} className="events-table">
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Event Name</th>
                <th style={styles.tableHeaderCell}>Date</th>
                <th style={styles.tableHeaderCell}>Tickets Sold</th>
                <th style={styles.tableHeaderCell}>Revenue</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id} style={styles.tableRow} onMouseEnter={(e) => e.currentTarget.style.background = styles.tableRowHover.background} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={styles.tableCell}><strong>{event.title}</strong></td>
                  <td style={styles.tableCell}>{new Date(event.startDate).toLocaleDateString()}</td>
                  <td style={styles.tableCell}>{event.ticketsSold || 0}</td>
                  <td style={styles.tableCell}>₦{(event.revenue || 0).toLocaleString()}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: event.status === 'LIVE' ? '#d1fae5' : event.status === 'UPCOMING' ? '#fef3c7' : '#f3f4f6',
                      color: event.status === 'LIVE' ? '#065f46' : event.status === 'UPCOMING' ? '#92400e' : '#6b7280',
                    }}>
                      {event.status}
                    </span>
                  </td>
                  <td style={{...styles.tableCell, display: 'flex', gap: '0.5rem'}}>
                    <a href={`/organizer/my-events/${event._id}`} style={{color: '#667eea', textDecoration: 'none', fontWeight: '500', fontSize: '0.85rem'}}>Edit</a>
                    <a href={`/organizer/ticket-sales/${event._id}`} style={{color: '#667eea', textDecoration: 'none', fontWeight: '500', fontSize: '0.85rem'}}>Analytics</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
