/**
 * Event Queue Manager
 * 
 * Manages the flow of narrative events in the RPG system.
 * Handles:
 * - Event selection and prioritization
 * - Requirement checking
 * - Choice processing
 * - Consequence application
 * - Arc progression
 */

import type { 
  PlayerStats, 
  NPC, 
  StatChanges,
  MarketVolatility 
} from '../types';
import type {
  StoryEvent,
  EventChoice,
  EventQueue,
  QueuedEvent,
  ScheduledEvent,
  CompletedEvent,
  EventRequirements,
  ChoiceRequirements,
  EventConsequences,
  ChoiceResult as ChoiceResultType,
  StoryArc,
  WeeklySummary as WeeklySummaryType,
  WeekPhase,
} from '../types/rpgEvents';

// Re-export for use in context
export type ChoiceResult = ChoiceResultType;
export type WeeklySummary = WeeklySummaryType;

// ============================================================================
// QUEUE INITIALIZATION
// ============================================================================

export const createInitialEventQueue = (): EventQueue => ({
  priorityEvent: undefined,
  optionalEvents: [],
  backgroundEvents: [],
  scheduledEvents: [],
  completedEvents: [],
  expiredEvents: [],
  currentWeek: 1,
  processingEvent: undefined,
});

// ============================================================================
// REQUIREMENT CHECKING
// ============================================================================

/**
 * Check if an event's requirements are met.
 */
export const checkEventRequirements = (
  requirements: EventRequirements | undefined,
  playerStats: PlayerStats,
  npcs: NPC[],
  arcs: StoryArc[],
  currentWeek: number,
  worldFlags: Set<string>,
  marketVolatility: MarketVolatility
): boolean => {
  if (!requirements) return true;

  // Time-based checks
  if (requirements.minWeek && currentWeek < requirements.minWeek) return false;
  if (requirements.maxWeek && currentWeek > requirements.maxWeek) return false;
  if (requirements.dayType && playerStats.currentDayType !== requirements.dayType) return false;
  if (requirements.timeSlot && playerStats.currentTimeSlot !== requirements.timeSlot) return false;

  // Player stat checks
  if (requirements.minReputation && playerStats.reputation < requirements.minReputation) return false;
  if (requirements.maxReputation && playerStats.reputation > requirements.maxReputation) return false;
  if (requirements.minCash && playerStats.cash < requirements.minCash) return false;
  
  // Level checks
  if (requirements.minLevel) {
    const levelOrder = ['Associate', 'Senior Associate', 'Vice President', 'Principal', 'Partner', 'Founder'];
    const playerLevelIndex = levelOrder.indexOf(playerStats.level);
    const requiredLevelIndex = levelOrder.indexOf(requirements.minLevel);
    if (playerLevelIndex < requiredLevelIndex) return false;
  }

  // Flag checks
  if (requirements.requiredFlags?.some(flag => !worldFlags.has(flag))) return false;
  if (requirements.blockedByFlags?.some(flag => worldFlags.has(flag))) return false;

  // NPC relationship checks
  if (requirements.npcRelationships) {
    for (const req of requirements.npcRelationships) {
      const npc = npcs.find(n => n.id === req.npcId);
      if (!npc) continue;
      if (req.minRelationship && npc.relationship < req.minRelationship) return false;
      if (req.maxRelationship && npc.relationship > req.maxRelationship) return false;
      if (req.minTrust && (npc.trust || npc.relationship) < req.minTrust) return false;
    }
  }

  // Portfolio checks
  if (requirements.minPortfolioSize && playerStats.portfolio.length < requirements.minPortfolioSize) return false;
  if (requirements.hasCompanyInStatus) {
    const hasMatchingStatus = playerStats.portfolio.some(c => {
      if (requirements.hasCompanyInStatus === 'PIPELINE') return !c.dealClosed;
      if (requirements.hasCompanyInStatus === 'OWNED') return c.dealClosed && !c.isInExitProcess;
      if (requirements.hasCompanyInStatus === 'EXITING') return c.isInExitProcess;
      return false;
    });
    if (!hasMatchingStatus) return false;
  }

  // Market conditions
  if (requirements.allowedVolatility && !requirements.allowedVolatility.includes(marketVolatility)) {
    return false;
  }

  // Arc state checks
  if (requirements.arcState) {
    const arc = arcs.find(a => a.id === requirements.arcState!.arcId);
    if (!arc) return false;
    if (requirements.arcState.minStage && arc.currentStage < requirements.arcState.minStage) return false;
    if (requirements.arcState.maxStage && arc.currentStage > requirements.arcState.maxStage) return false;
  }

  return true;
};

/**
 * Check if a choice's requirements are met.
 */
export const checkChoiceRequirements = (
  requirements: ChoiceRequirements | undefined,
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>
): { available: boolean; reason?: string } => {
  if (!requirements) return { available: true };

  // Stat check
  if (requirements.stat) {
    const statValue = playerStats[requirements.stat.name as keyof PlayerStats] as number;
    if (requirements.stat.min && statValue < requirements.stat.min) {
      return { 
        available: false, 
        reason: `Requires ${requirements.stat.name} ≥ ${requirements.stat.min}` 
      };
    }
    if (requirements.stat.max && statValue > requirements.stat.max) {
      return { 
        available: false, 
        reason: `Requires ${requirements.stat.name} ≤ ${requirements.stat.max}` 
      };
    }
  }

  // Flag check
  if (requirements.flag && !worldFlags.has(requirements.flag)) {
    return { available: false, reason: 'Locked' };
  }
  if (requirements.notFlag && worldFlags.has(requirements.notFlag)) {
    return { available: false, reason: 'Blocked by previous choice' };
  }

  // NPC relationship check
  if (requirements.npcRelationship) {
    const npc = npcs.find(n => n.id === requirements.npcRelationship!.npcId);
    if (!npc || npc.relationship < (requirements.npcRelationship.min || 0)) {
      return { 
        available: false, 
        reason: `Requires better relationship with ${npc?.name || 'NPC'}` 
      };
    }
  }

  // Level check
  if (requirements.minLevel) {
    const levelOrder = ['Associate', 'Senior Associate', 'Vice President', 'Principal', 'Partner', 'Founder'];
    const playerLevelIndex = levelOrder.indexOf(playerStats.level);
    const requiredLevelIndex = levelOrder.indexOf(requirements.minLevel);
    if (playerLevelIndex < requiredLevelIndex) {
      return { available: false, reason: `Requires ${requirements.minLevel} rank` };
    }
  }

  return { available: true };
};

// ============================================================================
// SKILL CHECK SYSTEM
// ============================================================================

/**
 * Perform a skill check for a choice.
 */
export const performSkillCheck = (
  choice: EventChoice,
  playerStats: PlayerStats
): { passed: boolean; roll: number; threshold: number; critical: boolean } => {
  if (!choice.skillCheck) {
    return { passed: true, roll: 100, threshold: 0, critical: false };
  }

  const { skill, threshold, rollBonus = 0, criticalSuccessThreshold, criticalFailureThreshold } = choice.skillCheck;
  
  // Get player's skill value
  const skillValue = playerStats[skill as keyof PlayerStats] as number || 0;
  
  // Roll with variance
  const roll = skillValue + rollBonus + (Math.random() * 20 - 10);
  
  const passed = roll >= threshold;
  const critical = passed 
    ? (criticalSuccessThreshold ? roll >= criticalSuccessThreshold : false)
    : (criticalFailureThreshold ? roll <= criticalFailureThreshold : false);

  return { passed, roll: Math.round(roll), threshold, critical };
};

// ============================================================================
// CHOICE PROCESSING
// ============================================================================

/**
 * Process a player's choice and calculate all consequences.
 */
export const processChoice = (
  event: StoryEvent,
  choice: EventChoice,
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>,
  currentWeek: number
): ChoiceResult => {
  // Perform skill check if applicable
  const skillCheckResult = choice.skillCheck 
    ? performSkillCheck(choice, playerStats)
    : undefined;

  // Determine base consequences
  let consequences = { ...choice.consequences };

  // Apply skill check modifiers
  if (skillCheckResult) {
    if (skillCheckResult.passed && choice.skillCheck?.successConsequences) {
      consequences = mergeConsequences(consequences, choice.skillCheck.successConsequences);
    } else if (!skillCheckResult.passed && choice.skillCheck?.failureConsequences) {
      consequences = mergeConsequences(consequences, choice.skillCheck.failureConsequences);
    }
  }

  // Check success chance (separate from skill check)
  if (choice.successChance !== undefined && choice.successChance < 100) {
    const roll = Math.random() * 100;
    if (roll > choice.successChance) {
      // Partial failure - reduce positive effects, increase negative
      if (consequences.stats) {
        consequences.stats = Object.fromEntries(
          Object.entries(consequences.stats).map(([key, value]) => {
            if (typeof value === 'number') {
              return [key, value > 0 ? Math.floor(value * 0.5) : Math.ceil(value * 1.5)];
            }
            return [key, value];
          })
        ) as Partial<StatChanges>;
      }
    }
  }

  // Determine triggered events
  const triggeredEvents: string[] = [];
  if (choice.triggersEvents) {
    for (const trigger of choice.triggersEvents) {
      const probability = trigger.probability ?? 100;
      if (Math.random() * 100 <= probability) {
        triggeredEvents.push(trigger.eventId);
      }
    }
  }

  return {
    success: !skillCheckResult || skillCheckResult.passed,
    skillCheckResult: skillCheckResult ? {
      rolled: skillCheckResult.roll,
      threshold: skillCheckResult.threshold,
      passed: skillCheckResult.passed,
      critical: skillCheckResult.critical,
    } : undefined,
    consequences,
    narrative: {
      playerLine: choice.playerLine,
      response: choice.immediateResponse,
      epilogue: choice.epilogue,
    },
    triggeredEvents,
    arcProgression: choice.advancesArc ? {
      arcId: choice.advancesArc.arcId,
      newStage: choice.advancesArc.toStage,
    } : undefined,
  };
};

/**
 * Merge two consequence objects.
 */
const mergeConsequences = (
  base: EventConsequences,
  override: Partial<EventConsequences>
): EventConsequences => {
  return {
    ...base,
    stats: { ...base.stats, ...override.stats },
    npcEffects: [...(base.npcEffects || []), ...(override.npcEffects || [])],
    setsFlags: [...(base.setsFlags || []), ...(override.setsFlags || [])],
    clearsFlags: [...(base.clearsFlags || []), ...(override.clearsFlags || [])],
    companyEffects: [...(base.companyEffects || []), ...(override.companyEffects || [])],
  };
};

// ============================================================================
// EVENT QUEUE MANAGEMENT
// ============================================================================

/**
 * Process the weekly event queue - select priority and optional events.
 * REDESIGNED: Ensures events are ALWAYS available - game never stops.
 */
export const processWeeklyQueue = (
  queue: EventQueue,
  allEvents: Map<string, StoryEvent>,
  arcs: StoryArc[],
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>,
  marketVolatility: MarketVolatility
): EventQueue => {
  const newQueue = { ...queue };
  const currentWeek = queue.currentWeek;

  // Move scheduled events that are due
  const dueEvents = queue.scheduledEvents.filter(se => se.triggerWeek <= currentWeek);
  const futureEvents = queue.scheduledEvents.filter(se => se.triggerWeek > currentWeek);

  // Add due scheduled events to queue
  for (const scheduledEvent of dueEvents) {
    if (Math.random() * 100 <= scheduledEvent.probability) {
      const event = allEvents.get(scheduledEvent.eventId);
      if (event && checkEventRequirements(
        event.requirements, 
        playerStats, 
        npcs, 
        arcs, 
        currentWeek, 
        worldFlags, 
        marketVolatility
      )) {
        const queuedEvent: QueuedEvent = {
          eventId: scheduledEvent.eventId,
          addedWeek: currentWeek,
          expiresWeek: event.expiresInWeeks ? currentWeek + event.expiresInWeeks : undefined,
          source: 'SCHEDULED',
          priority: event.type === 'PRIORITY' ? 10 : 5,
        };

        if (event.type === 'PRIORITY' && !newQueue.priorityEvent) {
          newQueue.priorityEvent = queuedEvent;
        } else if (event.type === 'OPTIONAL') {
          newQueue.optionalEvents.push(queuedEvent);
        } else {
          newQueue.backgroundEvents.push(queuedEvent);
        }
      }
    }
  }

  newQueue.scheduledEvents = futureEvents;

  // REDESIGN: Always generate priority event if none exists
  // This ensures game never stops for lack of content
  if (!newQueue.priorityEvent) {
    const priorityEvent = selectRandomEvent('PRIORITY', allEvents, arcs, playerStats, npcs, worldFlags, marketVolatility, currentWeek);
    if (priorityEvent) {
      newQueue.priorityEvent = priorityEvent;
    }
  }

  // REDESIGN: Ensure minimum 5 optional events (increased from 3)
  // Players should always have choices available
  const MIN_OPTIONAL_EVENTS = 5;
  while (newQueue.optionalEvents.length < MIN_OPTIONAL_EVENTS) {
    const optionalEvent = selectRandomEvent('OPTIONAL', allEvents, arcs, playerStats, npcs, worldFlags, marketVolatility, currentWeek);
    if (optionalEvent) {
      // Avoid duplicates
      if (!newQueue.optionalEvents.some(e => e.eventId === optionalEvent.eventId)) {
        newQueue.optionalEvents.push(optionalEvent);
      } else {
        break; // No more unique events available
      }
    } else {
      break;
    }
  }

  // REDESIGN: Generate background events for atmosphere (2-4 per week)
  const MIN_BACKGROUND_EVENTS = 2;
  while (newQueue.backgroundEvents.length < MIN_BACKGROUND_EVENTS) {
    const backgroundEvent = selectRandomEvent('OPTIONAL', allEvents, arcs, playerStats, npcs, worldFlags, marketVolatility, currentWeek);
    if (backgroundEvent) {
      // Convert to background event with lower priority
      backgroundEvent.priority = 1;
      if (!newQueue.backgroundEvents.some(e => e.eventId === backgroundEvent.eventId)) {
        newQueue.backgroundEvents.push(backgroundEvent);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Check for expired events
  const expiredOptional = newQueue.optionalEvents.filter(e => e.expiresWeek && e.expiresWeek <= currentWeek);
  for (const expired of expiredOptional) {
    newQueue.expiredEvents.push({
      eventId: expired.eventId,
      expiredWeek: currentWeek,
      autoResolved: false,
    });
  }
  newQueue.optionalEvents = newQueue.optionalEvents.filter(e => !e.expiresWeek || e.expiresWeek > currentWeek);

  return newQueue;
};

/**
 * Select a random event that meets requirements.
 */
const selectRandomEvent = (
  type: 'PRIORITY' | 'OPTIONAL',
  allEvents: Map<string, StoryEvent>,
  arcs: StoryArc[],
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>,
  marketVolatility: MarketVolatility,
  currentWeek: number
): QueuedEvent | null => {
  const eligibleEvents: StoryEvent[] = [];

  for (const [id, event] of allEvents) {
    if (event.type !== type) continue;
    if (!checkEventRequirements(event.requirements, playerStats, npcs, arcs, currentWeek, worldFlags, marketVolatility)) {
      continue;
    }
    eligibleEvents.push(event);
  }

  if (eligibleEvents.length === 0) return null;

  // Weight by stakes
  const weightedEvents = eligibleEvents.flatMap(event => {
    const weight = event.stakes === 'CRITICAL' ? 4 : 
                   event.stakes === 'HIGH' ? 3 :
                   event.stakes === 'MEDIUM' ? 2 : 1;
    return Array(weight).fill(event);
  });

  const selectedEvent = weightedEvents[Math.floor(Math.random() * weightedEvents.length)];

  return {
    eventId: selectedEvent.id,
    addedWeek: currentWeek,
    expiresWeek: selectedEvent.expiresInWeeks ? currentWeek + selectedEvent.expiresInWeeks : undefined,
    source: 'RANDOM',
    arcId: selectedEvent.triggerArcId,
    priority: selectedEvent.stakes === 'CRITICAL' ? 10 : 
              selectedEvent.stakes === 'HIGH' ? 8 :
              selectedEvent.stakes === 'MEDIUM' ? 5 : 3,
  };
};

/**
 * Record a completed event.
 */
export const recordCompletedEvent = (
  queue: EventQueue,
  eventId: string,
  choiceId: string,
  consequences: EventConsequences,
  arcId?: string
): EventQueue => {
  const completedEvent: CompletedEvent = {
    eventId,
    choiceId,
    week: queue.currentWeek,
    consequences,
    arcId,
  };

  // Remove from active queues
  const newQueue: EventQueue = {
    ...queue,
    priorityEvent: queue.priorityEvent?.eventId === eventId ? undefined : queue.priorityEvent,
    optionalEvents: queue.optionalEvents.filter(e => e.eventId !== eventId),
    backgroundEvents: queue.backgroundEvents.filter(e => e.eventId !== eventId),
    completedEvents: [...queue.completedEvents, completedEvent],
  };

  return newQueue;
};

/**
 * Schedule a new event for a future week.
 */
export const scheduleEvent = (
  queue: EventQueue,
  eventId: string,
  delayWeeks: number,
  source: string,
  probability: number = 100,
  sourceChoiceId?: string
): EventQueue => {
  const scheduledEvent: ScheduledEvent = {
    eventId,
    triggerWeek: queue.currentWeek + delayWeeks,
    probability,
    source,
    sourceChoiceId,
  };

  return {
    ...queue,
    scheduledEvents: [...queue.scheduledEvents, scheduledEvent],
  };
};

/**
 * Advance to the next week.
 */
export const advanceWeek = (queue: EventQueue): EventQueue => {
  return {
    ...queue,
    currentWeek: queue.currentWeek + 1,
    processingEvent: undefined,
  };
};

// ============================================================================
// WEEKLY SUMMARY
// ============================================================================

/**
 * Generate a weekly summary for the player.
 */
export const generateWeeklySummary = (
  queue: EventQueue,
  allEvents: Map<string, StoryEvent>,
  arcs: StoryArc[]
): WeeklySummary => {
  const weekEvents = queue.completedEvents.filter(e => e.week === queue.currentWeek);
  
  const priorityEvent = weekEvents.find(e => {
    const event = allEvents.get(e.eventId);
    return event?.type === 'PRIORITY';
  });

  const optionalCount = weekEvents.filter(e => {
    const event = allEvents.get(e.eventId);
    return event?.type === 'OPTIONAL';
  }).length;

  const keyConsequences: string[] = [];
  const arcProgressions: Array<{ arcTitle: string; newStage: string }> = [];

  for (const completed of weekEvents) {
    if (completed.consequences.notification) {
      keyConsequences.push(completed.consequences.notification.message);
    }
    if (completed.arcId) {
      const arc = arcs.find(a => a.id === completed.arcId);
      if (arc) {
        const stage = arc.stages[arc.currentStage];
        arcProgressions.push({
          arcTitle: arc.title,
          newStage: stage?.title || 'Unknown',
        });
      }
    }
  }

  return {
    week: queue.currentWeek,
    priorityEventTitle: priorityEvent ? allEvents.get(priorityEvent.eventId)?.title : undefined,
    priorityChoice: priorityEvent?.choiceId,
    optionalEventsHandled: optionalCount,
    keyConsequences,
    arcProgressions,
    npcChanges: [], // Would need NPC tracking to populate
    nextWeekTeaser: undefined, // Could peek at scheduled events
  };
};

// ============================================================================
// EVENT CHAINING & FLOW SYSTEM
// ============================================================================

/**
 * Chain a follow-up event immediately after the current event.
 * This creates continuous narrative flow.
 */
export const chainEvent = (
  queue: EventQueue,
  eventId: string,
  source: string,
  delayWeeks: number = 0
): EventQueue => {
  return scheduleEvent(queue, eventId, delayWeeks, source, 100);
};

/**
 * Create an immediate event that doesn't consume AP.
 * Used for narrative responses, NPC reactions, etc.
 */
export const createImmediateEvent = (
  queue: EventQueue,
  eventId: string,
  source: string
): EventQueue => {
  const queuedEvent: QueuedEvent = {
    eventId,
    addedWeek: queue.currentWeek,
    source: `IMMEDIATE:${source}`,
    priority: 8, // High priority but below PRIORITY events
  };

  return {
    ...queue,
    optionalEvents: [queuedEvent, ...queue.optionalEvents],
  };
};

/**
 * Check if the queue has sufficient events to keep the game flowing.
 * If not, generate more.
 */
export const ensureEventFlow = (
  queue: EventQueue,
  allEvents: Map<string, StoryEvent>,
  arcs: StoryArc[],
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>,
  marketVolatility: MarketVolatility
): EventQueue => {
  const MIN_TOTAL_EVENTS = 5;
  const currentEventCount = 
    (queue.priorityEvent ? 1 : 0) + 
    queue.optionalEvents.length;

  if (currentEventCount >= MIN_TOTAL_EVENTS) {
    return queue; // Sufficient events
  }

  // Need more events - generate them
  return processWeeklyQueue(
    queue,
    allEvents,
    arcs,
    playerStats,
    npcs,
    worldFlags,
    marketVolatility
  );
};

/**
 * Get the next event player should see.
 * Prioritizes: PRIORITY → High-priority optional → Regular optional
 */
export const getNextEvent = (
  queue: EventQueue,
  allEvents: Map<string, StoryEvent>
): QueuedEvent | null => {
  // Priority event always comes first
  if (queue.priorityEvent) {
    return queue.priorityEvent;
  }

  // Sort optional events by priority
  const sortedOptional = [...queue.optionalEvents].sort((a, b) => 
    (b.priority || 0) - (a.priority || 0)
  );

  return sortedOptional[0] || null;
};

/**
 * Mark an event as viewed (for tracking, doesn't remove it).
 */
export const markEventViewed = (
  queue: EventQueue,
  eventId: string
): EventQueue => {
  // This is a soft mark - event stays in queue until completed
  // Could add a viewedEvents array to EventQueue if needed
  return queue;
};
