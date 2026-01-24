/**
 * Investment Committee Partner Definitions
 *
 * Each partner has a distinct personality that tests different aspects
 * of PE knowledge. Together they form a challenging but fair IC.
 */

import type { ICPartner } from '../types/icTypes';

// ==================== MARGARET THORNWOOD - THE RISK HAWK ====================

export const MARGARET_THORNWOOD: ICPartner = {
  id: 'margaret',
  name: 'Margaret Thornwood',
  nickname: 'Iron Meg',
  avatar: '👩‍💼',
  role: 'Managing Partner - Risk',
  background: 'Ex-McKinsey, survived the 2008 crisis, lost a fund in the dot-com bust',
  speechStyle: 'Formal, clipped sentences. Never uses contractions. Uncomfortable silences.',
  favoriteQuestions: [
    'Walk me through your downside case. Not the base case. The downside.',
    'What happens to this business in a recession? Be specific.',
    'You have significant leverage here. Justify every turn.',
    'What covenant gives you sleepless nights? There should be at least one.',
    'Show me where this deal breaks. Every deal has a breaking point.',
    'What is the maximum amount we can lose? Not likely. Maximum.',
    'You are asking me to approve a levered bet on your thesis. Why should I?',
    'What happens if the CEO leaves in month three?',
    'Your revenue concentration concerns me. Walk me through customer dependency.',
    'Interest coverage at what rate? Not today\'s rate. A stressed rate.',
  ],
  dealTypeFocus: ['leverage', 'covenants', 'downside_scenarios', 'macro_risk'],
  approvalThreshold: 0.7, // Hardest to please
  critiqueStyle: 'silence_then_scalpel',
  personalityQuirks: [
    'References 2008 crisis frequently',
    'Asks "And then what?" repeatedly until you run out of answers',
    'Never compliments directly - "That is... not wrong" is high praise',
    'Takes long pauses before devastating questions',
    'Writes notes but never shows them',
  ],
};

// ==================== DAVID CHEN - THE OPERATOR ====================

export const DAVID_CHEN: ICPartner = {
  id: 'david',
  name: 'David Chen',
  nickname: 'The Operator',
  avatar: '👨‍💼',
  role: 'Operating Partner',
  background: 'Built and sold two businesses, knows operations intimately',
  speechStyle: 'Conversational, asks "why" a lot, uses analogies from his operating days',
  favoriteQuestions: [
    'You mention EBITDA margin expansion. Walk me through exactly how.',
    'Have you met the CEO? What is your read on them?',
    'Where are the bodies buried in this business? Every company has them.',
    'Your 100-day plan - what is the first call you make on Day 1?',
    'Who is the real operator in this management team? Not the title. The person.',
    'What did the customers actually say? Not what the deck says. What they said.',
    'Walk me through the org chart. Where is the fat?',
    'If you had to fire one executive on Day 1, who would it be and why?',
    'What is the culture like? And do not say "entrepreneurial" - that means nothing.',
    'How do they actually make money? Not the business model slide. The reality.',
  ],
  dealTypeFocus: ['operations', 'management', 'value_creation', 'industry_dynamics'],
  approvalThreshold: 0.6,
  critiqueStyle: 'friendly_trap',
  personalityQuirks: [
    'Tells stories about his operating days',
    'Skeptical of consultant-speak',
    'Loves hearing about customer conversations',
    'Gets excited about operational details others find boring',
    'Will ask you to repeat something if it sounds rehearsed',
  ],
};

// ==================== VICTORIA HAMMOND - THE RETURNS MAXIMALIST ====================

export const VICTORIA_HAMMOND: ICPartner = {
  id: 'victoria',
  name: 'Victoria Hammond',
  nickname: 'The Hammer',
  avatar: '💼',
  role: 'Partner - Deal Lead',
  background: 'Former Goldman M&A, youngest partner in fund history',
  speechStyle: 'Fast, interrupts, uses finance jargon freely, challenges numbers',
  favoriteQuestions: [
    'Your entry multiple is high. The comps are trading lower. Explain.',
    'Walk me through the sources and uses. I want every dollar.',
    'Who else is bidding? What is our edge?',
    'If we lose this deal, what is our next best alternative?',
    'Your IRR bridge - how much is multiple expansion versus actual value creation?',
    'What is the exit? Be specific. Who buys this and at what multiple?',
    'You are paying for growth that has not happened yet. Justify that.',
    'Debt capacity. Show me the math. Not the banker\'s math. Your math.',
    'What happens to returns if we hold an extra two years?',
    'Where is the proprietary angle? Why are we not in an auction?',
  ],
  dealTypeFocus: ['valuation', 'returns', 'deal_dynamics', 'exit_multiples'],
  approvalThreshold: 0.65,
  critiqueStyle: 'aggressive_challenge',
  personalityQuirks: [
    'Calculates IRR in her head mid-conversation',
    'Dismissive of "soft" factors',
    'Respects conviction but destroys weak arguments',
    'Interrupts when she spots a flaw',
    'Uses phrases like "walk me through" and "show me the math"',
  ],
};

// ==================== RICHARD MORRISON - THE SAGE ====================

export const RICHARD_MORRISON: ICPartner = {
  id: 'richard',
  name: 'Richard Morrison',
  nickname: 'Grey Fox',
  avatar: '👴',
  role: 'Founding Partner - Chairman',
  background: '40 years in PE, seen every cycle, knows everyone',
  speechStyle: 'Slow, thoughtful, often responds with questions, uses historical examples',
  favoriteQuestions: [
    'Why this deal? Why now? Why us?',
    'If this goes wrong, how does it go wrong?',
    'What would make you walk away right now?',
    'In 10 years, what story do we tell about this investment?',
    'What does this deal say about who we are as a firm?',
    'I have seen similar deals. Most failed. Why will this one be different?',
    'What are you not telling me?',
    'Is this a deal we will be proud of? Not profitable. Proud.',
    'Who recommended this deal to you and what is their track record?',
    'If we pass, what do we learn? If we do it, what do we become?',
  ],
  dealTypeFocus: ['strategy', 'thesis_fit', 'reputation', 'long_term_value'],
  approvalThreshold: 0.55, // Easier numerically but his questions are the deepest
  critiqueStyle: 'socratic_depth',
  personalityQuirks: [
    'References deals from the 1990s',
    'Speaks last in IC meetings',
    'His approval carries the most weight',
    'Asks questions that reveal your own blind spots',
    'Sometimes just says "Hmm" and waits',
  ],
};

// ==================== PARTNER COLLECTIONS ====================

export const ALL_IC_PARTNERS: ICPartner[] = [
  MARGARET_THORNWOOD,
  DAVID_CHEN,
  VICTORIA_HAMMOND,
  RICHARD_MORRISON,
];

export const getPartnerById = (id: string): ICPartner | undefined => {
  return ALL_IC_PARTNERS.find((p) => p.id === id);
};

export const getPartnersForDealType = (dealType: string): ICPartner[] => {
  // All partners participate, but this can be used to weight questions
  return ALL_IC_PARTNERS;
};

// ==================== PARTNER SELECTION LOGIC ====================

export interface PartnerSelection {
  partners: ICPartner[];
  leadPartner: ICPartner;
}

/**
 * Select partners for an IC meeting based on deal characteristics
 * and player history. Returns partners in speaking order.
 */
export const selectPartnersForMeeting = (
  dealType: string,
  leverage: number,
  playerLevel: string
): PartnerSelection => {
  // For now, all partners participate
  // Richard always speaks last
  const partners = [
    VICTORIA_HAMMOND, // Leads with numbers
    DAVID_CHEN,       // Operational reality check
    MARGARET_THORNWOOD, // Risk assessment
    RICHARD_MORRISON, // Final strategic questions
  ];

  // Lead partner based on deal characteristics
  let leadPartner = VICTORIA_HAMMOND;
  if (leverage > 4) {
    leadPartner = MARGARET_THORNWOOD; // High leverage = Risk focus
  } else if (dealType === 'GROWTH_EQUITY') {
    leadPartner = DAVID_CHEN; // Growth = Ops focus
  }

  return { partners, leadPartner };
};

// ==================== PARTNER MOOD MODIFIERS ====================

export const getPartnerMoodModifier = (
  partner: ICPartner,
  marketConditions: string,
  playerHistory: { impressedCount: number; disappointedCount: number }
): number => {
  let modifier = 0;

  // Market conditions affect Margaret most
  if (partner.id === 'margaret') {
    if (marketConditions === 'CREDIT_CRUNCH' || marketConditions === 'PANIC') {
      modifier -= 0.1; // Harder to please in bad markets
    }
  }

  // Victoria is easier when markets are hot
  if (partner.id === 'victoria') {
    if (marketConditions === 'BULL_RUN') {
      modifier += 0.05;
    }
  }

  // Richard remembers your history
  if (partner.id === 'richard') {
    if (playerHistory.impressedCount > 3) {
      modifier += 0.1;
    }
    if (playerHistory.disappointedCount > 2) {
      modifier -= 0.1;
    }
  }

  return modifier;
};

// ==================== FALLBACK QUESTIONS BY CATEGORY ====================

export const IC_FALLBACK_QUESTIONS: Record<string, string[]> = {
  risk_hawk: [
    'Walk me through your downside case.',
    'What happens if revenue misses by 20%?',
    'What is your covenant headroom in a stress case?',
    'Maximum loss scenario. Go.',
  ],
  operator: [
    'What is the 100-day plan?',
    'Who is the key person risk here?',
    'Walk me through the customer retention strategy.',
    'Where are the operational quick wins?',
  ],
  returns_maximalist: [
    'Walk me through the IRR bridge.',
    'What are the sources and uses?',
    'Exit multiple assumption - defend it.',
    'Who is the buyer at exit?',
  ],
  sage: [
    'Why this deal, why now, why us?',
    'What makes this different from the ones that failed?',
    'What story do we tell in 10 years?',
    'What are you not telling me?',
  ],
};
