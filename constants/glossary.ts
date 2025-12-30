/**
 * Private Equity Glossary
 *
 * Educational content for players to learn PE terminology.
 * Used by GlossaryTooltip component.
 */

export interface GlossaryTerm {
  term: string;
  fullName?: string;
  definition: string;
  formula?: string;
  example?: string;
  relatedTerms?: string[];
  difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  category: 'VALUATION' | 'DEALS' | 'FINANCE' | 'LEGAL' | 'OPERATIONS';
}

export const PE_GLOSSARY: GlossaryTerm[] = [
  // ==================== VALUATION ====================
  {
    term: 'IRR',
    fullName: 'Internal Rate of Return',
    definition: 'The discount rate that makes the Net Present Value (NPV) of all cash flows equal to zero. It represents the annualized return on an investment.',
    formula: '0 = CF₀ + CF₁/(1+IRR)¹ + CF₂/(1+IRR)² + ... + CFₙ/(1+IRR)ⁿ',
    example: 'Invest $10M, exit at $25M in 4 years → IRR ≈ 26%',
    relatedTerms: ['MOIC', 'NPV', 'Hurdle Rate'],
    difficulty: 'INTERMEDIATE',
    category: 'VALUATION',
  },
  {
    term: 'MOIC',
    fullName: 'Multiple on Invested Capital',
    definition: 'Total value received divided by total capital invested. A 3x MOIC means you got back $3 for every $1 invested.',
    formula: 'MOIC = Total Distributions / Total Invested Capital',
    example: 'Invest $10M, receive $30M total → MOIC = 3.0x',
    relatedTerms: ['IRR', 'DPI', 'TVPI'],
    difficulty: 'BASIC',
    category: 'VALUATION',
  },
  {
    term: 'EV',
    fullName: 'Enterprise Value',
    definition: 'The total value of a company, including both equity and debt. It represents what you would pay to acquire the entire business.',
    formula: 'EV = Market Cap + Debt - Cash',
    example: 'Company with $100M equity value, $50M debt, $10M cash → EV = $140M',
    relatedTerms: ['Equity Value', 'EV/EBITDA', 'EV/Revenue'],
    difficulty: 'BASIC',
    category: 'VALUATION',
  },
  {
    term: 'EBITDA',
    fullName: 'Earnings Before Interest, Taxes, Depreciation, and Amortization',
    definition: 'A measure of operating profitability that strips out financing and accounting decisions. The primary metric PE uses to value companies.',
    formula: 'EBITDA = Revenue - Operating Expenses (excl. D&A)',
    example: 'Revenue $100M - OpEx $70M - D&A $10M = Net Income $20M → EBITDA = $30M',
    relatedTerms: ['EV/EBITDA', 'EBITDA Margin', 'Adjusted EBITDA'],
    difficulty: 'BASIC',
    category: 'VALUATION',
  },
  {
    term: 'EV/EBITDA',
    fullName: 'Enterprise Value to EBITDA Multiple',
    definition: 'The most common valuation metric in PE. Shows how many times EBITDA you\'re paying for a company. Higher multiples mean more expensive.',
    formula: 'Multiple = Enterprise Value / EBITDA',
    example: '$100M EV / $10M EBITDA = 10x multiple',
    relatedTerms: ['EBITDA', 'EV', 'Comparable Companies'],
    difficulty: 'BASIC',
    category: 'VALUATION',
  },
  {
    term: 'NPV',
    fullName: 'Net Present Value',
    definition: 'The sum of all future cash flows discounted to present value. If positive, the investment creates value; if negative, it destroys value.',
    formula: 'NPV = Σ CFₜ / (1 + r)ᵗ',
    example: 'Cash flows of $10M for 5 years at 10% discount rate → NPV = $37.9M',
    relatedTerms: ['IRR', 'Discount Rate', 'DCF'],
    difficulty: 'INTERMEDIATE',
    category: 'VALUATION',
  },
  {
    term: 'DCF',
    fullName: 'Discounted Cash Flow',
    definition: 'A valuation method that projects future cash flows and discounts them to present value. The core of fundamental analysis.',
    relatedTerms: ['NPV', 'WACC', 'Terminal Value'],
    difficulty: 'INTERMEDIATE',
    category: 'VALUATION',
  },

  // ==================== DEALS ====================
  {
    term: 'LBO',
    fullName: 'Leveraged Buyout',
    definition: 'Acquiring a company using significant debt (leverage) to fund the purchase. The target company\'s cash flows are used to pay down the debt.',
    example: 'Buy company for $100M using $30M equity + $70M debt. Use company cash flow to repay debt.',
    relatedTerms: ['Leverage', 'Debt/EBITDA', 'Equity Check'],
    difficulty: 'INTERMEDIATE',
    category: 'DEALS',
  },
  {
    term: 'IOI',
    fullName: 'Indication of Interest',
    definition: 'A non-binding letter expressing interest in acquiring a company, typically including a preliminary valuation range.',
    example: '"We are pleased to indicate our interest in acquiring TargetCo at a valuation of $80-100M."',
    relatedTerms: ['LOI', 'CIM', 'Process Letter'],
    difficulty: 'BASIC',
    category: 'DEALS',
  },
  {
    term: 'LOI',
    fullName: 'Letter of Intent',
    definition: 'A more detailed and typically exclusive document outlining deal terms. Usually leads to exclusivity and final due diligence.',
    relatedTerms: ['IOI', 'Exclusivity', 'Definitive Agreement'],
    difficulty: 'BASIC',
    category: 'DEALS',
  },
  {
    term: 'CIM',
    fullName: 'Confidential Information Memorandum',
    definition: 'A detailed document prepared by the sell-side advisor describing the target company, its financials, operations, and growth opportunities.',
    relatedTerms: ['Teaser', 'Data Room', 'Management Presentation'],
    difficulty: 'BASIC',
    category: 'DEALS',
  },
  {
    term: 'DD',
    fullName: 'Due Diligence',
    definition: 'The investigation and analysis of a target company before acquisition. Includes financial, legal, operational, and commercial workstreams.',
    example: 'Financial DD: verify revenue quality. Commercial DD: assess market position. Legal DD: review contracts.',
    relatedTerms: ['Red Flag', 'QoE', 'Data Room'],
    difficulty: 'BASIC',
    category: 'DEALS',
  },
  {
    term: 'QoE',
    fullName: 'Quality of Earnings',
    definition: 'A financial due diligence report that verifies the sustainability and quality of a company\'s reported earnings.',
    example: 'QoE reveals $2M of "one-time" expenses that recur annually, reducing normalized EBITDA.',
    relatedTerms: ['DD', 'Adjusted EBITDA', 'Add-backs'],
    difficulty: 'INTERMEDIATE',
    category: 'DEALS',
  },
  {
    term: 'Bolt-on',
    fullName: 'Bolt-on Acquisition',
    definition: 'A smaller acquisition made by a portfolio company to add capabilities, customers, or geographic reach.',
    example: 'Platform company acquires smaller competitor for $20M to enter new market.',
    relatedTerms: ['Platform', 'Add-on', 'Roll-up'],
    difficulty: 'INTERMEDIATE',
    category: 'DEALS',
  },
  {
    term: 'Platform',
    fullName: 'Platform Company',
    definition: 'The initial larger acquisition that serves as a base for future add-on acquisitions and value creation.',
    relatedTerms: ['Bolt-on', 'Roll-up', 'Buy and Build'],
    difficulty: 'INTERMEDIATE',
    category: 'DEALS',
  },

  // ==================== FINANCE ====================
  {
    term: 'Carried Interest',
    fullName: 'Carried Interest (Carry)',
    definition: 'The share of profits (typically 20%) that PE fund managers receive after returning investor capital plus a hurdle rate.',
    formula: 'Carry = (Total Profits - LP Capital - Hurdle Return) × 20%',
    example: 'Fund returns $200M on $100M invested. After 8% hurdle ($8M), carry = ($92M × 20%) = $18.4M',
    relatedTerms: ['Hurdle Rate', 'Waterfall', 'Clawback'],
    difficulty: 'ADVANCED',
    category: 'FINANCE',
  },
  {
    term: 'Waterfall',
    fullName: 'Distribution Waterfall',
    definition: 'The order in which profits are distributed between Limited Partners (investors) and General Partners (fund managers).',
    example: '1) Return LP capital → 2) 8% preferred return → 3) GP catch-up → 4) 80/20 split',
    relatedTerms: ['Carried Interest', 'Preferred Return', 'GP/LP'],
    difficulty: 'ADVANCED',
    category: 'FINANCE',
  },
  {
    term: 'Leverage Ratio',
    fullName: 'Debt to EBITDA Ratio',
    definition: 'The ratio of a company\'s debt to its EBITDA. Higher ratios mean more financial risk.',
    formula: 'Leverage = Total Debt / EBITDA',
    example: '$100M debt / $20M EBITDA = 5.0x leverage (aggressive)',
    relatedTerms: ['Covenant', 'Interest Coverage', 'Debt Service'],
    difficulty: 'INTERMEDIATE',
    category: 'FINANCE',
  },
  {
    term: 'Covenant',
    fullName: 'Debt Covenant',
    definition: 'Financial conditions that borrowers must maintain. Breaching covenants can trigger default.',
    example: 'Max leverage covenant of 5.0x. If EBITDA drops and ratio hits 5.5x, you\'re in breach.',
    relatedTerms: ['Leverage', 'Default', 'Waiver'],
    difficulty: 'INTERMEDIATE',
    category: 'FINANCE',
  },
  {
    term: 'Dry Powder',
    fullName: 'Uncommitted Capital',
    definition: 'Capital that has been committed by LPs but not yet invested. Available for new deals.',
    example: '$500M fund with $300M deployed = $200M dry powder',
    relatedTerms: ['Committed Capital', 'Called Capital', 'AUM'],
    difficulty: 'BASIC',
    category: 'FINANCE',
  },
  {
    term: 'Hurdle Rate',
    fullName: 'Preferred Return',
    definition: 'The minimum return that LPs must receive before GP can take carried interest. Typically 8% annually.',
    relatedTerms: ['Carried Interest', 'Waterfall', 'LP'],
    difficulty: 'INTERMEDIATE',
    category: 'FINANCE',
  },
  {
    term: 'Unitranche',
    fullName: 'Unitranche Debt',
    definition: 'A blended debt structure combining senior and subordinated debt into a single loan with one rate.',
    relatedTerms: ['Senior Debt', 'Mezzanine', 'Credit Agreement'],
    difficulty: 'ADVANCED',
    category: 'FINANCE',
  },
  {
    term: 'PIK',
    fullName: 'Payment-in-Kind',
    definition: 'Interest payments that are added to principal rather than paid in cash. Preserves cash but increases total debt.',
    example: 'Instead of paying $1M cash interest, add $1M to loan balance.',
    relatedTerms: ['Cash Pay', 'Toggle', 'Accrued Interest'],
    difficulty: 'ADVANCED',
    category: 'FINANCE',
  },

  // ==================== LEGAL ====================
  {
    term: 'GP',
    fullName: 'General Partner',
    definition: 'The fund manager entity that makes investment decisions and operates the fund. Takes carried interest.',
    relatedTerms: ['LP', 'Management Fee', 'Carried Interest'],
    difficulty: 'BASIC',
    category: 'LEGAL',
  },
  {
    term: 'LP',
    fullName: 'Limited Partner',
    definition: 'The investors in a PE fund. They provide capital but have limited liability and no management role.',
    example: 'Pension funds, endowments, family offices, and sovereign wealth funds are typical LPs.',
    relatedTerms: ['GP', 'Committed Capital', 'Capital Call'],
    difficulty: 'BASIC',
    category: 'LEGAL',
  },
  {
    term: 'Capital Call',
    fullName: 'Drawdown',
    definition: 'When the GP requests LPs to fund their committed capital, typically for a new investment.',
    relatedTerms: ['Committed Capital', 'LP', 'Dry Powder'],
    difficulty: 'INTERMEDIATE',
    category: 'LEGAL',
  },
  {
    term: 'MAC',
    fullName: 'Material Adverse Change',
    definition: 'A significant negative change in a company\'s business that may allow a buyer to renegotiate or terminate a deal.',
    relatedTerms: ['Definitive Agreement', 'Representations', 'Walk Away'],
    difficulty: 'INTERMEDIATE',
    category: 'LEGAL',
  },

  // ==================== OPERATIONS ====================
  {
    term: 'OpEx',
    fullName: 'Operating Expenses',
    definition: 'Day-to-day costs of running the business: salaries, rent, utilities, marketing, etc.',
    relatedTerms: ['EBITDA', 'Gross Margin', 'SG&A'],
    difficulty: 'BASIC',
    category: 'OPERATIONS',
  },
  {
    term: 'SG&A',
    fullName: 'Selling, General & Administrative',
    definition: 'Overhead costs including sales, marketing, executive salaries, and corporate functions.',
    relatedTerms: ['OpEx', 'EBITDA', 'Cost Structure'],
    difficulty: 'BASIC',
    category: 'OPERATIONS',
  },
  {
    term: 'COGS',
    fullName: 'Cost of Goods Sold',
    definition: 'Direct costs of producing goods or services: materials, labor, manufacturing.',
    formula: 'Gross Profit = Revenue - COGS',
    relatedTerms: ['Gross Margin', 'Revenue', 'Contribution Margin'],
    difficulty: 'BASIC',
    category: 'OPERATIONS',
  },
  {
    term: 'Gross Margin',
    fullName: 'Gross Profit Margin',
    definition: 'Revenue minus COGS, expressed as a percentage. Shows pricing power and production efficiency.',
    formula: 'Gross Margin = (Revenue - COGS) / Revenue',
    example: '$100M revenue - $60M COGS = 40% gross margin',
    relatedTerms: ['COGS', 'EBITDA Margin', 'Contribution Margin'],
    difficulty: 'BASIC',
    category: 'OPERATIONS',
  },
  {
    term: 'CapEx',
    fullName: 'Capital Expenditures',
    definition: 'Investments in long-term assets like property, equipment, and technology. Reduces free cash flow.',
    relatedTerms: ['Free Cash Flow', 'OpEx', 'Depreciation'],
    difficulty: 'INTERMEDIATE',
    category: 'OPERATIONS',
  },
];

// Helper functions
export const getTermByName = (term: string): GlossaryTerm | undefined =>
  PE_GLOSSARY.find(t => t.term.toLowerCase() === term.toLowerCase());

export const getTermsByCategory = (category: GlossaryTerm['category']): GlossaryTerm[] =>
  PE_GLOSSARY.filter(t => t.category === category);

export const getTermsByDifficulty = (difficulty: GlossaryTerm['difficulty']): GlossaryTerm[] =>
  PE_GLOSSARY.filter(t => t.difficulty === difficulty);

export const searchTerms = (query: string): GlossaryTerm[] =>
  PE_GLOSSARY.filter(t =>
    t.term.toLowerCase().includes(query.toLowerCase()) ||
    t.fullName?.toLowerCase().includes(query.toLowerCase()) ||
    t.definition.toLowerCase().includes(query.toLowerCase())
  );

export default PE_GLOSSARY;
