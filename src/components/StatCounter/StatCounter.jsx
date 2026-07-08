import React, { useEffect, useState } from 'react';
import './StatCounter.css';

export default function StatCounter({ value, label, format = 'default', delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === undefined) return;

    const timer = setTimeout(() => {
      setIsAnimating(true);
      const duration = 2000;
      const increment = value / (duration / 16);
      let current = 0;

      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const formatValue = (val) => {
    if (format === 'compact') {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    }
    return val.toLocaleString();
  };

  return (
    <div className={`stat-counter ${isAnimating ? 'animated' : ''}`}>
      <div className="stat-counter__value">
        {formatValue(displayValue)}
      </div>
      <div className="stat-counter__label">{label}</div>
    </div>
  );
}
