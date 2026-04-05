import { describe, expect, it } from 'vitest';
import { DealType, type PortfolioCompany } from '../types';
import type { PitchEvaluation, ICPartnerVote } from '../features/investment-committee/types/icTypes';
import { generateVerdict } from '../features/investment-committee/services/icEvaluationEngine';
import { buildICPrepBrief, getDealCapitalSnapshot } from '../features/investment-committee/utils/icPrep';

const packFancyDeal: PortfolioCompany = {
  id: 1,
  name: 'PackFancy Inc.',
  ceo: 'Doris Chen',
  investmentCost: 0,
  ownershipPercentage: 0,
  currentValuation: 55000000,
  latestCeoReport: 'PATENT #8829 DISCOVERED: Hydrophobic Coating Tech. Valuation +40%.',
  nextBoardMeeting: 'TBD',
  dealType: DealType.LBO,
  revenue: 120000000,
  ebitda: 15000000,
  debt: 30000000,
  revenueGrowth: 0.02,
  acquisitionDate: { year: 1, month: 1 },
  eventHistory: [],
  isAnalyzed: true,
  employeeCount: 450,
  employeeGrowth: 0.01,
  ebitdaMargin: 0.125,
  cashBalance: 8000000,
  runwayMonths: 18,
  customerChurn: 0.05,
  ceoPerformance: 70,
  boardAlignment: 65,
  managementTeam: [],
  dealClosed: false,
  isInExitProcess: false,
  nextBoardMeetingWeek: 12,
  lastFinancialUpdate: 0,
  dealPhase: 'IOI_SUBMITTED',
  actionsThisWeek: [],
  lastManagementActions: {} as any,
  pendingDecisions: [],
  leverageModelViewed: true,
  leverageModelParams: {
    entryMultiple: 3.7,
    exitMultiple: 4.2,
    projectedIRR: 0.214,
    projectedMOIC: 2.26,
    enterpriseValue: 55500000,
    debtAmount: 27750000,
    debtPercent: 0.5,
    equityCheck: 27750000,
  },
};

const solidEvaluation: PitchEvaluation = {
  dimensions: {
    thesisClarity: 0.72,
    financialRigor: 0.7,
    riskAwareness: 0.68,
    valueCreation: 0.71,
    conviction: 0.66,
    specificity: 0.73,
  },
  redFlags: ['Needs a tighter downside frame'],
  strongPoints: ['Clear investment thesis', 'Good use of specific details'],
  overallScore: 0.71,
};

describe('First-deal flow tuning', () => {
  it('derives a coherent capital snapshot from the modeled deal terms', () => {
    const capital = getDealCapitalSnapshot(packFancyDeal);

    expect(capital.entryEnterpriseValue).toBe(55500000);
    expect(capital.debtAmount).toBe(27750000);
    expect(capital.equityCheck).toBe(27750000);
    expect(capital.leverageMultiple).toBeCloseTo(1.85, 2);
  });

  it('builds a deal-specific PackFancy prep brief', () => {
    const brief = buildICPrepBrief(packFancyDeal);

    expect(brief.headline.toLowerCase()).toContain('hidden-value');
    expect(brief.whyNow.toLowerCase()).toContain('ip');
    expect(brief.thesis).toContain('$28M equity check');
    expect(brief.proofPoints.some((point) => point.includes('IRR'))).toBe(true);
    expect(brief.risks.some((risk) => risk.toLowerCase().includes('exit'))).toBe(true);
    expect(brief.risks.some((risk) => risk.toLowerCase().includes('management'))).toBe(true);
  });

  it('turns a mixed IC room into conditional approval instead of a hard rejection', () => {
    const votes: ICPartnerVote[] = [
      { partnerId: 'victoria', partnerName: 'Victoria Hammond', vote: 'YES', reasoning: 'Returns are there.', respectChange: 3 },
      { partnerId: 'david', partnerName: 'David Chen', vote: 'CONDITIONAL', reasoning: 'Needs a sharper 100-day plan.', respectChange: 1 },
      { partnerId: 'margaret', partnerName: 'Margaret Thornwood', vote: 'CONDITIONAL', reasoning: 'Downside case needs work.', respectChange: 0 },
      { partnerId: 'richard', partnerName: 'Richard Morrison', vote: 'NO', reasoning: 'The strategic story is not fully there yet.', respectChange: -2 },
    ];

    const verdict = generateVerdict(votes, solidEvaluation, packFancyDeal);

    expect(verdict.outcome).toBe('CONDITIONALLY_APPROVED');
    expect(verdict.consequences.dealOutcome).toBe('RENEGOTIATE');
    expect(verdict.conditions && verdict.conditions.length).toBeGreaterThan(0);
  });
});
