import type {
  PlayerStats,
  PortfolioCompany,
  RivalFund,
  NPC,
  MarketVolatility,
  WorldTickResult,
  Warning,
  NPCDrama,
  RivalAction,
  MarketChange,
  CompanyActiveEvent,
  CompanyEventType,
} from '../types';

/**
 * World Progression Engine
 *
 * This engine processes world state changes each time tick, updating:
 * - Portfolio company performance (quarterly simulation)
 * - Player warnings (cash, health, stress, etc.)
 * - NPC drama triggers
 * - Rival fund actions
 * - Market-level events
 */

// Main world tick function - called each time advanceTime() runs
export const processWorldTick = (
  playerStats: PlayerStats,
  rivalFunds: RivalFund[],
  npcs: NPC[],
  currentWeek: number,
  marketVolatility: MarketVolatility
): WorldTickResult => {
  const result: WorldTickResult = {
    portfolioUpdates: new Map(),
    newEvents: [],
    warnings: [],
    npcDramas: [],
    rivalActions: [],
    marketChanges: [],
  };

  // 1. Update each portfolio company (quarterly - every 13 weeks)
  const isQuarterEnd = currentWeek % 13 === 0;

  playerStats.portfolio.forEach(company => {
    // Only process owned companies (deal closed)
    if (!company.dealClosed) return;

    let updates: Partial<PortfolioCompany> = {};

    if (isQuarterEnd) {
      updates = simulateCompanyQuarter(company, marketVolatility);
    }

    // Always check for triggered events
    const event = checkForCompanyEvent(company, updates, currentWeek);
    if (event) {
      updates.activeEvent = event;
      result.newEvents.push(event);
    }

    if (Object.keys(updates).length > 0) {
      result.portfolioUpdates.set(company.id, updates);
    }
  });

  // 2. Generate player warnings
  result.warnings = generateWarnings(playerStats, currentWeek);

  // 3. Check for NPC drama (10% chance per tick if conditions are met)
  if (Math.random() < 0.10) {
    const drama = checkForNPCDramas(npcs, currentWeek);
    if (drama) {
      result.npcDramas.push(drama);
    }
  }

  // 4. Simulate rival actions (5% chance per tick)
  if (Math.random() < 0.05) {
    const action = simulateRivalAction(rivalFunds, playerStats, currentWeek);
    if (action) {
      result.rivalActions.push(action);
    }
  }

  // 5. Check for market-level events (2% chance per tick)
  if (Math.random() < 0.02) {
    const marketChange = checkMarketEvents(marketVolatility, currentWeek);
    if (marketChange) {
      result.marketChanges.push(marketChange);
    }
  }

  return result;
};

// Simulate company performance each quarter
const simulateCompanyQuarter = (
  company: PortfolioCompany,
  marketVolatility: MarketVolatility
): Partial<PortfolioCompany> => {
  const updates: Partial<PortfolioCompany> = {};

  // Base revenue growth with variance
  let revenueGrowthRate = company.revenueGrowth;
  revenueGrowthRate += (Math.random() - 0.5) * 0.1; // +/-5% variance

  // Market impact
  switch (marketVolatility) {
    case 'PANIC':
      revenueGrowthRate -= 0.15;
      break;
    case 'CREDIT_CRUNCH':
      revenueGrowthRate -= 0.08;
      break;
    case 'BULL_RUN':
      revenueGrowthRate += 0.05;
      break;
    case 'NORMAL':
    default:
      break;
  }

  // CEO performance impact
  if (company.ceoPerformance < 30) revenueGrowthRate -= 0.05;
  if (company.ceoPerformance > 80) revenueGrowthRate += 0.03;

  // Board alignment impact
  if (company.boardAlignment < 40) revenueGrowthRate -= 0.02;

  // Calculate new revenue (quarterly growth = annual / 4)
  const quarterlyGrowth = revenueGrowthRate / 4;
  updates.revenue = Math.round(company.revenue * (1 + quarterlyGrowth));
  updates.revenueGrowth = revenueGrowthRate;

  // EBITDA follows revenue with margin pressure
  const marginPressure = Math.random() > 0.7 ? -0.02 : 0.01;
  updates.ebitdaMargin = Math.max(0.05, Math.min(0.5, company.ebitdaMargin + marginPressure));
  updates.ebitda = Math.round((updates.revenue || company.revenue) * updates.ebitdaMargin);

  // Valuation update (simplified DCF proxy using EBITDA multiple)
  const baseMultiple = 8;
  const growthPremium = Math.max(0, revenueGrowthRate) * 20; // Growth companies get premium
  const ebitdaMultiple = baseMultiple + growthPremium;
  updates.currentValuation = Math.round((updates.ebitda || company.ebitda) * ebitdaMultiple);

  // Employee changes based on revenue trajectory
  if (revenueGrowthRate > 0.15) {
    const hirings = Math.floor(company.employeeCount * 0.05);
    updates.employeeCount = company.employeeCount + hirings;
    updates.employeeGrowth = 0.05;
  } else if (revenueGrowthRate < -0.1) {
    const layoffs = Math.floor(company.employeeCount * 0.1);
    updates.employeeCount = Math.max(10, company.employeeCount - layoffs);
    updates.employeeGrowth = -0.1;
  } else {
    updates.employeeGrowth = 0;
  }

  // Cash balance update (rough approximation)
  const quarterlyEbitda = (updates.ebitda || company.ebitda) / 4;
  const debtService = company.debt * 0.02; // ~8% annual interest / 4
  const cashFlow = quarterlyEbitda - debtService;
  updates.cashBalance = Math.max(0, company.cashBalance + cashFlow);

  // Runway calculation for growth companies (negative EBITDA)
  if ((updates.ebitda || company.ebitda) < 0) {
    const monthlyBurn = Math.abs((updates.ebitda || company.ebitda) / 12);
    updates.runwayMonths = Math.floor(updates.cashBalance / Math.max(1, monthlyBurn));
  } else {
    updates.runwayMonths = 999; // Profitable, infinite runway
  }

  // Customer churn variation (for SaaS-like businesses)
  if (company.customerChurn > 0) {
    const churnVariance = (Math.random() - 0.5) * 0.02;
    updates.customerChurn = Math.max(0, Math.min(0.3, company.customerChurn + churnVariance));
  }

  // Management degradation (if not maintained)
  if (Math.random() > 0.9) {
    updates.ceoPerformance = Math.max(20, company.ceoPerformance - 5);
  }

  // Board alignment can drift
  if (Math.random() > 0.85) {
    const alignmentDrift = (Math.random() - 0.5) * 10;
    updates.boardAlignment = Math.max(20, Math.min(100, company.boardAlignment + alignmentDrift));
  }

  return updates;
};

// Check if a company event should trigger
const checkForCompanyEvent = (
  company: PortfolioCompany,
  updates: Partial<PortfolioCompany>,
  currentWeek: number
): CompanyActiveEvent | null => {
  // Don't trigger if company already has active event
  if (company.activeEvent) return null;

  // Base probability per week (8% chance)
  let probability = 0.08;

  // Adjust based on company health
  const effectiveRevenueGrowth = updates.revenueGrowth ?? company.revenueGrowth;
  const effectiveCeoPerformance = updates.ceoPerformance ?? company.ceoPerformance;
  const effectiveBoardAlignment = updates.boardAlignment ?? company.boardAlignment;

  if (effectiveRevenueGrowth < -0.1) probability += 0.10; // Struggling companies have more events
  if (effectiveCeoPerformance < 40) probability += 0.05;
  if (effectiveBoardAlignment < 50) probability += 0.05;

  if (Math.random() > probability) return null;

  // Select event type based on company state
  const possibleEvents: CompanyEventType[] = [];

  if (effectiveRevenueGrowth < 0) {
    possibleEvents.push('REVENUE_DROP');
  }
  if (Math.random() > 0.7) {
    possibleEvents.push('KEY_CUSTOMER_LOSS');
  }
  if (effectiveCeoPerformance < 50 || Math.random() > 0.85) {
    possibleEvents.push('MANAGEMENT_DEPARTURE');
  }
  if (company.currentValuation > 100000000) {
    possibleEvents.push('ACTIVIST_INVESTOR');
    if (Math.random() > 0.6) {
      possibleEvents.push('STRATEGIC_BUYER_INTEREST');
    }
  }
  if (effectiveRevenueGrowth > 0.2 && company.currentValuation > 50000000) {
    possibleEvents.push('IPO_WINDOW');
  }
  if (Math.random() > 0.9) {
    possibleEvents.push('COMPETITOR_THREAT');
  }
  if (Math.random() > 0.95) {
    possibleEvents.push('REGULATORY_ISSUE');
    possibleEvents.push('SUPPLY_CHAIN_CRISIS');
  }

  if (possibleEvents.length === 0) {
    // Default to a random event
    possibleEvents.push('COMPETITOR_THREAT');
  }

  const selectedType = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];

  // Event will be generated by the companyEvents.ts constants file
  // Return a placeholder that will be replaced with the full event
  return {
    id: `${selectedType.toLowerCase()}_${company.id}_${Date.now()}`,
    type: selectedType,
    title: getEventTitle(selectedType),
    description: `A ${selectedType.replace(/_/g, ' ').toLowerCase()} event is affecting ${company.name}.`,
    severity: getEventSeverity(selectedType),
    options: [], // Will be populated by the event library
    expiresWeek: currentWeek + 3,
    consultWithMachiavelli: shouldConsultMachiavelli(selectedType),
  };
};

const getEventTitle = (type: CompanyEventType): string => {
  const titles: Record<CompanyEventType, string> = {
    REVENUE_DROP: 'Revenue Miss',
    KEY_CUSTOMER_LOSS: 'Major Customer Churning',
    MANAGEMENT_DEPARTURE: 'Executive Resignation',
    COMPETITOR_THREAT: 'Competitive Pressure',
    ACQUISITION_OPPORTUNITY: 'Bolt-On Opportunity',
    REGULATORY_ISSUE: 'Regulatory Scrutiny',
    UNION_DISPUTE: 'Labor Dispute',
    SUPPLY_CHAIN_CRISIS: 'Supply Chain Disruption',
    ACTIVIST_INVESTOR: 'Activist Approaches',
    IPO_WINDOW: 'IPO Window Opens',
    STRATEGIC_BUYER_INTEREST: 'Strategic Interest',
  };
  return titles[type] || 'Company Event';
};

const getEventSeverity = (type: CompanyEventType): 'INFO' | 'WARNING' | 'CRITICAL' => {
  const severities: Record<CompanyEventType, 'INFO' | 'WARNING' | 'CRITICAL'> = {
    REVENUE_DROP: 'WARNING',
    KEY_CUSTOMER_LOSS: 'CRITICAL',
    MANAGEMENT_DEPARTURE: 'WARNING',
    COMPETITOR_THREAT: 'WARNING',
    ACQUISITION_OPPORTUNITY: 'INFO',
    REGULATORY_ISSUE: 'CRITICAL',
    UNION_DISPUTE: 'WARNING',
    SUPPLY_CHAIN_CRISIS: 'CRITICAL',
    ACTIVIST_INVESTOR: 'CRITICAL',
    IPO_WINDOW: 'INFO',
    STRATEGIC_BUYER_INTEREST: 'INFO',
  };
  return severities[type] || 'WARNING';
};

const shouldConsultMachiavelli = (type: CompanyEventType): boolean => {
  const consultTypes: CompanyEventType[] = [
    'REVENUE_DROP',
    'KEY_CUSTOMER_LOSS',
    'ACTIVIST_INVESTOR',
    'REGULATORY_ISSUE',
    'STRATEGIC_BUYER_INTEREST',
  ];
  return consultTypes.includes(type);
};

// Generate warnings based on player state
export const generateWarnings = (playerStats: PlayerStats, currentWeek: number): Warning[] => {
  const warnings: Warning[] = [];

  // Cash warning
  if (playerStats.cash < 5000) {
    warnings.push({
      id: 'low_cash',
      type: 'CASH',
      severity: playerStats.cash < 1000 ? 'CRITICAL' : 'HIGH',
      title: 'Low Cash Balance',
      message: `Only $${playerStats.cash.toLocaleString()} remaining. Consider taking a loan or reducing lifestyle.`,
      currentValue: playerStats.cash,
      threshold: 5000,
      suggestedAction: 'Open Financial menu to take a bridge loan',
    });
  }

  // Health warning
  if (playerStats.health < 30) {
    warnings.push({
      id: 'low_health',
      type: 'HEALTH',
      severity: playerStats.health < 15 ? 'CRITICAL' : 'HIGH',
      title: 'Health Crisis',
      message: `Your health is at ${playerStats.health}%. Burnout is imminent. Take time off.`,
      currentValue: playerStats.health,
      threshold: 30,
      suggestedAction: 'Take a vacation in Life Actions',
    });
  }

  // Stress warning
  if (playerStats.stress > 80) {
    warnings.push({
      id: 'high_stress',
      type: 'STRESS',
      severity: playerStats.stress > 90 ? 'CRITICAL' : 'HIGH',
      title: 'Stress Overload',
      message: `Stress at ${playerStats.stress}%. You're on the edge of a breakdown.`,
      currentValue: playerStats.stress,
      threshold: 80,
      suggestedAction: 'Reduce workload or use stress relief options',
    });
  }

  // Reputation warning
  if (playerStats.reputation < 30) {
    warnings.push({
      id: 'low_reputation',
      type: 'REPUTATION',
      severity: playerStats.reputation < 15 ? 'CRITICAL' : 'HIGH',
      title: 'Reputation Damage',
      message: `Your reputation is at ${playerStats.reputation}. People are losing faith in you.`,
      currentValue: playerStats.reputation,
      threshold: 30,
      suggestedAction: 'Focus on relationship building and successful deals',
    });
  }

  // Loan interest warning
  if (playerStats.loanBalance > 0) {
    const weeklyInterest = (playerStats.loanBalance * playerStats.loanRate) / 52;
    if (weeklyInterest > playerStats.cash * 0.2) {
      warnings.push({
        id: 'loan_burden',
        type: 'LOAN',
        severity: weeklyInterest > playerStats.cash * 0.4 ? 'HIGH' : 'MEDIUM',
        title: 'Heavy Debt Burden',
        message: `Weekly interest of $${Math.round(weeklyInterest).toLocaleString()} is eating your income.`,
        currentValue: playerStats.loanBalance,
        suggestedAction: 'Pay down debt when possible',
      });
    }
  }

  // Portfolio company crisis warnings
  playerStats.portfolio.forEach(company => {
    if (company.hasBoardCrisis) {
      warnings.push({
        id: `crisis_${company.id}`,
        type: 'PORTFOLIO',
        severity: 'HIGH',
        title: `Crisis at ${company.name}`,
        message: `${company.name} has an active board crisis requiring your attention.`,
        suggestedAction: `Open Portfolio and address ${company.name}`,
      });
    }

    // Active event warning
    if (company.activeEvent) {
      const weeksRemaining = company.activeEvent.expiresWeek - currentWeek;
      if (weeksRemaining <= 2) {
        warnings.push({
          id: `event_deadline_${company.id}`,
          type: 'DEADLINE',
          severity: weeksRemaining <= 1 ? 'CRITICAL' : 'HIGH',
          title: `Decision Required: ${company.name}`,
          message: `${company.activeEvent.title} requires a decision in ${weeksRemaining} week${weeksRemaining !== 1 ? 's' : ''}.`,
          suggestedAction: `Address the ${company.activeEvent.type.replace(/_/g, ' ').toLowerCase()} at ${company.name}`,
        });
      }
    }

    // Low runway warning for growth companies
    if (company.runwayMonths < 12 && company.ebitda < 0) {
      warnings.push({
        id: `runway_${company.id}`,
        type: 'PORTFOLIO',
        severity: company.runwayMonths < 6 ? 'CRITICAL' : 'HIGH',
        title: `${company.name} Running Low on Cash`,
        message: `Only ${company.runwayMonths} months of runway remaining. Consider additional funding.`,
        currentValue: company.runwayMonths,
        threshold: 12,
        suggestedAction: `Review ${company.name} financials and consider capital injection`,
      });
    }
  });

  return warnings;
};

// Check for NPC drama triggers
const checkForNPCDramas = (npcs: NPC[], currentWeek: number): NPCDrama | null => {
  // Find NPCs with high relationship levels (potential for drama)
  const relevantNpcs = npcs.filter(npc =>
    npc.relationship >= 40 && !npc.isRival
  );

  if (relevantNpcs.length < 2) return null;

  // Check for specific drama conditions
  const sarah = npcs.find(n => n.id === 'sarah');
  const hunter = npcs.find(n => n.id === 'hunter');
  const chad = npcs.find(n => n.id === 'chad');
  const emma = npcs.find(n => n.id === 'girlfriend_emma');

  // Sarah vs Hunter rivalry
  if (sarah && hunter && sarah.relationship >= 40 && hunter.relationship >= 40) {
    if (Math.random() > 0.7) {
      return {
        id: 'sarah_hunter_rivalry',
        title: 'Office Politics Erupts',
        description: `Sarah storms into your office. "Hunter is taking credit for MY model work on the PackFancy deal. I've been here until 2am for weeks while he schmoozed clients. Now he's telling Chad HE ran the analysis?" She's furious. Hunter's version is... different.`,
        involvedNpcs: ['sarah', 'hunter'],
        playerMustChooseSide: true,
        urgency: 'MEDIUM',
        expiresWeek: currentWeek + 2,
        choices: [
          {
            text: 'Back Sarah',
            description: 'Tell Chad the truth. Sarah did the work.',
            outcome: {
              description: 'Sarah is vindicated. Hunter is humiliated—and now your enemy.',
              statChanges: {
                npcRelationshipUpdate: { npcId: 'sarah', change: 25, memory: 'Defended me when it mattered' },
                npcRelationshipUpdate2: { npcId: 'hunter', change: -30, memory: 'Sided against me in front of Chad' },
              },
            },
          },
          {
            text: 'Back Hunter',
            description: 'Tell Chad they were both involved. Give Hunter the win.',
            outcome: {
              description: 'Hunter owes you one. Sarah looks at you differently now.',
              statChanges: {
                npcRelationshipUpdate: { npcId: 'hunter', change: 20, memory: 'Had my back in the credit dispute' },
                npcRelationshipUpdate2: { npcId: 'sarah', change: -20, trustChange: -15, memory: 'Threw me under the bus' },
              },
            },
          },
          {
            text: 'Stay out of it',
            description: "Not your circus, not your monkeys.",
            outcome: {
              description: "Both feel abandoned. But at least you didn't make an enemy.",
              statChanges: {
                npcRelationshipUpdate: { npcId: 'sarah', change: -10, memory: "Wouldn't stand up for me" },
                npcRelationshipUpdate2: { npcId: 'hunter', change: -5, memory: 'Too weak to pick a side' },
                reputation: -5,
              },
            },
          },
        ],
      };
    }
  }

  // Chad's secret
  if (chad && chad.relationship >= 30 && Math.random() > 0.8) {
    return {
      id: 'chad_secret',
      title: "Chad's Little Problem",
      description: `Late night at the office. Chad pulls you aside. He's been drinking. "Listen, kid. I made a mistake. Told an LP we have a deal in exclusivity when... we don't. The meeting is tomorrow. I need you to make it look real. Create a fake data room. Just for 24 hours." He looks desperate.`,
      involvedNpcs: ['chad'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 1,
      choices: [
        {
          text: 'Cover for him',
          description: 'Build the fake data room. Help Chad save face.',
          outcome: {
            description: "The LP is fooled. Chad owes you everything. But you've crossed a line.",
            statChanges: {
              ethics: -30,
              auditRisk: +20,
              npcRelationshipUpdate: { npcId: 'chad', change: 40, trustChange: 30, memory: 'Saved my career when I needed it' },
              setsFlags: ['COVERED_FOR_CHAD'],
            },
          },
        },
        {
          text: "I can't do that",
          description: 'Tell Chad he needs to come clean.',
          outcome: {
            description: 'Chad stares at you coldly. "Remember this moment." He finds another way. Your ethics intact, your career at risk.',
            statChanges: {
              ethics: +20,
              npcRelationshipUpdate: { npcId: 'chad', change: -35, trustChange: -20, memory: 'Abandoned me in my hour of need' },
              reputation: -10,
            },
          },
        },
        {
          text: 'Anonymous compliance tip',
          description: 'Protect yourself. Report to the compliance hotline.',
          outcome: {
            description: "Compliance investigates. Chad is put on leave. You're safe... for now. But someone will figure out it was you.",
            statChanges: {
              ethics: +30,
              reputation: +15,
              auditRisk: -20,
              npcRelationshipUpdate: { npcId: 'chad', change: -50, memory: 'The rat who ended my career' },
              setsFlags: ['WHISTLEBLOWER_CHAD'],
            },
          },
        },
      ],
    };
  }

  // Emma jealousy
  if (emma && sarah && emma.relationship >= 50 && sarah.relationship >= 60 && Math.random() > 0.85) {
    return {
      id: 'emma_jealousy',
      title: 'Emma Suspects Something',
      description: `Emma scrolls through your phone. "Who's Sarah? Why are you texting at midnight about 'models'?" She's not buying the "work colleague" explanation. Meanwhile, Sarah has been staying late specifically when you're in the office...`,
      involvedNpcs: ['girlfriend_emma', 'sarah'],
      playerMustChooseSide: false,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 3,
      choices: [
        {
          text: 'Prove your commitment to Emma',
          description: 'Plan a special weekend. Distance yourself from Sarah at work.',
          outcome: {
            description: 'Emma feels loved. Sarah notices the cold shoulder and focuses on work.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'girlfriend_emma', change: 20, trustChange: 15, memory: 'Chose me over everything' },
              npcRelationshipUpdate2: { npcId: 'sarah', change: -10, memory: 'Suddenly became distant' },
              cash: -3000,
            },
          },
        },
        {
          text: 'Better at compartmentalizing',
          description: 'Keep both relationships but be more careful about communication.',
          outcome: {
            description: "You're walking a tightrope. Nothing changes, but everything feels fragile.",
            statChanges: {
              stress: +15,
            },
          },
        },
        {
          text: 'Examine your feelings',
          description: 'Maybe there IS something with Sarah...',
          outcome: {
            description: "You spend a long night thinking. The answer isn't clear, but the question is now real.",
            statChanges: {
              stress: +10,
              setsFlags: ['CONSIDERING_SARAH'],
            },
          },
        },
      ],
    };
  }

  return null;
};

// Simulate a rival fund action
const simulateRivalAction = (
  rivalFunds: RivalFund[],
  playerStats: PlayerStats,
  currentWeek: number
): RivalAction | null => {
  if (rivalFunds.length === 0) return null;

  const rival = rivalFunds[Math.floor(Math.random() * rivalFunds.length)];

  // Different actions based on rival strategy
  const actions = getRivalActionsByStrategy(rival, playerStats);
  if (actions.length === 0) return null;

  const action = actions[Math.floor(Math.random() * actions.length)];

  return {
    rivalId: rival.id,
    action: action.type,
    target: action.target,
    impact: action.impact,
  };
};

const getRivalActionsByStrategy = (
  rival: RivalFund,
  playerStats: PlayerStats
): Array<{ type: string; target?: string; impact: string }> => {
  const actions: Array<{ type: string; target?: string; impact: string }> = [];

  switch (rival.strategy) {
    case 'PREDATORY':
      if (playerStats.portfolio.length > 0) {
        const target = playerStats.portfolio[Math.floor(Math.random() * playerStats.portfolio.length)];
        actions.push({
          type: 'POACHING_ATTEMPT',
          target: target.name,
          impact: `${rival.name} is trying to recruit key talent from ${target.name}.`,
        });
      }
      actions.push({
        type: 'MARKET_RUMOR',
        impact: `${rival.name} is spreading rumors about your fund's performance.`,
      });
      break;

    case 'AGGRESSIVE':
      actions.push({
        type: 'DEAL_SNIPING',
        impact: `${rival.name} is aggressively bidding on deals in your target sectors.`,
      });
      break;

    case 'OPPORTUNISTIC':
      if (playerStats.reputation < 50) {
        actions.push({
          type: 'LP_APPROACH',
          impact: `${rival.name} is reaching out to your LPs, sensing weakness.`,
        });
      }
      break;

    case 'CONSERVATIVE':
      actions.push({
        type: 'MARKET_OBSERVATION',
        impact: `${rival.name} is quietly building war chest and watching the market.`,
      });
      break;
  }

  return actions;
};

// Check for market-level events
const checkMarketEvents = (
  currentVolatility: MarketVolatility,
  currentWeek: number
): MarketChange | null => {
  const changes: MarketChange[] = [
    {
      type: 'SECTOR_ROTATION',
      description: 'Investors are rotating out of tech into industrials.',
      impact: { reputation: -2 },
    },
    {
      type: 'INTEREST_RATE',
      description: 'Fed signals potential rate changes, affecting deal financing.',
      impact: { stress: 5 },
    },
    {
      type: 'CREDIT_CONDITIONS',
      description: 'Credit markets tightening, making LBO financing more expensive.',
      impact: { cash: -1000 },
    },
  ];

  if (currentVolatility === 'NORMAL') {
    changes.push({
      type: 'VOLATILITY_SHIFT',
      description: 'Market sentiment shifting, volatility increasing.',
      impact: { stress: 3 },
    });
  }

  return changes[Math.floor(Math.random() * changes.length)];
};

// Helper function to get company status
export const getCompanyStatus = (company: PortfolioCompany): 'PIPELINE' | 'OWNED' | 'EXITING' => {
  if (company.isInExitProcess) return 'EXITING';
  if (company.dealClosed) return 'OWNED';
  return 'PIPELINE';
};

// Helper function to calculate MOIC for a company
export const calculateCompanyMOIC = (company: PortfolioCompany): number => {
  if (company.investmentCost <= 0) return 1.0;
  return company.currentValuation / company.investmentCost;
};

// Helper function to initialize new portfolio company fields
export const initializePortfolioCompanyFields = (
  company: Partial<PortfolioCompany>
): Partial<PortfolioCompany> => {
  return {
    ...company,
    employeeCount: company.employeeCount ?? Math.floor((company.revenue || 10000000) / 200000),
    employeeGrowth: company.employeeGrowth ?? 0,
    ebitdaMargin: company.ebitdaMargin ?? ((company.ebitda || 0) / Math.max(1, company.revenue || 1)),
    cashBalance: company.cashBalance ?? Math.floor((company.ebitda || 0) * 0.5),
    runwayMonths: company.runwayMonths ?? 999,
    customerChurn: company.customerChurn ?? 0.05,
    ceoPerformance: company.ceoPerformance ?? 70,
    boardAlignment: company.boardAlignment ?? 80,
    managementTeam: company.managementTeam ?? [],
    dealClosed: company.dealClosed ?? true,
    isInExitProcess: company.isInExitProcess ?? false,
    pendingDecisions: company.pendingDecisions ?? [],
    nextBoardMeetingWeek: company.nextBoardMeetingWeek ?? 0,
    lastFinancialUpdate: company.lastFinancialUpdate ?? 0,
  };
};
