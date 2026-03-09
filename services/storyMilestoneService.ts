/**
 * Story Milestone Service
 *
 * Bridges the narrative story system (storyContent.ts scenes) with the
 * sandbox simulator. Each milestone references a story scene that triggers
 * when specific game-state conditions are met.
 */

import type { PlayerStats, NPC } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface StoryMilestone {
  id: string;
  sceneId: string; // Reference to a Scene.id in storyContent.ts
  triggerConditions: {
    minWeek?: number;
    minReputation?: number;
    maxReputation?: number;
    minStress?: number;
    maxStress?: number;
    minEthics?: number;
    maxEthics?: number;
    minCash?: number;
    minPortfolioSize?: number;
    requiredFlags?: string[];
    blockedByFlags?: string[];
    npcTrust?: { npcId: string; min: number }[];
    customCheck?: string;
  };
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  oneShot: boolean;
  category: 'CAREER' | 'NPC' | 'DEAL' | 'ETHICAL' | 'CRISIS';
}

// ============================================================================
// MILESTONE DEFINITIONS — 20 milestones from the best story scenes
// ============================================================================

export const STORY_MILESTONES: StoryMilestone[] = [
  // --- CAREER MILESTONES ---
  {
    id: 'ms_first_day',
    sceneId: 'ch1_opening',
    triggerConditions: { minWeek: 1, blockedByFlags: ['MS_FIRST_DAY_DONE'] },
    priority: 'HIGH',
    oneShot: true,
    category: 'CAREER',
  },
  {
    id: 'ms_chad_assignment',
    sceneId: 'ch1_meet_chad_confident',
    triggerConditions: {
      minWeek: 2,
      minPortfolioSize: 1,
      blockedByFlags: ['MS_CHAD_ASSIGNMENT_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'CAREER',
  },
  {
    id: 'ms_first_deal_chapter',
    sceneId: 'ch2_opening',
    triggerConditions: {
      minWeek: 5,
      minPortfolioSize: 1,
      minReputation: 15,
      blockedByFlags: ['MS_FIRST_DEAL_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'DEAL',
  },
  {
    id: 'ms_negotiation_table',
    sceneId: 'ch3_opening',
    triggerConditions: {
      minWeek: 10,
      minPortfolioSize: 2,
      minReputation: 25,
      blockedByFlags: ['MS_NEGOTIATION_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'DEAL',
  },
  {
    id: 'ms_promotion_reckoning',
    sceneId: 'ch4_opening',
    triggerConditions: {
      minWeek: 26,
      minReputation: 40,
      blockedByFlags: ['MS_RECKONING_DONE'],
    },
    priority: 'CRITICAL',
    oneShot: true,
    category: 'CAREER',
  },
  {
    id: 'ms_proprietary_or_perish',
    sceneId: 'ch5_opening',
    triggerConditions: {
      minWeek: 40,
      minPortfolioSize: 3,
      minReputation: 50,
      blockedByFlags: ['MS_PROPRIETARY_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'CAREER',
  },
  {
    id: 'ms_the_whale',
    sceneId: 'ch6_opening',
    triggerConditions: {
      minWeek: 52,
      minPortfolioSize: 4,
      minReputation: 60,
      minCash: 100000,
      blockedByFlags: ['MS_WHALE_DONE'],
    },
    priority: 'CRITICAL',
    oneShot: true,
    category: 'DEAL',
  },
  {
    id: 'ms_100_days',
    sceneId: 'ch7_opening',
    triggerConditions: {
      minWeek: 65,
      minReputation: 65,
      blockedByFlags: ['MS_100_DAYS_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'CAREER',
  },
  {
    id: 'ms_the_exit',
    sceneId: 'ch8_opening',
    triggerConditions: {
      minWeek: 80,
      minReputation: 70,
      minPortfolioSize: 2,
      blockedByFlags: ['MS_EXIT_DONE'],
    },
    priority: 'CRITICAL',
    oneShot: true,
    category: 'CAREER',
  },

  // --- NPC MILESTONES ---
  {
    id: 'ms_sarah_ally',
    sceneId: 'ch1_sarah_bond',
    triggerConditions: {
      minWeek: 2,
      npcTrust: [{ npcId: 'sarah', min: 55 }],
      blockedByFlags: ['MS_SARAH_ALLY_DONE'],
    },
    priority: 'MEDIUM',
    oneShot: true,
    category: 'NPC',
  },
  {
    id: 'ms_hunter_rivalry',
    sceneId: 'ch1_hunter_enemy',
    triggerConditions: {
      minWeek: 3,
      npcTrust: [{ npcId: 'hunter', min: 0 }], // any trust, the scene creates the rivalry
      blockedByFlags: ['MS_HUNTER_RIVALRY_DONE', 'MS_HUNTER_ALLY_DONE'],
    },
    priority: 'MEDIUM',
    oneShot: true,
    category: 'NPC',
  },
  {
    id: 'ms_hunter_intro',
    sceneId: 'ch1_hunter_intro',
    triggerConditions: {
      minWeek: 2,
      blockedByFlags: ['MS_HUNTER_INTRO_DONE'],
    },
    priority: 'MEDIUM',
    oneShot: true,
    category: 'NPC',
  },
  {
    id: 'ms_chad_angry',
    sceneId: 'ch1_chad_angry',
    triggerConditions: {
      minWeek: 4,
      maxReputation: 20,
      npcTrust: [{ npcId: 'chad', min: 0 }],
      blockedByFlags: ['MS_CHAD_ANGRY_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'NPC',
  },
  {
    id: 'ms_kowalski_confrontation',
    sceneId: 'ch4_kowalski_confrontation',
    triggerConditions: {
      minWeek: 30,
      minPortfolioSize: 2,
      minReputation: 30,
      maxEthics: 60,
      blockedByFlags: ['MS_KOWALSKI_DONE'],
    },
    priority: 'CRITICAL',
    oneShot: true,
    category: 'NPC',
  },

  // --- ETHICAL DILEMMA MILESTONES ---
  {
    id: 'ms_lobby_crossroads',
    sceneId: 'ch1_lobby_dilemma',
    triggerConditions: {
      minWeek: 3,
      blockedByFlags: ['MS_CROSSROADS_DONE'],
    },
    priority: 'MEDIUM',
    oneShot: true,
    category: 'ETHICAL',
  },
  {
    id: 'ms_ethical_path',
    sceneId: 'ch2_ethical_path',
    triggerConditions: {
      minWeek: 8,
      minEthics: 60,
      blockedByFlags: ['MS_ETHICAL_PATH_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'ETHICAL',
  },
  {
    id: 'ms_first_win',
    sceneId: 'ch1_chad_impressed',
    triggerConditions: {
      minWeek: 6,
      minPortfolioSize: 2,
      minReputation: 25,
      blockedByFlags: ['MS_FIRST_WIN_DONE'],
    },
    priority: 'MEDIUM',
    oneShot: true,
    category: 'CAREER',
  },

  // --- CRISIS MILESTONES ---
  {
    id: 'ms_stress_meltdown',
    sceneId: 'ch1_chad_angry',
    triggerConditions: {
      minStress: 80,
      blockedByFlags: ['MS_MELTDOWN_DONE'],
    },
    priority: 'CRITICAL',
    oneShot: true,
    category: 'CRISIS',
  },
  {
    id: 'ms_consortium_crisis',
    sceneId: 'ch6_consortium_crisis',
    triggerConditions: {
      minWeek: 55,
      minPortfolioSize: 4,
      minReputation: 55,
      blockedByFlags: ['MS_CONSORTIUM_DONE'],
    },
    priority: 'CRITICAL',
    oneShot: true,
    category: 'CRISIS',
  },
  {
    id: 'ms_cash_crisis',
    sceneId: 'ch7_cash_crisis',
    triggerConditions: {
      minWeek: 40,
      minCash: 0,
      maxStress: 90,
      blockedByFlags: ['MS_CASH_CRISIS_DONE'],
    },
    priority: 'HIGH',
    oneShot: true,
    category: 'CRISIS',
  },
];

// ============================================================================
// MILESTONE CHECKER
// ============================================================================

/**
 * Check if a milestone's trigger conditions are met.
 */
export function checkMilestoneConditions(
  milestone: StoryMilestone,
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>,
): boolean {
  const c = milestone.triggerConditions;

  // Week check
  const currentWeek = playerStats.gameTime?.week ?? playerStats.timeCursor ?? 0;
  if (c.minWeek !== undefined && currentWeek < c.minWeek) return false;

  // Reputation
  if (c.minReputation !== undefined && playerStats.reputation < c.minReputation) return false;
  if (c.maxReputation !== undefined && playerStats.reputation > c.maxReputation) return false;

  // Stress
  if (c.minStress !== undefined && playerStats.stress < c.minStress) return false;
  if (c.maxStress !== undefined && playerStats.stress > c.maxStress) return false;

  // Ethics
  if (c.minEthics !== undefined && playerStats.ethics < c.minEthics) return false;
  if (c.maxEthics !== undefined && playerStats.ethics > c.maxEthics) return false;

  // Cash
  if (c.minCash !== undefined && playerStats.cash < c.minCash) return false;

  // Portfolio size
  if (c.minPortfolioSize !== undefined && playerStats.portfolio.length < c.minPortfolioSize) return false;

  // Flags
  if (c.requiredFlags?.some(f => !worldFlags.has(f))) return false;
  if (c.blockedByFlags?.some(f => worldFlags.has(f))) return false;

  // NPC trust/relationship
  if (c.npcTrust) {
    for (const req of c.npcTrust) {
      const npc = npcs.find(n => n.id === req.npcId);
      if (!npc) return false;
      const trust = npc.trust ?? npc.relationship ?? 0;
      if (trust < req.min) return false;
    }
  }

  return true;
}

/**
 * Get the flag name set when a milestone is triggered.
 */
export function getMilestoneDoneFlag(milestoneId: string): string {
  return milestoneId.replace('ms_', 'MS_').toUpperCase() + '_DONE';
}

/**
 * Find the highest-priority milestone whose conditions are currently met.
 */
export function getTriggeredMilestone(
  playerStats: PlayerStats,
  npcs: NPC[],
  worldFlags: Set<string>,
  triggeredIds: Set<string>,
): StoryMilestone | null {
  const priorityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  const eligible = STORY_MILESTONES
    .filter(ms => !triggeredIds.has(ms.id))
    .filter(ms => checkMilestoneConditions(ms, playerStats, npcs, worldFlags))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return eligible[0] ?? null;
}
