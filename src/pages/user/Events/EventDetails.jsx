import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/v1/events/${eventId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setEvent(data.event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTickets = async () => {
    const total = event.ticketPrice * selectedQuantity;
    try {
      const response = await fetch('/api/v1/payments/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketQuantity: selectedQuantity,
          amount: total,
          paymentMethod: 'card',
        }),
      });

      const data = await response.json();
      if (data.success) {
        navigate(`/checkout/${data.payment._id}`);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  if (loading) return <div className="event-details-container"><div>Loading...</div></div>;
  if (!event) return <div className="event-details-container"><div>Event not found</div></div>;

  return (
    <div className="event-details-container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

      <div className="event-details-main">
        <div className="event-details-image">
          {event.image ? (
            <img src={event.image} alt={event.title} />
          ) : (
            <div className="placeholder">📅</div>
          )}
        </div>

        <div className="event-details-info">
          <div className="event-header">
            <h1>{event.title}</h1>
            <span className="event-badge">{event.category}</span>
          </div>

          <p className="event-organizer">By <strong>{event.organizer?.name || 'Organizer'}</strong></p>

          <div className="event-description">
            {event.description}
          </div>

          <div className="event-details-grid">
            <div className="detail-item">
              <span className="detail-label">📅 Date</span>
              <span className="detail-value">{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🕐 Time</span>
              <span className="detail-value">{new Date(event.startDate).toLocaleTimeString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">📍 Venue</span>
              <span className="detail-value">{event.venue?.name || 'TBA'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">💰 Price per Ticket</span>
              <span className="detail-value">₦{event.ticketPrice?.toLocaleString()}</span>
            </div>
          </div>

          <div className="ticket-purchase">
            <h3>Get Your Tickets</h3>
            <div className="quantity-selector">
              <label>Number of Tickets</label>
              <select value={selectedQuantity} onChange={(e) => setSelectedQuantity(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} ticket{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div className="price-summary">
              <div className="price-row">
                <span>Price per ticket</span>
                <span>₦{event.ticketPrice?.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Quantity</span>
                <span>{selectedQuantity}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>₦{(event.ticketPrice * selectedQuantity)?.toLocaleString()}</span>
              </div>
            </div>

            <button className="btn-buy" onClick={handleBuyTickets}>
              Buy {selectedQuantity} Ticket{selectedQuantity > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
