import type { PortfolioCompany } from '../../../types';

export interface ICPrepBrief {
  headline: string;
  thesis: string;
  whyNow: string;
  proofPoints: string[];
  risks: string[];
  playbook: string[];
  suggestedOpening: string;
}

export interface DealCapitalSnapshot {
  entryMultiple: number;
  entryEnterpriseValue: number;
  debtAmount: number;
  debtPercent: number;
  equityCheck: number;
  leverageMultiple: number;
  exitMultiple: number;
}

const formatMoneyShort = (value: number): string => {
  return `$${(value / 1000000).toFixed(0)}M`;
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
};

const hasPatentAngle = (deal: PortfolioCompany): boolean => {
  return /patent|ip|coating tech/i.test(deal.latestCeoReport || '');
};

const getDealEdge = (deal: PortfolioCompany): string => {
  if (hasPatentAngle(deal)) {
    return `${deal.name} looks like a sleepy packaging company, but the hidden IP gives us a differentiated exit story.`;
  }

  if (deal.revenueGrowth <= 0.03 && deal.ceoPerformance < 75) {
    return `${deal.name} is under-managed rather than broken, which creates a clean control-deal angle.`;
  }

  if (deal.revenueGrowth >= 0.08) {
    return `${deal.name} has real growth, but the case only works if we professionalize execution faster than rivals can.`;
  }

  return `${deal.name} is a fixable mid-market asset where disciplined execution can unlock returns the current owner is not capturing.`;
};

export const getDealCapitalSnapshot = (deal: PortfolioCompany): DealCapitalSnapshot => {
  const entryMultiple = deal.leverageModelParams?.entryMultiple ?? (deal.currentValuation / Math.max(deal.ebitda, 1));
  const entryEnterpriseValue = deal.leverageModelParams?.enterpriseValue
    ?? (deal.leverageModelParams?.entryMultiple ? deal.ebitda * entryMultiple : deal.currentValuation);
  const debtAmount = deal.leverageModelParams?.debtAmount ?? deal.debt;
  const debtPercent = deal.leverageModelParams?.debtPercent
    ?? (entryEnterpriseValue > 0 ? debtAmount / entryEnterpriseValue : 0);
  const equityCheck = deal.leverageModelParams?.equityCheck
    ?? (deal.investmentCost > 0 ? deal.investmentCost : Math.max(entryEnterpriseValue - debtAmount, 0));
  const leverageMultiple = deal.ebitda > 0 ? debtAmount / deal.ebitda : 0;
  const exitMultiple = deal.leverageModelParams?.exitMultiple ?? entryMultiple;

  return {
    entryMultiple,
    entryEnterpriseValue,
    debtAmount,
    debtPercent,
    equityCheck,
    leverageMultiple,
    exitMultiple,
  };
};

export const buildICPrepBrief = (deal: PortfolioCompany): ICPrepBrief => {
  const capital = getDealCapitalSnapshot(deal);
  const { entryMultiple, equityCheck, exitMultiple } = capital;
  const projectedIRR = deal.leverageModelParams?.projectedIRR ?? 0;
  const projectedMOIC = deal.leverageModelParams?.projectedMOIC ?? 0;
  const leverage = capital.leverageMultiple;
  const exitExpansionTurns = exitMultiple - entryMultiple;
  const reliesOnExpansion = exitExpansionTurns > 0.25;

  const headline = hasPatentAngle(deal)
    ? 'Pitch the hidden-value angle, not the boring surface story.'
    : 'Lead with the one thing only you seem to understand about this asset.';

  const thesis = reliesOnExpansion
    ? `Back ${deal.name} at ${entryMultiple.toFixed(1)}x with a ${formatMoneyShort(equityCheck)} equity check, with EBITDA improvement doing the heavy lifting and any exit rerating treated as upside instead of the whole case.`
    : `Back ${deal.name} at ${entryMultiple.toFixed(1)}x with a ${formatMoneyShort(equityCheck)} equity check, then create value through operational discipline instead of hoping for multiple expansion.`;
  const whyNow = getDealEdge(deal);

  const proofPoints = [
    `${formatMoneyShort(deal.revenue)} of revenue and ${formatMoneyShort(deal.ebitda)} of EBITDA at a ${formatPercent(deal.ebitdaMargin)} margin base.`,
    deal.leverageModelParams
      ? `Your model underwrites ${(projectedIRR * 100).toFixed(1)}% IRR and ${projectedMOIC.toFixed(2)}x MOIC.`
      : `You still need to defend what returns justify paying ${entryMultiple.toFixed(1)}x.`,
    deal.revenueGrowth > 0
      ? `Growth is only ${formatPercent(deal.revenueGrowth)}, so the story has to be execution-led, not a fantasy hockey-stick.`
      : 'Growth is stalling, which makes your turnaround plan the whole deal.',
  ];

  if (hasPatentAngle(deal)) {
    proofPoints.push('The buried IP / coating angle is your differentiated edge. If you found it, use it.');
  }

  const risks = [
    leverage >= 4
      ? `Leverage is ${leverage.toFixed(1)}x, so you need a real downside answer if EBITDA slips.`
      : `Low leverage is not a free pass. You still need to explain what breaks the thesis.`,
    deal.ceoPerformance < 75
      ? `${deal.ceo} is a live management question. Explain whether you back, support, or replace them.`
      : `${deal.ceo} is credible, but you still need a plan that does not depend on perfect execution.`,
    reliesOnExpansion
      ? `Your base case exits at ${exitMultiple.toFixed(1)}x versus ${entryMultiple.toFixed(1)}x in. Be ready to explain why the deal still works if that rerating never shows up.`
      : projectedIRR > 0 && projectedIRR < 0.18
      ? 'Returns are fine, not amazing. You need to prove why this deal still deserves scarce capital.'
      : 'Partners will test whether your return case is real or just spreadsheet decoration.',
  ];

  const playbook = [
    'Open with one sentence on why the asset is mispriced.',
    'Use one hard number on returns and one hard number on downside in your first minute.',
    'When challenged, answer the exact question first, then return to the thesis.',
    'If they push on risk, say the risk out loud and explain the mitigation in the same breath.',
  ];

  const suggestedOpening = [
    `We should stay in on ${deal.name} because the asset is better than the headline story and we can underwrite a real path to value creation at ${entryMultiple.toFixed(1)}x.`,
    deal.leverageModelParams
      ? reliesOnExpansion
        ? `At our modeled entry, we can get to ${(projectedIRR * 100).toFixed(1)}% IRR and ${projectedMOIC.toFixed(2)}x MOIC if EBITDA growth does the heavy lifting; the ${exitExpansionTurns.toFixed(1)}x of exit rerating is upside, not the whole underwriting case.`
        : `At our modeled entry, we can get to ${(projectedIRR * 100).toFixed(1)}% IRR and ${projectedMOIC.toFixed(2)}x MOIC through execution, not just exit multiple hope.`
      : `The return case only works if we stay disciplined on price and operational levers.`,
    `The key risks are leverage, management execution, and ${hasPatentAngle(deal) ? 'whether the IP can actually be commercialized' : 'whether the business can sustain margin improvement'}, and here is how we control them.`,
  ].join(' ');

  return {
    headline,
    thesis,
    whyNow,
    proofPoints,
    risks,
    playbook,
    suggestedOpening,
  };
};
