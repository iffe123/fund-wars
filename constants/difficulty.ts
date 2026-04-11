/**
 * Difficulty Constants
 *
 * Game difficulty settings and adaptive difficulty thresholds.
 */

import type { DifficultySettings, Difficulty } from '../types';
import { NORMAL_STATS } from './player';

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  Easy: {
    name: 'Trust Fund Baby',
    description: "Your father is the Chairman of the Board. You start with a safety net, contacts, and entitlement. But even nepotism won't save you from bad decisions.",
    initialStats: {
      ...NORMAL_STATS,
      cash: 30000,           // Reduced from 50k - daddy's patience has limits
      reputation: 15,        // Reduced from 20 - people are watching you
      stress: 5,             // Even trust fund babies feel pressure
      financialEngineering: 15, // Reduced from 20
      portfolio: [],
      personalFinances: {
        bankBalance: 30000,
        totalEarnings: 0,
        salaryYTD: 0,
        bonusYTD: 0,
        carryReceived: 0,
        outstandingLoans: 0,
        loanInterestRate: 0,
        monthlyBurn: 8000,          // Reduced lifestyle expectations
        lifestyleLevel: 'ASPIRATIONAL',
      },
    },
    modifiers: {
      positive: 1.3,         // Buffed from 1.0 - trust fund privilege pays off
      negative: 0.7,         // Reduced from 0.9 - daddy's money cushions the blow
    },
  },
  Normal: {
    name: 'MBA Grad',
    description: "Top school, top grades. Now you're just another shark. You have potential, but no protection. Mistakes cost you dearly.",
    initialStats: {
        ...NORMAL_STATS,
        stress: 5,           // Low initial stress - players need room to manage it during onboarding
        portfolio: [],
    },
    modifiers: {
      positive: 0.9,         // Reduced from 1.0 - wins are harder to come by
      negative: 1.2,         // Increased from 1.0 - mistakes hurt more
    },
  },
  Hard: {
    name: 'State School Striver',
    description: "You clawed your way here with pure grit. Everyone is waiting for you to fail. One mistake could end everything.",
    initialStats: {
      ...NORMAL_STATS,
      cash: 2000,            // Increased from 300 - at least you saved something
      stress: 20,            // Give players room to manage stress during early game
      reputation: 5,         // Start with almost no reputation
      analystRating: 35,     // Reduced from 40
      financialEngineering: 3, // Reduced from 5
      portfolio: [],
      personalFinances: {
        bankBalance: 2000,
        totalEarnings: 0,
        salaryYTD: 0,
        bonusYTD: 0,
        carryReceived: 0,
        outstandingLoans: 10000,     // Reduced from 25k - less crushing debt
        loanInterestRate: 0.08,      // Reduced from 10% - slightly better terms
        monthlyBurn: 2500,           // Increased burn rate
        lifestyleLevel: 'BROKE_ASSOCIATE',
      },
    },
    modifiers: {
      positive: 0.8,         // Increased from 0.7 - wins are hard but possible
      negative: 1.3,         // Reduced from 1.5 - failures hurt but don't destroy
    },
  },
};

export const ADAPTIVE_DIFFICULTY_THRESHOLDS = {
  // Reduced thresholds - players need to work harder to "win"
  EASY: { playerWinRate: 0.6, wealthRatio: 1.5, reputationThreshold: 75 },
  NORMAL: { playerWinRate: 0.4, wealthRatio: 1.2, reputationThreshold: 60 },
  HARD: { playerWinRate: 0.25, wealthRatio: 0.8, reputationThreshold: 40 },
};

// Stress thresholds for game over conditions
export const STRESS_THRESHOLDS = {
  WARNING: 70,      // Show warning at this level
  CRITICAL: 85,     // Severe penalties kick in
  BREAKDOWN: 100,   // Game over - burnout ending
};

// Reputation thresholds for career consequences
export const REPUTATION_THRESHOLDS = {
  FIRED: 0,         // Immediate termination
  WARNING: 15,      // On thin ice
  STRUGGLING: 30,   // Partner attention (negative)
  AVERAGE: 50,      // Staying afloat
  NOTICED: 70,      // Getting good assignments
  RISING_STAR: 85,  // Partner track
};

// Weekly stat decay - things get worse if you don't actively improve
export const WEEKLY_DECAY = {
  reputation: -1,           // Reputation fades without wins
  stress: 2,                // Stress builds naturally (reduced from 3 to give more breathing room)
  relationshipDecay: -2,    // NPC relationships cool off
};

// Level-aware weekly stress - senior roles face more pressure
export const LEVEL_STRESS_MODIFIER: Record<string, number> = {
  'Associate': 0,
  'Senior Associate': 1,
  'Vice President': 2,
  'Principal': 3,
  'Partner': 4,
  'Founder': 5,
};

// Portfolio size stress - more companies = more juggling
export const PORTFOLIO_STRESS_BRACKETS = [
  { minCompanies: 0, stressPerWeek: 0 },
  { minCompanies: 2, stressPerWeek: 1 },
  { minCompanies: 4, stressPerWeek: 2 },
  { minCompanies: 6, stressPerWeek: 4 },
];

// Promotion thresholds - what you need to level up
export const PROMOTION_REQUIREMENTS: Record<string, {
  minReputation: number;
  minDealsCompleted: number;
  minWeeksAtLevel: number;
  minAnalystRating: number;
  minFinancialEngineering?: number;
  minFactionRep?: Partial<Record<string, number>>;
}> = {
  'Senior Associate': {
    minReputation: 20,
    minDealsCompleted: 1,
    minWeeksAtLevel: 8,
    minAnalystRating: 40,
  },
  'Vice President': {
    minReputation: 35,
    minDealsCompleted: 3,
    minWeeksAtLevel: 16,
    minAnalystRating: 55,
    minFinancialEngineering: 25,
  },
  'Principal': {
    minReputation: 50,
    minDealsCompleted: 6,
    minWeeksAtLevel: 20,
    minAnalystRating: 65,
    minFinancialEngineering: 40,
    minFactionRep: { MANAGING_DIRECTORS: 50 },
  },
  'Partner': {
    minReputation: 65,
    minDealsCompleted: 10,
    minWeeksAtLevel: 26,
    minAnalystRating: 75,
    minFinancialEngineering: 55,
    minFactionRep: { MANAGING_DIRECTORS: 60, LIMITED_PARTNERS: 50 },
  },
  'Founder': {
    minReputation: 80,
    minDealsCompleted: 15,
    minWeeksAtLevel: 30,
    minAnalystRating: 80,
    minFinancialEngineering: 65,
    minFactionRep: { LIMITED_PARTNERS: 70 },
  },
};

// Market event probabilities per tick
export const MARKET_EVENT_PROBABILITIES = {
  NORMAL_TO_BULL: 0.05,
  NORMAL_TO_CRUNCH: 0.04,
  NORMAL_TO_PANIC: 0.01,
  BULL_TO_NORMAL: 0.08,
  BULL_TO_PANIC: 0.03,
  CRUNCH_TO_NORMAL: 0.06,
  CRUNCH_TO_PANIC: 0.05,
  PANIC_TO_CRUNCH: 0.10,
  PANIC_TO_NORMAL: 0.03,
};

// Score multipliers for various activities
export const SCORE_MULTIPLIERS = {
  dealClosed: 500,
  exitCompleted: 1000,
  achievementUnlocked: 250,
  promotionEarned: 2000,
  weekSurvived: 10,
  modelingChallengeCorrect: 150,
  dramaResolved: 200,
  companyEventHandled: 150,
};
