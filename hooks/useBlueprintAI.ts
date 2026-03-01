/**
 * useBlueprintAI Hook
 *
 * Integrates all seven AI Blueprint systems into the game loop.
 * Manages: Inner Monologue, Living Newspaper, Unreliable Advisor,
 * Information Economy, Enhanced Deal Autopsy, Reputation Web, Chaos Engine.
 */

import { useCallback, useEffect, useRef } from 'react';
import type { GameState, GameAction } from '../reducers/types';
import type { InnerVoiceId, VoiceInterjection, CrisisEvent, GossipEvent } from '../types/aiBlueprint';
import {
  updateVoiceActivation,
  getSceneInterjections,
  createInitialInnerMonologueState,
} from '../services/innerMonologueService';
import {
  buildCompactGameState,
  generateWeeklyNewspaper,
  updateMachiavelliState,
  generateCrisisEvent,
  createGossipEvent,
  detectNarratorMode,
} from '../services/blueprintAIService';

interface UseBlueprintAIProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const useBlueprintAI = ({ state, dispatch }: UseBlueprintAIProps) => {
  const lastWeekProcessed = useRef<number>(0);

  const currentWeek = state.playerStats?.gameTime?.week ?? 0;

  // ==================== WEEKLY PROCESSING ====================

  useEffect(() => {
    if (!state.playerStats || currentWeek <= lastWeekProcessed.current) return;
    lastWeekProcessed.current = currentWeek;

    // 1. Update voice activation states
    const updatedMonologue = updateVoiceActivation(
      state.blueprintAI.innerMonologue,
      state.playerStats,
      currentWeek,
    );

    // 2. Update Machiavelli state
    const updatedMachiavelli = updateMachiavelliState(
      state.blueprintAI.machiavelliState,
      currentWeek,
      state.playerStats,
    );

    // 3. Update narrator mode
    const narratorMode = detectNarratorMode(state.playerStats);

    // 4. Process gossip tick
    dispatch({ type: 'PROCESS_GOSSIP_TICK', payload: undefined as any });

    // 5. Update blueprint state
    dispatch({
      type: 'UPDATE_BLUEPRINT_AI',
      payload: {
        innerMonologue: updatedMonologue,
        machiavelliState: updatedMachiavelli,
        narrator: {
          ...state.blueprintAI.narrator,
          currentMode: narratorMode,
          modeHistory: [
            ...state.blueprintAI.narrator.modeHistory.slice(-10),
            { mode: narratorMode, tick: currentWeek },
          ],
        },
      },
    });

    // 6. Generate newspaper (every week)
    generateNewspaper();

    // 7. Check for crisis events
    checkForCrisis();

  }, [currentWeek]);

  // ==================== NEWSPAPER GENERATION ====================

  const generateNewspaper = useCallback(async () => {
    if (!state.playerStats) return;

    const gameState = buildCompactGameState(state.playerStats, state.marketVolatility);
    const newspaper = await generateWeeklyNewspaper(
      gameState,
      state.playerStats,
      state.npcs,
      state.actionLog.slice(0, 5),
      state.blueprintAI.newspaper,
    );

    dispatch({ type: 'SET_NEWSPAPER', payload: newspaper });
  }, [state.playerStats, state.npcs, state.actionLog, state.marketVolatility]);

  // ==================== CRISIS GENERATION ====================

  const checkForCrisis = useCallback(() => {
    if (!state.playerStats) return;
    if (currentWeek < state.blueprintAI.chaosEngine.nextCrisisCheck) return;

    const crisis = generateCrisisEvent(
      currentWeek,
      state.marketVolatility,
      state.playerStats,
    );

    if (crisis) {
      dispatch({ type: 'ADD_CRISIS', payload: crisis });
      dispatch({
        type: 'UPDATE_BLUEPRINT_AI',
        payload: {
          chaosEngine: {
            ...state.blueprintAI.chaosEngine,
            nextCrisisCheck: currentWeek + 3 + Math.floor(Math.random() * 5),
          },
        },
      });
    } else {
      dispatch({
        type: 'UPDATE_BLUEPRINT_AI',
        payload: {
          chaosEngine: {
            ...state.blueprintAI.chaosEngine,
            nextCrisisCheck: currentWeek + 1,
          },
        },
      });
    }
  }, [state.playerStats, currentWeek, state.marketVolatility]);

  // ==================== VOICE INTERJECTIONS ====================

  const triggerVoiceInterjection = useCallback(async (
    trigger: 'deal_opportunity' | 'high_return_deal' | 'red_flag_found' | 'rival_activity' |
      'layoff_decision' | 'ethics_dilemma' | 'win' | 'loss' | 'rival_comparison' |
      'high_stress' | 'weekend_work' | 'bonus_discussion' | 'promotion_event' |
      'regulatory_hint' | 'management_change' | 'general',
    context: string,
  ) => {
    if (!state.playerStats) return;

    const gameState = buildCompactGameState(state.playerStats, state.marketVolatility);
    const interjections = await getSceneInterjections(
      state.blueprintAI.innerMonologue,
      trigger,
      context,
      gameState,
    );

    interjections.forEach(interjection => {
      dispatch({ type: 'ADD_VOICE_INTERJECTION', payload: interjection });
    });
  }, [state.playerStats, state.blueprintAI.innerMonologue, state.marketVolatility]);

  // ==================== GOSSIP ====================

  const createGossip = useCallback((statement: string, sourceNpcId: string) => {
    const gossip = createGossipEvent(
      statement,
      sourceNpcId,
      state.npcs,
      currentWeek,
    );
    dispatch({ type: 'ADD_GOSSIP', payload: gossip });
    return gossip;
  }, [state.npcs, currentWeek]);

  // ==================== CRISIS RESPONSE ====================

  const respondToCrisis = useCallback((crisisId: string, responseId: string) => {
    dispatch({ type: 'RESOLVE_CRISIS', payload: { crisisId, responseId } });
  }, []);

  // ==================== VOICE MANAGEMENT ====================

  const dismissInterjection = useCallback((voiceId: InnerVoiceId) => {
    dispatch({ type: 'DISMISS_INTERJECTION', payload: voiceId });
  }, []);

  const suppressVoiceAction = useCallback((voiceId: InnerVoiceId) => {
    dispatch({ type: 'SUPPRESS_VOICE', payload: voiceId });
  }, []);

  const unsuppressVoiceAction = useCallback((voiceId: InnerVoiceId) => {
    dispatch({ type: 'UNSUPPRESS_VOICE', payload: voiceId });
  }, []);

  // ==================== NEWSPAPER ====================

  const markNewspaperRead = useCallback(() => {
    dispatch({ type: 'MARK_NEWSPAPER_READ', payload: undefined as any });
  }, []);

  // ==================== FORENSIC AUTOPSY ====================

  const pinEvidence = useCallback((evidenceId: string) => {
    dispatch({ type: 'PIN_EVIDENCE', payload: evidenceId });
  }, []);

  const unpinEvidence = useCallback((evidenceId: string) => {
    dispatch({ type: 'UNPIN_EVIDENCE', payload: evidenceId });
  }, []);

  return {
    // State
    innerMonologue: state.blueprintAI.innerMonologue,
    newspaper: state.blueprintAI.newspaper,
    machiavelliState: state.blueprintAI.machiavelliState,
    chaosEngine: state.blueprintAI.chaosEngine,
    reputationWeb: state.blueprintAI.reputationWeb,
    forensicAutopsy: state.blueprintAI.forensicAutopsy,
    narratorMode: state.blueprintAI.narrator.currentMode,

    // Actions
    triggerVoiceInterjection,
    dismissInterjection,
    suppressVoice: suppressVoiceAction,
    unsuppressVoice: unsuppressVoiceAction,
    markNewspaperRead,
    respondToCrisis,
    createGossip,
    pinEvidence,
    unpinEvidence,
  };
};

export default useBlueprintAI;
