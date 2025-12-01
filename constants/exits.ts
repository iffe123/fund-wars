import type { ExitOption, ExitType, PortfolioCompany, PlayerStats, MarketVolatility } from '../types';

export const EXIT_OPTIONS: ExitOption[] = [
  {
    type: 'IPO',
    name: 'Initial Public Offering',
    description: 'Take the company public. Maximum valuation potential but requires strong fundamentals and favorable market conditions.',
    icon: 'fa-chart-line',
    requirements: {
      minOwnershipMonths: 24,
      minValuation: 50000000,
      minEbitda: 10000000,
      minRevenueGrowth: 0.10,
      minReputation: 40,
      requiredMarketConditions: ['NORMAL', 'BULL_RUN'],
    },
    baseMultiple: 4.0,
    varianceRange: [-0.5, 1.5],
    timeToClose: 6,
    risks: [
      'Market volatility can tank the offering',
      'Lock-up period prevents immediate liquidity',
      'Public scrutiny of operations',
      'Ongoing compliance costs',
    ],
  },
  {
    type: 'STRATEGIC_SALE',
    name: 'Strategic Sale',
    description: 'Sell to a strategic buyer (corporate acquirer). Premium valuations for synergies but fewer potential buyers.',
    icon: 'fa-building',
    requirements: {
      minOwnershipMonths: 18,
      minValuation: 20000000,
      minReputation: 30,
    },
    baseMultiple: 3.0,
    varianceRange: [-0.3, 0.8],
    timeToClose: 4,
    risks: [
      'Limited buyer universe',
      'Synergy expectations may not materialize',
      'Cultural integration challenges',
      'Employee retention concerns',
    ],
  },
  {
    type: 'SECONDARY_SALE',
    name: 'Secondary Sale',
    description: 'Sell to another PE fund. Quick execution but typically lower multiples than strategic.',
    icon: 'fa-handshake',
    requirements: {
      minOwnershipMonths: 12,
      minValuation: 15000000,
    },
    baseMultiple: 2.2,
    varianceRange: [-0.2, 0.5],
    timeToClose: 3,
    risks: [
      'Buyer will re-leverage the company',
      'Lower multiple than strategic',
      'Limited upside sharing',
      'Reputation as "flipper"',
    ],
  },
  {
    type: 'DIVIDEND_RECAP',
    name: 'Dividend Recapitalization',
    description: 'Refinance the company and extract a special dividend. Keep ownership but increase risk.',
    icon: 'fa-money-bill-transfer',
    requirements: {
      minOwnershipMonths: 12,
      minEbitda: 5000000,
      minFinancialEngineering: 30,
    },
    baseMultiple: 1.5, // Returns 1.5x your investment in cash while keeping the company
    varianceRange: [-0.2, 0.3],
    timeToClose: 2,
    risks: [
      'Increased leverage on company',
      'Higher interest payments reduce growth',
      'Covenant risk increases',
      'May be seen as aggressive by LPs',
    ],
  },
  {
    type: 'LIQUIDATION',
    name: 'Liquidation',
    description: 'Wind down operations and sell assets. Last resort for failed investments.',
    icon: 'fa-skull',
    requirements: {
      minOwnershipMonths: 6,
    },
    baseMultiple: 0.3,
    varianceRange: [-0.2, 0.1],
    timeToClose: 6,
    risks: [
      'Significant capital loss',
      'Reputation damage',
      'Legal liabilities',
      'Employee terminations',
    ],
  },
];

export const getExitOptionByType = (type: ExitType): ExitOption | undefined => {
  return EXIT_OPTIONS.find(e => e.type === type);
};

export const getAvailableExits = (
  company: PortfolioCompany,
  playerStats: PlayerStats,
  marketVolatility: MarketVolatility,
  currentYear: number,
  currentMonth: number
): ExitOption[] => {
  const ownershipMonths = calculateOwnershipMonths(company, currentYear, currentMonth);

  return EXIT_OPTIONS.filter(exit => {
    const req = exit.requirements;

    if (req.minOwnershipMonths && ownershipMonths < req.minOwnershipMonths) return false;
    if (req.minValuation && company.currentValuation < req.minValuation) return false;
    if (req.minEbitda && company.ebitda < req.minEbitda) return false;
    if (req.minRevenueGrowth && company.revenueGrowth < req.minRevenueGrowth) return false;
    if (req.minReputation && playerStats.reputation < req.minReputation) return false;
    if (req.minFinancialEngineering && playerStats.financialEngineering < req.minFinancialEngineering) return false;
    if (req.requiredMarketConditions && !req.requiredMarketConditions.includes(marketVolatility)) return false;

    return true;
  });
};

export const calculateOwnershipMonths = (
  company: PortfolioCompany,
  currentYear: number,
  currentMonth: number
): number => {
  const acquisitionMonths = company.acquisitionDate.year * 12 + company.acquisitionDate.month;
  const currentMonths = currentYear * 12 + currentMonth;
  return currentMonths - acquisitionMonths;
};

export const calculateExitValue = (
  company: PortfolioCompany,
  exitOption: ExitOption,
  playerStats: PlayerStats,
  marketVolatility: MarketVolatility
): { exitValue: number; multiple: number; profit: number } => {
  const investmentCost = company.investmentCost;

  // Base calculation
  let multiple = exitOption.baseMultiple;

  // Apply variance
  const variance = exitOption.varianceRange[0] +
    Math.random() * (exitOption.varianceRange[1] - exitOption.varianceRange[0]);
  multiple += variance;

  // Market condition adjustments
  if (marketVolatility === 'BULL_RUN') {
    multiple *= 1.2;
  } else if (marketVolatility === 'CREDIT_CRUNCH') {
    multiple *= 0.85;
  } else if (marketVolatility === 'PANIC') {
    multiple *= 0.6;
  }

  // Financial engineering bonus
  if (playerStats.financialEngineering >= 50) {
    multiple *= 1.1;
  } else if (playerStats.financialEngineering >= 75) {
    multiple *= 1.2;
  }

  // Reputation bonus for IPO/Strategic
  if ((exitOption.type === 'IPO' || exitOption.type === 'STRATEGIC_SALE') && playerStats.reputation >= 60) {
    multiple *= 1.05;
  }

  // Company performance adjustments
  if (company.revenueGrowth > 0.20) {
    multiple *= 1.15;
  } else if (company.revenueGrowth < 0) {
    multiple *= 0.85;
  }

  // High debt penalty
  const debtToValuation = company.debt / company.currentValuation;
  if (debtToValuation > 0.7) {
    multiple *= 0.9;
  }

  // Calculate final values
  multiple = Math.max(0.1, multiple); // Floor at 0.1x
  const exitValue = Math.round(investmentCost * multiple);
  const profit = exitValue - investmentCost;

  return { exitValue, multiple, profit };
};

export const EXIT_FLAVOR_TEXT: Record<ExitType, { success: string[]; failure: string[] }> = {
  IPO: {
    success: [
      'The roadshow was a smashing success. Institutions are fighting for allocation.',
      'CNBC just called it "the IPO of the year." Your inbox is full of congratulations.',
      'The stock popped 40% on day one. Everyone pretends they saw this coming.',
    ],
    failure: [
      'The IPO window slammed shut. Markets tanked and the offering was pulled.',
      'Retail investors lost interest. The book was undersubscribed.',
      'A short seller published a damning report hours before pricing.',
    ],
  },
  STRATEGIC_SALE: {
    success: [
      'The strategic paid a premium for "synergies." Translation: they overpaid.',
      'Bidding war between two strategics drove the price above your wildest model.',
      'The CEO gets to stay on. The acquirer gets the tech. You get the check.',
    ],
    failure: [
      'The strategic walked after due diligence revealed the skeletons.',
      'Antitrust concerns killed the deal at the last minute.',
      'The strategic\'s stock crashed and they pulled their offer.',
    ],
  },
  SECONDARY_SALE: {
    success: [
      'Another fund is taking over. They think they can squeeze more juice from this lemon.',
      'Clean exit. The new sponsor has ambitious plans. Good luck to them.',
      'Sold to a mega-fund with deeper pockets. They\'ll load it with more debt.',
    ],
    failure: [
      'No one wants to buy your "turnaround story." The company stays on the books.',
      'The winning bidder\'s financing fell through. Back to square one.',
      'Every sponsor who looked walked away. What do they know that you don\'t?',
    ],
  },
  DIVIDEND_RECAP: {
    success: [
      'The banks were hungry for fees. You pulled out your entire investment and still own the company.',
      'Dividend recap complete. Cash in pocket, upside retained. Financial engineering at its finest.',
      'LPs are getting their money back early. They\'ll remember this for Fund II.',
    ],
    failure: [
      'The credit markets froze. No one will finance this recap.',
      'The company\'s cash flows can\'t support the new debt load. Deal killed.',
      'Rating agencies threatened a downgrade. The board pulled the plug.',
    ],
  },
  LIQUIDATION: {
    success: [
      'The assets fetched more than expected. At least it\'s not a total loss.',
      'Wind-down complete. Time to write the post-mortem and pretend you learned something.',
      'Salvaged what you could. The lawyers got paid. Everyone else... less so.',
    ],
    failure: [
      'The liquidation was a disaster. Assets sold for pennies on the dollar.',
      'Creditors are circling. There might not be anything left for equity.',
      'Environmental liabilities ate through the sale proceeds. Net zero.',
    ],
  },
};
