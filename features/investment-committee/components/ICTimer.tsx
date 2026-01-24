/**
 * IC Timer Component
 *
 * Displays countdown timer with visual urgency indicators.
 */

import React from 'react';

interface ICTimerProps {
  timeRemaining: number;
  formattedTime: string;
  isActive: boolean;
  label?: string;
}

export const ICTimer: React.FC<ICTimerProps> = ({
  timeRemaining,
  formattedTime,
  isActive,
  label = 'TIME REMAINING',
}) => {
  // Determine urgency level
  const isLow = timeRemaining <= 30;
  const isCritical = timeRemaining <= 10;

  const getColorClass = () => {
    if (isCritical) return 'text-red-400 border-red-500';
    if (isLow) return 'text-amber-400 border-amber-500';
    return 'text-emerald-400 border-emerald-500';
  };

  const getBackgroundClass = () => {
    if (isCritical) return 'bg-red-950/30';
    if (isLow) return 'bg-amber-950/30';
    return 'bg-emerald-950/30';
  };

  return (
    <div
      className={`
        inline-flex items-center gap-3 px-4 py-2 rounded-lg border
        ${getColorClass()} ${getBackgroundClass()}
        ${isCritical && isActive ? 'animate-pulse' : ''}
        transition-all duration-300
      `}
    >
      <i className={`fas fa-clock ${isActive ? 'animate-spin-slow' : ''}`} />
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest opacity-70">{label}</span>
        <span className="text-xl font-bold font-mono tabular-nums">{formattedTime}</span>
      </div>
    </div>
  );
};

export default ICTimer;
