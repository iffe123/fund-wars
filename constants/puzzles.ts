/**
 * Educational Puzzles
 *
 * Knowledge tests and quizzes about PE, finance, and business concepts.
 */

import type { Puzzle } from '../types/puzzles';

export const PUZZLES: Puzzle[] = [
  // ==================== PE FUNDAMENTALS ====================
  {
    id: 'pe_fund_1',
    type: 'MULTIPLE_CHOICE',
    category: 'PE_FUNDAMENTALS',
    difficulty: 'EASY',
    question: 'What does "2 and 20" refer to in private equity?',
    context: 'This is the standard fee structure that determines how GPs get paid.',
    options: [
      { id: 'a', text: '2% management fee and 20% carried interest', isCorrect: true },
      { id: 'b', text: '2% returns and 20% leverage ratio', isCorrect: false },
      { id: 'c', text: '2 years holding period and 20x MOIC target', isCorrect: false },
      { id: 'd', text: '2% equity stake and 20% debt financing', isCorrect: false },
    ],
    explanation: 'The "2 and 20" model means GPs charge 2% annually on committed capital as management fee, plus 20% of profits above a hurdle rate as carried interest.',
    timeLimit: 30,
    reward: { reputation: 2, score: 200 },
    penalty: { stress: 5, analystRating: -3 },
  },
  {
    id: 'pe_fund_2',
    type: 'MULTIPLE_CHOICE',
    category: 'PE_FUNDAMENTALS',
    difficulty: 'EASY',
    question: 'What is "dry powder" in private equity?',
    options: [
      { id: 'a', text: 'Uncalled capital committed but not yet invested', isCorrect: true },
      { id: 'b', text: 'Cash reserves for emergencies', isCorrect: false },
      { id: 'c', text: 'Profits from recent exits', isCorrect: false },
      { id: 'd', text: 'Debt available for new deals', isCorrect: false },
    ],
    explanation: 'Dry powder is the uncommitted/uninvested capital that PE funds have available for future investments. High dry powder means lots of money chasing deals.',
    timeLimit: 25,
    reward: { reputation: 2, score: 150 },
    penalty: { stress: 3 },
  },
  {
    id: 'pe_fund_3',
    type: 'TRUE_FALSE',
    category: 'PE_FUNDAMENTALS',
    difficulty: 'EASY',
    question: 'A Limited Partner (LP) in a PE fund has unlimited liability for fund losses.',
    options: [
      { id: 'true', text: 'True', isCorrect: false },
      { id: 'false', text: 'False', isCorrect: true },
    ],
    explanation: 'LPs have LIMITED liability - their losses are capped at their committed capital. General Partners (GPs) have unlimited liability and manage the fund.',
    timeLimit: 20,
    reward: { score: 100 },
    penalty: { analystRating: -2 },
  },
  {
    id: 'pe_fund_4',
    type: 'MULTIPLE_CHOICE',
    category: 'PE_FUNDAMENTALS',
    difficulty: 'MEDIUM',
    question: 'What is a "hurdle rate" in PE compensation?',
    options: [
      { id: 'a', text: 'Minimum return LPs must receive before GPs get carry', isCorrect: true },
      { id: 'b', text: 'Maximum leverage allowed in deals', isCorrect: false },
      { id: 'c', text: 'Target IRR for investment decisions', isCorrect: false },
      { id: 'd', text: 'Fee cap on management expenses', isCorrect: false },
    ],
    explanation: 'The hurdle rate (typically 8%) is the minimum annual return that must be paid to LPs before GPs can collect their carried interest. This aligns GP incentives with LP returns.',
    timeLimit: 30,
    reward: { reputation: 3, financialEngineering: 2, score: 250 },
    penalty: { stress: 5, analystRating: -3 },
  },

  // ==================== DEAL STRUCTURE ====================
  {
    id: 'deal_1',
    type: 'MULTIPLE_CHOICE',
    category: 'DEAL_STRUCTURE',
    difficulty: 'EASY',
    question: 'In an LBO, what is the primary source of returns?',
    options: [
      { id: 'a', text: 'Leverage amplifying equity returns', isCorrect: true },
      { id: 'b', text: 'Dividend income', isCorrect: false },
      { id: 'c', text: 'Tax benefits only', isCorrect: false },
      { id: 'd', text: 'Interest income', isCorrect: false },
    ],
    explanation: 'LBOs use debt to finance acquisitions, which amplifies equity returns when the company performs well. A small equity check can generate large returns if the company grows and debt is paid down.',
    timeLimit: 25,
    reward: { financialEngineering: 2, score: 200 },
    penalty: { stress: 4 },
  },
  {
    id: 'deal_2',
    type: 'MULTIPLE_CHOICE',
    category: 'DEAL_STRUCTURE',
    difficulty: 'MEDIUM',
    question: 'What is "mezzanine debt"?',
    options: [
      { id: 'a', text: 'Subordinated debt between senior debt and equity', isCorrect: true },
      { id: 'b', text: 'The first tranche of senior debt', isCorrect: false },
      { id: 'c', text: 'Debt secured by real estate', isCorrect: false },
      { id: 'd', text: 'Short-term bridge financing', isCorrect: false },
    ],
    explanation: 'Mezzanine debt sits between senior debt and equity in the capital stack. It has higher interest rates than senior debt due to its subordinated position but lower returns than equity.',
    timeLimit: 30,
    reward: { financialEngineering: 3, score: 300 },
    penalty: { analystRating: -4, stress: 5 },
  },
  {
    id: 'deal_3',
    type: 'MULTIPLE_CHOICE',
    category: 'DEAL_STRUCTURE',
    difficulty: 'MEDIUM',
    question: 'What is a "covenant" in debt financing?',
    options: [
      { id: 'a', text: 'Contractual restriction on borrower behavior', isCorrect: true },
      { id: 'b', text: 'Guaranteed minimum interest rate', isCorrect: false },
      { id: 'c', text: 'Insurance policy on the debt', isCorrect: false },
      { id: 'd', text: 'Early repayment penalty', isCorrect: false },
    ],
    explanation: 'Covenants are contractual terms that restrict what the borrower can do - like maintaining minimum EBITDA ratios, limiting additional debt, or requiring lender approval for acquisitions.',
    timeLimit: 30,
    reward: { financialEngineering: 3, reputation: 2, score: 250 },
    penalty: { stress: 6 },
  },
  {
    id: 'deal_4',
    type: 'TRUE_FALSE',
    category: 'DEAL_STRUCTURE',
    difficulty: 'HARD',
    question: 'In a "dividend recap," the PE firm uses new debt to pay itself a special dividend without selling the company.',
    options: [
      { id: 'true', text: 'True', isCorrect: true },
      { id: 'false', text: 'False', isCorrect: false },
    ],
    explanation: 'Dividend recapitalizations let PE firms extract cash from portfolio companies by adding debt and paying the proceeds to shareholders. This returns capital to LPs faster but increases company risk.',
    timeLimit: 25,
    reward: { financialEngineering: 4, score: 350 },
    penalty: { analystRating: -5, stress: 8 },
  },

  // ==================== VALUATION ====================
  {
    id: 'val_1',
    type: 'MULTIPLE_CHOICE',
    category: 'VALUATION',
    difficulty: 'EASY',
    question: 'What is Enterprise Value (EV)?',
    options: [
      { id: 'a', text: 'Market cap plus net debt', isCorrect: true },
      { id: 'b', text: 'Total assets minus liabilities', isCorrect: false },
      { id: 'c', text: 'Revenue multiplied by growth rate', isCorrect: false },
      { id: 'd', text: 'Stock price times shares outstanding', isCorrect: false },
    ],
    explanation: 'EV = Equity Value (market cap) + Total Debt - Cash. It represents the total cost to acquire a company, including the debt you would assume.',
    timeLimit: 25,
    reward: { financialEngineering: 2, score: 200 },
    penalty: { analystRating: -2 },
  },
  {
    id: 'val_2',
    type: 'MULTIPLE_CHOICE',
    category: 'VALUATION',
    difficulty: 'MEDIUM',
    question: 'Why is EBITDA commonly used in PE valuations?',
    options: [
      { id: 'a', text: 'It approximates cash flow available for debt service', isCorrect: true },
      { id: 'b', text: 'It includes all capital expenditures', isCorrect: false },
      { id: 'c', text: 'It accounts for different tax structures', isCorrect: false },
      { id: 'd', text: 'It is required by SEC regulations', isCorrect: false },
    ],
    explanation: 'EBITDA strips out non-cash charges and capital structure effects, making it easier to compare companies and assess debt capacity. However, it ignores CapEx and working capital needs.',
    timeLimit: 30,
    reward: { financialEngineering: 3, score: 300 },
    penalty: { stress: 5, analystRating: -3 },
  },
  {
    id: 'val_3',
    type: 'MULTIPLE_CHOICE',
    category: 'VALUATION',
    difficulty: 'HARD',
    question: 'What is the main criticism of using "adjusted EBITDA"?',
    options: [
      { id: 'a', text: 'It often excludes recurring costs disguised as one-time items', isCorrect: true },
      { id: 'b', text: 'It is too conservative', isCorrect: false },
      { id: 'c', text: 'It overstates depreciation', isCorrect: false },
      { id: 'd', text: 'It is not accepted by banks', isCorrect: false },
    ],
    explanation: 'Adjusted EBITDA adds back "non-recurring" expenses that often recur - restructuring charges, litigation, management fees, etc. This can significantly overstate true cash generation.',
    timeLimit: 35,
    reward: { financialEngineering: 5, reputation: 3, score: 400 },
    penalty: { analystRating: -6, stress: 8 },
  },

  // ==================== DUE DILIGENCE ====================
  {
    id: 'dd_1',
    type: 'MULTIPLE_CHOICE',
    category: 'DUE_DILIGENCE',
    difficulty: 'EASY',
    question: 'What is a "Quality of Earnings" (QofE) report?',
    options: [
      { id: 'a', text: 'Third-party analysis of adjusted EBITDA and accounting', isCorrect: true },
      { id: 'b', text: 'Credit rating agency assessment', isCorrect: false },
      { id: 'c', text: 'Internal audit of revenue recognition', isCorrect: false },
      { id: 'd', text: 'Customer satisfaction survey', isCorrect: false },
    ],
    explanation: 'QofE reports are prepared by accounting firms to validate the sellers EBITDA adjustments, identify accounting issues, and analyze the sustainability of earnings.',
    timeLimit: 30,
    reward: { reputation: 2, score: 200 },
    penalty: { analystRating: -3 },
  },
  {
    id: 'dd_2',
    type: 'MULTIPLE_CHOICE',
    category: 'DUE_DILIGENCE',
    difficulty: 'MEDIUM',
    question: 'What is "customer concentration" risk?',
    options: [
      { id: 'a', text: 'High revenue dependence on few customers', isCorrect: true },
      { id: 'b', text: 'Too many small customers', isCorrect: false },
      { id: 'c', text: 'Geographic clustering of customers', isCorrect: false },
      { id: 'd', text: 'Low customer satisfaction scores', isCorrect: false },
    ],
    explanation: 'Customer concentration means a few customers account for a large portion of revenue. Losing a key customer could devastate the business. Many LBO lenders want no single customer above 10-15% of revenue.',
    timeLimit: 30,
    reward: { reputation: 3, score: 250 },
    penalty: { stress: 5 },
  },
  {
    id: 'dd_3',
    type: 'TRUE_FALSE',
    category: 'DUE_DILIGENCE',
    difficulty: 'MEDIUM',
    question: 'A "material adverse change" (MAC) clause allows a buyer to walk away from a deal if significant negative changes occur before closing.',
    options: [
      { id: 'true', text: 'True', isCorrect: true },
      { id: 'false', text: 'False', isCorrect: false },
    ],
    explanation: 'MAC clauses protect buyers if the target experiences major negative changes between signing and closing. However, courts interpret MACs narrowly, so they rarely get invoked successfully.',
    timeLimit: 25,
    reward: { financialEngineering: 3, score: 300 },
    penalty: { analystRating: -4 },
  },

  // ==================== NEGOTIATION ====================
  {
    id: 'neg_1',
    type: 'MULTIPLE_CHOICE',
    category: 'NEGOTIATION',
    difficulty: 'MEDIUM',
    question: 'What is an "earnout" in M&A?',
    options: [
      { id: 'a', text: 'Contingent payment based on future performance', isCorrect: true },
      { id: 'b', text: 'Guaranteed bonus to management', isCorrect: false },
      { id: 'c', text: 'Early exit premium', isCorrect: false },
      { id: 'd', text: 'Tax credit for the buyer', isCorrect: false },
    ],
    explanation: 'Earnouts bridge valuation gaps by making part of the purchase price contingent on hitting future targets. Sellers hate them because they lose control, buyers love them for reducing risk.',
    timeLimit: 30,
    reward: { reputation: 3, financialEngineering: 2, score: 300 },
    penalty: { stress: 5, analystRating: -3 },
  },
  {
    id: 'neg_2',
    type: 'MULTIPLE_CHOICE',
    category: 'NEGOTIATION',
    difficulty: 'HARD',
    question: 'What is a "no-shop" clause?',
    options: [
      { id: 'a', text: 'Prevents seller from soliciting other buyers during exclusivity', isCorrect: true },
      { id: 'b', text: 'Prohibits buyer from shopping the debt', isCorrect: false },
      { id: 'c', text: 'Restricts post-acquisition hiring', isCorrect: false },
      { id: 'd', text: 'Limits due diligence scope', isCorrect: false },
    ],
    explanation: 'No-shop clauses prevent targets from actively seeking other bidders during an exclusivity period. A "go-shop" is the opposite - it allows the target to solicit competing bids for a limited time.',
    timeLimit: 30,
    reward: { reputation: 4, score: 400 },
    penalty: { analystRating: -5, stress: 7 },
  },

  // ==================== EXIT STRATEGY ====================
  {
    id: 'exit_1',
    type: 'MULTIPLE_CHOICE',
    category: 'EXIT_STRATEGY',
    difficulty: 'EASY',
    question: 'What is a "secondary buyout"?',
    options: [
      { id: 'a', text: 'Sale of a portfolio company to another PE firm', isCorrect: true },
      { id: 'b', text: 'Second round of financing', isCorrect: false },
      { id: 'c', text: 'Partial IPO followed by full sale', isCorrect: false },
      { id: 'd', text: 'Management buyout of minority stake', isCorrect: false },
    ],
    explanation: 'Secondary buyouts (SBOs) are when one PE firm sells to another. They now account for ~50% of PE exits. Critics argue they just shuffle assets around without creating value.',
    timeLimit: 25,
    reward: { reputation: 2, score: 200 },
    penalty: { analystRating: -2 },
  },
  {
    id: 'exit_2',
    type: 'MULTIPLE_CHOICE',
    category: 'EXIT_STRATEGY',
    difficulty: 'MEDIUM',
    question: 'What is the typical PE holding period?',
    options: [
      { id: 'a', text: '4-6 years', isCorrect: true },
      { id: 'b', text: '1-2 years', isCorrect: false },
      { id: 'c', text: '10-15 years', isCorrect: false },
      { id: 'd', text: 'Forever (no exit planned)', isCorrect: false },
    ],
    explanation: 'PE funds typically hold investments 4-6 years, though this varies by strategy. Shorter holds suggest financial engineering focus, longer holds suggest operational improvement.',
    timeLimit: 25,
    reward: { score: 200 },
    penalty: { stress: 3 },
  },
  {
    id: 'exit_3',
    type: 'MULTIPLE_CHOICE',
    category: 'EXIT_STRATEGY',
    difficulty: 'HARD',
    question: 'What is "multiple expansion" as a return driver?',
    options: [
      { id: 'a', text: 'Selling at a higher EV/EBITDA multiple than purchase', isCorrect: true },
      { id: 'b', text: 'Increasing revenue across multiple products', isCorrect: false },
      { id: 'c', text: 'Expanding into multiple markets', isCorrect: false },
      { id: 'd', text: 'Using multiple debt tranches', isCorrect: false },
    ],
    explanation: 'Multiple expansion means buying cheap and selling expensive - e.g., buying at 6x EBITDA and selling at 9x. Its often luck/market timing, not skill, but PE firms love to claim credit.',
    timeLimit: 30,
    reward: { financialEngineering: 4, reputation: 3, score: 350 },
    penalty: { analystRating: -5, stress: 6 },
  },

  // ==================== PORTFOLIO MANAGEMENT ====================
  {
    id: 'port_1',
    type: 'MULTIPLE_CHOICE',
    category: 'PORTFOLIO_MANAGEMENT',
    difficulty: 'MEDIUM',
    question: 'What is a "bolt-on acquisition"?',
    options: [
      { id: 'a', text: 'Small add-on acquisition by a portfolio company', isCorrect: true },
      { id: 'b', text: 'Emergency capital injection', isCorrect: false },
      { id: 'c', text: 'Temporary management placement', isCorrect: false },
      { id: 'd', text: 'Debt refinancing', isCorrect: false },
    ],
    explanation: 'Bolt-on acquisitions are smaller companies acquired by portfolio companies to expand capabilities, enter new markets, or achieve synergies. They often happen at lower multiples than the platform.',
    timeLimit: 30,
    reward: { reputation: 3, financialEngineering: 2, score: 300 },
    penalty: { stress: 4 },
  },
  {
    id: 'port_2',
    type: 'TRUE_FALSE',
    category: 'PORTFOLIO_MANAGEMENT',
    difficulty: 'HARD',
    question: 'PE firms typically replace the CEO within 2 years of acquiring a company.',
    options: [
      { id: 'true', text: 'True', isCorrect: true },
      { id: 'false', text: 'False', isCorrect: false },
    ],
    explanation: 'Studies show 50-70% of PE-backed CEOs are replaced within 2 years. PE firms often bring in "professional managers" or operating partners to drive the value creation plan.',
    timeLimit: 25,
    reward: { reputation: 4, score: 350 },
    penalty: { analystRating: -5, stress: 7 },
  },
];

export const getRandomPuzzle = (
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD',
  category?: string,
  excludeIds?: string[]
): Puzzle | null => {
  let filtered = [...PUZZLES];

  if (difficulty) {
    filtered = filtered.filter(p => p.difficulty === difficulty);
  }

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  if (excludeIds && excludeIds.length > 0) {
    filtered = filtered.filter(p => !excludeIds.includes(p.id));
  }

  if (filtered.length === 0) return null;

  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getPuzzlesByCategory = (category: string): Puzzle[] => {
  return PUZZLES.filter(p => p.category === category);
};

export const checkPuzzleAnswer = (puzzle: Puzzle, selectedOptionId: string): boolean => {
  const selected = puzzle.options.find(o => o.id === selectedOptionId);
  return selected?.isCorrect ?? false;
};

export const PUZZLE_INTRO_LINES = [
  "Quick knowledge check. Let's see what you actually know.",
  "Time to prove you paid attention in your finance classes.",
  "A partner wants to test your understanding. No pressure.",
  "Pop quiz. Your career might depend on it.",
  "Let's see if you're just good at spreadsheets or actually understand the business.",
];

export const PUZZLE_SUCCESS_LINES = [
  "Correct. Maybe there's hope for you after all.",
  "Right answer. Don't let it go to your head.",
  "That's correct. Keep that knowledge sharp.",
  "You got it. The partners will be... less disappointed.",
  "Correct. You actually know something useful.",
];

export const PUZZLE_FAILURE_LINES = [
  "Wrong. Did you even read the training materials?",
  "Incorrect. This is basic stuff.",
  "That's not right. Maybe review your notes.",
  "Wrong answer. The partner looks disappointed.",
  "Incorrect. You might want to study up.",
  "That's wrong. How did you get hired again?",
];
