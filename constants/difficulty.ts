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
    description: "Your father is the Chairman of the Board. You start with a massive safety net, a Rolodex of contacts, and an innate sense of entitlement. It's hard to fail when you were born on third base.",
    initialStats: {
      ...NORMAL_STATS,
      cash: 50000,           // Daddy's allowance
      reputation: 20,
      stress: 0,
      financialEngineering: 20,
      portfolio: [],
      personalFinances: {
        bankBalance: 50000,
        totalEarnings: 0,
        salaryYTD: 0,
        bonusYTD: 0,
        carryReceived: 0,
        outstandingLoans: 0,
        loanInterestRate: 0,
        monthlyBurn: 10000,          // ASPIRATIONAL lifestyle from day 1
        lifestyleLevel: 'ASPIRATIONAL',
      },
    },
    modifiers: {
      positive: 1.2,
      negative: 0.8,
    },
  },
  Normal: {
    name: 'MBA Grad',
    description: "You did everything right: top school, top grades, top internship. Now you're just another shark in a tank full of them. You have potential, but no protection. Every dollar counts.",
    initialStats: {
        ...NORMAL_STATS,
        // Starting with $1,500 - can barely afford golf with partners
        // First salary payment comes with first advanceTime
        portfolio: [],
        // personalFinances inherited from NORMAL_STATS
    },
    modifiers: {
      positive: 1.0,
      negative: 1.0,
    },
  },
  Hard: {
    name: 'State School Striver',
    description: "You clawed your way here with pure grit and a chip on your shoulder the size of a tombstone. Everyone is waiting for you to fail so they can say 'I told you so'. One mistake and you're out.",
    initialStats: {
      ...NORMAL_STATS,
      cash: 500,             // You're broke and desperate
      stress: 35,
      analystRating: 40,
      financialEngineering: 5,
      portfolio: [],
      personalFinances: {
        bankBalance: 500,
        totalEarnings: 0,
        salaryYTD: 0,
        bonusYTD: 0,
        carryReceived: 0,
        outstandingLoans: 15000,     // Student loans hanging over you
        loanInterestRate: 0.08,      // 8% APR - better than credit cards at least
        monthlyBurn: 2000,           // BROKE_ASSOCIATE - no choice
        lifestyleLevel: 'BROKE_ASSOCIATE',
      },
    },
    modifiers: {
      positive: 0.8,
      negative: 1.2,
    },
  },
};

export const ADAPTIVE_DIFFICULTY_THRESHOLDS = {
  EASY: { playerWinRate: 0.7, wealthRatio: 2.0, reputationThreshold: 85 },
  NORMAL: { playerWinRate: 0.5, wealthRatio: 1.5, reputationThreshold: 70 },
  HARD: { playerWinRate: 0.3, wealthRatio: 1.0, reputationThreshold: 50 },
};
