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
