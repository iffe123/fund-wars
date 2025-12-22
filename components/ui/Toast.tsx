import React, { useEffect, useState } from 'react';
import { Z_INDEX } from '../../constants';

export interface ToastConfig {
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number; // ms, default 3000
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastConfig {
  id: string;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const duration = toast.duration || 3000;

  useEffect(() => {
    // Auto-dismiss after duration unless it's an error
    if (toast.type !== 'error') {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.type, duration, onDismiss]);

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-900/95 border-emerald-600 text-emerald-100';
      case 'info':
        return 'bg-blue-900/95 border-blue-600 text-blue-100';
      case 'warning':
        return 'bg-amber-900/95 border-amber-600 text-amber-100';
      case 'error':
        return 'bg-red-900/95 border-red-600 text-red-100';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <i className="fas fa-check-circle text-emerald-400"></i>;
      case 'info':
        return <i className="fas fa-info-circle text-blue-400"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-amber-400"></i>;
      case 'error':
        return <i className="fas fa-times-circle text-red-400"></i>;
    }
  };

  return (
    <div
      onClick={() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
      }}
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2 shadow-2xl cursor-pointer
        backdrop-blur-sm transition-all duration-200 max-w-md w-full
        ${getTypeStyles()}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      style={{ 
        animation: isExiting ? undefined : 'slideInFromRight 0.3s ease-out'
      }}
    >
      <div className="text-xl flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm mb-0.5">
          {toast.title}
        </div>
        {toast.description && (
          <div className="text-xs opacity-90">
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.action!.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-xs font-bold underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 200);
        }}
        className="text-white/60 hover:text-white/90 transition-colors flex-shrink-0"
      >
        <i className="fas fa-times text-sm"></i>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onDismiss,
  position = 'top-right'
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  // Limit to 3 visible toasts at once
  const visibleToasts = toasts.slice(0, 3);

  return (
    <div 
      className={`fixed ${positionClasses[position]} flex flex-col gap-2 pointer-events-none`}
      style={{ zIndex: Z_INDEX.TOAST }}
    >
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

// Add animation keyframes to global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

export default Toast;
