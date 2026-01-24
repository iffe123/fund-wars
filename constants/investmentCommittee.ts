/**
 * Investment Committee Constants
 *
 * The four IC partners based on the Fund Wars vision document.
 * Each has a unique archetype, testing different skills.
 */

import type {
  ICPartner,
  ICQuestion,
  Mentor,
  RedFlag,
  NegotiationCounterparty,
} from '../types/investmentCommittee';

// ==================== IC PARTNERS ====================

export const IC_PARTNERS: ICPartner[] = [
  {
    id: 'margaret',
    name: 'Margaret Thornwood',
    title: 'Managing Director, Risk',
    archetype: 'RISK_HAWK',
    avatar: 'fa-user-shield',
    traits: ['Meticulous', 'Pessimistic', 'Experienced', 'Intimidating'],
    focusAreas: ['Downside scenarios', 'Leverage analysis', 'Covenant structure', 'Stress testing'],
    speechPattern: 'Cold, precise, uses deadly silences',
    famousQuote: 'What keeps you up at night about this deal?',
    questionStyle: 'cold',
    interruptionFrequency: 0.2,
    satisfactionThreshold: 75,
  },
  {
    id: 'david',
    name: 'David Chen',
    title: 'Operating Partner',
    archetype: 'OPERATOR',
    avatar: 'fa-cogs',
    traits: ['Hands-on', 'Former CEO', 'Detail-oriented', 'Empathetic'],
    focusAreas: ['Value creation', 'Management quality', 'Operations', '100-day plan'],
    speechPattern: 'Warm but probing, uses stories from his own experience',
    famousQuote: 'Walk me through Day 1. What\'s the first call you make?',
    questionStyle: 'probing',
    interruptionFrequency: 0.1,
    satisfactionThreshold: 60,
  },
  {
    id: 'victoria',
    name: 'Victoria Hammond',
    title: 'Partner, Investments',
    archetype: 'RETURNS_MAX',
    avatar: 'fa-chart-line',
    traits: ['Impatient', 'Numbers-driven', 'Competitive', 'Sharp'],
    focusAreas: ['IRR math', 'Entry/exit multiples', 'Competition', 'Deal dynamics'],
    speechPattern: 'Fast, interrupts, expects you to keep up',
    famousQuote: 'I can calculate the IRR in my head faster than you can explain it. Convince me on thesis.',
    questionStyle: 'impatient',
    interruptionFrequency: 0.5,
    satisfactionThreshold: 70,
  },
  {
    id: 'richard',
    name: 'Richard Morrison',
    title: 'Founder & Chairman',
    archetype: 'SAGE',
    avatar: 'fa-chess-king',
    traits: ['Philosophical', 'Long-term thinker', 'Reputation-conscious', 'Wise'],
    focusAreas: ['Strategic fit', 'Reputation risk', 'Long-term value', 'Legacy'],
    speechPattern: 'Slow, asks questions that reveal blind spots',
    famousQuote: 'In ten years, what story do we tell about this investment?',
    questionStyle: 'philosophical',
    interruptionFrequency: 0.05,
    satisfactionThreshold: 65,
  },
];

// ==================== IC QUESTIONS BY PARTNER ====================

export const IC_QUESTIONS: Record<string, ICQuestion[]> = {
  margaret: [
    {
      partnerId: 'margaret',
      question: 'Walk me through the downside case. What happens if revenue drops 20%?',
      category: 'risk',
      difficulty: 'medium',
      followUpIf: {
        condition: 'weak_answer',
        question: 'You seem unprepared. Have you even run a sensitivity analysis?',
      },
    },
    {
      partnerId: 'margaret',
      question: 'The leverage ratio concerns me. What\'s the debt service coverage at your base case?',
      category: 'financials',
      difficulty: 'hard',
    },
    {
      partnerId: 'margaret',
      question: 'What covenants are the lenders proposing, and which ones are you willing to fight for?',
      category: 'financials',
      difficulty: 'hard',
    },
    {
      partnerId: 'margaret',
      question: 'Tell me about the customer concentration. What happens if the top customer leaves?',
      category: 'risk',
      difficulty: 'medium',
    },
    {
      partnerId: 'margaret',
      question: 'What\'s the worst thing you found in due diligence that you haven\'t mentioned yet?',
      category: 'risk',
      difficulty: 'gotcha',
    },
    {
      partnerId: 'margaret',
      question: 'How much management equity rollover are we getting, and what does that tell you?',
      category: 'risk',
      difficulty: 'medium',
    },
  ],
  david: [
    {
      partnerId: 'david',
      question: 'Walk me through Day 1. What\'s the first call you make to the CEO?',
      category: 'operations',
      difficulty: 'medium',
    },
    {
      partnerId: 'david',
      question: 'Tell me about the management team. Who\'s a keeper and who needs to go?',
      category: 'operations',
      difficulty: 'medium',
      followUpIf: {
        condition: 'evasive',
        question: 'You\'re being diplomatic. I need specifics. Is the CFO capable or not?',
      },
    },
    {
      partnerId: 'david',
      question: 'What\'s your 100-day value creation plan? Be specific.',
      category: 'operations',
      difficulty: 'hard',
    },
    {
      partnerId: 'david',
      question: 'I ran a company like this. The real cost savings are in procurement. Have you looked at that?',
      category: 'operations',
      difficulty: 'medium',
    },
    {
      partnerId: 'david',
      question: 'How aligned is the board going to be? Any legacy directors we need to worry about?',
      category: 'operations',
      difficulty: 'medium',
    },
    {
      partnerId: 'david',
      question: 'What happens if the CEO doesn\'t work out? Do we have a backup plan?',
      category: 'operations',
      difficulty: 'hard',
    },
  ],
  victoria: [
    {
      partnerId: 'victoria',
      question: 'Give me the IRR at base case. Now give me the sensitivity to exit multiple.',
      category: 'financials',
      difficulty: 'hard',
    },
    {
      partnerId: 'victoria',
      question: 'Why are we paying 8x when comps are trading at 6.5x? Justify the premium.',
      category: 'financials',
      difficulty: 'hard',
      followUpIf: {
        condition: 'weak_answer',
        question: 'That\'s not a justification, that\'s hope. Give me real numbers.',
      },
    },
    {
      partnerId: 'victoria',
      question: 'Who else is bidding? What\'s our edge in this process?',
      category: 'strategy',
      difficulty: 'medium',
    },
    {
      partnerId: 'victoria',
      question: 'Where does the return come from? Multiple expansion, EBITDA growth, or deleveraging?',
      category: 'financials',
      difficulty: 'medium',
    },
    {
      partnerId: 'victoria',
      question: 'The banker says there\'s another bidder at higher price. Do you believe them?',
      category: 'strategy',
      difficulty: 'medium',
    },
    {
      partnerId: 'victoria',
      question: 'At what price do we walk? Give me a number.',
      category: 'financials',
      difficulty: 'hard',
    },
  ],
  richard: [
    {
      partnerId: 'richard',
      question: 'In ten years, what story do we tell about this investment?',
      category: 'strategy',
      difficulty: 'hard',
    },
    {
      partnerId: 'richard',
      question: 'How does this fit our thesis as a firm? Why is this deal right for us specifically?',
      category: 'thesis',
      difficulty: 'medium',
    },
    {
      partnerId: 'richard',
      question: 'What does this deal do to our reputation if it goes wrong?',
      category: 'risk',
      difficulty: 'medium',
    },
    {
      partnerId: 'richard',
      question: 'I\'ve seen a lot of deals like this. What makes you think this time is different?',
      category: 'thesis',
      difficulty: 'hard',
      followUpIf: {
        condition: 'weak_answer',
        question: 'That\'s what they all say. Dig deeper.',
      },
    },
    {
      partnerId: 'richard',
      question: 'Is this a deal we\'d be proud to discuss with our LPs?',
      category: 'strategy',
      difficulty: 'medium',
    },
    {
      partnerId: 'richard',
      question: 'What would make you kill this deal right now, no matter the price?',
      category: 'thesis',
      difficulty: 'gotcha',
    },
  ],
};

// ==================== SOCRATIC PROMPTS ====================

export const SOCRATIC_STAGES = {
  elenchus: {
    description: 'Reveal inconsistencies in player\'s beliefs',
    promptPatterns: [
      'You said X, but you also mentioned Y. How do you reconcile these?',
      'If that\'s true, then what does that imply about...?',
      'What assumption are you making there?',
    ],
  },
  maieutics: {
    description: 'Help players draw knowledge from within',
    promptPatterns: [
      'What would need to be true for that to work?',
      'If you were the seller, what would you be hiding?',
      'What\'s the one thing that could make this deal fail?',
    ],
  },
  induction: {
    description: 'Guide players to generalize from examples',
    promptPatterns: [
      'You\'ve seen deals like this before. What pattern do you notice?',
      'When have you seen this situation go wrong?',
      'What does history teach us about this type of deal?',
    ],
  },
  definition: {
    description: 'Work toward formulating clear principles',
    promptPatterns: [
      'So what\'s the general rule here?',
      'How would you define the key risk in one sentence?',
      'What principle should guide this decision?',
    ],
  },
};

// ==================== RED FLAGS EXAMPLES ====================

export const SAMPLE_RED_FLAGS: RedFlag[] = [
  {
    id: 'rf_ebitda_addback_1',
    category: 'FINANCIAL',
    severity: 'MAJOR',
    title: 'Questionable EBITDA Add-backs',
    description: '"Strategic initiative" spending of $4.7M added back to EBITDA appears to be recurring operational costs disguised as one-time items.',
    location: 'CIM Page 23, EBITDA Reconciliation Table',
    discoveryHint: 'The add-backs have been consistent for 3 years - that\'s a pattern, not a one-time event.',
    consequence: 'True EBITDA is ~10% lower than stated, significantly impacting valuation and returns.',
    isDiscovered: false,
  },
  {
    id: 'rf_customer_concentration',
    category: 'OPERATIONAL',
    severity: 'CRITICAL',
    title: 'Hidden Customer Concentration',
    description: 'Top customer represents 45% of revenue (mentioned only in footnote 17), and their contract expires 6 months post-close.',
    location: 'CIM Appendix B, Footnote 17',
    discoveryHint: 'The revenue breakdown by customer is conspicuously absent from the main presentation.',
    consequence: 'If top customer churns, business could lose nearly half its revenue within a year of acquisition.',
    isDiscovered: false,
  },
  {
    id: 'rf_working_capital',
    category: 'FINANCIAL',
    severity: 'MODERATE',
    title: 'Working Capital Manipulation',
    description: 'DSO (Days Sales Outstanding) jumped from 45 to 65 days in the last quarter, suggesting revenue was pulled forward.',
    location: 'QoE Report Page 8, Working Capital Analysis',
    discoveryHint: 'Collections have slowed dramatically right before the sale process began.',
    consequence: 'Normalized working capital requirement is higher than presented, requiring additional cash at close.',
    isDiscovered: false,
  },
  {
    id: 'rf_ceo_departure',
    category: 'MANAGEMENT',
    severity: 'MAJOR',
    title: 'CEO Planning Exit',
    description: 'CEO\'s earnout is fully accelerated if company is sold, and she has been updating her LinkedIn profile.',
    location: 'Management Presentation, observed behavior',
    discoveryHint: 'Her earnout structure incentivizes a quick flip, not long-term value creation.',
    consequence: 'Key leader may depart within 12 months of close, leaving a leadership vacuum.',
    isDiscovered: false,
  },
  {
    id: 'rf_supplier_single_source',
    category: 'OPERATIONAL',
    severity: 'MODERATE',
    title: 'Single-Source Supplier Risk',
    description: 'Critical component sourced from a single supplier in a politically unstable region with no backup.',
    location: 'Data Room, Supply Agreements folder',
    discoveryHint: 'The supply agreement renewal is "in progress" but has been for 8 months.',
    consequence: 'Supply chain disruption could halt production for months.',
    isDiscovered: false,
  },
  {
    id: 'rf_litigation_pending',
    category: 'LEGAL',
    severity: 'MAJOR',
    title: 'Undisclosed Patent Litigation',
    description: 'Competitor has filed patent infringement suit that could result in $20M+ damages or product injunction.',
    location: 'Data Room, Legal folder (buried in subfolder)',
    discoveryHint: 'The legal section is unusually thin for a company this size.',
    consequence: 'Could face significant damages or lose right to sell core product.',
    isDiscovered: false,
  },
  {
    id: 'rf_covenant_breach',
    category: 'FINANCIAL',
    severity: 'CRITICAL',
    title: 'Hidden Covenant Breach',
    description: 'Company technically breached a debt covenant last quarter but received a waiver that expires at close.',
    location: 'Credit Agreement Amendment 7',
    discoveryHint: 'Why are there so many credit agreement amendments?',
    consequence: 'New buyer may need to refinance immediately or face default.',
    isDiscovered: false,
  },
  {
    id: 'rf_change_of_control',
    category: 'LEGAL',
    severity: 'MAJOR',
    title: 'Change of Control Clause',
    description: 'Key customer contract contains change-of-control termination provision with 30-day notice.',
    location: 'Data Room, Customer Contracts, paragraph 14.2',
    discoveryHint: 'The contract summary mentions "standard termination provisions" but doesn\'t specify.',
    consequence: 'Customer could walk immediately after acquisition is announced.',
    isDiscovered: false,
  },
];

// ==================== NEGOTIATION COUNTERPARTIES ====================

export const SAMPLE_COUNTERPARTIES: NegotiationCounterparty[] = [
  {
    id: 'founder_james',
    name: 'James Park',
    type: 'FOUNDER_CEO',
    avatar: 'fa-user-tie',
    company: 'TechCorp Industries',
    visiblePosition: 'I need $500M minimum. That\'s non-negotiable.',
    hiddenConstraints: {
      mustHave: ['$450M minimum (ego floor)', 'Retention package for COO', 'Legacy protection clause'],
      niceToHave: ['$500M (half-billionaire status)', 'Board seat post-close', 'Brand preservation'],
      secretMotivation: 'Terrified his COO will leave; needs earnout structure to retain her. His wife expects $500M.',
      dealBreakers: ['Public criticism of his leadership', 'Immediate layoffs of original team'],
    },
    personality: {
      aggression: 0.3,
      trustBuilding: 0.8,
      patience: 0.5,
      bluffTendency: 0.6,
      emotionalTriggers: ['legacy', 'employees', 'my vision'],
    },
    cluesDropped: [
      'My COO has been incredible. She could run this place tomorrow.',
      'At $450M... I\'d have to think hard about my legacy.',
      'The banker says there\'s another bidder at $480M.',
    ],
  },
  {
    id: 'banker_sullivan',
    name: 'Katherine Sullivan',
    type: 'BANKER',
    avatar: 'fa-landmark',
    company: 'Goldman Sachs',
    visiblePosition: 'We\'re running a competitive process. Bids are due Friday.',
    hiddenConstraints: {
      mustHave: ['Deal closes (fee depends on it)', 'Quick timeline (she has another deal starting)'],
      niceToHave: ['Highest price (bigger fee)', 'Clean process (good for reputation)'],
      secretMotivation: 'Under pressure from partner to close before quarter end. Will accept certainty over price.',
      dealBreakers: ['Extended due diligence that delays close', 'Excessive retrades'],
    },
    personality: {
      aggression: 0.7,
      trustBuilding: 0.3,
      patience: 0.2,
      bluffTendency: 0.8,
      emotionalTriggers: ['timeline', 'certainty', 'my other clients'],
    },
    cluesDropped: [
      'We really need to move on timeline here.',
      'I have another process kicking off next week.',
      'Certainty of close is... very important to my client.',
    ],
  },
  {
    id: 'lender_winters',
    name: 'Michael Winters',
    type: 'LENDER',
    avatar: 'fa-university',
    company: 'Ares Capital',
    visiblePosition: 'We can support 5x leverage, but the covenants need to be tight.',
    hiddenConstraints: {
      mustHave: ['Debt service coverage > 1.5x', 'Quarterly financial reporting', 'Minimum cash sweep'],
      niceToHave: ['6x leverage (more fees)', 'Call protection', 'Co-invest opportunity'],
      secretMotivation: 'His fund is under-deployed; needs to put capital to work but can\'t look desperate.',
      dealBreakers: ['Leverage > 6.5x', 'No financial covenants', 'PIK toggle on day one'],
    },
    personality: {
      aggression: 0.4,
      trustBuilding: 0.5,
      patience: 0.6,
      bluffTendency: 0.4,
      emotionalTriggers: ['downside protection', 'our credit committee', 'other sponsors'],
    },
    cluesDropped: [
      'We\'ve got capital to deploy, but we need the right structures.',
      'I need to take this to credit committee next week.',
      'Other sponsors have been... more flexible on covenants.',
    ],
  },
];

// ==================== MENTORS ====================

export const MENTORS: Mentor[] = [
  {
    id: 'henry_keller',
    name: 'Henry Keller',
    archetype: 'The Dealmaker',
    philosophy: 'Leverage is a tool. Conviction is a weapon.',
    avatar: 'fa-handshake',
    unlockCondition: 'Complete your first hostile takeover',
    isUnlocked: false,
    specialAbilities: [
      'Access to exclusive hostile deal flow',
      '+10% success rate on aggressive negotiations',
      'Unlock "Barbarians at the Gate" playbook',
    ],
    wisdomQuotes: [
      'In a negotiation, the first one to show emotion loses.',
      'Debt isn\'t dangerous. Ignorance of debt is dangerous.',
      'The best deals are the ones everyone else is too scared to do.',
    ],
    adviceStyle: 'direct',
    responsePatterns: [
      'Cut the preamble. What\'s the number?',
      'I\'ve done a hundred of these. Here\'s what you\'re missing...',
    ],
  },
  {
    id: 'sandra_black',
    name: 'Sandra Black',
    archetype: 'The Operator',
    philosophy: 'Buy quality. Fix the fixable. Be patient.',
    avatar: 'fa-industry',
    unlockCondition: 'Successfully hold a portfolio company through a market crisis',
    isUnlocked: false,
    specialAbilities: [
      'Portfolio companies get +15% operational improvement bonus',
      'Access to top-tier operating executives network',
      'Unlock "The 100-Day Plan" masterclass',
    ],
    wisdomQuotes: [
      'The spreadsheet lies. Go walk the factory floor.',
      'Good management is worth more than any financial engineering.',
      'Patience isn\'t passive. It\'s the most aggressive form of discipline.',
    ],
    adviceStyle: 'storytelling',
    responsePatterns: [
      'Let me tell you about a deal I did in \'94...',
      'The numbers don\'t tell the whole story. What did the employees say?',
    ],
  },
  {
    id: 'marcus_chen',
    name: 'Marcus Chen',
    archetype: 'The Vulture',
    philosophy: 'Others\' panic is your opportunity.',
    avatar: 'fa-crow',
    unlockCondition: 'Profit from a bankruptcy or distressed situation',
    isUnlocked: false,
    specialAbilities: [
      'First look at distressed deal flow',
      '+20% returns on restructuring situations',
      'Unlock "Buying Debt at a Discount" strategy',
    ],
    wisdomQuotes: [
      'When there\'s blood in the streets, buy property.',
      'Distress is just value creation with worse PR.',
      'The bankruptcy code is my favorite financing document.',
    ],
    adviceStyle: 'challenging',
    responsePatterns: [
      'Everyone sees the risk. What do you see that they don\'t?',
      'Fear is the market giving you a discount. Take it.',
    ],
  },
  {
    id: 'elena_rodriguez',
    name: 'Elena Rodriguez',
    archetype: 'The Visionary',
    philosophy: 'The best returns come from the future, not the spreadsheet.',
    avatar: 'fa-rocket',
    unlockCondition: 'Achieve a 5x return on a growth equity investment',
    isUnlocked: false,
    specialAbilities: [
      'Access to growth-stage deal flow',
      '+10% valuation uplift on tech investments',
      'Unlock "Riding the J-Curve" playbook',
    ],
    wisdomQuotes: [
      'If you can model it precisely, you\'ve already missed the opportunity.',
      'Bet on founders, not business plans.',
      'The market for the future is always bigger than analysts think.',
    ],
    adviceStyle: 'socratic',
    responsePatterns: [
      'Forget the DCF. What\'s the dream scenario?',
      'What would this look like if everything went right?',
    ],
  },
];

// ==================== EVALUATION CRITERIA ====================

export const IC_EVALUATION_WEIGHTS = {
  thesis_clarity: 0.20,
  financial_rigor: 0.20,
  risk_awareness: 0.15,
  value_creation: 0.20,
  conviction: 0.15,
  specificity: 0.10,
};

export const IC_VERDICT_THRESHOLDS = {
  APPROVED: 80,
  CONDITIONAL: 65,
  TABLED: 50,
  REJECTED: 0,
};

// ==================== LEARNING CONCEPTS ====================

export const PE_LEARNING_CONCEPTS = {
  associate: [
    { id: 'lbo_mechanics', name: 'LBO Mechanics 101', description: 'Where does the return come from?' },
    { id: 'entry_multiple', name: 'Entry Multiple Math', description: 'You paid WHAT for this business?' },
    { id: 'leverage_fundamentals', name: 'Leverage Fundamentals', description: 'Debt is a tool, not a gift' },
    { id: 'thesis_development', name: 'Thesis Development', description: 'Why this deal? Why now? Why us?' },
  ],
  seniorAssociate: [
    { id: 'value_creation', name: 'Value Creation Levers', description: 'How do you actually make money post-close?' },
    { id: 'management_assessment', name: 'Management Assessment', description: 'The CEO is lying. Can you tell?' },
    { id: 'covenant_analysis', name: 'Covenant Analysis', description: 'The fine print that bankrupts companies' },
    { id: 'competitive_dynamics', name: 'Competitive Dynamics', description: 'Who else is bidding and why do you care?' },
  ],
  vp: [
    { id: 'portfolio_construction', name: 'Portfolio Construction', description: 'Your fund is a portfolio, not a pile' },
    { id: 'lp_relations', name: 'LP Relations', description: 'The people who actually give you money' },
    { id: 'exit_timing', name: 'Exit Timing', description: 'Knowing when to hold and when to fold' },
    { id: 'market_cycles', name: 'Market Cycles', description: 'Everything works until it doesn\'t' },
  ],
  partner: [
    { id: 'thesis_evolution', name: 'Thesis Evolution', description: 'Is your investment approach still working?' },
    { id: 'team_development', name: 'Team Development', description: 'Your people are your only real asset' },
    { id: 'reputation_management', name: 'Reputation Management', description: 'Play the infinite game' },
    { id: 'legacy', name: 'Legacy', description: 'What did you actually build?' },
  ],
};

// ==================== HISTORICAL PARALLELS ====================

export const DEAL_PARALLELS = [
  {
    id: 'rjr_nabisco',
    dealName: 'RJR Nabisco (1988)',
    inspiredScenario: 'SnackCo Industries',
    keyLessons: ['Hubris in bidding', 'Hostile takeover dynamics', 'Media circus risk'],
    description: 'The original "Barbarians at the Gate" - a cautionary tale of ego and auction fever.',
  },
  {
    id: 'hilton_blackstone',
    dealName: 'Hilton/Blackstone (2007)',
    inspiredScenario: 'Metropolis Hotels',
    keyLessons: ['Crisis management', 'Patient capital', 'Operational restructuring'],
    description: 'Bought at the top, held through the crash, exited as the greatest PE deal ever.',
  },
  {
    id: 'txu_energy',
    dealName: 'TXU Energy (2007)',
    inspiredScenario: 'TerraWatt Energy',
    keyLessons: ['Macro risk', 'Thesis invalidation', 'Bankruptcy'],
    description: 'The largest PE deal in history became the largest bankruptcy - a lesson in timing and hubris.',
  },
  {
    id: 'toys_r_us',
    dealName: 'Toys "R" Us (2005)',
    inspiredScenario: 'RetailCo Brands',
    keyLessons: ['E-commerce disruption', 'Debt overhang', 'Operational failure'],
    description: 'How financial engineering without operational improvement kills iconic brands.',
  },
];
