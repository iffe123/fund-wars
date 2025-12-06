import type { Scenario, PlayerStats, PortfolioCompany, RivalFund } from '../types';
import { PlayerLevel } from '../types';

// ==================== SCENARIO GATING ====================

export interface ScenarioRequirements {
  minWeek?: number;
  minReputation?: number;
  minTrackRecord?: number;
  requiredLevel?: PlayerLevel;
  minExits?: number;
  minCompletedDeals?: number;
  isFounderOnly?: boolean;
}

// Level ranks for comparison
const LEVEL_RANKS: Record<PlayerLevel, number> = {
  [PlayerLevel.ASSOCIATE]: 0,
  [PlayerLevel.SENIOR_ASSOCIATE]: 1,
  [PlayerLevel.VICE_PRESIDENT]: 2,
  [PlayerLevel.PRINCIPAL]: 3,
  [PlayerLevel.PARTNER]: 4,
  [PlayerLevel.FOUNDER]: 5,
};

/**
 * Check if a scenario is unlocked based on player stats
 */
export const isScenarioUnlocked = (
  scenario: Scenario & ScenarioRequirements,
  playerStats: PlayerStats
): boolean => {
  // Check week requirement
  if (scenario.minWeek && (playerStats.gameTime?.week || 0) < scenario.minWeek) {
    return false;
  }

  // Check reputation requirement
  if (scenario.minReputation && playerStats.reputation < scenario.minReputation) {
    return false;
  }

  // Check track record (score)
  if (scenario.minTrackRecord && playerStats.score < scenario.minTrackRecord) {
    return false;
  }

  // Check level requirement
  if (scenario.requiredLevel) {
    const playerRank = LEVEL_RANKS[playerStats.level];
    const requiredRank = LEVEL_RANKS[scenario.requiredLevel];
    if (playerRank < requiredRank) {
      return false;
    }
  }

  // Check exits requirement
  if (scenario.minExits && (playerStats.completedExits?.length || 0) < scenario.minExits) {
    return false;
  }

  // Check completed deals
  if (scenario.minCompletedDeals) {
    const dealsClosed = playerStats.portfolio.filter(c => c.dealClosed).length;
    const totalDeals = dealsClosed + (playerStats.completedExits?.length || 0);
    if (totalDeals < scenario.minCompletedDeals) {
      return false;
    }
  }

  // Check founder-only restriction
  if (scenario.isFounderOnly && playerStats.level !== PlayerLevel.FOUNDER) {
    return false;
  }

  return true;
};

/**
 * Get unlock requirements text for a locked scenario
 */
export const getUnlockRequirementsText = (
  scenario: Scenario & ScenarioRequirements,
  playerStats: PlayerStats
): string[] => {
  const requirements: string[] = [];

  if (scenario.minWeek && (playerStats.gameTime?.week || 0) < scenario.minWeek) {
    requirements.push(`Play for ${scenario.minWeek} weeks (current: ${playerStats.gameTime?.week || 0})`);
  }

  if (scenario.minReputation && playerStats.reputation < scenario.minReputation) {
    requirements.push(`Reputation ${scenario.minReputation}+ (current: ${playerStats.reputation})`);
  }

  if (scenario.minTrackRecord && playerStats.score < scenario.minTrackRecord) {
    requirements.push(`Track Record ${scenario.minTrackRecord}+ (current: ${playerStats.score})`);
  }

  if (scenario.requiredLevel) {
    const playerRank = LEVEL_RANKS[playerStats.level];
    const requiredRank = LEVEL_RANKS[scenario.requiredLevel];
    if (playerRank < requiredRank) {
      requirements.push(`Reach ${scenario.requiredLevel} level`);
    }
  }

  if (scenario.minExits && (playerStats.completedExits?.length || 0) < scenario.minExits) {
    requirements.push(`Complete ${scenario.minExits} exits (current: ${playerStats.completedExits?.length || 0})`);
  }

  if (scenario.minCompletedDeals) {
    const dealsClosed = playerStats.portfolio.filter(c => c.dealClosed).length;
    const totalDeals = dealsClosed + (playerStats.completedExits?.length || 0);
    if (totalDeals < scenario.minCompletedDeals) {
      requirements.push(`Complete ${scenario.minCompletedDeals} deals (current: ${totalDeals})`);
    }
  }

  return requirements;
};

// ==================== PORTFOLIO ANALYTICS ====================

export type AnalystSentiment = 'BULLISH' | 'NEUTRAL' | 'BEARISH';

export interface PortfolioAnalytics {
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  analystSentiment: AnalystSentiment;
  analystNote: string;
  holdingPeriodWeeks: number;
  earlySalePenalty: number;
  activeBidders: string[];
  highestBid: number | null;
}

/**
 * Calculate comprehensive analytics for a portfolio company
 */
export const calculatePortfolioAnalytics = (
  company: PortfolioCompany,
  currentWeek: number,
  rivalFunds: RivalFund[]
): PortfolioAnalytics => {
  // Calculate unrealized gain/loss
  const costBasis = company.investmentCost * (company.ownershipPercentage / 100);
  const currentValue = company.currentValuation * (company.ownershipPercentage / 100);
  const unrealizedGainLoss = currentValue - costBasis;
  const unrealizedGainLossPercent = costBasis > 0 ? (unrealizedGainLoss / costBasis) * 100 : 0;

  // Calculate holding period
  const acquisitionWeek = (company.acquisitionDate.year - 1) * 52 +
    Math.ceil(company.acquisitionDate.month * (52 / 12));
  const holdingPeriodWeeks = Math.max(0, currentWeek - acquisitionWeek);

  // Calculate early sale penalty (penalty if sold before 26 weeks / ~6 months)
  const minHoldingPeriod = 26;
  const earlySalePenalty = holdingPeriodWeeks < minHoldingPeriod
    ? 0.15 * (1 - holdingPeriodWeeks / minHoldingPeriod) // Up to 15% penalty
    : 0;

  // Determine analyst sentiment based on company metrics
  let analystSentiment: AnalystSentiment = 'NEUTRAL';
  let analystNote = 'Holding steady. Watch for market developments.';

  if (company.revenueGrowth > 0.15 && company.ebitdaMargin > 0.15) {
    analystSentiment = 'BULLISH';
    analystNote = 'Strong growth trajectory. Consider expanding position or preparing for premium exit.';
  } else if (company.revenueGrowth > 0.05 && company.ebitdaMargin > 0.1) {
    analystSentiment = 'BULLISH';
    analystNote = 'Solid fundamentals. Operational improvements showing results.';
  } else if (company.revenueGrowth < -0.1 || company.ebitdaMargin < 0.05) {
    analystSentiment = 'BEARISH';
    analystNote = 'Red flags detected. Consider intervention or accelerated exit.';
  } else if (company.revenueGrowth < 0) {
    analystSentiment = 'BEARISH';
    analystNote = 'Revenue declining. Review strategic options.';
  } else if (company.ceoPerformance && company.ceoPerformance < 40) {
    analystSentiment = 'BEARISH';
    analystNote = 'Management underperforming. Leadership change may be needed.';
  } else if (company.hasBoardCrisis) {
    analystSentiment = 'BEARISH';
    analystNote = 'Active board crisis demands immediate attention.';
  } else if (unrealizedGainLossPercent > 50) {
    analystSentiment = 'BULLISH';
    analystNote = 'Strong unrealized gains. Consider locking in profits.';
  }

  // Check for rival interest
  const activeBidders: string[] = [];
  let highestBid: number | null = null;

  // Simulate rival interest based on company attractiveness
  const attractivenessScore = (company.revenueGrowth * 100) +
    (company.ebitdaMargin * 50) +
    (company.currentValuation > 100000000 ? 20 : 0);

  rivalFunds.forEach(rival => {
    // Higher aggression rivals more likely to circle good companies
    const interestThreshold = 30 - (rival.aggressionLevel * 0.3);
    if (attractivenessScore > interestThreshold && rival.dryPowder > company.currentValuation * 0.3) {
      activeBidders.push(rival.name);
      // Calculate potential bid (rivals bid at a discount to fair value)
      const rivalBid = company.currentValuation * (0.85 + Math.random() * 0.2);
      if (!highestBid || rivalBid > highestBid) {
        highestBid = rivalBid;
      }
    }
  });

  return {
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    analystSentiment,
    analystNote,
    holdingPeriodWeeks,
    earlySalePenalty,
    activeBidders,
    highestBid,
  };
};

/**
 * Format money value for display
 */
export const formatMoney = (value: number): string => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

// ==================== FOUNDER MODE GATING ====================

/**
 * Requirements for unlocking Founder Mode
 */
export const FOUNDER_MODE_REQUIREMENTS: ScenarioRequirements = {
  minWeek: 52,           // Must play for at least 1 year
  minReputation: 75,     // High reputation needed
  minTrackRecord: 150,   // Score >= 150
  requiredLevel: PlayerLevel.PARTNER,
  minExits: 3,           // Must have completed 3 successful exits
  minCompletedDeals: 5,  // Must have completed 5 deals total
  isFounderOnly: false,  // Available to Partners
};

/**
 * Check if Founder Mode is unlocked for the player
 */
export const isFounderModeUnlocked = (playerStats: PlayerStats): boolean => {
  // Use the existing simplified check (reputation >= 50) for backward compatibility
  // but also check the new stricter requirements
  const simpleCheck = playerStats.reputation >= 50;

  // For now, keep the simple check active to not break existing gameplay
  // The stricter requirements can be enabled by uncommenting below
  // return isScenarioUnlocked({ id: 999, title: 'Founder Mode', description: '', ...FOUNDER_MODE_REQUIREMENTS }, playerStats);

  return simpleCheck;
};

/**
 * Get Founder Mode unlock progress
 */
export const getFounderModeProgress = (playerStats: PlayerStats): {
  unlocked: boolean;
  requirements: Array<{ label: string; current: number | string; required: number | string; met: boolean }>;
} => {
  const currentWeek = playerStats.gameTime?.week || playerStats.timeCursor || 0;
  const dealsClosed = playerStats.portfolio.filter(c => c.dealClosed).length;
  const totalDeals = dealsClosed + (playerStats.completedExits?.length || 0);

  const requirements = [
    {
      label: 'Weeks Played',
      current: currentWeek,
      required: FOUNDER_MODE_REQUIREMENTS.minWeek || 52,
      met: currentWeek >= (FOUNDER_MODE_REQUIREMENTS.minWeek || 52),
    },
    {
      label: 'Reputation',
      current: playerStats.reputation,
      required: FOUNDER_MODE_REQUIREMENTS.minReputation || 75,
      met: playerStats.reputation >= (FOUNDER_MODE_REQUIREMENTS.minReputation || 75),
    },
    {
      label: 'Track Record',
      current: playerStats.score,
      required: FOUNDER_MODE_REQUIREMENTS.minTrackRecord || 150,
      met: playerStats.score >= (FOUNDER_MODE_REQUIREMENTS.minTrackRecord || 150),
    },
    {
      label: 'Level',
      current: playerStats.level,
      required: FOUNDER_MODE_REQUIREMENTS.requiredLevel || PlayerLevel.PARTNER,
      met: LEVEL_RANKS[playerStats.level] >= LEVEL_RANKS[FOUNDER_MODE_REQUIREMENTS.requiredLevel || PlayerLevel.PARTNER],
    },
    {
      label: 'Completed Exits',
      current: playerStats.completedExits?.length || 0,
      required: FOUNDER_MODE_REQUIREMENTS.minExits || 3,
      met: (playerStats.completedExits?.length || 0) >= (FOUNDER_MODE_REQUIREMENTS.minExits || 3),
    },
    {
      label: 'Total Deals',
      current: totalDeals,
      required: FOUNDER_MODE_REQUIREMENTS.minCompletedDeals || 5,
      met: totalDeals >= (FOUNDER_MODE_REQUIREMENTS.minCompletedDeals || 5),
    },
  ];

  const unlocked = requirements.every(r => r.met);

  return { unlocked, requirements };
};
