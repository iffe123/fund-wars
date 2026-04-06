import { describe, expect, it } from 'vitest';
import { createEventMap } from '../constants/rpgContent';
import { NORMAL_STATS } from '../constants/player';
import { checkChoiceRequirements } from '../utils/eventQueueManager';
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
  });

  it('normalizes legacy story copy to canonical names', () => {
    expect(getCanonicalSpeakerName('chad', 'Chad Morrison')).toBe('Chad Worthington III');
    expect(normalizeStoryCopy('Meridian Capital and Chad Morrison are in the room.')).toBe(
      'Meridian Partners and Chad Worthington III are in the room.'
    );
  });
});
