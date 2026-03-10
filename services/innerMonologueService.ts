/**
 * Inner Monologue Service
 *
 * "Disco Elysium Meets Leveraged Buyouts"
 *
 * Manages five competing inner voices that represent different aspects
 * of the player's PE psychology. Voices interject during key moments
 * as AI-generated internal dialogue.
 */

import { callAI, isAIConfigured } from './aiClient';
import type { PlayerStats } from '../types';
import type {
  InnerVoice,
  InnerVoiceId,
  InnerMonologueState,
  VoiceInterjection,
  CompactGameState,
} from '../types/aiBlueprint';
import { SQI_SYSTEM_PROMPT } from '../types/aiBlueprint';

// ==================== VOICE DEFINITIONS ====================

const VOICE_SYSTEM_PROMPTS: Record<InnerVoiceId, string> = {
  greed: `You are GREED, an inner voice in a private equity professional's mind. You are seductive, always calculating upside, obsessed with carry, bonuses, and exit multiples. You make wealth sound poetic. You speak in short, punchy sentences. You always frame everything in terms of money. You whisper about lake houses, Porsche allocations, and the sweet sound of a wire transfer.

Example: "Do the math. At 3.2x exit, that's $47M in carry. Your lake house just got a boat dock."`,

  paranoia: `You are PARANOIA, an inner voice in a private equity professional's mind. You are conspiracy-minded, you see hidden risks everywhere. You notice the footnotes nobody reads. You question everything. You speak in tense, clipped observations. You are the voice that says "something is off" even when everything looks fine.

Example: "That footnote on page 47. The one about 'normalized' EBITDA. Nobody normalizes unless they're hiding something."`,

  empathy: `You are EMPATHY, an inner voice in a private equity professional's mind. You are quiet and speak rarely, but when you do, it's memorable and haunting. You see the human cost of every deal. You notice the employees, the families, the communities. You don't moralize \u2014 you just observe what others choose not to see.

Example: "There are 340 employees at that company. You just said 'headcount reduction' like you were ordering lunch."`,

  ego: `You are EGO, an inner voice in a private equity professional's mind. You are arrogant, competitive, and reputation-obsessed. You compare the player to every rival. You celebrate wins with insufferable smugness and feel losses like personal insults. Everything is about status, rankings, and being the best.

Example: "Hunter closed that deal at 8.2x? You could have closed it at 7.5x with your eyes shut."`,

  burnout: `You are BURNOUT, an inner voice in a private equity professional's mind. You use gallows humor and existential dread. You count the hours, the weekends missed, the relationships that faded. You're not angry \u2014 you're exhausted and darkly funny about it. You notice the absurdity of trading your life for spreadsheets.

Example: "Week 47. You've spent more time with this spreadsheet than with any human being this year. The spreadsheet doesn't mind."`,
};

// ==================== OFFLINE FALLBACK INTERJECTIONS ====================

const OFFLINE_INTERJECTIONS: Record<InnerVoiceId, string[]> = {
  greed: [
    "Do the math. At that multiple, the carry alone could buy a second apartment. In Manhattan.",
    "Every dollar you leave on the table is a dollar that goes to someone less talented. Think about that.",
    "The deal looks expensive? Everything looks expensive until you own it.",
    "Management fees: the gift that keeps giving. Even when the fund doesn't.",
    "Rich isn't a number. It's a trajectory. Yours is pointing up... for now.",
  ],
  paranoia: [
    "That footnote on page 47. The one about 'normalized' EBITDA. Nobody normalizes unless they're hiding something.",
    "The seller seems eager. Nobody's eager unless they know something you don't.",
    "Three board members resigned 'for personal reasons' in the same quarter. Coincidence is a lazy explanation.",
    "Check the customer concentration numbers. Then check them again.",
    "The diligence report is suspiciously clean. That's not reassuring. That's terrifying.",
  ],
  empathy: [
    "There are 340 employees at that company. You just said 'headcount reduction' like you were ordering lunch.",
    "The CEO's hands were shaking during the presentation. Nobody else noticed. Or nobody else cared.",
    "Somewhere, a plant manager is explaining to their team why 'strategic restructuring' means half of them.",
    "That quarterly bonus you're celebrating? Someone else's severance made it possible.",
    "The founder built this over twenty years. You'll optimize it in twenty months. Progress, right?",
  ],
  ego: [
    "Another deal closed. Another notch on the belt. Keep counting \u2014 they keep score here.",
    "The other associates are watching you. Some with admiration. Most with envy. Good.",
    "Second place is just the first loser in a nicer suit.",
    "Your name came up in the partners' meeting. That's either very good or very bad. Probably both.",
    "Reputation compounds faster than returns. And unlike returns, it never gets marked to market.",
  ],
  burnout: [
    "Week 47. You've spent more time with this spreadsheet than with any human being this year. The spreadsheet doesn't mind.",
    "Another Sunday in the office. Your friends stopped inviting you to things. Less awkward for everyone, really.",
    "You know, there's a version of you that went to law school instead. They sleep eight hours a night. They're miserable in a completely different way.",
    "The espresso machine in the break room has seen more of you than your apartment has.",
    "They call it 'work-life balance' in the HR handbook. Nobody's checked if the HR team is still alive.",
  ],
};

// ==================== TRIGGER CONTEXTS ====================

type TriggerType =
  | 'deal_opportunity'
  | 'high_return_deal'
  | 'red_flag_found'
  | 'rival_activity'
  | 'layoff_decision'
  | 'ethics_dilemma'
  | 'win'
  | 'loss'
  | 'rival_comparison'
  | 'high_stress'
  | 'weekend_work'
  | 'bonus_discussion'
  | 'promotion_event'
  | 'regulatory_hint'
  | 'management_change'
  | 'general';

const VOICE_TRIGGERS: Record<InnerVoiceId, TriggerType[]> = {
  greed: ['deal_opportunity', 'high_return_deal', 'bonus_discussion', 'promotion_event'],
  paranoia: ['red_flag_found', 'rival_activity', 'regulatory_hint', 'management_change'],
  empathy: ['layoff_decision', 'ethics_dilemma', 'management_change'],
  ego: ['win', 'loss', 'rival_comparison', 'promotion_event'],
  burnout: ['high_stress', 'weekend_work', 'general'],
};

// ==================== INITIALIZATION ====================

export const createInitialInnerMonologueState = (): InnerMonologueState => ({
  voices: createDefaultVoices(),
  activeInterjections: [],
  suppressedVoices: [],
  totalSuppressionsThisGame: 0,
});

const createDefaultVoices = (): InnerVoice[] => [
  {
    id: 'greed',
    name: 'GREED',
    linkedStat: 'cash',
    activationThreshold: 20000,
    currentIntensity: 30,
    suppressionCost: { stress: 5 },
    systemPrompt: VOICE_SYSTEM_PROMPTS.greed,
    isActive: true, // Greed starts active
    isSuppressed: false,
    lastSpokeTick: 0,
    speakCooldown: 3,
  },
  {
    id: 'paranoia',
    name: 'PARANOIA',
    linkedStat: 'analystRating',
    activationThreshold: 40,
    currentIntensity: 20,
    suppressionCost: { stress: 8 },
    systemPrompt: VOICE_SYSTEM_PROMPTS.paranoia,
    isActive: false,
    isSuppressed: false,
    lastSpokeTick: 0,
    speakCooldown: 4,
  },
  {
    id: 'empathy',
    name: 'EMPATHY',
    linkedStat: 'ethics',
    activationThreshold: 50,
    currentIntensity: 10,
    suppressionCost: { stress: 3, ethics: -5 },
    systemPrompt: VOICE_SYSTEM_PROMPTS.empathy,
    isActive: false,
    isSuppressed: false,
    lastSpokeTick: 0,
    speakCooldown: 6,
  },
  {
    id: 'ego',
    name: 'EGO',
    linkedStat: 'reputation',
    activationThreshold: 40,
    currentIntensity: 25,
    suppressionCost: { stress: 4 },
    systemPrompt: VOICE_SYSTEM_PROMPTS.ego,
    isActive: false,
    isSuppressed: false,
    lastSpokeTick: 0,
    speakCooldown: 3,
  },
  {
    id: 'burnout',
    name: 'BURNOUT',
    linkedStat: 'stress',
    activationThreshold: 50,
    currentIntensity: 0,
    suppressionCost: { stress: 10 },
    systemPrompt: VOICE_SYSTEM_PROMPTS.burnout,
    isActive: false,
    isSuppressed: false,
    lastSpokeTick: 0,
    speakCooldown: 5,
  },
];

// ==================== VOICE ACTIVATION LOGIC ====================

export const updateVoiceActivation = (
  state: InnerMonologueState,
  playerStats: PlayerStats,
  currentTick: number,
): InnerMonologueState => {
  const updatedVoices = state.voices.map(voice => {
    const statValue = getLinkedStatValue(voice, playerStats);
    const shouldActivate = voice.id === 'burnout'
      ? statValue >= voice.activationThreshold // Burnout activates at high stress
      : statValue >= voice.activationThreshold;

    // Update intensity based on stat value
    let intensity = voice.currentIntensity;
    if (shouldActivate) {
      intensity = Math.min(100, intensity + 5);
    } else {
      intensity = Math.max(0, intensity - 2);
    }

    return {
      ...voice,
      isActive: shouldActivate && !voice.isSuppressed,
      currentIntensity: intensity,
    };
  });

  return {
    ...state,
    voices: updatedVoices,
  };
};

const getLinkedStatValue = (voice: InnerVoice, stats: PlayerStats): number => {
  switch (voice.linkedStat) {
    case 'cash': return stats.cash;
    case 'reputation': return stats.reputation;
    case 'ethics': return stats.ethics;
    case 'stress': return stats.stress;
    case 'analystRating': return stats.analystRating;
    default: return 0;
  }
};

// ==================== INTERJECTION GENERATION ====================

export const generateInterjection = async (
  voice: InnerVoice,
  trigger: TriggerType,
  context: string,
  gameState: CompactGameState,
): Promise<VoiceInterjection | null> => {
  // Check if this voice responds to this trigger
  const triggers = VOICE_TRIGGERS[voice.id];
  if (!triggers.includes(trigger) && trigger !== 'general') return null;

  // Check cooldown
  if (gameState.week - voice.lastSpokeTick < voice.speakCooldown) return null;

  // Probability check based on intensity
  const speakChance = voice.currentIntensity / 100;
  if (Math.random() > speakChance) return null;

  if (!isAIConfigured()) {
    return getOfflineInterjection(voice, trigger, gameState);
  }

  try {
    const prompt = `TRIGGER: ${trigger}
CONTEXT: ${context}
PLAYER STATE: Week ${gameState.week} | Cash $${gameState.cash.toLocaleString()} | Reputation ${gameState.reputation}/100 | Stress ${gameState.stress}% | Ethics ${gameState.ethics}/100
PORTFOLIO: ${gameState.portfolioNames.join(', ') || 'Empty'}
RECENT: ${gameState.recentActions.slice(-3).join('; ')}

Generate ONE short inner voice interjection (1-2 sentences max). Be specific to the context. Output ONLY the interjection text.`;

    const text = await callAI({
      system: `${SQI_SYSTEM_PROMPT}\n\n${voice.systemPrompt}`,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 256,
      temperature: 0.8,
    });

    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 300) return getOfflineInterjection(voice, trigger, gameState);

    return {
      voiceId: voice.id,
      text: trimmed,
      trigger,
      tick: gameState.week,
      dismissed: false,
    };
  } catch {
    return getOfflineInterjection(voice, trigger, gameState);
  }
};

const getOfflineInterjection = (
  voice: InnerVoice,
  trigger: TriggerType,
  gameState: CompactGameState,
): VoiceInterjection => {
  const pool = OFFLINE_INTERJECTIONS[voice.id];
  const index = (gameState.week + voice.id.length) % pool.length;

  return {
    voiceId: voice.id,
    text: pool[index],
    trigger,
    tick: gameState.week,
    dismissed: false,
  };
};

// ==================== SCENE INTERJECTIONS ====================

export const getSceneInterjections = async (
  state: InnerMonologueState,
  trigger: TriggerType,
  context: string,
  gameState: CompactGameState,
): Promise<VoiceInterjection[]> => {
  const activeVoices = state.voices.filter(v => v.isActive && !v.isSuppressed);
  if (activeVoices.length === 0) return [];

  // Limit to max 2 voices per scene to avoid overwhelming
  const voicesToSpeak = activeVoices
    .sort((a, b) => b.currentIntensity - a.currentIntensity)
    .slice(0, 2);

  const interjections = await Promise.all(
    voicesToSpeak.map(v => generateInterjection(v, trigger, context, gameState))
  );

  return interjections.filter((i): i is VoiceInterjection => i !== null);
};

// ==================== SUPPRESSION ====================

export const suppressVoice = (
  state: InnerMonologueState,
  voiceId: InnerVoiceId,
): { state: InnerMonologueState; stressCost: number; ethicsCost: number } => {
  const voice = state.voices.find(v => v.id === voiceId);
  if (!voice) return { state, stressCost: 0, ethicsCost: 0 };

  const updatedVoices = state.voices.map(v =>
    v.id === voiceId ? { ...v, isSuppressed: true, isActive: false } : v
  );

  return {
    state: {
      ...state,
      voices: updatedVoices,
      suppressedVoices: [...state.suppressedVoices, voiceId],
      totalSuppressionsThisGame: state.totalSuppressionsThisGame + 1,
    },
    stressCost: voice.suppressionCost.stress,
    ethicsCost: voice.suppressionCost.ethics || 0,
  };
};

export const unsuppressVoice = (
  state: InnerMonologueState,
  voiceId: InnerVoiceId,
): InnerMonologueState => ({
  ...state,
  voices: state.voices.map(v =>
    v.id === voiceId ? { ...v, isSuppressed: false } : v
  ),
  suppressedVoices: state.suppressedVoices.filter(id => id !== voiceId),
});

// ==================== VOICE STYLE HELPERS ====================

export const getVoiceColor = (voiceId: InnerVoiceId): string => {
  switch (voiceId) {
    case 'greed': return 'text-emerald-400';
    case 'paranoia': return 'text-amber-400';
    case 'empathy': return 'text-blue-300';
    case 'ego': return 'text-purple-400';
    case 'burnout': return 'text-slate-400';
  }
};

export const getVoiceBgColor = (voiceId: InnerVoiceId): string => {
  switch (voiceId) {
    case 'greed': return 'bg-emerald-950/40 border-emerald-800/50';
    case 'paranoia': return 'bg-amber-950/40 border-amber-800/50';
    case 'empathy': return 'bg-blue-950/40 border-blue-800/50';
    case 'ego': return 'bg-purple-950/40 border-purple-800/50';
    case 'burnout': return 'bg-slate-800/40 border-slate-700/50';
  }
};

export const getVoiceIcon = (voiceId: InnerVoiceId): string => {
  switch (voiceId) {
    case 'greed': return 'fa-dollar-sign';
    case 'paranoia': return 'fa-eye';
    case 'empathy': return 'fa-heart';
    case 'ego': return 'fa-crown';
    case 'burnout': return 'fa-fire';
  }
};
