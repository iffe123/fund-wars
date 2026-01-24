/**
 * Investment Committee (IC) Pitch System Types
 *
 * This module defines all types for the IC feature where players defend
 * their investment thesis in a Socratic interrogation by AI-powered partners.
 */

import type { PortfolioCompany, DDInsight, PlayerLevel } from '../../../types';

// ==================== IC PARTNER TYPES ====================

export type ICPartnerType = 'risk_hawk' | 'operator' | 'returns_maximalist' | 'sage';

export type ICPartnerFocus =
  | 'leverage'
  | 'covenants'
  | 'downside_scenarios'
  | 'macro_risk'
  | 'operations'
  | 'management'
  | 'value_creation'
  | 'industry_dynamics'
  | 'valuation'
  | 'returns'
  | 'deal_dynamics'
  | 'exit_multiples'
  | 'strategy'
  | 'thesis_fit'
  | 'reputation'
  | 'long_term_value';

export type CritiqueStyle =
  | 'silence_then_scalpel'   // Long pause, then surgical question
  | 'friendly_trap'           // Seems agreeable, then reveals the flaw
  | 'aggressive_challenge'    // Direct confrontation
  | 'socratic_depth';         // Questions that reveal your own blind spots

export interface ICPartner {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  role: string;
  background: string;
  speechStyle: string;
  favoriteQuestions: string[];
  dealTypeFocus: ICPartnerFocus[];
  approvalThreshold: number;  // 0-1, how hard to please
  critiqueStyle: CritiqueStyle;
  personalityQuirks: string[];
}

// ==================== IC CONVERSATION TYPES ====================

export type ICPhase =
  | 'PREP'           // Player reviewing before entering
  | 'OPENING'        // Player delivers opening pitch
  | 'INTERROGATION'  // Partners ask questions
  | 'DELIBERATION'   // Partners discuss (hidden from player)
  | 'VERDICT';       // Final decision

export interface ICMessage {
  id: string;
  partnerId?: string;    // null for player messages
  partnerName?: string;
  content: string;
  timestamp: number;
  isPlayer: boolean;
  isTyping?: boolean;    // For typing indicators
}

export interface ICQuestion {
  partnerId: string;
  partnerName: string;
  question: string;
  hiddenEvaluationCriteria: string[];  // What they're really testing
  followUpTriggers: {
    ifPlayerMentions: string[];
    thenAsk: string;
  }[];
  maxResponseCharacters: number;
  timeLimitSeconds: number;
}

// ==================== IC EVALUATION TYPES ====================

export interface PitchEvaluation {
  dimensions: {
    thesisClarity: number;      // 0-1: Is the investment thesis clear?
    financialRigor: number;     // 0-1: Do the numbers make sense?
    riskAwareness: number;      // 0-1: Do they understand what can go wrong?
    valueCreation: number;      // 0-1: Is there a credible path to returns?
    conviction: number;         // 0-1: Do they believe in this deal?
    specificity: number;        // 0-1: Do they use specific details vs. generics?
  };
  redFlags: string[];           // Specific concerns identified
  strongPoints: string[];       // What they did well
  overallScore: number;         // Weighted combination
}

export type ICVote = 'YES' | 'NO' | 'CONDITIONAL';
export type ICOutcome = 'APPROVED' | 'CONDITIONALLY_APPROVED' | 'TABLED' | 'REJECTED';
export type DealOutcome = 'PROCEED' | 'RENEGOTIATE' | 'WALK_AWAY';

export interface ICPartnerVote {
  partnerId: string;
  partnerName: string;
  vote: ICVote;
  reasoning: string;
  respectChange: number;  // -10 to +10, affects future IC meetings
}

export interface ICVerdict {
  outcome: ICOutcome;
  partnerVotes: ICPartnerVote[];
  conditions?: string[];        // If conditionally approved
  feedback: {
    strengths: string[];
    weaknesses: string[];
    specificAdvice: string;
  };
  consequences: {
    dealOutcome: DealOutcome;
    reputationChange: number;
    skillPointsEarned: Record<string, number>;
  };
}

// ==================== IC SESSION TYPES ====================

export interface ICPreparation {
  deal: PortfolioCompany;
  playerNotes: string[];          // Optional prep notes player can write
  ddCompleted: DDInsight[];       // From earlier due diligence
  modelOutputs: {
    entryMultiple: number;
    exitMultiple: number;
    irr: number;
    leverage: number;
    equityCheck: number;
  };
  timeLimitMinutes: number;       // IC meetings are timed!
}

export interface ICSession {
  id: string;
  deal: PortfolioCompany;
  phase: ICPhase;
  partners: ICPartner[];
  messages: ICMessage[];
  openingPitch?: string;
  playerResponses: string[];
  currentQuestionIndex: number;
  startTime: number;
  evaluation?: PitchEvaluation;
  verdict?: ICVerdict;
  timeRemaining: number;          // Seconds
}

// ==================== PLAYER IC HISTORY ====================

export interface PlayerICHistory {
  currentLevel: PlayerLevel;
  meetingsAttended: number;
  identifiedWeaknesses: string[];
  impressedCount: number;
  partnerRelationships: Record<string, PartnerRelationship>;
}

export interface PartnerRelationship {
  partnerId: string;
  meetingsAttended: number;
  timesImpressed: number;
  timesDisappointed: number;
  knownWeaknesses: string[];     // Things they've failed on before
  currentRespect: number;         // -100 to +100
}

// ==================== IC CONTEXT FOR AI ====================

export interface ICContext {
  deal: PortfolioCompany;
  playerHistory: PlayerICHistory;
  currentPhase: ICPhase;
  conversationHistory: ICMessage[];
  openingPitch?: string;
  marketConditions?: string;
}

// ==================== UI STATE TYPES ====================

export interface ICUIState {
  isOpen: boolean;
  isLoading: boolean;
  error?: string;
  currentPartner?: ICPartner;
  showVerdict: boolean;
  timerActive: boolean;
  partnerMoods: Record<string, PartnerMood>;
}

export type PartnerMood = 'NEUTRAL' | 'SKEPTICAL' | 'INTERESTED' | 'IMPRESSED' | 'CONCERNED' | 'HOSTILE';

// ==================== IC HOOK RETURN TYPES ====================

export interface UseICConversationReturn {
  session: ICSession | null;
  uiState: ICUIState;
  startSession: (deal: PortfolioCompany) => void;
  submitOpeningPitch: (pitch: string) => Promise<void>;
  submitResponse: (response: string) => Promise<void>;
  endSession: () => void;
  acceptVerdict: () => void;
  pushBackOnVerdict: () => Promise<void>;
}

export interface UseICTimerReturn {
  timeRemaining: number;
  isExpired: boolean;
  formattedTime: string;
  startTimer: (seconds: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

// ==================== CONSTANTS ====================

export const IC_CONSTANTS = {
  MAX_OPENING_PITCH_CHARS: 1500,
  MAX_RESPONSE_CHARS: 800,
  OPENING_PITCH_TIME_SECONDS: 180,
  RESPONSE_TIME_SECONDS: 90,
  MIN_QUESTIONS: 4,
  MAX_QUESTIONS: 6,
  DEFAULT_PARTNERS_COUNT: 4,
} as const;
