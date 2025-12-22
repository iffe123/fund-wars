/**
 * RPG Event System Context
 * 
 * Manages the event-driven RPG layer on top of the existing game state.
 * Handles story arcs, event queues, choices, and consequences.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import type { 
  StoryEvent, 
  StoryArc, 
  EventQueue, 
  EventChoice, 
  EventConsequences,
  WeekPhase,
  RPGEnhancedNPC,
} from '../types/rpgEvents';
import type { PlayerStats, NPC, MarketVolatility, StatChanges } from '../types';
import { 
  createInitialEventQueue, 
  checkEventRequirements, 
  checkChoiceRequirements,
  processChoice,
  scheduleEvent,
  advanceWeek as advanceEventQueue,
  recordCompletedEvent,
  generateWeeklySummary,
  ChoiceResult,
  WeeklySummary,
} from '../utils/eventQueueManager';
import { STORY_EVENTS, STORY_ARCS, createEventMap, createArcMap } from '../constants/rpgContent';

// ============================================================================
// STATE TYPES
// ============================================================================

interface RPGEventState {
  eventQueue: EventQueue;
  storyArcs: StoryArc[];
  currentEvent: StoryEvent | null;
  currentPhase: WeekPhase;
  worldFlags: Set<string>;
  lastChoiceResult: ChoiceResult | null;
  weeklySummary: WeeklySummary | null;
  isEventModalOpen: boolean;
  pendingConsequences: EventConsequences | null;
}

type RPGEventAction =
  | { type: 'INITIALIZE_EVENT_SYSTEM' }
  | { type: 'SET_CURRENT_EVENT'; payload: StoryEvent | null }
  | { type: 'SET_PHASE'; payload: WeekPhase }
  | { type: 'RECORD_CHOICE_RESULT'; payload: ChoiceResult }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'SET_WORLD_FLAG'; payload: string }
  | { type: 'CLEAR_WORLD_FLAG'; payload: string }
  | { type: 'UPDATE_ARC'; payload: { arcId: string; updates: Partial<StoryArc> } }
  | { type: 'COMPLETE_EVENT'; payload: { eventId: string; choiceId: string; consequences: EventConsequences; arcId?: string } }
  | { type: 'SCHEDULE_EVENT'; payload: { eventId: string; delayWeeks: number; source: string; probability?: number } }
  | { type: 'OPEN_EVENT_MODAL' }
  | { type: 'CLOSE_EVENT_MODAL' }
  | { type: 'SET_PENDING_CONSEQUENCES'; payload: EventConsequences | null }
  | { type: 'GENERATE_WEEKLY_SUMMARY' }
  | { type: 'SYNC_EXTERNAL_FLAGS'; payload: string[] };

// ============================================================================
// INITIAL STATE
// ============================================================================

const createInitialState = (): RPGEventState => ({
  eventQueue: createInitialEventQueue(),
  storyArcs: [...STORY_ARCS],
  currentEvent: null,
  currentPhase: 'MORNING_BRIEFING',
  worldFlags: new Set(),
  lastChoiceResult: null,
  weeklySummary: null,
  isEventModalOpen: false,
  pendingConsequences: null,
});

// ============================================================================
// REDUCER
// ============================================================================

const rpgEventReducer = (state: RPGEventState, action: RPGEventAction): RPGEventState => {
  switch (action.type) {
    case 'INITIALIZE_EVENT_SYSTEM':
      return createInitialState();

    case 'SET_CURRENT_EVENT':
      return {
        ...state,
        currentEvent: action.payload,
        isEventModalOpen: action.payload !== null,
      };

    case 'SET_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
      };

    case 'RECORD_CHOICE_RESULT':
      return {
        ...state,
        lastChoiceResult: action.payload,
        eventQueue: {
          ...state.eventQueue,
          priorityEvent: state.eventQueue.priorityEvent?.eventId === state.currentEvent?.id 
            ? undefined 
            : state.eventQueue.priorityEvent,
          optionalEvents: state.eventQueue.optionalEvents.filter(
            e => e.eventId !== state.currentEvent?.id
          ),
        },
      };

    case 'ADVANCE_WEEK': {
      const advancedQueue = advanceEventQueue(state.eventQueue);
      const eventMap = createEventMap();
      const summary = generateWeeklySummary(advancedQueue, eventMap, state.storyArcs);
      
      return {
        ...state,
        eventQueue: advancedQueue,
        currentPhase: 'MORNING_BRIEFING',
        currentEvent: null,
        lastChoiceResult: null,
        weeklySummary: summary,
        isEventModalOpen: false,
      };
    }

    case 'SET_WORLD_FLAG': {
      const newFlags = new Set(state.worldFlags);
      newFlags.add(action.payload);
      return {
        ...state,
        worldFlags: newFlags,
      };
    }

    case 'CLEAR_WORLD_FLAG': {
      const newFlags = new Set(state.worldFlags);
      newFlags.delete(action.payload);
      return {
        ...state,
        worldFlags: newFlags,
      };
    }

    case 'UPDATE_ARC':
      return {
        ...state,
        storyArcs: state.storyArcs.map(arc =>
          arc.id === action.payload.arcId
            ? { ...arc, ...action.payload.updates }
            : arc
        ),
      };

    case 'COMPLETE_EVENT': {
      const { eventId, choiceId, consequences, arcId } = action.payload;
      const updatedQueue = recordCompletedEvent(
        state.eventQueue,
        eventId,
        choiceId,
        consequences,
        arcId
      );

      // Handle queued events from consequences
      let finalQueue = updatedQueue;
      if (consequences.queuesEvent) {
        finalQueue = scheduleEvent(
          finalQueue,
          consequences.queuesEvent.eventId,
          consequences.queuesEvent.delayWeeks,
          `choice:${choiceId}`,
          100,
          choiceId
        );
      }

      // Update arc if specified
      let updatedArcs = state.storyArcs;
      if (arcId) {
        updatedArcs = state.storyArcs.map(arc => {
          if (arc.id !== arcId) return arc;
          
          const newPlayerChoices = [...arc.playerChoices, choiceId];
          const newKeyMoments = [...arc.keyMoments, {
            week: state.eventQueue.currentWeek,
            eventId,
            choiceId,
            summary: consequences.notification?.message || 'Decision made',
            impact: 'SIGNIFICANT' as const,
          }];

          return {
            ...arc,
            playerChoices: newPlayerChoices,
            keyMoments: newKeyMoments,
          };
        });
      }

      // Add new flags to world state
      const newFlags = new Set(state.worldFlags);
      if (consequences.setsFlags) {
        consequences.setsFlags.forEach(flag => newFlags.add(flag));
      }
      if (consequences.clearsFlags) {
        consequences.clearsFlags.forEach(flag => newFlags.delete(flag));
      }

      return {
        ...state,
        eventQueue: finalQueue,
        storyArcs: updatedArcs,
        worldFlags: newFlags,
        currentEvent: null,
        isEventModalOpen: false,
      };
    }

    case 'SCHEDULE_EVENT': {
      const { eventId, delayWeeks, source, probability = 100 } = action.payload;
      const updatedQueue = scheduleEvent(
        state.eventQueue,
        eventId,
        delayWeeks,
        source,
        probability
      );
      return {
        ...state,
        eventQueue: updatedQueue,
      };
    }

    case 'OPEN_EVENT_MODAL':
      return {
        ...state,
        isEventModalOpen: true,
      };

    case 'CLOSE_EVENT_MODAL':
      return {
        ...state,
        isEventModalOpen: false,
      };

    case 'SET_PENDING_CONSEQUENCES':
      return {
        ...state,
        pendingConsequences: action.payload,
      };

    case 'GENERATE_WEEKLY_SUMMARY': {
      const eventMap = createEventMap();
      const summary = generateWeeklySummary(state.eventQueue, eventMap, state.storyArcs);
      return {
        ...state,
        weeklySummary: summary,
      };
    }

    case 'SYNC_EXTERNAL_FLAGS': {
      const newFlags = new Set(state.worldFlags);
      action.payload.forEach(flag => newFlags.add(flag));
      return {
        ...state,
        worldFlags: newFlags,
      };
    }

    default:
      return state;
  }
};

// ============================================================================
// CONTEXT
// ============================================================================

interface RPGEventContextType {
  // State
  state: RPGEventState;
  currentEvent: StoryEvent | null;
  currentPhase: WeekPhase;
  activeArcs: StoryArc[];
  availableChoices: Array<EventChoice & { available: boolean; reason?: string }>;
  worldFlags: Set<string>;
  weeklySummary: WeeklySummary | null;
  isEventModalOpen: boolean;

  // Actions
  initializeEventSystem: () => void;
  selectEvent: (eventId: string) => void;
  makeChoice: (choice: EventChoice, playerStats: PlayerStats, npcs: NPC[]) => ChoiceResult;
  advanceWeek: () => void;
  setPhase: (phase: WeekPhase) => void;
  closeEventModal: () => void;
  getAvailableEvents: (
    playerStats: PlayerStats, 
    npcs: NPC[], 
    marketVolatility: MarketVolatility
  ) => StoryEvent[];
  applyConsequences: (consequences: EventConsequences) => StatChanges;
  scheduleEvent: (eventId: string, delayWeeks: number, source: string) => void;
  setWorldFlag: (flag: string) => void;
  clearWorldFlag: (flag: string) => void;
}

const RPGEventContext = createContext<RPGEventContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface RPGEventProviderProps {
  children: ReactNode;
}

export const RPGEventProvider: React.FC<RPGEventProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(rpgEventReducer, undefined, createInitialState);

  // Memoized event and arc maps
  const eventMap = useMemo(() => createEventMap(), []);
  const arcMap = useMemo(() => createArcMap(), []);

  // Initialize the event system
  const initializeEventSystem = useCallback(() => {
    dispatch({ type: 'INITIALIZE_EVENT_SYSTEM' });
  }, []);

  // Select an event to display
  const selectEvent = useCallback((eventId: string) => {
    const event = eventMap.get(eventId);
    if (event) {
      dispatch({ type: 'SET_CURRENT_EVENT', payload: event });
    }
  }, [eventMap]);

  // Make a choice on the current event
  const makeChoice = useCallback((
    choice: EventChoice, 
    playerStats: PlayerStats, 
    npcs: NPC[]
  ): ChoiceResult => {
    if (!state.currentEvent) {
      return {
        success: false,
        consequences: {
          notification: { title: 'Error', message: 'No active event', type: 'error' },
        },
        narrative: {},
        triggeredEvents: [],
      };
    }

    const result = processChoice(
      state.currentEvent,
      choice,
      playerStats,
      npcs,
      state.worldFlags,
      state.eventQueue.currentWeek
    );

    dispatch({ type: 'RECORD_CHOICE_RESULT', payload: result });
    dispatch({
      type: 'COMPLETE_EVENT',
      payload: {
        eventId: state.currentEvent.id,
        choiceId: choice.id,
        consequences: result.consequences,
        arcId: state.currentEvent.triggerArcId,
      },
    });

    return result;
  }, [state.currentEvent, state.worldFlags, state.eventQueue.currentWeek]);

  // Advance to next week
  const advanceWeekAction = useCallback(() => {
    dispatch({ type: 'ADVANCE_WEEK' });
  }, []);

  // Set the current phase
  const setPhase = useCallback((phase: WeekPhase) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  }, []);

  // Close the event modal
  const closeEventModal = useCallback(() => {
    dispatch({ type: 'CLOSE_EVENT_MODAL' });
  }, []);

  // Get available events based on current game state
  const getAvailableEvents = useCallback((
    playerStats: PlayerStats,
    npcs: NPC[],
    marketVolatility: MarketVolatility
  ): StoryEvent[] => {
    const available: StoryEvent[] = [];
    
    // Check all events
    for (const event of STORY_EVENTS) {
      const meetsRequirements = checkEventRequirements(
        event.requirements,
        playerStats,
        npcs,
        state.storyArcs,
        state.eventQueue.currentWeek,
        state.worldFlags,
        marketVolatility
      );

      if (meetsRequirements) {
        // Check if not already completed
        const isCompleted = state.eventQueue.completedEvents.some(
          ce => ce.eventId === event.id
        );
        
        // Check if not expired
        const isExpired = event.expiresInWeeks !== undefined && 
          event.expiresInWeeks < state.eventQueue.currentWeek;

        if (!isCompleted && !isExpired) {
          available.push(event);
        }
      }
    }

    return available;
  }, [state.storyArcs, state.eventQueue, state.worldFlags]);

  // Convert consequences to StatChanges for the existing system
  const applyConsequences = useCallback((consequences: EventConsequences): StatChanges => {
    const changes: StatChanges = {};

    if (consequences.stats) {
      const { stats } = consequences;
      if (stats.reputation !== undefined) changes.reputation = stats.reputation;
      if (stats.stress !== undefined) changes.stress = stats.stress;
      if (stats.cash !== undefined) changes.cash = stats.cash;
      if (stats.analystRating !== undefined) changes.analystRating = stats.analystRating;
      if (stats.financialEngineering !== undefined) changes.financialEngineering = stats.financialEngineering;
      if (stats.ethics !== undefined) changes.ethics = stats.ethics;
      if (stats.score !== undefined) changes.score = stats.score;
      if (stats.energy !== undefined) changes.energy = stats.energy;
      if (stats.health !== undefined) changes.health = stats.health;
    }

    if (consequences.setsFlags) {
      changes.setsFlags = consequences.setsFlags;
    }

    // Convert NPC effects to first NPC relationship update
    if (consequences.npcEffects && consequences.npcEffects.length > 0) {
      const firstNpc = consequences.npcEffects[0];
      changes.npcRelationshipUpdate = {
        npcId: firstNpc.npcId,
        change: firstNpc.relationship || 0,
        trustChange: firstNpc.trust,
        memory: firstNpc.memory,
      };

      // Handle second NPC if present
      if (consequences.npcEffects.length > 1) {
        const secondNpc = consequences.npcEffects[1];
        changes.npcRelationshipUpdate2 = {
          npcId: secondNpc.npcId,
          change: secondNpc.relationship || 0,
          trustChange: secondNpc.trust,
          memory: secondNpc.memory,
        };
      }
    }

    // Handle company effects
    if (consequences.companyEffects && consequences.companyEffects.length > 0) {
      const firstCompany = consequences.companyEffects[0];
      changes.modifyCompany = {
        id: firstCompany.companyId,
        updates: firstCompany.changes,
      };
    }

    return changes;
  }, []);

  // Schedule an event for the future
  const scheduleEventAction = useCallback((eventId: string, delayWeeks: number, source: string) => {
    dispatch({
      type: 'SCHEDULE_EVENT',
      payload: { eventId, delayWeeks, source },
    });
  }, []);

  // Set a world flag
  const setWorldFlag = useCallback((flag: string) => {
    dispatch({ type: 'SET_WORLD_FLAG', payload: flag });
  }, []);

  // Clear a world flag
  const clearWorldFlag = useCallback((flag: string) => {
    dispatch({ type: 'CLEAR_WORLD_FLAG', payload: flag });
  }, []);

  // Compute available choices for current event
  const availableChoices = useMemo(() => {
    if (!state.currentEvent) return [];

    // Note: We need playerStats and npcs to properly check requirements
    // For now, return all choices as available with a placeholder
    return state.currentEvent.choices.map(choice => ({
      ...choice,
      available: true,
      reason: undefined,
    }));
  }, [state.currentEvent]);

  // Get active arcs
  const activeArcs = useMemo(() => {
    return state.storyArcs.filter(arc => 
      arc.state === 'ACTIVE' || arc.state === 'AVAILABLE'
    );
  }, [state.storyArcs]);

  const contextValue: RPGEventContextType = {
    state,
    currentEvent: state.currentEvent,
    currentPhase: state.currentPhase,
    activeArcs,
    availableChoices,
    worldFlags: state.worldFlags,
    weeklySummary: state.weeklySummary,
    isEventModalOpen: state.isEventModalOpen,
    
    initializeEventSystem,
    selectEvent,
    makeChoice,
    advanceWeek: advanceWeekAction,
    setPhase,
    closeEventModal,
    getAvailableEvents,
    applyConsequences,
    scheduleEvent: scheduleEventAction,
    setWorldFlag,
    clearWorldFlag,
  };

  return (
    <RPGEventContext.Provider value={contextValue}>
      {children}
    </RPGEventContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useRPGEvents = (): RPGEventContextType => {
  const context = useContext(RPGEventContext);
  if (!context) {
    throw new Error('useRPGEvents must be used within an RPGEventProvider');
  }
  return context;
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get choice availability for the current event
 */
export const useChoiceAvailability = (
  playerStats: PlayerStats | null,
  npcs: NPC[]
): Array<EventChoice & { available: boolean; reason?: string }> => {
  const { currentEvent, worldFlags } = useRPGEvents();

  return useMemo(() => {
    if (!currentEvent || !playerStats) return [];

    return currentEvent.choices.map(choice => {
      const result = checkChoiceRequirements(
        choice.requires,
        playerStats,
        npcs,
        worldFlags
      );

      return {
        ...choice,
        available: result.available,
        reason: result.reason,
      };
    });
  }, [currentEvent, playerStats, npcs, worldFlags]);
};

/**
 * Hook to get the next priority event for the week
 */
export const useNextPriorityEvent = (
  playerStats: PlayerStats | null,
  npcs: NPC[],
  marketVolatility: MarketVolatility
): StoryEvent | null => {
  const { getAvailableEvents, state } = useRPGEvents();

  return useMemo(() => {
    if (!playerStats) return null;

    // First check if there's a priority event in the queue
    if (state.eventQueue.priorityEvent) {
      const eventMap = createEventMap();
      const event = eventMap.get(state.eventQueue.priorityEvent.eventId);
      if (event && event.type === 'PRIORITY') {
        const meetsRequirements = checkEventRequirements(
          event.requirements,
          playerStats,
          npcs,
          state.storyArcs,
          state.eventQueue.currentWeek,
          state.worldFlags,
          marketVolatility
        );
        if (meetsRequirements) {
          return event;
        }
      }
    }

    // Then check all available priority events
    const available = getAvailableEvents(playerStats, npcs, marketVolatility);
    const priorityEvents = available.filter(e => e.type === 'PRIORITY');
    
    if (priorityEvents.length > 0) {
      // Sort by stakes/priority
      const sorted = [...priorityEvents].sort((a, b) => {
        const stakeOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return stakeOrder[a.stakes] - stakeOrder[b.stakes];
      });
      return sorted[0];
    }

    return null;
  }, [playerStats, npcs, marketVolatility, getAvailableEvents, state]);
};

export default RPGEventContext;
