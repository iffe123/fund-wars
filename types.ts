
export enum PlayerLevel {
  ASSOCIATE = 'Associate',
  SENIOR_ASSOCIATE = 'Senior Associate',
  VICE_PRESIDENT = 'Vice President',
  PRINCIPAL = 'Principal',
  PARTNER = 'Partner',
  FOUNDER = 'Founder',
}

export type MarketVolatility = 'NORMAL' | 'BULL_RUN' | 'CREDIT_CRUNCH' | 'PANIC';

export type Faction =
  | 'MANAGING_DIRECTORS'
  | 'ANALYSTS'
  | 'REGULATORS'
  | 'LIMITED_PARTNERS'
  | 'RIVALS';

export type FactionReputation = Record<Faction, number>;

export interface CompanyEvent {
  date: {
    year: number;
    month: number;
  };
  description: string;
}

// ==================== LIVING WORLD SYSTEM ====================

export type CompanyEventType =
  | 'REVENUE_DROP'
  | 'KEY_CUSTOMER_LOSS'
  | 'MANAGEMENT_DEPARTURE'
  | 'COMPETITOR_THREAT'
  | 'ACQUISITION_OPPORTUNITY'
  | 'REGULATORY_ISSUE'
  | 'UNION_DISPUTE'
  | 'SUPPLY_CHAIN_CRISIS'
  | 'ACTIVIST_INVESTOR'
  | 'IPO_WINDOW'
  | 'STRATEGIC_BUYER_INTEREST';

export type CompanyStatus = 'PIPELINE' | 'OWNED' | 'EXITING';

// Deal Phase State Machine:
// PIPELINE → ANALYZING → ANALYZED → BIDDING → WON/LOST/WALKED_AWAY
export type DealPhase =
  | 'PIPELINE'      // Initial state - can only do DILIGENCE
  | 'ANALYZING'     // DD in progress (intermediate state)
  | 'ANALYZED'      // DD complete - can SUBMIT IOI, DISCUSS, WALK AWAY, or use LEVERAGE tool
  | 'BIDDING'       // IOI submitted, waiting for auction result
  | 'WON'           // Deal won - moves to portfolio as OWNED
  | 'LOST'          // Lost to rival - removed from pipeline
  | 'WALKED_AWAY';  // Player chose to pass

// Management action types for owned companies
export type ManagementActionType =
  | 'SET_STRATEGY'
  | 'FIRE_CEO'
  | 'HIRE_EXECUTIVE'
  | 'BOARD_MEETING'
  | 'COST_CUTTING'
  | 'GROWTH_INVESTMENT'
  | 'REFINANCE_DEBT'
  | 'ADD_ON_ACQUISITION'
  | 'PREPARE_EXIT';

export interface ManagementActionOutcome {
  chance: number;  // 0-100
  statChanges: Partial<StatChanges>;
  companyChanges: Partial<PortfolioCompany>;
  description: string;
}

export interface ManagementAction {
  type: ManagementActionType;
  label: string;
  description: string;
  apCost: number;
  cooldownWeeks: number;  // Can't repeat for X weeks
  possibleOutcomes: ManagementActionOutcome[];
}

// Leverage model for IRR/MOIC calculations
export interface LeverageModel {
  entryMultiple: number;      // EV/EBITDA multiple for entry
  revenueMultiple: number;    // EV/Revenue multiple
  debtPercent: number;        // % of purchase price financed with debt
  holdPeriodYears: number;    // Expected hold period
  exitMultiple: number;       // Expected exit multiple
  revenueGrowthRate: number;  // Annual revenue growth assumption
  marginImprovement: number;  // EBITDA margin improvement
  // Calculated outputs
  projectedIRR: number;
  projectedMOIC: number;
  equityCheck: number;        // Cash needed from fund
}

export interface ManagementMember {
  role: 'CEO' | 'CFO' | 'COO' | 'CTO' | 'CMO';
  name: string;
  performance: number;  // 0-100
  loyalty: number;      // 0-100
  poachRisk: number;    // 0-100, risk of being recruited away
}

export interface EventOption {
  id: string;
  label: string;
  description: string;
  statChanges: StatChanges;
  companyChanges: Partial<PortfolioCompany>;
  outcomeText: string;
  risk?: number;  // 0-100, chance of negative outcome
}

export interface CompanyActiveEvent {
  id: string;
  type: CompanyEventType;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  options: EventOption[];
  expiresWeek: number;  // Must decide by this week
  consultWithMachiavelli?: boolean;  // Flag to suggest advisor consultation
}

export interface StrategicDecision {
  id: string;
  title: string;
  description: string;
  options: EventOption[];
  deadline: number;  // Game week
  companyImpact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Warning {
  id: string;
  type: 'CASH' | 'HEALTH' | 'STRESS' | 'REPUTATION' | 'PORTFOLIO' | 'LOAN' | 'DEADLINE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  suggestedAction?: string;
}

export interface NPCDrama {
  id: string;
  title: string;
  description: string;
  involvedNpcs: string[];  // NPC IDs
  playerMustChooseSide: boolean;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  choices: Choice[];
  expiresWeek: number;
}

export interface RivalAction {
  rivalId: string;
  action: string;
  target?: string;
  impact: string;
}

export interface MarketChange {
  type: 'VOLATILITY_SHIFT' | 'SECTOR_ROTATION' | 'INTEREST_RATE' | 'CREDIT_CONDITIONS';
  description: string;
  impact: Partial<StatChanges>;
}

export interface WorldTickResult {
  portfolioUpdates: Map<number, Partial<PortfolioCompany>>;
  newEvents: CompanyActiveEvent[];
  warnings: Warning[];
  npcDramas: NPCDrama[];
  rivalActions: RivalAction[];
  marketChanges: MarketChange[];
}

export interface PortfolioCompany {
  id: number;
  name: string;
  ceo: string;
  investmentCost: number;
  ownershipPercentage: number;
  currentValuation: number;
  latestCeoReport: string;
  nextBoardMeeting: string;
  dealType: DealType;
  sector?: IndustrySector;
  revenue: number;
  ebitda: number;
  debt: number;
  revenueGrowth: number;
  acquisitionDate: {
    year: number;
    month: number;
  };
  eventHistory: CompanyEvent[];
  isAnalyzed?: boolean;
  hasBoardCrisis?: boolean;

  // NEW: Company Health Metrics
  employeeCount: number;
  employeeGrowth: number;        // % change per quarter
  ebitdaMargin: number;          // EBITDA / Revenue
  cashBalance: number;           // Company's own cash
  runwayMonths: number;          // Months of cash left (for growth companies)
  customerChurn: number;         // For SaaS/subscription businesses

  // NEW: Management & Governance
  ceoPerformance: number;        // 0-100
  boardAlignment: number;        // 0-100, how aligned board is
  managementTeam: ManagementMember[];

  // NEW: Deal Status
  dealClosed: boolean;           // True once IOI is accepted and deal closes
  isInExitProcess: boolean;
  exitType?: ExitType;

  // Deal Phase State Machine
  dealPhase: DealPhase;          // Current phase in the deal pipeline
  ddCompletedWeek?: number;      // Week when due diligence was completed
  actionsThisWeek: string[];     // Actions taken this week on this company
  lastManagementActions: Record<ManagementActionType, number>;  // Action type -> last week performed
  leverageModelViewed?: boolean; // Must be true before bid can be submitted
  leverageModelParams?: {
    entryMultiple: number;
    exitMultiple: number;
    projectedIRR: number;
    projectedMOIC: number;
  };

  // NEW: Active Events
  activeEvent?: CompanyActiveEvent;
  pendingDecisions: StrategicDecision[];

  // NEW: Timeline
  nextBoardMeetingWeek: number;  // Game week of next board meeting
  lastFinancialUpdate: number;   // Game week of last update
}

export interface PortfolioAction {
  id: string;
  text: string;
  description: string;
  icon: string;
  outcome: {
    description: string;
    statChanges: StatChanges;
    logMessage: string;
  };
}

export interface PortfolioImpact {
  valuationChangePercentage: number;
  applicableDealTypes?: DealType[];
}

export type MemorySentiment = 'positive' | 'negative' | 'neutral';

export interface NPCMemory {
  summary: string;
  timestamp?: string;
  sentiment?: MemorySentiment;
  impact?: number;
  tags?: string[];
  sourceNpcId?: string;
}

export interface KnowledgeEntry {
  id?: string;
  title?: string;
  summary: string;
  timestamp?: string;
  source?: string;
  npcId?: string;
  faction?: Faction;
  tags?: string[];
  confidence?: number;
}

export type DayType = 'WEEKDAY' | 'WEEKEND';
export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface NPCSchedule {
  weekday: TimeSlot[];
  weekend: TimeSlot[];
  standingMeetings?: Array<{
    dayType: DayType;
    timeSlot: TimeSlot;
    description: string;
  }>;
  preferredChannel?: string;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  avatar: string; // FontAwesome icon class
  relationship: number; // 0-100 (0 = Enemy, 100 = Loyal Ally)
  mood: number; // 0-100 (short-term vibe, decays if ignored)
  trust: number; // 0-100 (longer-term stability)
  traits: string[]; // e.g. "Aggressive", "Paranoid"
  memories: NPCMemory[]; // Log of player interactions affecting them
  isRival: boolean;
  faction?: Faction;
  dialogueHistory: ChatMessage[]; // Chat specific to this NPC
  schedule?: NPCSchedule;
  lastContactTick?: number;
  goals?: string[];
  // New for social
  relationshipType?: NPCRelationshipType;
  maintenanceCost?: number; // Weekly cost
  dealPotential?: number; // 0-100
}

export type NPCRelationshipType = 'WORK' | 'PARTNER' | 'FAMILY' | 'WILDCARD';

// ==================== PERSONAL & FUND FINANCES SYSTEM ====================

// Lifestyle levels with escalating monthly costs
export type LifestyleLevel =
  | 'BROKE_ASSOCIATE'      // $2k/mo - studio apartment, ramen
  | 'COMFORTABLE'          // $5k/mo - decent 1BR, Uber sometimes
  | 'ASPIRATIONAL'         // $10k/mo - nice apartment, dating expenses
  | 'BALLER'               // $25k/mo - luxury apartment, bottle service
  | 'MASTER_OF_UNIVERSE';  // $50k/mo - penthouse, cars, art

// Fund-level finances (for the PE firm - Founder mode)
export interface FundFinances {
  totalCommitments: number;      // Total LP commitments
  calledCapital: number;         // Capital called from LPs
  dryPowder: number;             // Available for new investments
  deployedCapital: number;       // Invested in portfolio
  realizedProceeds: number;      // Cash from exits
  managementFeePool: number;     // Accumulated mgmt fees
  carryPool: number;             // Accumulated carried interest pool
}

// Personal finances (for the player)
export interface PersonalFinances {
  bankBalance: number;           // Current cash in bank
  totalEarnings: number;         // Lifetime earnings
  salaryYTD: number;             // Salary earned this year
  bonusYTD: number;              // Bonus earned this year
  carryReceived: number;         // Total carry received lifetime
  outstandingLoans: number;      // Personal debt
  loanInterestRate: number;      // Current loan rate
  monthlyBurn: number;           // Monthly lifestyle cost
  lifestyleLevel: LifestyleLevel;
}

// Deal allocation tracking for carry eligibility
export interface DealAllocation {
  companyId: number;
  role: 'LEAD' | 'SUPPORT' | 'OBSERVER';
  carryPoints: number;  // Personal carry allocation (basis points)
  hoursWorked: number;
}

// Family request types for family NPC events
export interface FamilyRequest {
  id: string;
  type: 'MONEY' | 'TIME' | 'ADVICE' | 'VISIT';
  amount?: number;               // For money requests
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  description: string;
  deadline?: number;             // Game week deadline
  consequenceIfIgnored: string;
}

// Extended NPC for family members
export interface FamilyMember extends NPC {
  relationshipType: 'FAMILY';
  familyRole: 'PARENT' | 'SIBLING' | 'PARTNER' | 'CHILD';
  financialNeed: number;         // 0-100, how much they need money
  emotionalNeed: number;         // 0-100, how much they need attention
  lastContactWeek: number;       // Game week of last contact
  pendingRequest?: FamilyRequest;
}

// Skill investment for personal development
export interface SkillInvestment {
  id: string;
  name: string;
  cost: number;
  timeWeeks: number;
  startedWeek?: number;          // When the investment was started
  completed: boolean;
}

// ==================== TIME & ACTION SYSTEM ====================

export type ActionType =
  | 'ANALYZE_DEAL'
  | 'SUBMIT_IOI'
  | 'BOARD_MEETING'
  | 'NETWORK_EVENT'
  | 'SCOUT_TALENT'
  | 'PORTFOLIO_REVIEW'
  | 'EXIT_PLANNING'
  | 'SKILL_TRAINING'
  | 'REST'
  | 'CONSULT_ADVISOR'
  | 'HANDLE_EVENT';

export const ACTION_COSTS: Record<ActionType, number> = {
  // Deal Actions
  ANALYZE_DEAL: 1,
  SUBMIT_IOI: 1.5,        // Significant - committing to a deal

  // Portfolio Management
  BOARD_MEETING: 2,       // Major action - takes significant time
  PORTFOLIO_REVIEW: 1,
  EXIT_PLANNING: 2,       // Major strategic decision

  // Career Development
  NETWORK_EVENT: 1,
  SCOUT_TALENT: 1,
  SKILL_TRAINING: 1.5,    // Investing in yourself takes effort

  // Advisory
  CONSULT_ADVISOR: 1,     // Advice has opportunity cost

  // Events
  HANDLE_EVENT: 1,

  // Rest
  REST: 1,                // Even resting uses your time
};

export interface GameTime {
  week: number;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  actionsRemaining: number;
  maxActions: number;
  isNightGrinder: boolean;
  actionsUsedThisWeek: ActionType[];
}

export interface PlayerStats {
  level: PlayerLevel;
  cash: number;  // Legacy: now derived from personalFinances.bankBalance
  reputation: number;
  factionReputation: FactionReputation;
  stress: number;
  energy: number;
  analystRating: number;
  financialEngineering: number;
  ethics: number; // 0 (Sociopath) to 100 (Saint)
  auditRisk: number; // 0 (Safe) to 100 (Indicted)
  score: number;
  portfolio: PortfolioCompany[];
  playerFlags: Record<string, boolean>;
  playedScenarioIds: number[];
  gameYear: number;
  gameMonth: number;
  currentDayType: DayType;
  currentTimeSlot: TimeSlot;
  timeCursor: number;
  aum: number; // Assets Under Management (Founder Mode)
  employees: string[]; // List of hired NPC IDs (Founder Mode)
  health: number; // 0-100
  dependency: number; // 0-100
  tutorialStep: number; // 0=Done, 1..N=Active Step
  loanBalance: number; // Legacy: now derived from personalFinances.outstandingLoans
  loanRate: number; // Legacy: now derived from personalFinances.loanInterestRate
  knowledgeLog: KnowledgeEntry[];
  knowledgeFlags: string[];
  // Achievement System
  unlockedAchievements: string[];
  // Industry Specialization
  sectorExpertise: SectorExpertise[];
  primarySector?: IndustrySector;
  // Exit Tracking
  completedExits: ExitResult[];
  totalRealizedGains: number;

  // NEW: Personal & Fund Finances System
  personalFinances: PersonalFinances;
  fundFinances: FundFinances | null;  // null for non-Founders, populated for Founder
  dealAllocations: DealAllocation[];  // Deals player is staffed on
  carryEligibleDeals: number[];       // Portfolio company IDs player has carry in
  activeSkillInvestments: SkillInvestment[];  // Skills currently being learned

  // NEW: Time & Action System
  gameTime: GameTime;
}

export interface StatChanges {
  cash?: number;
  reputation?: number;
  stress?: number;
  energy?: number;
  analystRating?: number;
  level?: PlayerLevel;
  financialEngineering?: number;
  ethics?: number;
  auditRisk?: number;
  score?: number;
  aum?: number; // New for Founder Mode
  advanceDays?: number; // Advance game time by N days
  advanceTimeSlots?: number; // Advance time slots within current day
  addPortfolioCompany?: Omit<PortfolioCompany, 'acquisitionDate' | 'eventHistory'>;
  portfolio?: PortfolioCompany[];
  portfolioImpact?: PortfolioImpact;
  dealModification?: Partial<Pick<PortfolioCompany, 'debt' | 'investmentCost' | 'ownershipPercentage' | 'currentValuation'>>;
  setsFlags?: string[];
  modifyCompany?: {
    id: number;
    updates: Partial<PortfolioCompany>;
  };
  npcRelationshipUpdate?: {
    npcId: string;
    change: number;
    trustChange?: number;
    moodChange?: number;
    memory?: NPCMemory | string;
    broadcastTo?: Array<'LP' | 'RIVAL'>;
  };
  factionReputation?: Partial<FactionReputation>;
  health?: number;
  dependency?: number;
  removeNpcId?: string;
  playedScenarioIds?: number[];
  employees?: string[];
  loanBalanceChange?: number; // Positive to add debt, negative to repay
  loanRate?: number; // Update the active loan's interest rate
  knowledgeGain?: Array<KnowledgeEntry | string>;
  knowledgeFlags?: string[];
  // New: Achievement System
  unlockAchievement?: string;
  // New: Industry Specialization
  sectorExperienceGain?: { sector: IndustrySector; amount: number };
  setPrimarySector?: IndustrySector;
  // Exit Tracking
  addExitResult?: ExitResult;

  // NEW: Personal Finance Changes
  personalCash?: number;          // Direct change to personal bank balance
  lifestyleLevel?: LifestyleLevel; // Change lifestyle tier
  carryDistribution?: number;      // Carry payout from exit
  dealAllocation?: DealAllocation; // Add deal allocation
  skillInvestment?: string;        // Start a skill investment by ID
  familyRequestResponse?: {
    npcId: string;
    accepted: boolean;
    amount?: number;
  };
  // Multiple NPC relationship updates (for scenarios affecting multiple NPCs)
  npcRelationshipUpdate2?: {
    npcId: string;
    change: number;
    trustChange?: number;
    moodChange?: number;
    memory?: NPCMemory | string;
  };
}

export interface SkillCheck {
  skill: 'financialEngineering';
  threshold: number;
  bonus: {
    description: string;
    statChanges: StatChanges;
  };
}

export interface Choice {
  text: string;
  description?: string;
  sarcasticGuidance?: string;
  outcome: {
    description:string;
    statChanges: StatChanges;
  };
  skillCheck?: SkillCheck;
}

export enum DealType {
  LBO = 'Leveraged Buyout',
  GROWTH_EQUITY = 'Growth Equity',
  VENTURE_CAPITAL = 'Venture Capital',
}

export interface DueDiligencePhase {
  description: string;
  choices: Choice[];
}

export interface FinancingPhase {
    description: string;
    choices: Choice[];
}

export interface StructureChoice {
  type: DealType;
  description: string;
  dueDiligence?: DueDiligencePhase;
  financingPhase?: FinancingPhase;
  followUpChoices: Choice[];
}

export interface Scenario {
  id: number;
  title: string;
  description: string;
  choices?: Choice[];
  structureOptions?: StructureChoice[];
  isRivalEvent?: boolean;
  requiresPortfolio?: boolean;
  /** Optional gating by portfolio depth or value */
  minPortfolioCompanies?: number;
  minPortfolioValue?: number;
  requiredFlags?: string[];
  blockedByFlags?: string[];
  minReputation?: number;
  maxReputation?: number;
  allowedVolatility?: MarketVolatility[];
  dayTypeGate?: { dayType?: DayType; timeSlots?: TimeSlot[] };
  factionRequirements?: Array<{ faction: Faction; min?: number; max?: number }>;
  minStress?: number;
  minCash?: number;
  npcRelationshipRequirements?: Array<{ npcId: string; minRelationship?: number; minTrust?: number }>;
  priorityWeight?: number;
  triggerTags?: string[];
}

export interface NewsEvent {
  id: number;
  headline: string;
  effect: {
    description: string;
    statChanges: StatChanges;
  } | null;
}

export interface ChatMessage {
  sender: 'player' | 'advisor' | 'npc' | 'system';
  senderName?: string;
  text: string;
}

export type Difficulty = 'Easy' | 'Normal' | 'Hard';

export interface DifficultySettings {
  name: string;
  description: string;
  initialStats: PlayerStats;
  modifiers: {
    positive: number;
    negative: number;
  };
}

export interface LifeAction {
  id: string;
  text: string;
  icon: string;
  apCost: number;      // Action Point cost (1, 1.5, or 2)
  outcome: {
    description: string;
    statChanges: StatChanges;
  };
}

export type GamePhase = 'INTRO' | 'SCENARIO' | 'LIFE_MANAGEMENT' | 'PORTFOLIO' | 'GAME_OVER' | 'FOUNDER_MODE' | 'VICTORY' | 'PRISON' | 'ALONE';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export type QuizCategory = 'MODELING' | 'DEAL_STRUCTURE' | 'DUE_DILIGENCE' | 'GENERAL';

export interface QuizQuestion {
  id: number;
  category: QuizCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Context Interface
export interface GameContextType {
  user: UserProfile | null;
  playerStats: PlayerStats | null;
  npcs: NPC[];
  activeScenario: Scenario | null;
  gamePhase: GamePhase;
  difficulty: Difficulty | null;
  marketVolatility: MarketVolatility;
  tutorialStep: number;
  actionLog: string[];
  // NEW: Living World State
  activeWarnings: Warning[];
  activeDrama: NPCDrama | null;
  activeCompanyEvent: CompanyActiveEvent | null;
  eventQueue: CompanyActiveEvent[];
  pendingDecision: { event: CompanyActiveEvent | NPCDrama; awaitingAdvisorResponse: boolean } | null;
  setGamePhase: (phase: GamePhase) => void;
  updatePlayerStats: (changes: StatChanges) => void;
  handleActionOutcome: (outcome: { description: string; statChanges: StatChanges }, title: string) => void;
  sendNpcMessage: (npcId: string, message: string, sender?: 'player' | 'npc' | 'system', senderName?: string) => void;
  addLogEntry: (message: string) => void;
  setTutorialStep: (step: number) => void;
  advanceTime: () => void;
  resetGame: () => void;
  // NEW: Living World Methods
  dismissWarning: (id: string) => void;
  handleWarningAction: (warning: Warning) => void;
  setActiveDrama: (drama: NPCDrama | null) => void;
  setActiveCompanyEvent: (event: CompanyActiveEvent | null) => void;
  handleEventDecision: (eventId: string, optionId: string) => void;
  // NEW: Time & Action System Methods
  useAction: (costOrActionType: number | ActionType) => boolean;
  endWeek: () => void;
  toggleNightGrinder: () => void;
}

// ==================== COMPETITOR FUNDS SYSTEM ====================

export type RivalStrategy = 'AGGRESSIVE' | 'CONSERVATIVE' | 'OPPORTUNISTIC' | 'PREDATORY';

export interface RivalFund {
  id: string;
  name: string;
  managingPartner: string;
  npcId: string;
  strategy: RivalStrategy;
  aum: number;
  dryPowder: number;
  portfolio: RivalPortfolioCo[];
  winStreak: number;
  totalDeals: number;
  reputation: number;
  aggressionLevel: number;
  riskTolerance: number;
  vendetta?: number;
  lastActionTick?: number;
}

export interface RivalPortfolioCo {
  name: string;
  dealType: DealType;
  acquisitionPrice: number;
  currentValue: number;
  acquiredMonth: number;
  acquiredYear: number;
}

export interface CompetitiveDeal {
  id: number;
  companyName: string;
  sector: string;
  description: string;
  askingPrice: number;
  fairValue: number;
  dealType: DealType;
  metrics: {
    revenue: number;
    ebitda: number;
    growth: number;
    debt: number;
  };
  seller: string;
  deadline: number;
  interestedRivals: string[];
  isHot: boolean;
  hiddenRisk?: string;
  hiddenUpside?: string;
}

export interface AuctionState {
  deal: CompetitiveDeal;
  currentBid: number;
  currentLeader: string;
  bids: AuctionBid[];
  round: number;
  maxRounds: number;
  isComplete: boolean;
  winner?: string;
  finalPrice?: number;
}

export interface AuctionBid {
  bidderId: string;
  bidderName: string;
  amount: number;
  round: number;
  timestamp: number;
  wasBluff?: boolean;
}

// ==================== ACHIEVEMENT SYSTEM ====================

export type AchievementCategory = 'CAREER' | 'DEALS' | 'RELATIONSHIPS' | 'ETHICS' | 'WEALTH' | 'SPECIAL';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  isSecret?: boolean;
  unlockedAt?: string; // ISO timestamp when unlocked
}

export interface AchievementDefinition extends Omit<Achievement, 'unlockedAt'> {
  condition: (stats: PlayerStats, npcs: NPC[], context: AchievementContext) => boolean;
  reward?: StatChanges;
}

export interface AchievementContext {
  totalDealsCompleted: number;
  totalExits: number;
  highestValuation: number;
  gamePhase: GamePhase;
  marketVolatility: MarketVolatility;
}

// ==================== INDUSTRY SPECIALIZATION ====================

export type IndustrySector = 'TECH' | 'HEALTHCARE' | 'INDUSTRIALS' | 'CONSUMER' | 'ENERGY' | 'FINANCIAL_SERVICES';

export interface SectorExpertise {
  sector: IndustrySector;
  level: number; // 0-100
  dealsCompleted: number;
}

// ==================== EXIT STRATEGY SYSTEM ====================

export type ExitType = 'IPO' | 'STRATEGIC_SALE' | 'SECONDARY_SALE' | 'DIVIDEND_RECAP' | 'LIQUIDATION';

export interface ExitOption {
  type: ExitType;
  name: string;
  description: string;
  icon: string;
  requirements: ExitRequirements;
  baseMultiple: number; // Multiple of investment cost
  varianceRange: [number, number]; // Min/max variance from base
  timeToClose: number; // Months
  risks: string[];
}

export interface ExitRequirements {
  minOwnershipMonths?: number;
  minValuation?: number;
  minEbitda?: number;
  minRevenueGrowth?: number;
  minReputation?: number;
  requiredMarketConditions?: MarketVolatility[];
  minFinancialEngineering?: number;
}

export interface ExitResult {
  exitType: ExitType;
  companyName: string;
  investmentCost: number;
  exitValue: number;
  multiple: number;
  profit: number;
  holdingPeriodMonths: number;
}

// ==================== FINANCIAL MODELING CHALLENGES ====================

export type ModelingChallengeType = 'IRR_CALCULATION' | 'LEVERAGE_ANALYSIS' | 'VALUATION' | 'SENSITIVITY' | 'DEBT_CAPACITY';

export interface ModelingChallenge {
  id: string;
  type: ModelingChallengeType;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question: string;
  context: string;
  data: Record<string, number>;
  correctAnswer: number;
  tolerance: number; // Percentage tolerance for answer (e.g., 0.05 = 5%)
  explanation: string;
  timeLimit: number; // Seconds
  reward: StatChanges;
  penalty: StatChanges;
}

// ==================== ADVANCED AI SYSTEM ====================

export type AIPersonality = 'CALCULATING' | 'AGGRESSIVE' | 'OPPORTUNISTIC' | 'PARANOID' | 'UNPREDICTABLE';
export type VendettaPhase = 'COLD' | 'WARMING' | 'HOT' | 'BLOOD_FEUD' | 'TOTAL_WAR';
export type TacticalMove = 'POACH' | 'RUMOR' | 'COALITION' | 'SABOTAGE' | 'MARKET_MANIPULATION' | 'PSYCHOLOGICAL_WARFARE' | 'SURPRISE_BID' | 'STRATEGIC_RETREAT';

export interface PlayerPatternData {
  averageBidAggressiveness: number;
  preferredSectors: string[];
  bidDropoutThreshold: number;
  riskTolerance: number;
  responseToBluffs: 'FOLDS' | 'CALLS' | 'RAISES';
  dealClosingRate: number;
  weaknesses: string[];
  lastUpdated: number;
}

export interface AIState {
  playerPatterns: Partial<PlayerPatternData>;
  rivalMindsets: Record<string, RivalMindsetState>;
  coalitionState: CoalitionStateData | null;
  lastAnalysisUpdate: number;
  dealsWonByPlayer: number[];
  dealsLostByPlayer: number[];
  playerBidHistory: number[];
}

export interface RivalMindsetState {
  fundId: string;
  personality: AIPersonality;
  currentMood: 'CONFIDENT' | 'CAUTIOUS' | 'DESPERATE' | 'VENGEFUL' | 'OPPORTUNISTIC';
  fearLevel: number;
  respectLevel: number;
  vendettaPhase: VendettaPhase;
  recentLosses: number;
  recentWins: number;
  isInCoalition: boolean;
  lastSurpriseMove: number;
}

export interface CoalitionStateData {
  isActive: boolean;
  members: string[];
  target: 'PLAYER' | string;
  expiresAtTick: number;
  strength: number;
}

export interface AITacticalDecision {
  action: TacticalMove;
  target?: string;
  intensity: number;
  reasoning: string;
  successChance: number;
  riskLevel: number;
}

export interface AuctionAIBehavior {
  bid: number;
  isBluff: boolean;
  dropOut: boolean;
  taunt?: string;
  surpriseBid?: boolean;
}
