
import type { PlayerStats, Scenario, NewsEvent, DifficultySettings, Difficulty, LifeAction, StructureChoice, DueDiligencePhase, PortfolioAction, PortfolioCompany, FinancingPhase, NPC, QuizQuestion, MarketVolatility, RivalFund, CompetitiveDeal, RivalStrategy, FactionReputation, TimeSlot } from './types';
import { PlayerLevel, DealType } from './types';

export const DEFAULT_FACTION_REPUTATION: FactionReputation = {
  MANAGING_DIRECTORS: 45,
  ANALYSTS: 55,
  REGULATORS: 50,
  LIMITED_PARTNERS: 40,
  RIVALS: 30,
};

// The "Rookie" Profile (Default State)
// Starting cash is intentionally low - you're a new associate living paycheck to paycheck
// This creates tension where every expense matters and players must prioritize
const NORMAL_STATS: PlayerStats = {
  level: PlayerLevel.ASSOCIATE,
  cash: 1500,              // Reduced from 5000 - tight budget, first paycheck comes with advanceTime
  reputation: 10,
  factionReputation: { ...DEFAULT_FACTION_REPUTATION },
  stress: 0,
  energy: 90,
  analystRating: 50,
  financialEngineering: 10,
  ethics: 60,
  auditRisk: 0,
  score: 0,
  portfolio: [],
  playerFlags: {},
  playedScenarioIds: [],
  gameYear: 1,
  gameMonth: 1,
  currentDayType: 'WEEKDAY',
  currentTimeSlot: 'MORNING',
  timeCursor: 0,
  aum: 0,
  employees: [],
  health: 100,
  dependency: 0,
  tutorialStep: 0,
  loanBalance: 0,
  loanRate: 0,
  knowledgeLog: [],
  knowledgeFlags: [],
  // New: Achievement System
  unlockedAchievements: [],
  // New: Industry Specialization
  sectorExpertise: [],
  primarySector: undefined,
  // New: Exit Tracking
  completedExits: [],
  totalRealizedGains: 0,
};

export const INITIAL_NPCS: NPC[] = [
  {
    id: 'chad',
    name: 'Chad (MD)',
    role: 'Managing Director',
    avatar: 'fa-user-tie',
    relationship: 50,
    mood: 55,
    trust: 45,
    traits: ['Aggressive', 'Results-Oriented', 'Impatient'],
    memories: [],
    isRival: false,
    faction: 'MANAGING_DIRECTORS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Chad (MD)', text: "Don't screw this up, rookie. I need this bonus." }],
    schedule: {
      weekday: ['MORNING', 'AFTERNOON'],
      weekend: ['MORNING'],
      preferredChannel: 'desk standup',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'MORNING', description: 'Pipeline standup' },
      ],
    },
    lastContactTick: 0,
    goals: ['Close a trophy deal this quarter', 'Protect my bonus pool'],
  },
  {
    id: 'hunter',
    name: 'Hunter',
    role: 'Rival VP',
    avatar: 'fa-user-ninja',
    relationship: 20,
    mood: 25,
    trust: 15,
    traits: ['Manipulative', 'Competitive', 'Shark'],
    memories: [],
    isRival: true,
    faction: 'RIVALS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Hunter', text: "Cute deal. Did you even check the Liquidation Preferences? or are you just donating money?" }],
    schedule: {
      weekday: ['AFTERNOON', 'EVENING'],
      weekend: ['EVENING'],
      preferredChannel: 'late-night texts',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'EVENING', description: 'Shadow auction updates' },
      ],
    },
    lastContactTick: 0,
    goals: ['Steal your deals', 'Win auctions on the cheap'],
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Senior Analyst',
    avatar: 'fa-glasses',
    relationship: 60,
    mood: 65,
    trust: 60,
    traits: ['Overworked', 'Detail-Oriented', 'Anxious'],
    memories: [],
    isRival: false,
    faction: 'ANALYSTS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Sarah', text: "I haven't slept in 40 hours and the Cash Flow Statement is off by $1,000. It's probably a circular reference." }],
    schedule: {
      weekday: ['AFTERNOON', 'EVENING'],
      weekend: ['AFTERNOON'],
      preferredChannel: 'data room pings',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'AFTERNOON', description: 'Model scrub' },
      ],
    },
    lastContactTick: 0,
    goals: ['Keep the model clean', 'Get credit for solid diligence'],
  },
  {
    id: 'regulator',
    name: 'Agent Smith',
    role: 'SEC Regulator',
    avatar: 'fa-building-columns',
    relationship: 50,
    mood: 45,
    trust: 50,
    traits: ['Suspicious', 'Bureaucratic'],
    memories: [],
    isRival: false,
    faction: 'REGULATORS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Agent Smith', text: "We are monitoring market activity closely." }],
    schedule: {
      weekday: ['MORNING'],
      weekend: [],
      preferredChannel: 'formal memos',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'MORNING', description: 'Compliance check' },
      ],
    },
    lastContactTick: 0,
    goals: ['Lower your audit risk', 'Spot sloppy disclosures early'],
  },
  {
    id: 'lp_swiss',
    name: 'Hans Gruber',
    role: 'Limited Partner (Swiss Bank)',
    avatar: 'fa-landmark',
    relationship: 40,
    mood: 35,
    trust: 45,
    traits: ['Risk-Averse', 'Conservative', 'Traditional'],
    memories: [],
    isRival: false,
    faction: 'LIMITED_PARTNERS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Hans Gruber', text: "We prefer capital preservation over your... 'American' growth tactics. Show me your IP Roadmap." }],
    schedule: {
      weekday: ['MORNING'],
      weekend: ['MORNING'],
      preferredChannel: 'scheduled calls',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'MORNING', description: 'Quarterly NAV review' },
      ],
    },
    lastContactTick: 0,
    goals: ['Allocate to disciplined managers', 'Avoid headline risk'],
  },
  {
    id: 'lp_oil',
    name: 'Sheikh Al-Maktoum',
    role: 'Limited Partner (SWF)',
    avatar: 'fa-coins',
    relationship: 30,
    mood: 35,
    trust: 25,
    traits: ['Aggressive', 'Visionary', 'Impatient'],
    memories: [],
    isRival: false,
    faction: 'LIMITED_PARTNERS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Sheikh Al-Maktoum', text: "We need alpha, not beta. Show me something bold." }],
    schedule: {
      weekday: ['AFTERNOON'],
      weekend: ['AFTERNOON', 'EVENING'],
      preferredChannel: 'deal dinners',
      standingMeetings: [
        { dayType: 'WEEKEND', timeSlot: 'EVENING', description: 'Deal dinner debrief' },
      ],
    },
    lastContactTick: 0,
    goals: ['Swing for outsize returns', 'Move quickly on bold ideas'],
  }
];

export const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultySettings> = {
  Easy: {
    name: 'Trust Fund Baby',
    description: "Your father is the Chairman of the Board. You start with a massive safety net, a Rolodex of contacts, and an innate sense of entitlement. It's hard to fail when you were born on third base.",
    initialStats: {
      ...NORMAL_STATS,
      cash: 50000,           // Reduced but still comfortable - daddy's allowance
      reputation: 20,
      stress: 0,
      financialEngineering: 20,
      portfolio: [],
    },
    modifiers: {
      positive: 1.2,
      negative: 0.8,
    },
  },
  Normal: {
    name: 'MBA Grad',
    description: "You did everything right: top school, top grades, top internship. Now you're just another shark in a tank full of them. You have potential, but no protection. Every dollar counts.",
    initialStats: {
        ...NORMAL_STATS,
        // Starting with $1,500 - can barely afford golf with partners
        // First salary payment comes with first advanceTime
        portfolio: [],
    },
    modifiers: {
      positive: 1.0,
      negative: 1.0,
    },
  },
  Hard: {
    name: 'State School Striver',
    description: "You clawed your way here with pure grit and a chip on your shoulder the size of a tombstone. Everyone is waiting for you to fail so they can say 'I told you so'. One mistake and you're out.",
    initialStats: {
      ...NORMAL_STATS,
      cash: 500,             // Reduced from 25000 - you're broke and desperate
      stress: 35,
      analystRating: 40,
      financialEngineering: 5,
      portfolio: [],
    },
    modifiers: {
      positive: 0.8,
      negative: 1.2,
    },
  },
};

export const LEVEL_RANKS: Record<PlayerLevel, number> = {
  [PlayerLevel.ASSOCIATE]: 0,
  [PlayerLevel.SENIOR_ASSOCIATE]: 1,
  [PlayerLevel.VICE_PRESIDENT]: 2,
  [PlayerLevel.PRINCIPAL]: 3,
  [PlayerLevel.PARTNER]: 4,
  [PlayerLevel.FOUNDER]: 5,
};

// ==================== COMPENSATION SYSTEM ====================
// Progressive cash system: salary, bonus, and carry by level

export interface CompensationTier {
  weeklySalary: number;       // Weekly base salary (after taxes)
  bonusMultiplier: number;    // Multiplier on base for annual bonus (0 = no bonus)
  carryPercentage: number;    // Percentage of exit profits (0 = no carry)
  canAccessLoan: boolean;     // Whether player can take bridge loans
  loanLimit: number;          // Maximum loan amount available
}

export const COMPENSATION_BY_LEVEL: Record<PlayerLevel, CompensationTier> = {
  [PlayerLevel.ASSOCIATE]: {
    weeklySalary: 2000,       // ~$100k/year after taxes - tight budget
    bonusMultiplier: 0.5,     // 50% of base as potential bonus
    carryPercentage: 0,       // No carry at associate level
    canAccessLoan: false,     // No loans - you're too junior
    loanLimit: 0,
  },
  [PlayerLevel.SENIOR_ASSOCIATE]: {
    weeklySalary: 3000,       // ~$150k/year
    bonusMultiplier: 0.75,    // 75% of base as potential bonus
    carryPercentage: 0,       // Still no carry
    canAccessLoan: true,      // Can now access emergency loans
    loanLimit: 25000,
  },
  [PlayerLevel.VICE_PRESIDENT]: {
    weeklySalary: 4500,       // ~$225k/year
    bonusMultiplier: 1.0,     // 100% of base as potential bonus
    carryPercentage: 0.5,     // 0.5% carry on exits
    canAccessLoan: true,
    loanLimit: 50000,
  },
  [PlayerLevel.PRINCIPAL]: {
    weeklySalary: 6000,       // ~$300k/year
    bonusMultiplier: 1.5,     // 150% of base as potential bonus
    carryPercentage: 2,       // 2% carry on exits
    canAccessLoan: true,
    loanLimit: 100000,
  },
  [PlayerLevel.PARTNER]: {
    weeklySalary: 10000,      // ~$500k/year
    bonusMultiplier: 3.0,     // 300% of base as potential bonus
    carryPercentage: 10,      // 10% carry - this is where the money is
    canAccessLoan: true,
    loanLimit: 500000,
  },
  [PlayerLevel.FOUNDER]: {
    weeklySalary: 0,          // No salary - you're the owner
    bonusMultiplier: 0,       // No bonus - you take distributions
    carryPercentage: 20,      // 20% carry on all fund exits
    canAccessLoan: true,
    loanLimit: 1000000,
  },
};

// Bonus calculation factors
export const BONUS_FACTORS = {
  minReputationForBonus: 30,      // Need at least 30 reputation to get any bonus
  fullBonusReputation: 80,        // Need 80+ reputation for full bonus
  portfolioPerformanceWeight: 0.4, // 40% of bonus based on portfolio performance
  reputationWeight: 0.3,           // 30% based on reputation
  dealsClosedWeight: 0.3,          // 30% based on deals closed this year
};

// Activity cost thresholds - what feels "expensive" at each level
export const AFFORDABILITY_THRESHOLDS: Record<PlayerLevel, number> = {
  [PlayerLevel.ASSOCIATE]: 200,        // $200 feels expensive
  [PlayerLevel.SENIOR_ASSOCIATE]: 500, // $500 feels expensive
  [PlayerLevel.VICE_PRESIDENT]: 1000,
  [PlayerLevel.PRINCIPAL]: 2000,
  [PlayerLevel.PARTNER]: 5000,
  [PlayerLevel.FOUNDER]: 10000,
};

// ... [Keep existing DueDiligence and Financing phases] ...
const dueDiligencePhaseLBO: DueDiligencePhase = {
  description: "DUE DILIGENCE (LBO): The numbers need to be bulletproof. Where do you focus your limited time?",
  choices: [
    {
      text: "Stress test the debt covenants.",
      outcome: {
        description: "You find that a minor dip in revenue would trigger a default. You renegotiate terms, earning a nod of respect from the debt team. They still think you're a child in a suit.",
        statChanges: { reputation: +5, analystRating: +5, score: +200 },
      },
    },
    {
      text: "Dig for 'synergies' (i.e., people to fire).",
      outcome: {
        description: "You identify millions in 'redundancies'. It's cold, but it makes the model sing. Your sociopathic tendencies are noted as a positive trait for this career path.",
        statChanges: { stress: +5, analystRating: +10, score: +150, ethics: -10 },
      },
    },
    {
      text: "Conduct 'off-channel' reference checks on the management team.",
      outcome: {
        description: "Your discreet inquiries reveal the CEO is a visionary held back by a board of fossils. Replacing them could unlock massive value. You've found the real alpha.",
        statChanges: { reputation: +10, analystRating: +5, score: +300 },
      },
    },
    {
      text: "Analyze the customer list for concentration risk.",
      outcome: {
        description: "You discover 80% of revenue comes from a single client whose contract is up for renewal in six months. You've just saved the fund from buying a ticking time bomb. Chad gives you a rare, almost perceptible nod of approval.",
        statChanges: { reputation: +15, stress: -5, score: +500 },
      },
    },
    {
      text: "Investigate supply chain dependencies.",
      outcome: {
        description: "You find a dangerous reliance on a single supplier in a politically unstable region. You force the company to diversify its sourcing before closing. A boring, unsexy move that saves the company two years later.",
        statChanges: { analystRating: +10, stress: -5, score: +350 },
      },
    },
  ],
};

const financingPhaseLBO: FinancingPhase = {
  description: "FINANCING: The deal lives or dies by the debt. How do you structure the capital stack? Your choice will modify the final deal terms.",
  choices: [
    {
      text: "Max out on cheap, senior debt.",
      description: "High leverage, low cost of capital, but very restrictive covenants. This is the classic, high-risk, high-reward PE play.",
      sarcasticGuidance: "Lever up to the eyeballs. What could possibly go wrong? It's not your money anyway.",
      outcome: {
        description: "You convince the banks to fund the majority of the deal. It's cheap, but the covenants are tight as a drum. One misstep and they'll own the company. This increases leverage but also risk.",
        statChanges: { financialEngineering: +5, stress: +10, dealModification: { debt: 95000000, currentValuation: 58000000 } }
      },
      skillCheck: {
        skill: 'financialEngineering',
        threshold: 30,
        bonus: {
          description: "Your sharp skills allow you to negotiate a bullet payment, giving the company more breathing room. The bankers are sweating.",
          statChanges: { financialEngineering: +5, stress: -5 }
        }
      }
    },
    {
      text: "Bring in a mezzanine partner.",
      description: "Use expensive, flexible debt with equity kickers. Less restrictive than senior debt, but it dilutes your upside.",
      sarcasticGuidance: "Expensive debt with a friend attached. They'll be very helpful... right up until they try to take the company from you.",
      outcome: {
        description: "You bring in a mezzanine fund for a slice of expensive debt with equity kickers. It gives you more flexibility but eats into your returns and adds a vulture to your cap table.",
        statChanges: { reputation: +5, dealModification: { debt: 70000000, ownershipPercentage: 60, currentValuation: 56000000 } }
      }
    },
    {
      text: "Bring in an equity partner.",
      description: "Syndicate the deal with another PE firm. It lowers your risk and cash contribution, but you have to share control and the upside.",
      sarcasticGuidance: "Share the blame if it goes wrong, and the credit if it goes right. A true politician's move.",
      outcome: {
        description: "You can't get the debt numbers to work, so you syndicate the deal, bringing in another PE firm. You get the deal done, but you have to share the upside and the credit. Your firm is seen as a junior partner.",
        statChanges: { reputation: -5, dealModification: { investmentCost: 40000000, ownershipPercentage: 45 } }
      }
    }
  ]
};

const dueDiligencePhaseGrowth: DueDiligencePhase = {
  description: "DUE DILIGENCE (Growth Equity): The story is great, but is it real? How do you verify the hype?",
  choices: [
    {
      text: "Interview key customers.",
      outcome: {
        description: "You discover the customers love the product but have no intention of paying more. The growth story is weaker than you thought. This valuable intel prevents a bad deal.",
        statChanges: { reputation: +10, analystRating: +5, score: +350 },
      },
    },
    {
      text: "Analyze competitor tech.",
      outcome: {
        description: "You realize their 'proprietary tech' is just an off-the-shelf software with a new logo. You've uncovered a major risk, saving the firm from embarrassment.",
        statChanges: { reputation: +5, stress: +5, score: +200 },
      },
    },
    {
      text: "Audit their operational scalability.",
      outcome: {
        description: "Their 'scalable infrastructure' is one overworked engineer and a mountain of technical debt. Pouring money on this fire would just make it bigger. You recommend a smaller investment tied to key hiring milestones.",
        statChanges: { analystRating: +10, reputation: +5, score: +400 },
      },
    },
  ],
};

const dueDiligencePhaseVC: DueDiligencePhase = {
  description: "DUE DILIGENCE (Venture): Forget profits. Is the founder a 'visionary' or just delusional? How do you find out?",
  choices: [
    {
      text: "Check the founder's background.",
      outcome: {
        description: "Turns out the founder's last three 'unicorn' startups were actually ponies that went to the glue factory. You avoid a charismatic fraud.",
        statChanges: { reputation: +10, score: +300 },
      },
    },
    {
      text: "Talk to ex-employees.",
      outcome: {
        description: "You hear horror stories of a toxic culture and a leader who thinks 'strategy' is a new flavor of kombucha. You dodge a bullet disguised as a messiah.",
        statChanges: { stress: -5, reputation: +5, score: +200, ethics: +5 },
      },
    },
     {
      text: "Scrutinize the cap table for red flags.",
      outcome: {
        description: "The cap table is a mess of dead equity and toxic preference stacks. The founder gave away 40% of the company for seed money. You've identified a major roadblock for future funding rounds.",
        statChanges: { analystRating: +10, stress: +5, score: +350 },
      },
    },
    {
        text: "Pressure test the Total Addressable Market (TAM) claims.",
        outcome: {
            description: "Their 'trillion-dollar market' includes every human with a pulse. Your bottoms-up analysis reveals a realistic market size that's a fraction of their claim. You save the fund from investing in a PowerPoint fantasy.",
            statChanges: { reputation: +10, analystRating: +15, score: +500 }
        }
    }
  ],
};

const financingPhaseVC: FinancingPhase = {
  description: "TERM SHEET: Even in VC, terms matter. How do you structure the investment?",
  choices: [
    {
      text: "SAFE Note (Founder Friendly).",
      description: "Simple Agreement for Future Equity. Fast, cheap, no control.",
      sarcasticGuidance: "Just give them the money and hope. It's the Valley way.",
      outcome: {
        description: "You sign the SAFE. The founder loves you because you asked zero questions. You have no board seat and no rights, but you're 'in'.",
        statChanges: { reputation: +5, stress: -5, dealModification: { investmentCost: 5000000, ownershipPercentage: 10 } }
      }
    },
    {
      text: "Priced Round with Board Seat.",
      description: "Force a valuation and demand oversight.",
      sarcasticGuidance: "Ruining the vibe with 'governance'. The founder hates it, but takes the check.",
      outcome: {
        description: "You grind them on valuation and take a board seat. It's a tense marriage, but at least you can fire them if they buy a yacht.",
        statChanges: { reputation: +10, stress: +5, analystRating: +5, dealModification: { investmentCost: 5000000, ownershipPercentage: 20 } }
      }
    },
    {
      text: "Participating Preferred.",
      description: "Aggressive downside protection.",
      sarcasticGuidance: "Double-dipping on the exit. You absolute shark.",
      outcome: {
        description: "You negotiate harsh terms. You get your money back first, then share the upside. Everyone calls you a vulture, but your downside is covered.",
        statChanges: { reputation: -10, financialEngineering: +10, score: +200, dealModification: { investmentCost: 5000000, ownershipPercentage: 15 }, ethics: -5 }
      }
    }
  ]
};

const firstCompany: Omit<PortfolioCompany, 'acquisitionDate' | 'eventHistory'> = {
  id: 1,
  name: "PackFancy Inc.",
  ceo: "Doris Chen",
  investmentCost: 50000000,
  ownershipPercentage: 65,
  currentValuation: 55000000,
  latestCeoReport: "Q3 performance is flat. Doris is 'exploring strategic alternatives' which means she's out of ideas. Needs a kick in the pants.",
  nextBoardMeeting: "In 2 weeks",
  dealType: DealType.LBO,
  revenue: 120000000,
  ebitda: 15000000,
  debt: 80000000,
  revenueGrowth: 0.02,
};

const synergySystems: Omit<PortfolioCompany, 'acquisitionDate' | 'eventHistory'> = {
  id: 2,
  name: "Synergy Systems",
  ceo: "Mark Donaldson",
  investmentCost: 80000000,
  ownershipPercentage: 80,
  currentValuation: 85000000,
  latestCeoReport: "Cutting-edge B2B SaaS platform. High growth, but burning cash like it's going out of style. Management is strong but needs adult supervision.",
  nextBoardMeeting: "In 4 weeks",
  dealType: DealType.GROWTH_EQUITY,
  revenue: 40000000,
  ebitda: -5000000,
  debt: 10000000,
  revenueGrowth: 0.60,
};

const ventureBoxCo: Omit<PortfolioCompany, 'acquisitionDate' | 'eventHistory'> = {
  id: 5,
  name: "Box.ai",
  ceo: "Skyler",
  investmentCost: 5000000,
  ownershipPercentage: 15,
  currentValuation: 33000000,
  latestCeoReport: "We are pivoting to 'Packaging as a Service' on the blockchain. Need more runway.",
  nextBoardMeeting: "TBD (Founder at meditation retreat)",
  dealType: DealType.VENTURE_CAPITAL,
  revenue: 50000,
  ebitda: -1500000,
  debt: 0,
  revenueGrowth: 3.0,
};

// ... [Keep existing Scenarios] ...
export const SCENARIOS: Scenario[] = [
  // Intro Scenario MUST be first
  {
    id: 1,
    title: "PackFancy Inc.",
    description: "It's a CIM for a mid-market manufacturer of... artisanal cardboard boxes. The MD, Chad, tosses it on your desk. 'Don't waste my time if it's garbage,' he grunts. The deadline for an IOI is Friday. HIDDEN INTEL: Page 40 mentions Patent #8829 for a proprietary Hydrophobic Coating. This might be more than just a box company.",
    structureOptions: [
      {
        type: DealType.LBO,
        description: "Classic PE. Load it with debt, squeeze out efficiencies, and flip it in 5 years. High risk, high reward.",
        dueDiligence: dueDiligencePhaseLBO,
        financingPhase: financingPhaseLBO,
        followUpChoices: [
          {
            text: "Recommend a full-throated, aggressive LBO.",
            sarcasticGuidance: "Tell the partners what they want to hear: that debt is cheap and growth is forever.",
            outcome: {
              description: "You build a model so aggressive it verges on fiction. But it tells the partners what they want to hear. The deal gets done. Welcome to the portfolio, PackFancy Inc. Now the real work begins.",
              statChanges: { cash: -10000, reputation: +20, stress: +15, score: +1000, addPortfolioCompany: firstCompany, npcRelationshipUpdate: { npcId: 'chad', change: 10, memory: 'Backed the aggressive LBO of PackFancy' } },
            },
            skillCheck: {
                skill: 'financialEngineering',
                threshold: 25,
                bonus: {
                    description: "Your financial engineering skills allow you to structure the debt tranches so elegantly that you secure better terms, saving the fund millions in interest payments down the line. You're not just a model monkey anymore.",
                    statChanges: { reputation: +10, financialEngineering: +5, score: +500 }
                }
            }
          },
          {
            text: "Pass. The leverage required is insane.",
            sarcasticGuidance: "Be the voice of reason. Warning: No one likes the guy who says 'no' to fees.",
            outcome: {
              description: "You tell Chad the deal is too risky. He sneers, 'I didn't ask for your risk assessment, I asked for a model.' You dodge a potential bankruptcy, but you also dodge a bonus. The firm does the deal without you.",
              statChanges: { reputation: -10, stress: +5, analystRating: -5, score: -250, npcRelationshipUpdate: { npcId: 'chad', change: -5, memory: 'Too chicken to back PackFancy' } },
            },
          },
        ],
      },
      // ... [Include other structureOptions] ...
        {
        type: DealType.GROWTH_EQUITY,
        description: "Minority stake in a 'high-growth' company. Less control, but maybe less work. Focus on TAM and founder genius.",
        dueDiligence: dueDiligencePhaseGrowth,
        followUpChoices: [
            {
                text: "Pitch as a Tech Play (Hydrophobic Coating).",
                sarcasticGuidance: "You found the hidden IP. Pivot the narrative from manufacturing to 'Materials Science'.",
                outcome: {
                    description: "You pitch the hydrophobic patent as a game-changer. The partners eat it up. 'It's not boxes, it's Advanced Materials!' The valuation soars, and you look like a genius.",
                    statChanges: { reputation: +25, stress: +5, score: +800, addPortfolioCompany: { ...firstCompany, name: "PackFancy Tech", dealType: DealType.GROWTH_EQUITY, currentValuation: 80000000 }, npcRelationshipUpdate: { npcId: 'chad', change: 20, memory: 'Found the hidden IP value in PackFancy' } },
                }
            },
            {
                text: "Pass. Too much hype, not enough substance.",
                sarcasticGuidance: "Be the adult in the room who points out the emperor has no clothes. Or in this case, no EBITDA.",
                outcome: {
                    description: "You recommend passing. The company is all sizzle and no steak. A few months later, it implodes. Your skepticism saved the firm a lot of money.",
                    statChanges: { reputation: +15, stress: -10, analystRating: +10, score: +600 },
                }
            }
        ]
      },
      {
        type: DealType.VENTURE_CAPITAL,
        description: "Basically gambling. Throw money at a charismatic founder with a PowerPoint and pray for a 100x return. High chance of total loss.",
        dueDiligence: dueDiligencePhaseVC,
        financingPhase: financingPhaseVC,
        followUpChoices: [
            {
                text: "Finalize the investment memo and wire the funds.",
                sarcasticGuidance: "Pull the trigger. Don't think about the fact that 90% of startups fail.",
                outcome: {
                    description: "You convince the IC that Box.ai is the next Amazon. Funds are wired. You are now a venture capitalist. God help us all.",
                    statChanges: { cash: -5000, reputation: +10, stress: +5, score: +500, addPortfolioCompany: ventureBoxCo },
                }
            },
            {
                text: "Pull the term sheet at the last minute.",
                sarcasticGuidance: "The ultimate power move. Waste everyone's time and walk away.",
                outcome: {
                    description: "You get cold feet and kill the deal. The founder tweets about you angrily. You saved the firm money, but your reputation in the Valley is torched.",
                    statChanges: { reputation: -20, stress: -10, analystRating: +10, score: +100 },
                }
            }
        ]
      },
    ],
  },
  // ... [Include standard scenarios] ...
  {
    id: 100,
    title: "The SEC Inquiry",
    description: "Two agents in cheap suits are waiting in the lobby. They're asking questions about the 'Synergy Systems' deal and some rumors regarding competitor sabotage. It seems your 'dirty tricks' with Hunter didn't go unnoticed. The firm is exposed.",
    requiredFlags: ['PLAYED_DIRTY_WITH_HUNTER'],
    allowedVolatility: ['CREDIT_CRUNCH', 'PANIC'],
    triggerTags: ['regulatory', 'rival'],
    factionRequirements: [{ faction: 'REGULATORS', max: 80 }],
    choices: [
      {
        text: "Deny everything and lawyer up.",
        sarcasticGuidance: "Standard operating procedure. Admit nothing, deny everything, make counter-accusations.",
        outcome: {
          description: "You stone-wall the agents. The legal fees are astronomical, and the partners are furious at the scrutiny. You survive, but you're on thin ice.",
          statChanges: { cash: -10000, reputation: -10, stress: +20, score: -200, auditRisk: +20, factionReputation: { REGULATORS: -25, MANAGING_DIRECTORS: +5 } },
        },
      },
      {
        text: "Cooperate fully and throw Hunter under the bus.",
        sarcasticGuidance: "The prisoner's dilemma. Snitch first and snitch hard.",
        outcome: {
          description: "You provide evidence that Hunter instigated the market manipulation. The SEC turns its gaze on him. You're seen as a rat, but a rat who isn't in jail.",
          statChanges: { reputation: -20, stress: -10, score: +100, factionReputation: { REGULATORS: +15, RIVALS: -15, MANAGING_DIRECTORS: -5 }, npcRelationshipUpdate: { npcId: 'hunter', change: -100, memory: 'Testified against Hunter to the SEC' } },
        },
      },
      {
        text: "Pay a settlement (Bribe).",
        sarcasticGuidance: "It's not a bribe, it's a 'civil penalty' paid in advance. Wink wink.",
        outcome: {
          description: "You arrange a back-channel settlement. It clears the problem, but it costs you a significant chunk of your personal liquidity. The problem goes away, for now.",
          statChanges: { cash: -25000, stress: -20, reputation: +5, score: +300, ethics: -20, auditRisk: +10, factionReputation: { REGULATORS: -30, LIMITED_PARTNERS: -5 } },
        },
      },
    ]
  },
  {
    id: 200,
    title: "The Golf Course Whisper",
    description: "You're at the club on a Saturday. A very drunk CFO of a major public company mistakes you for his nephew and mumbles about a 'massive buyout' being announced Monday. This information is worth millions. It is also illegal.",
    minReputation: 25,
    dayTypeGate: { dayType: 'WEEKEND', timeSlots: ['AFTERNOON', 'EVENING'] },
    allowedVolatility: ['BULL_RUN', 'NORMAL'],
    triggerTags: ['insider', 'lp'],
    factionRequirements: [
      { faction: 'REGULATORS', max: 90 },
      { faction: 'LIMITED_PARTNERS', min: 30 }
    ],
    choices: [
      {
        text: "Buy calls on the stock immediately.",
        sarcasticGuidance: "A sure thing is a sure thing. Who's going to know? Just don't buy the yacht until the heat dies down.",
        outcome: {
          description: "You leverage your personal account and make a killing. The stock pops 40% on Monday. You feel invincible. You also feel a slight tightening in your chest every time the phone rings.",
          statChanges: { cash: +150000, stress: +30, score: +500, setsFlags: ['COMMITTED_INSIDER_TRADING'], ethics: -50, auditRisk: +80, factionReputation: { REGULATORS: -40, MANAGING_DIRECTORS: +10, LIMITED_PARTNERS: -5 } }
        }
      },
      {
        text: "Tip off the fund's trading desk anonymously.",
        sarcasticGuidance: "Let the firm take the risk. If it works, you claim credit. If it blows up, you were never there.",
        outcome: {
          description: "The firm makes a small fortune. You casually mention to Chad that you 'had a hunch'. He knows you know, but nothing is on paper. Your value rises.",
          statChanges: { reputation: +15, analystRating: +10, score: +200, factionReputation: { MANAGING_DIRECTORS: +8, REGULATORS: -15, LIMITED_PARTNERS: +5 }, npcRelationshipUpdate: { npcId: 'chad', change: 10, memory: 'Provided extremely accurate market intel' } }
        }
      },
      {
        text: "Ignore it. Too much risk.",
        sarcasticGuidance: "Boring. Safe. Probably why you'll never own an island. But you will sleep tonight.",
        outcome: {
          description: "You watch the stock soar on Monday from the sidelines. It hurts, but you're not in an orange jumpsuit.",
          statChanges: { stress: -5, reputation: +5, score: +50, ethics: +10, factionReputation: { REGULATORS: +10, MANAGING_DIRECTORS: -5 } }
        }
      }
    ]
  },
  {
    id: 101,
    title: "Cardiac Event",
    description: "You're in the middle of a modeling session at 3 AM when your left arm goes numb. The screen blurs. Your heart is hammering like a techno drum. Your body is rejecting your lifestyle.",
    minStress: 80,
    choices: [
      {
        text: "Call an ambulance.",
        sarcasticGuidance: "Admit defeat. Go to the hospital like a normal human being. Weak.",
        outcome: {
          description: "You spend 3 days in the hospital. The doctors say it was a panic attack induced by exhaustion. The partners send flowers, but you know they're interviewing your replacement.",
          statChanges: { stress: -50, energy: +40, reputation: -10, cash: -5000, score: -100 },
        },
      },
      {
        text: "Take a beta blocker and keep working.",
        sarcasticGuidance: "Chemistry is better than biology. Suppress the symptoms and push through.",
        outcome: {
          description: "The drugs kick in. The shaking stops. You finish the model. You feel like a god, but a very fragile one. You've dodged a bullet, but the gun is still loaded.",
          statChanges: { stress: -10, energy: -10, score: +200 },
        },
      },
      {
        text: "Pass out on your desk.",
        sarcasticGuidance: "The ultimate power nap. Let the cleaning crew find you.",
        outcome: {
          description: "You wake up to the cleaning lady vacuuming around your drooling face. It's humiliating, but you got 4 hours of sleep. Back to work.",
          statChanges: { stress: -5, energy: +10, reputation: -5, score: -50 },
        },
      },
    ]
  },
  {
    id: 102,
    title: "The Headhunter's Offer",
    description: "A top-tier headhunter calls you on your personal cell. 'I have a role at a mega-fund,' she whispers. 'Double your comp, carry from day one.' It sounds too good to be true. It usually is.",
    minReputation: 75,
    allowedVolatility: ['BULL_RUN', 'NORMAL'],
    triggerTags: ['career'],
    factionRequirements: [
      { faction: 'MANAGING_DIRECTORS', min: 50 },
      { faction: 'LIMITED_PARTNERS', min: 35 }
    ],
    choices: [
      {
        text: "Take the interview.",
        sarcasticGuidance: "Grass is always greener. Go see what the big boys are paying.",
        outcome: {
          description: "You ace the interview. The offer is real. You leverage it to get a massive raise at your current firm. You're now the golden child.",
          statChanges: { cash: +20000, reputation: +10, stress: +5, score: +500, factionReputation: { MANAGING_DIRECTORS: +10, LIMITED_PARTNERS: +8, RIVALS: -5 } },
        },
      },
      {
        text: "Politely decline. Loyalty pays.",
        sarcasticGuidance: "Loyalty? In this industry? That's adorable. But maybe sticking with the devil you know is safer.",
        outcome: {
          description: "You stay put. Your MD finds out you turned it down and is impressed. 'Good man,' he grunts. You get a slightly better deal on your next co-invest.",
          statChanges: { reputation: +5, analystRating: +5, score: +100, factionReputation: { MANAGING_DIRECTORS: +12, LIMITED_PARTNERS: +4 } },
        },
      },
      {
        text: "Jump ship immediately.",
        sarcasticGuidance: "Burn the bridge. Take the money and run. New firm, new problems.",
        outcome: {
          description: "You quit. The new firm is a sweatshop, but the pay is incredible. You've reset your reputation, but your bank account is happy.",
          statChanges: { cash: +50000, reputation: -10, stress: +15, score: +600, factionReputation: { MANAGING_DIRECTORS: -25, LIMITED_PARTNERS: -10, RIVALS: +10 } },
        },
      },
    ]
  },
  {
    id: 2,
    title: "The Recalcitrant CEO",
    requiresPortfolio: true,
    description: "The CEO of a portfolio company is resisting your 'suggestions' for improvement. He claims your financial engineering will 'destroy the company's soul.' He needs to be brought in line, or replaced.",
    choices: [
      {
        text: "Be assertive. Remind him who owns the company.",
        sarcasticGuidance: "Assert dominance. He works for you, not the other way around. Make sure he understands that.",
        outcome: {
          description: "You deliver a cold, hard lecture on fiduciary duty. The CEO sullenly complies, but your relationship is toast. He'll be a problem later.",
          statChanges: { reputation: +5, stress: +10, score: +200 },
        },
      },
      {
        text: "Try to find a compromise.",
        sarcasticGuidance: "The gentle touch. Maybe you can convince him with logic and reason. A novel approach.",
        outcome: {
          description: "You spend hours finding a middle ground. The CEO is mollified, but the partners see you as soft. You can't please everyone.",
          statChanges: { reputation: -5, stress: -5, analystRating: +5, score: -100 },
        },
      },
      {
        text: "Go behind his back and talk to the board.",
        sarcasticGuidance: "A classic political power play. High risk, but very satisfying if it works.",
        outcome: {
          description: "A bold, political move. It works. The board sides with you, and the CEO is marginalized. You've won the battle, but started a war.",
          statChanges: { reputation: +10, stress: +15, cash: -2000, score: +350 },
        },
      },
    ],
  },
  {
    id: 3,
    title: "Bonus Season",
    description: "It's that time of year. Your bonus is on the line. The rumor mill is churning. You have your year-end review with your MD.",
    choices: [
      {
        text: "Accept whatever they give you. Don't rock the boat.",
        sarcasticGuidance: "Be grateful for the scraps from the masters' table. A true team player.",
        outcome: {
          description: "You get a mediocre bonus. You're a team player, which means you're a sucker. They'll walk all over you next year too.",
          statChanges: { cash: +20000, stress: -5, reputation: -5, score: -150 },
        },
      },
      {
        text: "Come prepared with a list of your wins.",
        sarcasticGuidance: "Actually advocate for yourself? A bold strategy. Let's see if it pays off.",
        outcome: {
          description: "You make a strong case for your contributions. Your MD is impressed by your audacity and preparation. You get a slightly better bonus.",
          statChanges: { cash: +35000, reputation: +5, analystRating: +5, score: +250 },
        },
      },
      {
        text: "Hint that you have a competing offer.",
        sarcasticGuidance: "The high-stakes bluff. Make them think you're wanted elsewhere. Just be prepared to walk if they call you on it.",
        outcome: {
          description: "A high-stakes bluff. It works. They match the imaginary offer to keep you. You're a stone-cold killer. They'll be watching you closely now.",
          statChanges: { cash: +50000, reputation: +10, stress: +10, score: +500 },
        },
      },
    ],
  },
  {
    id: 4,
    title: "The All-Nighter",
    description: "A partner has a 'brilliant' idea at 6 PM on a Friday. They need a 100-page deck on the market for left-handed widgets by Monday morning. Your weekend is gone.",
    choices: [
      {
        text: "Suck it up and pull the all-nighter.",
        sarcasticGuidance: "Ah, the sweet smell of burnout. Do it for the 'team.' They'll definitely remember this. (They won't.)",
        outcome: {
          description: "You survive on coffee and spite. The deck is flawless. The partner barely glances at it. Your health is failing but your reputation is solid.",
          statChanges: { energy: -40, stress: +20, reputation: +10, analystRating: +5, score: +300 },
        },
      },
      {
        text: "Delegate to the intern.",
        sarcasticGuidance: "Push the misery downhill. That's what interns are for, right?",
        outcome: {
          description: "You dump the work on the terrified intern. Their work is a disaster, and you spend all of Sunday fixing it anyway. You look like a poor manager.",
          statChanges: { energy: -20, stress: +10, reputation: -10, analystRating: -5, score: -400, npcRelationshipUpdate: { npcId: 'sarah', change: -10, memory: 'Dumped weekend work on junior team' } },
        },
      },
      {
        text: "Push back. Say it's an unreasonable request.",
        sarcasticGuidance: "Go on, try setting 'boundaries'. Let's see how that works out for your career trajectory. I'll get the popcorn.",
        outcome: {
          description: "The partner is stunned. No one has ever said 'no' to them before. You're fired. Just kidding. But you're definitely not on the partner track anymore.",
          statChanges: { stress: -20, reputation: -15, energy: +10, score: -750 },
        },
      },
    ],
  },
   {
    id: 5,
    title: "Whispers in the Pantry",
    description: "You overhear Hunter, your smug rival from the LBO group, telling an MD a damaging (and false) rumor about you botching the analysis on a recent deal. It could kill your reputation if it spreads.",
    isRivalEvent: true,
    blockedByFlags: ['PARTNERED_WITH_HUNTER'], // If you are partnered, he doesn't spread rumors (he betrays you later)
    choices: [
      {
        text: "Confront him publicly.",
        sarcasticGuidance: "Cause a scene. Showing emotion in the workplace is always a good look.",
        outcome: {
          description: "You cause a scene. Hunter plays innocent, and you look unhinged. The MD is unimpressed with your lack of composure. Bad move.",
          statChanges: { reputation: -10, stress: +15, score: -300, setsFlags: ['LOST_COOL'], npcRelationshipUpdate: { npcId: 'hunter', change: -10, memory: 'Public shouting match in pantry' } },
        },
      },
      {
        text: "Spread a worse rumor about him.",
        sarcasticGuidance: "The nuclear option. He started it, you're just finishing it. With overwhelming force.",
        outcome: {
          description: "You anonymously start a rumor that Hunter's analysis is so bad, he uses a Magic 8-Ball for his projections. It sticks. Mutually assured destruction is a valid strategy.",
          statChanges: { reputation: +10, stress: +5, cash: -1000, score: +400, setsFlags: ['RUMOR_MONGER'], npcRelationshipUpdate: { npcId: 'hunter', change: -20, memory: 'Retaliated with vicious rumors' } },
        },
      },
      {
        text: "Go to your MD with proof it's false.",
        sarcasticGuidance: "The professional approach. Tattling, but with spreadsheets to back it up.",
        outcome: {
          description: "You calmly present your work to your MD, disproving the rumor. They appreciate your professionalism, but also view it as you handling your own mess. You're seen as competent, if a bit of a tattletale.",
          statChanges: { reputation: +5, analystRating: +5, score: +150, setsFlags: ['PROFESSIONAL'] },
        },
      },
      {
        text: "Ignore it. Let your work speak for itself.",
        sarcasticGuidance: "The high road. A noble path, usually leading directly off a cliff.",
        outcome: {
          description: "You take the high road. Unfortunately, the high road is where people get run over in this business. The rumor spreads, and your reputation takes a hit. Perceptions matter more than reality.",
          statChanges: { reputation: -15, stress: +10, score: -500 },
        },
      },
    ],
  },
   // Include other scenarios as needed...
];

export const VICE_ACTIONS: LifeAction[] = [
    {
      id: 'supplements',
      text: 'Experimental Supplements',
      icon: 'fa-pills',
      outcome: {
        description: "You pop the unmarked pills. The world sharpens. You don't need sleep, you need results. You crush the model, but your heart is racing.",
        statChanges: { energy: +100, analystRating: +20, health: -5, dependency: +10, cash: -500, score: +100 }
      }
    },
    {
      id: 'gambling',
      text: 'High-Stakes Gambling',
      icon: 'fa-dice',
      outcome: {
          description: "You hit the tables. For a moment, the adrenaline of the loss feels like the only real thing in your life.",
          statChanges: { stress: -30, cash: -50000, score: +200, dependency: +5 } // High risk, needs logic in App.tsx for win/loss
      }
    },
    {
      id: 'ghost',
      text: 'The Ghost Protocol',
      icon: 'fa-user-secret',
      outcome: {
          description: "You turn off your phone and vanish for 3 days. The firm is frantic. When you return, you claim food poisoning. They don't believe you, but you're rested.",
          statChanges: { energy: +50, stress: -50, reputation: -20, score: -300 }
      }
    }
];

export const SHADOW_ACTIONS: LifeAction[] = [
    {
        id: 'scapegoat',
        text: 'The Scapegoat Strategy',
        icon: 'fa-user-injured',
        outcome: {
            description: "You systematically plant errors in Sarah's work and frame her for the blown deal. She is fired. You survive. You monster.",
            statChanges: { reputation: +10, auditRisk: -20, stress: -10, ethics: -50, score: +500, removeNpcId: 'sarah' }
        }
    },
    {
        id: 'bribe',
        text: 'Regulatory Capture',
        icon: 'fa-handshake-simple',
        outcome: {
            description: "You meet the regulator in a parking garage. An envelope changes hands. The investigation is dropped. You own him now.",
            statChanges: { cash: -100000, auditRisk: -50, ethics: -30, score: +300 } // Risk of prison handled in App.tsx
        }
    },
    {
        id: 'espionage',
        text: 'Corporate Espionage',
        icon: 'fa-mask',
        outcome: {
            description: "You hire a private investigator to steal the competitor's IP roadmap. You win the bid knowing exactly what they have. It's beautiful.",
            statChanges: { cash: -50000, reputation: +20, analystRating: +20, ethics: -40, score: +600, auditRisk: +30 }
        }
    }
];

export const LIFE_ACTIONS: LifeAction[] = [
  {
    id: 'gym',
    text: 'Go to the Gym',
    icon: 'fa-dumbbell',
    outcome: {
      description: "You hit the gym, releasing some stress and reminding yourself that you're physically superior to the analysts. It costs a bit, but looking good is part of the job.",
      statChanges: { energy: +30, stress: -15, cash: -50, score: +50 },
    },
  },
  {
    id: 'networking',
    text: 'Attend Networking Event',
    icon: 'fa-martini-glass',
    outcome: {
      description: "You schmooze with the best of them, making connections that might be useful later. It's draining, but your name is out there now.",
      statChanges: { reputation: +10, stress: +10, energy: -15, cash: -100, score: +100 },
    },
  },
  {
    id: 'work_late',
    text: 'Work Late',
    icon: 'fa-moon',
    outcome: {
      description: "You grind it out, refining models and making sure your name is on every important email. The partners notice your 'commitment.'",
      statChanges: { analystRating: +10, energy: -20, stress: +10, score: +75, npcRelationshipUpdate: { npcId: 'sarah', change: -5, memory: 'Kept team working late' } },
    },
  },
  {
    id: 'relax',
    text: 'Relax at Home',
    icon: 'fa-couch',
    outcome: {
      description: "You actually take a night off. It feels... strange. While you recharged a little, you can't shake the feeling that your rivals are getting ahead.",
      statChanges: { energy: +10, stress: -20, score: -25 },
    },
  },
  {
    id: 'study',
    text: 'Study Financial Engineering',
    icon: 'fa-book-open-reader',
    outcome: {
        description: "Instead of sleeping, you study esoteric debt structures. You feel your brain expanding, or maybe that's just a caffeine-induced aneurysm. Either way, you're sharper.",
        statChanges: { financialEngineering: +5, energy: -10, stress: +5, score: +100 }
    }
  },
  {
    id: 'therapy',
    text: 'Attend Therapy',
    icon: 'fa-brain',
    outcome: {
      description: "You pay a stranger to listen to your problems. It's surprisingly effective for stress, but feels like an admission of weakness. And it's expensive.",
      statChanges: { stress: -30, cash: -300, energy: +5, score: -50 },
    },
  },
  {
    id: 'vacation',
    text: 'Take a Vacation',
    icon: 'fa-plane-departure',
    outcome: {
      description: "You escape to a place without spreadsheets. The massive energy and stress recovery is offset by the deals you missed and the partners thinking you've gone soft.",
      statChanges: { energy: +50, stress: -40, cash: -2000, reputation: -5, score: -200 },
    },
  },
  {
    id: 'review_compliance',
    text: 'Review Compliance Logs',
    icon: 'fa-file-shield',
    outcome: {
        description: "You spend a Saturday morning auditing your own email trails and compliance logs. It's incredibly boring, but you find a few red flags and delete... err, correct them.",
        statChanges: { auditRisk: -20, stress: +5, energy: -10, score: +50 }
    }
  },
  {
    id: 'golf_outing',
    text: 'Golf with Partners',
    icon: 'fa-golf-ball-tee',
    outcome: {
        description: "You drop $500 on greens fees to let the Managing Directors beat you. It's not about the game, it's about the face time. You laugh at their bad jokes.",
        statChanges: { reputation: +15, cash: -500, energy: -10, score: +200, npcRelationshipUpdate: { npcId: 'chad', change: 10, memory: 'Good sport on the golf course' } }
    }
  },
  {
    id: 'mentor_team',
    text: 'Mentor Juniors',
    icon: 'fa-chalkboard-user',
    outcome: {
        description: "You take the analysts out for drinks and actually listen to their complaints. They look at you like a messiah. Building loyalty from the bottom up.",
        statChanges: { reputation: +5, ethics: +10, analystRating: +10, cash: -200, npcRelationshipUpdate: { npcId: 'sarah', change: 15, memory: 'Bought drinks for the team' } }
    }
  },
  {
    id: 'hard_money_loan',
    text: 'Take Bridge Loan',
    icon: 'fa-skull-crossbones',
    outcome: {
      description: "You sign a predatory term sheet. Cash hits the account fast, but the lender is circling for their pound of flesh.",
      statChanges: { cash: +50000, stress: +8, loanBalanceChange: +50000, loanRate: 0.15, score: +75 }, // Reduced from 28% to 15% for better balance
    },
  },
  {
    id: 'loan_payment',
    text: 'Pay Down Debt',
    icon: 'fa-money-bill-wave',
    outcome: {
      description: "You wire a chunk back to the lender. It hurts the wallet, but at least the sharks ease off for a week.",
      statChanges: { cash: -10000, loanBalanceChange: -10000, stress: -2, score: +25 },
    },
  }
];

export const PORTFOLIO_ACTIONS: PortfolioAction[] = [
    // ... [Keep existing portfolio actions] ...
    {
        id: 'fire_ceo',
        text: 'Fire CEO',
        description: 'The current leadership is underperforming. Time to make a change at the top.',
        icon: 'fa-user-slash',
        outcome: {
            description: "You orchestrated the CEO's exit. It was a messy, political battle, but the board backed you. Now to find a replacement who will actually do what they're told. The move signals you're not afraid to make tough calls.",
            statChanges: { reputation: +10, stress: +15, score: +300 },
            logMessage: "Orchestrated CEO ousting and initiated executive search.",
        }
    },
    {
        id: 'increase_incentives',
        text: 'Increase Incentives',
        description: 'Juice the management team with a new, more aggressive incentive plan.',
        icon: 'fa-money-bill-trend-up',
        outcome: {
            description: "You've sweetened the pot for the management team. They're more motivated, but it cost the company cash. Hopefully their greed translates into performance.",
            statChanges: { cash: -5000, analystRating: +5, score: +150 },
            logMessage: "Rolled out a new, more aggressive management incentive plan.",
        }
    },
    {
        id: 'strategic_review',
        text: 'Initiate Strategic Review',
        description: 'Hire consultants to tear the business apart and find areas for "optimization."',
        icon: 'fa-magnifying-glass-chart',
        outcome: {
            description: "The consultants produced a 200-slide deck confirming what you already knew, but now it has fancy charts. It creates a lot of work, but it also gives you a clear roadmap for your value creation plan.",
            statChanges: { stress: +10, analystRating: +10, score: +200 },
            logMessage: "Hired consultants to conduct a full strategic review.",
        }
    },
    {
        id: 'initiate_dividend',
        text: 'Initiate Dividend Payout',
        description: 'Extract cash from the company. Requires positive EBITDA.',
        icon: 'fa-hand-holding-dollar',
        outcome: {
            description: "You initiate a dividend recapitalisation. Cash is extracted from the portfolio company.",
            statChanges: {},
            logMessage: "Initiated dividend payout."
        }
    },
    {
        id: 'initiate_sale',
        text: 'Initiate Sale Process',
        description: 'It is time to harvest. Hire a bank and prepare the company for a sale.',
        icon: 'fa-gavel',
        outcome: {
            description: "The bankers are hired and the CIM is being drafted. This is the big one. The stress is immense, but the potential payday is even bigger. This will define your year.",
            statChanges: { reputation: +15, stress: +20, cash: +10000, score: +750 },
            logMessage: "Hired investment bank to officially begin sale process.",
        }
    },
    {
        id: 'initiate_ipo',
        text: 'Initiate IPO Process',
        description: 'Take the company public. The ultimate exit. Maximum prestige, maximum scrutiny. You will be ringing the bell or wringing your hands if the market turns.',
        icon: 'fa-bell',
        outcome: {
            description: "You've pulled the trigger on the IPO. The S-1 is filed, and the roadshow begins. You're pitching to skeptical mutual fund managers by day and proofreading legal docs by night. The scrutiny is intense—every number is questioned. But if this prices at the top of the range, you're a legend.",
            statChanges: { reputation: +50, stress: +40, cash: -15000, score: +2000, analystRating: +20 },
            logMessage: "Formally initiated the Initial Public Offering (IPO) process.",
        }
    }
]

// Re-export NEWS_EVENTS and PREDEFINED_QUESTIONS as before
export const NEWS_EVENTS = [
    // ... [Same as before, assumed preserved] ...
    {
        id: 1,
        headline: "Fed unexpectedly raises interest rates by 50 basis points, citing inflation fears.",
        effect: {
            description: "The cost of debt just went up, rookie. Every LBO model in the world just got a little bit worse. Valuations are tightening.",
            statChanges: { stress: 5, portfolioImpact: { valuationChangePercentage: -0.05, applicableDealTypes: [DealType.LBO] } }
        }
    },
    // ...
];

export const PREDEFINED_QUESTIONS: string[] = [
  "Should I take this deal?",
  "How do I handle my MD?",
  "Is this bonus fair?",
  "What's the angle here?",
  "Test my financial knowledge"
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- Category 1: The "Analyst's Nightmare" (Technical Modeling) ---
  {
    id: 1,
    category: 'MODELING',
    question: "If Accounts Receivable goes UP by $10M, what happens to your Operating Cash Flow?",
    options: ["It increases by $10M", "It decreases by $10M", "No change", "It depends on Net Income"],
    correctIndex: 1,
    explanation: "An increase in Assets uses cash. If AR goes up, you have booked the revenue but haven't received the cash yet. Thus, Cash Flow decreases."
  },
  {
    id: 2,
    category: 'MODELING',
    question: "Where does Depreciation Expense sit on the Cash Flow Statement?",
    options: ["Investing Activities (Outflow)", "Financing Activities (Outflow)", "Operating Activities (Added Back)", "It doesn't appear on CFS"],
    correctIndex: 2,
    explanation: "Depreciation is a non-cash expense that reduces Net Income. To get to Cash Flow from Operations, you must add it back to Net Income."
  },
  {
    id: 3,
    category: 'MODELING',
    question: "You bought a company with negative EBITDA but positive Net Income. How is this possible?",
    options: ["They have huge Depreciation", "They have a massive Interest Expense", "They had a one-off asset sale or tax credit", "It's impossible"],
    correctIndex: 2,
    explanation: "EBITDA ignores one-off gains/losses and taxes. If Net Income is > EBITDA, there must be a large positive item below the operating line, like a gain on sale of assets."
  },

  // --- Category 2: The "Shark's Term Sheet" (Deal Structure) ---
  {
    id: 4,
    category: 'DEAL_STRUCTURE',
    question: "The majority shareholders want to sell the company, but you (a minority holder) refuse. Which clause allows them to force you to sell?",
    options: ["Tag-Along Rights", "Drag-Along Rights", "Pre-emptive Rights", "Right of First Refusal"],
    correctIndex: 1,
    explanation: "Drag-Along Rights allow the majority to 'drag' the minority into a sale, forcing them to sell their shares on the same terms."
  },
  {
    id: 5,
    category: 'DEAL_STRUCTURE',
    question: "In a 'Down Round', what provision protects early investors from being heavily diluted?",
    options: ["Liquidation Preference", "Anti-Dilution (Full Ratchet / Weighted Average)", "Pay-to-Play", "Dividend Recap"],
    correctIndex: 1,
    explanation: "Anti-dilution clauses adjust the conversion price of preferred stock downwards to protect investors if new shares are issued at a lower price."
  },
  {
    id: 6,
    category: 'DEAL_STRUCTURE',
    question: "For a quick flip (exit in 18 months), which metric matters most to your carry?",
    options: ["IRR (Internal Rate of Return)", "MoIC (Multiple on Invested Capital)", "EBITDA Margin", "Revenue Growth"],
    correctIndex: 0,
    explanation: "IRR is time-sensitive. A quick exit boosts IRR massively. MoIC is just a cash multiplier and doesn't care about time. For a 'quick flip', you are optimizing for high IRR."
  },

  // --- Category 3: "Due Diligence" (Logic/Common Sense) ---
  {
    id: 7,
    category: 'DUE_DILIGENCE',
    question: "The Founder refuses to show you the Cap Table during due diligence. What do you do?",
    options: ["Offer a higher valuation to build trust", "Sign an NDA and ask again", "Walk away immediately", "Ask the intern to hack their server"],
    correctIndex: 2,
    explanation: "A hidden Cap Table usually means a mess of lawsuits, dead equity, or toxic investors. It's a massive red flag. Walk away."
  },
  {
    id: 8,
    category: 'DUE_DILIGENCE',
    question: "Which of the following creates the most value in a successful LBO?",
    options: ["Multiple Expansion", "Deleverage (Debt Paydown)", "Operational Improvement (EBITDA Growth)", "Dividend Recaps"],
    correctIndex: 2,
    explanation: "While leverage amplifies returns, operational improvement (growing EBITDA) is the most sustainable and controllable driver of value creation."
  },
  {
    id: 9,
    category: 'MODELING',
    question: "If a company has $10M EBITDA, $2M Interest Expense, and $2M Principal Repayment, what is its DSCR?",
    options: ["1.5x", "2.0x", "2.5x", "5.0x"],
    correctIndex: 2,
    explanation: "DSCR = (EBITDA - CapEx) / (Interest + Principal). Assuming 0 CapEx for simplicity here: 10 / (2 + 2) = 2.5x."
  },
  {
    id: 10,
    category: 'GENERAL',
    question: "What happens to a company's Equity Beta when you increase its leverage?",
    options: ["It decreases", "It increases", "It stays the same", "It becomes negative"],
    correctIndex: 1,
    explanation: "Leverage increases financial risk, which increases the volatility of equity returns relative to the market, thus increasing Equity Beta."
  }
];

export const BLACK_BOX_FILE = {
    name: "DO_NOT_OPEN.enc",
    size: "4.2 GB",
    encryption: "AES-256 (Weak)",
    content: "PROJECT_CICADA // MONEY LAUNDERING OPERATIONS FOR SINALOA CARTEL // SHELL COMPANIES: PANAMA, CAYMAN, DELAWARE"
};

export const MARKET_VOLATILITY_STYLES: Record<MarketVolatility, { color: string; icon: string, description: string }> = {
    NORMAL: { color: 'text-slate-400', icon: 'fa-chart-line', description: "Markets are behaving rationally. Boring." },
    BULL_RUN: { color: 'text-green-500', icon: 'fa-arrow-trend-up', description: "Everything is going up. Even the garbage." },
    CREDIT_CRUNCH: { color: 'text-red-500', icon: 'fa-arrow-trend-down', description: "Liquidity has dried up. Cash is king." },
    PANIC: { color: 'text-amber-500', icon: 'fa-triangle-exclamation', description: "Total meltdown. Hide under your desk." },
};

// ==================== COMPETITOR FUNDS SYSTEM ====================

export const RIVAL_FUNDS: RivalFund[] = [
  {
    id: 'hunter_capital',
    name: 'Vanderbilt Capital',
    managingPartner: 'Hunter Vanderbilt III',
    npcId: 'hunter',
    strategy: 'PREDATORY',
    aum: 500000000,
    dryPowder: 150000000,
    portfolio: [],
    winStreak: 0,
    totalDeals: 0,
    reputation: 75,
    aggressionLevel: 85,
    riskTolerance: 70,
    vendetta: 55,
    lastActionTick: -1
  },
  {
    id: 'meridian_partners',
    name: 'Meridian Partners',
    managingPartner: 'Victoria Chen',
    npcId: 'victoria',
    strategy: 'CONSERVATIVE',
    aum: 800000000,
    dryPowder: 200000000,
    portfolio: [],
    winStreak: 0,
    totalDeals: 0,
    reputation: 85,
    aggressionLevel: 30,
    riskTolerance: 25,
    vendetta: 35,
    lastActionTick: -1
  },
  {
    id: 'apex_equity',
    name: 'Apex Equity Group',
    managingPartner: 'Marcus Webb',
    npcId: 'marcus',
    strategy: 'OPPORTUNISTIC',
    aum: 350000000,
    dryPowder: 100000000,
    portfolio: [],
    winStreak: 0,
    totalDeals: 0,
    reputation: 60,
    aggressionLevel: 55,
    riskTolerance: 80,
    vendetta: 45,
    lastActionTick: -1
  }
];

export const COMPETITIVE_DEALS: CompetitiveDeal[] = [
  {
    id: 101,
    companyName: "TechFlow Solutions",
    sector: "Enterprise SaaS",
    description: "B2B workflow automation platform with sticky enterprise contracts. The CEO is a former McKinsey partner who talks a big game.",
    askingPrice: 85000000,
    fairValue: 72000000,
    dealType: DealType.GROWTH_EQUITY,
    metrics: { revenue: 25000000, ebitda: 3000000, growth: 0.45, debt: 0 },
    seller: "Series B Investors (Exit)",
    deadline: 4,
    interestedRivals: ['hunter_capital', 'meridian_partners'],
    isHot: true,
    hiddenRisk: "Customer concentration: 60% revenue from 3 clients",
    hiddenUpside: "Patent pending on AI automation that could 10x TAM"
  },
  {
    id: 102,
    companyName: "Midwest Manufacturing Co.",
    sector: "Industrial",
    description: "Family-owned precision parts manufacturer. Boring as hell, but prints cash. The owner wants to retire to Florida.",
    askingPrice: 45000000,
    fairValue: 52000000,
    dealType: DealType.LBO,
    metrics: { revenue: 35000000, ebitda: 8000000, growth: 0.03, debt: 5000000 },
    seller: "Founder (Retirement)",
    deadline: 6,
    interestedRivals: ['meridian_partners'],
    isHot: false,
    hiddenRisk: "Key supplier contract expires in 18 months",
    hiddenUpside: "Adjacent property available for expansion at below-market price"
  },
  {
    id: 103,
    companyName: "NeuraByte AI",
    sector: "Artificial Intelligence",
    description: "Hot AI startup with proprietary LLM training data. Founder is 23 and has never had a real job. Burn rate is apocalyptic.",
    askingPrice: 120000000,
    fairValue: 40000000,
    dealType: DealType.VENTURE_CAPITAL,
    metrics: { revenue: 2000000, ebitda: -15000000, growth: 3.0, debt: 0 },
    seller: "Seed Investors (Markup)",
    deadline: 2,
    interestedRivals: ['hunter_capital', 'apex_equity'],
    isHot: true,
    hiddenRisk: "Training data may have copyright issues",
    hiddenUpside: "Google has been sniffing around for acquisition"
  },
  {
    id: 104,
    companyName: "GreenLeaf Logistics",
    sector: "Transportation",
    description: "Regional trucking company with electric fleet transition underway. ESG-friendly but execution risk is real.",
    askingPrice: 65000000,
    fairValue: 58000000,
    dealType: DealType.LBO,
    metrics: { revenue: 80000000, ebitda: 12000000, growth: 0.08, debt: 20000000 },
    seller: "PE Fund (Secondary)",
    deadline: 5,
    interestedRivals: ['meridian_partners', 'apex_equity'],
    isHot: false,
    hiddenRisk: "Driver unionization vote scheduled for Q2",
    hiddenUpside: "Government EV subsidies could cover 40% of fleet conversion"
  },
  {
    id: 105,
    companyName: "CloudVault Security",
    sector: "Cybersecurity",
    description: "Zero-trust security platform growing like a weed. The CISO community loves them. Competitors are circling.",
    askingPrice: 95000000,
    fairValue: 110000000,
    dealType: DealType.GROWTH_EQUITY,
    metrics: { revenue: 18000000, ebitda: 1000000, growth: 0.85, debt: 0 },
    seller: "Founders (Growth Capital)",
    deadline: 3,
    interestedRivals: ['hunter_capital', 'apex_equity', 'meridian_partners'],
    isHot: true,
    hiddenRisk: "CTO has a non-compete from previous employer that's being litigated",
    hiddenUpside: "Fortune 500 pilot programs converting to enterprise deals"
  },
  {
    id: 106,
    companyName: "Heritage Brands Holdings",
    sector: "Consumer",
    description: "Roll-up of nostalgic American brands (toys, board games). Private equity math: buy cheap brands, cut costs, flip.",
    askingPrice: 150000000,
    fairValue: 130000000,
    dealType: DealType.LBO,
    metrics: { revenue: 200000000, ebitda: 25000000, growth: -0.02, debt: 40000000 },
    seller: "Distressed Conglomerate",
    deadline: 4,
    interestedRivals: ['hunter_capital'],
    isHot: false,
    hiddenRisk: "Brand licensing agreements are a legal nightmare",
    hiddenUpside: "TikTok nostalgia trend could revive demand"
  }
];

export const RIVAL_BID_STRATEGIES: Record<RivalStrategy, {
  baseMultiplier: number;
  maxOverbid: number;
  bluffChance: number;
  dropoutThreshold: number;
}> = {
  AGGRESSIVE: {
    baseMultiplier: 1.1,
    maxOverbid: 0.35,
    bluffChance: 0.15,
    dropoutThreshold: 1.25
  },
  CONSERVATIVE: {
    baseMultiplier: 0.95,
    maxOverbid: 0.1,
    bluffChance: 0.05,
    dropoutThreshold: 1.05
  },
  OPPORTUNISTIC: {
    baseMultiplier: 1.0,
    maxOverbid: 0.25,
    bluffChance: 0.3,
    dropoutThreshold: 1.15
  },
  PREDATORY: {
    baseMultiplier: 1.15,
    maxOverbid: 0.5,
    bluffChance: 0.2,
    dropoutThreshold: 1.4
  }
};

export const HUNTER_WIN_TAUNTS = [
  "Better luck next time, champ. Oh wait, there won't be a next time for this one.",
  "I appreciate you driving up the price. Made my win feel even sweeter.",
  "Did you even run the numbers? Amateur hour over there.",
  "That's another one for the trophy case. Thanks for playing.",
  "Your LPs must love watching you lose deals. Great use of their capital.",
  "I heard you were in the running. I stopped being worried after round two."
];

export const HUNTER_LOSS_REACTIONS = [
  "Enjoy it while it lasts. That company is a ticking time bomb.",
  "You overpaid. Classic rookie mistake. I'll buy it from you at a discount in two years.",
  "Fine. Take it. I've got bigger fish to fry.",
  "The only reason I dropped out is because the numbers stopped making sense. Something you clearly don't understand.",
  "Congratulations. You won an auction. Call me when you've actually created value."
];

export const RIVAL_FUND_NPCS: NPC[] = [
  {
    id: 'victoria',
    name: 'Victoria Chen',
    role: 'MP at Meridian Partners',
    avatar: 'fa-user-tie',
    relationship: 45,
    mood: 50,
    trust: 38,
    traits: ['Calculated', 'Disciplined', 'Risk-Averse'],
    memories: [],
    isRival: true,
    faction: 'RIVALS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Victoria Chen', text: "I've seen your fund's deal flow. Interesting strategy. Risky, but interesting." }],
    relationshipType: 'WORK',
    dealPotential: 60,
    goals: ['Defend Meridian deal flow', 'Exploit your mistakes']
  },
  {
    id: 'marcus',
    name: 'Marcus Webb',
    role: 'Founder at Apex Equity',
    avatar: 'fa-user-secret',
    relationship: 35,
    mood: 40,
    trust: 30,
    traits: ['Opportunistic', 'Scrappy', 'Aggressive'],
    memories: [],
    isRival: true,
    faction: 'RIVALS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Marcus Webb', text: "You and me, we're the same. Hungry. The old money boys like Hunter don't get it." }],
    relationshipType: 'WORK',
    dealPotential: 40,
    goals: ['Prove scrappy funds can win', 'Leverage gossip to ambush you']
  }
];

// ==================== ADVANCED AI CONFIGURATIONS ====================

export const RIVAL_TAUNTS: Record<string, string[]> = {
  hunter_capital: [
    "Did you learn finance at community college?",
    "My trust fund has generated more alpha than your entire career.",
    "I don't compete with associates. I crush them.",
    "Cute bid. Was that your entire fund?",
    "The Vanderbilt name has survived three generations. You won't survive one.",
    "I've forgotten more deals than you've ever seen.",
  ],
  meridian_partners: [
    "We prefer disciplined capital allocation to emotional bidding.",
    "Some of us still believe in fundamental value.",
    "When this blows up, don't say we didn't warn you.",
    "Interesting strategy. Our models say otherwise.",
    "Victoria doesn't chase. She calculates.",
    "We'll be here when you need a buyer for the wreckage.",
  ],
  apex_equity: [
    "We came from nothing. What's your excuse?",
    "Street smart beats book smart every time.",
    "While you were in meetings, we closed the deal.",
    "Scrappy beats silver spoon any day.",
    "You think that's aggressive? You haven't seen anything.",
    "The market doesn't care about your pedigree.",
  ],
};

export const COALITION_ANNOUNCEMENTS = [
  "Word on the street: rival funds are comparing notes on your strategy.",
  "Unusual activity detected - competitors seem to be coordinating.",
  "Your sources report a secret meeting between rival fund partners.",
  "The game just changed. Your competitors are working together.",
  "A coalition has formed. You're the target.",
];

export const PSYCHOLOGICAL_WARFARE_MESSAGES = [
  "${name} hired a PR firm to spread doubt about your track record.",
  "${name} is telling LPs you're 'over your skis' on leverage.",
  "Rumors are swirling that ${name} has damaging information about you.",
  "${name} publicly questioned your ethics at an industry dinner.",
  "Your deal pipeline is mysteriously drying up. ${name} is smiling.",
  "${name} sent a bottle of champagne with a note: 'For when you need to celebrate your exit from the industry.'",
];

export const SURPRISE_ATTACK_MESSAGES = [
  "${name} just made an unexpected power play!",
  "BREAKING: ${name} catches everyone off guard with aggressive move!",
  "${name} has gone off-script. Expect chaos.",
  "Intelligence suggests ${name} is planning something big.",
  "${name} just burned their playbook. New strategy incoming.",
];

export const VENDETTA_ESCALATION_MESSAGES: Record<string, string[]> = {
  WARMING: [
    "${name} seems to have taken notice of you. Not in a good way.",
    "You've gotten under ${name}'s skin. They're watching your moves closely.",
    "${name} is starting to view you as a real threat.",
  ],
  HOT: [
    "${name} has made this personal. Every deal is now a battleground.",
    "The rivalry with ${name} is heating up. Expect fireworks.",
    "${name} is actively working against your interests.",
  ],
  BLOOD_FEUD: [
    "${name} has declared war. There will be collateral damage.",
    "This has gone beyond business. ${name} wants to see you fail.",
    "The vendetta with ${name} has reached dangerous levels.",
  ],
  TOTAL_WAR: [
    "${name} is willing to burn everything to beat you. Including themselves.",
    "DEFCON 1: ${name} has launched all-out war on your fund.",
    "This is existential. Only one of you survives this rivalry.",
  ],
};

export const AI_PERSONALITY_MODIFIERS: Record<string, {
  aggressionBonus: number;
  bluffMultiplier: number;
  surpriseFrequency: number;
  coalitionAffinity: number;
}> = {
  CALCULATING: {
    aggressionBonus: 0,
    bluffMultiplier: 0.5,
    surpriseFrequency: 0.1,
    coalitionAffinity: 0.3,
  },
  AGGRESSIVE: {
    aggressionBonus: 20,
    bluffMultiplier: 1.2,
    surpriseFrequency: 0.3,
    coalitionAffinity: 0.2,
  },
  OPPORTUNISTIC: {
    aggressionBonus: 10,
    bluffMultiplier: 1.5,
    surpriseFrequency: 0.4,
    coalitionAffinity: 0.5,
  },
  PARANOID: {
    aggressionBonus: 5,
    bluffMultiplier: 0.8,
    surpriseFrequency: 0.2,
    coalitionAffinity: 0.7,
  },
  UNPREDICTABLE: {
    aggressionBonus: 15,
    bluffMultiplier: 2.0,
    surpriseFrequency: 0.6,
    coalitionAffinity: 0.4,
  },
};

export const ADAPTIVE_DIFFICULTY_THRESHOLDS = {
  EASY: { playerWinRate: 0.7, wealthRatio: 2.0, reputationThreshold: 85 },
  NORMAL: { playerWinRate: 0.5, wealthRatio: 1.5, reputationThreshold: 70 },
  HARD: { playerWinRate: 0.3, wealthRatio: 1.0, reputationThreshold: 50 },
};
