import { useState, useCallback } from 'react';

interface StatChange {
  stat: string;
  before: number;
  after: number;
  label: string;
}

interface ConsequenceData {
  title: string;
  narrative?: string;
  changes: StatChange[];
}

const STAT_LABELS: Record<string, string> = {
  reputation: 'Reputation',
  stress: 'Stress',
  cash: 'Cash',
  financialEngineering: 'Financial Engineering',
  analystRating: 'Analyst Rating',
  auditRisk: 'Audit Risk',
  score: 'Score',
  ethics: 'Ethics',
  energy: 'Energy',
  health: 'Health',
  dependency: 'Dependency',
};

export function useConsequenceDisplay() {
  const [consequence, setConsequence] = useState<ConsequenceData | null>(null);

  const showConsequence = useCallback((data: ConsequenceData) => {
    setConsequence(data);
  }, []);

  const dismissConsequence = useCallback(() => {
    setConsequence(null);
  }, []);

  /**
   * Helper to create consequence from stat changes
   * Compares before and after stats and shows only changed values
   */
  const createFromStatChanges = useCallback((
    title: string,
    beforeStats: Record<string, number>,
    afterStats: Record<string, number>,
    narrative?: string
  ) => {
    const changes: StatChange[] = Object.keys(afterStats)
      .filter(key => {
        const before = beforeStats[key];
        const after = afterStats[key];
        return typeof before === 'number' && typeof after === 'number' && before !== after;
      })
      .map(key => ({
        stat: key,
        before: beforeStats[key] || 0,
        after: afterStats[key] || 0,
        label: STAT_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
      }));

    if (changes.length > 0) {
      showConsequence({ title, narrative, changes });
    }
  }, [showConsequence]);

  /**
   * Helper to create consequence from a StatChanges object
   * (matches the game's StatChanges type)
   */
  const createFromChangesObject = useCallback((
    title: string,
    changes: Record<string, number | undefined>,
    currentStats: Record<string, number>,
    narrative?: string
  ) => {
    const statChanges: StatChange[] = [];

    Object.entries(changes).forEach(([key, delta]) => {
      if (typeof delta === 'number' && delta !== 0 && key in currentStats) {
        const before = currentStats[key] || 0;
        const after = before + delta;
        statChanges.push({
          stat: key,
          before,
          after,
          label: STAT_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
        });
      }
    });

    if (statChanges.length > 0) {
      showConsequence({ title, narrative, changes: statChanges });
    }
  }, [showConsequence]);

  return {
    consequence,
    showConsequence,
    dismissConsequence,
    createFromStatChanges,
    createFromChangesObject,
  };
}

export default useConsequenceDisplay;
