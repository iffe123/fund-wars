import type { ModelingChallenge } from '../types';

export const MODELING_CHALLENGES: ModelingChallenge[] = [
  // ==================== IRR CALCULATIONS ====================
  {
    id: 'irr_basic_1',
    type: 'IRR_CALCULATION',
    difficulty: 'EASY',
    question: 'Calculate the approximate IRR for this investment.',
    context: 'You invested $10M in Year 0 and received $20M in Year 5. What is the approximate IRR?',
    data: {
      investment: 10000000,
      exitValue: 20000000,
      holdingPeriod: 5,
    },
    correctAnswer: 15, // ~14.87% rounds to 15%
    tolerance: 0.10, // 10% tolerance
    explanation: 'IRR = (Exit/Investment)^(1/n) - 1 = (20/10)^(1/5) - 1 = 2^0.2 - 1 ≈ 14.87% ≈ 15%',
    timeLimit: 60,
    reward: { financialEngineering: 3, score: 300, reputation: 2 },
    penalty: { analystRating: -5, stress: 5 },
  },
  {
    id: 'irr_basic_2',
    type: 'IRR_CALCULATION',
    difficulty: 'EASY',
    question: 'What IRR does a 3x return in 4 years represent?',
    context: 'A deal returned 3x MOIC over a 4-year hold. Calculate the IRR.',
    data: {
      moic: 3,
      holdingPeriod: 4,
    },
    correctAnswer: 32, // 31.6% rounds to 32%
    tolerance: 0.10,
    explanation: 'IRR = MOIC^(1/n) - 1 = 3^(1/4) - 1 = 3^0.25 - 1 ≈ 31.6% ≈ 32%',
    timeLimit: 45,
    reward: { financialEngineering: 2, score: 200 },
    penalty: { analystRating: -3 },
  },
  {
    id: 'irr_intermediate',
    type: 'IRR_CALCULATION',
    difficulty: 'MEDIUM',
    question: 'Calculate the IRR with intermediate cash flows.',
    context: 'Investment: $50M in Year 0. Dividends: $5M in Year 2, $10M in Year 3. Exit: $80M in Year 5. Approximate IRR?',
    data: {
      investment: 50000000,
      dividend_y2: 5000000,
      dividend_y3: 10000000,
      exitValue: 80000000,
      holdingPeriod: 5,
    },
    correctAnswer: 18, // Approximately 18%
    tolerance: 0.15,
    explanation: 'With interim cash flows, IRR is higher than simple MOIC calculation. Total return = $95M on $50M = 1.9x, but faster return of capital boosts IRR to ~18%.',
    timeLimit: 90,
    reward: { financialEngineering: 5, score: 500, reputation: 3 },
    penalty: { analystRating: -5, stress: 8 },
  },

  // ==================== LEVERAGE ANALYSIS ====================
  {
    id: 'leverage_basic',
    type: 'LEVERAGE_ANALYSIS',
    difficulty: 'EASY',
    question: 'Calculate the Debt/EBITDA ratio.',
    context: 'A company has $120M in total debt and $30M EBITDA. What is the leverage ratio?',
    data: {
      totalDebt: 120000000,
      ebitda: 30000000,
    },
    correctAnswer: 4.0,
    tolerance: 0.05,
    explanation: 'Debt/EBITDA = $120M / $30M = 4.0x. This is considered moderately leveraged for an LBO.',
    timeLimit: 30,
    reward: { financialEngineering: 2, score: 150 },
    penalty: { analystRating: -2 },
  },
  {
    id: 'leverage_coverage',
    type: 'LEVERAGE_ANALYSIS',
    difficulty: 'MEDIUM',
    question: 'Calculate the Interest Coverage Ratio.',
    context: 'EBITDA: $25M. Total Debt: $100M at 8% interest. What is the interest coverage ratio?',
    data: {
      ebitda: 25000000,
      totalDebt: 100000000,
      interestRate: 0.08,
    },
    correctAnswer: 3.1, // 25M / (100M * 0.08) = 25/8 = 3.125
    tolerance: 0.10,
    explanation: 'Interest Expense = $100M × 8% = $8M. ICR = EBITDA / Interest = $25M / $8M = 3.125x ≈ 3.1x',
    timeLimit: 60,
    reward: { financialEngineering: 4, score: 350 },
    penalty: { analystRating: -4, stress: 5 },
  },
  {
    id: 'leverage_equity_check',
    type: 'LEVERAGE_ANALYSIS',
    difficulty: 'HARD',
    question: 'Calculate the equity contribution percentage.',
    context: 'Purchase price: $500M. Senior debt: $250M (5.0x EBITDA). Mezzanine: $75M. The rest is equity. What % of the purchase is equity?',
    data: {
      purchasePrice: 500000000,
      seniorDebt: 250000000,
      mezzanine: 75000000,
    },
    correctAnswer: 35, // (500 - 250 - 75) / 500 = 175/500 = 35%
    tolerance: 0.05,
    explanation: 'Equity = $500M - $250M - $75M = $175M. Equity % = $175M / $500M = 35%',
    timeLimit: 60,
    reward: { financialEngineering: 5, score: 500, reputation: 2 },
    penalty: { analystRating: -6, stress: 10 },
  },

  // ==================== VALUATION ====================
  {
    id: 'valuation_ev_ebitda',
    type: 'VALUATION',
    difficulty: 'EASY',
    question: 'Calculate the Enterprise Value.',
    context: 'A company trades at 8.0x EBITDA. EBITDA is $15M. What is the Enterprise Value?',
    data: {
      ebitdaMultiple: 8.0,
      ebitda: 15000000,
    },
    correctAnswer: 120, // $120M
    tolerance: 0.05,
    explanation: 'EV = EBITDA × Multiple = $15M × 8.0x = $120M',
    timeLimit: 30,
    reward: { financialEngineering: 2, score: 150 },
    penalty: { analystRating: -2 },
  },
  {
    id: 'valuation_equity_bridge',
    type: 'VALUATION',
    difficulty: 'MEDIUM',
    question: 'Calculate the Equity Value.',
    context: 'Enterprise Value: $200M. Net Debt: $80M (Total Debt $90M, Cash $10M). What is the Equity Value?',
    data: {
      enterpriseValue: 200000000,
      totalDebt: 90000000,
      cash: 10000000,
    },
    correctAnswer: 120, // EV - Net Debt = 200 - 80 = 120
    tolerance: 0.05,
    explanation: 'Net Debt = $90M - $10M = $80M. Equity Value = EV - Net Debt = $200M - $80M = $120M',
    timeLimit: 45,
    reward: { financialEngineering: 4, score: 350 },
    penalty: { analystRating: -4, stress: 5 },
  },
  {
    id: 'valuation_implied_multiple',
    type: 'VALUATION',
    difficulty: 'MEDIUM',
    question: 'Calculate the implied EV/Revenue multiple.',
    context: 'A SaaS company is valued at $500M EV. Revenue: $50M. Revenue growth: 40%. What is the EV/Revenue multiple?',
    data: {
      enterpriseValue: 500000000,
      revenue: 50000000,
      revenueGrowth: 0.40,
    },
    correctAnswer: 10.0, // 500/50 = 10x
    tolerance: 0.05,
    explanation: 'EV/Revenue = $500M / $50M = 10.0x. High multiple justified by 40% growth.',
    timeLimit: 30,
    reward: { financialEngineering: 3, score: 250 },
    penalty: { analystRating: -3 },
  },

  // ==================== SENSITIVITY ANALYSIS ====================
  {
    id: 'sensitivity_margin',
    type: 'SENSITIVITY',
    difficulty: 'MEDIUM',
    question: 'Calculate the EBITDA impact of margin improvement.',
    context: 'Revenue: $100M. Current EBITDA margin: 15%. If margin improves to 18%, what is the new EBITDA?',
    data: {
      revenue: 100000000,
      currentMargin: 0.15,
      newMargin: 0.18,
    },
    correctAnswer: 18, // $18M
    tolerance: 0.05,
    explanation: 'New EBITDA = Revenue × New Margin = $100M × 18% = $18M (up from $15M)',
    timeLimit: 45,
    reward: { financialEngineering: 3, score: 300 },
    penalty: { analystRating: -3 },
  },
  {
    id: 'sensitivity_exit_multiple',
    type: 'SENSITIVITY',
    difficulty: 'HARD',
    question: 'Calculate returns under different exit scenarios.',
    context: 'Entry: $100M equity for 10x EBITDA ($10M EBITDA). Year 5 EBITDA: $15M. If exit multiple is 9x instead of 10x, what is the equity value decrease (in $M)?',
    data: {
      entryEquity: 100000000,
      entryEbitda: 10000000,
      exitEbitda: 15000000,
      baseExitMultiple: 10,
      stressExitMultiple: 9,
    },
    correctAnswer: 15, // (15M × 10x) - (15M × 9x) = 150 - 135 = $15M difference
    tolerance: 0.10,
    explanation: 'Base case EV: $15M × 10x = $150M. Stress case EV: $15M × 9x = $135M. Difference: $15M',
    timeLimit: 90,
    reward: { financialEngineering: 6, score: 600, reputation: 3 },
    penalty: { analystRating: -6, stress: 10 },
  },

  // ==================== DEBT CAPACITY ====================
  {
    id: 'debt_capacity_basic',
    type: 'DEBT_CAPACITY',
    difficulty: 'EASY',
    question: 'Calculate maximum debt at 5.0x leverage.',
    context: 'EBITDA: $20M. Bank covenant limits leverage to 5.0x. What is the maximum debt capacity?',
    data: {
      ebitda: 20000000,
      maxLeverage: 5.0,
    },
    correctAnswer: 100, // $100M
    tolerance: 0.05,
    explanation: 'Max Debt = EBITDA × Max Leverage = $20M × 5.0x = $100M',
    timeLimit: 30,
    reward: { financialEngineering: 2, score: 150 },
    penalty: { analystRating: -2 },
  },
  {
    id: 'debt_capacity_dscr',
    type: 'DEBT_CAPACITY',
    difficulty: 'HARD',
    question: 'Calculate max debt based on DSCR covenant.',
    context: 'EBITDA: $25M. CapEx: $5M. Tax rate: 25%. DSCR covenant: 1.5x minimum. Interest rate: 8%. Assuming 7-year amortization, what is approximate max debt?',
    data: {
      ebitda: 25000000,
      capex: 5000000,
      taxRate: 0.25,
      dscrMinimum: 1.5,
      interestRate: 0.08,
      amortizationYears: 7,
    },
    correctAnswer: 75, // Approximately $75M (simplified calculation)
    tolerance: 0.20, // Higher tolerance for complex calculation
    explanation: 'Free Cash Flow ≈ (EBITDA - CapEx) × (1 - Tax) = ($25M - $5M) × 0.75 = $15M. With DSCR of 1.5x, max debt service ≈ $10M/year. At 8% interest + ~14% amortization, max debt ≈ $75M.',
    timeLimit: 120,
    reward: { financialEngineering: 8, score: 800, reputation: 5 },
    penalty: { analystRating: -8, stress: 15 },
  },
];

export const getRandomChallenge = (difficulty?: ModelingChallenge['difficulty']): ModelingChallenge => {
  const filtered = difficulty
    ? MODELING_CHALLENGES.filter(c => c.difficulty === difficulty)
    : MODELING_CHALLENGES;
  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getChallengesByType = (type: ModelingChallenge['type']): ModelingChallenge[] => {
  return MODELING_CHALLENGES.filter(c => c.type === type);
};

export const getChallengesByDifficulty = (difficulty: ModelingChallenge['difficulty']): ModelingChallenge[] => {
  return MODELING_CHALLENGES.filter(c => c.difficulty === difficulty);
};

export const checkAnswer = (challenge: ModelingChallenge, userAnswer: number): boolean => {
  const difference = Math.abs(userAnswer - challenge.correctAnswer);
  const tolerance = challenge.correctAnswer * challenge.tolerance;
  return difference <= tolerance;
};

export const CHALLENGE_INTRO_LINES = [
  "Let's see if that MBA was worth the tuition.",
  "Time to prove you're not just a pretty PowerPoint.",
  "The model doesn't lie. Do you know your numbers?",
  "Quick math check. Your bonus depends on it.",
  "Chad wants to know if you can actually do the work.",
  "Sarah needs help and you're up. Don't embarrass yourself.",
];

export const CHALLENGE_SUCCESS_LINES = [
  "Not bad, kid. Maybe you'll survive here after all.",
  "Correct. Don't let it go to your head.",
  "That's the answer. The model doesn't care about your feelings.",
  "Right. Now do it 100 more times this week.",
  "Acceptable. You've earned another day of employment.",
];

export const CHALLENGE_FAILURE_LINES = [
  "Wrong. This is why analysts work until 2am.",
  "Incorrect. Maybe stick to the pitch deck slides.",
  "That's... not even close. Did you go to a state school?",
  "Wrong answer. Chad is very disappointed.",
  "Error. Your model would have blown up a $500M deal.",
  "Incorrect. The client would have fired us.",
];
