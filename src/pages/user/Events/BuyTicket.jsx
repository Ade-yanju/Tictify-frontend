import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BuyTicket = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [event, setEvent] = useState(null);

  React.useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/v1/events/${eventId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setEvent(data.event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    }
  };

  const handleBuyTickets = async () => {
    setProcessing(true);
    const total = event.ticketPrice * quantity;

    try {
      const res = await fetch('/api/v1/payments/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketQuantity: quantity,
          amount: total,
          paymentMethod: 'card',
        }),
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/checkout/${data.payment._id}`);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="buy-ticket-container">
      <h1>{event.title}</h1>
      <div className="buy-form">
        <label>Number of Tickets:</label>
        <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <div className="price-calc">
          <p>Price: ₦{(event.ticketPrice * quantity).toLocaleString()}</p>
        </div>

        <button onClick={handleBuyTickets} disabled={processing}>
          {processing ? 'Processing...' : 'Buy Tickets'}
        </button>
      </div>
    </div>
  );
};

export default BuyTicket;
