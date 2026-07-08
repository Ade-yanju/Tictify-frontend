import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userRole', data.role);

      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setGeneralError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      padding: '2.5rem',
      maxWidth: '450px',
      width: '100%',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0',
      color: '#1f2937',
    },
    subtitle: {
      fontSize: '0.95rem',
      color: '#6b7280',
      margin: '0 0 1.5rem 0',
    },
    errorBox: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fca5a5',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.875rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#374151',
    },
    input: {
      padding: '0.75rem 1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'all 0.3s',
      fontFamily: 'inherit',
    },
    inputError: {
      borderColor: '#ef4444',
      background: '#fef2f2',
    },
    inputFocus: {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    },
    errorMsg: {
      fontSize: '0.8rem',
      color: '#dc2626',
      marginTop: '0.25rem',
    },
    forgotLink: {
      fontSize: '0.85rem',
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.3s',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      margin: '1rem 0',
      color: '#9ca3af',
      fontSize: '0.875rem',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#e5e7eb',
    },
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
    },
    socialBtn: {
      padding: '0.75rem',
      border: '2px solid #e5e7eb',
      background: '#fff',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.3s',
    },
    submitBtn: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      marginTop: '0.5rem',
    },
    footer: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: '#6b7280',
      fontSize: '0.9rem',
    },
    footerLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        input:focus { outline: none; }
        button:hover { opacity: 0.9; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        a:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .auth-card { padding: 2rem 1.5rem; }
          .social-buttons { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Login to your Tictify account</p>

        {generalError && (
          <div style={styles.errorBox}>{generalError}</div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
            />
            {errors.email && <span style={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
            />
            {errors.password && <span style={styles.errorMsg}>{errors.password}</span>}
          </div>

          <a href="/forgot-password" style={styles.forgotLink}>Forgot password?</a>

          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span>or continue with</span>
          <div style={styles.dividerLine}></div>
        </div>

        <div style={styles.socialButtons} className="social-buttons">
          <button style={styles.socialBtn} title="Sign in with Google">🔍 Google</button>
          <button style={styles.socialBtn} title="Sign in with GitHub">💻 GitHub</button>
          <button style={styles.socialBtn} title="Sign in with Facebook">f Facebook</button>
          <button style={styles.socialBtn} title="Sign in with Twitter">𝕏 Twitter</button>
        </div>

        <div style={styles.footer}>
          <p>Don't have an account? <a href="/register-as" style={styles.footerLink}>Sign up here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
