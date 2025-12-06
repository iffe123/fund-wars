/**
 * Game Utility Functions
 * Extracted from GameContext to reduce file size and improve reusability
 */

import type {
  NPCMemory,
  KnowledgeEntry,
  FactionReputation,
  NPC,
  RivalFund,
  CompetitiveDeal,
  TimeSlot,
  DayType
} from '../types';
import { DealType } from '../types';
import { DEFAULT_FACTION_REPUTATION } from '../constants';

// ==================== STAT UTILITIES ====================

export const clampStat = (value: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, value));

// ==================== ID GENERATION ====================

let portfolioIdCounter = 0;

export const generateUniquePortfolioId = (existingIds: number[]): number => {
  let newId: number;
  do {
    newId = Date.now() + (++portfolioIdCounter) + Math.floor(Math.random() * 1000);
  } while (existingIds.includes(newId));
  return newId;
};

// ==================== TIME UTILITIES ====================

export const TIME_SLOTS: TimeSlot[] = ['MORNING', 'AFTERNOON', 'EVENING'];

export const getNextTimeState = (
  currentDayType: DayType,
  currentTimeSlot: TimeSlot
): { nextDayType: DayType; nextSlot: TimeSlot } => {
  const slotIndex = TIME_SLOTS.indexOf(currentTimeSlot);
  const nextSlot = TIME_SLOTS[(slotIndex + 1) % TIME_SLOTS.length];
  const nextDayType: DayType = nextSlot === 'MORNING'
    ? currentDayType === 'WEEKDAY' ? 'WEEKEND' : 'WEEKDAY'
    : currentDayType;
  return { nextDayType, nextSlot };
};

export const isNpcAvailable = (npc: NPC, dayType: DayType, timeSlot: TimeSlot): boolean => {
  const schedule = npc.schedule;
  if (!schedule) return true;
  const slots = dayType === 'WEEKDAY' ? schedule.weekday : schedule.weekend;
  return slots.includes(timeSlot);
};

// ==================== FACTION UTILITIES ====================

export const hydrateFactionReputation = (factionRep?: FactionReputation): FactionReputation => {
  const hydrated: FactionReputation = { ...DEFAULT_FACTION_REPUTATION };
  if (!factionRep) return hydrated;

  (Object.keys(hydrated) as Array<keyof FactionReputation>).forEach(key => {
    hydrated[key] = clampStat(factionRep[key] ?? hydrated[key]);
  });
  return hydrated;
};

// ==================== MEMORY & KNOWLEDGE UTILITIES ====================

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'fact';

export const normalizeMemory = (
  memory: NPCMemory | string,
  fallbackSourceId?: string
): NPCMemory => {
  const base: NPCMemory = typeof memory === 'string' ? { summary: memory } : memory;
  const now = new Date().toISOString();
  return {
    summary: base.summary,
    timestamp: base.timestamp || now,
    sentiment: base.sentiment,
    impact: base.impact,
    tags: base.tags || [],
    sourceNpcId: base.sourceNpcId || fallbackSourceId,
  };
};

export const clampMemories = (memories: NPCMemory[]): NPCMemory[] =>
  memories.slice(-12);

export const normalizeKnowledgeEntry = (
  entry: KnowledgeEntry | string,
  fallbackSource?: string
): KnowledgeEntry => {
  const base: KnowledgeEntry = typeof entry === 'string' ? { summary: entry } : entry;
  const timestamp = base.timestamp || new Date().toISOString();
  const summary = base.summary || '';
  const id = base.id || `${slugify(summary).slice(0, 40)}-${timestamp}`;
  return {
    ...base,
    id,
    summary,
    timestamp,
    source: base.source || fallbackSource,
    tags: base.tags || [],
  };
};

export const clampKnowledge = (entries: KnowledgeEntry[]): KnowledgeEntry[] =>
  entries.slice(-18);

export const sanitizeKnowledgeLog = (entries?: unknown): KnowledgeEntry[] => {
  if (!Array.isArray(entries)) return [];

  const normalized = entries
    .map(entry => normalizeKnowledgeEntry(entry as KnowledgeEntry | string))
    .filter(entry => Boolean(entry.summary));

  return clampKnowledge(normalized);
};

export const sanitizeKnowledgeFlags = (flags?: unknown): string[] => {
  if (!Array.isArray(flags)) return [];
  return flags.filter((flag): flag is string => typeof flag === 'string');
};

// ==================== NPC HYDRATION ====================

export const hydrateNpc = (npc: NPC): NPC => {
  const hydratedMemories = Array.isArray(npc.memories)
    ? clampMemories(npc.memories.map(m => normalizeMemory(m, npc.id)))
    : [];

  return {
    ...npc,
    mood: clampStat(typeof npc.mood === 'number' ? npc.mood : npc.relationship),
    trust: clampStat(typeof npc.trust === 'number' ? npc.trust : npc.relationship),
    dialogueHistory: npc.dialogueHistory || [],
    memories: hydratedMemories,
    lastContactTick: typeof npc.lastContactTick === 'number' ? npc.lastContactTick : 0,
  };
};

// ==================== RIVAL FUND HYDRATION (Consolidated) ====================

/**
 * Hydrates a RivalFund with default values for missing properties
 * Note: This consolidates the previous hydrateRivalFund and hydrateFund functions
 */
export const hydrateRivalFund = (fund: RivalFund): RivalFund => ({
  ...fund,
  reputation: clampStat(typeof fund.reputation === 'number' ? fund.reputation : 50),
  aggressionLevel: clampStat(typeof fund.aggressionLevel === 'number' ? fund.aggressionLevel : 50),
  riskTolerance: clampStat(typeof fund.riskTolerance === 'number' ? fund.riskTolerance : 50),
  vendetta: clampStat(typeof fund.vendetta === 'number' ? fund.vendetta : 40),
  winStreak: typeof fund.winStreak === 'number' ? fund.winStreak : 0,
  totalDeals: typeof fund.totalDeals === 'number' ? fund.totalDeals : 0,
  dryPowder: typeof fund.dryPowder === 'number' ? fund.dryPowder : 0,
  aum: typeof fund.aum === 'number' ? fund.aum : 0,
  portfolio: Array.isArray(fund.portfolio) ? fund.portfolio : [],
  lastActionTick: typeof fund.lastActionTick === 'number' ? fund.lastActionTick : -1,
});

// Alias for backwards compatibility
export const hydrateFund = hydrateRivalFund;

// ==================== COMPETITIVE DEAL HYDRATION ====================

export const hydrateCompetitiveDeal = (deal: unknown): CompetitiveDeal | null => {
  if (!deal || typeof deal !== 'object') return null;

  const d = deal as Record<string, unknown>;

  const numeric = <T extends number>(value: unknown, fallback: T): T =>
    typeof value === 'number' && !Number.isNaN(value) ? value as T : fallback;

  const metrics = d.metrics as Record<string, unknown> | undefined;

  return {
    id: numeric(d.id, Date.now()),
    companyName: (d.companyName as string) || 'Unknown Target',
    sector: (d.sector as string) || 'Misc',
    description: (d.description as string) || 'No description',
    askingPrice: numeric(d.askingPrice, 0),
    fairValue: numeric(d.fairValue, numeric(d.askingPrice, 0)),
    dealType: (d.dealType as DealType) || DealType.LBO,
    metrics: {
      revenue: numeric(metrics?.revenue, 0),
      ebitda: numeric(metrics?.ebitda, 0),
      growth: numeric(metrics?.growth, 0),
      debt: numeric(metrics?.debt, 0),
    },
    seller: (d.seller as string) || 'Unknown Seller',
    deadline: numeric(d.deadline, 3),
    interestedRivals: Array.isArray(d.interestedRivals) ? d.interestedRivals as string[] : [],
    isHot: Boolean(d.isHot),
    hiddenRisk: d.hiddenRisk as string | undefined,
    hiddenUpside: d.hiddenUpside as string | undefined,
  };
};

// ==================== CONSTANTS ====================

export const MAX_PORTFOLIO_SIZE = 8;
