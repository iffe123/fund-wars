import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useGameDispatch, useGameState } from './GameStateContext';
import {
  StatChanges, RivalFund, CompetitiveDeal, Warning,
  NPCDrama, CompanyActiveEvent, ActionType, ACTION_COSTS
} from '../types';
import { COMPETITIVE_DEALS } from '../constants';
import { hydrateCompetitiveDeal } from '../utils/gameUtils';
import type { ActivityItem } from '../components/ActivityFeed';
import type { VoiceInterjection, InnerVoiceId } from '../types/aiBlueprint';

interface GameActions {
  setGamePhase: (phase: any) => void;
  updatePlayerStats: (changes: StatChanges) => void;
  handleActionOutcome: (outcome: { description: string; statChanges: StatChanges }, title: string) => void;
  sendNpcMessage: (npcId: string, message: string, sender?: 'player' | 'npc' | 'system', senderName?: string) => void;
  addLogEntry: (message: string) => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void; // RPG flow helper
  setTutorialStep: (step: number) => void;
  advanceTime: () => void;
  resetGame: () => void;
  // Living World
  dismissWarning: (id: string) => void;
  handleWarningAction: (warning: Warning) => void;
  setActiveDrama: (drama: NPCDrama | null) => void;
  setActiveCompanyEvent: (event: CompanyActiveEvent | null) => void;
  handleEventDecision: (eventId: string, optionId: string) => void;
  // Rivals
  updateRivalFund: (fundId: string, updates: Partial<RivalFund>) => void;
  addDeal: (deal: CompetitiveDeal) => void;
  removeDeal: (dealId: number) => void;
  generateNewDeals: () => void;
  // Time & Action
  useAction: (costOrActionType: number | ActionType, targetId?: string) => boolean;
  endWeek: () => void;
  toggleNightGrinder: () => void;
  // Inner Monologue
  addVoiceInterjection: (interjection: VoiceInterjection) => void;
  dismissInterjection: (voiceId: InnerVoiceId) => void;
  suppressVoice: (voiceId: InnerVoiceId) => void;
  unsuppressVoice: (voiceId: InnerVoiceId) => void;
}

const GameActionsContext = createContext<GameActions | undefined>(undefined);

export const GameActionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useGameDispatch();
  const state = useGameState();

  const addLogEntry = useCallback((message: string) => {
    dispatch({ type: 'ADD_LOG_ENTRY', payload: message });
  }, [dispatch]);

  const addActivity = useCallback((activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const fullActivity: ActivityItem = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: fullActivity });
  }, [dispatch]);

  const updatePlayerStats = useCallback((changes: StatChanges) => {
    dispatch({ type: 'UPDATE_PLAYER_STATS', payload: changes });
  }, [dispatch]);

  const setGamePhase = useCallback((phase: any) => {
    dispatch({ type: 'SET_GAME_PHASE', payload: phase });
  }, [dispatch]);

  const setTutorialStep = useCallback((step: number) => {
    dispatch({ type: 'SET_TUTORIAL_STEP', payload: step });
  }, [dispatch]);

  const handleActionOutcome = useCallback((outcome: { description: string; statChanges: StatChanges }, title: string) => {
    updatePlayerStats(outcome.statChanges);
  }, [updatePlayerStats]);

  const sendNpcMessage = useCallback((npcId: string, message: string, sender: 'player' | 'npc' | 'system' = 'player', senderName?: string) => {
    const npc = state.npcs.find(n => n.id === npcId);
    if (npc) {
        dispatch({ 
            type: 'UPDATE_NPC', 
            payload: { 
                id: npcId, 
                updates: {
                    dialogueHistory: [...npc.dialogueHistory, { sender, senderName, text: message }],
                    lastContactTick: sender === 'player' ? (state.playerStats?.timeCursor ?? 0) : npc.lastContactTick
                }
            } 
        });
    }
  }, [dispatch, state.npcs, state.playerStats?.timeCursor]);

  const advanceTime = useCallback(() => {
    dispatch({ type: 'ADVANCE_TIME' });
  }, [dispatch]);

  const dismissWarning = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_WARNING', payload: id });
  }, [dispatch]);

  const handleWarningAction = useCallback((warning: Warning) => {
    addLogEntry(`Acting on warning: ${warning.title}`);
    dismissWarning(warning.id);
  }, [addLogEntry, dismissWarning]);

  const setActiveDrama = useCallback((drama: NPCDrama | null) => {
    dispatch({ type: 'SET_ACTIVE_DRAMA', payload: drama });
  }, [dispatch]);

  const setActiveCompanyEvent = useCallback((event: CompanyActiveEvent | null) => {
    dispatch({ type: 'SET_ACTIVE_COMPANY_EVENT', payload: event });
  }, [dispatch]);

  const handleEventDecision = useCallback((eventId: string, optionId: string) => {
    // Logic needs state access to find event options
    // Since we can't easily access current state inside this callback without dependency, 
    // and state changes, we use the state from hook.
    // Ideally this logic should be in reducer or thunk.
    // For now, implementing basic dispatch.
    
    // We need to implement the decision logic here or in reducer. 
    // Implementing here requires reading state.activeCompanyEvent
    const event = state.activeCompanyEvent?.id === eventId ? state.activeCompanyEvent : null;
    if (event) {
        const selectedOption = event.options.find(o => o.id === optionId);
        if (selectedOption) {
            updatePlayerStats(selectedOption.statChanges);
            if (selectedOption.companyChanges && state.playerStats) {
                 const company = state.playerStats.portfolio.find(c => c.activeEvent?.id === eventId);
                 if (company) {
                     dispatch({ 
                         type: 'UPDATE_PLAYER_STATS', 
                         payload: { 
                             modifyCompany: { id: company.id, updates: { ...selectedOption.companyChanges, activeEvent: undefined } } 
                         } 
                     });
                 }
            }
            addLogEntry(`Decision: ${selectedOption.label} - ${selectedOption.outcomeText}`);
            setActiveCompanyEvent(null);
            dispatch({ type: 'SET_PENDING_DECISION', payload: null });
            
            // Queue handling
            if (state.eventQueue.length > 0) {
                 const [next, ...rest] = state.eventQueue;
                 setActiveCompanyEvent(next);
                 dispatch({ type: 'SET_EVENT_QUEUE', payload: rest });
            }
        }
    }
  }, [state, dispatch, updatePlayerStats, addLogEntry, setActiveCompanyEvent]);

  const updateRivalFund = useCallback((id: string, updates: Partial<RivalFund>) => {
    dispatch({ type: 'UPDATE_RIVAL_FUND', payload: { id, updates } });
  }, [dispatch]);

  const addDeal = useCallback((deal: CompetitiveDeal) => {
    dispatch({ type: 'ADD_DEAL', payload: deal });
  }, [dispatch]);

  const removeDeal = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_DEAL', payload: id });
  }, [dispatch]);

  const generateNewDeals = useCallback(() => {
    const activeIds = new Set(state.activeDeals.map(d => d.id));
    // Pick up to 2 deals that are not already active
    const available = COMPETITIVE_DEALS.filter(d => !activeIds.has(d.id));
    if (available.length === 0 || state.activeDeals.length >= 4) return;

    const slotsToFill = Math.min(2, 4 - state.activeDeals.length, available.length);
    // Shuffle available deals and pick
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    for (let i = 0; i < slotsToFill; i++) {
      const hydrated = hydrateCompetitiveDeal({
        ...shuffled[i],
        // Assign a unique runtime ID so re-generated deals don't collide
        id: shuffled[i].id + Date.now() + i,
      });
      if (hydrated) {
        dispatch({ type: 'ADD_DEAL', payload: hydrated });
      }
    }
  }, [dispatch, state.activeDeals]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  const useAction = useCallback((costOrActionType: number | ActionType, targetId?: string) => {
    if (!state.playerStats?.gameTime) return false;
    const isNumber = typeof costOrActionType === 'number';
    const cost = isNumber ? costOrActionType : (ACTION_COSTS[costOrActionType] || 1);
    const actionLabel = isNumber ? 'action' : costOrActionType.replace(/_/g, ' ');
    
    // 1. Check AP available
    if (state.playerStats.gameTime.actionsRemaining < cost) {
        addLogEntry(`Not enough actions for ${actionLabel} (need ${cost} AP)`);
        return false;
    }

    // 2. Check if already performed this week on this target
    if (!isNumber && targetId) {
        const weekKey = `${state.playerStats.gameTime.week}-${costOrActionType}-${targetId}`;
        if (state.playerStats.gameTime.actionsPerformedThisWeek?.includes(weekKey)) {
            addLogEntry(`Already performed ${actionLabel} on this target this week.`);
            return false;
        }
    }
    
    dispatch({ type: 'CONSUME_ACTION', payload: { cost, actionType: isNumber ? undefined : costOrActionType, targetId } });
    return true;
  }, [state.playerStats, dispatch, addLogEntry]);

  const endWeek = useCallback(() => {
    // Compute the next week number before dispatching so we don't rely on stale state
    const currentWeek = state.playerStats?.gameTime?.week ?? 0;
    const nextWeek = currentWeek + 1;
    const weekInYear = ((nextWeek - 1) % 52) + 1;
    const nextQuarter = Math.ceil(weekInYear / 13);
    const nextYear = 1 + Math.floor((nextWeek - 1) / 52);

    // Add activity for week transition
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: `week-end-${Date.now()}`,
        timestamp: new Date(),
        type: 'time',
        icon: 'fas fa-calendar-check',
        title: 'Week ended',
        detail: 'Processing portfolio updates, rival actions, and market changes...',
        sentiment: 'neutral'
      }
    });

    dispatch({ type: 'END_WEEK' });
    dispatch({ type: 'ADVANCE_TIME' });

    // Add activity for new week using pre-computed values (avoids stale closure)
    setTimeout(() => {
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: `week-start-${Date.now()}`,
          timestamp: new Date(),
          type: 'time',
          icon: 'fas fa-play-circle',
          title: `Week ${nextWeek} begins`,
          detail: `Q${nextQuarter} • Year ${nextYear}`,
          sentiment: 'positive'
        }
      });
    }, 100);
  }, [dispatch, state.playerStats?.gameTime?.week, state.playerStats?.gameTime?.quarter, state.playerStats?.gameTime?.year]);

  const toggleNightGrinder = useCallback(() => {
    dispatch({ type: 'TOGGLE_NIGHT_GRINDER' });
  }, [dispatch]);

  const addVoiceInterjection = useCallback((interjection: VoiceInterjection) => {
    dispatch({ type: 'ADD_VOICE_INTERJECTION', payload: interjection });
  }, [dispatch]);

  const dismissInterjection = useCallback((voiceId: InnerVoiceId) => {
    dispatch({ type: 'DISMISS_INTERJECTION', payload: voiceId });
  }, [dispatch]);

  const suppressVoiceAction = useCallback((voiceId: InnerVoiceId) => {
    dispatch({ type: 'SUPPRESS_VOICE', payload: voiceId });
  }, [dispatch]);

  const unsuppressVoiceAction = useCallback((voiceId: InnerVoiceId) => {
    dispatch({ type: 'UNSUPPRESS_VOICE', payload: voiceId });
  }, [dispatch]);

  return (
    <GameActionsContext.Provider     value={{
      setGamePhase,
      updatePlayerStats,
      handleActionOutcome,
      sendNpcMessage,
      addLogEntry,
      addActivity,
      setTutorialStep,
      advanceTime,
      resetGame,
      dismissWarning,
      handleWarningAction,
      setActiveDrama,
      setActiveCompanyEvent,
      handleEventDecision,
      updateRivalFund,
      addDeal,
      removeDeal,
      generateNewDeals,
      useAction,
      endWeek,
      toggleNightGrinder,
      addVoiceInterjection,
      dismissInterjection,
      suppressVoice: suppressVoiceAction,
      unsuppressVoice: unsuppressVoiceAction,
    }}>
      {children}
    </GameActionsContext.Provider>
  );
};

export const useGameActions = () => {
  const context = useContext(GameActionsContext);
  if (context === undefined) {
    throw new Error('useGameActions must be used within a GameActionsProvider');
  }
  return context;
};
