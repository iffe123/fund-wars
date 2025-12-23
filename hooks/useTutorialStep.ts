import { useState, useCallback, useEffect } from 'react';

const TUTORIAL_STORAGE_KEY = 'fund_wars_tutorial_completed';

export interface TutorialState {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
}

interface UseTutorialStepReturn {
  tutorialState: TutorialState;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
  setStep: (step: number) => void;
}

const TOTAL_STEPS = 6;

export const useTutorialStep = (): UseTutorialStepReturn => {
  const [tutorialState, setTutorialState] = useState<TutorialState>(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY) === 'true';
    return {
      currentStep: 0,
      isActive: false,
      isCompleted: completed,
    };
  });

  // Sync completed state with localStorage
  useEffect(() => {
    if (tutorialState.isCompleted) {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    }
  }, [tutorialState.isCompleted]);

  const startTutorial = useCallback(() => {
    setTutorialState({
      currentStep: 0,
      isActive: true,
      isCompleted: false,
    });
  }, []);

  const nextStep = useCallback(() => {
    setTutorialState(prev => {
      const nextStepNum = prev.currentStep + 1;
      if (nextStepNum >= TOTAL_STEPS) {
        // Tutorial complete
        return {
          currentStep: 0,
          isActive: false,
          isCompleted: true,
        };
      }
      return {
        ...prev,
        currentStep: nextStepNum,
      };
    });
  }, []);

  const skipTutorial = useCallback(() => {
    setTutorialState({
      currentStep: 0,
      isActive: false,
      isCompleted: true,
    });
  }, []);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setTutorialState({
      currentStep: 0,
      isActive: false,
      isCompleted: false,
    });
  }, []);

  const setStep = useCallback((step: number) => {
    setTutorialState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)),
    }));
  }, []);

  return {
    tutorialState,
    startTutorial,
    nextStep,
    skipTutorial,
    resetTutorial,
    setStep,
  };
};

export default useTutorialStep;
