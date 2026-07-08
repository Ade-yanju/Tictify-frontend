import React, { useState, useEffect } from 'react';

const DashboardEnhanced = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    attended: 0,
    spent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/v1/tickets/my-tickets', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      const allTickets = data.tickets || [];

      setTickets(allTickets);
      setStats({
        total: allTickets.length,
        upcoming: allTickets.filter(t => new Date(t.eventDate) > new Date()).length,
        attended: allTickets.filter(t => new Date(t.eventDate) <= new Date()).length,
        spent: allTickets.reduce((sum, t) => sum + (t.price || 0), 0),
      });

      // Generate spending chart data
      const months = {};
      allTickets.forEach(t => {
        const month = new Date(t.purchaseDate).toLocaleString('default', { month: 'short' });
        months[month] = (months[month] || 0) + (t.price || 0);
      });
      setChartData(Object.entries(months));
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><div className="loader">Loading...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Tickets Dashboard</h1>
        <button className="btn-discover" onClick={() => window.location.href = '/home'}>
          + Discover Events
        </button>
      </div>

      {/* Enhanced Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <p className="stat-label">Total Tickets</p>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-subtext">{stats.upcoming} upcoming</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Upcoming Events</p>
            <p className="stat-value">{stats.upcoming}</p>
            <p className="stat-subtext">Next event coming</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <p className="stat-label">Events Attended</p>
            <p className="stat-value">{stats.attended}</p>
            <p className="stat-subtext">Memories made</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value">₦{stats.spent.toLocaleString()}</p>
            <p className="stat-subtext">On tickets</p>
          </div>
        </div>
      </div>

      {/* Spending Chart */}
      {chartData.length > 0 && (
        <div className="chart-section">
          <h2>Spending Trend</h2>
          <div className="chart">
            {chartData.map(([month, amount]) => (
              <div key={month} className="chart-bar">
                <div className="bar" style={{ height: `${(amount / Math.max(...chartData.map(d => d[1]))) * 100}%` }}>
                  <span className="bar-label">₦{amount}</span>
                </div>
                <span className="month">{month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span>Average Spend per Event</span>
          <span className="value">₦{stats.total > 0 ? (stats.spent / stats.total).toLocaleString() : 0}</span>
        </div>
        <div className="quick-stat">
          <span>Most Expensive Ticket</span>
          <span className="value">₦{tickets.length > 0 ? Math.max(...tickets.map(t => t.price || 0)).toLocaleString() : 0}</span>
        </div>
      </div>

      {/* Tickets List */}
      <div className="tickets-section">
        <h2>Your Tickets</h2>
        {tickets.length === 0 ? (
          <div className="no-tickets">
            <p>No tickets yet. Start by discovering events!</p>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.slice(0, 5).map(ticket => (
              <div key={ticket._id} className="ticket-item">
                <div className="ticket-image">
                  {ticket.eventImage ? <img src={ticket.eventImage} alt={ticket.eventTitle} /> : <div className="placeholder">🎫</div>}
                </div>
                <div className="ticket-info">
                  <h3>{ticket.eventTitle}</h3>
                  <p className="venue">{ticket.venue}</p>
                  <div className="ticket-meta">
                    <span>📅 {new Date(ticket.eventDate).toLocaleDateString()}</span>
                    <span>🎫 {ticket.quantity} tickets</span>
                  </div>
                </div>
                <div className="ticket-actions">
                  <span className={`status ${new Date(ticket.eventDate) > new Date() ? 'upcoming' : 'attended'}`}>
                    {new Date(ticket.eventDate) > new Date() ? 'Upcoming' : 'Attended'}
                  </span>
                  <button className="btn-qr">View</button>
                </div>
              </div>
            ))}
            {tickets.length > 5 && (
              <a href="/dashboard" className="view-all">View all {tickets.length} tickets →</a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardEnhanced;
