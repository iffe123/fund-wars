import {
  PlayerStats, NPC, Scenario, GamePhase, Difficulty, MarketVolatility,
  Warning, NPCDrama, CompanyActiveEvent, RivalFund, CompetitiveDeal,
  AIState, StatChanges, ActionType
} from '../types';
import type { ActivityItem } from '../components/ActivityFeed';
import type { BlueprintAIState } from '../types/aiBlueprint';

export interface GameState {
  playerStats: PlayerStats | null;
  npcs: NPC[];
  activeScenario: Scenario | null;
  gamePhase: GamePhase;
  difficulty: Difficulty | null;
  marketVolatility: MarketVolatility;
  tutorialStep: number;
  actionLog: string[];
  activities: ActivityItem[]; // RPG flow: activity feed

  // Living World
  activeWarnings: Warning[];
  activeDrama: NPCDrama | null;
  activeCompanyEvent: CompanyActiveEvent | null;
  eventQueue: CompanyActiveEvent[];
  pendingDecision: { event: CompanyActiveEvent | NPCDrama; awaitingAdvisorResponse: boolean } | null;

  // Rivals & Deals
  rivalFunds: RivalFund[];
  activeDeals: CompetitiveDeal[];
  aiState: AIState;

  // AI Blueprint Systems
  blueprintAI: BlueprintAIState;
}

export type GameAction =
  | { type: 'SET_GAME_PHASE'; payload: GamePhase }
  | { type: 'UPDATE_PLAYER_STATS'; payload: StatChanges }
  | { type: 'SET_NPCS'; payload: NPC[] }
  | { type: 'UPDATE_NPC'; payload: { id: string; updates: Partial<NPC> } }
  | { type: 'ADD_LOG_ENTRY'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: ActivityItem } // RPG flow: add activity
  | { type: 'SET_TUTORIAL_STEP'; payload: number }
  | { type: 'ADVANCE_TIME'; payload: void } // Logic moved to reducer or thunk? Reducer can handle state updates.
  | { type: 'SET_ACTIVE_SCENARIO'; payload: Scenario | null }
  | { type: 'SET_MARKET_VOLATILITY'; payload: MarketVolatility }
  // Living World
  | { type: 'ADD_WARNING'; payload: Warning }
  | { type: 'DISMISS_WARNING'; payload: string }
  | { type: 'SET_ACTIVE_DRAMA'; payload: NPCDrama | null }
  | { type: 'SET_ACTIVE_COMPANY_EVENT'; payload: CompanyActiveEvent | null }
  | { type: 'SET_EVENT_QUEUE'; payload: CompanyActiveEvent[] }
  | { type: 'SET_PENDING_DECISION'; payload: { event: CompanyActiveEvent | NPCDrama; awaitingAdvisorResponse: boolean } | null }
  // Rivals
  | { type: 'SET_RIVAL_FUNDS'; payload: RivalFund[] }
  | { type: 'UPDATE_RIVAL_FUND'; payload: { id: string; updates: Partial<RivalFund> } }
  | { type: 'SET_ACTIVE_DEALS'; payload: CompetitiveDeal[] }
  | { type: 'ADD_DEAL'; payload: CompetitiveDeal }
  | { type: 'REMOVE_DEAL'; payload: number }
  | { type: 'SET_AI_STATE'; payload: AIState }
  | { type: 'RESET_GAME'; payload: void }
  | { type: 'LOAD_GAME'; payload: GameState }
  // Action System
  | { type: 'CONSUME_ACTION'; payload: { cost: number; actionType?: ActionType; targetId?: string } }
  | { type: 'END_WEEK'; payload: void }
  | { type: 'TOGGLE_NIGHT_GRINDER'; payload: void }
  // AI Blueprint Systems
  | { type: 'SET_BLUEPRINT_AI'; payload: BlueprintAIState }
  | { type: 'UPDATE_BLUEPRINT_AI'; payload: Partial<BlueprintAIState> }
  | { type: 'ADD_VOICE_INTERJECTION'; payload: import('../types/aiBlueprint').VoiceInterjection }
  | { type: 'DISMISS_INTERJECTION'; payload: import('../types/aiBlueprint').InnerVoiceId }
  | { type: 'SUPPRESS_VOICE'; payload: import('../types/aiBlueprint').InnerVoiceId }
  | { type: 'UNSUPPRESS_VOICE'; payload: import('../types/aiBlueprint').InnerVoiceId }
  | { type: 'SET_NEWSPAPER'; payload: import('../types/aiBlueprint').WeeklyNewspaper }
  | { type: 'MARK_NEWSPAPER_READ'; payload: void }
  | { type: 'ADD_CRISIS'; payload: import('../types/aiBlueprint').CrisisEvent }
  | { type: 'RESOLVE_CRISIS'; payload: { crisisId: string; responseId: string } }
  | { type: 'ADD_GOSSIP'; payload: import('../types/aiBlueprint').GossipEvent }
  | { type: 'PROCESS_GOSSIP_TICK'; payload: void }
  | { type: 'SET_FORENSIC_AUTOPSY'; payload: import('../types/aiBlueprint').ForensicAutopsy | null }
  | { type: 'PIN_EVIDENCE'; payload: string }
  | { type: 'UNPIN_EVIDENCE'; payload: string };
