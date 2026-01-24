/**
 * Investment Committee (IC) Types
 *
 * The IC is where players pitch deals to a panel of partners
 * who interrogate them with tough questions. Each partner has
 * a unique personality and focuses on different aspects.
 */

export type ICPartnerArchetype =
  | 'RISK_HAWK'        // Margaret Thornwood - Downside, leverage, covenants
  | 'OPERATOR'         // David Chen - Value creation, management, operations
  | 'RETURNS_MAX'      // Victoria Hammond - IRR math, entry/exit, competition
  | 'SAGE';            // Richard Morrison - Strategic fit, reputation, long-term

export type ICMeetingPhase =
  | 'PREP'             // Before meeting - review materials
  | 'OPENING_PITCH'    // 3 minute timed pitch
  | 'INTERROGATION'    // Partners ask questions
  | 'DELIBERATION'     // Partners discuss (hidden)
  | 'VERDICT';         // Final decision

export type ICVerdict =
  | 'APPROVED'         // Full approval to proceed
  | 'CONDITIONAL'      // Approved with conditions
  | 'TABLED'           // Need more work, revisit later
  | 'REJECTED';        // Pass on the deal

export interface ICPartner {
  id: string;
  name: string;
  title: string;
  archetype: ICPartnerArchetype;
  avatar: string;
  traits: string[];
  focusAreas: string[];
  speechPattern: string;
  famousQuote: string;
  questionStyle: 'cold' | 'probing' | 'impatient' | 'philosophical';
  interruptionFrequency: number; // 0-1, how often they interrupt
  satisfactionThreshold: number; // 0-100, how hard to please
}

export interface ICQuestion {
  partnerId: string;
  question: string;
  category: 'thesis' | 'financials' | 'risk' | 'operations' | 'strategy' | 'exit';
  difficulty: 'easy' | 'medium' | 'hard' | 'gotcha';
  followUpIf?: {
    condition: 'weak_answer' | 'strong_answer' | 'evasive';
    question: string;
  };
}

export interface ICPartnerReaction {
  partnerId: string;
  satisfaction: number; // -100 to 100
  reaction: 'satisfied' | 'probing' | 'skeptical' | 'dismissive' | 'impressed';
  feedback: string;
  followUpQuestion?: string;
}

export interface ICPitchEvaluation {
  dimensions: {
    thesis_clarity: number;      // 0-100: Can a partner repeat your thesis?
    financial_rigor: number;     // 0-100: Do the numbers make sense?
    risk_awareness: number;      // 0-100: Honest about what can go wrong?
    value_creation: number;      // 0-100: Credible path to returns?
    conviction: number;          // 0-100: Do you believe in this deal?
    specificity: number;         // 0-100: Real details vs. MBA buzzwords?
  };

  overallScore: number;          // 0-100 composite score

  // Educational tracking
  conceptsDemonstrated: string[];  // PE skills shown
  conceptsMissing: string[];       // Gaps identified
  learningRecommendation: string;  // What to study next
}

export interface ICMeetingState {
  companyId: number;
  companyName: string;
  phase: ICMeetingPhase;
  currentPartnerIndex: number;
  questionsAsked: number;
  maxQuestions: number;
  timeRemaining?: number; // seconds for timed phases

  // Player responses
  openingPitch?: string;
  responses: Array<{
    questionId: string;
    question: string;
    response: string;
    reaction: ICPartnerReaction;
  }>;

  // Partner states
  partnerSatisfaction: Record<string, number>; // partnerId -> satisfaction

  // Final outcome
  evaluation?: ICPitchEvaluation;
  verdict?: ICVerdict;
  partnerVotes?: Array<{
    partnerId: string;
    vote: ICVerdict;
    reasoning: string;
  }>;
}

export interface ICSocraticPrompt {
  stage: 'elenchus' | 'maieutics' | 'induction' | 'definition';
  questions: string[];
  hintsIfStuck: string[];
  celebrateInsight: boolean;
  relatedConcepts: string[];
}

/**
 * Red Flags System Types
 *
 * AI-generated documents with buried problems to discover.
 */

export type RedFlagSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';

export type RedFlagCategory =
  | 'FINANCIAL'        // Revenue recognition, EBITDA adjustments
  | 'OPERATIONAL'      // Customer concentration, supplier dependency
  | 'LEGAL'            // Pending litigation, regulatory issues
  | 'MANAGEMENT'       // CEO issues, key person risk
  | 'MARKET'           // Competition, disruption risk
  | 'GOVERNANCE';      // Board issues, related party transactions

export interface RedFlag {
  id: string;
  category: RedFlagCategory;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  location: string;      // Where in the document it's hidden
  discoveryHint: string; // Subtle clue for the player
  consequence: string;   // What happens if missed
  isDiscovered: boolean;
  discoveryMethod?: 'flagged' | 'management_meeting' | 'expert_call' | 'missed';
}

export interface DueDiligenceDocument {
  id: string;
  type: 'CIM' | 'QOE' | 'MANAGEMENT_PRESENTATION' | 'DATA_ROOM' | 'EXPERT_CALL';
  title: string;
  companyId: number;
  sections: DDDocumentSection[];
  redFlags: RedFlag[];
  discoveredFlags: string[]; // IDs of flags player found
  missedFlags: string[];     // IDs of flags player missed (revealed post-deal)
}

export interface DDDocumentSection {
  id: string;
  title: string;
  content: string;
  isExpandable: boolean;
  hasHiddenContent: boolean;
  footnotes?: string[];
  tables?: DDTable[];
}

export interface DDTable {
  id: string;
  title: string;
  headers: string[];
  rows: DDTableRow[];
  flaggableItems: string[]; // IDs of rows that can be flagged
}

export interface DDTableRow {
  id: string;
  cells: string[];
  isFlaggable: boolean;
  isRedFlag: boolean;
  redFlagId?: string;
}

/**
 * Negotiation Arena Types
 *
 * Free-form conversation with AI counterparties who have hidden motivations.
 */

export type CounterpartyType =
  | 'FOUNDER_CEO'      // Emotional, legacy-focused
  | 'BANKER'           // Fee-driven, urgency creator
  | 'RIVAL_PE'         // Competitive, strategic
  | 'LENDER'           // Downside-focused, covenant lover
  | 'LP';              // Returns-focused, fee-conscious

export interface NegotiationCounterparty {
  id: string;
  name: string;
  type: CounterpartyType;
  avatar: string;
  company: string;
  visiblePosition: string;     // What they say they want
  hiddenConstraints: {
    mustHave: string[];        // Walk-away if not met
    niceToHave: string[];      // Negotiable
    secretMotivation: string;  // Why they really care
    dealBreakers: string[];    // Instant rejection
  };
  personality: {
    aggression: number;        // 0-1
    trustBuilding: number;     // How much rapport matters
    patience: number;          // Will they wait?
    bluffTendency: number;     // How often they overstate
    emotionalTriggers: string[];
  };
  cluesDropped: string[];      // Hints revealed in conversation
}

export interface NegotiationState {
  counterpartyId: string;
  dealId: number;
  phase: 'OPENING' | 'DISCOVERY' | 'TERMS' | 'CLOSING' | 'IMPASSE' | 'AGREED';

  // Tracking
  playerOffers: string[];
  counterpartyResponses: string[];
  discoveredConstraints: string[];
  bluffsIdentified: string[];

  // Rapport
  rapportScore: number;        // 0-100
  tensionLevel: number;        // 0-100

  // Outcome
  agreedTerms?: Record<string, string | number>;
  outcome?: 'DEAL_CLOSED' | 'WALKED_AWAY' | 'LOST_TO_RIVAL' | 'TERMS_REJECTED';
}

/**
 * Deal Autopsy Types
 *
 * Post-deal analysis showing optimal vs actual outcomes.
 */

export interface DealAutopsy {
  companyId: number;
  companyName: string;
  holdPeriodWeeks: number;

  // Actual outcomes
  actualOutcome: {
    entryValuation: number;
    exitValuation: number;
    moic: number;
    irr: number;
    exitType: string;
  };

  // What could have been
  optimalOutcome: {
    moic: number;
    irr: number;
    missedOpportunities: string[];
  };

  // Analysis
  whatWentRight: Array<{
    category: string;
    description: string;
    impact: string;
  }>;

  whatWentWrong: Array<{
    category: string;
    description: string;
    impact: string;
    wasPreventable: boolean;
  }>;

  // Learning
  historicalParallel?: {
    dealName: string;
    description: string;
    lesson: string;
  };

  skillsDemonstrated: string[];
  skillsToDevelop: string[];

  // Red flags analysis
  redFlagsFound: number;
  redFlagsMissed: number;
  redFlagConsequences: string[];
}

/**
 * Analyst Trap Types
 *
 * Junior analyst produces work with intentional errors.
 */

export type AnalystErrorType =
  | 'MODELING'         // Circular reference, wrong discount rate
  | 'ASSUMPTION'       // Unrealistic growth, impossible margins
  | 'PRESENTATION'     // Chart contradicts text, misleading axis
  | 'LOGIC'            // Thesis inconsistency
  | 'DATA';            // Wrong numbers, stale data

export interface AnalystWork {
  id: string;
  analystId: string;
  analystName: string;
  companyId: number;
  deliverableType: 'MODEL' | 'MEMO' | 'DECK' | 'ANALYSIS';
  title: string;
  dueWeek: number;

  // Errors hidden in work
  errors: AnalystError[];
  errorsFound: string[];      // IDs player discovered
  errorsMissed: string[];     // IDs that slipped through

  // Review options
  reviewLevel: 'NONE' | 'SPOT_CHECK' | 'THOROUGH' | 'DELEGATED';
  reviewCostAP: number;

  // Consequences
  icImpact?: string;          // What happens if error found in IC
  dealImpact?: string;        // What happens if error affects deal
}

export interface AnalystError {
  id: string;
  type: AnalystErrorType;
  location: string;           // Where in the document
  description: string;        // What's wrong
  hint: string;               // Clue for player
  severity: 'MINOR' | 'MODERATE' | 'CRITICAL';
  consequence: string;        // What happens if missed
}

/**
 * Mentor System Types
 *
 * Legendary investors as unlockable mentors.
 */

export interface Mentor {
  id: string;
  name: string;
  archetype: string;
  philosophy: string;
  avatar: string;
  unlockCondition: string;
  isUnlocked: boolean;

  // Benefits
  specialAbilities: string[];
  dealFlowBonus?: string;
  wisdomQuotes: string[];

  // Interaction
  adviceStyle: 'direct' | 'socratic' | 'storytelling' | 'challenging';
  responsePatterns: string[];
}
