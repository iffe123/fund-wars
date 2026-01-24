/**
 * IC Timer Hook
 *
 * Manages countdown timer for IC meeting phases.
 * Creates time pressure that mimics real IC meetings.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UseICTimerReturn } from '../types/icTypes';

export const useICTimer = (onExpire?: () => void): UseICTimerReturn => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onExpireRef = useRef(onExpire);

  // Keep callback ref up to date
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            // Call onExpire callback
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const startTimer = useCallback((seconds: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeRemaining(seconds);
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Format time as M:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    isExpired: timeRemaining === 0 && !isRunning,
    formattedTime: formatTime(timeRemaining),
    startTimer,
    pauseTimer,
    resetTimer,
  };
};

export default useICTimer;
