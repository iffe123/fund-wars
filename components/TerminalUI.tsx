import React, { useEffect, useState } from 'react';
import { useHaptic } from '../hooks/useHaptic';

// --- BUTTONS ---
interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'warning' | 'default' | 'success';
  label: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({
  variant = 'default',
  label,
  icon,
  size = 'md',
  glow = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const { triggerImpact } = useHaptic();
  const [isPressed, setIsPressed] = useState(false);

  const sizeStyles = {
    sm: "py-1.5 px-3 text-[10px]",
    md: "py-2 px-4 text-xs",
    lg: "py-3 px-6 text-sm"
  };

  const baseStyles = `
    btn-terminal uppercase tracking-widest font-bold border rounded
    transition-all duration-150 flex items-center justify-center gap-2
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-black
  `;

  const variants = {
    default: `
      border-slate-600 text-slate-300 bg-slate-800/50
      hover:bg-slate-700 hover:text-white hover:border-slate-500
      disabled:opacity-40 disabled:hover:bg-slate-800/50 disabled:hover:text-slate-300 disabled:hover:border-slate-600
      focus-visible:ring-slate-500
    `,
    primary: `
      border-emerald-500/70 text-emerald-400 bg-emerald-950/30
      hover:bg-emerald-900/50 hover:text-emerald-300 hover:border-emerald-400
      disabled:opacity-40 disabled:hover:bg-emerald-950/30 disabled:hover:text-emerald-400
      focus-visible:ring-emerald-500
    `,
    danger: `
      border-red-500/70 text-red-400 bg-red-950/30
      hover:bg-red-900/50 hover:text-red-300 hover:border-red-400
      disabled:opacity-40 disabled:hover:bg-red-950/30 disabled:hover:text-red-400
      focus-visible:ring-red-500
    `,
    warning: `
      border-amber-500/70 text-amber-400 bg-amber-950/30
      hover:bg-amber-900/50 hover:text-amber-300 hover:border-amber-400
      disabled:opacity-40 disabled:hover:bg-amber-950/30 disabled:hover:text-amber-400
      focus-visible:ring-amber-500
    `,
    success: `
      border-emerald-500/70 text-emerald-400 bg-emerald-950/30
      hover:bg-emerald-900/50 hover:text-emerald-300 hover:border-emerald-400
      disabled:opacity-40 disabled:hover:bg-emerald-950/30 disabled:hover:text-emerald-400
      focus-visible:ring-emerald-500
    `,
  };

  const glowStyles = glow ? 'animate-pulse-glow shadow-lg' : '';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      triggerImpact('LIGHT');
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 120);
    }
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variants[variant]}
        ${glowStyles}
        ${isPressed ? 'scale-95 ring-2 ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : ''}
        ${className}
      `}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {icon && <i className={`fas ${icon} ${size === 'sm' ? 'text-[10px]' : ''}`}></i>}
      <span>{label}</span>
    </button>
  );
};

// --- ICON BUTTON ---
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  variant?: 'default' | 'primary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const { triggerImpact } = useHaptic();

  const sizeStyles = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base"
  };

  const variants = {
    default: "text-slate-400 hover:text-white hover:bg-slate-700",
    primary: "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/50",
    danger: "text-red-400 hover:text-red-300 hover:bg-red-900/50",
    warning: "text-amber-400 hover:text-amber-300 hover:bg-amber-900/50"
  };

  return (
    <button
      className={`
        ${sizeStyles[size]}
        ${variants[variant]}
        rounded-lg flex items-center justify-center
        transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
        ${className}
      `}
      onClick={(e) => {
        triggerImpact('LIGHT');
        props.onClick?.(e);
      }}
      {...props}
    >
      <i className={`fas ${icon}`}></i>
    </button>
  );
};

// --- PANELS ---
interface TerminalPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title: string;
  className?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass';
  headerIcon?: string;
  style?: React.CSSProperties;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  children,
  title,
  className = '',
  action,
  variant = 'default',
  headerIcon,
  style,
  ...restProps
}) => {
  const variantStyles = {
    default: "border border-slate-700/80 bg-black/90",
    elevated: "card-elevated",
    glass: "card-glass"
  };

  return (
    <div
      className={`${variantStyles[variant]} rounded-lg flex flex-col overflow-hidden ${className}`}
      style={style}
      {...restProps}
    >
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/70 px-4 py-2 flex justify-between items-center border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-2">
          {headerIcon && <i className={`fas ${headerIcon} text-amber-500/80 text-xs`}></i>}
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
            {title}
          </span>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {children}
      </div>
    </div>
  );
};

// --- COLLAPSIBLE PANEL ---
interface CollapsiblePanelProps {
  children: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  className?: string;
  headerIcon?: string;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  children,
  title,
  defaultOpen = true,
  className = '',
  headerIcon
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-slate-700/80 bg-black/90 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-slate-800/90 to-slate-800/70 px-4 py-2 flex justify-between items-center border-b border-slate-700/60 hover:from-slate-700/90 transition-all"
      >
        <div className="flex items-center gap-2">
          {headerIcon && <i className={`fas ${headerIcon} text-amber-500/80 text-xs`}></i>}
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
            {title}
          </span>
        </div>
        <i className={`fas fa-chevron-down text-slate-500 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <div className={`transition-all duration-200 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

// --- ASCII PROGRESS ---
interface AsciiProgressProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const AsciiProgress: React.FC<AsciiProgressProps> = ({
  value,
  max,
  color = 'bg-emerald-500',
  label,
  showValue = true,
  size = 'md',
  animated = false
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: { bar: "h-1.5", text: "text-[10px]" },
    md: { bar: "h-2.5", text: "text-xs" },
    lg: { bar: "h-3.5", text: "text-sm" }
  };

  const colorVariants: Record<string, string> = {
    'bg-green-500': 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    'bg-emerald-500': 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    'bg-red-500': 'bg-gradient-to-r from-red-600 to-red-400',
    'bg-amber-500': 'bg-gradient-to-r from-amber-600 to-amber-400',
    'bg-blue-500': 'bg-gradient-to-r from-blue-600 to-blue-400',
  };

  const gradientColor = colorVariants[color] || color;

  return (
    <div className={`font-mono ${sizeStyles[size].text}`}>
      {label && (
        <div className="flex justify-between mb-1.5 text-slate-400">
          <span className="uppercase tracking-wide">{label}</span>
          {showValue && <span className="tabular-nums font-bold">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="relative">
        <div className={`w-full ${sizeStyles[size].bar} bg-slate-800 rounded-full overflow-hidden border border-slate-700/50`}>
          <div
            className={`h-full ${gradientColor} rounded-full transition-all duration-500 ease-out ${animated ? 'shimmer-bg' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Glow effect for high values */}
        {percentage > 80 && (
          <div
            className={`absolute inset-0 ${sizeStyles[size].bar} rounded-full blur-sm opacity-30`}
            style={{
              background: color.includes('red') ? 'rgba(239, 68, 68, 0.5)' :
                         color.includes('amber') ? 'rgba(245, 158, 11, 0.5)' :
                         'rgba(16, 185, 129, 0.5)',
              width: `${percentage}%`
            }}
          />
        )}
      </div>
    </div>
  );
};

// --- STAT CARD ---
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'amber' | 'blue' | 'default';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'default',
  className = ''
}) => {
  const colorStyles = {
    default: "text-slate-300",
    green: "text-emerald-400",
    red: "text-red-400",
    amber: "text-amber-400",
    blue: "text-blue-400"
  };

  const trendIcons = {
    up: "fa-arrow-up text-emerald-400",
    down: "fa-arrow-down text-red-400",
    neutral: "fa-minus text-slate-500"
  };

  return (
    <div className={`bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</span>
        {trend && <i className={`fas ${trendIcons[trend]} text-[10px]`}></i>}
      </div>
      <div className={`flex items-center gap-2 ${colorStyles[color]}`}>
        {icon && <i className={`fas ${icon} text-sm opacity-70`}></i>}
        <span className="text-lg font-bold tabular-nums">{value}</span>
      </div>
    </div>
  );
};

// --- BADGE ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false
}) => {
  const variants = {
    default: "bg-slate-700 text-slate-300 border-slate-600",
    success: "bg-emerald-900/50 text-emerald-400 border-emerald-700/50",
    warning: "bg-amber-900/50 text-amber-400 border-amber-700/50",
    danger: "bg-red-900/50 text-red-400 border-red-700/50",
    info: "bg-blue-900/50 text-blue-400 border-blue-700/50"
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[9px]",
    md: "px-2 py-1 text-[10px]"
  };

  return (
    <span className={`
      ${variants[variant]}
      ${sizes[size]}
      inline-flex items-center gap-1 rounded border uppercase tracking-wider font-bold
      ${pulse ? 'animate-pulse' : ''}
    `}>
      {children}
    </span>
  );
};

// --- DIVIDER ---
export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`divider-gradient my-4 ${className}`} />
);

// --- TOAST SYSTEM ---
interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}

export const TerminalToast: React.FC<{ toasts: Toast[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            min-w-[320px] max-w-[400px] rounded-lg border p-4 shadow-2xl font-mono text-xs uppercase tracking-wide
            flex items-start gap-3 pointer-events-auto animate-slide-in backdrop-blur-sm
            ${toast.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-400' : ''}
            ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400' : ''}
            ${toast.type === 'info' ? 'bg-amber-950/90 border-amber-500/50 text-amber-400' : ''}
          `}
        >
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0
            ${toast.type === 'error' ? 'bg-red-500/20' : ''}
            ${toast.type === 'success' ? 'bg-emerald-500/20' : ''}
            ${toast.type === 'info' ? 'bg-amber-500/20' : ''}
          `}>
            <i className={`fas ${
              toast.type === 'error' ? 'fa-triangle-exclamation' :
              toast.type === 'success' ? 'fa-check' :
              'fa-info-circle'
            }`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold mb-1 text-[11px]">
              {toast.type === 'error' ? 'SYSTEM_ALERT' :
               toast.type === 'success' ? 'OPERATION_SUCCESS' :
               'INFO_LOG'}
            </div>
            <div className="text-[11px] opacity-90 normal-case tracking-normal leading-relaxed break-words">
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="opacity-60 hover:opacity-100 transition-opacity p-1 -mr-1 -mt-1"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

// --- LOADING SPINNER ---
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="w-full h-full border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin"></div>
    </div>
  );
};

// --- SKELETON LOADER ---
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800 rounded animate-pulse ${className}`}></div>
);

// --- TOOLTIP ---
interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [show, setShow] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={`absolute ${positions[position]} z-50 animate-fade-in`}>
          <div className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 whitespace-nowrap shadow-lg">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};
