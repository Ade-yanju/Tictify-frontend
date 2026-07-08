import React, { useState } from 'react';
import './SocialAuth.css';

const SocialAuth = ({ onAuthClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      color: '#DB4437',
      textColor: '#fff',
      callback: 'handleGoogleAuth'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '💻',
      color: '#181717',
      textColor: '#fff',
      callback: 'handleGithubAuth'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'f',
      color: '#1877F2',
      textColor: '#fff',
      callback: 'handleFacebookAuth'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '𝕏',
      color: '#000000',
      textColor: '#fff',
      callback: 'handleTwitterAuth'
    }
  ];

  const handleSocialAuth = async (provider) => {
    try {
      setLoading(true);
      setError(null);

      // Check if social auth is available
      if (!window.location.origin.includes('localhost') && !provider.configured) {
        setError(`${provider.name} auth not yet configured`);
        return;
      }

      // Call parent handler
      if (onAuthClick) {
        await onAuthClick(provider.id);
      }

      // In production, redirect to backend OAuth endpoint
      // Example: window.location.href = `/api/v1/auth/oauth/${provider.id}`;

    } catch (err) {
      console.error(`${provider.name} auth error:`, err);
      setError(`Failed to authenticate with ${provider.name}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="social-auth">
      <div className="divider">
        <span>or continue with</span>
      </div>

      <div className="social-buttons">
        {socialProviders.map(provider => (
          <button
            key={provider.id}
            onClick={() => handleSocialAuth(provider)}
            disabled={loading}
            className="social-btn"
            style={{
              backgroundColor: provider.color,
              color: provider.textColor,
            }}
            title={`Sign in with ${provider.name}`}
            aria-label={`Continue with ${provider.name}`}
          >
            <span className="social-icon">{provider.icon}</span>
            <span className="social-label">{provider.name}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="auth-error">
          ⚠️ {error}
        </div>
      )}

      <p className="auth-notice">
        We never post anything without your permission
      </p>
    </div>
  );
};

export default SocialAuth;
