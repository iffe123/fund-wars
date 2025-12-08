import type { ManagementAction, ManagementActionType } from '../types';

/**
 * Management Actions for Owned Portfolio Companies
 *
 * These actions become available when a deal is WON and the company
 * transitions to OWNED status. Each action has:
 * - AP cost: Action points required (always 1)
 * - Cooldown: Weeks before the same action can be repeated
 * - Outcomes: Probabilistic results affecting company and player stats
 */

export const MANAGEMENT_ACTIONS: ManagementAction[] = [
  {
    type: 'SET_STRATEGY',
    label: 'Set New Strategy',
    description: 'Define strategic direction. Could boost growth or backfire if poorly received.',
    apCost: 1,
    cooldownWeeks: 4,
    possibleOutcomes: [
      {
        chance: 60,
        statChanges: { reputation: 2 },
        companyChanges: { revenueGrowth: 0.05 },
        description: 'Strategy well-received by management. Growth trajectory improving.',
      },
      {
        chance: 30,
        statChanges: {},
        companyChanges: {},
        description: 'Strategy met with skepticism. No immediate impact.',
      },
      {
        chance: 10,
        statChanges: { reputation: -3, stress: 5 },
        companyChanges: { revenueGrowth: -0.03, ceoPerformance: -10 },
        description: 'Strategy backfires. Key talent threatens to leave.',
      },
    ],
  },
  {
    type: 'FIRE_CEO',
    label: 'Fire CEO',
    description: 'Remove underperforming leadership. High risk, high reward.',
    apCost: 1,
    cooldownWeeks: 12,
    possibleOutcomes: [
      {
        chance: 40,
        statChanges: { reputation: 5, stress: 10 },
        companyChanges: { ebitda: 1.10, ceoPerformance: 80 }, // 10% EBITDA boost
        description: 'New CEO drives immediate improvements. Board applauds decision.',
      },
      {
        chance: 35,
        statChanges: { stress: 5 },
        companyChanges: { ceoPerformance: 50 },
        description: 'Transition period. Results unclear. Board watching closely.',
      },
      {
        chance: 25,
        statChanges: { reputation: -10, stress: 20 },
        companyChanges: { revenue: 0.9, ebitda: 0.85, ceoPerformance: 30 }, // Multiply factors
        description: 'Disaster. Key customers and employees flee. Activist investors circling.',
      },
    ],
  },
  {
    type: 'HIRE_EXECUTIVE',
    label: 'Hire Key Executive',
    description: 'Bring in talent to strengthen the management team.',
    apCost: 1,
    cooldownWeeks: 6,
    possibleOutcomes: [
      {
        chance: 55,
        statChanges: { reputation: 2 },
        companyChanges: { ceoPerformance: 10, boardAlignment: 5 },
        description: 'Strong hire. The new executive is already making an impact.',
      },
      {
        chance: 30,
        statChanges: {},
        companyChanges: { ceoPerformance: 3 },
        description: 'Decent hire. Early signs are promising but unproven.',
      },
      {
        chance: 15,
        statChanges: { stress: 5, reputation: -2 },
        companyChanges: { ceoPerformance: -5 },
        description: 'Bad cultural fit. The hire creates friction in the leadership team.',
      },
    ],
  },
  {
    type: 'BOARD_MEETING',
    label: 'Board Meeting',
    description: 'Review performance and align with other investors.',
    apCost: 1,
    cooldownWeeks: 2,
    possibleOutcomes: [
      {
        chance: 70,
        statChanges: { reputation: 1 },
        companyChanges: { boardAlignment: 5 },
        description: 'Productive meeting. Stakeholders aligned on path forward.',
      },
      {
        chance: 20,
        statChanges: { stress: 5 },
        companyChanges: { boardAlignment: -3 },
        description: 'Contentious meeting. LPs asking tough questions about performance.',
      },
      {
        chance: 10,
        statChanges: { reputation: -5, stress: 15 },
        companyChanges: { boardAlignment: -15 },
        description: 'Disaster. Co-investor threatens legal action over governance.',
      },
    ],
  },
  {
    type: 'COST_CUTTING',
    label: 'Cost Cutting Initiative',
    description: 'Reduce expenses to improve margins. May hurt morale.',
    apCost: 1,
    cooldownWeeks: 8,
    possibleOutcomes: [
      {
        chance: 50,
        statChanges: {},
        companyChanges: { ebitdaMargin: 0.05, ebitda: 1.08 }, // Margin improvement + EBITDA boost
        description: 'Successful cost reduction. Margins improve significantly.',
      },
      {
        chance: 30,
        statChanges: {},
        companyChanges: { ebitdaMargin: 0.02, revenueGrowth: -0.02 },
        description: 'Some savings realized but growth impacted by reduced investment.',
      },
      {
        chance: 20,
        statChanges: { stress: 5 },
        companyChanges: { revenue: 0.95, customerChurn: 0.05 },
        description: 'Cuts too deep. Customer service suffers, churn increases.',
      },
    ],
  },
  {
    type: 'GROWTH_INVESTMENT',
    label: 'Growth Investment',
    description: 'Invest capital into growth initiatives. Burns cash but may accelerate revenue.',
    apCost: 1,
    cooldownWeeks: 6,
    possibleOutcomes: [
      {
        chance: 45,
        statChanges: { reputation: 3 },
        companyChanges: { revenueGrowth: 0.10, cashBalance: -500000 },
        description: 'Investment paying off. Revenue growth accelerating.',
      },
      {
        chance: 35,
        statChanges: {},
        companyChanges: { revenueGrowth: 0.03, cashBalance: -500000 },
        description: 'Modest returns on investment. Growth improved slightly.',
      },
      {
        chance: 20,
        statChanges: { stress: 8 },
        companyChanges: { cashBalance: -1000000, runwayMonths: -3 },
        description: 'Investment underperforming. Burned more cash than expected.',
      },
    ],
  },
  {
    type: 'REFINANCE_DEBT',
    label: 'Refinance Debt',
    description: 'Restructure the capital stack. May reduce interest burden or add leverage.',
    apCost: 1,
    cooldownWeeks: 10,
    possibleOutcomes: [
      {
        chance: 55,
        statChanges: { financialEngineering: 3 },
        companyChanges: { debt: 0.85 }, // Reduce debt by 15%
        description: 'Successfully refinanced at lower rate. Debt burden reduced.',
      },
      {
        chance: 30,
        statChanges: { financialEngineering: 1 },
        companyChanges: {},
        description: 'Marginal improvement in terms. No significant change.',
      },
      {
        chance: 15,
        statChanges: { stress: 10, auditRisk: 5 },
        companyChanges: { debt: 1.05 }, // Debt increases
        description: 'Lenders sensing weakness. Terms worsened, covenants tightened.',
      },
    ],
  },
  {
    type: 'ADD_ON_ACQUISITION',
    label: 'Add-On Acquisition',
    description: 'Acquire a complementary business. High complexity, high potential.',
    apCost: 1,
    cooldownWeeks: 16,
    possibleOutcomes: [
      {
        chance: 35,
        statChanges: { reputation: 8, score: 200, financialEngineering: 5 },
        companyChanges: { revenue: 1.30, ebitda: 1.25, employeeCount: 1.20 }, // 30% revenue, 25% EBITDA
        description: 'Brilliant acquisition. Synergies realized, platform growing.',
      },
      {
        chance: 40,
        statChanges: { stress: 5, reputation: 2 },
        companyChanges: { revenue: 1.15, ebitda: 1.05, debt: 1.20 },
        description: 'Decent deal. Some synergies but integration challenges.',
      },
      {
        chance: 25,
        statChanges: { reputation: -8, stress: 20 },
        companyChanges: { revenue: 1.10, ebitda: 0.90, debt: 1.40, ceoPerformance: -15 },
        description: 'Integration nightmare. Cultures clashing, synergies elusive.',
      },
    ],
  },
  {
    type: 'PREPARE_EXIT',
    label: 'Prepare for Exit',
    description: 'Start positioning the company for sale. Begins the exit process.',
    apCost: 1,
    cooldownWeeks: 20,
    possibleOutcomes: [
      {
        chance: 65,
        statChanges: { reputation: 3 },
        companyChanges: { isInExitProcess: true, boardAlignment: 10 },
        description: 'Exit preparation underway. Management aligned, books cleaned up.',
      },
      {
        chance: 25,
        statChanges: { stress: 5 },
        companyChanges: { isInExitProcess: true },
        description: 'Mixed reception. Some stakeholders pushing back on timing.',
      },
      {
        chance: 10,
        statChanges: { reputation: -3, stress: 10 },
        companyChanges: { boardAlignment: -10, ceoPerformance: -5 },
        description: 'CEO resists exit. Power struggle emerging in the boardroom.',
      },
    ],
  },
];

/**
 * Get available management actions for a company based on cooldown periods
 */
export const getAvailableManagementActions = (
  lastActions: Record<ManagementActionType, number> | undefined,
  currentWeek: number
): ManagementAction[] => {
  return MANAGEMENT_ACTIONS.filter(action => {
    const lastPerformed = lastActions?.[action.type] ?? 0;
    return currentWeek - lastPerformed >= action.cooldownWeeks;
  });
};

/**
 * Execute a management action and return the outcome
 */
export const executeManagementAction = (
  action: ManagementAction
): ManagementAction['possibleOutcomes'][0] => {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const outcome of action.possibleOutcomes) {
    cumulative += outcome.chance;
    if (roll <= cumulative) {
      return outcome;
    }
  }

  // Fallback to last outcome if rounding issues
  return action.possibleOutcomes[action.possibleOutcomes.length - 1];
};

/**
 * Get management action by type
 */
export const getManagementAction = (type: ManagementActionType): ManagementAction | undefined => {
  return MANAGEMENT_ACTIONS.find(a => a.type === type);
};
