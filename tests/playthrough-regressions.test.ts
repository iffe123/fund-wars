import { describe, expect, it } from 'vitest';
import { createEventMap } from '../constants/rpgContent';
import { NORMAL_STATS } from '../constants/player';
import { checkChoiceRequirements } from '../utils/eventQueueManager';
import { hasPendingInteraction } from '../components/NpcListPanel';
import {
  formatStatDisplayName,
  getCanonicalSpeakerName,
  normalizeStoryCopy,
} from '../utils/presentationText';

describe('April 5 playthrough regressions', () => {
  it('starts a fresh run on week 1 with 3 AP and non-crisis stress', () => {
    expect(NORMAL_STATS.gameTime.week).toBe(1);
    expect(NORMAL_STATS.gameTime.actionsRemaining).toBe(3);
    expect(NORMAL_STATS.gameTime.maxActions).toBe(3);
    expect(NORMAL_STATS.stress).toBeLessThanOrEqual(50);
  });

  it('locks the partial family-help option when cash is insufficient', () => {
    const event = createEventMap().get('evt_family_emergency');
    const choice = event?.choices.find((candidate) => candidate.id === 'send_half');

    expect(choice).toBeDefined();

    const availability = checkChoiceRequirements(
      choice?.requires,
      {
        ...NORMAL_STATS,
        cash: 2975,
        personalFinances: {
          ...NORMAL_STATS.personalFinances,
          bankBalance: 2975,
        },
      },
      [],
      new Set<string>()
    );

    expect(availability.available).toBe(false);
    expect(availability.reason).toBe('Requires Cash 10000+');
  });

  it('formats stat labels into player-facing copy', () => {
    expect(formatStatDisplayName('analystRating')).toBe('Analyst Rating');
    expect(formatStatDisplayName('financialEngineering')).toBe('Financial Engineering');
    expect(formatStatDisplayName('riskManagement')).toBe('Risk Management');
    expect(formatStatDisplayName('dealExecution')).toBe('Deal Execution');
  });

  it('does not mark initial NPC seed greetings as pending replies', () => {
    expect(
      hasPendingInteraction({
        id: 'sarah',
        name: 'Sarah',
        role: 'Senior Analyst',
        avatar: 'fa-glasses',
        relationship: 60,
        mood: 65,
        trust: 60,
        traits: [],
        memories: [],
        isRival: false,
        dialogueHistory: [
          { sender: 'npc', senderName: 'Sarah', text: 'Welcome to the desk.' },
        ],
      })
    ).toBe(false);
  });

  it('marks real NPC follow-ups as pending after the player starts a thread', () => {
    expect(
      hasPendingInteraction({
        id: 'sarah',
        name: 'Sarah',
        role: 'Senior Analyst',
        avatar: 'fa-glasses',
        relationship: 60,
        mood: 65,
        trust: 60,
        traits: [],
        memories: [],
        isRival: false,
        dialogueHistory: [
          { sender: 'npc', senderName: 'Sarah', text: 'Welcome to the desk.' },
          { sender: 'player', senderName: 'Alex', text: 'Can you review PackFancy?' },
          { sender: 'npc', senderName: 'Sarah', text: 'Yes. Patent 8829 matters.', timestamp: Date.now() },
        ],
      })
    ).toBe(true);
  });

  it('normalizes legacy story copy to canonical names', () => {
    expect(getCanonicalSpeakerName('chad', 'Chad Morrison')).toBe('Chad Worthington III');
    expect(normalizeStoryCopy('Meridian Capital and Chad Morrison are in the room.')).toBe(
      'Meridian Partners and Chad Worthington III are in the room.'
    );
  });
});
