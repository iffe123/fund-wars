import React, { useEffect, useState } from 'react';
import { Z_INDEX } from '../constants';

interface WeekTransitionProps {
  isActive: boolean;
  currentWeek: number;
  year: number;
  quarter: number;
}

const WeekTransition: React.FC<WeekTransitionProps> = ({
  isActive,
  currentWeek,
  year,
  quarter,
}) => {
  const [phase, setPhase] = useState<'entering' | 'showing' | 'exiting'>('entering');

  useEffect(() => {
    if (!isActive) return;

    // Phase 1: Enter (fade in)
    setPhase('entering');
    
    // Phase 2: Show briefly
    const showTimer = setTimeout(() => {
      setPhase('showing');
    }, 300);

    // Phase 3: Exit (fade out)
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, 1300);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
    };
  }, [isActive, currentWeek]);

  if (!isActive) return null;

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center pointer-events-none
        transition-opacity duration-300
        ${phase === 'entering' ? 'opacity-0' : 'opacity-100'}
        ${phase === 'exiting' ? 'opacity-0' : ''}
      `}
      style={{ zIndex: Z_INDEX.modalOverlay - 1 }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Week indicator */}
      <div className="relative text-center">
        {/* Animated circle background */}
        <div className={`
          absolute inset-0 -m-16 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 
          border-2 border-blue-500/50 animate-pulse
        `}></div>
        
        {/* Content */}
        <div className="relative">
          <div className="text-6xl md:text-8xl font-bold text-white mb-2 animate-slideUp">
            Week {currentWeek}
          </div>
          <div className="text-xl md:text-2xl text-slate-300 animate-fadeIn">
            Year {year} • Q{quarter}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animate-slideUp {
    animation: slideUp 0.5s ease-out;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.7s ease-out 0.3s both;
  }
`;
if (!document.getElementById('week-transition-styles')) {
  style.id = 'week-transition-styles';
  document.head.appendChild(style);
}

export default WeekTransition;
