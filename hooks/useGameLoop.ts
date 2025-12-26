/**
 * useGameLoop Hook
 *
 * Manages the automatic flow of the game, handling:
 * - Auto-advancing scenes without choices
 * - Timed consequence displays
 * - Scene transition animations
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useStoryEngine } from '../contexts/StoryEngineContext';

interface GameLoopConfig {
  /** Time to wait before auto-advancing (ms) */
  autoAdvanceDelay?: number;
  /** Time between consequence animations (ms) */
  consequenceDelay?: number;
  /** Whether auto-advance is enabled */
  autoAdvanceEnabled?: boolean;
}

const DEFAULT_CONFIG: GameLoopConfig = {
  autoAdvanceDelay: 2000,
  consequenceDelay: 800,
  autoAdvanceEnabled: true,
};

interface GameLoopState {
  /** Is the game loop actively running */
  isRunning: boolean;
  /** Is waiting for auto-advance timer */
  isWaitingToAdvance: boolean;
  /** Seconds remaining before auto-advance */
  autoAdvanceCountdown: number;
}

export function useGameLoop(config: GameLoopConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const {
    currentScene,
    canAutoAdvance,
    advanceScene,
    state,
    phase,
  } = useStoryEngine();

  const [loopState, setLoopState] = useState<GameLoopState>({
    isRunning: false,
    isWaitingToAdvance: false,
    autoAdvanceCountdown: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Skip auto-advance and proceed immediately
  const skipAutoAdvance = useCallback(() => {
    clearTimers();
    if (canAutoAdvance && !state.isTransitioning) {
      advanceScene();
    }
    setLoopState(s => ({ ...s, isWaitingToAdvance: false, autoAdvanceCountdown: 0 }));
  }, [clearTimers, canAutoAdvance, state.isTransitioning, advanceScene]);

  // Pause auto-advance
  const pauseLoop = useCallback(() => {
    clearTimers();
    setLoopState(s => ({ ...s, isRunning: false, isWaitingToAdvance: false }));
  }, [clearTimers]);

  // Resume auto-advance
  const resumeLoop = useCallback(() => {
    setLoopState(s => ({ ...s, isRunning: true }));
  }, []);

  // Handle auto-advance for scenes without choices
  useEffect(() => {
    // Only run if game is playing and auto-advance is enabled
    if (phase !== 'PLAYING' || !mergedConfig.autoAdvanceEnabled) {
      return;
    }

    // Only auto-advance if scene has no choices and has a next scene
    // Don't auto-advance if scene requires acknowledgment
    if (!currentScene || !canAutoAdvance || currentScene.requiresAcknowledgment) {
      setLoopState(s => ({ ...s, isWaitingToAdvance: false, autoAdvanceCountdown: 0 }));
      return;
    }

    // Don't auto-advance during transitions
    if (state.isTransitioning) {
      return;
    }

    // Start countdown
    const countdownSeconds = Math.ceil(mergedConfig.autoAdvanceDelay! / 1000);
    setLoopState(s => ({
      ...s,
      isRunning: true,
      isWaitingToAdvance: true,
      autoAdvanceCountdown: countdownSeconds
    }));

    // Update countdown every second
    countdownRef.current = setInterval(() => {
      setLoopState(s => ({
        ...s,
        autoAdvanceCountdown: Math.max(0, s.autoAdvanceCountdown - 1),
      }));
    }, 1000);

    // Auto-advance after delay
    timerRef.current = setTimeout(() => {
      advanceScene();
      setLoopState(s => ({ ...s, isWaitingToAdvance: false, autoAdvanceCountdown: 0 }));
    }, mergedConfig.autoAdvanceDelay);

    return () => {
      clearTimers();
    };
  }, [
    currentScene?.id,
    canAutoAdvance,
    state.isTransitioning,
    phase,
    mergedConfig.autoAdvanceDelay,
    mergedConfig.autoAdvanceEnabled,
    advanceScene,
    clearTimers,
  ]);

  return {
    ...loopState,
    skipAutoAdvance,
    pauseLoop,
    resumeLoop,
    config: mergedConfig,
  };
}

export default useGameLoop;
