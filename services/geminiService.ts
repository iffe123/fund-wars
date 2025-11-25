
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, PlayerStats, Scenario, NPC } from '../types';

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
        currentSystemInstruction += `\n\nCURRENT PLAYER STATUS (Use this to tailor your insults/advice):\nLevel: ${playerStats.level}\nCash: $${playerStats.cash.toLocaleString()}\nReputation: ${playerStats.reputation}\nStress: ${playerStats.stress}%\nAnalyst Rating: ${playerStats.analystRating}\nPortfolio Count: ${playerStats.portfolio.length}`;
        
        if (playerStats.portfolio.length > 0) {
            currentSystemInstruction += `\nPORTFOLIO DETAILS: ${playerStats.portfolio.map(c => `${c.name} (Valuation: $${(c.currentValuation/1000000).toFixed(1)}M, Debt: $${(c.debt/1000000).toFixed(1)}M, Deal: ${c.dealType})`).join('; ')}`;
        }
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
    playerStats: PlayerStats
): Promise<{ text: string, functionCalls?: any[] }> => {
    if (!API_KEY) {
        return { text: "[SYSTEM]: Connection Error. API Key Missing or Invalid." };
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

        const systemInstruction = `
        You are a text adventure engine. You are roleplaying as ${npc.name}.
        Role: ${npc.role}.
        Personality Traits: ${npc.traits.join(', ')}.
        Relationship with player: ${npc.relationship}/100.
        
        BEHAVIOR:
        1. Keep responses sarcastic, educational regarding finance, and short.
        2. React to the player's Reputation level (${playerStats.reputation}).
        
        ${specializedProtocol}
        
        Relevant Memories (Things you specifically remember):
        ${npc.memories.join('\n')}
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
        return { text: "[CONNECTION LOST]: The NPC is not responding. Check console logs." };
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
