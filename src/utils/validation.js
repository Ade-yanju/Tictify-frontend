/**
 * Validation Utilities
 * Password strength, email validation, form validators
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  numbers: /[0-9]/,
  specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export const validatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'No password', color: '#E05C5C' };

  let score = 0;
  const checks = [];

  if (password.length >= PASSWORD_REQUIREMENTS.minLength) {
    score += 20;
    checks.push('length');
  }
  if (PASSWORD_REQUIREMENTS.uppercase.test(password)) {
    score += 20;
    checks.push('uppercase');
  }
  if (PASSWORD_REQUIREMENTS.lowercase.test(password)) {
    score += 20;
    checks.push('lowercase');
  }
  if (PASSWORD_REQUIREMENTS.numbers.test(password)) {
    score += 20;
    checks.push('numbers');
  }
  if (PASSWORD_REQUIREMENTS.specialChar.test(password)) {
    score += 20;
    checks.push('special');
  }

  let label = 'Weak';
  let color = '#E05C5C';

  if (score >= 80) {
    label = 'Strong';
    color = '#6BF0A0';
  } else if (score >= 60) {
    label = 'Good';
    color = '#E8C96A';
  } else if (score >= 40) {
    label = 'Fair';
    color = '#E8874A';
  }

  return { score, label, color, checks };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getPasswordErrorMessage = (password) => {
  if (!password) return 'Password is required';
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`;
  }
  const { checks } = validatePasswordStrength(password);
  const missing = [];
  if (!checks.includes('uppercase')) missing.push('uppercase letter');
  if (!checks.includes('lowercase')) missing.push('lowercase letter');
  if (!checks.includes('numbers')) missing.push('number');
  if (!checks.includes('special')) missing.push('special character');

  if (missing.length > 0) {
    return `Add at least one ${missing.join(', ')}`;
  }
  return '';
};

export const validateRegistrationForm = (formData) => {
  const errors = {};

  if (!formData.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const pwError = getPasswordErrorMessage(formData.password);
    if (pwError) errors.password = pwError;
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  }

  return errors;
};
