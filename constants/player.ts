/**
 * Player Constants
 *
 * Constants related to player stats, compensation tiers, progression,
 * and financial thresholds throughout the game.
 */

import type { PlayerStats, FactionReputation } from '../types';
import { PlayerLevel } from '../types';

export const DEFAULT_FACTION_REPUTATION: FactionReputation = {
  MANAGING_DIRECTORS: 45,
  ANALYSTS: 55,
  REGULATORS: 50,
  LIMITED_PARTNERS: 40,
  RIVALS: 30,
};

// The "Rookie" Profile (Default State)
// Starting cash is intentionally low - you're a new associate living paycheck to paycheck
// This creates tension where every expense matters and players must prioritize
export const NORMAL_STATS: PlayerStats = {
  level: PlayerLevel.ASSOCIATE,
  cash: 1500,              // Legacy field - kept in sync with personalFinances.bankBalance
  reputation: 10,
  factionReputation: { ...DEFAULT_FACTION_REPUTATION },
  stress: 0,
  energy: 90,
  analystRating: 50,
  financialEngineering: 10,
  ethics: 60,
  auditRisk: 0,
  score: 0,
  portfolio: [],
  playerFlags: {},
  playedScenarioIds: [],
  gameYear: 1,
  gameMonth: 1,
  currentDayType: 'WEEKDAY',
  currentTimeSlot: 'MORNING',
  timeCursor: 0,
  aum: 0,
  employees: [],
  health: 100,
  dependency: 0,
  tutorialStep: 0,
  loanBalance: 0,               // Legacy field - kept in sync with personalFinances.outstandingLoans
  loanRate: 0,                  // Legacy field - kept in sync with personalFinances.loanInterestRate
  knowledgeLog: [],
  knowledgeFlags: [],
  // Achievement System
  unlockedAchievements: [],
  // Industry Specialization
  sectorExpertise: [],
  primarySector: undefined,
  // Exit Tracking
  completedExits: [],
  totalRealizedGains: 0,
  // NEW: Personal & Fund Finances
  personalFinances: {
    bankBalance: 1500,           // Same as legacy cash
    totalEarnings: 0,
    salaryYTD: 0,
    bonusYTD: 0,
    carryReceived: 0,
    outstandingLoans: 0,
    loanInterestRate: 0,
    monthlyBurn: 2000,           // BROKE_ASSOCIATE tier
    lifestyleLevel: 'BROKE_ASSOCIATE',
  },
  fundFinances: null,            // Not a founder yet
  dealAllocations: [],
  carryEligibleDeals: [],
  activeSkillInvestments: [],
  // NEW: Time & Action System
  gameTime: {
    week: 1,
    year: 1,
    quarter: 1 as const,
    actionsRemaining: 4,
    maxActions: 4,
    isNightGrinder: false,
    actionsUsedThisWeek: [],
  },
};

export const LEVEL_RANKS: Record<PlayerLevel, number> = {
  [PlayerLevel.ASSOCIATE]: 0,
  [PlayerLevel.SENIOR_ASSOCIATE]: 1,
  [PlayerLevel.VICE_PRESIDENT]: 2,
  [PlayerLevel.PRINCIPAL]: 3,
  [PlayerLevel.PARTNER]: 4,
  [PlayerLevel.FOUNDER]: 5,
};

// ==================== COMPENSATION SYSTEM ====================
// Progressive cash system: salary, bonus, and carry by level

export interface CompensationTier {
  weeklySalary: number;       // Weekly base salary (after taxes)
  bonusMultiplier: number;    // Multiplier on base for annual bonus (0 = no bonus)
  carryPercentage: number;    // Percentage of exit profits (0 = no carry)
  canAccessLoan: boolean;     // Whether player can take bridge loans
  loanLimit: number;          // Maximum loan amount available
}

export const COMPENSATION_BY_LEVEL: Record<PlayerLevel, CompensationTier> = {
  [PlayerLevel.ASSOCIATE]: {
    weeklySalary: 2000,       // ~$100k/year after taxes - tight budget
    bonusMultiplier: 0.5,     // 50% of base as potential bonus
    carryPercentage: 0,       // No carry at associate level
    canAccessLoan: false,     // No loans - you're too junior
    loanLimit: 0,
  },
  [PlayerLevel.SENIOR_ASSOCIATE]: {
    weeklySalary: 3000,       // ~$150k/year
    bonusMultiplier: 0.75,    // 75% of base as potential bonus
    carryPercentage: 0,       // Still no carry
    canAccessLoan: true,      // Can now access emergency loans
    loanLimit: 25000,
  },
  [PlayerLevel.VICE_PRESIDENT]: {
    weeklySalary: 4500,       // ~$225k/year
    bonusMultiplier: 1.0,     // 100% of base as potential bonus
    carryPercentage: 0.5,     // 0.5% carry on exits
    canAccessLoan: true,
    loanLimit: 50000,
  },
  [PlayerLevel.PRINCIPAL]: {
    weeklySalary: 6000,       // ~$300k/year
    bonusMultiplier: 1.5,     // 150% of base as potential bonus
    carryPercentage: 2,       // 2% carry on exits
    canAccessLoan: true,
    loanLimit: 100000,
  },
  [PlayerLevel.PARTNER]: {
    weeklySalary: 10000,      // ~$500k/year
    bonusMultiplier: 3.0,     // 300% of base as potential bonus
    carryPercentage: 10,      // 10% carry - this is where the money is
    canAccessLoan: true,
    loanLimit: 500000,
  },
  [PlayerLevel.FOUNDER]: {
    weeklySalary: 0,          // No salary - you're the owner
    bonusMultiplier: 0,       // No bonus - you take distributions
    carryPercentage: 20,      // 20% carry on all fund exits
    canAccessLoan: true,
    loanLimit: 1000000,
  },
};

// Bonus calculation factors
export const BONUS_FACTORS = {
  minReputationForBonus: 30,      // Need at least 30 reputation to get any bonus
  fullBonusReputation: 80,        // Need 80+ reputation for full bonus
  portfolioPerformanceWeight: 0.4, // 40% of bonus based on portfolio performance
  reputationWeight: 0.3,           // 30% based on reputation
  dealsClosedWeight: 0.3,          // 30% based on deals closed this year
};

// Activity cost thresholds - what feels "expensive" at each level
export const AFFORDABILITY_THRESHOLDS: Record<PlayerLevel, number> = {
  [PlayerLevel.ASSOCIATE]: 200,        // $200 feels expensive
  [PlayerLevel.SENIOR_ASSOCIATE]: 500, // $500 feels expensive
  [PlayerLevel.VICE_PRESIDENT]: 1000,
  [PlayerLevel.PRINCIPAL]: 2000,
  [PlayerLevel.PARTNER]: 5000,
  [PlayerLevel.FOUNDER]: 10000,
};
