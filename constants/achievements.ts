import type { AchievementDefinition, PlayerStats, NPC, AchievementContext } from '../types';
import { PlayerLevel } from '../types';

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ==================== CAREER ACHIEVEMENTS ====================
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Close your first deal. Welcome to the jungle.',
    icon: 'fa-handshake',
    category: 'CAREER',
    condition: (stats: PlayerStats) => stats.portfolio.length >= 1,
    reward: { reputation: 5, score: 500 },
  },
  {
    id: 'senior_associate',
    name: 'Moving Up',
    description: 'Get promoted to Senior Associate.',
    icon: 'fa-arrow-up',
    category: 'CAREER',
    condition: (stats: PlayerStats) => stats.level === PlayerLevel.SENIOR_ASSOCIATE ||
      stats.level === PlayerLevel.VICE_PRESIDENT ||
      stats.level === PlayerLevel.PRINCIPAL ||
      stats.level === PlayerLevel.PARTNER ||
      stats.level === PlayerLevel.FOUNDER,
    reward: { cash: 10000, score: 1000 },
  },
  {
    id: 'vice_president',
    name: 'VP Material',
    description: 'Reach Vice President. The grind is real.',
    icon: 'fa-user-tie',
    category: 'CAREER',
    condition: (stats: PlayerStats) => stats.level === PlayerLevel.VICE_PRESIDENT ||
      stats.level === PlayerLevel.PRINCIPAL ||
      stats.level === PlayerLevel.PARTNER ||
      stats.level === PlayerLevel.FOUNDER,
    reward: { cash: 25000, score: 2500 },
  },
  {
    id: 'principal',
    name: 'Principal Player',
    description: 'Become a Principal. You\'re in the inner circle now.',
    icon: 'fa-crown',
    category: 'CAREER',
    condition: (stats: PlayerStats) => stats.level === PlayerLevel.PRINCIPAL ||
      stats.level === PlayerLevel.PARTNER ||
      stats.level === PlayerLevel.FOUNDER,
    reward: { cash: 50000, score: 5000 },
  },
  {
    id: 'partner',
    name: 'Partner Track',
    description: 'Make Partner. Carry changes everything.',
    icon: 'fa-gem',
    category: 'CAREER',
    condition: (stats: PlayerStats) => stats.level === PlayerLevel.PARTNER || stats.level === PlayerLevel.FOUNDER,
    reward: { cash: 100000, score: 10000 },
  },
  {
    id: 'founder_mode',
    name: 'Founder Mode Unlocked',
    description: 'Reach 50 reputation and unlock the ability to start your own fund.',
    icon: 'fa-rocket',
    category: 'CAREER',
    condition: (stats: PlayerStats) => stats.reputation >= 50,
    reward: { score: 3000 },
  },

  // ==================== DEAL ACHIEVEMENTS ====================
  {
    id: 'deal_machine',
    name: 'Deal Machine',
    description: 'Complete 5 deals. You\'re a closing machine.',
    icon: 'fa-cogs',
    category: 'DEALS',
    condition: (stats: PlayerStats, _npcs: NPC[], ctx: AchievementContext) => ctx.totalDealsCompleted >= 5,
    reward: { reputation: 10, financialEngineering: 5, score: 2000 },
  },
  {
    id: 'mega_deal',
    name: 'Mega Deal',
    description: 'Close a deal worth over $100M.',
    icon: 'fa-building',
    category: 'DEALS',
    condition: (stats: PlayerStats) => stats.portfolio.some(c => c.currentValuation >= 100000000),
    reward: { reputation: 15, score: 5000 },
  },
  {
    id: 'portfolio_builder',
    name: 'Portfolio Builder',
    description: 'Have 3 or more companies in your portfolio simultaneously.',
    icon: 'fa-layer-group',
    category: 'DEALS',
    condition: (stats: PlayerStats) => stats.portfolio.length >= 3,
    reward: { analystRating: 10, score: 1500 },
  },
  {
    id: 'leverage_king',
    name: 'Leverage King',
    description: 'Successfully manage a company with over $50M in debt.',
    icon: 'fa-scale-unbalanced',
    category: 'DEALS',
    condition: (stats: PlayerStats) => stats.portfolio.some(c => c.debt >= 50000000),
    reward: { financialEngineering: 10, score: 2000 },
  },
  {
    id: 'first_exit',
    name: 'Exit Velocity',
    description: 'Successfully exit your first investment.',
    icon: 'fa-door-open',
    category: 'DEALS',
    condition: (stats: PlayerStats, _npcs: NPC[], ctx: AchievementContext) => ctx.totalExits >= 1,
    reward: { reputation: 10, cash: 25000, score: 3000 },
  },
  {
    id: 'triple_bagger',
    name: 'Triple Bagger',
    description: 'Exit an investment at 3x or more your cost.',
    icon: 'fa-chart-line',
    category: 'DEALS',
    condition: (stats: PlayerStats) => stats.completedExits?.some(e => e.multiple >= 3) ?? false,
    reward: { reputation: 20, score: 7500 },
  },

  // ==================== RELATIONSHIP ACHIEVEMENTS ====================
  {
    id: 'chads_favorite',
    name: 'Chad\'s Favorite',
    description: 'Reach 80+ relationship with Chad. He actually respects you.',
    icon: 'fa-star',
    category: 'RELATIONSHIPS',
    condition: (_stats: PlayerStats, npcs: NPC[]) => {
      const chad = npcs.find(n => n.id === 'chad');
      return chad ? chad.relationship >= 80 : false;
    },
    reward: { reputation: 5, stress: -10, score: 1000 },
  },
  {
    id: 'analyst_whisperer',
    name: 'Analyst Whisperer',
    description: 'Build strong relationships with the analyst pool (faction rep 70+).',
    icon: 'fa-users',
    category: 'RELATIONSHIPS',
    condition: (stats: PlayerStats) => stats.factionReputation.ANALYSTS >= 70,
    reward: { analystRating: 15, score: 1500 },
  },
  {
    id: 'lp_darling',
    name: 'LP Darling',
    description: 'Become a favorite of Limited Partners (faction rep 75+).',
    icon: 'fa-hand-holding-dollar',
    category: 'RELATIONSHIPS',
    condition: (stats: PlayerStats) => stats.factionReputation.LIMITED_PARTNERS >= 75,
    reward: { aum: 50000000, score: 3000 },
  },
  {
    id: 'regulatory_clean',
    name: 'Squeaky Clean',
    description: 'Maintain excellent regulator relations (faction rep 80+) with zero audit risk.',
    icon: 'fa-shield-halved',
    category: 'RELATIONSHIPS',
    condition: (stats: PlayerStats) => stats.factionReputation.REGULATORS >= 80 && stats.auditRisk === 0,
    reward: { ethics: 10, score: 2000 },
  },
  {
    id: 'rival_respect',
    name: 'Grudging Respect',
    description: 'Even your rivals respect you (faction rep 60+).',
    icon: 'fa-handshake-angle',
    category: 'RELATIONSHIPS',
    condition: (stats: PlayerStats) => stats.factionReputation.RIVALS >= 60,
    reward: { reputation: 10, score: 2500 },
  },

  // ==================== ETHICS ACHIEVEMENTS ====================
  {
    id: 'saint',
    name: 'The Saint',
    description: 'Complete the game with 90+ ethics. You proved it\'s possible to win with integrity.',
    icon: 'fa-dove',
    category: 'ETHICS',
    condition: (stats: PlayerStats, _npcs: NPC[], ctx: AchievementContext) =>
      stats.ethics >= 90 && ctx.gamePhase === 'VICTORY',
    reward: { score: 15000 },
  },
  {
    id: 'sociopath',
    name: 'The Sociopath',
    description: 'Reach ethics below 20. Gordon Gekko would be proud.',
    icon: 'fa-mask',
    category: 'ETHICS',
    isSecret: true,
    condition: (stats: PlayerStats) => stats.ethics <= 20,
    reward: { cash: 50000, auditRisk: 15, score: 1000 },
  },
  {
    id: 'audit_survivor',
    name: 'Audit Survivor',
    description: 'Reduce your audit risk from 50+ back to below 20.',
    icon: 'fa-user-secret',
    category: 'ETHICS',
    condition: (stats: PlayerStats) => stats.auditRisk < 20 && stats.playerFlags['HAD_HIGH_AUDIT_RISK'],
    reward: { stress: -20, score: 3000 },
  },
  {
    id: 'whistleblower',
    name: 'The Whistleblower',
    description: 'Report unethical behavior (requires specific scenario choice).',
    icon: 'fa-bullhorn',
    category: 'ETHICS',
    isSecret: true,
    condition: (stats: PlayerStats) => stats.playerFlags['WHISTLEBLOWER'] === true,
    reward: { ethics: 20, reputation: -10, score: 5000 },
  },

  // ==================== WEALTH ACHIEVEMENTS ====================
  {
    id: 'hundred_k',
    name: 'Six Figures',
    description: 'Accumulate $100,000 in personal cash.',
    icon: 'fa-money-bill-wave',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => stats.cash >= 100000,
    reward: { score: 1000 },
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Accumulate $1,000,000 in personal cash.',
    icon: 'fa-sack-dollar',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => stats.cash >= 1000000,
    reward: { score: 5000 },
  },
  {
    id: 'fund_i_complete',
    name: 'Fund I Complete',
    description: 'Raise $100M AUM in Founder Mode.',
    icon: 'fa-piggy-bank',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => stats.aum >= 100000000,
    reward: { reputation: 15, score: 5000 },
  },
  {
    id: 'billion_dollar_fund',
    name: 'Billion Dollar Fund',
    description: 'Reach $1B AUM. You\'ve made it.',
    icon: 'fa-landmark',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => stats.aum >= 1000000000,
    reward: { score: 50000 },
  },
  {
    id: 'realized_gains',
    name: 'Paper to Cash',
    description: 'Realize $50M in total exit gains.',
    icon: 'fa-coins',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => (stats.totalRealizedGains ?? 0) >= 50000000,
    reward: { reputation: 10, score: 7500 },
  },

  // ==================== SPECIAL/SECRET ACHIEVEMENTS ====================
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Recover from having less than $1,000 in cash.',
    icon: 'fa-phoenix-framework',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats) => stats.cash >= 50000 && stats.playerFlags['WAS_BROKE'],
    reward: { stress: -15, score: 2500 },
  },
  {
    id: 'stress_test',
    name: 'Stress Tested',
    description: 'Survive with 90+ stress without a game over.',
    icon: 'fa-heart-pulse',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats) => stats.playerFlags['SURVIVED_HIGH_STRESS'] === true,
    reward: { health: 10, score: 2000 },
  },
  {
    id: 'market_timer',
    name: 'Market Timer',
    description: 'Exit an investment during a BULL_RUN market.',
    icon: 'fa-chart-simple',
    category: 'SPECIAL',
    condition: (stats: PlayerStats, _npcs: NPC[], ctx: AchievementContext) =>
      ctx.marketVolatility === 'BULL_RUN' && ctx.totalExits > 0,
    reward: { financialEngineering: 5, score: 1500 },
  },
  {
    id: 'crisis_buyer',
    name: 'Crisis Buyer',
    description: 'Acquire a company during PANIC market conditions.',
    icon: 'fa-fire',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats, _npcs: NPC[], ctx: AchievementContext) =>
      ctx.marketVolatility === 'PANIC' && stats.portfolio.length > 0,
    reward: { reputation: 10, score: 3000 },
  },
  {
    id: 'sector_specialist',
    name: 'Sector Specialist',
    description: 'Reach level 50+ expertise in any industry sector.',
    icon: 'fa-graduation-cap',
    category: 'SPECIAL',
    condition: (stats: PlayerStats) => stats.sectorExpertise?.some(s => s.level >= 50) ?? false,
    reward: { analystRating: 10, score: 2000 },
  },
  {
    id: 'diversified',
    name: 'Diversified',
    description: 'Have expertise in 3 or more sectors.',
    icon: 'fa-arrows-split-up-and-left',
    category: 'SPECIAL',
    condition: (stats: PlayerStats) => (stats.sectorExpertise?.filter(s => s.level >= 20).length ?? 0) >= 3,
    reward: { reputation: 5, score: 1500 },
  },
  {
    id: 'iron_man',
    name: 'Iron Man',
    description: 'Complete 10 weeks without taking any "life management" rest actions.',
    icon: 'fa-person-running',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats) => stats.playerFlags['IRON_MAN_STREAK'] === true,
    reward: { energy: 20, score: 2000 },
  },
  {
    id: 'all_nighter',
    name: 'All-Nighter',
    description: 'Work through an entire weekend without rest.',
    icon: 'fa-moon',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats) => stats.playerFlags['ALL_NIGHTER'] === true,
    reward: { analystRating: 5, stress: 10, score: 500 },
  },

  // ==================== PORTFOLIO MASTERY ACHIEVEMENTS ====================
  {
    id: 'turnaround_artist',
    name: 'Turnaround Artist',
    description: 'Exit a company at 2x+ after it had a critical event during your ownership.',
    icon: 'fa-arrow-rotate-right',
    category: 'DEALS',
    condition: (stats: PlayerStats) =>
      stats.completedExits?.some(e => e.multiple >= 2 && e.hadCriticalEvent) ?? false,
    reward: { reputation: 15, financialEngineering: 5, score: 5000 },
  },
  {
    id: 'five_bagger',
    name: 'Five Bagger',
    description: 'Exit an investment at 5x or more. Legendary returns.',
    icon: 'fa-rocket',
    category: 'DEALS',
    condition: (stats: PlayerStats) => stats.completedExits?.some(e => e.multiple >= 5) ?? false,
    reward: { reputation: 30, score: 15000 },
  },
  {
    id: 'portfolio_empire',
    name: 'Portfolio Empire',
    description: 'Own 5 or more companies simultaneously.',
    icon: 'fa-city',
    category: 'DEALS',
    condition: (stats: PlayerStats) => stats.portfolio.length >= 5,
    reward: { reputation: 15, analystRating: 10, score: 5000 },
  },
  {
    id: 'sector_titan',
    name: 'Industry Titan',
    description: 'Own 3+ companies in the same sector. You dominate the industry.',
    icon: 'fa-chess-king',
    category: 'DEALS',
    condition: (stats: PlayerStats) => {
      const sectorCounts: Record<string, number> = {};
      stats.portfolio.forEach(c => {
        if (c.sector) sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
      });
      return Object.values(sectorCounts).some(count => count >= 3);
    },
    reward: { reputation: 20, score: 4000 },
  },
  {
    id: 'billion_portfolio',
    name: 'Billion Dollar Portfolio',
    description: 'Total portfolio value exceeds $1 billion.',
    icon: 'fa-building-columns',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => {
      const totalValue = stats.portfolio.reduce((sum, c) => sum + c.currentValuation, 0);
      return totalValue >= 1000000000;
    },
    reward: { score: 25000 },
  },

  // ==================== SOCIAL & POLITICAL ACHIEVEMENTS ====================
  {
    id: 'networker',
    name: 'Master Networker',
    description: 'Have 60+ relationship with 5 or more NPCs simultaneously.',
    icon: 'fa-people-group',
    category: 'RELATIONSHIPS',
    condition: (_stats: PlayerStats, npcs: NPC[]) => {
      return npcs.filter(n => n.relationship >= 60).length >= 5;
    },
    reward: { reputation: 10, score: 3000 },
  },
  {
    id: 'everyones_enemy',
    name: "Everyone's Enemy",
    description: 'Have relationship below 30 with 3 or more NPCs. You burn bridges.',
    icon: 'fa-fire-flame-curved',
    category: 'RELATIONSHIPS',
    isSecret: true,
    condition: (_stats: PlayerStats, npcs: NPC[]) => {
      return npcs.filter(n => n.relationship < 30 && !n.isRival).length >= 3;
    },
    reward: { stress: 15, score: 500 },
  },
  {
    id: 'family_first',
    name: 'Family First',
    description: 'Maintain 70+ relationship with all family NPCs.',
    icon: 'fa-house-heart',
    category: 'RELATIONSHIPS',
    condition: (_stats: PlayerStats, npcs: NPC[]) => {
      const familyNpcs = npcs.filter(n => n.relationshipType === 'FAMILY');
      return familyNpcs.length > 0 && familyNpcs.every(n => n.relationship >= 70);
    },
    reward: { stress: -20, health: 10, score: 2000 },
  },
  {
    id: 'puppet_master',
    name: 'Puppet Master',
    description: 'Have 80+ relationship with both Chad and the Managing Directors faction.',
    icon: 'fa-masks-theater',
    category: 'RELATIONSHIPS',
    isSecret: true,
    condition: (stats: PlayerStats, npcs: NPC[]) => {
      const chad = npcs.find(n => n.id === 'chad');
      return chad ? chad.relationship >= 80 && stats.factionReputation.MANAGING_DIRECTORS >= 80 : false;
    },
    reward: { reputation: 15, score: 5000 },
  },

  // ==================== FINANCIAL PROWESS ACHIEVEMENTS ====================
  {
    id: 'debt_free',
    name: 'Debt Free',
    description: 'Pay off all outstanding personal loans.',
    icon: 'fa-circle-check',
    category: 'WEALTH',
    condition: (stats: PlayerStats) =>
      stats.playerFlags['HAD_LOAN'] === true && (stats.personalFinances?.outstandingLoans ?? stats.loanBalance ?? 0) === 0,
    reward: { stress: -10, score: 1500 },
  },
  {
    id: 'master_of_universe',
    name: 'Master of the Universe',
    description: 'Reach the highest lifestyle tier.',
    icon: 'fa-champagne-glasses',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => stats.personalFinances?.lifestyleLevel === 'MASTER_OF_UNIVERSE',
    reward: { score: 10000 },
  },
  {
    id: 'carry_king',
    name: 'Carry King',
    description: 'Receive $10M or more in total carried interest.',
    icon: 'fa-crown',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => (stats.personalFinances?.carryReceived ?? 0) >= 10000000,
    reward: { reputation: 10, score: 8000 },
  },
  {
    id: 'bonus_season',
    name: 'Bonus Season',
    description: 'Receive a bonus of $500K or more in a single year.',
    icon: 'fa-gift',
    category: 'WEALTH',
    condition: (stats: PlayerStats) => (stats.personalFinances?.bonusYTD ?? 0) >= 500000,
    reward: { score: 2000 },
  },

  // ==================== SURVIVAL & RESILIENCE ACHIEVEMENTS ====================
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Reach Partner level after having had reputation below 15.',
    icon: 'fa-medal',
    category: 'CAREER',
    condition: (stats: PlayerStats) =>
      (stats.level === PlayerLevel.PARTNER || stats.level === PlayerLevel.FOUNDER) &&
      stats.playerFlags['HAD_LOW_REPUTATION'] === true,
    reward: { score: 10000 },
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Maintain stress below 15 for 10 consecutive weeks while holding 2+ portfolio companies.',
    icon: 'fa-om',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats) =>
      stats.playerFlags['ZEN_STREAK'] === true && stats.portfolio.length >= 2,
    reward: { health: 20, energy: 20, score: 3000 },
  },
  {
    id: 'phoenix_rising',
    name: 'Phoenix Rising',
    description: 'Win a deal during PANIC market conditions and exit it at 2x+.',
    icon: 'fa-feather-pointed',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats) =>
      stats.completedExits?.some(e => e.boughtDuringPanic && e.multiple >= 2) ?? false,
    reward: { reputation: 25, financialEngineering: 10, score: 10000 },
  },
  {
    id: 'health_crisis_survivor',
    name: 'Health Crisis Survivor',
    description: 'Recover from health below 20 back to 80+.',
    icon: 'fa-heart-circle-check',
    category: 'SPECIAL',
    isSecret: true,
    condition: (stats: PlayerStats) =>
      stats.health >= 80 && stats.playerFlags['HAD_HEALTH_CRISIS'] === true,
    reward: { stress: -15, score: 2500 },
  },

  // ==================== STRATEGIC MASTERY ACHIEVEMENTS ====================
  {
    id: 'model_master',
    name: 'Model Master',
    description: 'Complete 10 financial modeling challenges successfully.',
    icon: 'fa-calculator',
    category: 'CAREER',
    condition: (stats: PlayerStats) => stats.playerFlags['MODELING_CHALLENGES_10'] === true,
    reward: { financialEngineering: 15, analystRating: 10, score: 3000 },
  },
  {
    id: 'speed_runner',
    name: 'Speed Runner',
    description: 'Reach Partner level before Week 52.',
    icon: 'fa-gauge-high',
    category: 'CAREER',
    isSecret: true,
    condition: (stats: PlayerStats) =>
      (stats.level === PlayerLevel.PARTNER || stats.level === PlayerLevel.FOUNDER) &&
      stats.gameTime.week <= 52,
    reward: { score: 20000 },
  },
  {
    id: 'political_survivor',
    name: 'Political Survivor',
    description: 'Navigate 5 NPC dramas without losing any key relationships.',
    icon: 'fa-shield',
    category: 'SPECIAL',
    condition: (stats: PlayerStats) => stats.playerFlags['DRAMAS_SURVIVED_5'] === true,
    reward: { reputation: 10, score: 3500 },
  },
  {
    id: 'exit_artist',
    name: 'Exit Artist',
    description: 'Complete 3 different types of exits (IPO, Strategic, Secondary, etc.).',
    icon: 'fa-signs-post',
    category: 'DEALS',
    condition: (stats: PlayerStats) => {
      const exitTypes = new Set(stats.completedExits?.map(e => e.exitType) ?? []);
      return exitTypes.size >= 3;
    },
    reward: { financialEngineering: 10, reputation: 10, score: 5000 },
  },
];

export const getAchievementById = (id: string): AchievementDefinition | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getAchievementsByCategory = (category: AchievementDefinition['category']): AchievementDefinition[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

export const getVisibleAchievements = (unlockedIds: string[]): AchievementDefinition[] => {
  return ACHIEVEMENTS.filter(a => !a.isSecret || unlockedIds.includes(a.id));
};
