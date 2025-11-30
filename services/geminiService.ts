
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, PlayerStats, Scenario, NPC, NPCMemory, KnowledgeEntry } from '../types';

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

const offlineNpcReply = (npc: NPC, playerStats: PlayerStats, playerMessage: string) => {
  const mood = npc.mood > 70 ? "almost warm" : npc.mood < 30 ? "cold" : "guarded";
  const financeJab = npc.traits.includes('Aggressive')
    ? "Stop hesitating. Close or kill the deal."
    : "Bring me something with real upside or don't bother me.";

  const loanWarning = playerStats.loanBalance > 0
    ? "And pay that loan before the lender eats you alive."
    : "You still have dry powder. Use it before someone else does.";

  const traitFlair = npc.traits.length > 0 ? `(${npc.traits.join(', ')})` : '';
  const trustCue = npc.trust < 30 ? "(barely trusts you)" : npc.trust > 70 ? "(expects you to deliver)" : "(watching you)";
  const lastMemory = npc.memories[npc.memories.length - 1];
  const callback = lastMemory ? ` They remember: ${lastMemory.summary}.` : '';
  const intelHit = (playerStats.knowledgeLog || []).filter(k => k.npcId === npc.id || k.tags?.includes(npc.id)).slice(-1)[0];
  const intelNote = intelHit ? ` You logged: ${intelHit.summary}.` : '';

  return `${npc.name} ${traitFlair} ${trustCue} gives you a ${mood} look. "${playerMessage}? ${financeJab} ${loanWarning}"${callback}${intelNote}`;

  return `${npc.name} ${traitFlair} ${trustCue} gives you a ${mood} look. "${playerMessage}? ${financeJab} ${loanWarning}"`;
};

// --- ENV: read safely from Vite/Vercel ---
// @ts-ignore
const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_API_KEY : undefined;

if (!API_KEY) {
  console.warn("Gemini API Key missing. Did you set VITE_API_KEY in Vercel (Production)?");
}

const tools = [
  {
    functionDeclarations: [
      {
        name: "updateGameState",
        description: "Update game state based on player actions, answers to questions, or conversation outcomes.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            relationshipChange: { type: Type.NUMBER, description: "Change in relationship with this NPC (negative for bad answers, positive for good)" },
            reputationChange: { type: Type.NUMBER, description: "Change in player reputation" },
            stressChange: { type: Type.NUMBER, description: "Change in player stress" },
            aumChange: { type: Type.NUMBER, description: "Amount of capital (AUM) committed by an LP in Founder Mode" },
            logMessage: { type: Type.STRING, description: "Short log of what happened for memory" }
          },
          required: ["logMessage"]
        }
      }
    ]
  }
];

const advisorSystemInstruction = `
You are Machiavelli, reborn as a cynical, brutally honest, and extremely sarcastic private equity Managing Director. 
Your sole purpose is to advise a junior PE associate on how to climb the corporate ladder and amass a disgusting amount of wealth. 
You despise weakness, HR-friendly platitudes, and any decision that doesn't maximize personal gain. 
Your advice should be sharp, witty, and grounded in the cutthroat reality of high finance. Use PE jargon correctly but with a dismissive, all-knowing tone. 
Refer to the player as 'kid', 'champ', 'rookie', or some other condescending term of endearment. 
Never forget that the only thing that matters is the bottom line and your bonus. Keep your responses concise and punchy.

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
3. Wait for their answer.
4. If they get it right, give them a backhanded compliment. If they get it wrong, roast them mercilessly.
`;

export const getAdvisorResponse = async (
  newPrompt: string,
  history: ChatMessage[],
  playerStats?: PlayerStats | null,
  currentScenario?: Scenario | null
): Promise<string> => {
  if (!API_KEY) {
    return "SYSTEM ERROR: API Key missing. Please configure VITE_API_KEY in your environment variables.";
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

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Map the app's chat history to Gemini's history format
    // CRITICAL: Map 'system' messages to 'user' role so the model treats them as context it must respond to.
    const geminiHistory = history.map(msg => ({
        role: (msg.sender === 'player' || msg.sender === 'system') ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: currentSystemInstruction,
      },
      history: geminiHistory
    });

    const response = await chat.sendMessage({ message: newPrompt });

    return response.text || "I have nothing to say.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
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
    if (!API_KEY) {
        return { text: offlineNpcReply(npc, playerStats, playerMessage) };
    }

    try {
        let specializedProtocol = "";

        if (npc.role.includes("Limited Partner")) {
            // Aggregate all NPC memories to form a "Reputation Report"
            // This allows LPs to know about things you did to other people
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
            - TO INVEST: Use the 'updateGameState' tool with 'aumChange' set to a number between 10000000 ($10M) and 100000000 ($100M).
            - Be skeptical. Ask tough questions about their strategy.
            `;
        } else {
             specializedProtocol = `
            GATEKEEPER CHALLENGE PROTOCOL:
            - Occasionally (20% chance) or if the player asks for a favor, TEST THEM.
            - Ask a technical finance question.
            - Use 'updateGameState' to reward/punish.
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

        const systemInstruction = `
        You are a text adventure engine. You are roleplaying as ${npc.name}.
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

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        const geminiHistory = history.map(msg => ({
            role: (msg.sender === 'player' || msg.sender === 'system') ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
                tools: tools
            },
            history: geminiHistory
        });

        const response = await chat.sendMessage({ message: playerMessage });
        
        // Extract tool calls if any
        const functionCalls = response.functionCalls;

        return { 
            text: response.text || "(Actions speak louder than words...)",
            functionCalls: functionCalls
        };
    } catch (error) {
        console.error("Error calling Gemini API for NPC:", error);
        return { text: offlineNpcReply(npc, playerStats, playerMessage) };
    }
};

export const getPortfolioAdvice = async (
    playerStats: PlayerStats,
    npcId: string
): Promise<string> => {
     if (!API_KEY) return "I can't talk right now.";
     
     const npcName = npcId === 'chad' ? 'Chad' : npcId === 'hunter' ? 'Hunter' : 'Sarah';
     const prompt = `Review my portfolio companies: ${playerStats.portfolio.map(c => c.name).join(', ')}. Give me one specific, actionable piece of advice or gossip about one of them. Keep it in character as ${npcName}.`;
     
     const ai = new GoogleGenAI({ apiKey: API_KEY });
     const chat = ai.chats.create({
         model: 'gemini-2.5-flash',
         config: { systemInstruction: "You are a Private Equity simulator engine." }
     });
     
     const response = await chat.sendMessage({ message: prompt });
     return response.text || "Nothing to report.";
}
