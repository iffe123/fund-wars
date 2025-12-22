import { useState, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import type { ToastConfig, ToastItem } from '../components/ui/Toast';

export const useEnhancedToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { playSfx } = useAudio();

  const addToast = useCallback((config: ToastConfig) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: ToastItem = { ...config, id };
    
    setToasts(prev => [...prev, toast]);
    
    // Play appropriate sound
    const soundMap = {
      error: 'ERROR' as const,
      success: 'SUCCESS' as const,
      info: 'NOTIFICATION' as const,
      warning: 'NOTIFICATION' as const,
    };
    playSfx(soundMap[config.type]);

    return id;
  }, [playSfx]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for common toast types
  const toast = {
    success: (title: string, description?: string, action?: ToastConfig['action']) => 
      addToast({ title, description, type: 'success', action }),
    
    info: (title: string, description?: string, action?: ToastConfig['action']) => 
      addToast({ title, description, type: 'info', action }),
    
    warning: (title: string, description?: string, action?: ToastConfig['action']) => 
      addToast({ title, description, type: 'warning', duration: 5000, action }),
    
    error: (title: string, description?: string, action?: ToastConfig['action']) => 
      addToast({ title, description, type: 'error', action }),
  };

  return { toasts, addToast, removeToast, clearToasts, toast };
};
