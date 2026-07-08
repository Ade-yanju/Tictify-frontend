import React from 'react';
import { validatePasswordStrength } from '../../utils/validation';
import './PasswordStrengthIndicator.css';

export default function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const { score, label, color, checks } = validatePasswordStrength(password);

  const requirements = [
    { key: 'length', label: 'At least 8 characters', met: checks.includes('length') },
    { key: 'uppercase', label: 'Uppercase letter', met: checks.includes('uppercase') },
    { key: 'lowercase', label: 'Lowercase letter', met: checks.includes('lowercase') },
    { key: 'numbers', label: 'Number', met: checks.includes('numbers') },
    { key: 'special', label: 'Special character', met: checks.includes('special') },
  ];

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            transition: 'all 0.3s ease',
          }}
        />
      </div>
      <div className="strength-label" style={{ color }}>
        Strength: {label}
      </div>

      <div className="requirements">
        <p className="requirements-title">Password requirements:</p>
        <ul>
          {requirements.map((req) => (
            <li key={req.key} className={`requirement ${req.met ? 'met' : ''}`}>
              <span className="check-icon">{req.met ? '✓' : '○'}</span>
              {req.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
