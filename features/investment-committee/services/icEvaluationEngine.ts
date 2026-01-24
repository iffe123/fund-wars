/**
 * IC Evaluation Engine
 *
 * Evaluates player responses and generates verdicts.
 * Uses AI when available, falls back to heuristics offline.
 */

import type { PortfolioCompany } from '../../../types';
import type {
  ICPartner,
  PitchEvaluation,
  ICVerdict,
  ICPartnerVote,
  ICOutcome,
  DealOutcome,
  ICMessage,
} from '../types/icTypes';
import { ALL_IC_PARTNERS } from '../constants/icPartners';

// ==================== EVALUATION PROMPT ====================

/**
 * Generate the evaluation prompt for AI scoring
 */
export const generateEvaluationPrompt = (
  deal: PortfolioCompany,
  openingPitch: string,
  playerResponses: string[],
  conversationHistory: ICMessage[]
): string => {
  // Build Q&A pairs from conversation
  const qaPairs = conversationHistory
    .filter((m) => !m.isPlayer)
    .map((q, i) => {
      const response = conversationHistory.find(
        (m) => m.isPlayer && m.timestamp > q.timestamp
      );
      return {
        question: q.content,
        answer: response?.content || '[No response provided]',
      };
    });

  const dealMetrics = `
Deal: ${deal.name}
Revenue: $${(deal.revenue / 1000000).toFixed(1)}M
EBITDA: $${(deal.ebitda / 1000000).toFixed(1)}M
Entry Multiple: ${(deal.leverageModelParams?.entryMultiple || deal.currentValuation / deal.ebitda).toFixed(1)}x
Leverage: ${(deal.debt / deal.ebitda).toFixed(1)}x
Revenue Growth: ${(deal.revenueGrowth * 100).toFixed(1)}%
Target IRR: ${deal.leverageModelParams ? (deal.leverageModelParams.projectedIRR * 100).toFixed(1) + '%' : 'Not modeled'}
`;

  return `Evaluate this IC pitch for a private equity investment.

## Deal Being Pitched
${dealMetrics}

## Player's Opening Pitch
"${openingPitch}"

## Questions and Responses
${qaPairs.map((qa, i) => `
Question ${i + 1}: "${qa.question}"
Response ${i + 1}: "${qa.answer}"
`).join('\n')}

## Evaluation Criteria

Assess each dimension from 0.0 to 1.0:

1. THESIS_CLARITY: Is there a clear, coherent investment thesis?
   - 0.0: Rambling, unfocused, no clear 'why'
   - 0.5: Basic thesis present but generic
   - 1.0: Crystal clear, differentiated thesis that a partner could repeat

2. FINANCIAL_RIGOR: Do they understand the numbers?
   - Look for: IRR drivers, leverage paydown, multiple arbitrage awareness
   - Penalize: Ignoring the math, unrealistic assumptions, calculation errors

3. RISK_AWARENESS: Do they know what can go wrong?
   - Look for: Specific risks, mitigation strategies, honest acknowledgment
   - Penalize: Dismissing risks, missing obvious issues, overconfidence

4. VALUE_CREATION: Is there a credible path to making money?
   - Look for: Specific operational improvements, strategic initiatives
   - Penalize: Vague "synergies", pure multiple expansion hopes

5. CONVICTION: Do they believe in this deal?
   - Look for: Passion, preparedness to defend, pushing back appropriately
   - Penalize: Capitulating immediately, uncertainty in core thesis

6. SPECIFICITY: Do they use real details or generic language?
   - Look for: Specific numbers, customer names, operational details
   - Penalize: MBA buzzwords, generic frameworks, consultant-speak

## Response Format (JSON only, no other text)
{
  "thesis_clarity": 0.X,
  "financial_rigor": 0.X,
  "risk_awareness": 0.X,
  "value_creation": 0.X,
  "conviction": 0.X,
  "specificity": 0.X,
  "red_flags": ["specific concern 1", "specific concern 2"],
  "strong_points": ["what they did well 1", "what they did well 2"],
  "overall_score": 0.X
}`;
};

// ==================== PARSE EVALUATION RESPONSE ====================

/**
 * Parse the AI evaluation response into a PitchEvaluation
 */
export const parseEvaluationResponse = (response: string): PitchEvaluation | null => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      dimensions: {
        thesisClarity: clamp(parsed.thesis_clarity || 0.5, 0, 1),
        financialRigor: clamp(parsed.financial_rigor || 0.5, 0, 1),
        riskAwareness: clamp(parsed.risk_awareness || 0.5, 0, 1),
        valueCreation: clamp(parsed.value_creation || 0.5, 0, 1),
        conviction: clamp(parsed.conviction || 0.5, 0, 1),
        specificity: clamp(parsed.specificity || 0.5, 0, 1),
      },
      redFlags: parsed.red_flags || [],
      strongPoints: parsed.strong_points || [],
      overallScore: clamp(parsed.overall_score || 0.5, 0, 1),
    };
  } catch (e) {
    console.error('Failed to parse evaluation response:', e);
    return null;
  }
};

// ==================== OFFLINE EVALUATION ====================

/**
 * Generate an offline evaluation based on heuristics
 */
export const generateOfflineEvaluation = (
  openingPitch: string,
  playerResponses: string[]
): PitchEvaluation => {
  const allText = [openingPitch, ...playerResponses].join(' ').toLowerCase();
  const wordCount = allText.split(/\s+/).length;

  // Heuristic scoring based on content analysis
  const scores = {
    thesisClarity: 0.5,
    financialRigor: 0.5,
    riskAwareness: 0.5,
    valueCreation: 0.5,
    conviction: 0.5,
    specificity: 0.5,
  };

  // Check for key concepts
  const financialTerms = ['irr', 'moic', 'ebitda', 'leverage', 'multiple', 'margin', 'covenant'];
  const riskTerms = ['risk', 'downside', 'stress', 'scenario', 'concern', 'mitigation'];
  const valueTerms = ['value creation', 'operational', 'margin expansion', 'growth', 'synergy', 'improvement'];
  const specificTerms = ['%', '$', 'million', 'specific', 'plan', 'day', 'week', 'month'];
  const buzzwords = ['synergy', 'leverage', 'optimize', 'strategic', 'world-class', 'best-in-class'];

  // Score based on presence of key terms
  const hasFinancialTerms = financialTerms.filter((t) => allText.includes(t)).length;
  scores.financialRigor = Math.min(0.3 + hasFinancialTerms * 0.1, 0.9);

  const hasRiskTerms = riskTerms.filter((t) => allText.includes(t)).length;
  scores.riskAwareness = Math.min(0.3 + hasRiskTerms * 0.12, 0.9);

  const hasValueTerms = valueTerms.filter((t) => allText.includes(t)).length;
  scores.valueCreation = Math.min(0.3 + hasValueTerms * 0.12, 0.9);

  const hasSpecificTerms = specificTerms.filter((t) => allText.includes(t)).length;
  scores.specificity = Math.min(0.3 + hasSpecificTerms * 0.1, 0.9);

  // Penalize excessive buzzwords without substance
  const buzzwordCount = buzzwords.filter((t) => allText.includes(t)).length;
  if (buzzwordCount > 3 && wordCount < 200) {
    scores.specificity = Math.max(scores.specificity - 0.2, 0.2);
  }

  // Thesis clarity based on structure
  if (allText.includes('thesis') || allText.includes('believe') || allText.includes('opportunity')) {
    scores.thesisClarity = 0.6;
  }
  if (allText.includes('because') && allText.includes('will')) {
    scores.thesisClarity = Math.min(scores.thesisClarity + 0.15, 0.85);
  }

  // Conviction based on response length and confidence words
  const avgResponseLength = playerResponses.length > 0
    ? playerResponses.reduce((sum, r) => sum + r.length, 0) / playerResponses.length
    : 0;
  scores.conviction = clamp(0.3 + avgResponseLength / 1000, 0.3, 0.85);

  // Calculate overall
  const overall =
    scores.thesisClarity * 0.15 +
    scores.financialRigor * 0.2 +
    scores.riskAwareness * 0.2 +
    scores.valueCreation * 0.2 +
    scores.conviction * 0.1 +
    scores.specificity * 0.15;

  // Generate red flags and strong points
  const redFlags: string[] = [];
  const strongPoints: string[] = [];

  if (scores.riskAwareness < 0.5) redFlags.push('Insufficient risk analysis');
  if (scores.financialRigor < 0.5) redFlags.push('Weak financial understanding');
  if (scores.specificity < 0.5) redFlags.push('Too much generic language');
  if (scores.valueCreation < 0.5) redFlags.push('Unclear value creation path');

  if (scores.thesisClarity > 0.7) strongPoints.push('Clear investment thesis');
  if (scores.financialRigor > 0.7) strongPoints.push('Strong grasp of financials');
  if (scores.conviction > 0.7) strongPoints.push('Demonstrated conviction');
  if (scores.specificity > 0.7) strongPoints.push('Good use of specific details');

  return {
    dimensions: scores,
    redFlags,
    strongPoints,
    overallScore: clamp(overall, 0, 1),
  };
};

// ==================== VERDICT GENERATION ====================

/**
 * Parse a partner's vote from their response
 */
export const parsePartnerVote = (
  response: string,
  partner: ICPartner
): ICPartnerVote => {
  const upperResponse = response.toUpperCase();

  // Extract vote
  let vote: 'YES' | 'CONDITIONAL' | 'NO' = 'CONDITIONAL';
  if (upperResponse.includes('VOTE: YES') || upperResponse.includes('VOTE:YES')) {
    vote = 'YES';
  } else if (upperResponse.includes('VOTE: NO') || upperResponse.includes('VOTE:NO')) {
    vote = 'NO';
  } else if (upperResponse.includes('VOTE: CONDITIONAL') || upperResponse.includes('VOTE:CONDITIONAL')) {
    vote = 'CONDITIONAL';
  }

  // Extract reasoning
  const reasoningMatch = response.match(/REASONING:\s*(.+?)(?:\n|$)/i);
  const reasoning = reasoningMatch?.[1]?.trim() || 'Decision based on overall presentation.';

  // Calculate respect change based on vote and threshold
  let respectChange = 0;
  if (vote === 'YES') {
    respectChange = Math.floor(Math.random() * 5) + 3; // +3 to +8
  } else if (vote === 'NO') {
    respectChange = -Math.floor(Math.random() * 3) - 2; // -2 to -5
  } else {
    respectChange = Math.floor(Math.random() * 3); // 0 to +2
  }

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    vote,
    reasoning,
    respectChange,
  };
};

/**
 * Generate the final verdict from all partner votes
 */
export const generateVerdict = (
  partnerVotes: ICPartnerVote[],
  evaluation: PitchEvaluation,
  deal: PortfolioCompany
): ICVerdict => {
  const yesVotes = partnerVotes.filter((v) => v.vote === 'YES').length;
  const noVotes = partnerVotes.filter((v) => v.vote === 'NO').length;
  const conditionalVotes = partnerVotes.filter((v) => v.vote === 'CONDITIONAL').length;

  // Richard's vote carries extra weight
  const richardVote = partnerVotes.find((v) => v.partnerId === 'richard');
  const richardApproves = richardVote?.vote === 'YES' || richardVote?.vote === 'CONDITIONAL';

  // Determine outcome
  let outcome: ICOutcome;
  if (yesVotes >= 3 || (yesVotes >= 2 && richardApproves)) {
    outcome = 'APPROVED';
  } else if (noVotes >= 3 || (noVotes >= 2 && !richardApproves)) {
    outcome = 'REJECTED';
  } else if (conditionalVotes >= 2 || (conditionalVotes >= 1 && yesVotes >= 1)) {
    outcome = 'CONDITIONALLY_APPROVED';
  } else {
    outcome = 'TABLED';
  }

  // Generate conditions if conditionally approved
  const conditions: string[] = [];
  if (outcome === 'CONDITIONALLY_APPROVED' || outcome === 'TABLED') {
    // Generate conditions based on partner concerns
    const margaretVote = partnerVotes.find((v) => v.partnerId === 'margaret');
    const davidVote = partnerVotes.find((v) => v.partnerId === 'david');
    const victoriaVote = partnerVotes.find((v) => v.partnerId === 'victoria');

    if (margaretVote?.vote !== 'YES') {
      const leverage = deal.debt / deal.ebitda;
      if (leverage > 4) {
        conditions.push(`Reduce leverage to 4.0x or below`);
      } else {
        conditions.push(`Add covenant protection package`);
      }
    }
    if (davidVote?.vote !== 'YES') {
      conditions.push(`Detailed 100-day operational plan required`);
    }
    if (victoriaVote?.vote !== 'YES') {
      conditions.push(`Conduct additional buyer outreach for exit validation`);
    }
  }

  // Determine deal outcome
  let dealOutcome: DealOutcome;
  if (outcome === 'APPROVED') {
    dealOutcome = 'PROCEED';
  } else if (outcome === 'CONDITIONALLY_APPROVED') {
    dealOutcome = 'RENEGOTIATE';
  } else {
    dealOutcome = 'WALK_AWAY';
  }

  // Calculate consequences
  const reputationChange = calculateReputationChange(outcome, evaluation.overallScore);
  const skillPointsEarned = calculateSkillPoints(evaluation);

  return {
    outcome,
    partnerVotes,
    conditions: conditions.length > 0 ? conditions : undefined,
    feedback: {
      strengths: evaluation.strongPoints,
      weaknesses: evaluation.redFlags,
      specificAdvice: generateSpecificAdvice(outcome, evaluation),
    },
    consequences: {
      dealOutcome,
      reputationChange,
      skillPointsEarned,
    },
  };
};

// ==================== HELPER FUNCTIONS ====================

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const calculateReputationChange = (outcome: ICOutcome, score: number): number => {
  switch (outcome) {
    case 'APPROVED':
      return Math.floor(score * 5) + 2; // +2 to +7
    case 'CONDITIONALLY_APPROVED':
      return Math.floor(score * 3); // +0 to +3
    case 'TABLED':
      return -1; // Small penalty
    case 'REJECTED':
      return -Math.floor((1 - score) * 5) - 1; // -1 to -6
  }
};

const calculateSkillPoints = (
  evaluation: PitchEvaluation
): Record<string, number> => {
  return {
    valuation: Math.floor(evaluation.dimensions.financialRigor * 15),
    negotiation: Math.floor(evaluation.dimensions.conviction * 10),
    riskManagement: Math.floor(evaluation.dimensions.riskAwareness * 10),
    dealExecution: Math.floor(evaluation.overallScore * 10),
  };
};

const generateSpecificAdvice = (outcome: ICOutcome, evaluation: PitchEvaluation): string => {
  const weakest = Object.entries(evaluation.dimensions)
    .sort(([, a], [, b]) => a - b)[0];

  const adviceMap: Record<string, string> = {
    thesisClarity: 'Work on articulating your thesis more crisply. Partners should be able to repeat it back to you.',
    financialRigor: 'Spend more time with the model. Know your IRR drivers cold.',
    riskAwareness: 'Every deal has risks. Acknowledge them specifically instead of hoping no one asks.',
    valueCreation: 'Be more specific about HOW you create value, not just that you will.',
    conviction: 'If you do not believe in the deal, why should we? Show more conviction.',
    specificity: 'Replace buzzwords with specific numbers, names, and plans.',
  };

  return adviceMap[weakest[0]] || 'Focus on preparation and specificity in your next presentation.';
};

// ==================== OFFLINE VERDICT GENERATION ====================

/**
 * Generate a complete verdict offline using heuristics
 */
export const generateOfflineVerdict = (
  evaluation: PitchEvaluation,
  deal: PortfolioCompany
): ICVerdict => {
  const partners = ALL_IC_PARTNERS;
  const partnerVotes: ICPartnerVote[] = partners.map((partner) => {
    const adjustedScore = evaluation.overallScore + (Math.random() * 0.2 - 0.1);
    const passes = adjustedScore >= partner.approvalThreshold;
    const nearThreshold = Math.abs(adjustedScore - partner.approvalThreshold) < 0.1;

    let vote: 'YES' | 'CONDITIONAL' | 'NO';
    let reasoning: string;

    if (passes && !nearThreshold) {
      vote = 'YES';
      reasoning = generateApprovalReasoning(partner, evaluation);
    } else if (passes || nearThreshold) {
      vote = 'CONDITIONAL';
      reasoning = generateConditionalReasoning(partner, evaluation);
    } else {
      vote = 'NO';
      reasoning = generateRejectionReasoning(partner, evaluation);
    }

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      vote,
      reasoning,
      respectChange: vote === 'YES' ? 3 : vote === 'NO' ? -3 : 0,
    };
  });

  return generateVerdict(partnerVotes, evaluation, deal);
};

const generateApprovalReasoning = (partner: ICPartner, evaluation: PitchEvaluation): string => {
  const reasons: Record<string, string[]> = {
    margaret: [
      'The risk profile is acceptable. The downside case was adequately addressed.',
      'Covenant structure provides sufficient protection. Proceed.',
      'I have concerns, but they are manageable. The thesis is sound.',
    ],
    david: [
      'The operational plan is credible. I believe in the value creation story.',
      'Strong understanding of the business. The 100-day plan makes sense.',
      'They know where the bodies are buried. That matters.',
    ],
    victoria: [
      'The numbers work if they execute. IRR assumptions are reasonable.',
      'Returns profile is attractive. Entry multiple is justified.',
      'Sources and uses are clean. I can defend this to LPs.',
    ],
    richard: [
      'The thesis is sound. This fits who we are as a firm.',
      'I have seen similar deals work. Proceed carefully but proceed.',
      'In ten years, this could be a story worth telling.',
    ],
  };

  const partnerReasons = reasons[partner.id] || reasons.richard;
  return partnerReasons[Math.floor(Math.random() * partnerReasons.length)];
};

const generateConditionalReasoning = (partner: ICPartner, evaluation: PitchEvaluation): string => {
  const reasons: Record<string, string[]> = {
    margaret: [
      'I need more comfort on the downside. Address the leverage concern.',
      'The risk case needs work. Come back with covenant amendments.',
      'Not opposed, but I need to see stress scenarios modeled properly.',
    ],
    david: [
      'The ops plan is thin. I want to see the detailed 100-day plan.',
      'Have you actually talked to customers? I need validation.',
      'Management assessment was weak. Dig deeper on the CEO.',
    ],
    victoria: [
      'Exit assumptions need work. Who specifically buys this?',
      'IRR bridge depends too much on multiple expansion. Show me real value creation.',
      'Entry multiple is rich. Negotiate harder or show me why it is worth it.',
    ],
    richard: [
      'I see the opportunity, but I am not convinced on timing.',
      'This could work, but I want to understand what we are not seeing.',
      'Proceed with conditions. This needs more thought.',
    ],
  };

  const partnerReasons = reasons[partner.id] || reasons.richard;
  return partnerReasons[Math.floor(Math.random() * partnerReasons.length)];
};

const generateRejectionReasoning = (partner: ICPartner, evaluation: PitchEvaluation): string => {
  const reasons: Record<string, string[]> = {
    margaret: [
      'The downside case was not adequately addressed. This is a pass.',
      'Leverage is too high and I did not hear a credible mitigation plan.',
      'Too many unanswered questions on risk. Not this time.',
    ],
    david: [
      'I do not believe in the value creation story. Pass.',
      'Management assessment was concerning. The CEO is a risk.',
      'Operational assumptions are unrealistic. Come back with better homework.',
    ],
    victoria: [
      'The numbers do not work. IRR assumptions are aggressive.',
      'Entry multiple is not justified. We are paying for hope.',
      'Cannot see a clear path to exit. Pass.',
    ],
    richard: [
      'This is not who we are as a firm. Pass.',
      'I have seen this movie before. It does not end well.',
      'The thesis is unclear. If you cannot articulate it, neither can we.',
    ],
  };

  const partnerReasons = reasons[partner.id] || reasons.richard;
  return partnerReasons[Math.floor(Math.random() * partnerReasons.length)];
};
