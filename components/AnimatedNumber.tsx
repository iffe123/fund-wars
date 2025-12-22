import React, { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'number' | 'percentage' | 'multiplier';
  decimals?: number;
  duration?: number; // ms
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = 'number',
  decimals = 0,
  duration = 700,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (previousValue.current === value) return;

    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    startTimeRef.current = startTime;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * eased;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        if (Math.abs(val) >= 1000000000) {
          return `$${(val / 1000000000).toFixed(decimals || 2)}B`;
        } else if (Math.abs(val) >= 1000000) {
          return `$${(val / 1000000).toFixed(decimals || 1)}M`;
        } else if (Math.abs(val) >= 1000) {
          return `$${(val / 1000).toFixed(decimals || 0)}K`;
        }
        return `$${val.toFixed(decimals)}`;
      
      case 'percentage':
        return `${(val * 100).toFixed(decimals || 0)}%`;
      
      case 'multiplier':
        return `${val.toFixed(decimals || 1)}x`;
      
      case 'number':
      default:
        return val.toFixed(decimals);
    }
  };

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
