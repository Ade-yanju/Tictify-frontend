import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '120px', margin: '0 0 20px 0' }}>404</h1>
      <h2 style={{ fontSize: '36px', margin: '0 0 16px 0' }}>Page Not Found</h2>
      <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px' }}>
        Sorry, we couldn't find the page you're looking for.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '14px 32px',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
