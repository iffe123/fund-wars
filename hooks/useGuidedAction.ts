/**
 * useGuidedAction Hook
 *
 * Manages UI element highlighting during tutorial/onboarding events.
 * Provides visual guidance to help new players find the right buttons/tabs.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GuidedAction } from '../types/rpgEvents';

interface GuidedActionState {
  activeAction: GuidedAction | null;
  isVisible: boolean;
}

interface UseGuidedActionReturn {
  activeAction: GuidedAction | null;
  isVisible: boolean;
  setGuidedAction: (action: GuidedAction | null) => void;
  clearGuidedAction: () => void;
  isElementGuided: (selector: string) => boolean;
}

/**
 * Hook to manage guided actions for tutorial UI highlighting
 */
export const useGuidedAction = (): UseGuidedActionReturn => {
  const [state, setState] = useState<GuidedActionState>({
    activeAction: null,
    isVisible: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set a new guided action
  const setGuidedAction = useCallback((action: GuidedAction | null) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (action) {
      setState({
        activeAction: action,
        isVisible: true,
      });

      // Add pulse class to target element
      const element = document.querySelector(action.targetElement);
      if (element) {
        element.classList.add('guided-pulse');
        element.setAttribute('data-guided', 'true');
        element.setAttribute('data-pulse-color', action.pulseColor || 'amber');

        // Auto-clear after interaction if autoAdvance is set
        if (action.autoAdvance) {
          const handleClick = () => {
            clearGuidedAction();
            element.removeEventListener('click', handleClick);
          };
          element.addEventListener('click', handleClick);
        }
      }
    } else {
      clearGuidedAction();
    }
  }, []);

  // Clear the current guided action
  const clearGuidedAction = useCallback(() => {
    // Remove pulse class from any elements
    document.querySelectorAll('.guided-pulse').forEach((el) => {
      el.classList.remove('guided-pulse');
      el.removeAttribute('data-guided');
      el.removeAttribute('data-pulse-color');
    });

    setState({
      activeAction: null,
      isVisible: false,
    });
  }, []);

  // Check if a specific element is currently guided
  const isElementGuided = useCallback((selector: string): boolean => {
    return state.activeAction?.targetElement === selector && state.isVisible;
  }, [state.activeAction, state.isVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearGuidedAction();
    };
  }, [clearGuidedAction]);

  return {
    activeAction: state.activeAction,
    isVisible: state.isVisible,
    setGuidedAction,
    clearGuidedAction,
    isElementGuided,
  };
};

/**
 * Context for sharing guided action state across components
 */
import React, { createContext, useContext, ReactNode } from 'react';

interface GuidedActionContextType extends UseGuidedActionReturn {}

const GuidedActionContext = createContext<GuidedActionContextType | null>(null);

export const GuidedActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const guidedAction = useGuidedAction();

  return (
    <GuidedActionContext.Provider value={guidedAction}>
      {children}
    </GuidedActionContext.Provider>
  );
};

export const useGuidedActionContext = (): GuidedActionContextType => {
  const context = useContext(GuidedActionContext);
  if (!context) {
    throw new Error('useGuidedActionContext must be used within a GuidedActionProvider');
  }
  return context;
};

/**
 * CSS for guided pulse animation - to be added to global styles
 *
 * .guided-pulse {
 *   position: relative;
 *   animation: guided-pulse 2s ease-in-out infinite;
 * }
 *
 * .guided-pulse[data-pulse-color="amber"]::before {
 *   box-shadow: 0 0 20px 10px rgba(251, 191, 36, 0.4);
 * }
 *
 * .guided-pulse[data-pulse-color="cyan"]::before {
 *   box-shadow: 0 0 20px 10px rgba(34, 211, 238, 0.4);
 * }
 *
 * @keyframes guided-pulse {
 *   0%, 100% { transform: scale(1); }
 *   50% { transform: scale(1.02); }
 * }
 */
