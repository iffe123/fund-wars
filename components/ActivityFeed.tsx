import React, { useEffect, useRef } from 'react';

export interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'deal' | 'relationship' | 'portfolio' | 'personal' | 'market' | 'time';
  icon: string;
  title: string;
  detail?: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'warning';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxVisible?: number;
  className?: string;
}

const sentimentColors = {
  positive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  neutral: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  negative: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

// Simple time formatting utility
const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const ActivityItemComponent: React.FC<{ 
  activity: ActivityItem; 
  isNew: boolean;
}> = ({ activity, isNew }) => {
  const formatTime = (date: Date) => {
    try {
      return formatTimeAgo(date);
    } catch {
      return 'just now';
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-3 border-b border-slate-700/30 transition-all duration-300
        ${isNew ? 'animate-slideIn bg-blue-900/20' : 'hover:bg-slate-800/30'}
      `}
    >
      <span
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm
          flex-shrink-0 border
          ${sentimentColors[activity.sentiment]}
        `}
      >
        <i className={activity.icon}></i>
      </span>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-white leading-tight">
            {activity.title}
          </p>
          <span className="text-[10px] text-slate-500 whitespace-nowrap">
            {formatTime(activity.timestamp)}
          </span>
        </div>
        {activity.detail && (
          <p className="text-xs text-slate-400 leading-relaxed">
            {activity.detail}
          </p>
        )}
      </div>
    </div>
  );
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  maxVisible = 20,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(activities.length);

  useEffect(() => {
    // Auto-scroll to top when new activity is added
    if (activities.length > prevCountRef.current && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    prevCountRef.current = activities.length;
  }, [activities.length]);

  const recentActivities = activities.slice(0, maxVisible);

  if (recentActivities.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-slate-500 p-8 ${className}`}>
        <i className="fas fa-clock text-4xl mb-4 opacity-30"></i>
        <div className="text-center">
          <div className="font-bold mb-2">NO ACTIVITY YET</div>
          <div className="text-xs">Your actions and events will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ scrollBehavior: 'smooth' }}
    >
      {recentActivities.map((activity, index) => (
        <ActivityItemComponent
          key={activity.id}
          activity={activity}
          isNew={index === 0 && activities.length > prevCountRef.current}
        />
      ))}
    </div>
  );
};

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;
if (!document.getElementById('activity-feed-styles')) {
  style.id = 'activity-feed-styles';
  document.head.appendChild(style);
}

export default ActivityFeed;
