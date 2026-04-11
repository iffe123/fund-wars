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
    description: 'Unveil a 47-slide PowerPoint deck that will definitely, this time, transform the company. Consultants were paid handsomely for this vision. The CEO nods along like a bobblehead.',
    apCost: 1,
    cooldownWeeks: 4,
    possibleOutcomes: [
      {
        chance: 60,
        statChanges: { reputation: 2 },
        companyChanges: { revenueGrowth: 0.05, boardAlignment: 5 },
        description: 'Against all odds, the strategy actually works. Management drinks the Kool-Aid and execution follows. Revenue ticks up. The consultants take credit.',
      },
      {
        chance: 30,
        statChanges: {},
        companyChanges: {},
        description: 'The strategy deck joins its predecessors in a dusty SharePoint folder. Middle management nods, changes nothing, and waits for the next reorganization.',
      },
      {
        chance: 10,
        statChanges: { reputation: -3, stress: 5 },
        companyChanges: { revenueGrowth: -0.03, ceoPerformance: -10, boardAlignment: -5 },
        description: 'The strategy leaks to the press, who describe it as "delusional." Top talent updates their LinkedIn profiles to "open to opportunities." The board requests an emergency session.',
      },
    ],
  },
  {
    type: 'FIRE_CEO',
    label: 'Fire CEO',
    description: 'Summon the headsman. Terminate the CEO and pray the next one can find the parking lot. Every PE firm thinks they can upgrade management — most just upgrade the chaos. The recruiter already has "a few names" which is code for "the same three people everyone else is interviewing."',
    apCost: 1,
    cooldownWeeks: 12,
    possibleOutcomes: [
      {
        chance: 40,
        statChanges: { reputation: 5, stress: 10 },
        companyChanges: { ebitda: 1.10, ceoPerformance: 80, revenueGrowth: 0.10, boardAlignment: 15, employeeGrowth: 0.03 }, // 10% EBITDA boost + strong growth acceleration + morale boost
        description: 'The new CEO arrives like a caffeinated messiah with a Rolodex from heaven. EBITDA jumps, revenue accelerates aggressively, and the board sends you a fruit basket wrapped in a term sheet. Even the CFO cracks a smile for the first time since 2019.',
      },
      {
        chance: 35,
        statChanges: { stress: 5, reputation: -2 },
        companyChanges: { ceoPerformance: 50, revenueGrowth: -0.02, boardAlignment: -10 },
        description: 'The interim CEO is googling "what does EBITDA stand for" while the executive recruiter promises a shortlist by Q3. Revenue drifts while the org chart plays musical chairs. The board starts every meeting with "so, any update on the search?" The answer is always no.',
      },
      {
        chance: 25,
        statChanges: { reputation: -10, stress: 20 },
        companyChanges: { revenue: 0.9, ebitda: 0.85, ceoPerformance: 30, customerChurn: 0.04, employeeGrowth: -0.08 }, // Multiply factors + talent flight
        description: 'The fired CEO goes on a LinkedIn revenge tour that makes Elon look restrained. Key customers flee. Your best engineers update their resumes in real-time during the all-hands. Glassdoor rating drops to 2.1 stars. The top comment: "Run." Activist investors smell blood.',
      },
    ],
  },
  {
    type: 'HIRE_EXECUTIVE',
    label: 'Hire Key Executive',
    description: 'Lure a "transformational leader" from a Fortune 500 with a comp package that would make a pharaoh blush. Their resume says "results-oriented visionary." Their last company says "good riddance."',
    apCost: 1,
    cooldownWeeks: 6,
    possibleOutcomes: [
      {
        chance: 55,
        statChanges: { reputation: 2 },
        companyChanges: { ceoPerformance: 10, boardAlignment: 5, revenueGrowth: 0.02 },
        description: 'The new exec is the real deal. They actually read the strategy deck AND understood it. Team morale improves, revenue nudges upward, and even the board cracks a smile.',
      },
      {
        chance: 30,
        statChanges: {},
        companyChanges: { ceoPerformance: 3 },
        description: 'The hire spends their first month "listening and learning," which is corporate for "figuring out where the coffee machine is." Early signs are promising but so was Theranos.',
      },
      {
        chance: 15,
        statChanges: { stress: 5, reputation: -2 },
        companyChanges: { ceoPerformance: -5, boardAlignment: -5 },
        description: 'Cultural fit? More like cultural catastrophe. The new exec tries to introduce "radical transparency" and "flat hierarchy." Three VPs resign in protest. HR is overwhelmed.',
      },
    ],
  },
  {
    type: 'BOARD_MEETING',
    label: 'Board Meeting',
    description: 'Gather the board for three hours of passive-aggressive PowerPoint presentations, stale pastries, and the annual ritual of pretending the projections are achievable. The co-investor always has "just one more question."',
    apCost: 1,
    cooldownWeeks: 2,
    possibleOutcomes: [
      {
        chance: 70,
        statChanges: { reputation: 1 },
        companyChanges: { boardAlignment: 5, ceoPerformance: 3 },
        description: 'The meeting ends on time, which is itself a miracle. Stakeholders nod in agreement. The CEO feels validated and promises to "double down on execution." Everyone leaves feeling vaguely optimistic.',
      },
      {
        chance: 20,
        statChanges: { stress: 5 },
        companyChanges: { boardAlignment: -3 },
        description: 'The co-investor brought their own financial model and it disagrees with everything. LPs are asking why the 5-year plan is now a 7-year plan. The CEO sweats through their blazer.',
      },
      {
        chance: 10,
        statChanges: { reputation: -5, stress: 15 },
        companyChanges: { boardAlignment: -15, ceoPerformance: -5 },
        description: 'Full boardroom meltdown. The co-investor accuses you of "value destruction" and threatens legal action. Someone leaks the board minutes to the press. The CEO asks if they should update their resume.',
      },
    ],
  },
  {
    type: 'COST_CUTTING',
    label: 'Cost Cutting Initiative',
    description: 'Unleash the consultants with their "operational efficiency framework," which is a fancy way of saying "fire people and cancel the holiday party." The survivors will be grateful. Probably. McKinsey already billed $400K for the privilege of telling you to do what you were going to do anyway.',
    apCost: 1,
    cooldownWeeks: 8,
    possibleOutcomes: [
      {
        chance: 50,
        statChanges: {},
        companyChanges: { ebitdaMargin: 0.05, ebitda: 1.08, employeeCount: 0.88, employeeGrowth: -0.15 }, // Margin improvement + EBITDA boost + layoffs + negative growth trend
        description: 'The spreadsheet gods smile upon you. Margins leap as 12% of the workforce discovers "exciting new opportunities" via a 7am calendar invite titled "Quick Sync." The remaining employees work twice as hard out of sheer terror. EBITDA soars. HR sends a tasteful email about "our evolving team" while security escorts people out with banker boxes.',
      },
      {
        chance: 30,
        statChanges: {},
        companyChanges: { ebitdaMargin: 0.02, revenueGrowth: -0.02, employeeCount: 0.95, employeeGrowth: -0.06 },
        description: 'You cut the free snacks, the team offsites, and 5% of headcount. Savings trickle in, but so does quiet resentment. The kombucha tap runs dry — literally and metaphorically. Growth slows as your best people realize the grass is greener literally anywhere else. Someone passive-aggressively posts the Glassdoor link in Slack.',
      },
      {
        chance: 20,
        statChanges: { stress: 5, reputation: -3 },
        companyChanges: { revenue: 0.95, customerChurn: 0.05, ceoPerformance: -5, employeeGrowth: -0.10 },
        description: 'You cut the customer support team to a skeleton crew of two interns and a chatbot named "Helpful Helper" that is neither. Hold times reach 45 minutes. Churn spikes. Glassdoor reviews now read like horror fiction. One review just says "lol" and somehow that\'s the most devastating one.',
      },
    ],
  },
  {
    type: 'GROWTH_INVESTMENT',
    label: 'Growth Investment',
    description: 'Pour capital into "growth initiatives" with the confidence of someone who has never read a case study about WeWork. Build it and they will come. Hopefully. Please.',
    apCost: 1,
    cooldownWeeks: 6,
    possibleOutcomes: [
      {
        chance: 45,
        statChanges: { reputation: 3 },
        companyChanges: { revenueGrowth: 0.10, cashBalance: -500000, employeeCount: 1.05 },
        description: 'The growth investment hits. New hires are productive from day one. Revenue accelerates and the board starts using words like "platform" and "category leader." You resist the urge to high-five yourself.',
      },
      {
        chance: 35,
        statChanges: {},
        companyChanges: { revenueGrowth: 0.03, cashBalance: -500000 },
        description: 'The new sales reps are "ramping." The product expansion is "in beta." Everything is "on track" in the way that a plane losing altitude is technically still flying. Modest growth, modest burn.',
      },
      {
        chance: 20,
        statChanges: { stress: 8, reputation: -2 },
        companyChanges: { cashBalance: -1000000, runwayMonths: -3, revenueGrowth: -0.02 },
        description: 'The growth experiment proves that money can, in fact, be set on fire. CAC tripled, the new market turned out to be a mirage, and your CFO is making that face again. Cash runway shrinks alarmingly.',
      },
    ],
  },
  {
    type: 'REFINANCE_DEBT',
    label: 'Refinance Debt',
    description: 'Call every investment banker in your Rolodex to restructure the capital stack. You\'ll sit through nineteen pitch decks that all say the same thing in different fonts, eat mediocre sushi at the closing dinner, and pray the credit markets don\'t seize up before ink hits paper.',
    apCost: 1,
    cooldownWeeks: 10,
    possibleOutcomes: [
      {
        chance: 55,
        statChanges: { financialEngineering: 3, reputation: 2 },
        companyChanges: { debt: 0.85, cashBalance: 500000 }, // Reduce debt by 15% + freed-up cash
        description: 'The bankers earn their obscene fee for once. You lock in a rate that makes your CFO weep tears of joy. Debt burden drops 15%, covenants loosen, and you pocket the savings. The closing dinner features actual good champagne.',
      },
      {
        chance: 30,
        statChanges: { financialEngineering: 1, stress: 5 },
        companyChanges: {},
        description: 'After six weeks of negotiations, three "final" term sheets, and a near-death experience when the lead banker went on vacation mid-deal, you end up with terms that are... basically the same. The bankers still bill you $200K for "advisory services." You get a branded stress ball as a deal gift.',
      },
      {
        chance: 15,
        statChanges: { stress: 10, auditRisk: 5, reputation: -3 },
        companyChanges: { debt: 1.05, runwayMonths: -2 }, // Debt increases + runway pressure
        description: 'The lenders smell blood in the water. They tighten covenants until your CFO can\'t sneeze without triggering a default. The new terms are worse, the fees are higher, and some analyst just downgraded your credit. The bankers still send a tombstone commemorating the deal.',
      },
    ],
  },
  {
    type: 'ADD_ON_ACQUISITION',
    label: 'Add-On Acquisition',
    description: 'Nothing says "value creation" like buying another company to staple onto your existing one and calling the combined mess a "platform." The investment bankers have already mocked up the pro forma showing 40% synergies that exist only in PowerPoint. Your integration PMO consists of one exhausted VP and a shared Google Doc.',
    apCost: 1,
    cooldownWeeks: 16,
    possibleOutcomes: [
      {
        chance: 35,
        statChanges: { reputation: 8, score: 200, financialEngineering: 5 },
        companyChanges: { revenue: 1.30, ebitda: 1.25, employeeCount: 1.20, revenueGrowth: 0.08 }, // 30% revenue, 25% EBITDA + growth acceleration
        description: 'Against all laws of corporate physics, the acquisition actually works. Synergies materialize, cross-selling kicks in, and the combined entity starts looking like a real platform. Your IC deck becomes the stuff of legend. The bankers take 100% of the credit at their year-end review.',
      },
      {
        chance: 40,
        statChanges: { stress: 5, reputation: 2 },
        companyChanges: { revenue: 1.15, ebitda: 1.05, debt: 1.20, employeeGrowth: -0.03 },
        description: 'The deal closes. The integration is... happening. Two IT systems that refuse to talk to each other. Three redundant sales teams that all think they\'re the A-team. Some synergies trickle in, but the "quick wins" turned out to be "wins that require 18 months and a miracle." At least revenue went up.',
      },
      {
        chance: 25,
        statChanges: { reputation: -8, stress: 20 },
        companyChanges: { revenue: 1.10, ebitda: 0.90, debt: 1.40, ceoPerformance: -15, employeeGrowth: -0.12, customerChurn: 0.03 },
        description: 'Integration nightmare of biblical proportions. The acquired CEO quits on day three. Their best engineers follow. Cultures clash like tectonic plates — one company runs on Slack, the other on carrier pigeons. Customers get invoiced twice. The "synergies" slide gets quietly removed from the board deck.',
      },
    ],
  },
  {
    type: 'PREPARE_EXIT',
    label: 'Prepare for Exit',
    description: 'Begin the sacred ritual of "exit preparation" — a process that involves hiring an investment bank, building a 200-page CIM that makes the company look like the second coming of Google, and coaching the CEO to stop saying "uh" during management presentations. The bankers promise a "competitive process" that will definitely, absolutely, not be a disaster.',
    apCost: 1,
    cooldownWeeks: 20,
    possibleOutcomes: [
      {
        chance: 65,
        statChanges: { reputation: 3, stress: 10 },
        companyChanges: { isInExitProcess: true, boardAlignment: 10, ceoPerformance: 5 },
        description: 'The exit machine roars to life. Management is aligned and surprisingly enthusiastic — the CEO finally understands their equity package. The books get cleaned up, the "quality of earnings" report comes back clean, and the bankers have a buyer list longer than a CVS receipt. This might actually work.',
      },
      {
        chance: 25,
        statChanges: { stress: 15 },
        companyChanges: { isInExitProcess: true, boardAlignment: -5 },
        description: 'The co-investor thinks it\'s too early. The CEO thinks it\'s too late. The CFO just wants to know if their options vest upon a change of control. After three fraught board calls and a passive-aggressive email chain, you get grudging alignment. The process begins, but the energy in the room is "mandatory fun day."',
      },
      {
        chance: 10,
        statChanges: { reputation: -3, stress: 20 },
        companyChanges: { boardAlignment: -10, ceoPerformance: -10 },
        description: 'The CEO goes full mutiny. They leak to the press that "the PE owners are forcing a fire sale." The board fractures. Your co-investor calls an emergency meeting. The investment bankers quietly shelve the CIM. Someone on the management team has already called three competitors to "explore opportunities." This is a code-red governance crisis.',
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
