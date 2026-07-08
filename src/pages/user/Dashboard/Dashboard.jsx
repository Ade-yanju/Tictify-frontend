import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    attended: 0,
    spent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTickets = () => {
    const now = new Date();
    if (filter === 'upcoming') {
      return tickets.filter(t => new Date(t.eventDate) > now);
    } else if (filter === 'attended') {
      return tickets.filter(t => new Date(t.eventDate) <= now);
    }
    return tickets;
  };

  const filteredTickets = getFilteredTickets();

  if (loading) {
    return <div className="dashboard-container"><div className="loader">Loading your tickets...</div></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>My Tickets</h1>
        <button className="btn-discover" onClick={() => window.location.href = '/home'}>
          + Discover Events
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <p className="stat-label">Total Tickets</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Upcoming</p>
            <p className="stat-value">{stats.upcoming}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <p className="stat-label">Attended</p>
            <p className="stat-value">{stats.attended}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value">₦{stats.spent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tickets
        </button>
        <button
          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`filter-btn ${filter === 'attended' ? 'active' : ''}`}
          onClick={() => setFilter('attended')}
        >
          Attended
        </button>
      </div>

      {/* Tickets List */}
      <div className="tickets-section">
        {filteredTickets.length === 0 ? (
          <div className="no-tickets">
            <p>No tickets found</p>
            <a href="/home" className="btn-link">Browse events</a>
          </div>
        ) : (
          <div className="tickets-list">
            {filteredTickets.map(ticket => (
              <div key={ticket._id} className="ticket-item">
                <div className="ticket-image">
                  {ticket.eventImage ? (
                    <img src={ticket.eventImage} alt={ticket.eventTitle} />
                  ) : (
                    <div className="placeholder">🎫</div>
                  )}
                </div>
                <div className="ticket-info">
                  <h3>{ticket.eventTitle}</h3>
                  <p className="venue">{ticket.venue || 'TBA'}</p>
                  <div className="ticket-meta">
                    <span>📅 {new Date(ticket.eventDate).toLocaleDateString()}</span>
                    <span>🕐 {new Date(ticket.eventDate).toLocaleTimeString()}</span>
                    <span>🎫 {ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}</span>
                  </div>
                  <p className="ticket-price">₦{ticket.price?.toLocaleString()}</p>
                </div>
                <div className="ticket-actions">
                  <span className={`status ${new Date(ticket.eventDate) > new Date() ? 'upcoming' : 'attended'}`}>
                    {new Date(ticket.eventDate) > new Date() ? 'Upcoming' : 'Attended'}
                  </span>
                  <button className="btn-qr">View QR</button>
                  <button className="btn-download">Download</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
