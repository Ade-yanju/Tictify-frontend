import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setPayment(data.payment);
      setBillingInfo({
        firstName: data.payment.firstName || '',
        lastName: data.payment.lastName || '',
        email: data.payment.email || localStorage.getItem('userEmail'),
        phone: data.payment.phone || '',
      });
    } catch (error) {
      console.error('Failed to fetch payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch(`/api/v1/payments/${paymentId}/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          billingInfo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/payment/successful/${paymentId}`);
      } else {
        alert('Payment processing failed: ' + data.message);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="checkout-container">Loading...</div>;
  if (!payment) return <div className="checkout-container">Payment not found</div>;

  return (
    <div className="checkout-container">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

      <div className="checkout-main">
        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <span>{payment.eventTitle}</span>
            <span>{payment.ticketQuantity} ticket{payment.ticketQuantity > 1 ? 's' : ''}</span>
          </div>
          <div className="summary-item">
            <span>Price per ticket</span>
            <span>₦{payment.pricePerTicket?.toLocaleString()}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-item total">
            <span>Total Amount</span>
            <span>₦{payment.amount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePaymentSubmit} className="checkout-form">
          <h2>Billing Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={billingInfo.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={billingInfo.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={billingInfo.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={billingInfo.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <h3>Payment Method</h3>
          <div className="payment-methods">
            <label className="method-option">
              <input
                type="radio"
                name="method"
                value="card"
                checked={selectedMethod === 'card'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <span className="method-label">💳 Debit/Credit Card</span>
            </label>
            <label className="method-option">
              <input
                type="radio"
                name="method"
                value="transfer"
                checked={selectedMethod === 'transfer'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <span className="method-label">🏦 Bank Transfer</span>
            </label>
            <label className="method-option">
              <input
                type="radio"
                name="method"
                value="ussd"
                checked={selectedMethod === 'ussd'}
                onChange={(e) => setSelectedMethod(e.target.value)}
              />
              <span className="method-label">📱 USSD</span>
            </label>
          </div>

          <div className="checkout-actions">
            <button
              type="submit"
              className={`btn-pay ${processing ? 'loading' : ''}`}
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay ₦${payment.amount?.toLocaleString()}`}
            </button>
            <p className="secure-note">🔒 Secure payment powered by Paystack</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
