import { describe, expect, it } from 'vitest';
import { hydrateNpc, sanitizeKnowledgeLog, sanitizeKnowledgeFlags, hydrateFund, hydrateCompetitiveDeal } from './gameUtils';
import { DealType, type NPC } from '../types';

const baseNpc: NPC = {
  id: 'npc1',
  name: 'Tester',
  role: 'QA',
  avatar: 'fa-user',
  relationship: 50,
  mood: 20,
  trust: 10,
  traits: [],
  memories: [],
  isRival: false,
  dialogueHistory: [],
};

describe('hydrateNpc', () => {
  it('guards against missing mood/trust and normalizes memories', () => {
    const npc = hydrateNpc({ ...baseNpc, mood: undefined as unknown as number, memories: ['met at bar'] });
    expect(npc.mood).toBeGreaterThanOrEqual(0);
    expect(npc.trust).toBeGreaterThanOrEqual(0);
    expect(npc.memories[0]).toHaveProperty('timestamp');
    expect(npc.memories[0]).toHaveProperty('sourceNpcId', 'npc1');
  });
});

describe('sanitizeKnowledge helpers', () => {
  it('drops malformed knowledge entries and preserves summaries', () => {
    const cleaned = sanitizeKnowledgeLog([{ summary: 'Valid' }, { foo: 'bar' } as any, 'String entry']);
    expect(cleaned.length).toBe(2);
    expect(cleaned[0].summary).toBeDefined();
  });

  it('returns an empty array for invalid flags', () => {
    expect(sanitizeKnowledgeFlags('oops')).toEqual([]);
    expect(sanitizeKnowledgeFlags([1, 'good'])).toEqual(['good']);
  });
});

describe('hydrateFund', () => {
  it('fills in defaults for rival funds', () => {
    const fund = hydrateFund({
      id: 'fund1',
      name: 'Fund',
      managingPartner: 'Boss',
      npcId: 'npc1',
      strategy: 'PREDATORY',
      aum: undefined as any,
      dryPowder: undefined as any,
      portfolio: undefined as any,
      winStreak: undefined as any,
      totalDeals: undefined as any,
      reputation: -10 as any,
      aggressionLevel: 200 as any,
      riskTolerance: 200 as any,
      vendetta: undefined as any,
      lastActionTick: undefined as any,
    });

    expect(fund.aum).toBe(0);
    expect(fund.portfolio).toEqual([]);
    expect(fund.reputation).toBeGreaterThanOrEqual(0);
    expect(fund.aggressionLevel).toBeLessThanOrEqual(100);
  });
});

describe('hydrateCompetitiveDeal', () => {
  it('returns null for bad payloads', () => {
    expect(hydrateCompetitiveDeal(null)).toBeNull();
  });

  it('applies numeric fallbacks', () => {
    const hydrated = hydrateCompetitiveDeal({ id: 'abc', askingPrice: '100', dealType: DealType.LBO });
    expect(hydrated).not.toBeNull();
    expect(hydrated?.askingPrice).toBe(0);
    expect(hydrated?.dealType).toBe(DealType.LBO);
  });
});
