import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TicketSales = () => {
  const { eventId } = useParams();
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, [eventId]);

  const fetchSales = async () => {
    try {
      const response = await fetch(`/api/v1/organizer/events/${eventId}/sales`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setSales(data.sales);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="analytics-container">Loading...</div>;
  if (!sales) return <div className="analytics-container">Sales data not found</div>;

  return (
    <div className="analytics-container">
      <h1>Ticket Sales Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Tickets Sold</p>
          <p className="stat-value">{sales.totalSold}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Revenue</p>
          <p className="stat-value">₦{sales.totalRevenue?.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Capacity</p>
          <p className="stat-value">{sales.capacity}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Fill Rate</p>
          <p className="stat-value">{((sales.totalSold / sales.capacity) * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Sales Timeline</h2>
        <div className="chart-placeholder">
          <p>📊 Sales chart will be rendered here</p>
        </div>
      </div>

      <div className="attendees-section">
        <h2>Recent Sales</h2>
        {sales.recentSales && sales.recentSales.length > 0 ? (
          <table className="sales-table">
            <thead>
              <tr>
                <th>Buyer Name</th>
                <th>Email</th>
                <th>Tickets</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.recentSales.map((sale, idx) => (
                <tr key={idx}>
                  <td>{sale.buyerName}</td>
                  <td>{sale.email}</td>
                  <td>{sale.quantity}</td>
                  <td>₦{sale.amount?.toLocaleString()}</td>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No sales yet</p>
        )}
      </div>
    </div>
  );
};

export default TicketSales;
