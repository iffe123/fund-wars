/**
 * Rivals Constants
 *
 * Rival fund definitions, competitive deals, bidding strategies,
 * taunts, and AI personality configurations.
 */

import type { RivalFund, CompetitiveDeal, RivalStrategy } from '../types';
import { DealType } from '../types';

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
