/**
 * Advanced Rival AI System
 *
 * This module implements sophisticated AI behaviors for rival funds including:
 * - Adaptive difficulty based on player performance
 * - Learning system that tracks player patterns
 * - Unpredictable decision-making with psychological warfare
 * - Coalition mechanics where rivals team up
 * - Escalating vendetta system with multiple phases
 */

import type { RivalFund, PlayerStats, CompetitiveDeal, RivalStrategy, MarketVolatility, KnowledgeEntry } from '../types';
import { DealType } from '../types';

// ==================== AI BEHAVIOR TYPES ====================

export type AIPersonality = 'CALCULATING' | 'AGGRESSIVE' | 'OPPORTUNISTIC' | 'PARANOID' | 'UNPREDICTABLE';
export type VendettaPhase = 'COLD' | 'WARMING' | 'HOT' | 'BLOOD_FEUD' | 'TOTAL_WAR';
export type TacticalMove = 'POACH' | 'RUMOR' | 'COALITION' | 'SABOTAGE' | 'MARKET_MANIPULATION' | 'PSYCHOLOGICAL_WARFARE' | 'SURPRISE_BID' | 'STRATEGIC_RETREAT';

export interface PlayerPattern {
  averageBidAggressiveness: number; // 0-100, how much player overbids
  preferredSectors: string[];
  bidDropoutThreshold: number; // At what multiple player typically drops out
  riskTolerance: number; // Based on deal choices
  responseToBluffs: 'FOLDS' | 'CALLS' | 'RAISES'; // How player responds to aggressive bids
  dealClosingRate: number; // % of deals player wins
  weaknesses: string[];
  lastUpdated: number;
}

export interface AIDecision {
  action: TacticalMove;
  target?: string; // Deal ID or player
  intensity: number; // 0-100
  reasoning: string;
  successChance: number;
  riskLevel: number;
}

export interface CoalitionState {
  isActive: boolean;
  members: string[]; // Rival fund IDs
  target: 'PLAYER' | string; // Target of coalition (player or another rival)
  expiresAtTick: number;
  strength: number; // Combined aggression level
}

export interface RivalMindset {
  fundId: string;
  personality: AIPersonality;
  currentMood: 'CONFIDENT' | 'CAUTIOUS' | 'DESPERATE' | 'VENGEFUL' | 'OPPORTUNISTIC';
  fearLevel: number; // 0-100, how threatened they feel by player
  respectLevel: number; // 0-100, how much they respect player
  vendettaPhase: VendettaPhase;
  knownPlayerPatterns: Partial<PlayerPattern>;
  recentLosses: number;
  recentWins: number;
  isInCoalition: boolean;
  lastSurpriseMove: number; // Tick of last unpredictable action
}

// ==================== VENDETTA SYSTEM ====================

export const VENDETTA_THRESHOLDS: Record<VendettaPhase, { min: number; max: number }> = {
  COLD: { min: 0, max: 30 },
  WARMING: { min: 31, max: 50 },
  HOT: { min: 51, max: 70 },
  BLOOD_FEUD: { min: 71, max: 85 },
  TOTAL_WAR: { min: 86, max: 100 },
};

export const VENDETTA_BEHAVIORS: Record<VendettaPhase, { tactics: TacticalMove[]; aggressionMultiplier: number; surpriseChance: number }> = {
  COLD: {
    tactics: ['POACH', 'RUMOR'],
    aggressionMultiplier: 1.0,
    surpriseChance: 0.05,
  },
  WARMING: {
    tactics: ['POACH', 'RUMOR', 'PSYCHOLOGICAL_WARFARE'],
    aggressionMultiplier: 1.15,
    surpriseChance: 0.12,
  },
  HOT: {
    tactics: ['POACH', 'RUMOR', 'COALITION', 'PSYCHOLOGICAL_WARFARE', 'SURPRISE_BID'],
    aggressionMultiplier: 1.3,
    surpriseChance: 0.2,
  },
  BLOOD_FEUD: {
    tactics: ['POACH', 'RUMOR', 'COALITION', 'SABOTAGE', 'PSYCHOLOGICAL_WARFARE', 'SURPRISE_BID'],
    aggressionMultiplier: 1.5,
    surpriseChance: 0.3,
  },
  TOTAL_WAR: {
    tactics: ['POACH', 'RUMOR', 'COALITION', 'SABOTAGE', 'MARKET_MANIPULATION', 'PSYCHOLOGICAL_WARFARE', 'SURPRISE_BID'],
    aggressionMultiplier: 2.0,
    surpriseChance: 0.45,
  },
};

// ==================== PSYCHOLOGICAL WARFARE ====================

export const PSYCHOLOGICAL_TACTICS = [
  { id: 'INTIMIDATION', effect: 'stress', magnitude: 8, message: 'sends a thinly-veiled threat about your career' },
  { id: 'MISDIRECTION', effect: 'reputation', magnitude: -3, message: 'plants false rumors about your due diligence process' },
  { id: 'INFORMATION_LEAK', effect: 'auditRisk', magnitude: 5, message: 'leaks damaging information to regulators' },
  { id: 'SOCIAL_SABOTAGE', effect: 'relationship', magnitude: -10, message: 'poisons your relationships with key LPs' },
  { id: 'DEAL_POISONING', effect: 'dealQuality', magnitude: -20, message: 'spreads FUD about a deal you\'re pursuing' },
  { id: 'PUBLIC_HUMILIATION', effect: 'reputation', magnitude: -8, message: 'publicly questions your judgment at an industry event' },
  { id: 'RESOURCE_DRAIN', effect: 'energy', magnitude: -15, message: 'forces you into costly legal battles' },
  { id: 'ALLIANCE_BREAKING', effect: 'coalition', magnitude: -1, message: 'turns your potential allies against you' },
];

export const SURPRISE_EVENTS = [
  { id: 'HOSTILE_TAKEOVER_ATTEMPT', description: 'launches a hostile bid on one of your portfolio companies', severity: 'HIGH' },
  { id: 'TALENT_POACHING', description: 'steals your best analyst with a massive signing bonus', severity: 'MEDIUM' },
  { id: 'REGULATORY_TIP', description: 'anonymously tips off the SEC about your recent deals', severity: 'HIGH' },
  { id: 'MEDIA_HIT_PIECE', description: 'plants a negative story about you in the financial press', severity: 'MEDIUM' },
  { id: 'LP_REBELLION', description: 'convinces your LPs to reduce their commitment', severity: 'HIGH' },
  { id: 'COUNTERINTELLIGENCE', description: 'feeds you false information about a deal', severity: 'LOW' },
  { id: 'PRICE_WAR', description: 'deliberately overpays for a deal just to deny it to you', severity: 'MEDIUM' },
  { id: 'INDUSTRY_BLACKLIST', description: 'gets you quietly blacklisted from certain deal flows', severity: 'HIGH' },
];

// ==================== CORE AI FUNCTIONS ====================

/**
 * Determine the current vendetta phase based on vendetta score
 */
export function getVendettaPhase(vendettaScore: number): VendettaPhase {
  if (vendettaScore <= 30) return 'COLD';
  if (vendettaScore <= 50) return 'WARMING';
  if (vendettaScore <= 70) return 'HOT';
  if (vendettaScore <= 85) return 'BLOOD_FEUD';
  return 'TOTAL_WAR';
}

/**
 * Calculate adaptive difficulty multiplier based on player performance
 */
export function calculateAdaptiveDifficulty(playerStats: PlayerStats, rivalFunds: RivalFund[]): number {
  const playerWinRate = playerStats.portfolio.length / Math.max(1, playerStats.timeCursor / 4);
  const playerWealth = playerStats.cash + playerStats.portfolio.reduce((sum, c) => sum + c.currentValuation, 0);
  const avgRivalWealth = rivalFunds.reduce((sum, f) => sum + f.dryPowder + f.portfolio.reduce((s, p) => s + p.currentValue, 0), 0) / rivalFunds.length;

  // Base difficulty increases if player is dominating
  let difficultyMultiplier = 1.0;

  // Player winning too much? Rivals get smarter
  if (playerWinRate > 0.6) difficultyMultiplier += 0.2;
  if (playerWinRate > 0.8) difficultyMultiplier += 0.3;

  // Player way richer? Rivals get more desperate/aggressive
  if (playerWealth > avgRivalWealth * 1.5) difficultyMultiplier += 0.15;
  if (playerWealth > avgRivalWealth * 2) difficultyMultiplier += 0.25;

  // Player reputation too high? Rivals gang up
  if (playerStats.reputation > 80) difficultyMultiplier += 0.1;

  // But if player is struggling, ease up a bit
  if (playerStats.stress > 80) difficultyMultiplier -= 0.1;
  if (playerStats.cash < 10000000) difficultyMultiplier -= 0.15;

  return Math.max(0.5, Math.min(2.0, difficultyMultiplier));
}

/**
 * Learn player patterns from their behavior
 */
export function analyzePlayerPatterns(
  playerStats: PlayerStats,
  recentBids: number[],
  dealsWon: CompetitiveDeal[],
  dealsLost: CompetitiveDeal[]
): PlayerPattern {
  // Calculate bid aggressiveness
  const avgOverbid = recentBids.length > 0
    ? recentBids.reduce((sum, bid) => sum + bid, 0) / recentBids.length
    : 50;

  // Analyze sector preferences
  const sectorCounts: Record<string, number> = {};
  [...dealsWon, ...dealsLost].forEach(deal => {
    sectorCounts[deal.sector] = (sectorCounts[deal.sector] || 0) + 1;
  });
  const preferredSectors = Object.entries(sectorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([sector]) => sector);

  // Analyze risk tolerance based on portfolio
  const avgDealRisk = playerStats.portfolio.length > 0
    ? playerStats.portfolio.reduce((sum, c) => {
        const riskScore = c.dealType === DealType.VENTURE_CAPITAL ? 80 :
                          c.dealType === DealType.GROWTH_EQUITY ? 50 : 30;
        return sum + riskScore;
      }, 0) / playerStats.portfolio.length
    : 50;

  // Calculate closing rate
  const totalDeals = dealsWon.length + dealsLost.length;
  const closingRate = totalDeals > 0 ? dealsWon.length / totalDeals : 0.5;

  // Identify weaknesses
  const weaknesses: string[] = [];
  if (playerStats.stress > 70) weaknesses.push('HIGH_STRESS');
  if (playerStats.cash < 20000000) weaknesses.push('CASH_STRAPPED');
  if (playerStats.auditRisk > 50) weaknesses.push('REGULATORY_EXPOSURE');
  if (playerStats.reputation < 40) weaknesses.push('LOW_REPUTATION');
  if (avgOverbid > 70) weaknesses.push('OVERPAYS_FOR_DEALS');
  if (closingRate < 0.3) weaknesses.push('POOR_CLOSER');

  return {
    averageBidAggressiveness: avgOverbid,
    preferredSectors,
    bidDropoutThreshold: 1.2 + (avgOverbid / 100) * 0.3,
    riskTolerance: avgDealRisk,
    responseToBluffs: avgOverbid > 60 ? 'RAISES' : avgOverbid > 40 ? 'CALLS' : 'FOLDS',
    dealClosingRate: closingRate,
    weaknesses,
    lastUpdated: Date.now(),
  };
}

/**
 * Generate AI mindset for a rival fund
 */
export function generateRivalMindset(
  fund: RivalFund,
  playerStats: PlayerStats,
  knownPatterns?: Partial<PlayerPattern>
): RivalMindset {
  // Determine personality based on strategy
  let personality: AIPersonality;
  switch (fund.strategy) {
    case 'PREDATORY':
      personality = Math.random() > 0.3 ? 'AGGRESSIVE' : 'UNPREDICTABLE';
      break;
    case 'CONSERVATIVE':
      personality = Math.random() > 0.2 ? 'CALCULATING' : 'PARANOID';
      break;
    case 'OPPORTUNISTIC':
      personality = Math.random() > 0.4 ? 'OPPORTUNISTIC' : 'UNPREDICTABLE';
      break;
    default:
      personality = 'CALCULATING';
  }

  // Calculate fear and respect based on player performance
  const playerThreat = (playerStats.reputation / 100) * 0.4 +
                       (playerStats.portfolio.length / 5) * 0.3 +
                       (playerStats.cash / 100000000) * 0.3;

  const fearLevel = Math.min(100, Math.round(playerThreat * 100));
  const respectLevel = Math.min(100, Math.round(
    (playerStats.reputation / 100) * 0.5 +
    (playerStats.financialEngineering / 100) * 0.3 +
    ((playerStats.completedExits?.length || 0) / 3) * 0.2
  ) * 100);

  // Determine mood based on recent performance
  let mood: RivalMindset['currentMood'];
  if (fund.winStreak > 2) {
    mood = 'CONFIDENT';
  } else if (fund.dryPowder < fund.aum * 0.1) {
    mood = 'DESPERATE';
  } else if ((fund.vendetta || 0) > 70) {
    mood = 'VENGEFUL';
  } else if (fearLevel > 60) {
    mood = 'CAUTIOUS';
  } else {
    mood = 'OPPORTUNISTIC';
  }

  return {
    fundId: fund.id,
    personality,
    currentMood: mood,
    fearLevel,
    respectLevel,
    vendettaPhase: getVendettaPhase(fund.vendetta || 0),
    knownPlayerPatterns: knownPatterns || {},
    recentLosses: 0,
    recentWins: fund.winStreak,
    isInCoalition: false,
    lastSurpriseMove: -10,
  };
}

/**
 * Decide on a tactical move for a rival
 */
export function decideTacticalMove(
  fund: RivalFund,
  mindset: RivalMindset,
  playerStats: PlayerStats,
  activeDeals: CompetitiveDeal[],
  marketVolatility: MarketVolatility,
  currentTick: number,
  difficultyMultiplier: number
): AIDecision | null {
  const vendettaBehavior = VENDETTA_BEHAVIORS[mindset.vendettaPhase];
  const availableTactics = vendettaBehavior.tactics;

  // Check if it's time for a surprise move
  const surpriseRoll = Math.random();
  const shouldSurprise = surpriseRoll < vendettaBehavior.surpriseChance * difficultyMultiplier &&
                         (currentTick - mindset.lastSurpriseMove) > 3;

  // Calculate base action probability
  let actionChance = 0.2 + (fund.aggressionLevel / 200) + ((fund.vendetta || 0) / 250);
  actionChance *= vendettaBehavior.aggressionMultiplier;
  actionChance *= difficultyMultiplier;

  // Mood modifiers
  if (mindset.currentMood === 'VENGEFUL') actionChance += 0.15;
  if (mindset.currentMood === 'DESPERATE') actionChance += 0.2;
  if (mindset.currentMood === 'CAUTIOUS') actionChance -= 0.1;

  // Market modifiers
  if (marketVolatility === 'PANIC') actionChance += 0.1;
  if (marketVolatility === 'BULL_RUN') actionChance -= 0.05;

  // Roll for action
  if (Math.random() > actionChance && !shouldSurprise) {
    return null;
  }

  // Select tactic
  let selectedTactic: TacticalMove;
  if (shouldSurprise && availableTactics.includes('SURPRISE_BID')) {
    selectedTactic = Math.random() > 0.4 ? 'SURPRISE_BID' : 'PSYCHOLOGICAL_WARFARE';
  } else {
    // Weight tactics based on situation
    const weights: Record<TacticalMove, number> = {
      POACH: activeDeals.length > 0 ? 40 : 0,
      RUMOR: 25,
      COALITION: mindset.vendettaPhase === 'HOT' || mindset.vendettaPhase === 'BLOOD_FEUD' ? 20 : 5,
      SABOTAGE: playerStats.portfolio.length > 0 ? 15 : 0,
      MARKET_MANIPULATION: marketVolatility === 'NORMAL' ? 10 : 5,
      PSYCHOLOGICAL_WARFARE: mindset.currentMood === 'VENGEFUL' ? 30 : 15,
      SURPRISE_BID: 10,
      STRATEGIC_RETREAT: mindset.currentMood === 'DESPERATE' ? 20 : 5,
    };

    // Filter to available tactics and calculate probabilities
    const availableWeights = availableTactics.map(t => ({ tactic: t, weight: weights[t] || 0 }));
    const totalWeight = availableWeights.reduce((sum, w) => sum + w.weight, 0);

    if (totalWeight === 0) return null;

    let roll = Math.random() * totalWeight;
    selectedTactic = availableWeights[0].tactic;
    for (const { tactic, weight } of availableWeights) {
      roll -= weight;
      if (roll <= 0) {
        selectedTactic = tactic;
        break;
      }
    }
  }

  // Calculate intensity and success chance
  const intensity = Math.round(
    (fund.aggressionLevel * 0.4 + (fund.vendetta || 0) * 0.3 + Math.random() * 30) *
    (mindset.currentMood === 'VENGEFUL' ? 1.3 : 1.0)
  );

  const successChance = Math.min(0.9,
    0.3 + (fund.reputation / 200) + (intensity / 300) - (playerStats.reputation / 300)
  );

  // Generate reasoning
  const reasonings: Record<TacticalMove, string[]> = {
    POACH: [
      'sees an opportunity to steal a deal',
      'wants to deny you market access',
      'believes you\'re distracted',
    ],
    RUMOR: [
      'is undermining your reputation',
      'wants to poison your LP relationships',
      'is playing dirty politics',
    ],
    COALITION: [
      'is forming alliances against you',
      'recognizes you as the biggest threat',
      'is coordinating with other funds',
    ],
    SABOTAGE: [
      'is attacking your portfolio companies',
      'wants to create problems for your investments',
      'is going after your weakest holdings',
    ],
    MARKET_MANIPULATION: [
      'is manipulating deal flow',
      'is spreading sector-wide FUD',
      'is cornering the market on key deals',
    ],
    PSYCHOLOGICAL_WARFARE: [
      'is trying to get in your head',
      'wants to increase your stress',
      'is playing mind games',
    ],
    SURPRISE_BID: [
      'is making an unexpected aggressive move',
      'caught everyone off guard',
      'is changing their strategy dramatically',
    ],
    STRATEGIC_RETREAT: [
      'is pulling back to regroup',
      'is conserving resources',
      'is waiting for a better opportunity',
    ],
  };

  return {
    action: selectedTactic,
    target: selectedTactic === 'POACH' && activeDeals.length > 0
      ? activeDeals[Math.floor(Math.random() * activeDeals.length)].companyName
      : 'PLAYER',
    intensity,
    reasoning: reasonings[selectedTactic][Math.floor(Math.random() * reasonings[selectedTactic].length)],
    successChance,
    riskLevel: intensity > 70 ? 80 : intensity > 40 ? 50 : 30,
  };
}

/**
 * Check if rivals should form a coalition against the player
 */
export function checkCoalitionFormation(
  rivalFunds: RivalFund[],
  playerStats: PlayerStats,
  currentTick: number
): CoalitionState | null {
  // Coalition forms when player is dominating
  const playerDominance =
    (playerStats.reputation / 100) * 0.3 +
    (playerStats.portfolio.length / 5) * 0.3 +
    (playerStats.cash / 100000000) * 0.2 +
    ((playerStats.completedExits?.length || 0) / 3) * 0.2;

  if (playerDominance < 0.5) return null;

  // Calculate coalition probability
  const coalitionChance = 0.1 + (playerDominance - 0.5) * 0.4;

  if (Math.random() > coalitionChance) return null;

  // Select coalition members (rivals with high vendetta)
  const potentialMembers = rivalFunds
    .filter(f => (f.vendetta || 0) > 40)
    .sort((a, b) => (b.vendetta || 0) - (a.vendetta || 0));

  if (potentialMembers.length < 2) return null;

  const members = potentialMembers.slice(0, Math.min(3, potentialMembers.length));
  const combinedStrength = members.reduce((sum, m) => sum + m.aggressionLevel, 0) / members.length;

  return {
    isActive: true,
    members: members.map(m => m.id),
    target: 'PLAYER',
    expiresAtTick: currentTick + 8 + Math.floor(Math.random() * 4),
    strength: combinedStrength,
  };
}

/**
 * Generate a surprise event for added unpredictability
 */
export function generateSurpriseEvent(
  fund: RivalFund,
  mindset: RivalMindset,
  playerStats: PlayerStats
): { event: typeof SURPRISE_EVENTS[0]; targetDescription: string } | null {
  // Only generate surprises in heated rivalries
  if (mindset.vendettaPhase === 'COLD' || mindset.vendettaPhase === 'WARMING') {
    return null;
  }

  // Filter events by severity based on vendetta phase
  let allowedSeverities: string[];
  switch (mindset.vendettaPhase) {
    case 'HOT':
      allowedSeverities = ['LOW', 'MEDIUM'];
      break;
    case 'BLOOD_FEUD':
      allowedSeverities = ['LOW', 'MEDIUM', 'HIGH'];
      break;
    case 'TOTAL_WAR':
      allowedSeverities = ['MEDIUM', 'HIGH'];
      break;
    default:
      allowedSeverities = ['LOW'];
  }

  const availableEvents = SURPRISE_EVENTS.filter(e => allowedSeverities.includes(e.severity));

  if (availableEvents.length === 0) return null;

  const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];

  // Generate target description based on event type
  let targetDescription = '';
  if (event.id === 'HOSTILE_TAKEOVER_ATTEMPT' && playerStats.portfolio.length > 0) {
    const target = playerStats.portfolio[Math.floor(Math.random() * playerStats.portfolio.length)];
    targetDescription = target.name;
  } else if (event.id === 'TALENT_POACHING') {
    targetDescription = 'your rising star analyst';
  } else {
    targetDescription = 'your fund';
  }

  return { event, targetDescription };
}

/**
 * Calculate auction bid with advanced AI behaviors
 */
export function calculateAdvancedAuctionBid(
  fund: RivalFund,
  mindset: RivalMindset,
  currentBid: number,
  deal: CompetitiveDeal,
  playerPatterns: Partial<PlayerPattern>,
  round: number,
  isPlayerLeading: boolean
): { bid: number; isBluff: boolean; dropOut: boolean; taunt?: string } {
  const baseIncrement = deal.askingPrice * 0.05;

  // Base willingness from strategy
  const strategyMultipliers: Record<RivalStrategy, number> = {
    AGGRESSIVE: 1.1,
    PREDATORY: 1.2,
    CONSERVATIVE: 0.95,
    OPPORTUNISTIC: 1.0,
  };

  let maxWillingness = deal.fairValue * strategyMultipliers[fund.strategy];

  // Vendetta modifier - will overpay to beat player
  if (isPlayerLeading && mindset.vendettaPhase !== 'COLD') {
    const vendettaBonus = 1 + ((fund.vendetta || 0) / 200);
    maxWillingness *= vendettaBonus;
  }

  // Mood modifiers
  if (mindset.currentMood === 'DESPERATE') maxWillingness *= 1.15;
  if (mindset.currentMood === 'VENGEFUL') maxWillingness *= 1.25;
  if (mindset.currentMood === 'CAUTIOUS') maxWillingness *= 0.9;

  // Check for surprise aggressive bid
  const surpriseBidChance = mindset.vendettaPhase === 'TOTAL_WAR' ? 0.3 :
                           mindset.vendettaPhase === 'BLOOD_FEUD' ? 0.2 :
                           mindset.vendettaPhase === 'HOT' ? 0.1 : 0.05;

  const isSurpriseBid = Math.random() < surpriseBidChance && round > 1;

  // Calculate actual bid
  let newBid: number;
  let isBluff = false;

  if (isSurpriseBid) {
    // Surprise bid: jump significantly ahead
    newBid = currentBid * (1.15 + Math.random() * 0.15);

    // Sometimes this is a bluff
    if (newBid > maxWillingness && Math.random() > 0.6) {
      isBluff = true;
    }
  } else {
    // Normal incremental bid
    const randomFactor = 0.8 + Math.random() * 0.4;
    const aggressionBonus = fund.aggressionLevel / 100 * baseIncrement * 0.5;
    newBid = currentBid + baseIncrement * randomFactor + aggressionBonus;
  }

  // Adapt to known player patterns
  if (playerPatterns.bidDropoutThreshold && isPlayerLeading) {
    // If we know player usually drops out, push just past their threshold
    const playerDropoutPrice = deal.fairValue * playerPatterns.bidDropoutThreshold;
    if (currentBid < playerDropoutPrice && newBid >= playerDropoutPrice * 0.9) {
      // Push aggressively to force player out
      newBid = playerDropoutPrice * 1.05;
    }
  }

  // Psychological bluffs based on player response patterns
  if (playerPatterns.responseToBluffs === 'FOLDS' && !isBluff && Math.random() > 0.6) {
    // Player folds to bluffs, so bluff more
    isBluff = true;
    newBid = Math.max(newBid, currentBid * 1.2);
  }

  // Check if should drop out
  const shouldDropOut = newBid > maxWillingness && !isBluff;

  // Generate taunt for heated rivalries
  let taunt: string | undefined;
  if (isPlayerLeading && mindset.vendettaPhase !== 'COLD' && Math.random() > 0.6) {
    const taunts = [
      `${fund.managingPartner} smirks: "Is that all you've got?"`,
      `${fund.managingPartner} whispers to their associate: "Watch this amateur fold."`,
      `${fund.managingPartner} makes a show of checking their phone, bored.`,
      `${fund.managingPartner} says loudly: "Some funds just don't have the stomach for this."`,
      `${fund.managingPartner} raises an eyebrow: "Playing with the big boys now?"`,
    ];
    taunt = taunts[Math.floor(Math.random() * taunts.length)];
  }

  return {
    bid: Math.round(newBid),
    isBluff,
    dropOut: shouldDropOut,
    taunt,
  };
}

/**
 * Generate knowledge entry for AI actions
 */
export function generateAIKnowledgeEntry(
  fund: RivalFund,
  decision: AIDecision,
  success: boolean
): KnowledgeEntry {
  return {
    summary: `${fund.managingPartner} ${decision.reasoning}${success ? ' successfully' : ' but failed'}`,
    timestamp: new Date().toISOString(),
    source: fund.name,
    npcId: fund.npcId,
    faction: 'RIVALS',
    tags: ['rival', 'ai_action', decision.action.toLowerCase()],
    confidence: success ? 90 : 60,
  };
}

/**
 * Calculate stat changes from AI tactical moves
 */
export function calculateTacticalMoveEffects(
  decision: AIDecision,
  success: boolean,
  fund: RivalFund
): {
  stress?: number;
  reputation?: number;
  auditRisk?: number;
  energy?: number;
  factionReputation?: { RIVALS: number };
} {
  if (!success) {
    // Failed moves have minimal impact
    return { stress: 2 };
  }

  const intensityMultiplier = decision.intensity / 100;

  switch (decision.action) {
    case 'RUMOR':
      return {
        stress: Math.round(5 * intensityMultiplier),
        reputation: Math.round(-3 * intensityMultiplier),
        factionReputation: { RIVALS: -2 },
      };

    case 'PSYCHOLOGICAL_WARFARE':
      const tactic = PSYCHOLOGICAL_TACTICS[Math.floor(Math.random() * PSYCHOLOGICAL_TACTICS.length)];
      return {
        stress: Math.round(tactic.magnitude * intensityMultiplier),
        reputation: tactic.effect === 'reputation' ? Math.round(tactic.magnitude * intensityMultiplier) : 0,
        auditRisk: tactic.effect === 'auditRisk' ? Math.round(tactic.magnitude * intensityMultiplier) : 0,
      };

    case 'SABOTAGE':
      return {
        stress: Math.round(10 * intensityMultiplier),
        reputation: Math.round(-5 * intensityMultiplier),
        auditRisk: Math.round(3 * intensityMultiplier),
      };

    case 'MARKET_MANIPULATION':
      return {
        stress: Math.round(8 * intensityMultiplier),
        factionReputation: { RIVALS: -5 },
      };

    case 'COALITION':
      return {
        stress: Math.round(12 * intensityMultiplier),
        reputation: Math.round(-4 * intensityMultiplier),
      };

    case 'SURPRISE_BID':
      return {
        stress: Math.round(15 * intensityMultiplier),
      };

    default:
      return { stress: 3 };
  }
}

/**
 * Generate message for rival tactical move
 */
export function generateTacticalMoveMessage(
  fund: RivalFund,
  decision: AIDecision,
  success: boolean
): string {
  const prefix = success ? 'RIVAL ATTACK:' : 'RIVAL ATTEMPT:';

  const messages: Record<TacticalMove, string[]> = {
    POACH: [
      `${fund.name} swooped in on ${decision.target}`,
      `${fund.managingPartner} stole the deal while you hesitated`,
      `${fund.name} closed ${decision.target} before you could move`,
    ],
    RUMOR: [
      `${fund.managingPartner} is spreading rumors about your due diligence`,
      `Word on the street: ${fund.name} is questioning your judgment`,
      `${fund.managingPartner} told LPs you're "in over your head"`,
    ],
    COALITION: [
      `Multiple rival funds are coordinating against you`,
      `${fund.name} has formed an alliance with other funds`,
      `You're facing a united front from your competitors`,
    ],
    SABOTAGE: [
      `${fund.name} is attacking your portfolio companies`,
      `${fund.managingPartner} is creating problems for your investments`,
      `Someone is leaking negative info about your holdings`,
    ],
    MARKET_MANIPULATION: [
      `${fund.name} is manipulating deal flow in your target sectors`,
      `${fund.managingPartner} is cornering deals before they hit the market`,
      `The game is rigged, and ${fund.name} is doing the rigging`,
    ],
    PSYCHOLOGICAL_WARFARE: [
      `${fund.managingPartner} is playing mind games`,
      `${fund.name} is trying to get in your head`,
      `The pressure from ${fund.name} is intensifying`,
    ],
    SURPRISE_BID: [
      `${fund.name} made an unexpected aggressive move`,
      `${fund.managingPartner} caught everyone off guard`,
      `${fund.name} just changed the game entirely`,
    ],
    STRATEGIC_RETREAT: [
      `${fund.name} is pulling back... for now`,
      `${fund.managingPartner} is regrouping`,
      `${fund.name} went quiet - what are they planning?`,
    ],
  };

  const messageList = messages[decision.action] || [`${fund.name} made a move`];
  const message = messageList[Math.floor(Math.random() * messageList.length)];

  return `${prefix} ${message}`;
}
