import React from 'react';
import { useHaptic } from '../hooks/useHaptic';

interface BottomNavProps {
  activeTab: 'COMMS' | 'DESK' | 'NEWS' | 'MENU';
  onTabChange: (tab: 'COMMS' | 'DESK' | 'NEWS' | 'MENU') => void;
  unreadCommsCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, unreadCommsCount = 0 }) => {
  const { triggerImpact } = useHaptic();

  const navItems: { id: 'COMMS' | 'DESK' | 'NEWS' | 'MENU'; icon: string; label: string; activeColor: string }[] = [
    { id: 'COMMS', icon: 'fa-comments', label: 'COMMS', activeColor: 'text-blue-400' },
    { id: 'DESK', icon: 'fa-briefcase', label: 'DESK', activeColor: 'text-emerald-400' },
    { id: 'NEWS', icon: 'fa-newspaper', label: 'NEWS', activeColor: 'text-amber-400' },
    { id: 'MENU', icon: 'fa-terminal', label: 'SYSTEM', activeColor: 'text-cyan-300' },
  ];

  const handleTabClick = (id: 'COMMS' | 'DESK' | 'NEWS' | 'MENU') => {
    triggerImpact('LIGHT');
    onTabChange(id);
  };

  return (
    <div className="lg:hidden min-h-[72px] bg-[#05070a]/95 border-t border-slate-700/70 flex justify-around items-stretch shrink-0 z-50 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-12px_30px_rgba(0,0,0,0.35)]">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Open ${item.label}`}
            className={`
              terminal-focus flex flex-col items-center justify-center w-full min-h-[68px] py-2 relative
              transition-all duration-200 ease-out
            `}
          >
            {/* Active indicator bar */}
            <div className={`
              absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full
              transition-all duration-200
              ${isActive ? `w-8 ${item.activeColor.replace('text-', 'bg-')}` : 'w-0 bg-transparent'}
            `} />

            {/* Icon container */}
            <div className={`
              relative w-10 h-10 rounded-lg flex items-center justify-center mb-0.5
              transition-all duration-200
              ${isActive
                ? `bg-gradient-to-b from-slate-700/80 to-slate-950/90 shadow-lg border border-slate-500/60`
                : 'bg-transparent'
              }
            `}>
              <i className={`
                fas ${item.icon} text-lg transition-all duration-200
                ${isActive ? item.activeColor : 'text-slate-500'}
              `}></i>

              {/* Notification badge for COMMS */}
              {item.id === 'COMMS' && unreadCommsCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30">
                  {unreadCommsCount > 9 ? '9+' : unreadCommsCount}
                </div>
              )}

              {/* Glow effect for active tab */}
              {isActive && (
                <div className={`
                  absolute inset-0 rounded-lg blur-md opacity-20
                  ${item.activeColor.replace('text-', 'bg-')}
                `} />
              )}
            </div>

            {/* Label */}
            <span className={`
              text-[9px] font-bold tracking-widest uppercase transition-all duration-200
              ${isActive ? item.activeColor : 'text-slate-400'}
            `}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
