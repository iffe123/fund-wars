import { useState, useCallback } from 'react';

export const useWeekTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    
    // Transition lasts ~1.5 seconds
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  }, []);

  return { isTransitioning, startTransition };
};
