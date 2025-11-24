
import React from 'react';
import { useHaptic } from '../hooks/useHaptic';

interface BottomNavProps {
  activeTab: 'COMMS' | 'DESK' | 'NEWS' | 'MENU';
  onTabChange: (tab: 'COMMS' | 'DESK' | 'NEWS' | 'MENU') => void;
  unreadCommsCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, unreadCommsCount = 0 }) => {
  const { triggerImpact } = useHaptic();
  
  const navItems: { id: 'COMMS' | 'DESK' | 'NEWS' | 'MENU'; icon: string; label: string }[] = [
    { id: 'COMMS', icon: 'fa-address-book', label: 'COMMS' },
    { id: 'DESK', icon: 'fa-briefcase', label: 'DESK' },
    { id: 'NEWS', icon: 'fa-newspaper', label: 'NEWS' },
    { id: 'MENU', icon: 'fa-bars', label: 'MENU' },
  ];

  const handleTabClick = (id: 'COMMS' | 'DESK' | 'NEWS' | 'MENU') => {
      triggerImpact('LIGHT');
      onTabChange(id);
  }

  return (
    <div className="md:hidden bg-black border-t border-amber-500 flex justify-around items-center shrink-0 z-50 pb-[env(safe-area-inset-bottom)] pt-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleTabClick(item.id)}
          className={`flex flex-col items-center justify-center w-full h-[60px] space-y-1 ${
            activeTab === item.id ? 'text-amber-500 bg-slate-900/50' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <i className={`fas ${item.icon} text-lg`}></i>
            {item.id === 'COMMS' && unreadCommsCount > 0 && (
              <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full animate-pulse">
                {unreadCommsCount}
              </div>
            )}
          </div>
          <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
