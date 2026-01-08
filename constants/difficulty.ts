/**
 * Difficulty Constants
 *
 * Game difficulty settings and adaptive difficulty thresholds.
 */

import type { DifficultySettings, Difficulty } from '../types';
import { PlayerLevel } from '../types';
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
      positive: 1.0,         // Reduced from 1.2 - no more easy wins
      negative: 0.9,         // Increased from 0.8 - consequences still bite
    },
  },
  Normal: {
    name: 'MBA Grad',
    description: "Top school, top grades. Now you're just another shark. You have potential, but no protection. Mistakes cost you dearly.",
    initialStats: {
        ...NORMAL_STATS,
        stress: 15,          // Added baseline stress - it's a tough job
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
      cash: 300,             // Reduced from 500 - even more broke
      stress: 45,            // Increased from 35
      reputation: 5,         // Start with almost no reputation
      analystRating: 35,     // Reduced from 40
      financialEngineering: 3, // Reduced from 5
      portfolio: [],
      personalFinances: {
        bankBalance: 300,
        totalEarnings: 0,
        salaryYTD: 0,
        bonusYTD: 0,
        carryReceived: 0,
        outstandingLoans: 25000,     // Increased from 15k - more debt
        loanInterestRate: 0.10,      // Increased from 8% - worse terms
        monthlyBurn: 2500,           // Increased burn rate
        lifestyleLevel: 'BROKE_ASSOCIATE',
      },
    },
    modifiers: {
      positive: 0.7,         // Reduced from 0.8 - wins are rare
      negative: 1.5,         // Increased from 1.2 - failures are devastating
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
  stress: 3,                // Stress builds naturally
  relationshipDecay: -2,    // NPC relationships cool off
};
