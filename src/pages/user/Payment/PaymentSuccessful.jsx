import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentSuccessful = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      // Fetch ticket and payment details
      const response = await fetch(`/api/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
        setQrCode(data.qrCode);
        setEvent(data.event);
        setEmailSent(data.emailSent || false);
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = () => {
    if (!qrCode) {
      alert('QR code not yet generated. Please try again in a moment.');
      return;
    }

    // Create downloadable ticket with QR code
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket-${paymentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticket?.eventTitle} Ticket`,
          text: `I just got my ticket for ${ticket?.eventTitle}! Check it out!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const text = `Check out my ticket for ${ticket?.eventTitle}! ${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert('Ticket link copied to clipboard!');
    }
  };

  if (loading) return <div className="payment-container"><div className="success-card">Loading your ticket...</div></div>;

  return (
    <div className="payment-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p className="subtitle">Your tickets have been confirmed and sent to your email</p>

        {ticket && event && (
          <div className="ticket-details">
            <h2>{event.title || ticket.eventTitle}</h2>
            <div className="detail-row">
              <span>Confirmation ID:</span>
              <span className="value">{paymentId}</span>
            </div>
            <div className="detail-row">
              <span>Number of Tickets:</span>
              <span className="value">{ticket.quantity}</span>
            </div>
            <div className="detail-row">
              <span>Event Date:</span>
              <span className="value">
                {event.startDate
                  ? new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'TBA'
                }
              </span>
            </div>
            <div className="detail-row">
              <span>Event Time:</span>
              <span className="value">
                {event.startDate
                  ? new Date(event.startDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'TBA'
                }
              </span>
            </div>
            <div className="detail-row">
              <span>Venue:</span>
              <span className="value">{event.venue?.name || 'TBA'}</span>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span className="value amount">₦{(ticket.totalAmount || ticket.amount)?.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* QR Code Display */}
        <div className="qr-section">
          <h3>Your Entry QR Code</h3>
          <p className="qr-subtitle">Show this at the venue for entry</p>
          {qrCode ? (
            <div className="qr-code-container">
              <img
                src={qrCode}
                alt="Ticket QR Code"
                className="qr-code-image"
              />
              <p className="qr-instruction">
                📸 Screenshot or save this QR code to your phone
              </p>
            </div>
          ) : (
            <div className="qr-placeholder">
              <p>Generating QR code...</p>
            </div>
          )}
        </div>

        {/* Email Confirmation */}
        {emailSent && (
          <div className="email-confirmation">
            <p className="checkmark">✓</p>
            <p>A detailed confirmation email with your QR code has been sent to:</p>
            <p className="email-address"><strong>{localStorage.getItem('userEmail')}</strong></p>
            <p className="email-hint">Check your spam folder if you don't see it</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="actions">
          <button
            className="btn-download"
            onClick={handleDownloadTicket}
            disabled={!qrCode}
          >
            📥 Download Ticket
          </button>
          <button
            className="btn-share"
            onClick={handleShareTicket}
          >
            📤 Share Ticket
          </button>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h4>What's Next?</h4>
          <ol>
            <li>Save or screenshot this QR code</li>
            <li>Check your email for the ticket confirmation</li>
            <li>Arrive 15 minutes early on the event date</li>
            <li>Show your QR code at the venue entrance</li>
          </ol>
        </div>

        {/* Footer Navigation */}
        <div className="footer-actions">
          <a href="/home" className="link">← Browse More Events</a>
          <a href="/dashboard" className="link">View All My Tickets →</a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessful;
