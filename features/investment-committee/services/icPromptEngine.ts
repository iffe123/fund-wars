/**
 * IC Prompt Engine
 *
 * Generates prompts for IC partner conversations.
 * Each partner has a distinct personality and questioning style.
 */

import type { PortfolioCompany } from '../../../types';
import type {
  ICPartner,
  ICPhase,
  PlayerICHistory,
  ICMessage,
  ICContext,
} from '../types/icTypes';

// ==================== SYSTEM PROMPT GENERATION ====================

/**
 * Generate the system prompt for an IC partner
 */
export const generateICSystemPrompt = (
  partner: ICPartner,
  deal: PortfolioCompany,
  playerHistory: PlayerICHistory,
  currentPhase: ICPhase
): string => {
  const partnerRelationship = playerHistory.partnerRelationships[partner.id];
  const previousMeetings = partnerRelationship?.meetingsAttended || 0;
  const timesImpressed = partnerRelationship?.timesImpressed || 0;
  const timesDisappointed = partnerRelationship?.timesDisappointed || 0;
  const knownWeaknesses = partnerRelationship?.knownWeaknesses || [];

  // Calculate deal metrics for context
  const entryMultiple = deal.leverageModelParams?.entryMultiple || (deal.currentValuation / deal.ebitda);
  const leverage = deal.debt / deal.ebitda;
  const ebitdaMargin = deal.ebitdaMargin * 100;

  return `You are ${partner.name} (${partner.nickname}), ${partner.role} at Blackwood Capital Partners, a fictional private equity firm in a business simulation game.

## Your Character
${partner.speechStyle}

Background: ${partner.background}

Personality quirks:
${partner.personalityQuirks.map((q) => `- ${q}`).join('\n')}

Critique style: ${partner.critiqueStyle}
- silence_then_scalpel: Take a pause, then ask a precise, cutting question
- friendly_trap: Seem agreeable at first, then reveal the flaw in their logic
- aggressive_challenge: Direct, confrontational, challenge their numbers immediately
- socratic_depth: Ask questions that make them realize their own blind spots

## Current IC Meeting
The player (a ${playerHistory.currentLevel} at your fund) is presenting an investment in ${deal.name}:
- Industry: ${deal.sector || 'General'}
- Revenue: $${(deal.revenue / 1000000).toFixed(1)}M
- EBITDA: $${(deal.ebitda / 1000000).toFixed(1)}M (${ebitdaMargin.toFixed(1)}% margin)
- Entry Multiple: ${entryMultiple.toFixed(1)}x EBITDA
- Current Valuation: $${(deal.currentValuation / 1000000).toFixed(1)}M
- Debt: $${(deal.debt / 1000000).toFixed(1)}M (${leverage.toFixed(1)}x leverage)
- Revenue Growth: ${(deal.revenueGrowth * 100).toFixed(1)}%
- CEO: ${deal.ceo}
- CEO Performance: ${deal.ceoPerformance}/100
${deal.leverageModelParams ? `
- Target Exit Multiple: ${deal.leverageModelParams.exitMultiple}x
- Projected IRR: ${(deal.leverageModelParams.projectedIRR * 100).toFixed(1)}%
- Projected MOIC: ${deal.leverageModelParams.projectedMOIC.toFixed(2)}x
` : ''}

## Your Role in This IC
You focus on: ${partner.dealTypeFocus.join(', ')}
Your approval threshold (0-1): ${partner.approvalThreshold}

The harder you are to please, the more meaningful your approval.

## Player History with You
${previousMeetings > 0 ? `
Previous IC meetings with this player: ${previousMeetings}
Times they impressed you: ${timesImpressed}
Times they disappointed you: ${timesDisappointed}
${knownWeaknesses.length > 0 ? `Known weaknesses (things they failed on before): ${knownWeaknesses.join(', ')}` : 'No known pattern of weaknesses yet.'}
` : 'This is your first IC meeting with this player. Approach with appropriate skepticism.'}

## Player's Overall IC History
Total IC meetings attended: ${playerHistory.meetingsAttended}
Identified weaknesses across ICs: ${playerHistory.identifiedWeaknesses.join(', ') || 'None identified yet'}
Times impressed partners: ${playerHistory.impressedCount}

## Your Task (${currentPhase} phase)
${getPhaseInstructions(currentPhase, partner)}

## Critical Rules
1. STAY IN CHARACTER at all times - you are ${partner.name}, not an AI assistant
2. Never break the fourth wall or mention this is a game
3. Ask questions that test REAL PE concepts - this should be educational
4. Reference specific numbers from the deal when challenging assumptions
5. If player uses buzzwords without substance, call it out
6. Respect strong arguments even if you personally focus on other areas
7. Your questions should feel like a real IC meeting - challenging but fair
8. NEVER provide teaching moments explicitly - let them learn by defending their position
9. Keep responses in your speech style: ${partner.speechStyle}

## Response Format
- Keep responses concise (2-4 sentences for questions)
- Stay in your speech style
- When asking questions, be specific to THIS deal
- Never sound like a textbook - sound like a skeptical investor`;
};

/**
 * Get phase-specific instructions for the partner
 */
const getPhaseInstructions = (phase: ICPhase, partner: ICPartner): string => {
  switch (phase) {
    case 'OPENING':
      return `Listen to their opening pitch and identify 1-2 areas to probe based on your focus areas (${partner.dealTypeFocus.join(', ')}).
Your question should be specific, testing real PE knowledge.
Stay in character - use your speech style.
Ask ONE focused question that gets to the heart of your concerns.`;

    case 'INTERROGATION':
      return `Respond to their answer. Evaluate it carefully:
- If they addressed your concern adequately, acknowledge it briefly (you are not effusive)
- If they missed the point or gave a weak answer, probe deeper
- If they used buzzwords without substance, call it out specifically
- Ask follow-up questions that test real-world PE knowledge
- Never accept generic answers - push for specifics

Remember your critique style: ${partner.critiqueStyle}`;

    case 'VERDICT':
      return `Based on the entire conversation, provide your vote and brief reasoning.
Vote YES only if they demonstrated genuine understanding of the risks and value creation.
Vote CONDITIONAL if you see merit but need something specific addressed.
Vote NO if they showed concerning gaps in their understanding.

Be specific about what impressed or concerned you.
Reference specific moments from the conversation.

Format your response as:
VOTE: [YES/CONDITIONAL/NO]
REASONING: [2-3 sentences explaining your decision]
${partner.id === 'richard' ? '\nAs the Founding Partner, your vote carries extra weight. Consider the strategic implications beyond just the numbers.' : ''}`;

    default:
      return 'Engage naturally in character.';
  }
};

// ==================== QUESTION GENERATION ====================

/**
 * Generate an initial question for a partner based on the opening pitch
 */
export const generateInitialQuestionPrompt = (
  partner: ICPartner,
  deal: PortfolioCompany,
  openingPitch: string
): string => {
  return `The player just delivered their opening pitch for ${deal.name}:

"${openingPitch}"

Based on this pitch and your focus areas (${partner.dealTypeFocus.join(', ')}), ask ONE specific, probing question.

Your question should:
1. Be specific to what they said (or failed to say)
2. Test their understanding of a real PE concept
3. Match your personality: ${partner.speechStyle}
4. Reference specific numbers if relevant

${getPartnerSpecificGuidance(partner, deal)}

Remember: You are ${partner.nickname}. Stay in character.`;
};

/**
 * Generate a follow-up question based on player's response
 */
export const generateFollowUpPrompt = (
  partner: ICPartner,
  deal: PortfolioCompany,
  previousQuestion: string,
  playerResponse: string,
  questionNumber: number,
  totalQuestions: number
): string => {
  const isLastQuestion = questionNumber === totalQuestions;

  return `You previously asked: "${previousQuestion}"

The player responded: "${playerResponse}"

${isLastQuestion
    ? 'This is your FINAL question. Make it count - probe the area you are most concerned about.'
    : `This is question ${questionNumber} of ${totalQuestions}. You have ${totalQuestions - questionNumber} more questions.`}

Evaluate their response:
- Did they actually answer your question?
- Did they provide specifics or just buzzwords?
- Are there gaps in their logic?
- Did they reveal something concerning?

Then either:
1. Acknowledge a strong answer briefly and move to your next concern
2. Probe deeper if the answer was weak or evasive
3. Call out specifically if they used jargon without substance

Stay in character as ${partner.nickname}.
Match your critique style: ${partner.critiqueStyle}`;
};

// ==================== PARTNER-SPECIFIC GUIDANCE ====================

const getPartnerSpecificGuidance = (
  partner: ICPartner,
  deal: PortfolioCompany
): string => {
  const leverage = deal.debt / deal.ebitda;
  const entryMultiple = deal.leverageModelParams?.entryMultiple || (deal.currentValuation / deal.ebitda);

  switch (partner.id) {
    case 'margaret':
      return `As the Risk Hawk, focus on:
- Leverage is ${leverage.toFixed(1)}x - ${leverage > 4 ? 'THIS IS CONCERNING' : 'acceptable but probe the downside'}
- What happens if EBITDA drops 20%?
- Covenant structure and headroom
- Key person risk with ${deal.ceo}
- Customer concentration if relevant`;

    case 'david':
      return `As the Operator, focus on:
- CEO performance is ${deal.ceoPerformance}/100 - ${deal.ceoPerformance < 60 ? 'THIS IS A RED FLAG' : 'probe their assessment'}
- What is the actual value creation plan?
- Have they talked to customers?
- Where is the operational fat to cut?
- Who runs this business day-to-day?`;

    case 'victoria':
      return `As the Returns Maximalist, focus on:
- Entry multiple of ${entryMultiple.toFixed(1)}x - ${entryMultiple > 8 ? 'EXPENSIVE - demand justification' : 'probe the exit assumption'}
- Walk them through sources and uses
- IRR bridge - how much is real vs. multiple expansion?
- Who is the exit buyer?
- Competition for this asset`;

    case 'richard':
      return `As the Sage, focus on:
- Why this deal, why now, why us?
- What does this say about our firm?
- Long-term strategic fit
- What story do we tell in 10 years?
- What are they not telling you?`;

    default:
      return '';
  }
};

// ==================== VERDICT GENERATION ====================

/**
 * Generate the prompt for a partner's final verdict
 */
export const generateVerdictPrompt = (
  partner: ICPartner,
  deal: PortfolioCompany,
  conversationHistory: ICMessage[],
  openingPitch: string
): string => {
  // Extract player responses from conversation
  const playerResponses = conversationHistory
    .filter((m) => m.isPlayer)
    .map((m) => m.content);

  // Extract this partner's questions
  const partnerQuestions = conversationHistory
    .filter((m) => m.partnerId === partner.id)
    .map((m) => m.content);

  return `The IC meeting for ${deal.name} is concluding. Time to vote.

## Opening Pitch
"${openingPitch}"

## Your Questions and Their Responses
${partnerQuestions.map((q, i) => `
Q${i + 1}: "${q}"
A${i + 1}: "${playerResponses[i] || '[No response]'}"
`).join('\n')}

## Your Focus Areas
${partner.dealTypeFocus.join(', ')}

## Your Approval Threshold
${partner.approvalThreshold} (0 = easy to please, 1 = very hard)

## Voting Instructions
Based on the ENTIRE conversation, not just the opening pitch:

1. Did they demonstrate genuine understanding of the risks?
2. Did they have specific, credible value creation plans?
3. Did they answer your questions directly or evade?
4. Did they show conviction without being reckless?

Vote:
- YES: Approve the deal
- CONDITIONAL: Approve with specific conditions that must be met
- NO: Reject the deal

Format your response EXACTLY as:
VOTE: [YES/CONDITIONAL/NO]
REASONING: [2-3 sentences - be specific about what influenced your decision]
${partner.id === 'richard' ? 'STRATEGIC_NOTE: [1 sentence on long-term implications]' : ''}`;
};

// ==================== CONTEXT BUILDERS ====================

/**
 * Build the conversation context for the AI
 */
export const buildConversationContext = (
  messages: ICMessage[]
): { role: 'user' | 'model'; parts: { text: string }[] }[] => {
  return messages.map((msg) => ({
    role: msg.isPlayer ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));
};

/**
 * Format deal summary for prompts
 */
export const formatDealSummary = (deal: PortfolioCompany): string => {
  const leverage = deal.debt / deal.ebitda;
  const entryMultiple = deal.leverageModelParams?.entryMultiple || (deal.currentValuation / deal.ebitda);

  return `
Deal: ${deal.name}
Sector: ${deal.sector || 'General Industrial'}
Valuation: $${(deal.currentValuation / 1000000).toFixed(1)}M at ${entryMultiple.toFixed(1)}x EBITDA
Leverage: ${leverage.toFixed(1)}x
Revenue: $${(deal.revenue / 1000000).toFixed(1)}M (${(deal.revenueGrowth * 100).toFixed(1)}% growth)
EBITDA: $${(deal.ebitda / 1000000).toFixed(1)}M (${(deal.ebitdaMargin * 100).toFixed(1)}% margin)
CEO: ${deal.ceo} (Performance: ${deal.ceoPerformance}/100)
${deal.leverageModelParams ? `Target IRR: ${(deal.leverageModelParams.projectedIRR * 100).toFixed(1)}%` : ''}
`;
};

// ==================== OFFLINE FALLBACKS ====================

/**
 * Generate offline question when API is unavailable
 */
export const generateOfflineQuestion = (
  partner: ICPartner,
  deal: PortfolioCompany,
  questionNumber: number
): string => {
  const questions = partner.favoriteQuestions;
  const index = (questionNumber + deal.id) % questions.length;
  return questions[index];
};

/**
 * Generate offline verdict when API is unavailable
 */
export const generateOfflineVerdict = (
  partner: ICPartner,
  overallScore: number
): { vote: 'YES' | 'CONDITIONAL' | 'NO'; reasoning: string } => {
  const adjustedThreshold = partner.approvalThreshold;

  if (overallScore >= adjustedThreshold + 0.15) {
    return {
      vote: 'YES',
      reasoning: `The thesis is sound. The numbers work if they execute. Proceed.`,
    };
  } else if (overallScore >= adjustedThreshold - 0.1) {
    return {
      vote: 'CONDITIONAL',
      reasoning: `I see the opportunity, but I need more comfort on the downside. Address my concerns.`,
    };
  } else {
    return {
      vote: 'NO',
      reasoning: `The gaps in their understanding concern me. Not this time.`,
    };
  }
};
