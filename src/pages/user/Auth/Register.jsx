import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'party-freak'; // 'organizer' or 'party-freak'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: role === 'organizer' ? '' : undefined,
  });

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
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (role === 'organizer' && !formData.company) {
      newErrors.company = 'Company name is required';
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
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: role === 'organizer' ? 'organizer' : 'user',
      };

      if (role === 'organizer') {
        payload.companyName = formData.company;
      }

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.message || 'Registration failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userRole', data.role);

      if (data.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setGeneralError('An error occurred. Please try again.');
      console.error('Registration error:', error);
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
      padding: '2rem 1rem',
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      padding: '2rem',
      maxWidth: '550px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
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
      gap: '1rem',
    },
    nameGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
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
    errorMsg: {
      fontSize: '0.8rem',
      color: '#dc2626',
      marginTop: '0.25rem',
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
        input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        button:hover { opacity: 0.9; }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        a:hover { text-decoration: underline; }
        @media (max-width: 480px) {
          .register-card { padding: 1.5rem; }
          .name-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={styles.card} className="register-card">
        <h1 style={styles.title}>
          {role === 'organizer' ? 'Become an Organizer' : 'Join Tictify'}
        </h1>
        <p style={styles.subtitle}>
          {role === 'organizer' ? 'Create and manage amazing events' : 'Discover and buy tickets to amazing events'}
        </p>

        {generalError && (
          <div style={styles.errorBox}>{generalError}</div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.nameGrid} className="name-grid">
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                style={{
                  ...styles.input,
                  ...(errors.firstName ? styles.inputError : {}),
                }}
              />
              {errors.firstName && <span style={styles.errorMsg}>{errors.firstName}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                style={{
                  ...styles.input,
                  ...(errors.lastName ? styles.inputError : {}),
                }}
              />
              {errors.lastName && <span style={styles.errorMsg}>{errors.lastName}</span>}
            </div>
          </div>

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
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              style={{
                ...styles.input,
                ...(errors.phone ? styles.inputError : {}),
              }}
            />
            {errors.phone && <span style={styles.errorMsg}>{errors.phone}</span>}
          </div>

          {role === 'organizer' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Company/Organization Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your Company"
                style={{
                  ...styles.input,
                  ...(errors.company ? styles.inputError : {}),
                }}
              />
              {errors.company && <span style={styles.errorMsg}>{errors.company}</span>}
            </div>
          )}

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

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {}),
              }}
            />
            {errors.confirmPassword && <span style={styles.errorMsg}>{errors.confirmPassword}</span>}
          </div>

          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>Already have an account? <a href="/login" style={styles.footerLink}>Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
