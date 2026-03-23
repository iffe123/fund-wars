/**
 * useStoryMilestones — checks milestone triggers each week and surfaces pending story scenes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { useRPGEvents } from '../contexts/RPGEventContext';
import {
  StoryMilestone,
  getTriggeredMilestone,
  getMilestoneDoneFlag,
} from '../services/storyMilestoneService';

interface UseStoryMilestonesReturn {
  pendingMilestone: StoryMilestone | null;
  acknowledgedMilestones: string[];
  dismissMilestone: () => void;
}

export function useStoryMilestones(): UseStoryMilestonesReturn {
  const { playerStats, npcs } = useGame();
  const { worldFlags, setWorldFlag } = useRPGEvents();

  const [pendingMilestone, setPendingMilestone] = useState<StoryMilestone | null>(null);
  const [triggeredIds, setTriggeredIds] = useState<Set<string>>(new Set());
  const [acknowledgedMilestones, setAcknowledgedMilestones] = useState<string[]>([]);

  // Track the last checked week to avoid redundant checks
  const lastCheckedWeek = useRef<number>(-1);

  // Check milestones when the week changes
  useEffect(() => {
    if (!playerStats) return;
    if (pendingMilestone) return; // already showing one

    const currentWeek = playerStats.gameTime?.week ?? playerStats.timeCursor ?? 0;
    if (currentWeek === lastCheckedWeek.current) return;
    lastCheckedWeek.current = currentWeek;

    const ms = getTriggeredMilestone(playerStats, npcs, worldFlags, triggeredIds);
    if (ms) {
      setPendingMilestone(ms);
      setTriggeredIds(prev => {
        const next = new Set(prev);
        next.add(ms.id);
        return next;
      });
    }
  }, [playerStats, npcs, worldFlags, triggeredIds, pendingMilestone]);

  // Dismiss the current milestone and set its done-flag
  const dismissMilestone = useCallback(() => {
    if (!pendingMilestone) return;

    const flag = getMilestoneDoneFlag(pendingMilestone.id);
    setWorldFlag(flag);

    setAcknowledgedMilestones(prev => [...prev, pendingMilestone.id]);
    setPendingMilestone(null);
  }, [pendingMilestone, setWorldFlag]);

  return {
    pendingMilestone,
    acknowledgedMilestones,
    dismissMilestone,
  };
}

export default useStoryMilestones;
