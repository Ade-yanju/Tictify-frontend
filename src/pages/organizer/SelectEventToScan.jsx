import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SelectEventToScan = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/v1/organizer/events?filter=active', {
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

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Select Event to Scan Tickets</h1>
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>No active events</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div
              key={event._id}
              className="event-card"
              onClick={() => navigate(`/organizer/scan-ticket/${event._id}`)}
            >
              <div className="event-image">
                {event.image ? (
                  <img src={event.image} alt={event.title} />
                ) : (
                  <div className="placeholder">🎫</div>
                )}
              </div>
              <div className="event-info">
                <h3>{event.title}</h3>
                <p className="venue">{event.venue?.name || 'TBA'}</p>
                <div className="event-stats">
                  <span>{event.ticketsSold || 0} sold</span>
                  <span>{event.capacity - (event.ticketsSold || 0)} left</span>
                </div>
                <button className="btn-scan">Start Scanning →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectEventToScan;
