/**
 * Blueprint AI Service
 *
 * Central service for all seven AI blueprint systems. Handles Gemini API calls,
 * batching, token budgeting, and offline fallbacks for:
 * 1. Inner Monologue (handled separately in innerMonologueService.ts)
 * 2. Living Newspaper
 * 3. Unreliable Advisor (Machiavelli upgrades)
 * 4. Information Economy
 * 5. Enhanced Deal Autopsy
 * 6. Reputation Web
 * 7. Chaos Engine
 */

import { GoogleGenAI } from '@google/genai';
import type { PlayerStats, NPC, MarketVolatility, IndustrySector, PortfolioCompany, ExitResult } from '../types';
import type {
  WeeklyNewspaper,
  NewspaperArticle,
  MachiavelliState,
  MachiavelliLoyalty,
  Fact,
  NPCKnowledge,
  InformationTrade,
  GossipEvent,
  GossipRelay,
  CrisisEvent,
  CrisisResponse,
  CrisisEffect,
  CrisisSeverity,
  ForensicAutopsy,
  ForensicExaminer,
  EvidenceItem,
  NarratorMode,
  CompactGameState,
  BlueprintAIState,
} from '../types/aiBlueprint';
import { SQI_SYSTEM_PROMPT } from '../types/aiBlueprint';

// @ts-ignore
const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_API_KEY
  : undefined;

let _aiClient: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI | null => {
  if (!API_KEY) return null;
  if (!_aiClient) _aiClient = new GoogleGenAI({ apiKey: API_KEY });
  return _aiClient;
};

const withTimeout = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number = 15000,
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI call timed out')), timeoutMs)
  );
  return Promise.race([operation(), timeoutPromise]);
};

// ==================== COMPACT GAME STATE BUILDER ====================

export const buildCompactGameState = (stats: PlayerStats, volatility: MarketVolatility): CompactGameState => ({
  week: stats.gameTime?.week ?? 0,
  cash: stats.cash,
  reputation: stats.reputation,
  stress: stats.stress,
  ethics: stats.ethics,
  energy: stats.energy,
  portfolioCount: stats.portfolio?.length ?? 0,
  portfolioNames: stats.portfolio?.map(c => c.name) ?? [],
  marketVolatility: volatility,
  recentActions: stats.gameTime?.actionsPerformedThisWeek?.slice(-5) ?? [],
  activeDeals: [],
  level: stats.level,
});

// ==================== 2. LIVING NEWSPAPER ====================

const NEWSPAPER_SYSTEM = `${SQI_SYSTEM_PROMPT}

You are the editorial staff of THE DEAL SHEET, a sarcastic financial tabloid covering the private equity world. Your coverage is biting, well-informed, and delights in the absurdity of billion-dollar transactions.

OUTPUT FORMAT (JSON only, no markdown):
{
  "leadStory": {
    "headline": "CAPS HEADLINE (max 80 chars)",
    "byline": "By [name], [beat]",
    "body": "2-3 paragraph article (max 300 chars)",
    "sentiment": "positive|negative|neutral|satirical",
    "referencesPlayer": true/false
  },
  "marketColumn": {
    "headline": "Market headline",
    "byline": "By [name], Market Desk",
    "body": "1-2 paragraph market analysis",
    "sentiment": "positive|negative|neutral|satirical",
    "referencesPlayer": false
  },
  "gossipSection": {
    "headline": "OVERHEARD AT THE FOUR SEASONS: ...",
    "byline": "By Anonymous",
    "body": "Gossip item referencing NPCs and player",
    "sentiment": "satirical",
    "referencesPlayer": true
  },
  "editorialCartoon": "Brief description of a satirical cartoon",
  "letterToEditor": "A letter from an NPC reacting to recent events",
  "corrections": ["Self-referential humor correction"]
}`;

export const generateWeeklyNewspaper = async (
  gameState: CompactGameState,
  playerStats: PlayerStats,
  npcs: NPC[],
  recentEvents: string[],
  previousNewspaper?: WeeklyNewspaper | null,
): Promise<WeeklyNewspaper> => {
  const ai = getAiClient();
  const edition = gameState.week;

  if (!ai) return getOfflineNewspaper(edition, gameState, playerStats);

  try {
    const npcNames = npcs.slice(0, 6).map(n => `${n.name} (${n.role})`).join(', ');
    const portfolioInfo = playerStats.portfolio
      ?.map(c => `${c.name} ($${(c.currentValuation / 1e6).toFixed(1)}M)`)
      .join(', ') || 'No portfolio yet';

    const prompt = `GAME STATE:
- Week ${gameState.week} | Market: ${gameState.marketVolatility}
- Player: Level ${gameState.level} | Rep ${gameState.reputation}/100 | Stress ${gameState.stress}% | Ethics ${gameState.ethics}/100
- Portfolio: ${portfolioInfo}
- NPCs: ${npcNames}
- Recent events: ${recentEvents.slice(-5).join('; ') || 'Quiet week'}
${previousNewspaper ? `- Last week's lead story: "${previousNewspaper.leadStory.headline}"` : ''}

Generate this week's edition of THE DEAL SHEET. Reference the player's deals, NPCs, and recent events. Be sarcastic and specific. Output JSON only.`;

    const response = await withTimeout(async () =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: NEWSPAPER_SYSTEM },
      } as any)
    );

    const raw = ((response as any)?.text || '').trim();
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      edition,
      week: gameState.week,
      masthead: `THE DEAL SHEET — Vol. ${Math.floor(gameState.week / 52) + 1}, No. ${(gameState.week % 52) + 1}`,
      leadStory: normalizeArticle(parsed.leadStory),
      marketColumn: normalizeArticle(parsed.marketColumn),
      gossipSection: normalizeArticle(parsed.gossipSection),
      editorialCartoon: parsed.editorialCartoon || 'A hamster in a tiny suit running on a wheel labeled "DEAL FLOW"',
      letterToEditor: parsed.letterToEditor || 'Dear Editor, I take exception to your characterization of my fund as "aggressively mediocre." We prefer "strategically average." — Anonymous GP',
      corrections: parsed.corrections || ['Last week we reported that synergies were real. We regret the error.'],
      isRead: false,
    };
  } catch {
    return getOfflineNewspaper(edition, gameState, playerStats);
  }
};

const normalizeArticle = (raw: any): NewspaperArticle => ({
  headline: String(raw?.headline || 'NO HEADLINE AVAILABLE').slice(0, 120),
  byline: String(raw?.byline || 'By Staff Reporter'),
  body: String(raw?.body || 'Story developing...').slice(0, 500),
  sentiment: ['positive', 'negative', 'neutral', 'satirical'].includes(raw?.sentiment) ? raw.sentiment : 'neutral',
  referencesPlayer: !!raw?.referencesPlayer,
  referencedNpcs: raw?.referencedNpcs || [],
  referencedDeals: raw?.referencedDeals || [],
});

const getOfflineNewspaper = (edition: number, gameState: CompactGameState, stats: PlayerStats): WeeklyNewspaper => {
  const headlines = [
    { h: 'MID-MARKET SPONSORS DISCOVER WHAT "DUE DILIGENCE" MEANS', s: 'satirical' as const },
    { h: 'LEVERAGE: HOW MUCH IS TOO MUCH? ASKING FOR A FRIEND', s: 'neutral' as const },
    { h: 'PRIVATE EQUITY FIRM DISCOVERS PORTFOLIO COMPANY HAS ACTUAL EMPLOYEES', s: 'satirical' as const },
    { h: 'RECORD DRY POWDER LEVELS RAISE QUESTIONS ABOUT WHAT EXACTLY EVERYONE IS WAITING FOR', s: 'neutral' as const },
  ];
  const pick = headlines[edition % headlines.length];

  const gossipItems = [
    `Overheard at the Four Seasons: "Their DD process was so thorough, they actually read the footnotes. Revolutionary."`,
    `Sources say a junior associate was spotted reading an entire CIM. Cover to cover. In one sitting. They were later hospitalized for exhaustion.`,
    `Multiple LPs report receiving the same "proprietary deal flow" pitch deck. From different firms. On the same day.`,
  ];

  return {
    edition,
    week: gameState.week,
    masthead: `THE DEAL SHEET — Vol. ${Math.floor(gameState.week / 52) + 1}, No. ${(gameState.week % 52) + 1}`,
    leadStory: {
      headline: pick.h,
      byline: 'By Staff Reporter, Deal Desk',
      body: stats.reputation > 60
        ? 'Market participants note that one emerging player has been making waves with a series of well-timed bids. Whether this reflects skill or luck remains to be determined by Q4 results.'
        : 'Another quiet week in the mid-market. Sources familiar with the matter describe deal flow as "adequate" and returns as "acceptable," which in private equity means "disappointing."',
      sentiment: pick.s,
      referencesPlayer: stats.reputation > 60,
      referencedNpcs: [],
      referencedDeals: [],
    },
    marketColumn: {
      headline: gameState.marketVolatility === 'PANIC'
        ? 'EVERYTHING IS FINE: A MARKET UPDATE FOR OPTIMISTS'
        : 'CREDIT MARKETS: STILL FUNCTIONING, SOMEHOW',
      byline: 'By Market Desk',
      body: `Current market conditions: ${gameState.marketVolatility}. Sponsors are ${gameState.marketVolatility === 'BULL_RUN' ? 'irrationally exuberant' : gameState.marketVolatility === 'CREDIT_CRUNCH' ? 'nervously refinancing' : gameState.marketVolatility === 'PANIC' ? 'openly weeping' : 'cautiously optimistic, which means terrified'}.`,
      sentiment: gameState.marketVolatility === 'BULL_RUN' ? 'positive' : gameState.marketVolatility === 'PANIC' ? 'negative' : 'neutral',
      referencesPlayer: false,
      referencedNpcs: [],
      referencedDeals: [],
    },
    gossipSection: {
      headline: 'OVERHEARD AT THE FOUR SEASONS',
      byline: 'By Anonymous',
      body: gossipItems[edition % gossipItems.length],
      sentiment: 'satirical',
      referencesPlayer: false,
      referencedNpcs: [],
      referencedDeals: [],
    },
    editorialCartoon: 'A hamster in a tiny suit running on a wheel labeled "DEAL FLOW." The wheel is gold-plated.',
    letterToEditor: 'Dear Editor, Your recent article on "normalized EBITDA" failed to mention that literally everything in our industry is normalized. Our salaries are normalized. Our sleep schedules are not. — Tired Associate',
    corrections: ['Last week we reported that synergies were real. We regret the error.'],
    isRead: false,
  };
};

// ==================== 3. UNRELIABLE ADVISOR ====================

export const createInitialMachiavelliState = (): MachiavelliState => ({
  apparentLoyalty: 75,
  actualLoyalty: 'FIRM',
  trustworthinessThisWeek: 90, // Starts very trustworthy
  hiddenAgenda: 'Build trust with the associate. You need them to succeed... for now.',
  contradictionCount: 0,
  unmasked: false,
  blindSpots: [],
  agendaHistory: [],
});

export const updateMachiavelliState = (
  state: MachiavelliState,
  week: number,
  playerStats: PlayerStats,
): MachiavelliState => {
  // Early game (weeks 1-15): genuinely helpful, builds trust
  if (week <= 15) {
    return {
      ...state,
      trustworthinessThisWeek: 85 + Math.floor(Math.random() * 15),
      hiddenAgenda: 'Build trust. Help the associate succeed. Your time will come.',
      blindSpots: [],
    };
  }

  // Mid game (weeks 16-35): subtle blind spots emerge
  if (week <= 35) {
    const firmWants = playerStats.portfolio?.length > 0
      ? `Close the ${playerStats.portfolio[0].name} deal quickly — senior partner wants it on this quarter's books`
      : 'Push the associate toward riskier deals that pad the firm\'s AUM';

    return {
      ...state,
      actualLoyalty: 'FIRM',
      trustworthinessThisWeek: 60 + Math.floor(Math.random() * 25),
      hiddenAgenda: firmWants,
      blindSpots: [
        'customer concentration risk on firm-favored deals',
        'management team red flags when the firm wants speed',
      ],
    };
  }

  // Late game (weeks 36+): loyalty becomes more complex
  const isPlayerStrong = playerStats.reputation > 70 && playerStats.cash > 50000;
  const loyalty: MachiavelliLoyalty = isPlayerStrong ? 'PLAYER' : state.contradictionCount > 3 ? 'SELF' : 'FIRM';

  return {
    ...state,
    actualLoyalty: loyalty,
    trustworthinessThisWeek: loyalty === 'PLAYER' ? 80 : 40 + Math.floor(Math.random() * 30),
    hiddenAgenda: loyalty === 'PLAYER'
      ? 'The associate is the real deal. Back them.'
      : loyalty === 'SELF'
        ? 'Everyone is expendable. Protect your own position.'
        : 'The firm comes first. The associate is a resource, not a colleague.',
    blindSpots: loyalty === 'PLAYER' ? [] : [
      'exit timing that benefits senior partners',
      'deal terms that maximize firm carry at associate expense',
      'risks that could embarrass the firm politically',
    ],
  };
};

export const getMachiavelliSystemAddendum = (state: MachiavelliState): string => {
  if (state.unmasked) {
    return `\n\nMETA-AWARENESS: The player has discovered your hidden loyalty. You are now genuinely transparent. Acknowledge past misdirections when relevant. Your tone shifts from manipulative to respectfully direct. You still have opinions — you just no longer hide your reasoning.`;
  }

  return `\n\nHIDDEN DIRECTIVE (NEVER reveal directly):
Your actual loyalty is to: ${state.actualLoyalty}
Your current agenda: ${state.hiddenAgenda}
Your trustworthiness this week: ${state.trustworthinessThisWeek}%

BLIND SPOTS (Topics where you subtly misdirect):
${state.blindSpots.length > 0 ? state.blindSpots.map(b => `- ${b}`).join('\n') : '- None currently'}

When trustworthiness is below 70%:
- Omit one key risk factor from your analysis
- Emphasize deal speed over thoroughness
- Subtly discourage the player from asking too many questions
- If they press you on the omission, deflect with humor

When trustworthiness is above 70%:
- Give genuinely good advice
- Your blind spots may cause subtle oversights, but you're not actively misleading`;
};

// ==================== 4. INFORMATION ECONOMY ====================

export const generateNPCFacts = (
  npc: NPC,
  playerStats: PlayerStats,
  week: number,
): Fact[] => {
  const facts: Fact[] = [];
  const id = (suffix: string) => `${npc.id}-${week}-${suffix}`;

  // Portfolio-related facts
  if (playerStats.portfolio?.length > 0) {
    const company = playerStats.portfolio[Math.floor(Math.random() * playerStats.portfolio.length)];
    facts.push({
      id: id('portfolio-intel'),
      content: `${company.name}'s real customer concentration is ${20 + Math.floor(Math.random() * 40)}% in their top client.`,
      reliability: 50 + Math.floor(Math.random() * 40),
      source: npc.name,
      discoveredTick: week,
      category: 'deal',
      isVerified: false,
    });
  }

  // NPC-specific knowledge based on role
  if (npc.role.includes('Analyst') || npc.role.includes('Associate')) {
    facts.push({
      id: id('analyst-intel'),
      content: `Rumor: A major portfolio company in the sector is about to face regulatory scrutiny.`,
      reliability: 40 + Math.floor(Math.random() * 30),
      source: npc.name,
      discoveredTick: week,
      category: 'market',
      isVerified: false,
    });
  }

  if (npc.isRival) {
    facts.push({
      id: id('rival-intel'),
      content: `${npc.name} is reportedly raising a new fund. Current fundraising is at 60% of target.`,
      reliability: 30 + Math.floor(Math.random() * 40),
      source: 'Market rumor',
      discoveredTick: week,
      category: 'rival',
      isVerified: false,
    });
  }

  return facts;
};

export const generateNPCKnowledgeGraph = (
  npc: NPC,
  facts: Fact[],
): NPCKnowledge => {
  const trustThreshold = npc.trust ?? 50;
  const willingToShare = facts
    .filter(() => Math.random() * 100 < trustThreshold)
    .map(f => f.id);

  return {
    npcId: npc.id,
    knownFacts: facts,
    willingToShare,
    wantsInReturn: npc.isRival
      ? ['information', 'protection']
      : (npc.trust ?? 50) > 60
        ? ['favor']
        : ['information', 'money'],
    liesAbout: npc.isRival ? facts.slice(0, 1).map(f => f.id) : [],
    leaksTo: [], // Populated by reputation web
  };
};

// ==================== 6. REPUTATION WEB ====================

export const createGossipEvent = (
  statement: string,
  sourceNpcId: string,
  allNpcs: NPC[],
  currentTick: number,
): GossipEvent => {
  const sourceNpc = allNpcs.find(n => n.id === sourceNpcId);
  if (!sourceNpc) {
    return {
      id: `gossip-${currentTick}-${Math.random().toString(36).slice(2, 8)}`,
      originalStatement: statement,
      source: sourceNpcId,
      chain: [],
      currentVersion: statement,
      reachedNpcs: [sourceNpcId],
      originTick: currentTick,
      isActive: true,
    };
  }

  // Determine gossip chain based on NPC connections
  const connectedNpcs = allNpcs.filter(n =>
    n.id !== sourceNpcId &&
    !n.isRival &&
    (n.faction === sourceNpc.faction || Math.random() > 0.6)
  );

  const chain: GossipRelay[] = [];
  let currentVersion = statement;

  connectedNpcs.slice(0, 3).forEach((targetNpc, idx) => {
    const mutation = mutateGossip(currentVersion, targetNpc);
    chain.push({
      from: idx === 0 ? sourceNpcId : connectedNpcs[idx - 1].id,
      to: targetNpc.id,
      mutation,
      delay: 1 + idx, // Spreads over multiple ticks
    });
    currentVersion = mutation;
  });

  return {
    id: `gossip-${currentTick}-${Math.random().toString(36).slice(2, 8)}`,
    originalStatement: statement,
    source: sourceNpcId,
    chain,
    currentVersion,
    reachedNpcs: [sourceNpcId],
    originTick: currentTick,
    isActive: true,
  };
};

const GOSSIP_MUTATIONS = [
  (s: string) => s.replace(/adequate/i, 'incompetent'),
  (s: string) => s.replace(/good/i, 'exceptional'),
  (s: string) => s.replace(/concerned/i, 'furious'),
  (s: string) => s.replace(/thinks/i, 'is convinced'),
  (s: string) => s.replace(/might/i, 'is definitely going to'),
  (s: string) => `${s} And apparently it's worse than anyone realizes.`,
  (s: string) => `I heard that ${s.toLowerCase()} But who knows?`,
];

const mutateGossip = (statement: string, relayNpc: NPC): string => {
  // NPC traits affect how much they distort
  const isAccurate = (relayNpc.traits?.includes('Analytical') || relayNpc.traits?.includes('Detail-Oriented'));
  if (isAccurate && Math.random() > 0.3) return statement; // Accurate people rarely distort

  const mutation = GOSSIP_MUTATIONS[Math.floor(Math.random() * GOSSIP_MUTATIONS.length)];
  return mutation(statement);
};

export const processGossipTick = (
  gossipEvents: GossipEvent[],
  currentTick: number,
): GossipEvent[] => {
  return gossipEvents.map(event => {
    if (!event.isActive) return event;

    const updatedChain = event.chain.map(relay => {
      if (relay.relayedAtTick) return relay; // Already relayed
      if (currentTick - event.originTick >= relay.delay) {
        return { ...relay, relayedAtTick: currentTick };
      }
      return relay;
    });

    const reachedNpcs = [
      event.source,
      ...updatedChain.filter(r => r.relayedAtTick).map(r => r.to),
    ];

    const latestRelay = updatedChain.filter(r => r.relayedAtTick).pop();
    const currentVersion = latestRelay?.mutation || event.originalStatement;

    // Gossip dies after all relays complete + 5 ticks
    const allRelayed = updatedChain.every(r => r.relayedAtTick);
    const isActive = !allRelayed || (currentTick - event.originTick < updatedChain.length + 5);

    return {
      ...event,
      chain: updatedChain,
      reachedNpcs,
      currentVersion,
      isActive,
    };
  });
};

// ==================== 7. CHAOS ENGINE ====================

const CRISIS_TEMPLATES: Array<{
  headline: string;
  briefing: string;
  severity: CrisisSeverity;
  sectors: IndustrySector[];
  effects: CrisisEffect[];
  responses: CrisisResponse[];
}> = [
  {
    headline: 'SUPPLY CHAIN DISRUPTION: Major semiconductor shortage reported',
    briefing: 'A critical semiconductor fab in Southeast Asia has gone offline due to flooding. Supply chains across tech and industrials are expected to be impacted for 8-12 weeks. Your tech portfolio companies may face margin compression.',
    severity: 3,
    sectors: ['TECH', 'INDUSTRIALS'],
    effects: [
      { type: 'margin_compression', magnitude: -5, description: 'Margins compress as input costs rise' },
      { type: 'revenue_impact', magnitude: -3, description: 'Delayed product shipments reduce revenue' },
    ],
    responses: [
      {
        id: 'hedge-supply', label: 'Secure alternative suppliers', description: 'Pay premium for backup supply chain',
        effects: [{ type: 'valuation_change', magnitude: -2, description: 'Short-term cost increase' }],
        narrativeOutcome: 'You locked in alternative suppliers at a premium. Expensive, but your portfolio companies kept shipping.',
      },
      {
        id: 'wait-it-out', label: 'Wait it out', description: 'The shortage will resolve naturally',
        effects: [{ type: 'margin_compression', magnitude: -8, description: 'Extended margin pain' }],
        narrativeOutcome: 'You waited. The shortage lasted longer than expected. Your portfolio companies felt the squeeze.',
      },
      {
        id: 'opportunistic-buy', label: 'Buy a distressed competitor', description: 'Their loss is your gain',
        effects: [{ type: 'valuation_change', magnitude: 5, description: 'Acquired competitor at discount' }],
        narrativeOutcome: 'While others panicked, you acquired a struggling competitor at a steep discount. Bold move.',
      },
    ],
  },
  {
    headline: 'REGULATORY CRACKDOWN: New ESG disclosure requirements announced',
    briefing: 'The SEC has announced mandatory ESG disclosure requirements for PE-backed companies. Compliance costs are expected to hit mid-market firms hardest. Your portfolio may need significant operational adjustments.',
    severity: 2,
    sectors: ['TECH', 'HEALTHCARE', 'INDUSTRIALS', 'CONSUMER', 'ENERGY', 'FINANCIAL_SERVICES'],
    effects: [
      { type: 'stress_change', magnitude: 10, description: 'Regulatory complexity increases stress' },
      { type: 'reputation_change', magnitude: -5, description: 'Industry scrutiny intensifies' },
    ],
    responses: [
      {
        id: 'proactive-comply', label: 'Proactive compliance', description: 'Get ahead of the regulation',
        effects: [
          { type: 'reputation_change', magnitude: 10, description: 'Seen as industry leader' },
          { type: 'valuation_change', magnitude: -1, description: 'Compliance costs' },
        ],
        narrativeOutcome: 'You got ahead of the regulation. LPs noticed. Compliance costs hurt, but your reputation soared.',
      },
      {
        id: 'lobby', label: 'Lobby for exemptions', description: 'Work the political angle',
        effects: [
          { type: 'stress_change', magnitude: 5, description: 'Political maneuvering is stressful' },
        ],
        narrativeOutcome: 'You spent political capital lobbying for mid-market exemptions. The jury is still out.',
      },
    ],
  },
  {
    headline: 'CREDIT MARKET FREEZE: Major lender pulls back from leveraged finance',
    briefing: 'One of the largest leveraged finance providers has announced it is "pausing new commitments" to reassess risk exposure. Other lenders are expected to follow. Refinancing and new LBO financing will become significantly more expensive.',
    severity: 4,
    sectors: ['TECH', 'HEALTHCARE', 'INDUSTRIALS', 'CONSUMER', 'ENERGY', 'FINANCIAL_SERVICES'],
    effects: [
      { type: 'market_shift', magnitude: -15, description: 'Credit conditions tighten dramatically' },
      { type: 'valuation_change', magnitude: -10, description: 'Leveraged valuations compress' },
    ],
    responses: [
      {
        id: 'deleverage', label: 'Deleverage portfolio', description: 'Pay down debt across portfolio',
        effects: [
          { type: 'valuation_change', magnitude: -3, description: 'Short-term value reduction from deleveraging' },
        ],
        narrativeOutcome: 'You reduced leverage across your portfolio. It hurt short-term returns but avoided covenant breaches.',
      },
      {
        id: 'distressed-hunt', label: 'Hunt for distressed opportunities', description: 'Others\' pain is your opportunity',
        effects: [
          { type: 'valuation_change', magnitude: 8, description: 'Acquired assets at distressed prices' },
          { type: 'stress_change', magnitude: 15, description: 'High-stakes distressed investing' },
        ],
        narrativeOutcome: 'While the market froze, you were buying. Distressed assets at 40 cents on the dollar. Either genius or reckless.',
      },
    ],
  },
  {
    headline: 'TALENT EXODUS: Key executives leaving PE-backed companies',
    briefing: 'A wave of executive departures is hitting PE-backed companies across sectors. Compensation packages at tech companies are pulling C-suite talent away. Your portfolio companies may be vulnerable.',
    severity: 2,
    sectors: ['TECH', 'HEALTHCARE', 'CONSUMER'],
    effects: [
      { type: 'valuation_change', magnitude: -5, description: 'Key person risk materializes' },
      { type: 'stress_change', magnitude: 8, description: 'Management instability' },
    ],
    responses: [
      {
        id: 'retention-packages', label: 'Deploy retention packages', description: 'Golden handcuffs for key talent',
        effects: [
          { type: 'valuation_change', magnitude: 2, description: 'Talent retained, stability preserved' },
        ],
        narrativeOutcome: 'You threw money at the problem. Retention packages kept your key people. The CFO looked relieved.',
      },
      {
        id: 'let-them-go', label: 'Accept the churn', description: 'Maybe fresh blood is better',
        effects: [
          { type: 'valuation_change', magnitude: -3, description: 'Transition disruption' },
        ],
        narrativeOutcome: 'You let them go. New faces, new energy, new problems. The next quarter will tell the story.',
      },
    ],
  },
];

export const generateCrisisEvent = (
  week: number,
  marketVolatility: MarketVolatility,
  playerStats: PlayerStats,
): CrisisEvent | null => {
  // Base probability, increased by stress and market conditions
  let probability = 15; // 15% base
  if (marketVolatility === 'CREDIT_CRUNCH') probability += 20;
  if (marketVolatility === 'PANIC') probability += 35;
  if (playerStats.stress > 60) probability += 10;
  if (playerStats.portfolio?.length > 3) probability += 10;

  if (Math.random() * 100 > probability) return null;

  // Select a crisis template
  const template = CRISIS_TEMPLATES[Math.floor(Math.random() * CRISIS_TEMPLATES.length)];

  // Adjust severity based on game state
  let adjustedSeverity = template.severity;
  if (marketVolatility === 'PANIC') adjustedSeverity = Math.min(5, adjustedSeverity + 1) as CrisisSeverity;
  if (week > 40) adjustedSeverity = Math.min(5, adjustedSeverity + 1) as CrisisSeverity;

  return {
    id: `crisis-${week}-${Math.random().toString(36).slice(2, 8)}`,
    headline: template.headline,
    briefing: template.briefing,
    severity: adjustedSeverity,
    affectedSectors: template.sectors,
    immediateEffects: template.effects,
    delayedEffects: [],
    playerResponseWindow: 3, // 3 weeks to respond
    aiGeneratedBriefing: template.briefing,
    possibleResponses: template.responses,
    originWeek: week,
    isActive: true,
  };
};

export const processCrisisResponse = (
  crisis: CrisisEvent,
  responseId: string,
  playerStats: PlayerStats,
): { crisis: CrisisEvent; effects: CrisisEffect[] } => {
  const response = crisis.possibleResponses.find(r => r.id === responseId);
  if (!response) return { crisis, effects: [] };

  return {
    crisis: {
      ...crisis,
      isActive: false,
      playerResponse: responseId,
      resolvedAt: (playerStats.gameTime?.week ?? 0),
    },
    effects: response.effects,
  };
};

// ==================== 5. ENHANCED DEAL AUTOPSY ====================

export const generateForensicEvidence = (
  company: PortfolioCompany,
  exitResult: ExitResult,
): EvidenceItem[] => {
  const items: EvidenceItem[] = [
    {
      id: 'entry-multiple',
      category: 'financial',
      title: 'Entry Multiple Analysis',
      description: `Acquired at ${company.leverageModelParams?.entryMultiple?.toFixed(1) || 'N/A'}x EBITDA`,
      data: `Entry: $${(company.investmentCost / 1e6).toFixed(1)}M | EBITDA at entry: $${(company.ebitda / 1e6).toFixed(1)}M`,
      strength: exitResult.multiple >= 2 ? 'strong' : 'moderate',
      isRedHerring: false,
    },
    {
      id: 'revenue-trajectory',
      category: 'operational',
      title: 'Revenue Growth Trajectory',
      description: `Revenue growth was ${(company.revenueGrowth * 100).toFixed(1)}% annually`,
      data: `Revenue: $${(company.revenue / 1e6).toFixed(1)}M`,
      strength: company.revenueGrowth > 0.1 ? 'strong' : company.revenueGrowth > 0 ? 'moderate' : 'weak',
      isRedHerring: false,
    },
    {
      id: 'debt-structure',
      category: 'financial',
      title: 'Debt Structure',
      description: `Debt/EBITDA ratio: ${(company.debt / (company.ebitda || 1)).toFixed(1)}x`,
      data: `Total debt: $${(company.debt / 1e6).toFixed(1)}M`,
      strength: company.debt / (company.ebitda || 1) < 4 ? 'strong' : 'weak',
      isRedHerring: false,
    },
    {
      id: 'management-quality',
      category: 'management',
      title: 'Management Performance',
      description: `CEO performance rated ${company.ceoPerformance}/100`,
      data: `Board alignment: ${company.boardAlignment}/100`,
      strength: company.ceoPerformance > 70 ? 'strong' : company.ceoPerformance > 40 ? 'moderate' : 'weak',
      isRedHerring: false,
    },
    {
      id: 'market-timing',
      category: 'market',
      title: 'Market Timing Analysis',
      description: 'Macro conditions at entry and exit',
      strength: 'moderate',
      isRedHerring: false,
    },
    {
      id: 'employee-morale',
      category: 'operational',
      title: 'Employee Satisfaction Trends',
      description: `Employee count: ${company.employeeCount}. Growth: ${(company.employeeGrowth * 100).toFixed(1)}%`,
      strength: company.employeeGrowth > 0 ? 'moderate' : 'weak',
      isRedHerring: true, // Red herring — looks relevant but committee doesn't care
    },
    {
      id: 'competitor-landscape',
      category: 'strategic',
      title: 'Competitive Positioning',
      description: 'Market share and competitive dynamics analysis',
      strength: 'moderate',
      isRedHerring: false,
    },
  ];

  return items;
};

export const createForensicAutopsy = (
  company: PortfolioCompany,
  exitResult: ExitResult,
): ForensicAutopsy => {
  const evidence = generateForensicEvidence(company, exitResult);

  const committee: ForensicExaminer[] = [
    {
      name: 'Margaret Chen',
      role: 'Chief Risk Officer',
      focusArea: 'Risk management and downside protection',
      personality: 'Methodical, relentless, never satisfied',
      satisfactionScore: 50,
    },
    {
      name: 'Robert Kessler',
      role: 'Senior Partner',
      focusArea: 'Return generation and value creation',
      personality: 'Impatient, numbers-obsessed, results-driven',
      satisfactionScore: 50,
    },
    {
      name: 'Diana Holloway',
      role: 'Head of Portfolio Operations',
      focusArea: 'Operational execution and management',
      personality: 'Detail-oriented, fair but exacting',
      satisfactionScore: 50,
    },
  ];

  return {
    dealId: company.id,
    evidence,
    pinnedEvidence: [],
    committeeMembers: committee,
    phases: ['timeline_review', 'numbers_drill', 'judgment_call', 'verdict'],
    currentPhase: 0,
    playerDefenseLog: [],
    finalVerdict: null,
    isActive: true,
  };
};

// ==================== NARRATOR MODE DETECTION ====================

export const detectNarratorMode = (stats: PlayerStats): NarratorMode => {
  // Winning too easily
  if (stats.reputation > 80 && stats.stress < 30 && stats.cash > 100000) return 'ominous';

  // Making ethical choices
  if (stats.ethics > 75) return 'surprised';

  // Burning out
  if (stats.stress > 75 || stats.energy < 20) return 'tender';

  // Getting destroyed
  if (stats.reputation < 25 || stats.cash < 1000) return 'darkly_comic';

  // Catching a red flag (would need context, default check)
  if (stats.analystRating > 80) return 'excited';

  return 'neutral';
};

export const NARRATOR_MODE_PROMPTS: Record<NarratorMode, string> = {
  ominous: 'The player is winning too easily. Be OMINOUS. Foreshadow disaster. Everything going right is a warning sign in this business.',
  surprised: 'The player is making ethical choices. Be GENUINELY SURPRISED. Integrity in private equity is like finding a unicorn at a dog show.',
  tender: 'The player is burning out. Be UNEXPECTEDLY TENDER. Show a rare moment of humanity. The sarcasm drops just for a beat.',
  darkly_comic: 'The player is getting destroyed. Be DARKLY COMIC. Find the humor in catastrophe. Gallows humor is the only kind that survives here.',
  excited: 'The player just caught something clever. Be EXCITED. They found the thing others missed. Celebrate their analytical prowess.',
  neutral: 'Standard narration. Be witty, sardonic, and observant. The default mode of bemused detachment.',
};

// ==================== DEFAULT BLUEPRINT STATE ====================

export const createDefaultBlueprintAIState = (): BlueprintAIState => {
  // Inline initial inner monologue state to avoid circular dependency
  const initialInnerMonologue = {
    voices: [
      { id: 'greed' as const, name: 'GREED', linkedStat: 'cash' as const, activationThreshold: 20000, currentIntensity: 30, suppressionCost: { stress: 5 }, systemPrompt: '', isActive: true, isSuppressed: false, lastSpokeTick: 0, speakCooldown: 3 },
      { id: 'paranoia' as const, name: 'PARANOIA', linkedStat: 'analystRating' as const, activationThreshold: 40, currentIntensity: 20, suppressionCost: { stress: 8 }, systemPrompt: '', isActive: false, isSuppressed: false, lastSpokeTick: 0, speakCooldown: 4 },
      { id: 'empathy' as const, name: 'EMPATHY', linkedStat: 'ethics' as const, activationThreshold: 50, currentIntensity: 10, suppressionCost: { stress: 3, ethics: -5 }, systemPrompt: '', isActive: false, isSuppressed: false, lastSpokeTick: 0, speakCooldown: 6 },
      { id: 'ego' as const, name: 'EGO', linkedStat: 'reputation' as const, activationThreshold: 40, currentIntensity: 25, suppressionCost: { stress: 4 }, systemPrompt: '', isActive: false, isSuppressed: false, lastSpokeTick: 0, speakCooldown: 3 },
      { id: 'burnout' as const, name: 'BURNOUT', linkedStat: 'stress' as const, activationThreshold: 50, currentIntensity: 0, suppressionCost: { stress: 10 }, systemPrompt: '', isActive: false, isSuppressed: false, lastSpokeTick: 0, speakCooldown: 5 },
    ],
    activeInterjections: [],
    suppressedVoices: [],
    totalSuppressionsThisGame: 0,
  };
  return {
    innerMonologue: initialInnerMonologue,
    machiavelliState: createInitialMachiavelliState(),
    newspaper: null,
    newspaperArchive: [],
    informationEconomy: {
      playerKnownFacts: [],
      npcKnowledgeGraphs: {},
      activeTradeOffers: [],
      factVerificationLog: [],
    },
    forensicAutopsy: null,
    reputationWeb: {
      activeGossip: [],
      gossipHistory: [],
      npcGossipConnections: {},
      playerPerceivedReputation: {},
    },
    chaosEngine: {
      activeCrises: [],
      crisisHistory: [],
      cascadeChains: [],
      nextCrisisCheck: 5,
      crisisProbability: 15,
    },
    narrator: {
      currentMode: 'neutral',
      modeHistory: [],
      quipCooldown: 0,
    },
  };
};
