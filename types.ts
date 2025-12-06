
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
  hasBoardCrisis?: boolean; // New for Activist Investor
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

export interface PlayerStats {
  level: PlayerLevel;
  cash: number;
  reputation: number;
  factionReputation: FactionReputation;
  stress: number;
  energy: number;
  analystRating: number;
  financialEngineering: number;
  ethics: number; // New: 0 (Sociopath) to 100 (Saint)
  auditRisk: number; // New: 0 (Safe) to 100 (Indicted)
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
  loanBalance: number; // Outstanding debt balance
  loanRate: number; // Annualized interest rate (e.g. 0.24 = 24%)
  knowledgeLog: KnowledgeEntry[];
  knowledgeFlags: string[];
  // New: Achievement System
  unlockedAchievements: string[]; // IDs of unlocked achievements
  // New: Industry Specialization
  sectorExpertise: SectorExpertise[];
  primarySector?: IndustrySector;
  // New: Exit Tracking
  completedExits: ExitResult[];
  totalRealizedGains: number;
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
  // New: Exit Tracking
  addExitResult?: ExitResult;
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
  setGamePhase: (phase: GamePhase) => void;
  updatePlayerStats: (changes: StatChanges) => void;
  handleActionOutcome: (outcome: { description: string; statChanges: StatChanges }, title: string) => void;
  sendNpcMessage: (npcId: string, message: string, sender?: 'player' | 'npc' | 'system', senderName?: string) => void;
  addLogEntry: (message: string) => void;
  setTutorialStep: (step: number) => void;
  advanceTime: () => void;
  resetGame: () => void;
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
