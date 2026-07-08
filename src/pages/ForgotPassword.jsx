import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import Button from '../components/Button/Button';
import { validateEmail } from '../utils/validation';
import { apiClient } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [stage, setStage] = useState('email'); // email, verify, reset, success
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setMessage('We sent a reset code to your email. Check your inbox!');
      setStage('verify');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to send reset code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!resetCode.trim()) {
      setErrors({ resetCode: 'Reset code is required' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.request('/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code: resetCode }),
      });

      setStage('reset');
    } catch (error) {
      setErrors({ resetCode: error.message || 'Invalid reset code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!newPassword) {
      setErrors({ newPassword: 'New password is required' });
      return;
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code: resetCode, password: newPassword }),
      });

      setStage('success');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to reset password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Branding Section */}
        <div className="forgot-password-branding">
          <div className="branding-content">
            <div className="branding-logo">🎟️</div>
            <h1 className="branding-title">Tictify</h1>
            <p className="branding-subtitle">Reset your password</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="forgot-password-form-container">
          <div className="forgot-password-form">
            {stage === 'email' && (
              <>
                <div className="form-header">
                  <h2>Forgot Password?</h2>
                  <p>Enter your email and we'll send you a code to reset it</p>
                </div>

                <form onSubmit={handleEmailSubmit}>
                  {errors.submit && <div className="error-banner">{errors.submit}</div>}

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={20} className="input-icon" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={errors.email ? 'error' : ''}
                      />
                    </div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                </form>
              </>
            )}

            {stage === 'verify' && (
              <>
                <div className="form-header">
                  <h2>Check Your Email</h2>
                  <p>We sent a 6-digit code to {email}</p>
                </div>

                <form onSubmit={handleVerifyCode}>
                  {errors.submit && <div className="error-banner">{errors.submit}</div>}

                  <div className="form-group">
                    <label htmlFor="resetCode">Reset Code</label>
                    <input
                      id="resetCode"
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.toUpperCase())}
                      placeholder="000000"
                      maxLength="6"
                      className={`code-input ${errors.resetCode ? 'error' : ''}`}
                    />
                    {errors.resetCode && <span className="error-message">{errors.resetCode}</span>}
                  </div>

                  <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </form>

                <div className="resend-link">
                  <p>
                    Didn't receive the code?{' '}
                    <button type="button" onClick={() => handleEmailSubmit({ preventDefault: () => {} })}>
                      Resend
                    </button>
                  </p>
                </div>
              </>
            )}

            {stage === 'reset' && (
              <>
                <div className="form-header">
                  <h2>Create New Password</h2>
                  <p>Enter a strong password to secure your account</p>
                </div>

                <form onSubmit={handleResetPassword}>
                  {errors.submit && <div className="error-banner">{errors.submit}</div>}

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className={errors.newPassword ? 'error' : ''}
                    />
                    {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </>
            )}

            {stage === 'success' && (
              <div className="success-state">
                <div className="success-icon">
                  <Check size={48} />
                </div>
                <h2>Password Reset Successful!</h2>
                <p>Your password has been changed. You can now log in with your new password.</p>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/auth')}
                >
                  Back to Login
                </Button>
              </div>
            )}

            {/* Back to Login Link */}
            {stage !== 'success' && (
              <div className="back-link">
                <button type="button" onClick={() => navigate('/auth')}>
                  <ArrowLeft size={18} />
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
