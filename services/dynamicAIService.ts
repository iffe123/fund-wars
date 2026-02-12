/**
 * Dynamic AI Service
 *
 * Uses Gemini to generate dynamic narrative content that enhances
 * the static story scenes. All functions have offline fallbacks.
 */

import { GoogleGenAI } from '@google/genai';
import type {
  Scene,
  Choice,
  GameState,
  Chapter,
  PlayerStats,
  DynamicContent,
  StoryPath,
} from '../types/storyEngine';

// @ts-ignore
const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_API_KEY
  : undefined;

let _aiClient: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI | null => {
  if (!API_KEY) return null;
  if (!_aiClient) {
    _aiClient = new GoogleGenAI({ apiKey: API_KEY });
  }
  return _aiClient;
};

export const isDynamicAIAvailable = (): boolean => !!API_KEY;

// Retry wrapper
const withTimeout = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number = 15000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Dynamic AI timed out')), timeoutMs)
  );
  return Promise.race([operation(), timeoutPromise]);
};

// ============================================================================
// DYNAMIC NARRATIVE ENHANCEMENT
// ============================================================================

const NARRATIVE_SYSTEM = `You are a narrative enhancement engine for a private equity RPG called "Fund Wars".
Your job is to add a SHORT (1-2 sentence) personalized narrative addition to existing scene text.
The addition should reflect the player's current state, path, and recent choices.

RULES:
- Maximum 2 sentences
- Match the existing tone (dark, witty, finance-savvy)
- Reference specific player stats or recent events when relevant
- Never contradict the existing narrative
- Use second person ("you")
- Be vivid and specific, not generic
- Output ONLY the narrative text, no JSON or labels`;

export const generateDynamicNarrative = async (
  scene: Scene,
  gameState: GameState,
  currentPath?: string | null,
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return getOfflineNarrative(scene, gameState);

  try {
    const prompt = buildNarrativePrompt(scene, gameState, currentPath);
    const response = await withTimeout(async () => {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: NARRATIVE_SYSTEM },
      } as any);
      return r;
    });

    const text = ((response as any)?.text || '').trim();
    return text.length > 0 && text.length < 500 ? text : null;
  } catch {
    return getOfflineNarrative(scene, gameState);
  }
};

function buildNarrativePrompt(
  scene: Scene,
  gameState: GameState,
  currentPath?: string | null,
): string {
  const recentChoices = gameState.choiceHistory?.slice(-3).join(', ') || 'none';
  return `SCENE: "${scene.title}" (${scene.type})
ATMOSPHERE: ${scene.atmosphere || 'office'}
EXISTING NARRATIVE (first 200 chars): "${scene.narrative.slice(0, 200)}..."

PLAYER STATE:
- Name: ${gameState.playerName}
- Path: ${currentPath || 'undecided'}
- Reputation: ${gameState.stats.reputation}/100
- Stress: ${gameState.stats.stress}/100
- Ethics: ${gameState.stats.ethics}/100
- Money: $${gameState.stats.money.toLocaleString()}
- Dealcraft: ${gameState.stats.dealcraft}/100
- Politics: ${gameState.stats.politics}/100
- Chapters completed: ${gameState.completedChapters.length}
- Recent choices: ${recentChoices}

Generate a 1-2 sentence narrative addition that personalizes this scene.`;
}

function getOfflineNarrative(scene: Scene, gameState: GameState): string | null {
  const { stress, reputation, ethics } = gameState.stats;

  if (stress > 70) {
    const stressLines = [
      'Your hand trembles slightly as you grip the armrest. The pressure is starting to show.',
      'A familiar tightness grips your chest. How long can you keep this pace?',
      'You catch yourself grinding your teeth again. The stress is becoming physical.',
    ];
    return stressLines[Math.floor(Math.random() * stressLines.length)];
  }

  if (reputation > 70) {
    const repLines = [
      'People nod to you as you pass—your reputation precedes you now.',
      'You notice junior analysts watching you. Your name carries weight here.',
    ];
    return repLines[Math.floor(Math.random() * repLines.length)];
  }

  if (ethics < 30) {
    const ethicsLines = [
      'Somewhere in the back of your mind, a quieter version of yourself wonders how you got here.',
      'The corner you cut last time made things easier. The next corner will be easier still.',
    ];
    return ethicsLines[Math.floor(Math.random() * ethicsLines.length)];
  }

  // Scene-atmosphere-based fallbacks
  if (scene.atmosphere === 'crisis') {
    return 'The air in the room feels heavier than usual. Something is about to break.';
  }

  return null;
}

// ============================================================================
// DYNAMIC NARRATOR COMMENTARY
// ============================================================================

const NARRATOR_SYSTEM = `You are the sarcastic, omniscient narrator of "Fund Wars", a dark private equity RPG.
Generate a SHORT (1 sentence) sarcastic narrator comment about the player's choice.
Think: The Stanley Parable meets Wall Street.

RULES:
- Maximum 1 sentence
- Be sardonic, witty, and cutting
- Reference the specific choice and its implications
- Break the fourth wall occasionally
- Output ONLY the comment text`;

export const generateNarratorCommentary = async (
  choiceText: string,
  gameState: GameState,
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return getOfflineCommentary(choiceText, gameState);

  try {
    const prompt = `CHOICE MADE: "${choiceText}"
PLAYER: ${gameState.playerName} | REP: ${gameState.stats.reputation} | ETHICS: ${gameState.stats.ethics} | STRESS: ${gameState.stats.stress}
PATH: ${gameState.currentPath || 'undecided'}

Generate a sarcastic 1-sentence narrator comment.`;

    const response = await withTimeout(async () => {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: NARRATOR_SYSTEM },
      } as any);
      return r;
    });

    const text = ((response as any)?.text || '').trim();
    return text.length > 0 && text.length < 300 ? text : null;
  } catch {
    return getOfflineCommentary(choiceText, gameState);
  }
};

function getOfflineCommentary(choiceText: string, gameState: GameState): string | null {
  const comments = [
    'Bold move. Let\'s see if it pays off.',
    'Interesting choice. Your therapist will hear about this one.',
    'Ah yes, the classic "wing it" strategy. Wall Street\'s finest.',
    'Your future self just flinched.',
    'Somewhere, a compliance officer just felt a disturbance in the force.',
    'That choice will echo through the halls of Sterling Partners. For better or worse.',
    'A decision was made. Whether it was good remains to be seen.',
    'The universe noted your choice, filed it under "questionable decisions," and moved on.',
  ];

  if (gameState.stats.ethics < 30) {
    comments.push('You didn\'t even hesitate. That should worry you.');
    comments.push('Another day, another moral compromise. You\'re getting good at this.');
  }
  if (gameState.stats.stress > 70) {
    comments.push('You made that choice faster than usual. Stress does that.');
  }

  return comments[Math.floor(Math.random() * comments.length)];
}

// ============================================================================
// DYNAMIC BONUS CHOICES
// ============================================================================

const CHOICE_SYSTEM = `You are generating a bonus choice for a private equity RPG scene.
The bonus choice should be creative, unexpected, and reflect the player's unique path/stats.

OUTPUT FORMAT (JSON only):
{
  "text": "What the player says/does (max 80 chars)",
  "subtext": "Brief explanation (max 100 chars)",
  "narratorComment": "Sarcastic comment (max 100 chars)",
  "style": "risky|safe|ethical|unethical|hidden",
  "effects": {
    "stats": { "reputation": 0, "stress": 0, "ethics": 0, "dealcraft": 0, "politics": 0 },
    "money": 0
  }
}`;

export interface BonusChoiceResult {
  text: string;
  subtext: string;
  narratorComment: string;
  style: 'risky' | 'safe' | 'ethical' | 'unethical' | 'hidden';
  effects: {
    stats: Partial<PlayerStats>;
    money?: number;
  };
}

export const generateBonusChoice = async (
  scene: Scene,
  gameState: GameState,
  existingChoices: string[],
): Promise<BonusChoiceResult | null> => {
  const ai = getAiClient();
  if (!ai) return getOfflineBonusChoice(scene, gameState);

  try {
    const prompt = `SCENE: "${scene.title}" - ${scene.narrative.slice(0, 300)}...
EXISTING CHOICES: ${existingChoices.join(' | ')}
PLAYER: ${gameState.playerName} | Path: ${gameState.currentPath || 'undecided'}
STATS: REP ${gameState.stats.reputation} | ETH ${gameState.stats.ethics} | STR ${gameState.stats.stress} | DC ${gameState.stats.dealcraft} | POL ${gameState.stats.politics}

Generate ONE creative bonus choice that doesn't overlap with existing choices. Output JSON only.`;

    const response = await withTimeout(async () => {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: CHOICE_SYSTEM },
      } as any);
      return r;
    });

    const text = ((response as any)?.text || '').trim();
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.text) return null;

    return {
      text: String(parsed.text).slice(0, 80),
      subtext: String(parsed.subtext || '').slice(0, 100),
      narratorComment: String(parsed.narratorComment || '').slice(0, 100),
      style: ['risky', 'safe', 'ethical', 'unethical', 'hidden'].includes(parsed.style)
        ? parsed.style
        : 'risky',
      effects: {
        stats: parsed.effects?.stats || {},
        money: parsed.effects?.money || 0,
      },
    };
  } catch {
    return getOfflineBonusChoice(scene, gameState);
  }
};

function getOfflineBonusChoice(scene: Scene, gameState: GameState): BonusChoiceResult | null {
  const { dealcraft, politics, ethics, stress } = gameState.stats;

  // Only generate bonus choices sometimes (50% chance offline)
  if (Math.random() > 0.5) return null;

  if (dealcraft > 60) {
    return {
      text: 'Leverage your deal experience to reframe the situation',
      subtext: 'Your dealcraft opens a path others can\'t see',
      narratorComment: 'Showoff. But it might work.',
      style: 'risky',
      effects: { stats: { reputation: 3, stress: 5, dealcraft: 2 } },
    };
  }

  if (politics > 60) {
    return {
      text: 'Work the room—call in a favor from your network',
      subtext: 'Your political connections pay dividends',
      narratorComment: 'It\'s not what you know, it\'s who you know.',
      style: 'hidden',
      effects: { stats: { politics: 2, reputation: 2 } },
    };
  }

  if (ethics > 70) {
    return {
      text: 'Take the high road and set an example',
      subtext: 'Integrity might cost you now but pays later',
      narratorComment: 'How refreshingly naive. Or is it?',
      style: 'ethical',
      effects: { stats: { ethics: 3, reputation: 2, stress: -2 } },
    };
  }

  if (stress > 60) {
    return {
      text: 'Step away. Take five minutes to clear your head.',
      subtext: 'Sometimes the best move is no move',
      narratorComment: 'Self-care? In private equity? Revolutionary.',
      style: 'safe',
      effects: { stats: { stress: -8, reputation: -1 } },
    };
  }

  return null;
}

// ============================================================================
// PATH RECOMMENDATION
// ============================================================================

const PATH_SYSTEM = `You are a career counselor in a dark private equity RPG.
Based on the player's stats and choices, generate a brief (2-3 sentence) personalized description
of why a particular career path suits them. Be specific, referencing their stats and past behavior.

RULES:
- Be dramatic and evocative
- Reference specific stats (use numbers)
- Foreshadow what lies ahead on this path
- Output ONLY the description text`;

export const generatePathDescription = async (
  path: StoryPath,
  gameState: GameState,
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `PATH: "${path.title}" - ${path.description}
PRIMARY STAT: ${path.primaryStat} = ${gameState.stats[path.primaryStat]}
PLAYER: ${gameState.playerName}
ALL STATS: REP ${gameState.stats.reputation} | ETH ${gameState.stats.ethics} | STR ${gameState.stats.stress} | DC ${gameState.stats.dealcraft} | POL ${gameState.stats.politics} | $${gameState.stats.money}
RECENT CHOICES: ${gameState.choiceHistory?.slice(-5).join(', ') || 'none'}
COMPLETED CHAPTERS: ${gameState.completedChapters.join(', ')}

Generate a 2-3 sentence personalized description of why this path suits this player.`;

    const response = await withTimeout(async () => {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: PATH_SYSTEM },
      } as any);
      return r;
    });

    const text = ((response as any)?.text || '').trim();
    return text.length > 0 && text.length < 600 ? text : null;
  } catch {
    return null;
  }
};

// ============================================================================
// DYNAMIC SCENE SUMMARY (for transitions)
// ============================================================================

export const generateChapterSummary = async (
  chapter: Chapter,
  gameState: GameState,
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return getOfflineChapterSummary(chapter, gameState);

  try {
    const prompt = `The player just completed chapter "${chapter.title}" (${chapter.theme}).
STATS: REP ${gameState.stats.reputation} | ETH ${gameState.stats.ethics} | STR ${gameState.stats.stress} | DC ${gameState.stats.dealcraft} | POL ${gameState.stats.politics} | $${gameState.stats.money}
PATH: ${gameState.currentPath || 'not yet chosen'}
FLAGS: ${Array.from(gameState.flags).slice(-10).join(', ')}

Generate a 2-3 sentence dramatic summary of how this chapter shaped the player's journey. Reference specific stats.`;

    const response = await withTimeout(async () => {
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: 'You are the narrator of a dark PE RPG. Write dramatic, personalized chapter summaries. 2-3 sentences max. Output text only.',
        },
      } as any);
      return r;
    });

    const text = ((response as any)?.text || '').trim();
    return text.length > 0 ? text : null;
  } catch {
    return getOfflineChapterSummary(chapter, gameState);
  }
};

function getOfflineChapterSummary(chapter: Chapter, gameState: GameState): string {
  const { reputation, stress, ethics } = gameState.stats;

  if (stress > 70) {
    return `Chapter "${chapter.title}" took its toll. Your stress is dangerously high at ${stress}—the cracks are starting to show.`;
  }
  if (reputation > 60) {
    return `You emerged from "${chapter.title}" with your reputation intact at ${reputation}. People are starting to notice your name.`;
  }
  if (ethics < 30) {
    return `"${chapter.title}" revealed how far you're willing to go. Ethics at ${ethics}—you're playing a dangerous game.`;
  }
  return `Another chapter closes. "${chapter.title}" has changed you—whether for better or worse, only time will tell.`;
}

export default {
  generateDynamicNarrative,
  generateNarratorCommentary,
  generateBonusChoice,
  generatePathDescription,
  generateChapterSummary,
  isDynamicAIAvailable,
};
