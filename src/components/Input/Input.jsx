import React from 'react';
import './Input.css';

export const Input = React.forwardRef(({
  type = 'text',
  placeholder = '',
  value = '',
  onChange = () => {},
  onBlur = () => {},
  disabled = false,
  error = false,
  errorMessage = '',
  label = '',
  required = false,
  icon: Icon = null,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`input-group input-${size}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${Icon ? 'with-icon' : ''}`}>
        {Icon && <Icon className="input-icon" size={20} />}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && errorMessage && (
        <span className="input-error-message">{errorMessage}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
