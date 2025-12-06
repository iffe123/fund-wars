import { useState, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';

export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { playSfx } = useAudio();

  const addToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    playSfx(type === 'error' ? 'ERROR' : type === 'success' ? 'SUCCESS' : 'NOTIFICATION');
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, [playSfx]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, addToast, removeToast, clearToasts };
};
