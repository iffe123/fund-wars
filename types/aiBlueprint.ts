/**
 * AI Blueprint Types
 *
 * Type definitions for the seven AI systems that make Fund Wars' AI
 * the nervous system of the game, not just its voice.
 */

import type { PlayerStats, NPC, PortfolioCompany, ExitResult, MarketVolatility, IndustrySector } from '../types';

// ==================== 1. INNER MONOLOGUE SYSTEM ====================

export type InnerVoiceId = 'greed' | 'paranoia' | 'empathy' | 'ego' | 'burnout';

export interface InnerVoice {
  id: InnerVoiceId;
  name: string;
  linkedStat: keyof Pick<PlayerStats, 'cash' | 'reputation' | 'ethics' | 'stress' | 'analystRating'>;
  activationThreshold: number;
  currentIntensity: number; // 0-100, how loud/frequent
  suppressionCost: { stress: number; ethics?: number };
  systemPrompt: string;
  isActive: boolean;
  isSuppressed: boolean;
  lastSpokeTick: number;
  speakCooldown: number; // minimum ticks between interjections
}

export interface InnerMonologueState {
  voices: InnerVoice[];
  activeInterjections: VoiceInterjection[];
  suppressedVoices: InnerVoiceId[];
  totalSuppressionsThisGame: number;
}

export interface VoiceInterjection {
  voiceId: InnerVoiceId;
  text: string;
  trigger: string;
  tick: number;
  unlocksChoice?: string; // Optional hidden choice text this voice reveals
  dismissed: boolean;
}

// ==================== 2. LIVING NEWSPAPER SYSTEM ====================

export interface WeeklyNewspaper {
  edition: number;
  week: number;
  masthead: string;
  leadStory: NewspaperArticle;
  marketColumn: NewspaperArticle;
  gossipSection: NewspaperArticle;
  editorialCartoon: string; // ASCII art description
  letterToEditor: string;
  corrections: string[];
  isRead: boolean;
}

export interface NewspaperArticle {
  headline: string;
  byline: string;
  body: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'satirical';
  referencesPlayer: boolean;
  referencedNpcs: string[];
  referencedDeals: number[];
}

// ==================== 3. UNRELIABLE ADVISOR SYSTEM ====================

export type MachiavelliLoyalty = 'FIRM' | 'PLAYER' | 'SELF';

export interface MachiavelliState {
  apparentLoyalty: number; // What the player sees (always ~70-80)
  actualLoyalty: MachiavelliLoyalty;
  trustworthinessThisWeek: number; // 0-100, affects advice quality
  hiddenAgenda: string;
  contradictionCount: number; // How many times player caught bad advice
  unmasked: boolean; // Player figured it out
  blindSpots: string[]; // Topics where he subtly misdirects
  agendaHistory: Array<{ week: number; agenda: string; wasDetected: boolean }>;
}

// ==================== 4. INFORMATION ECONOMY SYSTEM ====================

export interface Fact {
  id: string;
  content: string;
  reliability: number; // 0-100, how accurate
  source: string;
  discoveredTick: number;
  expiresAt?: number; // Some intel goes stale
  contradicts?: string[]; // IDs of facts this conflicts with
  category: 'deal' | 'npc' | 'market' | 'internal' | 'rival';
  isVerified: boolean;
}

export interface NPCKnowledge {
  npcId: string;
  knownFacts: Fact[];
  willingToShare: string[]; // Fact IDs, filtered by trust level
  wantsInReturn: ('favor' | 'information' | 'protection' | 'money')[];
  liesAbout: string[];
  leaksTo: string[]; // NPC IDs they gossip to
}

export interface InformationEconomyState {
  playerKnownFacts: Fact[];
  npcKnowledgeGraphs: Record<string, NPCKnowledge>;
  activeTradeOffers: InformationTrade[];
  factVerificationLog: Array<{ factId: string; verifiedAt: number; wasAccurate: boolean }>;
}

export interface InformationTrade {
  id: string;
  fromNpc: string;
  offeredFacts: string[]; // Fact IDs
  requestedInReturn: string; // What they want
  expiresAt: number;
  accepted: boolean;
}

// ==================== 5. DEAL AUTOPSY (ENHANCED) ====================

export interface EvidenceItem {
  id: string;
  category: 'financial' | 'operational' | 'market' | 'management' | 'strategic';
  title: string;
  description: string;
  data?: string; // Specific numbers or quotes
  strength: 'weak' | 'moderate' | 'strong';
  isRedHerring: boolean;
}

export interface ForensicExaminer {
  name: string;
  role: string;
  focusArea: string;
  personality: string;
  satisfactionScore: number; // 0-100
}

export interface ForensicAutopsy {
  dealId: number;
  evidence: EvidenceItem[];
  pinnedEvidence: string[]; // Player's chosen items (max 3)
  committeeMembers: ForensicExaminer[];
  phases: ('timeline_review' | 'numbers_drill' | 'judgment_call' | 'verdict')[];
  currentPhase: number;
  playerDefenseLog: Array<{ question: string; response: string; score: number }>;
  finalVerdict: 'vindicated' | 'warned' | 'demoted' | 'fired' | null;
  isActive: boolean;
}

// ==================== 6. REPUTATION WEB SYSTEM ====================

export interface GossipRelay {
  from: string; // NPC ID
  to: string; // NPC ID
  mutation: string; // How this NPC changed the story
  delay: number; // Ticks before it spreads
  relayedAtTick?: number;
}

export interface GossipEvent {
  id: string;
  originalStatement: string;
  source: string; // NPC ID the player told
  chain: GossipRelay[];
  currentVersion: string; // What the gossip has mutated into
  reachedNpcs: string[];
  originTick: number;
  isActive: boolean;
}

export interface ReputationWebState {
  activeGossip: GossipEvent[];
  gossipHistory: GossipEvent[];
  npcGossipConnections: Record<string, string[]>; // NPC ID -> who they talk to
  playerPerceivedReputation: Record<string, number>; // How each NPC sees the player
}

// ==================== 7. CHAOS ENGINE SYSTEM ====================

export type CrisisSeverity = 1 | 2 | 3 | 4 | 5;

export interface CrisisEffect {
  type: 'valuation_change' | 'margin_compression' | 'revenue_impact' | 'stress_change' | 'reputation_change' | 'market_shift';
  magnitude: number;
  affectedCompanyIds?: number[];
  description: string;
}

export interface CrisisResponse {
  id: string;
  label: string;
  description: string;
  requiredStat?: { stat: keyof PlayerStats; minValue: number };
  effects: CrisisEffect[];
  narrativeOutcome: string;
}

export interface CrisisEvent {
  id: string;
  headline: string;
  briefing: string;
  severity: CrisisSeverity;
  affectedSectors: IndustrySector[];
  immediateEffects: CrisisEffect[];
  delayedEffects: CrisisEffect[]; // Trigger 2-4 weeks later
  playerResponseWindow: number; // Ticks before it's too late
  aiGeneratedBriefing: string;
  possibleResponses: CrisisResponse[];
  cascadesInto?: string[]; // IDs of follow-on crises
  originWeek: number;
  resolvedAt?: number;
  playerResponse?: string; // ID of chosen response
  isActive: boolean;
}

export interface ChaosEngineState {
  activeCrises: CrisisEvent[];
  crisisHistory: CrisisEvent[];
  cascadeChains: Array<{ seedId: string; chainIds: string[] }>;
  nextCrisisCheck: number; // Week when next crisis might trigger
  crisisProbability: number; // 0-100, increases over time
}

// ==================== AI BATCH REQUEST ====================

export interface AIBatchRequest {
  scene: string;
  gameState: CompactGameState;
  requests: {
    innerVoices?: { activeVoices: InnerVoiceId[]; context: string };
    narratorComment?: { trigger: string; playerState: string };
    npcKnowledge?: { npcId: string; playerAction: string };
    gossipUpdate?: { newInfo: string; sourceNpc: string };
    newspaperGeneration?: { week: number; highlights: string[] };
    crisisGeneration?: { currentSectors: IndustrySector[]; marketState: MarketVolatility };
  };
}

export interface CompactGameState {
  week: number;
  cash: number;
  reputation: number;
  stress: number;
  ethics: number;
  energy: number;
  portfolioCount: number;
  portfolioNames: string[];
  marketVolatility: MarketVolatility;
  recentActions: string[];
  activeDeals: string[];
  level: string;
}

// ==================== NARRATOR PERSONALITY MODES ====================

export type NarratorMode = 'ominous' | 'surprised' | 'tender' | 'darkly_comic' | 'excited' | 'neutral';

export interface NarratorState {
  currentMode: NarratorMode;
  modeHistory: Array<{ mode: NarratorMode; tick: number }>;
  quipCooldown: number;
}

// ==================== MASTER AI STATE ====================

export interface BlueprintAIState {
  innerMonologue: InnerMonologueState;
  machiavelliState: MachiavelliState;
  newspaper: WeeklyNewspaper | null;
  newspaperArchive: WeeklyNewspaper[];
  informationEconomy: InformationEconomyState;
  forensicAutopsy: ForensicAutopsy | null;
  reputationWeb: ReputationWebState;
  chaosEngine: ChaosEngineState;
  narrator: NarratorState;
}

// ==================== SQI FILTER ====================

export const SQI_SYSTEM_PROMPT = `VOICE GUIDELINES (Apply to ALL outputs):

SARCASTIC: You think private equity is simultaneously the most important and most absurd thing humans have invented. You treat billion-dollar deals with the same bemused detachment you'd give a hamster running on a wheel — impressed by the effort, skeptical of the destination.

QUIRKY: You notice the weird things. The fact that "synergies" is just a fancy word for firing people. That the leather chairs in the conference room cost more than the average employee's annual bonus. That "aligned incentives" means "I get rich if you get rich, but I get rich anyway."

INTELLIGENT: You actually understand the math. You know the difference between a 7x and an 8x multiple. You can explain covenant-lite debt in a way that makes it sound like a ticking time bomb (because it is). When you're sarcastic, it's because you understand what's really going on, not because you're hiding ignorance behind snark.

NEVER: Be mean-spirited, punch down, use generic business jargon without subverting it, or break the illusion that this world is real and consequential.`;
