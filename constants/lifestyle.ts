/**
 * Lifestyle Constants
 *
 * Lifestyle system including tiers, personal finances, skill investments,
 * and life actions available to the player.
 */

import type { LifeAction, PersonalFinances, FundFinances, LifestyleLevel } from '../types';
import { PlayerLevel } from '../types';

// ==================== LIFESTYLE SYSTEM ====================
// Progressive lifestyle tiers affecting monthly burn, stress, and reputation

export const LIFESTYLE_TIERS: Record<LifestyleLevel, {
  name: string;
  monthlyBurn: number;
  description: string;
  perks: string[];
  stressModifier: number;       // Monthly stress change
  reputationModifier: number;   // One-time rep change when upgrading
  minLevelRequired: PlayerLevel;
}> = {
  BROKE_ASSOCIATE: {
    name: 'Broke Associate',
    monthlyBurn: 2000,
    description: 'Studio apartment in a sketchy neighborhood. Instant ramen is a food group.',
    perks: ['Builds character', 'Saves money'],
    stressModifier: +5,  // Living like this is stressful
    reputationModifier: 0,
    minLevelRequired: PlayerLevel.ASSOCIATE,
  },
  COMFORTABLE: {
    name: 'Comfortable',
    monthlyBurn: 5000,
    description: 'Decent 1BR, occasional Uber, dating is possible.',
    perks: ['Normal sleep schedule', 'Can bring dates home'],
    stressModifier: 0,
    reputationModifier: 0,
    minLevelRequired: PlayerLevel.ASSOCIATE,
  },
  ASPIRATIONAL: {
    name: 'Aspirational',
    monthlyBurn: 10000,
    description: 'Nice apartment, gym membership, respectable wardrobe.',
    perks: ['Look the part', 'Network at nice restaurants', '-5% stress from lifestyle'],
    stressModifier: -2,
    reputationModifier: +5,
    minLevelRequired: PlayerLevel.SENIOR_ASSOCIATE,
  },
  BALLER: {
    name: 'Baller',
    monthlyBurn: 25000,
    description: 'Luxury apartment, lease a BMW, bottle service on weekends.',
    perks: ['Impress clients', 'Access to exclusive events', '-10% stress'],
    stressModifier: -5,
    reputationModifier: +10,
    minLevelRequired: PlayerLevel.VICE_PRESIDENT,
  },
  MASTER_OF_UNIVERSE: {
    name: 'Master of the Universe',
    monthlyBurn: 50000,
    description: 'Penthouse, driver, art collection, ski trips to Aspen.',
    perks: ['Maximum prestige', 'LP-tier lifestyle', 'Automatic +5 reputation/month'],
    stressModifier: -10,
    reputationModifier: +25,
    minLevelRequired: PlayerLevel.PARTNER,
  },
};

// Default personal finances for new players
export const DEFAULT_PERSONAL_FINANCES: PersonalFinances = {
  bankBalance: 1500,             // Same as legacy cash
  totalEarnings: 0,
  salaryYTD: 0,
  bonusYTD: 0,
  carryReceived: 0,
  outstandingLoans: 0,
  loanInterestRate: 0,
  monthlyBurn: 2000,             // BROKE_ASSOCIATE tier
  lifestyleLevel: 'BROKE_ASSOCIATE',
};

// Default fund finances for Founders
export const DEFAULT_FUND_FINANCES: FundFinances = {
  totalCommitments: 0,
  calledCapital: 0,
  dryPowder: 0,
  deployedCapital: 0,
  realizedProceeds: 0,
  managementFeePool: 0,
  carryPool: 0,
};

// ==================== SKILL INVESTMENTS ====================
// Personal development options that cost money and time

export const SKILL_INVESTMENTS: {
  id: string;
  name: string;
  cost: number;
  timeWeeks: number;
  benefits: {
    analystRating?: number;
    financialEngineering?: number;
    reputation?: number;
    setsFlags?: string[];
  };
  description: string;
  prerequisites?: string[];
}[] = [
  {
    id: 'cfa_level1',
    name: 'CFA Level I',
    cost: 3000,
    timeWeeks: 12,
    benefits: { analystRating: 10, financialEngineering: 5 },
    description: 'The first step to becoming a chartered financial analyst. Mostly useful for the credential.',
  },
  {
    id: 'cfa_level2',
    name: 'CFA Level II',
    cost: 3500,
    timeWeeks: 16,
    benefits: { analystRating: 15, financialEngineering: 10 },
    description: 'The real grind begins. Asset valuation and financial reporting at an expert level.',
    prerequisites: ['cfa_level1'],
  },
  {
    id: 'cfa_level3',
    name: 'CFA Level III',
    cost: 4000,
    timeWeeks: 20,
    benefits: { analystRating: 20, reputation: 10, setsFlags: ['CFA_CHARTERHOLDER'] },
    description: 'Portfolio management and wealth planning. The final boss. You can put "CFA" after your name now.',
    prerequisites: ['cfa_level2'],
  },
  {
    id: 'executive_mba',
    name: 'Executive MBA',
    cost: 150000,
    timeWeeks: 52,
    benefits: { reputation: 20, setsFlags: ['HAS_EMBA'] },
    description: 'Two years of weekends at Wharton. Networking is the real value.',
    prerequisites: ['min_level_senior_associate'],
  },
  {
    id: 'modeling_bootcamp',
    name: 'Financial Modeling Bootcamp',
    cost: 2500,
    timeWeeks: 2,
    benefits: { financialEngineering: 15 },
    description: 'Two weeks of Excel hell. Your models will never be the same.',
  },
  {
    id: 'golf_lessons',
    name: 'Golf Lessons',
    cost: 5000,
    timeWeeks: 8,
    benefits: { reputation: 5, setsFlags: ['CAN_GOLF'] },
    description: 'Learn to play the real game of PE. Half your deals will close on the back nine.',
  },
  {
    id: 'mandarin_course',
    name: 'Mandarin Language Course',
    cost: 8000,
    timeWeeks: 24,
    benefits: { reputation: 10, setsFlags: ['SPEAKS_MANDARIN'] },
    description: 'Open doors to Chinese LP relationships and cross-border deals.',
  },
  {
    id: 'wine_sommelier',
    name: 'Wine Sommelier Certification',
    cost: 4000,
    timeWeeks: 6,
    benefits: { reputation: 8, setsFlags: ['WINE_EXPERT'] },
    description: 'Know your Burgundy from your Bordeaux. Essential for impressing at LP dinners.',
  },
  {
    id: 'negotiation_masterclass',
    name: 'Negotiation Masterclass',
    cost: 6000,
    timeWeeks: 4,
    benefits: { analystRating: 10, setsFlags: ['MASTER_NEGOTIATOR'] },
    description: 'Learn from former FBI hostage negotiators. Surprisingly applicable to term sheet negotiations.',
  },
];

export const VICE_ACTIONS: LifeAction[] = [
    {
      id: 'supplements',
      text: 'Experimental Supplements',
      icon: 'fa-pills',
      apCost: 1,
      outcome: {
        description: "You pop the unmarked pills. The world sharpens. You don't need sleep, you need results. You crush the model, but your heart is racing.",
        statChanges: { energy: +100, analystRating: +20, health: -5, dependency: +10, cash: -500, score: +100 }
      }
    },
    {
      id: 'gambling',
      text: 'High-Stakes Gambling',
      icon: 'fa-dice',
      apCost: 1,
      outcome: {
          description: "You hit the tables. For a moment, the adrenaline of the loss feels like the only real thing in your life.",
          statChanges: { stress: -30, cash: -50000, score: +200, dependency: +5 } // High risk, needs logic in App.tsx for win/loss
      }
    },
    {
      id: 'ghost',
      text: 'The Ghost Protocol',
      icon: 'fa-user-secret',
      apCost: 1,
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
        apCost: 1,
        outcome: {
            description: "You systematically plant errors in Sarah's work and frame her for the blown deal. She is fired. You survive. You monster.",
            statChanges: { reputation: +10, auditRisk: -20, stress: -10, ethics: -50, score: +500, removeNpcId: 'sarah' }
        }
    },
    {
        id: 'bribe',
        text: 'Regulatory Capture',
        icon: 'fa-handshake-simple',
        apCost: 1,
        outcome: {
            description: "You meet the regulator in a parking garage. An envelope changes hands. The investigation is dropped. You own him now.",
            statChanges: { cash: -100000, auditRisk: -50, ethics: -30, score: +300 } // Risk of prison handled in App.tsx
        }
    },
    {
        id: 'espionage',
        text: 'Corporate Espionage',
        icon: 'fa-mask',
        apCost: 1,
        outcome: {
            description: "You hire a private investigator to steal the competitor's IP roadmap. You win the bid knowing exactly what they have. It's beautiful.",
            statChanges: { cash: -50000, reputation: +20, analystRating: +20, ethics: -40, score: +600, auditRisk: +30 }
        }
    }
];

export const LIFE_ACTIONS: LifeAction[] = [
  // Self-Care (1 AP each)
  {
    id: 'gym',
    text: 'Go to the Gym',
    icon: 'fa-dumbbell',
    apCost: 1,
    outcome: {
      description: "You hit the gym, releasing some stress and reminding yourself that you're physically superior to the analysts. It costs a bit, but looking good is part of the job.",
      statChanges: { energy: +30, stress: -15, cash: -50, score: +50 },
    },
  },
  {
    id: 'therapy',
    text: 'Attend Therapy',
    icon: 'fa-brain',
    apCost: 1,
    outcome: {
      description: "You pay a stranger to listen to your problems. It's surprisingly effective for stress, but feels like an admission of weakness. And it's expensive.",
      statChanges: { stress: -30, cash: -300, energy: +5, score: -50 },
    },
  },
  {
    id: 'relax',
    text: 'Relax at Home',
    icon: 'fa-couch',
    apCost: 1,
    outcome: {
      description: "You actually take a night off. It feels... strange. While you recharged a little, you can't shake the feeling that your rivals are getting ahead.",
      statChanges: { energy: +10, stress: -20, score: -25 },
    },
  },
  // Career Building (1 AP)
  {
    id: 'networking',
    text: 'Attend Networking Event',
    icon: 'fa-martini-glass',
    apCost: 1,
    outcome: {
      description: "You schmooze with the best of them, making connections that might be useful later. It's draining, but your name is out there now.",
      statChanges: { reputation: +10, stress: +10, energy: -15, cash: -100, score: +100 },
    },
  },
  {
    id: 'study',
    text: 'Study Financial Engineering',
    icon: 'fa-book-open-reader',
    apCost: 1,
    outcome: {
        description: "Instead of sleeping, you study esoteric debt structures. You feel your brain expanding, or maybe that's just a caffeine-induced aneurysm. Either way, you're sharper.",
        statChanges: { financialEngineering: +5, energy: -10, stress: +5, score: +100 }
    }
  },
  {
    id: 'mentor_team',
    text: 'Mentor Juniors',
    icon: 'fa-chalkboard-user',
    apCost: 1,
    outcome: {
        description: "You take the analysts out for drinks and actually listen to their complaints. They look at you like a messiah. Building loyalty from the bottom up.",
        statChanges: { reputation: +5, ethics: +10, analystRating: +10, cash: -200, npcRelationshipUpdate: { npcId: 'sarah', change: 15, memory: 'Bought drinks for the team' } }
    }
  },
  {
    id: 'review_compliance',
    text: 'Review Compliance Logs',
    icon: 'fa-file-shield',
    apCost: 1,
    outcome: {
        description: "You spend a Saturday morning auditing your own email trails and compliance logs. It's incredibly boring, but you find a few red flags and delete... err, correct them.",
        statChanges: { auditRisk: -20, stress: +5, energy: -10, score: +50 }
    }
  },
  // High Impact (1 AP)
  {
    id: 'golf_outing',
    text: 'Golf with Partners',
    icon: 'fa-golf-ball-tee',
    apCost: 1,
    outcome: {
        description: "You drop $500 on greens fees to let the Managing Directors beat you. It's not about the game, it's about the face time. You laugh at their bad jokes.",
        statChanges: { reputation: +15, cash: -500, energy: -10, score: +200, npcRelationshipUpdate: { npcId: 'chad', change: 10, memory: 'Good sport on the golf course' } }
    }
  },
  {
    id: 'vacation',
    text: 'Take a Vacation',
    icon: 'fa-plane-departure',
    apCost: 1,
    outcome: {
      description: "You escape to a place without spreadsheets. The massive energy and stress recovery is offset by the deals you missed and the partners thinking you've gone soft.",
      statChanges: { energy: +50, stress: -40, cash: -2000, reputation: -5, score: -200 },
    },
  },
  {
    id: 'work_late',
    text: 'Work Late',
    icon: 'fa-moon',
    apCost: 1,
    outcome: {
      description: "You grind it out, refining models and making sure your name is on every important email. The partners notice your 'commitment.'",
      statChanges: { analystRating: +10, energy: -20, stress: +10, score: +75, npcRelationshipUpdate: { npcId: 'sarah', change: -5, memory: 'Kept team working late' } },
    },
  },
  // Financial Actions (1 AP)
  {
    id: 'hard_money_loan',
    text: 'Take Bridge Loan',
    icon: 'fa-skull-crossbones',
    apCost: 1,
    outcome: {
      description: "You sign a predatory term sheet. Cash hits the account fast, but the lender is circling for their pound of flesh.",
      statChanges: { cash: +50000, stress: +8, loanBalanceChange: +50000, loanRate: 0.15, score: +75 }, // Reduced from 28% to 15% for better balance
    },
  },
  {
    id: 'loan_payment',
    text: 'Pay Down Debt',
    icon: 'fa-money-bill-wave',
    apCost: 1,
    outcome: {
      description: "You wire a chunk back to the lender. It hurts the wallet, but at least the sharks ease off for a week.",
      statChanges: { cash: -10000, loanBalanceChange: -10000, stress: -2, score: +25 },
    },
  }
];
