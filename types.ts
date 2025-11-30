
export enum PlayerLevel {
  ASSOCIATE = 'Associate',
  SENIOR_ASSOCIATE = 'Senior Associate',
  VICE_PRESIDENT = 'Vice President',
  PRINCIPAL = 'Principal',
  PARTNER = 'Partner',
  FOUNDER = 'Founder',
}

export type MarketVolatility = 'NORMAL' | 'BULL_RUN' | 'CREDIT_CRUNCH' | 'PANIC';

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

export interface NPC {
  id: string;
  name: string;
  role: string;
  avatar: string; // FontAwesome icon class
  relationship: number; // 0-100 (0 = Enemy, 100 = Loyal Ally)
  mood: number; // 0-100 (short-term vibe, decays if ignored)
  trust: number; // 0-100 (longer-term stability)
  traits: string[]; // e.g. "Aggressive", "Paranoid"
  memories: string[]; // Log of player interactions affecting them
  isRival: boolean;
  dialogueHistory: ChatMessage[]; // Chat specific to this NPC
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
  aum: number; // Assets Under Management (Founder Mode)
  employees: string[]; // List of hired NPC IDs (Founder Mode)
  health: number; // 0-100
  dependency: number; // 0-100
  tutorialStep: number; // 0=Done, 1..N=Active Step
  loanBalance: number; // Outstanding debt balance
  loanRate: number; // Annualized interest rate (e.g. 0.24 = 24%)
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
    memory: string;
  };
  health?: number;
  dependency?: number;
  removeNpcId?: string;
  playedScenarioIds?: number[];
  employees?: string[];
  loanBalanceChange?: number; // Positive to add debt, negative to repay
  loanRate?: number; // Update the active loan's interest rate
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
  requiredFlags?: string[];
  blockedByFlags?: string[];
  minReputation?: number;
  maxReputation?: number;
  minStress?: number;
  minCash?: number;
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
