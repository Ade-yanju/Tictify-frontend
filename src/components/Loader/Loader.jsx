import React from 'react';
import './Loader.css';

/**
 * Loader Component
 * Loading spinner for async operations and page transitions
 */
export default function Loader({ size = 'md', text = 'Loading...' }) {
  return (
    <div className={`loader loader-${size}`}>
      <div className="spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}
