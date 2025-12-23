/**
 * Game Flow Manager
 * 
 * Manages the continuous event-driven game loop.
 * Ensures the game NEVER stops - there's always something happening.
 */

import type {
  PlayerStats,
  NPC,
  MarketVolatility,
  StatChanges,
  CompanyActiveEvent,
  NPCDrama,
} from '../types';
import type {
  StoryEvent,
  StoryArc,
  EventQueue,
  EventConsequences,
  WeekPhase,
} from '../types/rpgEvents';
import {
  processWeeklyQueue,
  ensureEventFlow,
  getNextEvent,
  chainEvent,
  createImmediateEvent,
  recordCompletedEvent,
} from './eventQueueManager';
import { createEventMap } from '../constants/rpgContent';

// ============================================================================
// GAME FLOW STATE
// ============================================================================

export interface GameFlowState {
  currentPhase: WeekPhase;
  activeEvent: StoryEvent | null;
  eventQueue: EventQueue;
  pendingConsequences: EventConsequences[];
  worldFlags: Set<string>;
  recentActions: GameAction[];
}

export interface GameAction {
  type: string;
  timestamp: number;
  eventId?: string;
  choiceId?: string;
  cost: number;
}

// ============================================================================
// FLOW INITIALIZATION
// ============================================================================

/**
 * Initialize game flow state for a new game or loaded save.
 */
export const initializeGameFlow = (
  eventQueue: EventQueue,
  worldFlags: Set<string>
): GameFlowState => {
  return {
    currentPhase: 'MORNING_BRIEFING',
    activeEvent: null,
    eventQueue,
    pendingConsequences: [],
    worldFlags,
    recentActions: [],
  };
};

// ============================================================================
// PHASE TRANSITIONS
// ============================================================================

/**
 * Advance to the next phase of the week.
 * Each phase automatically provides events/content - game never stops.
 */
export const advancePhase = (
  flowState: GameFlowState,
  playerStats: PlayerStats,
  npcs: NPC[],
  arcs: StoryArc[],
  marketVolatility: MarketVolatility
): GameFlowState => {
  const eventMap = createEventMap();
  
  switch (flowState.currentPhase) {
    case 'MORNING_BRIEFING':
      // Generate fresh events for the week
      const refreshedQueue = processWeeklyQueue(
        flowState.eventQueue,
        eventMap,
        arcs,
        playerStats,
        npcs,
        flowState.worldFlags,
        marketVolatility
      );
      
      return {
        ...flowState,
        currentPhase: 'PRIORITY_EVENT',
        eventQueue: refreshedQueue,
      };

    case 'PRIORITY_EVENT':
      return {
        ...flowState,
        currentPhase: 'OPTIONAL_PHASE',
      };

    case 'OPTIONAL_PHASE':
      // Stay in optional phase until week ends
      // This is the "main" phase where most gameplay happens
      return flowState;

    case 'FALLOUT':
      return {
        ...flowState,
        currentPhase: 'WEEK_END',
      };

    case 'WEEK_END':
      // Loop back to morning briefing
      return {
        ...flowState,
        currentPhase: 'MORNING_BRIEFING',
      };

    default:
      return flowState;
  }
};

// ============================================================================
// EVENT FLOW MANAGEMENT
// ============================================================================

/**
 * Get the next event player should engage with.
 * ALWAYS returns something - game never stops.
 */
export const getNextAvailableEvent = (
  flowState: GameFlowState,
  playerStats: PlayerStats,
  npcs: NPC[],
  arcs: StoryArc[],
  marketVolatility: MarketVolatility
): { event: StoryEvent | null; isNew: boolean; flowState: GameFlowState } => {
  const eventMap = createEventMap();
  
  // First, ensure we have enough events in queue
  const flowingQueue = ensureEventFlow(
    flowState.eventQueue,
    eventMap,
    arcs,
    playerStats,
    npcs,
    flowState.worldFlags,
    marketVolatility
  );

  // Get the next event
  const nextQueuedEvent = getNextEvent(flowingQueue, eventMap);
  
  if (!nextQueuedEvent) {
    // This should NEVER happen due to ensureEventFlow,
    // but fallback to generating more events
    const regeneratedQueue = processWeeklyQueue(
      flowingQueue,
      eventMap,
      arcs,
      playerStats,
      npcs,
      flowState.worldFlags,
      marketVolatility
    );
    
    const fallbackEvent = getNextEvent(regeneratedQueue, eventMap);
    const storyEvent = fallbackEvent ? eventMap.get(fallbackEvent.eventId) : null;
    
    return {
      event: storyEvent || null,
      isNew: true,
      flowState: {
        ...flowState,
        eventQueue: regeneratedQueue,
      },
    };
  }

  const storyEvent = eventMap.get(nextQueuedEvent.eventId);
  
  return {
    event: storyEvent || null,
    isNew: flowState.activeEvent?.id !== storyEvent?.id,
    flowState: {
      ...flowState,
      eventQueue: flowingQueue,
      activeEvent: storyEvent || null,
    },
  };
};

/**
 * Process event completion and trigger cascading events.
 * This creates the continuous flow - one event leads to another.
 */
export const completeEvent = (
  flowState: GameFlowState,
  eventId: string,
  choiceId: string,
  consequences: EventConsequences,
  apCost: number
): GameFlowState => {
  // Record completion
  let updatedQueue = recordCompletedEvent(
    flowState.eventQueue,
    eventId,
    choiceId,
    consequences
  );

  // Update world flags
  const updatedFlags = new Set(flowState.worldFlags);
  if (consequences.setsFlags) {
    consequences.setsFlags.forEach(flag => updatedFlags.add(flag));
  }
  if (consequences.clearsFlags) {
    consequences.clearsFlags.forEach(flag => updatedFlags.delete(flag));
  }

  // Chain follow-up events if specified
  if (consequences.queuesEvent) {
    updatedQueue = chainEvent(
      updatedQueue,
      consequences.queuesEvent.eventId,
      `follow-up:${choiceId}`,
      consequences.queuesEvent.delayWeeks
    );
  }

  // Create immediate reaction events for NPC effects
  if (consequences.npcEffects && consequences.npcEffects.length > 0) {
    // Could create follow-up NPC conversation events here
    // For now, just note them in pending consequences
  }

  // Record action
  const newAction: GameAction = {
    type: 'event_choice',
    timestamp: Date.now(),
    eventId,
    choiceId,
    cost: apCost,
  };

  return {
    ...flowState,
    eventQueue: updatedQueue,
    worldFlags: updatedFlags,
    pendingConsequences: [...flowState.pendingConsequences, consequences],
    recentActions: [...flowState.recentActions, newAction].slice(-20), // Keep last 20
    activeEvent: null, // Clear active event after completion
  };
};

// ============================================================================
// FREE-FLOW INTERACTIONS
// ============================================================================

/**
 * Generate a free-flow interaction event (0 AP cost).
 * These keep the game moving even when player has no AP.
 */
export const createFreeFlowEvent = (
  flowState: GameFlowState,
  type: 'NPC_CHAT' | 'NEWS_UPDATE' | 'MARKET_SHIFT' | 'PORTFOLIO_UPDATE',
  context: {
    npcId?: string;
    companyId?: number;
    message?: string;
  }
): { event: StoryEvent; flowState: GameFlowState } => {
  // Create a simple event on the fly
  const eventId = `free-flow-${type.toLowerCase()}-${Date.now()}`;
  
  const freeEvent: StoryEvent = {
    id: eventId,
    type: 'OPTIONAL',
    title: getFreeFlowTitle(type),
    hook: context.message || getFreeFlowHook(type),
    stakes: 'LOW',
    category: 'OPERATIONS',
    choices: getFreeFlowChoices(type),
    requirements: {},
  };

  const updatedQueue = createImmediateEvent(
    flowState.eventQueue,
    eventId,
    'free-flow'
  );

  return {
    event: freeEvent,
    flowState: {
      ...flowState,
      eventQueue: updatedQueue,
      activeEvent: freeEvent,
    },
  };
};

const getFreeFlowTitle = (type: string): string => {
  switch (type) {
    case 'NPC_CHAT':
      return 'Quick Chat';
    case 'NEWS_UPDATE':
      return 'Breaking News';
    case 'MARKET_SHIFT':
      return 'Market Movement';
    case 'PORTFOLIO_UPDATE':
      return 'Portfolio Check-In';
    default:
      return 'Update';
  }
};

const getFreeFlowHook = (type: string): string => {
  switch (type) {
    case 'NPC_CHAT':
      return 'Someone wants to talk.';
    case 'NEWS_UPDATE':
      return 'The news cycle continues.';
    case 'MARKET_SHIFT':
      return 'Market conditions are changing.';
    case 'PORTFOLIO_UPDATE':
      return 'Time to check on your companies.';
    default:
      return 'Something is happening.';
  }
};

const getFreeFlowChoices = (type: string): any[] => {
  // Simple acknowledge choice - 0 AP cost
  return [
    {
      id: 'acknowledge',
      label: 'Got it',
      playerLine: 'Understood.',
      consequences: {
        notification: {
          title: 'Noted',
          message: 'You stay informed.',
          type: 'info' as const,
        },
      },
      apCost: 0,
    },
  ];
};

// ============================================================================
// CONTINUOUS FLOW HELPERS
// ============================================================================

/**
 * Check if player can progress in the current phase.
 * With the new system, the answer should ALWAYS be yes.
 */
export const canProgress = (
  flowState: GameFlowState,
  playerStats: PlayerStats
): boolean => {
  // Player can ALWAYS progress - either by engaging with free events
  // or by advancing the week if they're done
  return true;
};

/**
 * Get available actions for the current game state.
 * Returns actions player can take right now (mix of free and AP-costing).
 */
export const getAvailableActions = (
  flowState: GameFlowState,
  playerStats: PlayerStats,
  apRemaining: number
): Array<{ label: string; cost: number; type: string }> => {
  const actions: Array<{ label: string; cost: number; type: string }> = [];

  // Always available: Free actions
  actions.push(
    { label: 'Check Portfolio', cost: 0, type: 'PORTFOLIO_REVIEW' },
    { label: 'Read News', cost: 0, type: 'CASUAL_INTERACTION' },
    { label: 'Network', cost: 0, type: 'NETWORK_EVENT' }
  );

  // Available if AP remaining: Strategic actions
  if (apRemaining > 0) {
    actions.push(
      { label: 'Make Strategic Move', cost: 1, type: 'STRATEGIC_INTERVENTION' },
      { label: 'Deep Work Session', cost: 1, type: 'DEEP_ENGAGEMENT' }
    );
  }

  // Always available: Advance time
  actions.push({ label: 'Advance Week', cost: 0, type: 'ADVANCE_TIME' });

  return actions;
};

/**
 * Generate background atmosphere events.
 * These run automatically to keep the world feeling alive.
 */
export const generateBackgroundEvents = (
  flowState: GameFlowState,
  playerStats: PlayerStats,
  npcs: NPC[]
): string[] => {
  const events: string[] = [];

  // Market movements
  if (Math.random() > 0.5) {
    events.push('Tech stocks surge 2% on AI optimism');
  }

  // NPC activity
  const randomNPC = npcs[Math.floor(Math.random() * npcs.length)];
  if (randomNPC) {
    events.push(`${randomNPC.name} is working on something`);
  }

  // Portfolio updates
  if (playerStats.portfolio?.length > 0) {
    const randomCompany = playerStats.portfolio[
      Math.floor(Math.random() * playerStats.portfolio.length)
    ];
    events.push(`${randomCompany.name}: quarterly review scheduled`);
  }

  return events;
};

/**
 * Check if week should auto-advance (all critical events resolved).
 */
export const shouldAutoAdvanceWeek = (flowState: GameFlowState): boolean => {
  // Never auto-advance - let player control pacing
  // But we could suggest advancing if no priority events remain
  return false;
};

/**
 * Get flow status summary for UI.
 */
export const getFlowStatus = (
  flowState: GameFlowState,
  playerStats: PlayerStats
): {
  phase: WeekPhase;
  availableEventCount: number;
  priorityEventPending: boolean;
  canProgress: boolean;
  suggestion: string;
} => {
  const eventCount = 
    (flowState.eventQueue.priorityEvent ? 1 : 0) +
    flowState.eventQueue.optionalEvents.length;

  const suggestion = eventCount === 0
    ? 'Generating new events...'
    : flowState.eventQueue.priorityEvent
    ? 'Priority event requires attention'
    : 'Multiple events available - choose your path';

  return {
    phase: flowState.currentPhase,
    availableEventCount: eventCount,
    priorityEventPending: !!flowState.eventQueue.priorityEvent,
    canProgress: true, // Always true in new system
    suggestion,
  };
};
