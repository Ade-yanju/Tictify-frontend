import React, { useState, useEffect } from 'react';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/v1/admin/events?filter=${filter}`, {
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

  const handleApprove = async (eventId) => {
    try {
      const response = await fetch(`/api/v1/admin/events/${eventId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchEvents();
        alert('Event approved');
      }
    } catch (error) {
      console.error('Failed to approve event:', error);
    }
  };

  const handleReject = async (eventId) => {
    try {
      const response = await fetch(`/api/v1/admin/events/${eventId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        fetchEvents();
        alert('Event rejected');
      }
    } catch (error) {
      console.error('Failed to reject event:', error);
    }
  };

  const handleFlagContent = async (eventId, reason) => {
    try {
      const response = await fetch('/api/v1/admin/moderation/flag-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: eventId,
          resourceType: 'EVENT',
          reason,
          severity: 'HIGH',
        }),
      });
      if (response.ok) {
        alert('Event flagged for review');
      }
    } catch (error) {
      console.error('Failed to flag event:', error);
    }
  };

  if (loading) return <div className="admin-section">Loading...</div>;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Event Moderation</h2>
        <div className="filters">
          {['all', 'pending', 'approved', 'rejected', 'flagged'].map(f => (
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

      {events.length === 0 ? (
        <p className="no-data">No events found</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Organizer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Capacity</th>
              <th>Sold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>
                  <strong>{event.title}</strong>
                  <button
                    className="view-btn"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDetails(true);
                    }}
                  >
                    View
                  </button>
                </td>
                <td>{event.organizer?.name || 'Unknown'}</td>
                <td>{new Date(event.startDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${event.status || 'pending'}`}>
                    {event.status || 'Pending'}
                  </span>
                </td>
                <td>{event.capacity}</td>
                <td>{event.ticketsSold || 0}</td>
                <td className="action-buttons">
                  {event.status === 'pending' && (
                    <>
                      <button
                        className="btn-small btn-success"
                        onClick={() => handleApprove(event._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleReject(event._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    className="btn-small btn-warning"
                    onClick={() => handleFlagContent(event._id, 'Inappropriate content')}
                  >
                    Flag
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDetails && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowDetails(false)}>×</button>
            <h3>{selectedEvent.title}</h3>
            <div className="event-details">
              <p><strong>Organizer:</strong> {selectedEvent.organizer?.name}</p>
              <p><strong>Date:</strong> {new Date(selectedEvent.startDate).toLocaleDateString()}</p>
              <p><strong>Venue:</strong> {selectedEvent.venue?.name}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Capacity:</strong> {selectedEvent.capacity}</p>
              <p><strong>Ticket Price:</strong> ₦{selectedEvent.ticketPrice?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
