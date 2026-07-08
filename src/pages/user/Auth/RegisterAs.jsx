import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterAs = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Join Tictify</h1>
        <p className="auth-subtitle">Choose how you want to use Tictify</p>

        <div className="register-options">
          {/* Organizer Option */}
          <div className="register-option organizer-option" onClick={() => navigate('/register/organizer')}>
            <div className="option-icon">🎪</div>
            <h2>Organizer</h2>
            <p>Create and manage events, sell tickets, track sales</p>
            <ul className="option-features">
              <li>Create unlimited events</li>
              <li>Set your own prices</li>
              <li>Manage attendees</li>
              <li>Real-time analytics</li>
              <li>Direct payouts</li>
            </ul>
            <button className="btn btn-primary">Create as Organizer</button>
          </div>

          {/* Party Freak (User) Option */}
          <div className="register-option party-freak-option" onClick={() => navigate('/register/party-freak')}>
            <div className="option-icon">🎉</div>
            <h2>Party Freak</h2>
            <p>Discover events, buy tickets, follow organizers</p>
            <ul className="option-features">
              <li>Browse all events</li>
              <li>Buy tickets instantly</li>
              <li>Follow organizers</li>
              <li>Save favorites</li>
              <li>Get notifications</li>
            </ul>
            <button className="btn btn-secondary">Join as Party Freak</button>
          </div>
        </div>

        <div className="auth-footer">
          <p>Already have an account? <a href="/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterAs;
