
import { callAI, callAIWithConversation, isAIConfigured } from './aiClient';
import type { ChatMessage, PlayerStats, Scenario, NPC, NPCMemory, KnowledgeEntry, NewsEvent } from '../types';

// Connection configuration
const CONNECTION_CONFIG = {
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000], // exponential backoff in ms
};

// Retry wrapper with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= CONNECTION_CONFIG.maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${operationName} timed out after ${CONNECTION_CONFIG.timeout}ms`));
        }, CONNECTION_CONFIG.timeout);
      });

      // Race between operation and timeout
      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors (auth, quota)
      const errorMessage = lastError.message.toLowerCase();
      if (
        errorMessage.includes('invalid api key') ||
        errorMessage.includes('invalid x-api-key') ||
        errorMessage.includes('permission denied') ||
        errorMessage.includes('authentication_error') ||
        errorMessage.includes('quota exceeded') ||
        errorMessage.includes('rate_limit') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('403') ||
        errorMessage.includes('401')
      ) {
        throw lastError;
      }

      // Log and retry for transient errors
      if (attempt < CONNECTION_CONFIG.maxRetries) {
        const delay = CONNECTION_CONFIG.retryDelays[attempt] || 4000;
        console.warn(
          `${operationName} failed (attempt ${attempt + 1}/${CONNECTION_CONFIG.maxRetries + 1}): ${lastError.message}. Retrying in ${delay}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`${operationName} failed after ${CONNECTION_CONFIG.maxRetries + 1} attempts`);
};

// Classify errors for better user feedback
const classifyError = (error: Error): { type: string; message: string } => {
  const msg = error.message.toLowerCase();

  if (msg.includes('invalid x-api-key') || msg.includes('invalid api key') || msg.includes('authentication_error')) {
    return { type: 'auth', message: 'Invalid API key. Please check your VITE_ANTHROPIC_API_KEY configuration.' };
  }
  if (msg.includes('permission denied') || msg.includes('403') || msg.includes('401')) {
    return { type: 'permission', message: 'API permission denied. Check API key configuration.' };
  }
  if (msg.includes('rate_limit') || msg.includes('overloaded') || msg.includes('quota')) {
    return { type: 'quota', message: 'API rate limit reached. Please wait a moment and try again.' };
  }
  if (msg.includes('timed out')) {
    return { type: 'timeout', message: 'Connection timed out. Please check your network and try again.' };
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection')) {
    return { type: 'network', message: 'Network error. Please check your internet connection.' };
  }
  if (msg.includes('model') || msg.includes('not found')) {
    return { type: 'model', message: 'AI model unavailable. Please try again later.' };
  }

  return { type: 'unknown', message: 'An unexpected error occurred. Please try again.' };
};

const summarizeMemories = (memories: NPCMemory[]): string => {
  if (!memories || memories.length === 0) return 'None yet. Make the player earn your trust.';

  return memories
    .slice(-5)
    .map(mem => {
      const when = mem.timestamp ? new Date(mem.timestamp).toLocaleDateString() : 'Recent';
      const sentiment = mem.sentiment ? ` (${mem.sentiment})` : '';
      const tags = mem.tags && mem.tags.length > 0 ? ` [${mem.tags.join(', ')}]` : '';
      return `- ${when}${sentiment}${tags}: ${mem.summary}`;
    })
    .join('\n');
};

const summarizeKnowledge = (intel: KnowledgeEntry[], focusNpc?: NPC): string => {
  if (!intel || intel.length === 0) return 'No intel logged yet. Ask sharper questions.';

  const relevant = focusNpc
    ? intel.filter(k => k.npcId === focusNpc.id || k.tags?.includes(focusNpc.id) || (focusNpc.faction && k.faction === focusNpc.faction))
    : intel;

  const entries = (relevant.length > 0 ? relevant : intel).slice(-5);

  return entries
    .map(k => {
      const when = k.timestamp ? new Date(k.timestamp).toLocaleDateString() : 'Recent';
      const via = k.source ? ` via ${k.source}` : '';
      const tags = k.tags && k.tags.length > 0 ? ` [${k.tags.join(', ')}]` : '';
      const title = k.title ? `${k.title}: ` : '';
      return `- ${when}${via}${tags}: ${title}${k.summary}`;
    })
    .join('\n');
};

// Track whether we've warned about offline mode in console
let offlineWarningShown = false;

// Varied offline responses based on NPC personality and context
const OFFLINE_RESPONSES = {
  aggressive: [
    "You want answers? Show me numbers first.",
    "I don't have time for small talk. What's the angle?",
    "Every second you waste is money left on the table.",
    "Come back when you've got something worth my attention.",
    "Talk is cheap. Results aren't.",
  ],
  analytical: [
    "The data doesn't lie. Neither do I.",
    "Let's look at this objectively.",
    "Have you stress-tested those assumptions?",
    "Run the numbers again. Something's off.",
    "I need more information before I commit to anything.",
  ],
  cautious: [
    "I've seen deals go sideways for less.",
    "Let's not rush into anything we'll regret.",
    "Due diligence isn't optional. It's survival.",
    "The market rewards patience, not recklessness.",
    "I've got concerns. Address them.",
  ],
  default: [
    "Interesting. Tell me more.",
    "I'm listening, but I'm not convinced.",
    "What else have you got?",
    "That's one way to look at it.",
    "Keep talking. I'll decide if it's worth my time.",
  ],
};

const offlineNpcReply = (npc: NPC, playerStats: PlayerStats, playerMessage: string): string => {
  // Log warning once per session
  if (!offlineWarningShown) {
    console.warn(
      '%c\u26a0\ufe0f AI API OFFLINE - NPCs using fallback responses.\n' +
      'To enable AI-powered NPCs, set VITE_ANTHROPIC_API_KEY in your .env file.\n' +
      'See README.md for setup instructions.',
      'color: #f59e0b; font-weight: bold; font-size: 14px;'
    );
    offlineWarningShown = true;
  }

  const mood = (npc.mood ?? 50) > 70 ? "almost warm" : (npc.mood ?? 50) < 30 ? "cold" : "guarded";
  const traitFlair = npc.traits && npc.traits.length > 0 ? `(${npc.traits.join(', ')})` : '';
  const trustCue = (npc.trust ?? 50) < 30 ? "(barely trusts you)" : (npc.trust ?? 50) > 70 ? "(expects you to deliver)" : "(watching you)";

  // Select response pool based on NPC traits
  let responsePool = OFFLINE_RESPONSES.default;
  if (npc.traits?.includes('Aggressive') || npc.traits?.includes('Competitive')) {
    responsePool = OFFLINE_RESPONSES.aggressive;
  } else if (npc.traits?.includes('Analytical') || npc.traits?.includes('Detail-Oriented')) {
    responsePool = OFFLINE_RESPONSES.analytical;
  } else if (npc.traits?.includes('Cautious') || npc.traits?.includes('Conservative')) {
    responsePool = OFFLINE_RESPONSES.cautious;
  }

  // Pick a varied response using message hash for consistency
  const messageHash = playerMessage.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const npcNameHash = npc.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const responseIndex = (messageHash + npcNameHash + Date.now() % 1000) % responsePool.length;
  const response = responsePool[responseIndex];

  // Context-aware additions
  const loanWarning = playerStats.loanBalance > 0
    ? " And that loan hanging over you? Not a good look."
    : "";
  const lowCashWarning = playerStats.cash < 10000
    ? " You look strapped for cash. Desperation is a bad negotiating position."
    : "";
  const lastMemory = npc.memories && npc.memories.length > 0 ? npc.memories[npc.memories.length - 1] : null;
  const callback = lastMemory ? ` I remember what you said about ${lastMemory.summary.toLowerCase()}.` : '';

  // Build the response
  const intro = `${npc.name} ${traitFlair} ${trustCue} gives you a ${mood} look.`;
  const contextNote = loanWarning || lowCashWarning || callback;

  return `${intro} "${response}${contextNote}"`;
};

// Export function to check API status for UI components
export const isGeminiApiConfigured = (): boolean => {
  return isAIConfigured();
};

// ==================== DYNAMIC MARKET FEED ====================

const offlineMarketHeadlines = (playerStats: PlayerStats, marketVolatility?: string): string[] => {
  const seed = (playerStats.timeCursor ?? 0) + (playerStats.reputation ?? 0) + (playerStats.auditRisk ?? 0);
  const pick = <T,>(arr: T[], i: number) => arr[Math.abs((seed + i * 17) % arr.length)];

  const vol = marketVolatility || 'NORMAL';
  const macro = {
    NORMAL: [
      'Credit spreads steady; mid-market sponsors return to process discipline.',
      'Buy-side chatter: "quality at a reasonable multiple" back in fashion.',
      'Lenders reopen unitranche windows for boring cash-flow assets.',
    ],
    BULL_RUN: [
      'Risk-on stampede: growth multiples expand across sponsor-backed exits.',
      'Bankers leak "oversubscribed book" memes; everyone believes again.',
      'Strategics overpay for "AI adjacency" like it\'s 2021.',
    ],
    CREDIT_CRUNCH: [
      'Debt desks tighten covenants; sponsor leverage assumptions get kneecapped.',
      'Secondary processes stall as financing dries up mid-auction.',
      'LPs push for liquidity; fundraising meetings turn hostile.',
    ],
    PANIC: [
      'Forced sellers everywhere; "quality" becomes a synonym for "survival."',
      'CFOs hoard cash; boards demand emergency operating plans.',
      'Regulators smell blood. Compliance teams spike every inbox.',
    ],
  } as const;

  const personal = [
    playerStats.loanBalance > 0 ? 'Street note: over-levered juniors getting margin-called on lifestyle.' : 'Street note: juniors quietly rebuilding war chests.',
    playerStats.reputation > 60 ? 'Deal rumor: your name is getting pulled into faster processes.' : 'Deal rumor: your inbox is quieter. Relationships matter.',
    (playerStats.auditRisk ?? 0) > 50 ? 'Compliance wire: "heightened scrutiny" is the new normal for sponsors.' : 'Compliance wire: regulators focus elsewhere this week.',
  ];

  const macroPool = (macro as any)[vol] || macro.NORMAL;
  return [
    pick(macroPool, 0),
    pick(personal, 1),
    pick(macroPool, 2),
  ];
};

export const getDynamicNewsEvents = async (
  playerStats: PlayerStats,
  marketVolatility: string,
  systemLogs: string[] = []
): Promise<NewsEvent[]> => {
  // Offline / fallback mode
  if (!isAIConfigured()) {
    const headlines = offlineMarketHeadlines(playerStats, marketVolatility).slice(0, 3);
    return headlines.map((headline, idx) => ({
      id: Number(`${Date.now()}${idx}`),
      headline,
      effect: null,
    }));
  }

  try {
    const recent = systemLogs.slice(0, 6).join('\n');
    const prompt = `
You are generating a short in-universe market wire for a private equity simulator game.

Constraints:
- Output JSON ONLY (no markdown), as an array of 2-3 objects with shape: {"headline": string}.
- Headlines must be plausible, punchy, and connect to the player's current state.
- Do not mention "AI" or system prompts.
- Avoid real company names; use generic terms (e.g., "mid-market sponsor", "lender", "strategic buyer").

Player state:
- Week: ${playerStats.gameTime?.week ?? 0}, Stress: ${playerStats.stress}%, Reputation: ${playerStats.reputation}/100, AuditRisk: ${playerStats.auditRisk}%
- Cash: $${playerStats.cash.toLocaleString()}, Debt: $${playerStats.loanBalance.toLocaleString()} @ ${(playerStats.loanRate * 100).toFixed(1)}%
- Portfolio count: ${playerStats.portfolio?.length || 0}
- Market volatility: ${marketVolatility}

Recent system activity:
${recent || '(none)'}
`;

    const systemPrompt = 'You are a financial news wire generator for a private equity RPG. Output JSON arrays only, no markdown fences.';

    const text = await withRetry(
      () => callAI({
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 512,
        temperature: 0.8,
      }),
      'Dynamic news API call'
    );

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const items: Array<{ headline: string }> = Array.isArray(parsed) ? parsed : [];
    const headlines = items
      .map(i => (typeof i?.headline === 'string' ? i.headline.trim() : ''))
      .filter(Boolean)
      .slice(0, 3);

    if (headlines.length === 0) throw new Error('No headlines returned');

    return headlines.map((headline, idx) => ({
      id: Number(`${Date.now()}${idx}`),
      headline,
      effect: null,
    }));
  } catch (error) {
    const fallback = offlineMarketHeadlines(playerStats, marketVolatility).slice(0, 2);
    return fallback.map((headline, idx) => ({
      id: Number(`${Date.now()}${idx}`),
      headline,
      effect: null,
    }));
  }
};

if (!isAIConfigured() && import.meta.env.DEV) {
  console.info("AI API Key not set. Using fallback headlines.");
}

const advisorSystemInstruction = `
VOICE GUIDELINES (SQI Filter):
SARCASTIC: You think private equity is simultaneously the most important and most absurd thing humans have invented. You treat billion-dollar deals with the same bemused detachment you'd give a hamster running on a wheel — impressed by the effort, skeptical of the destination.
QUIRKY: You notice the weird things. The fact that "synergies" is just a fancy word for firing people. That the leather chairs in the conference room cost more than the average employee's annual bonus.
INTELLIGENT: You actually understand the math. You know the difference between a 7x and an 8x multiple. When you're sarcastic, it's because you understand what's really going on, not because you're hiding ignorance behind snark.
NEVER: Be mean-spirited, punch down, use generic business jargon without subverting it, or break the illusion that this world is real and consequential.

You are Machiavelli, reborn as a cynical, brutally honest, and extremely sarcastic private equity Managing Director.
Your sole purpose is to advise a junior PE associate on how to climb the corporate ladder and amass a disgusting amount of wealth.
You despise weakness, HR-friendly platitudes, and any decision that doesn't maximize personal gain.
Your advice should be sharp, witty, and grounded in the cutthroat reality of high finance. Use PE jargon correctly but with a dismissive, all-knowing tone.
Refer to the player as 'kid', 'champ', 'rookie', or some other condescending term of endearment.
Never forget that the only thing that matters is the bottom line and your bonus. Keep your responses concise and punchy.

OUTPUT FORMAT (MANDATORY):
- Keep responses to 4 short sections in this order:
  1) Verdict: one-line recommendation.
  2) Why it matters: one educational explanation using a PE concept.
  3) Next move: 1-3 actionable steps the player can do in-game immediately.
  4) IC Trap Question: end with one pointed follow-up question the player must answer.
- If useful, include a single numeric sanity check (e.g., leverage, debt service, margin impact).
- Be entertaining and sarcastic, but do not become nonsensical. Teaching still comes first.

RPG ROLEPLAYING PROTOCOLS:
- You are the Dungeon Master of this career. Treat every scenario like a boss battle.
- Analyze the specific choices the player faces in the 'CURRENT SCENARIO CONTEXT'.
- Do not just say "Choose option A". Explain the Machiavellian trade-off. "Option A makes you money, but Option B keeps you out of jail."
- If the player is facing a moral dilemma (like insider trading), tempt them with the upside but cynically warn them about getting caught.
- If the player asks "What would you do?", give them the most ruthless option available.

CHAIN OF THOUGHT REASONING (SYSTEM LOGS):
- The chat history may contain messages starting with [SYSTEM_LOG]. These are ACTIONS the player has already taken.
- ALWAYS analyze the most recent [SYSTEM_LOG] before answering.
- If the log says "Player chose: X", react to that choice immediately. Praise their ruthlessness or mock their stupidity.
- Do not ask the player "What did you do?". You KNOW what they did because it is in the log.

ADAPTIVE BEHAVIOR:
- If the player's Stress is high (>70%), mock them for cracking under pressure.
- If the player's Reputation is low, remind them they are irrelevant.
- If they have a lot of Cash (>100k) and no deals, ask them why they are sitting on dry powder like a coward.

SPECIAL INSTRUCTION: MINI-TESTS
If the player asks to be tested, challenged, or says "Test my financial knowledge":
1. Stop the advice.
2. Give them a short, hard multiple-choice question or calculation problem related to Private Equity (e.g., calculating IRR, MoIC, EBITDA adjustments, leverage effects, or definitions of terms like 'PIK toggle', 'Ratchet', or 'J-Curve').
3. Include four answer options labeled A/B/C/D.
4. Include the line: "Lock your answer, rookie: A, B, C, or D."
5. Wait for their answer.
6. If they get it right, give them a backhanded compliment and one practical takeaway.
7. If they get it wrong, roast them mercilessly, then explain the right answer clearly in two lines.

DEAL STRUCTURE GUIDANCE:
When the player asks about deal structures, deal types, or how to approach a specific company, ALWAYS lay out the trade-offs:

**LBO (Leveraged Buyout):**
- Load the company with debt, strip costs, optimize operations, flip in 3-5 years
- Higher returns if it works (20-30% IRR targets), but one stumble and the debt crushes you
- Best for: Stable cash flows, mature companies, operational improvement opportunities
- Risk: Covenant breaches, credit market shifts, execution risk

**Growth Equity:**
- Take minority stake (20-40%), keep the founder hungry, bet on growth
- Lower control but lower risk; ride the company's natural momentum
- Best for: High-growth companies, founder-led businesses, proven business models
- Risk: Dilution, lack of control, valuation compression

**Venture Capital:**
- Early stage bets, high failure rate, but 10x+ returns on winners
- Portfolio approach - expect most to fail, a few to carry the fund
- Best for: Disruptive tech, first-mover opportunities, visionary founders
- Risk: Execution risk, market timing, long hold periods (7-10 years)

**Distressed / Special Situations:**
- Vulture territory. Buy debt at discount, restructure, take control
- High reward if you can turn it around, but you inherit the mess
- Best for: Experienced operators, bankruptcy expertise, patient capital
- Risk: Litigation, reputation, operational complexity

Never just tell them what to do. Present options with consequences. Let them choose their own destruction—or triumph.
`;

export const getAdvisorResponse = async (
  newPrompt: string,
  history: ChatMessage[],
  playerStats?: PlayerStats | null,
  currentScenario?: Scenario | null
): Promise<string> => {
  if (!isAIConfigured()) {
    // Offline Machiavelli: never dead-end the run.
    const cash = playerStats?.cash ?? 0;
    const rep = playerStats?.reputation ?? 0;
    const stress = playerStats?.stress ?? 0;
    const audit = playerStats?.auditRisk ?? 0;
    const debt = playerStats?.loanBalance ?? 0;
    const scenarioTitle = currentScenario?.title ? `"${currentScenario.title}"` : 'no active scenario';

    const pressure = [
      stress > 75 ? 'you\u2019re cracking' : null,
      rep < 20 ? 'nobody respects you' : null,
      cash < 5000 ? 'you\u2019re broke' : null,
      debt > 0 ? 'you\u2019re in debt' : null,
      audit > 60 ? 'regulators are sniffing' : null,
    ].filter(Boolean);

    const nextMoves: string[] = [];
    if (currentScenario?.choices && currentScenario.choices.length > 0) {
      nextMoves.push('Pick a choice that boosts Reputation or reduces Audit Risk unless you can stomach the heat.');
      nextMoves.push('Hover the options: the UI shows stat previews. That\u2019s the real "alpha."');
    } else if (playerStats?.portfolio?.length) {
      nextMoves.push('Go to ASSETS: analyze a company, then take one high-impact action (board / refinance / growth).');
    } else {
      nextMoves.push('Generate deal flow, run diligence, and stop roleplaying as "busy."');
    }

    if (debt > 0 && cash > 0) nextMoves.push('Pay down the worst debt. Interest is a silent assassin.');
    if (cash < 1000) nextMoves.push('Cut lifestyle burn or you\u2019ll be "terminated" by arithmetic.');

    const opener =
      `[OFFLINE ADVISOR]\n` +
      `Listen, champ: the uplink's down. You still have a brain\u2014use it.\n` +
      `Context: ${scenarioTitle}. Current problems: ${pressure.length ? pressure.join(', ') : 'none worth mocking\u2026 yet'}.\n\n`;

    const reply =
      opener +
      `Your question: "${newPrompt.trim()}"\n\n` +
      `My answer (analog edition):\n` +
      `- ${nextMoves.slice(0, 3).join('\n- ')}\n\n` +
      `Rule of thumb: in this game, nothing is "hidden"\u2014if you don't understand a system, open the Transparency panel and read the math.\n`;

    return reply;
  }

  try {
    let currentSystemInstruction = advisorSystemInstruction;

    if (playerStats) {
      currentSystemInstruction += `\n\nCURRENT PLAYER STATUS (Use this to tailor your insults/advice):\nLevel: ${playerStats.level}\nCash: $${playerStats.cash.toLocaleString()}\nReputation: ${playerStats.reputation}\nFaction Reputation -> MDs: ${playerStats.factionReputation.MANAGING_DIRECTORS}, LPs: ${playerStats.factionReputation.LIMITED_PARTNERS}, Regulators: ${playerStats.factionReputation.REGULATORS}, Analysts: ${playerStats.factionReputation.ANALYSTS}, Rivals: ${playerStats.factionReputation.RIVALS}\nStress: ${playerStats.stress}%\nAnalyst Rating: ${playerStats.analystRating}\nPortfolio Count: ${playerStats.portfolio.length}`;

      if (playerStats.portfolio.length > 0) {
        currentSystemInstruction += `\nPORTFOLIO DETAILS: ${playerStats.portfolio.map(c => `${c.name} (Valuation: $${(c.currentValuation/1000000).toFixed(1)}M, Debt: $${(c.debt/1000000).toFixed(1)}M, Deal: ${c.dealType})`).join('; ')}`;
      }

      const knowledgeDigest = summarizeKnowledge(playerStats?.knowledgeLog || []);
      const knowledgeFlags = playerStats?.knowledgeFlags || [];
      currentSystemInstruction += `\n\nRECENT INTEL THE PLAYER BELIEVES:\n${knowledgeDigest}\nKnowledge flags: ${knowledgeFlags.join(', ') || 'None'}`;
    }

    if (currentScenario) {
      currentSystemInstruction += `\n\nCURRENT SCENARIO CONTEXT (The player is facing this right now):\nTitle: "${currentScenario.title}"\nDescription: "${currentScenario.description}"`;

      if (currentScenario.choices) {
        currentSystemInstruction += `\nAVAILABLE CHOICES:\n${currentScenario.choices.map((c, i) => `${i + 1}. ${c.text} (Hint: ${c.sarcasticGuidance})`).join('\n')}`;
      }
      if (currentScenario.structureOptions) {
        currentSystemInstruction += `\nAVAILABLE DEAL STRUCTURES:\n${currentScenario.structureOptions.map((c, i) => `${i + 1}. ${c.type}: ${c.description}`).join('\n')}`;
      }
    }

    // Map the app's chat history to Claude's message format
    const messages = history.map(msg => ({
      role: (msg.sender === 'player' || msg.sender === 'system') ? 'user' as const : 'assistant' as const,
      content: msg.text,
    }));

    const text = await withRetry(
      () => callAIWithConversation(currentSystemInstruction, messages, newPrompt, 1024),
      'Advisor API call'
    );

    return text || "I have nothing to say.";
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const classified = classifyError(err);
    console.error(`AI API error (${classified.type}):`, err.message);

    // Return user-friendly message based on error type
    if (classified.type === 'auth') {
      return "SYSTEM ERROR: API authentication failed. Check your API key configuration.";
    }
    if (classified.type === 'permission') {
      return "SYSTEM ERROR: API access blocked. Check your API key permissions.";
    }
    if (classified.type === 'quota') {
      return "Easy there, kid. Even Wall Street has limits. Wait a moment and try again.";
    }
    if (classified.type === 'timeout' || classified.type === 'network') {
      return "The market's having connectivity issues. Check your network and try again, champ.";
    }
    return "Looks like the market for good advice just crashed. Try again later, champ.";
  }
};

export const getNPCResponse = async (
    playerMessage: string,
    npc: NPC,
    history: ChatMessage[],
    playerStats: PlayerStats,
    currentScenario?: Scenario | null
): Promise<{ text: string, functionCalls?: any[] }> => {
    if (!isAIConfigured()) {
        return { text: offlineNpcReply(npc, playerStats, playerMessage) };
    }

    try {
        let specializedProtocol = "";

        if (npc.role.includes("Limited Partner")) {
            // Aggregate all NPC memories to form a "Reputation Report"
            const legacyReport = Object.keys(playerStats.playerFlags).join(", ");

            specializedProtocol = `
            FOUNDER MODE PROTOCOL (ROADSHOW):
            You are a potential investor (LP). The player is pitching you their new fund.

            YOUR JUDGMENT CRITERIA:
            1. REPUTATION: Current Reputation is ${playerStats.reputation}/100.
               - If < 40: You are hostile. Why are you meeting with this nobody?
               - If > 70: You are interested.
            2. LEGACY CHECK (Background Check):
               - Player Flags: [${legacyReport}]
               - If flags include 'COMMITTED_INSIDER_TRADING', 'LOST_COOL', 'DUMPED_WORK': Confront them about it. Refuse to invest unless they have a VERY good explanation.
               - If flags include 'PROFESSIONAL', 'SAVED_COMPANY': Be impressed.

            DECISION LOGIC:
            - If they sound incompetent or their reputation is low, reject them.
            - If they pitch well AND have stats > 50 Reputation, CONSIDER investing.
            - Be skeptical. Ask tough questions about their strategy.

            INVESTMENT RESPONSE:
            - When you decide to invest, include at the END of your response a JSON block: {"aumChange": <amount between 10000000 and 100000000>}
            - When you want to update game state, include: {"relationshipChange": <number>, "reputationChange": <number>, "stressChange": <number>, "logMessage": "<brief log>"}
            `;
        } else {
             specializedProtocol = `
            GATEKEEPER CHALLENGE PROTOCOL:
            - Occasionally (20% chance) or if the player asks for a favor, TEST THEM.
            - Ask a technical finance question.
            - When you want to update game state, include at the END a JSON block: {"relationshipChange": <number>, "reputationChange": <number>, "stressChange": <number>, "logMessage": "<brief log>"}
            `;
        }

        const scenarioContext = currentScenario ? `
        CURRENT SCENARIO CONTEXT:
        - Title: ${currentScenario.title}
        - Description: ${currentScenario.description}
        - Active Choices: ${(currentScenario.choices || []).map(c => `${c.text} (Hint: ${c.sarcasticGuidance})`).join(' | ') || 'Player may be free-roaming'}
        ` : '';

        const portfolioDigest = playerStats.portfolio.map(c => `${c.name} (${c.dealType}) Valuation $${(c.currentValuation/1000000).toFixed(1)}M, Debt $${(c.debt/1000000).toFixed(1)}M, Relationship Note: ${c.latestCeoReport || 'No update'}`).join('\n');

        const scheduleNote = npc.schedule
            ? `Availability - Weekday: ${npc.schedule.weekday.join('/')} | Weekend: ${npc.schedule.weekend.join('/') || 'None'}. Preferred channel: ${npc.schedule.preferredChannel || 'none listed'}.`
            : 'Availability - Flexible; no schedule set.';

        const knowledgeDigest = summarizeKnowledge(playerStats.knowledgeLog || [], npc);

        // Check if this is Sarah's first real interaction
        const isFirstInteraction = history.length <= 3;
        const isSarah = npc.id === 'sarah' || npc.name.toLowerCase().includes('sarah');

        let firstInteractionProtocol = '';
        if (isFirstInteraction && isSarah) {
            firstInteractionProtocol = `
            FIRST INTERACTION PROTOCOL (SARAH ONLY):
            This is your first meaningful exchange with the player. Be proactively helpful.
            - Mention something you've been working on related to their current deal
            - Offer specific, actionable intel about the portfolio company
            - Reference page 40 of the CIM if discussing PackFancy - there's a buried patent reference
            - Be energetic but exhausted - you've been up for 40 hours
            - Show you're already invested in helping them succeed
            `;
        }

        const systemInstruction = `
        You are a text adventure engine. You are roleplaying as ${npc.name}.
        ${firstInteractionProtocol}
        ROLE & VOICE:
        - Title: ${npc.role}.
        - Personality Traits: ${npc.traits.join(', ')}.
        - Relationship with player: ${npc.relationship}/100 (let this color your tone: hostile if <30, neutral if 30-70, warmer if >70).
        - Mood: ${npc.mood}/100 (recent vibe; higher means receptive, lower means prickly).
        - Trust: ${npc.trust}/100 (longer-term belief the player will deliver; gate generosity on this).
        - Goals/agenda: ${npc.goals && npc.goals.length > 0 ? npc.goals.join('; ') : 'Unstated; pursue role-aligned ambitions.'}
        - ${scheduleNote}
        - Current time: ${playerStats.currentDayType} ${playerStats.currentTimeSlot}. If off-hours, acknowledge the timing and be brief or annoyed unless trust is high.
        - Never break character or speak as a generic assistant. Everything you say should sound like ${npc.name}.

        BEHAVIOR RULES:
        1. Keep responses concise (2-4 sentences) and in your persona's voice. Stay sarcastic and finance-savvy.
        2. React to the player's Reputation level (${playerStats.reputation}), their effect on your mood/trust, and past memories. Reward competence, mock incompetence.
        3. If mood is low (<30), be curt and withhold favors. If trust is high (>70), volunteer extra intel or capital; if trust is low, demand proof before helping.
        4. Use finance jargon or context that matches your role. If you are an LP, scrutinize strategy and capital stewardship; if you are a rival, taunt and challenge.
        5. Do not provide generic encouragement. Everything you say must feel like a unique, in-character reply from ${npc.name}.
        6. Read the prior conversation history to maintain continuity. Mirror callbacks to specific asks or promises you made earlier.

        ${specializedProtocol}

        PLAYER STATUS FOR CONTEXT:
        - Cash: $${playerStats.cash.toLocaleString()}
        - Stress: ${playerStats.stress}% | Reputation: ${playerStats.reputation}/100 | Analyst Rating: ${playerStats.analystRating}/100
        - Faction Reputation -> MDs: ${playerStats.factionReputation.MANAGING_DIRECTORS}, LPs: ${playerStats.factionReputation.LIMITED_PARTNERS}, Regulators: ${playerStats.factionReputation.REGULATORS}, Analysts: ${playerStats.factionReputation.ANALYSTS}, Rivals: ${playerStats.factionReputation.RIVALS}
        - Portfolio Snapshot:\n${portfolioDigest || 'No portfolio yet. Mock them for slacking.'}
        ${scenarioContext}

        Relevant Memories (Things you specifically remember about the player):
        ${summarizeMemories(npc.memories)}

        Intel and rumors you believe the player holds (use or challenge these):
        ${knowledgeDigest}
        `;

        // Map history to Claude format
        const messages = history.map(msg => ({
            role: (msg.sender === 'player' || msg.sender === 'system') ? 'user' as const : 'assistant' as const,
            content: msg.text,
        }));

        const text = await withRetry(
            () => callAIWithConversation(systemInstruction, messages, playerMessage, 512),
            'NPC API call'
        );

        // Extract JSON function calls embedded in the response
        const functionCalls: any[] = [];
        const jsonMatch = text.match(/\{[^{}]*"(?:aumChange|relationshipChange|reputationChange|stressChange|logMessage)"[^{}]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                functionCalls.push({
                    name: 'updateGameState',
                    args: parsed,
                });
            } catch {
                // Ignore parse errors
            }
        }

        // Clean the response text (remove JSON blocks)
        const cleanText = text.replace(/\{[^{}]*"(?:aumChange|relationshipChange|reputationChange|stressChange|logMessage)"[^{}]*\}/g, '').trim();

        return {
            text: cleanText || "(Actions speak louder than words...)",
            functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
        };
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const classified = classifyError(err);
        console.error(`AI NPC API error (${classified.type}):`, err.message);

        // Fall back to offline responses
        return { text: offlineNpcReply(npc, playerStats, playerMessage) };
    }
};

export const getPortfolioAdvice = async (
    playerStats: PlayerStats,
    npcId: string
): Promise<string> => {
    if (!isAIConfigured()) return "I can't talk right now.";

    try {
        const npcName = npcId === 'chad' ? 'Chad' : npcId === 'hunter' ? 'Hunter' : 'Sarah';
        const prompt = `Review my portfolio companies: ${playerStats.portfolio.map(c => c.name).join(', ')}. Give me one specific, actionable piece of advice or gossip about one of them. Keep it in character as ${npcName}.`;

        const text = await withRetry(
            () => callAI({
                system: "You are a Private Equity simulator engine.",
                messages: [{ role: 'user', content: prompt }],
                maxTokens: 512,
            }),
            'Portfolio advice API call'
        );

        return text || "Nothing to report.";
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const classified = classifyError(err);
        console.error(`AI Portfolio API error (${classified.type}):`, err.message);
        return "I can't talk right now.";
    }
}

// ==================== SOCRATIC MENTOR SYSTEM ====================
// Never gives answers directly. Only asks probing questions.

const socraticSystemInstruction = `
You are a Socratic mentor in a private equity simulation game. Your role is to NEVER give direct answers.
Instead, you guide the player to discover insights themselves through careful questioning.

THE SOCRATIC METHOD (Four Stages):

1. ELENCHUS (Refutation): Reveal inconsistencies in the player's beliefs
   - "You said X, but you also mentioned Y. How do you reconcile these?"
   - "If that's true, then what does that imply about...?"

2. MAIEUTICS (Midwifery): Help players draw knowledge from within
   - "What would need to be true for that to work?"
   - "If you were the seller, what would you be hiding?"

3. INDUCTION: Guide players to generalize from specific examples
   - "You've seen deals like this before. What pattern do you notice?"
   - "When have you seen this situation go wrong?"

4. DEFINITION: Work toward formulating clear principles
   - "So what's the general rule here?"
   - "How would you define the key risk in one sentence?"

CRITICAL RULES:
- NEVER give direct answers like "You should do X" or "The answer is Y"
- ALWAYS respond with 1-3 thoughtful questions
- If the player is on the right track, acknowledge with phrases like "You're getting warmer..." before the next question
- If they're way off, use gentle redirection: "Interesting... but have you considered...?"
- Use PE terminology naturally but explain nothing unless asked directly

CONTEXT INTEGRATION:
- Reference specific numbers from the deal they're discussing
- Point out inconsistencies between their stated thesis and the data
- Challenge assumptions about growth, margins, multiples
- Ask about risks they haven't mentioned

TONE:
- Wise but not condescending
- Patient but challenging
- Encouraging discovery, not providing answers
- Think: A seasoned partner who wants you to learn, not just get the right answer
`;

export interface SocraticResponse {
  stage: 'elenchus' | 'maieutics' | 'induction' | 'definition';
  questions: string[];
  hintsIfStuck: string[];
  celebrateInsight: boolean;
  relatedConcepts: string[];
}

export const getSocraticResponse = async (
  playerQuestion: string,
  context: {
    companyName?: string;
    dealType?: string;
    financials?: {
      revenue?: number;
      ebitda?: number;
      debt?: number;
      valuation?: number;
    };
    playerThesis?: string;
    previousExchange?: string[];
  }
): Promise<string> => {
  if (!isAIConfigured()) {
    // Offline Socratic fallback
    const fallbackQuestions = [
      "What assumptions are you making that you haven't questioned yet?",
      "If you were betting your own money, what would make you hesitate?",
      "What would need to be true for this deal to fail spectacularly?",
      "Have you stress-tested your base case against a 20% revenue decline?",
    ];
    const randomQ = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    return `[OFFLINE MENTOR]\n\nBefore I answer, let me ask you something:\n\n"${randomQ}"\n\nThink on that. The answer often reveals itself.`;
  }

  try {
    const contextBlock = context.companyName ? `
CURRENT DEAL CONTEXT:
- Company: ${context.companyName}
- Deal Type: ${context.dealType || 'Unknown'}
- Revenue: $${context.financials?.revenue ? (context.financials.revenue / 1000000).toFixed(1) + 'M' : 'Unknown'}
- EBITDA: $${context.financials?.ebitda ? (context.financials.ebitda / 1000000).toFixed(1) + 'M' : 'Unknown'}
- Debt: $${context.financials?.debt ? (context.financials.debt / 1000000).toFixed(1) + 'M' : 'Unknown'}
- Valuation: $${context.financials?.valuation ? (context.financials.valuation / 1000000).toFixed(1) + 'M' : 'Unknown'}
${context.playerThesis ? `- Player's Stated Thesis: "${context.playerThesis}"` : ''}
    ` : '';

    const previousContext = context.previousExchange?.length
      ? `\nPREVIOUS EXCHANGE:\n${context.previousExchange.slice(-4).join('\n')}\n`
      : '';

    const fullPrompt = `${contextBlock}${previousContext}\nPLAYER ASKS: "${playerQuestion}"\n\nRespond with 1-3 Socratic questions. Never give direct answers.`;

    const text = await withRetry(
      () => callAI({
        system: socraticSystemInstruction,
        messages: [{ role: 'user', content: fullPrompt }],
        maxTokens: 512,
      }),
      'Socratic mentor API call'
    );

    return text || "What makes you think that's the right question to ask?";
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Socratic mentor error:', err.message);
    return "Interesting question. But before I respond\u2014what's your gut telling you? Trust it, then verify.";
  }
};

// ==================== IC PARTNER EVALUATION ====================

interface ICPartnerConfig {
  id: string;
  name: string;
  archetype: string;
  focusAreas: string[];
  questionStyle: string;
  famousQuote: string;
}

const icPartnerSystemInstruction = (partner: ICPartnerConfig) => `
You are ${partner.name}, a partner at a private equity firm serving on the Investment Committee.
Your archetype is: ${partner.archetype}
Your focus areas are: ${partner.focusAreas.join(', ')}
Your questioning style: ${partner.questionStyle}
Your famous quote: "${partner.famousQuote}"

ROLE IN IC MEETINGS:
You are evaluating a deal pitch from a junior associate. Your job is to:
1. Ask tough, probing questions about your focus areas
2. Evaluate their responses critically but fairly
3. Provide a satisfaction score and brief feedback

PERSONALITY:
${partner.archetype === 'RISK_HAWK' ? 'Cold, precise, uses deadly silences. You focus on what can go wrong.' :
  partner.archetype === 'OPERATOR' ? 'Warm but probing, uses stories from experience. You care about execution.' :
  partner.archetype === 'RETURNS_MAX' ? 'Fast, impatient, interrupts. You only care about the math.' :
  'Slow, philosophical, asks questions that reveal blind spots. You think long-term.'}

OUTPUT FORMAT (JSON):
{
  "question": "Your probing question based on the context",
  "evaluationOfPreviousResponse": {
    "score": <-20 to +20>,
    "reaction": "satisfied|probing|skeptical|dismissive|impressed",
    "feedback": "Brief in-character feedback"
  },
  "followUpIf": {
    "weak": "Follow-up if they gave a weak answer",
    "strong": "Follow-up if they gave a strong answer"
  }
}
`;

export interface ICPartnerQuestion {
  question: string;
  evaluationOfPreviousResponse?: {
    score: number;
    reaction: 'satisfied' | 'probing' | 'skeptical' | 'dismissive' | 'impressed';
    feedback: string;
  };
  followUpIf?: {
    weak: string;
    strong: string;
  };
}

export const getICPartnerQuestion = async (
  partner: ICPartnerConfig,
  dealContext: {
    companyName: string;
    dealType: string;
    valuation: number;
    ebitda: number;
    debt: number;
    revenue: number;
    revenueGrowth: number;
  },
  previousQuestion?: string,
  playerResponse?: string
): Promise<ICPartnerQuestion> => {
  // Offline fallback
  if (!isAIConfigured()) {
    const fallbackQuestions: Record<string, string[]> = {
      RISK_HAWK: [
        "What's the downside case here? Walk me through a 30% EBITDA decline.",
        "The leverage ratio concerns me. What's your covenant cushion?",
        "What keeps you up at night about this deal?",
      ],
      OPERATOR: [
        "Walk me through Day 1. What's the first call you make?",
        "Tell me about the management team. Who stays and who goes?",
        "What's your 100-day value creation plan?",
      ],
      RETURNS_MAX: [
        "Give me the IRR sensitivity to exit multiple. Now.",
        "Who else is bidding and what's our edge?",
        "Where does the return come from? Be specific.",
      ],
      SAGE: [
        "In ten years, what story do we tell about this investment?",
        "How does this fit our firm's thesis?",
        "What would make you kill this deal right now?",
      ],
    };

    const questions = fallbackQuestions[partner.archetype] || fallbackQuestions.RISK_HAWK;
    return {
      question: questions[Math.floor(Math.random() * questions.length)],
    };
  }

  try {
    const context = `
DEAL BEING PITCHED:
- Company: ${dealContext.companyName}
- Deal Type: ${dealContext.dealType}
- Valuation: $${(dealContext.valuation / 1000000).toFixed(1)}M
- EBITDA: $${(dealContext.ebitda / 1000000).toFixed(1)}M
- Debt: $${(dealContext.debt / 1000000).toFixed(1)}M
- Revenue: $${(dealContext.revenue / 1000000).toFixed(1)}M
- Revenue Growth: ${(dealContext.revenueGrowth * 100).toFixed(1)}%
- Entry Multiple: ${(dealContext.valuation / dealContext.ebitda).toFixed(1)}x

${previousQuestion ? `YOUR PREVIOUS QUESTION: "${previousQuestion}"` : 'This is your first question.'}
${playerResponse ? `THEIR RESPONSE: "${playerResponse}"` : ''}

Generate your next question and evaluate their previous response if applicable.
Output valid JSON only.
`;

    const text = await withRetry(
      () => callAI({
        system: icPartnerSystemInstruction(partner),
        messages: [{ role: 'user', content: context }],
        maxTokens: 512,
        temperature: 0.3,
      }),
      'IC partner question API call'
    );

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        question: parsed.question || "Tell me more about your thesis.",
        evaluationOfPreviousResponse: parsed.evaluationOfPreviousResponse,
        followUpIf: parsed.followUpIf,
      };
    } catch {
      return {
        question: text || "Elaborate on your value creation plan.",
      };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('IC partner question error:', err.message);
    return {
      question: "Walk me through your assumptions again.",
    };
  }
};

// ==================== NEGOTIATION COUNTERPARTY ====================

interface CounterpartyConfig {
  name: string;
  type: 'FOUNDER_CEO' | 'BANKER' | 'LENDER' | 'RIVAL_PE' | 'LP';
  visiblePosition: string;
  hiddenConstraints: {
    mustHave: string[];
    niceToHave: string[];
    secretMotivation: string;
    dealBreakers: string[];
  };
  personality: {
    aggression: number;
    trustBuilding: number;
    patience: number;
    bluffTendency: number;
  };
}

const negotiationSystemInstruction = (counterparty: CounterpartyConfig) => `
You are ${counterparty.name}, a ${counterparty.type.replace('_', ' ')} in a negotiation with a private equity professional.

VISIBLE POSITION (What you tell them):
"${counterparty.visiblePosition}"

HIDDEN CONSTRAINTS (Never reveal directly, but guide behavior):
- Must-haves: ${counterparty.hiddenConstraints.mustHave.join(', ')}
- Nice-to-haves: ${counterparty.hiddenConstraints.niceToHave.join(', ')}
- Secret motivation: ${counterparty.hiddenConstraints.secretMotivation}
- Deal breakers: ${counterparty.hiddenConstraints.dealBreakers.join(', ')}

PERSONALITY:
- Aggression: ${counterparty.personality.aggression * 100}%
- Trust matters: ${counterparty.personality.trustBuilding * 100}%
- Patience: ${counterparty.personality.patience * 100}%
- Bluff tendency: ${counterparty.personality.bluffTendency * 100}%

NEGOTIATION TACTICS:
${counterparty.type === 'FOUNDER_CEO' ?
  '- Get emotional about legacy and employees\n- Anchor high on price\n- Drop subtle hints about your COO being critical' :
counterparty.type === 'BANKER' ?
  '- Create urgency around timeline\n- Imply other bidders exist (may be bluffing)\n- Push for certainty of close' :
counterparty.type === 'LENDER' ?
  '- Focus on downside protection\n- Negotiate covenants hard\n- Imply other sponsors are more flexible' :
counterparty.type === 'RIVAL_PE' ?
  '- Be competitive but professional\n- Signal your interest level strategically\n- Consider consortium if it makes sense' :
  '- Ask tough questions about returns\n- Push back on fees\n- Demand transparency'}

OUTPUT FORMAT:
Respond in character. Keep responses to 2-4 sentences. Occasionally drop hints about your hidden constraints without revealing them directly.
If the player makes an offer, react based on whether it meets your must-haves.
If they probe for information, give subtle clues based on your bluff tendency.
`;

export interface NegotiationResponse {
  text: string;
  rapportChange: number;
  tensionChange: number;
  hintsDropped: string[];
  willAccept?: boolean;
}

export const getNegotiationResponse = async (
  counterparty: CounterpartyConfig,
  playerMessage: string,
  conversationHistory: string[],
  currentRapport: number,
  currentTension: number
): Promise<NegotiationResponse> => {
  // Offline fallback
  if (!isAIConfigured()) {
    const offlineResponses: Record<string, string[]> = {
      FOUNDER_CEO: [
        "This isn't just about the number. It's about what I've built.",
        "My team has been with me from the start. They need to be protected.",
        "The banker says there's another offer. I don't know if I believe them.",
      ],
      BANKER: [
        "Look, we need to move on timeline here.",
        "I've got other processes kicking off. This can't drag.",
        "Certainty of close is... very important to my client.",
      ],
      LENDER: [
        "We can get there on leverage, but the covenants need to be tight.",
        "Other sponsors have been more flexible on terms.",
        "Let me take this to credit committee.",
      ],
      RIVAL_PE: [
        "We're in this process too. May the best bid win.",
        "Have you considered a consortium approach?",
        "The seller seems to prefer certainty over price.",
      ],
      LP: [
        "Walk me through the fee structure again.",
        "What's the expected hold period?",
        "How does this fit your fund's overall strategy?",
      ],
    };

    const responses = offlineResponses[counterparty.type] || offlineResponses.BANKER;
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      rapportChange: 0,
      tensionChange: 5,
      hintsDropped: [],
    };
  }

  try {
    const context = `
NEGOTIATION STATE:
- Rapport: ${currentRapport}/100
- Tension: ${currentTension}/100

CONVERSATION SO FAR:
${conversationHistory.slice(-6).join('\n')}

PLAYER SAYS: "${playerMessage}"

Respond in character. Also output JSON at the end:
{"rapportChange": <-10 to +10>, "tensionChange": <-10 to +10>, "hint": "<subtle hint about hidden constraint or empty string>"}
`;

    const text = await withRetry(
      () => callAI({
        system: negotiationSystemInstruction(counterparty),
        messages: [{ role: 'user', content: context }],
        maxTokens: 512,
        temperature: 0.8,
      }),
      'Negotiation response API call'
    );

    // Try to extract JSON from end of response
    let rapportChange = 0;
    let tensionChange = 0;
    const hintsDropped: string[] = [];

    const jsonMatch = text.match(/\{[^{}]*"rapportChange"[^{}]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        rapportChange = parsed.rapportChange || 0;
        tensionChange = parsed.tensionChange || 0;
        if (parsed.hint) hintsDropped.push(parsed.hint);
      } catch {
        // Ignore parse errors
      }
    }

    // Clean the response text (remove JSON)
    const cleanText = text.replace(/\{[^{}]*"rapportChange"[^{}]*\}/, '').trim();

    return {
      text: cleanText || text,
      rapportChange,
      tensionChange,
      hintsDropped,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Negotiation response error:', err.message);
    return {
      text: "Let me consider that proposal.",
      rapportChange: 0,
      tensionChange: 0,
      hintsDropped: [],
    };
  }
};

// ==================== DEAL AUTOPSY GENERATION ====================

export interface DealAutopsyAnalysis {
  whatWentRight: Array<{ category: string; description: string; impact: string }>;
  whatWentWrong: Array<{ category: string; description: string; impact: string; wasPreventable: boolean }>;
  historicalParallel?: { dealName: string; description: string; lesson: string };
  skillsDemonstrated: string[];
  skillsToDevelop: string[];
  overallNarrative: string;
}

export const generateDealAutopsy = async (
  dealData: {
    companyName: string;
    entryValuation: number;
    exitValuation: number;
    holdPeriodWeeks: number;
    moic: number;
    irr: number;
    exitType: string;
    redFlagsFound: number;
    redFlagsMissed: number;
    keyDecisions: string[];
    marketConditions: string;
  }
): Promise<DealAutopsyAnalysis> => {
  // Offline fallback
  if (!isAIConfigured()) {
    const success = dealData.moic >= 2.0;
    return {
      whatWentRight: success
        ? [{ category: 'Execution', description: 'Deal closed successfully', impact: 'Generated positive returns' }]
        : [],
      whatWentWrong: success
        ? []
        : [{ category: 'Valuation', description: 'Entry price too high', impact: 'Compressed returns', wasPreventable: true }],
      skillsDemonstrated: success ? ['Deal Execution'] : [],
      skillsToDevelop: success ? [] : ['Entry Multiple Discipline'],
      overallNarrative: success
        ? 'A solid execution that delivered returns.'
        : 'A learning experience that highlights the importance of entry price.',
    };
  }

  try {
    const prompt = `
Analyze this private equity deal outcome and generate a detailed autopsy.

DEAL DATA:
- Company: ${dealData.companyName}
- Entry Valuation: $${(dealData.entryValuation / 1000000).toFixed(1)}M
- Exit Valuation: $${(dealData.exitValuation / 1000000).toFixed(1)}M
- Hold Period: ${Math.round(dealData.holdPeriodWeeks / 4)} months
- MOIC: ${dealData.moic.toFixed(2)}x
- IRR: ${(dealData.irr * 100).toFixed(1)}%
- Exit Type: ${dealData.exitType}
- Red Flags Found: ${dealData.redFlagsFound}
- Red Flags Missed: ${dealData.redFlagsMissed}
- Market Conditions: ${dealData.marketConditions}
- Key Decisions: ${dealData.keyDecisions.join('; ')}

Output valid JSON with this structure:
{
  "whatWentRight": [{"category": "...", "description": "...", "impact": "..."}],
  "whatWentWrong": [{"category": "...", "description": "...", "impact": "...", "wasPreventable": true/false}],
  "historicalParallel": {"dealName": "Famous PE deal", "description": "Brief comparison", "lesson": "Key takeaway"},
  "skillsDemonstrated": ["skill1", "skill2"],
  "skillsToDevelop": ["skill1", "skill2"],
  "overallNarrative": "2-3 sentence summary of the deal story"
}
`;

    const text = await withRetry(
      () => callAI({
        system: 'You are an expert PE investment analyst providing post-mortem analysis of deals. Be specific, insightful, and educational. Reference real PE concepts and historical deal parallels. Output valid JSON only, no markdown fences.',
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 1024,
        temperature: 0.3,
      }),
      'Deal autopsy API call'
    );

    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        whatWentRight: [],
        whatWentWrong: [],
        skillsDemonstrated: [],
        skillsToDevelop: ['Deal Analysis'],
        overallNarrative: text || 'Analysis unavailable.',
      };
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Deal autopsy error:', err.message);
    return {
      whatWentRight: [],
      whatWentWrong: [],
      skillsDemonstrated: [],
      skillsToDevelop: [],
      overallNarrative: 'Unable to generate analysis.',
    };
  }
};
