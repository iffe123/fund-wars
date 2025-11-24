
import React, { useEffect, useState } from 'react';
import { useHaptic } from '../hooks/useHaptic';

// --- BUTTONS ---
interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'warning' | 'default';
  label: string;
  icon?: string;
}

export const TerminalButton: React.FC<TerminalButtonProps> = ({ 
  variant = 'default', 
  label, 
  icon, 
  className = '', 
  disabled,
  onClick,
  ...props 
}) => {
  const { triggerImpact } = useHaptic();
  
  const baseStyles = "uppercase tracking-widest text-xs font-bold py-2 px-4 border transition-all duration-75 flex items-center justify-center space-x-2 active:translate-y-0.5";
  
  const variants = {
    default: "border-slate-600 text-slate-400 hover:bg-slate-400 hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400",
    primary: "border-green-600 text-green-500 hover:bg-green-600 hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-green-500",
    danger: "border-red-600 text-red-500 hover:bg-red-600 hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-red-500",
    warning: "border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-amber-500",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
          triggerImpact('LIGHT');
      }
      if (onClick) onClick(e);
  };

  return (
    <button 
        className={`${baseStyles} ${variants[variant]} ${className}`} 
        disabled={disabled} 
        onClick={handleClick}
        {...props}
    >
      {icon && <i className={`fas ${icon}`}></i>}
      <span>{label}</span>
    </button>
  );
};

// --- PANELS ---
export const TerminalPanel: React.FC<{ children: React.ReactNode; title: string; className?: string; action?: React.ReactNode }> = ({ 
  children, 
  title, 
  className = '',
  action
}) => (
  <div className={`border border-slate-700 bg-black flex flex-col overflow-hidden ${className}`}>
    <div className="bg-slate-800 px-3 py-1 flex justify-between items-center border-b border-slate-700 shrink-0">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
        {title}
      </span>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1 overflow-auto custom-scrollbar relative">
      {children}
    </div>
  </div>
);

// --- ASCII PROGRESS ---
export const AsciiProgress: React.FC<{ value: number; max: number; color?: string; label?: string }> = ({ 
  value, 
  max, 
  color = 'bg-green-500', 
  label 
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const blocks = Math.floor(percentage / 5); // 20 blocks total
  const emptyBlocks = 20 - blocks;
  
  return (
    <div className="font-mono text-xs">
      {label && <div className="flex justify-between mb-1 text-slate-500"><span>{label}</span><span>{Math.round(percentage)}%</span></div>}
      <div className="flex">
        <span className="text-slate-600 mr-1">[</span>
        <div className="flex tracking-tighter">
            {Array.from({ length: blocks }).map((_, i) => (
                <span key={i} className={`block w-1.5 h-3 ${color} mr-px`}></span>
            ))}
            {Array.from({ length: emptyBlocks }).map((_, i) => (
                <span key={i} className="block w-1.5 h-3 bg-slate-800 mr-px"></span>
            ))}
        </div>
        <span className="text-slate-600 ml-1">]</span>
      </div>
    </div>
  );
};

// --- TOAST SYSTEM ---
interface Toast {
    id: number;
    message: string;
    type: 'error' | 'success' | 'info';
}

export const TerminalToast: React.FC<{ toasts: Toast[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-12 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className={`
                        min-w-[300px] border p-3 shadow-lg font-mono text-xs uppercase tracking-wide flex items-start gap-3 pointer-events-auto
                        ${toast.type === 'error' ? 'bg-black border-red-500 text-red-500' : ''}
                        ${toast.type === 'success' ? 'bg-black border-green-500 text-green-500' : ''}
                        ${toast.type === 'info' ? 'bg-black border-amber-500 text-amber-500' : ''}
                        animate-slide-in
                    `}
                >
                    <i className={`fas mt-0.5 ${toast.type === 'error' ? 'fa-triangle-exclamation' : toast.type === 'success' ? 'fa-check' : 'fa-info-circle'}`}></i>
                    <div className="flex-1">
                        <div className="font-bold mb-1">{toast.type === 'error' ? 'SYSTEM_ALERT' : toast.type === 'success' ? 'OPERATION_SUCCESS' : 'INFO_LOG'}</div>
                        <div>{toast.message}</div>
                    </div>
                    <button onClick={() => removeToast(toast.id)} className="hover:text-white"><i className="fas fa-times"></i></button>
                </div>
            ))}
        </div>
    )
}
