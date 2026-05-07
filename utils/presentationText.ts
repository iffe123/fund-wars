const STAT_DISPLAY_NAMES: Record<string, string> = {
  cash: 'Cash',
  reputation: 'Reputation',
  stress: 'Stress',
  energy: 'Energy',
  analystRating: 'Analyst Rating',
  financialEngineering: 'Financial Engineering',
  ethics: 'Ethics',
  auditRisk: 'Audit Risk',
  score: 'Score',
  health: 'Health',
  dependency: 'Dependency',
  dealcraft: 'Deal Craft',
  politics: 'Politics',
  valuation: 'Valuation',
  negotiation: 'Negotiation',
  riskManagement: 'Risk Management',
  dealExecution: 'Deal Execution',
};

const STORY_COPY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bChad Morrison\b/g, 'Chad Worthington III'],
  [/\bChad Worthington\b(?! III)/g, 'Chad Worthington III'],
  [/\bMeridian Capital\b/g, 'Meridian Partners'],
];

export const humanizeIdentifier = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());

export const formatStatDisplayName = (key: string): string =>
  STAT_DISPLAY_NAMES[key] || humanizeIdentifier(key);

export const formatFlagLabel = (flag: string): string => humanizeIdentifier(flag);

export const formatNpcIdentifier = (npcId: string): string => humanizeIdentifier(npcId);

export const normalizeStoryCopy = (text: string): string =>
  STORY_COPY_REPLACEMENTS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text
  );

export const getCanonicalSpeakerName = (
  speakerId?: string,
  fallbackName?: string
): string => {
  if (speakerId === 'chad') {
    return 'Chad Worthington III';
  }

  if (!fallbackName) {
    return speakerId ? humanizeIdentifier(speakerId) : '';
  }

  return normalizeStoryCopy(fallbackName);
};
