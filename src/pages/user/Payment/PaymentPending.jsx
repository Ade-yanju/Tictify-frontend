import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentPending = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    fetchPaymentStatus();
    const interval = setInterval(fetchPaymentStatus, 3000);
    return () => clearInterval(interval);
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setPayment(data.payment);
      setStatus(data.payment.status);

      if (data.payment.status === 'completed') {
        setTimeout(() => navigate(`/payment/successful/${paymentId}`), 2000);
      } else if (data.payment.status === 'failed') {
        setTimeout(() => navigate(`/payment/failed/${paymentId}`), 2000);
      }
    } catch (error) {
      console.error('Failed to fetch payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="payment-container">Loading...</div>;

  return (
    <div className="payment-container">
      <div className="pending-card">
        <div className="loader-animation">
          <div className="spinner"></div>
        </div>
        <h1>Processing Payment</h1>
        <p className="subtitle">Please wait while we process your payment...</p>

        {payment && (
          <div className="payment-info">
            <div className="info-row">
              <span>Amount:</span>
              <span>₦{payment.amount?.toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span>Reference:</span>
              <span>{paymentId}</span>
            </div>
          </div>
        )}

        <div className="status-indicator">
          <p>Status: <strong>{status.toUpperCase()}</strong></p>
          <p className="estimated-time">Estimated: 30-60 seconds</p>
        </div>

        <div className="tips">
          <h3>Tips while waiting:</h3>
          <ul>
            <li>Do not refresh this page</li>
            <li>Do not close this window</li>
            <li>Payment will be completed shortly</li>
          </ul>
        </div>

        <button className="btn-check" onClick={fetchPaymentStatus}>
          🔄 Check Status
        </button>

        <p className="support-text">
          Having issues? <a href="/contact-support">Contact support</a>
        </p>
      </div>
    </div>
  );
};

export default PaymentPending;
