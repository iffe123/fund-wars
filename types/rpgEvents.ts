/**
 * RPG Event System Types
 * 
 * This file defines the core types for the event-driven narrative RPG system.
 * The system is designed around:
 * - Weekly "episodes" with priority and optional events
 * - Story arcs that span multiple weeks
 * - Consequential choices that chain together
 * - NPC evolution based on player decisions
 */

import type { 
  StatChanges, 
  PortfolioCompany, 
  PlayerLevel, 
  NPC, 
  MarketVolatility,
  Faction 
} from '../types';

// ============================================================================
// CORE EVENT TYPES
// ============================================================================

export type EventType = 'PRIORITY' | 'OPTIONAL' | 'BACKGROUND';
export type EventCategory = 'DEAL' | 'NPC' | 'CRISIS' | 'OPPORTUNITY' | 'PERSONAL' | 'CAREER' | 'MARKET';
export type EventStakes = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ChoiceAlignment = 'RUTHLESS' | 'DIPLOMATIC' | 'CAUTIOUS' | 'BOLD' | 'ETHICAL' | 'NEUTRAL';

/**
 * Mentor guidance shown during tutorial/onboarding events
 */
export interface MentorGuidance {
  character: 'machiavelli' | 'sarah' | 'system';
  message: string;        // Main guidance message
  tip?: string;           // Optional game mechanic tip
  highlight?: boolean;    // Whether to visually emphasize this guidance
}

/**
 * Guided action to highlight UI elements during tutorial
 */
export interface GuidedAction {
  targetElement: string;  // CSS selector for element to highlight
  pulseColor?: 'amber' | 'cyan' | 'blue' | 'emerald' | 'purple';
  tooltip?: string;       // Optional tooltip to show near element
  autoAdvance?: boolean;  // Auto-advance when element is clicked
}

/**
 * A Story Event is the core unit of narrative gameplay.
 * Every week, players face events that require choices with consequences.
 */
export interface StoryEvent {
  id: string;
  type: EventType;
  category: EventCategory;

  // === NARRATIVE ELEMENTS ===
  title: string;
  hook: string;           // Opening dramatic line (shown in preview)
  description: string;    // Full situation description
  context?: string;       // Why this matters now (optional flavor)

  // === SOURCE AND PARTICIPANTS ===
  sourceNpcId?: string;   // Who is bringing this to the player
  involvedNpcs: string[]; // NPCs involved in this event
  involvedCompanies: number[]; // Portfolio company IDs involved

  // === STAKES AND URGENCY ===
  stakes: EventStakes;
  expiresInWeeks?: number; // How many weeks before this auto-resolves
  autoResolveChoiceId?: string; // Which choice triggers if time runs out

  // === GATING CONDITIONS ===
  requirements?: EventRequirements;

  // === PLAYER CHOICES ===
  choices: EventChoice[];

  // === STORY ARC CONNECTION ===
  triggerArcId?: string;  // Story arc this event belongs to
  arcStage?: number;      // Which stage of the arc

  // === AI ADVISOR HINTS ===
  advisorHints?: {
    machiavelli?: string; // Strategic advice
    sarah?: string;       // Analytical perspective
  };

  // === MENTOR/TUTORIAL GUIDANCE ===
  mentorGuidance?: MentorGuidance; // Onboarding guidance for new players
  isOnboarding?: boolean;          // Marks this as a tutorial event

  // === UI/UX ===
  backgroundImage?: string;
  ambientSound?: string;
  dramaticPause?: boolean; // Adds dramatic reveal animation
}

/**
 * Requirements that must be met for an event to be available.
 */
export interface EventRequirements {
  // Time-based
  minWeek?: number;
  maxWeek?: number;
  dayType?: 'WEEKDAY' | 'WEEKEND';
  timeSlot?: 'MORNING' | 'AFTERNOON' | 'EVENING';
  
  // Player stats
  minReputation?: number;
  maxReputation?: number;
  minCash?: number;
  minLevel?: PlayerLevel;
  maxLevel?: PlayerLevel;
  
  // Flags and state
  requiredFlags?: string[];
  blockedByFlags?: string[];
  
  // NPC relationships
  npcRelationships?: Array<{
    npcId: string;
    minRelationship?: number;
    maxRelationship?: number;
    minTrust?: number;
  }>;
  
  // Portfolio requirements
  minPortfolioSize?: number;
  hasCompanyInStatus?: 'PIPELINE' | 'OWNED' | 'EXITING';
  
  // Market conditions
  allowedVolatility?: MarketVolatility[];
  
  // Previous events
  completedEvents?: string[];
  notCompletedEvents?: string[];
  
  // Arc state
  arcState?: {
    arcId: string;
    minStage?: number;
    maxStage?: number;
  };
}

/**
 * A choice the player can make in response to an event.
 */
export interface EventChoice {
  id: string;
  label: string;
  description: string;
  
  // === PERSONALITY AND ALIGNMENT ===
  alignment?: ChoiceAlignment;
  
  // === UNLOCK REQUIREMENTS ===
  requires?: ChoiceRequirements;
  
  // === RISK MECHANICS ===
  successChance?: number;  // 0-100, undefined = guaranteed success
  skillCheck?: SkillCheck;
  
  // === CONSEQUENCES ===
  consequences: EventConsequences;
  
  // === NARRATIVE FLOW ===
  triggersEvents?: Array<{
    eventId: string;
    delayWeeks?: number;
    probability?: number; // 0-100, defaults to 100
  }>;
  advancesArc?: {
    arcId: string;
    toStage: number;
  };
  
  // === DIALOGUE ===
  playerLine?: string;        // What the player says
  immediateResponse?: string; // NPC's immediate reaction
  epilogue?: string;          // Narrative wrap-up text
  
  // === UI ===
  icon?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  requiresConfirmation?: boolean;
}

/**
 * Requirements to unlock a specific choice option.
 */
export interface ChoiceRequirements {
  // Stats
  stat?: {
    name: 'reputation' | 'cash' | 'financialEngineering' | 'ethics' | 'stress';
    min?: number;
    max?: number;
  };
  
  // Flags
  flag?: string;
  notFlag?: string;
  
  // NPC relationship
  npcRelationship?: {
    npcId: string;
    min?: number;
  };
  
  // Skills
  skill?: {
    name: string;
    min: number;
  };
  
  // Level
  minLevel?: PlayerLevel;
  
  // Custom check (evaluated at runtime)
  customCheck?: string; // ID of custom check function
}

/**
 * Skill check mechanics for risky choices.
 */
export interface SkillCheck {
  skill: 'financialEngineering' | 'reputation' | 'analystRating' | 'ethics';
  threshold: number;
  
  // Optional dice roll component
  rollBonus?: number; // Added to skill before comparing to threshold
  
  // Outcomes
  successConsequences?: Partial<EventConsequences>;
  failureConsequences?: Partial<EventConsequences>;
  criticalSuccessThreshold?: number; // If roll exceeds this, extra bonus
  criticalFailureThreshold?: number; // If roll below this, extra penalty
}

/**
 * All possible consequences of a choice.
 */
export interface EventConsequences {
  // === STAT CHANGES ===
  stats?: Partial<StatChanges>;

  // === NPC EFFECTS ===
  npcEffects?: NPCEffect[];

  // === WORLD STATE ===
  setsFlags?: string[];
  clearsFlags?: string[];

  // === COMPANY EFFECTS ===
  companyEffects?: CompanyEffect[];

  // === FUTURE EVENTS ===
  queuesEvent?: {
    eventId: string;
    delayWeeks: number;
    probability?: number;
  };
  blocksEvents?: string[];

  // === ARC PROGRESSION ===
  advancesArc?: {
    arcId: string;
    toStage: number;
  };
  failsArc?: string;

  // === UI FEEDBACK ===
  notification?: {
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  };
  logMessage?: string;

  // === GUIDED UI ACTIONS (Tutorial) ===
  guidedAction?: GuidedAction;  // Highlight UI elements after choice
  switchToTab?: 'ASSETS' | 'COMMS' | 'NEWS' | 'SYSTEM'; // Auto-switch tab

  // === ACHIEVEMENTS ===
  unlockAchievement?: string;
}

/**
 * Effect on an NPC from a choice.
 */
export interface NPCEffect {
  npcId: string;
  relationship?: number;
  trust?: number;
  mood?: number;
  memory: string;
  
  // Special effects
  revealsSecret?: string;  // Secret ID to reveal
  unlocksArc?: string;     // NPC arc to unlock
  evolutionTrigger?: string; // Trigger NPC evolution
  
  // Faction ripple effects
  factionReputation?: Partial<Record<Faction, number>>;
}

/**
 * Effect on a portfolio company from a choice.
 */
export interface CompanyEffect {
  companyId: number;
  changes: Partial<PortfolioCompany>;
}

// ============================================================================
// STORY ARC TYPES
// ============================================================================

export type ArcCategory = 'MAIN' | 'NPC' | 'COMPANY' | 'CAREER' | 'PERSONAL' | 'RIVAL';
export type ArcState = 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
export type ArcEndingType = 'VICTORY' | 'DEFEAT' | 'NEUTRAL' | 'PYRRHIC' | 'SECRET';

/**
 * A Story Arc is a multi-week narrative that progresses based on player choices.
 */
export interface StoryArc {
  id: string;
  title: string;
  description: string;
  teaser: string; // Shown when arc is available but not started
  
  // === METADATA ===
  category: ArcCategory;
  priority: number; // Higher = more likely to spawn events (1-10)
  estimatedWeeks: number; // Approximate length
  
  // === UNLOCK CONDITIONS ===
  unlockConditions: ArcUnlockConditions;
  
  // === STAGES ===
  stages: ArcStage[];
  
  // === STATE ===
  state: ArcState;
  currentStage: number;
  startedWeek?: number;
  completedWeek?: number;
  
  // === ENDINGS ===
  possibleEndings: ArcEnding[];
  chosenEnding?: string; // ID of the ending that was triggered
  
  // === CHARACTERS ===
  primaryNpcs: string[];
  involvedCompanies?: number[];
  
  // === PLAYER TRACKING ===
  playerChoices: string[]; // IDs of choices made in this arc
  keyMoments: ArcMoment[]; // Notable moments for recap
}

/**
 * Conditions required to unlock a story arc.
 */
export interface ArcUnlockConditions {
  minWeek?: number;
  requiredFlags?: string[];
  blockedByFlags?: string[];
  requiredLevel?: PlayerLevel;
  npcRelationship?: { npcId: string; min: number };
  completedArcs?: string[];
  failedArcs?: string[];
  minReputation?: number;
  minCash?: number;
}

/**
 * A stage within a story arc.
 */
export interface ArcStage {
  stage: number;
  title: string;
  description: string;
  
  // Events that can fire at this stage
  events: string[];
  
  // How to advance
  advanceConditions: {
    completedEvents?: string[]; // Must complete these events
    anyEvents?: string[];       // Must complete at least one
    requiredFlags?: string[];   // Must have these flags
    autoAdvanceWeeks?: number;  // Auto-advance after X weeks if not progressed
  };
  
  // Timeout handling
  timeoutEvent?: string; // Event to fire if auto-advancing
  timeoutConsequences?: Partial<EventConsequences>;
}

/**
 * A possible ending for a story arc.
 */
export interface ArcEnding {
  id: string;
  title: string;
  type: ArcEndingType;
  
  // What triggers this ending
  conditions: {
    requiredFlags: string[];
    requiredChoices?: string[];
    npcRelationship?: { npcId: string; min?: number; max?: number };
  };
  
  // Consequences
  rewards?: Partial<EventConsequences>;
  penalties?: Partial<EventConsequences>;
  
  // Narrative
  epilogue: string;
  cinematicId?: string; // Optional special ending cinematic
  
  // Unlocks
  unlocksArcs?: string[];
  achievementId?: string;
}

/**
 * A notable moment in an arc (for recap/summary).
 */
export interface ArcMoment {
  week: number;
  eventId: string;
  choiceId: string;
  summary: string;
  impact: 'MINOR' | 'SIGNIFICANT' | 'PIVOTAL';
}

// ============================================================================
// NPC EVOLUTION TYPES
// ============================================================================

export type NPCMood = 'FRIENDLY' | 'NEUTRAL' | 'COLD' | 'HOSTILE' | 'GRATEFUL' | 'SUSPICIOUS';

/**
 * Extended NPC with evolution and story capabilities.
 */
export interface RPGEnhancedNPC extends NPC {
  // === STORY ELEMENTS ===
  personalArc?: string; // ID of their personal arc
  arcProgress?: number;
  
  // === SECRETS ===
  secrets: NPCSecret[];
  
  // === AGENDA ===
  agenda: NPCAgenda;
  
  // === EVOLUTION ===
  evolutionStage: number; // 0-4
  evolutionPath: string; // Which evolution path they're on
  evolutionPoints: string[]; // Key decisions that shaped them
  
  // === DYNAMIC STATE ===
  currentMood: NPCMood;
  willingness: number; // 0-100
  lastInteractionWeek: number;
  interactionCount: number;
  
  // === DIALOGUE ===
  availableTopics: string[];
  revealedSecrets: string[];
  
  // === RELATIONSHIP DYNAMICS ===
  rivalNpcs?: string[];
  allyNpcs?: string[];
}

/**
 * A secret an NPC can reveal at high trust.
 */
export interface NPCSecret {
  id: string;
  title: string;
  content: string;
  requiredTrust: number;
  requiredFlags?: string[];
  revealed: boolean;
  
  // What revealing does
  impactOnReveal?: Partial<EventConsequences>;
  unlocksEvent?: string;
  unlocksChoice?: { eventId: string; choiceId: string };
}

/**
 * An NPC's personal agenda and motivations.
 */
export interface NPCAgenda {
  primary: string;   // Their main goal
  secondary: string; // Secondary motivation
  fears: string;     // What they're avoiding
  
  // Alignment with player (-100 to 100)
  alignment: number;
  
  // Betrayal conditions
  betrayalConditions?: {
    trustBelow?: number;
    requiredFlags?: string[];
    consequence: string; // Event ID to trigger
  };
  
  // Help conditions (when they'll go out of their way)
  helpConditions?: {
    trustAbove?: number;
    requiredFlags?: string[];
    bonus: string; // Event ID they'll trigger to help
  };
}

/**
 * Evolution stage definition for an NPC.
 */
export interface NPCEvolutionStage {
  stage: number;
  title: string;
  description: string;
  
  // What this stage unlocks
  unlocks: string[]; // Features/abilities unlocked
  
  // How to reach this stage
  triggers: Array<{
    eventId?: string;
    choiceId?: string;
    trustThreshold?: number;
    requiredFlags?: string[];
  }>;
  
  // Character changes
  traitChanges?: string[];
  moodDefault?: NPCMood;
}

// ============================================================================
// EVENT QUEUE SYSTEM
// ============================================================================

/**
 * The master event queue that manages all active and upcoming events.
 */
export interface EventQueue {
  // Current week's events
  priorityEvent?: QueuedEvent;
  optionalEvents: QueuedEvent[];
  backgroundEvents: QueuedEvent[];
  
  // Future scheduled events
  scheduledEvents: ScheduledEvent[];
  
  // Event history
  completedEvents: CompletedEvent[];
  expiredEvents: ExpiredEvent[];
  
  // Processing state
  currentWeek: number;
  processingEvent?: string;
}

/**
 * An event that's currently available to the player.
 */
export interface QueuedEvent {
  eventId: string;
  addedWeek: number;
  expiresWeek?: number;
  source: 'ARC' | 'RANDOM' | 'CONSEQUENCE' | 'SCHEDULED';
  arcId?: string;
  priority: number;
}

/**
 * An event scheduled for a future week.
 */
export interface ScheduledEvent {
  eventId: string;
  triggerWeek: number;
  probability: number; // 0-100
  source: string; // What triggered this scheduling
  sourceChoiceId?: string;
}

/**
 * Record of a completed event.
 */
export interface CompletedEvent {
  eventId: string;
  choiceId: string;
  week: number;
  consequences: Partial<EventConsequences>;
  arcId?: string;
}

/**
 * Record of an expired event.
 */
export interface ExpiredEvent {
  eventId: string;
  expiredWeek: number;
  autoResolved: boolean;
  autoChoiceId?: string;
}

// ============================================================================
// GAME STATE EXTENSIONS
// ============================================================================

/**
 * Extended game state for RPG system.
 */
export interface RPGGameState {
  // Event system
  eventQueue: EventQueue;
  
  // Story arcs
  activeArcs: string[];
  completedArcs: string[];
  failedArcs: string[];
  
  // Weekly state
  currentWeekPhase: WeekPhase;
  weeklyChoicesMade: number;
  
  // NPC evolution
  npcEvolutions: Record<string, number>; // NPC ID -> evolution stage
  
  // World flags (enhanced)
  worldFlags: Set<string>;
  flagHistory: Array<{ flag: string; week: number; source: string }>;
  
  // Karma/alignment tracking
  alignmentScores: Record<ChoiceAlignment, number>;
  dominantAlignment?: ChoiceAlignment;
}

export type WeekPhase = 
  | 'MORNING_BRIEFING'  // See what's happening this week
  | 'PRIORITY_EVENT'    // Handle the mandatory event
  | 'OPTIONAL_PHASE'    // Choose optional activities
  | 'FALLOUT'           // See consequences
  | 'WEEK_END';         // Transition to next week

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Result of processing a player choice.
 */
export interface ChoiceResult {
  success: boolean;
  skillCheckResult?: {
    rolled: number;
    threshold: number;
    passed: boolean;
    critical: boolean;
  };
  consequences: EventConsequences;
  narrative: {
    playerLine?: string;
    response?: string;
    epilogue?: string;
  };
  triggeredEvents: string[];
  arcProgression?: { arcId: string; newStage: number };
}

/**
 * Weekly summary shown to player.
 */
export interface WeeklySummary {
  week: number;
  priorityEventTitle?: string;
  priorityChoice?: string;
  optionalEventsHandled: number;
  keyConsequences: string[];
  arcProgressions: Array<{ arcTitle: string; newStage: string }>;
  npcChanges: Array<{ npcName: string; change: 'IMPROVED' | 'WORSENED' | 'EVOLVED' }>;
  nextWeekTeaser?: string;
}
