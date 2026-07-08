import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/v1/organizer/events', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return events.filter(e => new Date(e.startDate) > now);
      case 'active':
        return events.filter(e => new Date(e.startDate) <= now && new Date(e.endDate || e.startDate) >= now);
      case 'past':
        return events.filter(e => new Date(e.endDate || e.startDate) < now);
      default:
        return events;
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/v1/organizer/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        setEvents(events.filter(e => e._id !== eventId));
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const filteredEvents = getFilteredEvents();

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Events</h1>
        <button className="btn-create" onClick={() => navigate('/organizer/create-event')}>
          + Create New Event
        </button>
      </div>

      <div className="filters-section">
        {['all', 'upcoming', 'active', 'past'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <p>No events found</p>
          <button className="btn-link" onClick={() => navigate('/organizer/create-event')}>
            Create your first event
          </button>
        </div>
      ) : (
        <div className="events-section">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Sold</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => (
                <tr key={event._id}>
                  <td><strong>{event.title}</strong></td>
                  <td>{new Date(event.startDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${
                      new Date(event.startDate) > new Date() ? 'upcoming' :
                      new Date(event.endDate || event.startDate) >= new Date() ? 'active' : 'past'
                    }`}>
                      {new Date(event.startDate) > new Date() ? 'Upcoming' :
                       new Date(event.endDate || event.startDate) >= new Date() ? 'Active' : 'Past'}
                    </span>
                  </td>
                  <td>{event.capacity}</td>
                  <td>{event.ticketsSold || 0}</td>
                  <td>₦{(event.revenue || 0).toLocaleString()}</td>
                  <td className="actions">
                    <button
                      className="action-btn edit"
                      onClick={() => navigate(`/organizer/events/${event._id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn analytics"
                      onClick={() => navigate(`/organizer/ticket-sales/${event._id}`)}
                    >
                      Analytics
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
