import React, { useState, useEffect } from 'react';

const AdminSalesAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/v1/admin/dashboard/sales-analytics?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-section">Loading...</div>;
  if (!analytics) return <div className="admin-section">No data available</div>;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Sales Analytics</h2>
        <div className="time-range-selector">
          {['day', 'week', 'month', 'year'].map(range => (
            <button
              key={range}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <p className="metric-label">Total Revenue</p>
          <p className="metric-value">₦{analytics.totalRevenue?.toLocaleString()}</p>
          <p className="metric-change">+{analytics.revenueChange?.toFixed(1)}% vs last period</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Tickets Sold</p>
          <p className="metric-value">{analytics.totalTickets?.toLocaleString()}</p>
          <p className="metric-change">+{analytics.ticketsChange?.toFixed(1)}% vs last period</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Orders</p>
          <p className="metric-value">{analytics.totalOrders?.toLocaleString()}</p>
          <p className="metric-change">Avg: ₦{(analytics.avgOrderValue || 0).toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Platform Commission</p>
          <p className="metric-value">₦{(analytics.totalRevenue * 0.02 || 0).toLocaleString()}</p>
          <p className="metric-change">@ 2% commission</p>
        </div>
      </div>

      {/* Revenue by Payment Method */}
      <div className="analytics-section">
        <h3>Revenue by Payment Method</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Transactions</th>
              <th>Revenue</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {analytics.paymentMethods?.map(method => (
              <tr key={method.name}>
                <td><strong>{method.name}</strong></td>
                <td>{method.transactions}</td>
                <td>₦{method.revenue?.toLocaleString()}</td>
                <td>
                  <span className={`success-rate ${method.successRate >= 95 ? 'high' : method.successRate >= 80 ? 'medium' : 'low'}`}>
                    {method.successRate?.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Events */}
      <div className="analytics-section">
        <h3>Top Performing Events</h3>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Organizer</th>
              <th>Tickets Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topEvents?.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.organizer}</td>
                <td>{event.ticketsSold}</td>
                <td>₦{event.revenue?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart Placeholder */}
      <div className="chart-section">
        <h3>Revenue Trend</h3>
        <div className="chart-placeholder">
          <p>📊 Revenue chart will be rendered here</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSalesAnalytics;
