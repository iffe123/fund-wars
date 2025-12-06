import type { CompanyActiveEvent, CompanyEventType, PortfolioCompany, EventOption } from '../types';

/**
 * Company Events Library
 *
 * Defines event templates for portfolio company events that can trigger
 * during the game. Each event type has a generator function that creates
 * a full event based on the company's current state.
 */

// Event generator type
type EventGenerator = (company: PortfolioCompany) => CompanyActiveEvent;

// Main event library
export const COMPANY_EVENTS: Record<CompanyEventType, EventGenerator> = {
  REVENUE_DROP: (company) => ({
    id: `rev_drop_${company.id}_${Date.now()}`,
    type: 'REVENUE_DROP',
    title: 'Revenue Miss',
    description: `${company.name} just reported Q results: Revenue came in 15% below forecast. The sales team is pointing fingers at product. Product blames marketing. The CEO wants an emergency board call.`,
    severity: 'WARNING',
    consultWithMachiavelli: true,
    expiresWeek: 2,
    options: [
      {
        id: 'fire_sales',
        label: 'Fire the Sales VP',
        description: 'Make an example. Send a message.',
        outcomeText: 'The Sales VP is out. The team is terrified. Revenue stabilizes but morale tanks.',
        statChanges: { stress: 10 },
        companyChanges: {
          revenueGrowth: 0.02,
          ceoPerformance: company.ceoPerformance - 10,
        },
      },
      {
        id: 'pivot_strategy',
        label: 'Pivot Go-to-Market Strategy',
        description: 'Invest $2M in new sales infrastructure and marketing.',
        outcomeText: 'Bold move. Results will take 6 months to show.',
        statChanges: { cash: -2000000, reputation: 5 },
        companyChanges: {
          cashBalance: company.cashBalance - 2000000,
          revenueGrowth: 0.08,
        },
        risk: 30,
      },
      {
        id: 'wait_and_see',
        label: 'Give them another quarter',
        description: 'Maybe it was a one-time blip.',
        outcomeText: 'You chose patience. The board is watching closely.',
        statChanges: {},
        companyChanges: {},
        risk: 60,
      },
    ],
  }),

  KEY_CUSTOMER_LOSS: (company) => ({
    id: `customer_loss_${company.id}_${Date.now()}`,
    type: 'KEY_CUSTOMER_LOSS',
    title: 'Major Customer Churning',
    description: `${company.name}'s largest customer (18% of revenue) just announced they're not renewing. Competitor swooped in with a lower price. The market will notice.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 1,
    options: [
      {
        id: 'match_price',
        label: "Match the competitor's price",
        description: 'Kill your margins but save the customer.',
        outcomeText: 'Customer stays. Your EBITDA takes a 20% hit.',
        statChanges: {},
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin - 0.05,
          ebitda: Math.round(company.ebitda * 0.8),
        },
      },
      {
        id: 'let_them_go',
        label: 'Let them walk',
        description: 'No customer is worth destroying your unit economics.',
        outcomeText: 'Revenue drops 18%. But your pricing integrity is intact.',
        statChanges: { reputation: -5 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.82),
          revenueGrowth: -0.15,
        },
      },
      {
        id: 'executive_intervention',
        label: 'Fly out personally',
        description: 'Drop everything, get on a plane, save the relationship.',
        outcomeText: 'The CEO of the customer respects the hustle. Partial renewal secured.',
        statChanges: { energy: -30, stress: 15, reputation: 10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.92),
        },
      },
    ],
  }),

  MANAGEMENT_DEPARTURE: (company) => ({
    id: `mgmt_dep_${company.id}_${Date.now()}`,
    type: 'MANAGEMENT_DEPARTURE',
    title: 'CFO Resignation',
    description: `${company.name}'s CFO just handed in their notice. They're going to a competitor. They know everything about your IP roadmap. This is bad.`,
    severity: 'WARNING',
    expiresWeek: 2,
    options: [
      {
        id: 'counteroffer',
        label: 'Massive counteroffer',
        description: 'Double their comp. Throw in more equity.',
        outcomeText: 'They stay, but everyone knows they were about to leave.',
        statChanges: { cash: -500000 },
        companyChanges: {},
      },
      {
        id: 'let_go_gracefully',
        label: 'Wish them well',
        description: 'Hire a search firm, move on.',
        outcomeText: 'Professional transition. Market respects how you handled it.',
        statChanges: { reputation: 5 },
        companyChanges: {
          ceoPerformance: company.ceoPerformance - 5,
        },
      },
      {
        id: 'enforce_noncompete',
        label: 'Threaten legal action',
        description: 'Enforce the non-compete. Make them suffer.',
        outcomeText: 'Lawyers are expensive. Bad press. But the competitor backs off.',
        statChanges: { cash: -200000, reputation: -10, ethics: -10 },
        companyChanges: {},
      },
    ],
  }),

  COMPETITOR_THREAT: (company) => ({
    id: `competitor_${company.id}_${Date.now()}`,
    type: 'COMPETITOR_THREAT',
    title: 'New Competitor Emerges',
    description: `A well-funded startup just launched a product that directly competes with ${company.name}'s core offering. They're pricing 40% below market and have a slick marketing campaign. The sales team is panicking.`,
    severity: 'WARNING',
    expiresWeek: 3,
    options: [
      {
        id: 'innovate',
        label: 'Accelerate R&D',
        description: 'Double down on product innovation. Outcompete them.',
        outcomeText: 'R&D budget increased. New features in the pipeline.',
        statChanges: { cash: -1000000 },
        companyChanges: {
          cashBalance: company.cashBalance - 1000000,
          revenueGrowth: company.revenueGrowth + 0.05,
        },
      },
      {
        id: 'acquire',
        label: 'Acquire the competitor',
        description: 'If you can\'t beat them, buy them.',
        outcomeText: 'Acquisition talks begin. This will be expensive.',
        statChanges: { stress: 15 },
        companyChanges: {},
        risk: 40,
      },
      {
        id: 'differentiate',
        label: 'Focus on enterprise',
        description: 'Move upmarket. Let them have the low end.',
        outcomeText: 'Sales team pivots to enterprise. Longer sales cycles, higher margins.',
        statChanges: {},
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin + 0.03,
          customerChurn: company.customerChurn + 0.02,
        },
      },
    ],
  }),

  ACQUISITION_OPPORTUNITY: (company) => ({
    id: `acquisition_${company.id}_${Date.now()}`,
    type: 'ACQUISITION_OPPORTUNITY',
    title: 'Bolt-On Opportunity',
    description: `A strategic add-on acquisition has come to market. Synergies with ${company.name} are obvious. The target is asking $15M, but there's room to negotiate.`,
    severity: 'INFO',
    expiresWeek: 4,
    options: [
      {
        id: 'acquire_full',
        label: 'Move aggressively',
        description: 'Pay full price to lock it down quickly.',
        outcomeText: 'Deal closes in 30 days. Integration begins immediately.',
        statChanges: { cash: -15000000, reputation: 5 },
        companyChanges: {
          revenue: company.revenue + 5000000,
          employeeCount: company.employeeCount + 50,
        },
      },
      {
        id: 'negotiate_hard',
        label: 'Negotiate aggressively',
        description: 'Try to get them for $10M.',
        outcomeText: 'Negotiations drag on. They might walk.',
        statChanges: { stress: 10 },
        companyChanges: {},
        risk: 50,
      },
      {
        id: 'pass',
        label: 'Pass on this one',
        description: 'Preserve capital for better opportunities.',
        outcomeText: 'You stay disciplined. A competitor picks it up.',
        statChanges: {},
        companyChanges: {},
      },
    ],
  }),

  REGULATORY_ISSUE: (company) => ({
    id: `regulatory_${company.id}_${Date.now()}`,
    type: 'REGULATORY_ISSUE',
    title: 'Regulatory Investigation',
    description: `${company.name} has received a subpoena from regulators. They're looking into sales practices from two years ago—before your investment. But you own it now.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 2,
    options: [
      {
        id: 'full_cooperation',
        label: 'Full cooperation',
        description: 'Open the books. Hire the best white-collar lawyers.',
        outcomeText: 'Legal fees mount. But regulators appreciate the transparency.',
        statChanges: { cash: -1500000, ethics: 10, auditRisk: -10 },
        companyChanges: {},
      },
      {
        id: 'fight_it',
        label: 'Fight the investigation',
        description: 'Challenge the scope. Delay and obstruct legally.',
        outcomeText: 'Years of litigation ahead. The outcome is uncertain.',
        statChanges: { cash: -500000, ethics: -15, auditRisk: 20, stress: 20 },
        companyChanges: {},
        risk: 60,
      },
      {
        id: 'settle_quickly',
        label: 'Seek quick settlement',
        description: 'Pay a fine, admit no wrongdoing, move on.',
        outcomeText: 'Settlement reached. The market views this neutrally.',
        statChanges: { cash: -3000000, reputation: -5 },
        companyChanges: {},
      },
    ],
  }),

  UNION_DISPUTE: (company) => ({
    id: `union_${company.id}_${Date.now()}`,
    type: 'UNION_DISPUTE',
    title: 'Labor Dispute Escalates',
    description: `Workers at ${company.name}'s main facility are threatening to strike. They want a 15% raise and better benefits. Operations will grind to a halt if this isn't resolved.`,
    severity: 'WARNING',
    expiresWeek: 2,
    options: [
      {
        id: 'negotiate_fairly',
        label: 'Negotiate in good faith',
        description: 'Offer 8% and improved benefits. Find middle ground.',
        outcomeText: 'After tense negotiations, a deal is reached. Workers are satisfied.',
        statChanges: { ethics: 10, reputation: 5 },
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin - 0.02,
        },
      },
      {
        id: 'hardline',
        label: 'Take a hard line',
        description: 'Offer 3% max. Prepare contingency plans.',
        outcomeText: 'Workers strike. Production halts for two weeks.',
        statChanges: { ethics: -10, reputation: -10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.95),
        },
        risk: 70,
      },
      {
        id: 'offshore',
        label: 'Accelerate offshoring',
        description: 'Move production overseas. Reduce union leverage.',
        outcomeText: 'Transition begins. Short-term pain, long-term savings.',
        statChanges: { ethics: -20, reputation: -15, cash: -2000000 },
        companyChanges: {
          employeeCount: Math.floor(company.employeeCount * 0.7),
          ebitdaMargin: company.ebitdaMargin + 0.05,
        },
      },
    ],
  }),

  SUPPLY_CHAIN_CRISIS: (company) => ({
    id: `supply_${company.id}_${Date.now()}`,
    type: 'SUPPLY_CHAIN_CRISIS',
    title: 'Supply Chain Disruption',
    description: `${company.name}'s primary supplier just had a factory fire. Lead times are now 16 weeks instead of 4. Q4 production is at risk.`,
    severity: 'CRITICAL',
    expiresWeek: 1,
    options: [
      {
        id: 'emergency_sourcing',
        label: 'Emergency alternative sourcing',
        description: 'Pay 40% premium to source from competitors\' suppliers.',
        outcomeText: 'Production continues at higher cost. Margins take a hit.',
        statChanges: { stress: 15 },
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin - 0.08,
        },
      },
      {
        id: 'vertical_integration',
        label: 'Acquire a supplier',
        description: 'Buy a smaller supplier to secure the supply chain.',
        outcomeText: 'Vertical integration. Never again dependent on one supplier.',
        statChanges: { cash: -8000000, reputation: 5 },
        companyChanges: {
          cashBalance: company.cashBalance - 8000000,
        },
      },
      {
        id: 'delay_production',
        label: 'Delay Q4 production',
        description: 'Wait for normal supply. Disappoint customers.',
        outcomeText: 'Revenue pushed to next year. Some customers defect.',
        statChanges: { reputation: -10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.85),
          customerChurn: company.customerChurn + 0.05,
        },
      },
    ],
  }),

  ACTIVIST_INVESTOR: (company) => ({
    id: `activist_${company.id}_${Date.now()}`,
    type: 'ACTIVIST_INVESTOR',
    title: 'Activist Approaches Board',
    description: `An activist fund has acquired 5% of ${company.name} and is demanding board seats. They want you to sell the company immediately or do a massive dividend recap.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 3,
    options: [
      {
        id: 'fight',
        label: 'Prepare for proxy war',
        description: 'Hire advisors, rally shareholders, go to war.',
        outcomeText: 'The battle begins. Your attention is consumed for months.',
        statChanges: { stress: 25, energy: -20, cash: -1000000 },
        companyChanges: { hasBoardCrisis: true },
      },
      {
        id: 'negotiate',
        label: 'Give them a board seat',
        description: 'Appease them with representation.',
        outcomeText: "They're in. Now every decision requires their approval.",
        statChanges: { reputation: -5 },
        companyChanges: { boardAlignment: company.boardAlignment - 30 },
      },
      {
        id: 'accelerate_exit',
        label: 'Start exit process immediately',
        description: 'They want a sale? Fine. On YOUR terms.',
        outcomeText: 'You take control of the narrative. Exit process begins.',
        statChanges: { reputation: 10 },
        companyChanges: { isInExitProcess: true, exitType: 'STRATEGIC_SALE' },
      },
    ],
  }),

  IPO_WINDOW: (company) => ({
    id: `ipo_${company.id}_${Date.now()}`,
    type: 'IPO_WINDOW',
    title: 'IPO Window Opens',
    description: `Market conditions are favorable. Bankers are calling about taking ${company.name} public. At current multiples, you could see a 4x return. But IPO prep takes resources.`,
    severity: 'INFO',
    expiresWeek: 4,
    options: [
      {
        id: 'begin_ipo',
        label: 'Begin IPO process',
        description: 'Hire bankers, start the roadshow preparation.',
        outcomeText: 'IPO preparation begins. S-1 filing in 6 months.',
        statChanges: { stress: 20, cash: -500000 },
        companyChanges: { isInExitProcess: true, exitType: 'IPO' },
      },
      {
        id: 'dual_track',
        label: 'Run dual track',
        description: 'Prepare IPO while entertaining M&A offers.',
        outcomeText: 'Maximum optionality. Maximum stress.',
        statChanges: { stress: 30, cash: -750000 },
        companyChanges: {},
      },
      {
        id: 'not_ready',
        label: "We're not ready",
        description: 'Continue building. Wait for even better conditions.',
        outcomeText: 'The window may close. But you stay focused on fundamentals.',
        statChanges: {},
        companyChanges: {},
      },
    ],
  }),

  STRATEGIC_BUYER_INTEREST: (company) => ({
    id: `strategic_${company.id}_${Date.now()}`,
    type: 'STRATEGIC_BUYER_INTEREST',
    title: 'Strategic Interest',
    description: `A Fortune 500 company has reached out about acquiring ${company.name}. They're offering a 30% premium to current valuation. This could be the exit you've been waiting for.`,
    severity: 'INFO',
    consultWithMachiavelli: true,
    expiresWeek: 3,
    options: [
      {
        id: 'engage_seriously',
        label: 'Engage seriously',
        description: 'Open the data room. Start due diligence.',
        outcomeText: 'Negotiations begin. This could be transformational.',
        statChanges: { stress: 15 },
        companyChanges: { isInExitProcess: true, exitType: 'STRATEGIC_SALE' },
      },
      {
        id: 'play_hard_to_get',
        label: 'Play hard to get',
        description: 'Show interest but push for higher price.',
        outcomeText: 'They increase the offer. Or they walk.',
        statChanges: {},
        companyChanges: {},
        risk: 40,
      },
      {
        id: 'politely_decline',
        label: 'Politely decline',
        description: 'Not interested at any price right now.',
        outcomeText: 'They move on. Hopefully the offer comes back later.',
        statChanges: { reputation: 5 },
        companyChanges: {},
      },
    ],
  }),
};

/**
 * Generate a full event for a company based on event type
 */
export const generateCompanyEvent = (
  company: PortfolioCompany,
  eventType: CompanyEventType
): CompanyActiveEvent => {
  const generator = COMPANY_EVENTS[eventType];
  return generator(company);
};

/**
 * Determine if an event should trigger based on company state
 * Returns the event type to trigger, or null if no event should occur
 */
export const shouldTriggerEvent = (
  company: PortfolioCompany,
  currentWeek: number
): CompanyEventType | null => {
  // Don't trigger if company already has active event
  if (company.activeEvent) return null;

  // Base probability per week
  const baseProbability = 0.08; // 8% chance per company per week

  // Adjust based on company health
  let probability = baseProbability;
  if (company.revenueGrowth < -0.1) probability += 0.10; // Struggling = more events
  if (company.ceoPerformance < 40) probability += 0.05;
  if (company.boardAlignment < 50) probability += 0.05;

  if (Math.random() > probability) return null;

  // Select event type based on company state
  const possibleEvents: CompanyEventType[] = [];

  if (company.revenueGrowth < 0) possibleEvents.push('REVENUE_DROP');
  if (Math.random() > 0.7) possibleEvents.push('KEY_CUSTOMER_LOSS');
  if (company.ceoPerformance < 50) possibleEvents.push('MANAGEMENT_DEPARTURE');
  if (company.currentValuation > 100000000) {
    possibleEvents.push('ACTIVIST_INVESTOR');
    possibleEvents.push('STRATEGIC_BUYER_INTEREST');
  }
  if (company.revenueGrowth > 0.2 && company.currentValuation > 50000000) {
    possibleEvents.push('IPO_WINDOW');
  }
  if (Math.random() > 0.8) possibleEvents.push('COMPETITOR_THREAT');
  if (Math.random() > 0.9) {
    possibleEvents.push('REGULATORY_ISSUE');
    possibleEvents.push('SUPPLY_CHAIN_CRISIS');
    possibleEvents.push('UNION_DISPUTE');
  }

  if (possibleEvents.length === 0) return null;

  return possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
};

/**
 * Apply the outcome of an event option
 */
export const applyEventOutcome = (
  option: EventOption,
  company: PortfolioCompany
): { statChanges: typeof option.statChanges; companyUpdates: Partial<PortfolioCompany>; wasRisky: boolean } => {
  let wasRisky = false;

  // Check if risky outcome occurs
  if (option.risk && Math.random() * 100 < option.risk) {
    wasRisky = true;
    // Risky outcomes are worse versions of the normal outcome
    // This is a simplified version - could be expanded
  }

  return {
    statChanges: option.statChanges,
    companyUpdates: option.companyChanges,
    wasRisky,
  };
};
