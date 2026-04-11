import type { CompanyActiveEvent, CompanyEventType, PortfolioCompany, EventOption } from '../types';

/**
 * Company Events Library
 *
 * Defines event templates for portfolio company events that can trigger
 * during the game. Each event type has a generator function that creates
 * a full event based on the company's current state.
 */

// Event generator type
type EventGenerator = (company: PortfolioCompany) => CompanyActiveEvent;

// Main event library
export const COMPANY_EVENTS: Record<CompanyEventType, EventGenerator> = {
  REVENUE_DROP: (company) => ({
    id: `rev_drop_${company.id}_${Date.now()}`,
    type: 'REVENUE_DROP',
    title: 'Revenue Miss',
    description: `${company.name} just reported Q results: Revenue came in 15% below forecast. The sales team is pointing fingers at product. Product blames marketing. The CEO wants an emergency board call.`,
    severity: 'WARNING',
    consultWithMachiavelli: true,
    expiresWeek: 2,
    options: [
      {
        id: 'fire_sales',
        label: 'Fire the Sales VP',
        description: 'Make an example. Send a message.',
        outcomeText: 'The Sales VP is out. The team is terrified. Revenue stabilizes but morale tanks.',
        statChanges: { stress: 10 },
        companyChanges: {
          revenueGrowth: 0.02,
          ceoPerformance: company.ceoPerformance - 10,
        },
      },
      {
        id: 'pivot_strategy',
        label: 'Pivot Go-to-Market Strategy',
        description: 'Invest $2M in new sales infrastructure and marketing.',
        outcomeText: 'Bold move. Results will take 6 months to show.',
        statChanges: { cash: -2000000, reputation: 5 },
        companyChanges: {
          cashBalance: company.cashBalance - 2000000,
          revenueGrowth: 0.08,
        },
        risk: 30,
      },
      {
        id: 'wait_and_see',
        label: 'Give them another quarter',
        description: 'Maybe it was a one-time blip.',
        outcomeText: 'You chose patience. The board is watching closely.',
        statChanges: {},
        companyChanges: {},
        risk: 60,
      },
    ],
  }),

  KEY_CUSTOMER_LOSS: (company) => ({
    id: `customer_loss_${company.id}_${Date.now()}`,
    type: 'KEY_CUSTOMER_LOSS',
    title: 'Major Customer Churning',
    description: `${company.name}'s largest customer (18% of revenue) just announced they're not renewing. Competitor swooped in with a lower price. The market will notice.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 1,
    options: [
      {
        id: 'match_price',
        label: "Match the competitor's price",
        description: 'Kill your margins but save the customer.',
        outcomeText: 'Customer stays. Your EBITDA takes a 20% hit.',
        statChanges: {},
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin - 0.05,
          ebitda: Math.round(company.ebitda * 0.8),
        },
      },
      {
        id: 'let_them_go',
        label: 'Let them walk',
        description: 'No customer is worth destroying your unit economics.',
        outcomeText: 'Revenue drops 18%. But your pricing integrity is intact.',
        statChanges: { reputation: -5 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.82),
          revenueGrowth: -0.15,
        },
      },
      {
        id: 'executive_intervention',
        label: 'Fly out personally',
        description: 'Drop everything, get on a plane, save the relationship.',
        outcomeText: 'The CEO of the customer respects the hustle. Partial renewal secured.',
        statChanges: { energy: -30, stress: 15, reputation: 10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.92),
        },
      },
    ],
  }),

  MANAGEMENT_DEPARTURE: (company) => ({
    id: `mgmt_dep_${company.id}_${Date.now()}`,
    type: 'MANAGEMENT_DEPARTURE',
    title: 'CFO Resignation',
    description: `${company.name}'s CFO just handed in their notice. They're going to a competitor. They know everything about your IP roadmap. This is bad.`,
    severity: 'WARNING',
    expiresWeek: 2,
    options: [
      {
        id: 'counteroffer',
        label: 'Massive counteroffer',
        description: 'Double their comp. Throw in more equity.',
        outcomeText: 'They stay, but everyone knows they were about to leave.',
        statChanges: { cash: -500000 },
        companyChanges: {},
      },
      {
        id: 'let_go_gracefully',
        label: 'Wish them well',
        description: 'Hire a search firm, move on.',
        outcomeText: 'Professional transition. Market respects how you handled it.',
        statChanges: { reputation: 5 },
        companyChanges: {
          ceoPerformance: company.ceoPerformance - 5,
        },
      },
      {
        id: 'enforce_noncompete',
        label: 'Threaten legal action',
        description: 'Enforce the non-compete. Make them suffer.',
        outcomeText: 'Lawyers are expensive. Bad press. But the competitor backs off.',
        statChanges: { cash: -200000, reputation: -10, ethics: -10 },
        companyChanges: {},
      },
    ],
  }),

  COMPETITOR_THREAT: (company) => ({
    id: `competitor_${company.id}_${Date.now()}`,
    type: 'COMPETITOR_THREAT',
    title: 'New Competitor Emerges',
    description: `A well-funded startup just launched a product that directly competes with ${company.name}'s core offering. They're pricing 40% below market and have a slick marketing campaign. The sales team is panicking.`,
    severity: 'WARNING',
    expiresWeek: 3,
    options: [
      {
        id: 'innovate',
        label: 'Accelerate R&D',
        description: 'Double down on product innovation. Outcompete them.',
        outcomeText: 'R&D budget increased. New features in the pipeline.',
        statChanges: { cash: -1000000 },
        companyChanges: {
          cashBalance: company.cashBalance - 1000000,
          revenueGrowth: company.revenueGrowth + 0.05,
        },
      },
      {
        id: 'acquire',
        label: 'Acquire the competitor',
        description: 'If you can\'t beat them, buy them.',
        outcomeText: 'Acquisition talks begin. This will be expensive.',
        statChanges: { stress: 15 },
        companyChanges: {},
        risk: 40,
      },
      {
        id: 'differentiate',
        label: 'Focus on enterprise',
        description: 'Move upmarket. Let them have the low end.',
        outcomeText: 'Sales team pivots to enterprise. Longer sales cycles, higher margins.',
        statChanges: {},
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin + 0.03,
          customerChurn: company.customerChurn + 0.02,
        },
      },
    ],
  }),

  ACQUISITION_OPPORTUNITY: (company) => ({
    id: `acquisition_${company.id}_${Date.now()}`,
    type: 'ACQUISITION_OPPORTUNITY',
    title: 'Bolt-On Opportunity',
    description: `A strategic add-on acquisition has come to market. Synergies with ${company.name} are obvious. The target is asking $15M, but there's room to negotiate.`,
    severity: 'INFO',
    expiresWeek: 4,
    options: [
      {
        id: 'acquire_full',
        label: 'Move aggressively',
        description: 'Pay full price to lock it down quickly.',
        outcomeText: 'Deal closes in 30 days. Integration begins immediately.',
        statChanges: { cash: -15000000, reputation: 5 },
        companyChanges: {
          revenue: company.revenue + 5000000,
          employeeCount: company.employeeCount + 50,
        },
      },
      {
        id: 'negotiate_hard',
        label: 'Negotiate aggressively',
        description: 'Try to get them for $10M.',
        outcomeText: 'Negotiations drag on. They might walk.',
        statChanges: { stress: 10 },
        companyChanges: {},
        risk: 50,
      },
      {
        id: 'pass',
        label: 'Pass on this one',
        description: 'Preserve capital for better opportunities.',
        outcomeText: 'You stay disciplined. A competitor picks it up.',
        statChanges: {},
        companyChanges: {},
      },
    ],
  }),

  REGULATORY_ISSUE: (company) => ({
    id: `regulatory_${company.id}_${Date.now()}`,
    type: 'REGULATORY_ISSUE',
    title: 'Regulatory Investigation',
    description: `${company.name} has received a subpoena from regulators. They're looking into sales practices from two years ago—before your investment. But you own it now.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 2,
    options: [
      {
        id: 'full_cooperation',
        label: 'Full cooperation',
        description: 'Open the books. Hire the best white-collar lawyers.',
        outcomeText: 'Legal fees mount. But regulators appreciate the transparency.',
        statChanges: { cash: -1500000, ethics: 10, auditRisk: -10 },
        companyChanges: {},
      },
      {
        id: 'fight_it',
        label: 'Fight the investigation',
        description: 'Challenge the scope. Delay and obstruct legally.',
        outcomeText: 'Years of litigation ahead. The outcome is uncertain.',
        statChanges: { cash: -500000, ethics: -15, auditRisk: 20, stress: 20 },
        companyChanges: {},
        risk: 60,
      },
      {
        id: 'settle_quickly',
        label: 'Seek quick settlement',
        description: 'Pay a fine, admit no wrongdoing, move on.',
        outcomeText: 'Settlement reached. The market views this neutrally.',
        statChanges: { cash: -3000000, reputation: -5 },
        companyChanges: {},
      },
    ],
  }),

  UNION_DISPUTE: (company) => ({
    id: `union_${company.id}_${Date.now()}`,
    type: 'UNION_DISPUTE',
    title: 'Labor Dispute Escalates',
    description: `Workers at ${company.name}'s main facility are threatening to strike. They want a 15% raise and better benefits. Operations will grind to a halt if this isn't resolved.`,
    severity: 'WARNING',
    expiresWeek: 2,
    options: [
      {
        id: 'negotiate_fairly',
        label: 'Negotiate in good faith',
        description: 'Offer 8% and improved benefits. Find middle ground.',
        outcomeText: 'After tense negotiations, a deal is reached. Workers are satisfied.',
        statChanges: { ethics: 10, reputation: 5 },
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin - 0.02,
        },
      },
      {
        id: 'hardline',
        label: 'Take a hard line',
        description: 'Offer 3% max. Prepare contingency plans.',
        outcomeText: 'Workers strike. Production halts for two weeks.',
        statChanges: { ethics: -10, reputation: -10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.95),
        },
        risk: 70,
      },
      {
        id: 'offshore',
        label: 'Accelerate offshoring',
        description: 'Move production overseas. Reduce union leverage.',
        outcomeText: 'Transition begins. Short-term pain, long-term savings.',
        statChanges: { ethics: -20, reputation: -15, cash: -2000000 },
        companyChanges: {
          employeeCount: Math.floor(company.employeeCount * 0.7),
          ebitdaMargin: company.ebitdaMargin + 0.05,
        },
      },
    ],
  }),

  SUPPLY_CHAIN_CRISIS: (company) => ({
    id: `supply_${company.id}_${Date.now()}`,
    type: 'SUPPLY_CHAIN_CRISIS',
    title: 'Supply Chain Disruption',
    description: `${company.name}'s primary supplier just had a factory fire. Lead times are now 16 weeks instead of 4. Q4 production is at risk.`,
    severity: 'CRITICAL',
    expiresWeek: 1,
    options: [
      {
        id: 'emergency_sourcing',
        label: 'Emergency alternative sourcing',
        description: 'Pay 40% premium to source from competitors\' suppliers.',
        outcomeText: 'Production continues at higher cost. Margins take a hit.',
        statChanges: { stress: 15 },
        companyChanges: {
          ebitdaMargin: company.ebitdaMargin - 0.08,
        },
      },
      {
        id: 'vertical_integration',
        label: 'Acquire a supplier',
        description: 'Buy a smaller supplier to secure the supply chain.',
        outcomeText: 'Vertical integration. Never again dependent on one supplier.',
        statChanges: { cash: -8000000, reputation: 5 },
        companyChanges: {
          cashBalance: company.cashBalance - 8000000,
        },
      },
      {
        id: 'delay_production',
        label: 'Delay Q4 production',
        description: 'Wait for normal supply. Disappoint customers.',
        outcomeText: 'Revenue pushed to next year. Some customers defect.',
        statChanges: { reputation: -10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.85),
          customerChurn: company.customerChurn + 0.05,
        },
      },
    ],
  }),

  ACTIVIST_INVESTOR: (company) => ({
    id: `activist_${company.id}_${Date.now()}`,
    type: 'ACTIVIST_INVESTOR',
    title: 'Activist Approaches Board',
    description: `An activist fund has acquired 5% of ${company.name} and is demanding board seats. They want you to sell the company immediately or do a massive dividend recap.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 3,
    options: [
      {
        id: 'fight',
        label: 'Prepare for proxy war',
        description: 'Hire advisors, rally shareholders, go to war.',
        outcomeText: 'The battle begins. Your attention is consumed for months.',
        statChanges: { stress: 25, energy: -20, cash: -1000000 },
        companyChanges: { hasBoardCrisis: true },
      },
      {
        id: 'negotiate',
        label: 'Give them a board seat',
        description: 'Appease them with representation.',
        outcomeText: "They're in. Now every decision requires their approval.",
        statChanges: { reputation: -5 },
        companyChanges: { boardAlignment: company.boardAlignment - 30 },
      },
      {
        id: 'accelerate_exit',
        label: 'Start exit process immediately',
        description: 'They want a sale? Fine. On YOUR terms.',
        outcomeText: 'You take control of the narrative. Exit process begins.',
        statChanges: { reputation: 10 },
        companyChanges: { isInExitProcess: true, exitType: 'STRATEGIC_SALE' },
      },
    ],
  }),

  IPO_WINDOW: (company) => ({
    id: `ipo_${company.id}_${Date.now()}`,
    type: 'IPO_WINDOW',
    title: 'IPO Window Opens',
    description: `Market conditions are favorable. Bankers are calling about taking ${company.name} public. At current multiples, you could see a 4x return. But IPO prep takes resources.`,
    severity: 'INFO',
    expiresWeek: 4,
    options: [
      {
        id: 'begin_ipo',
        label: 'Begin IPO process',
        description: 'Hire bankers, start the roadshow preparation.',
        outcomeText: 'IPO preparation begins. S-1 filing in 6 months.',
        statChanges: { stress: 20, cash: -500000 },
        companyChanges: { isInExitProcess: true, exitType: 'IPO' },
      },
      {
        id: 'dual_track',
        label: 'Run dual track',
        description: 'Prepare IPO while entertaining M&A offers.',
        outcomeText: 'Maximum optionality. Maximum stress.',
        statChanges: { stress: 30, cash: -750000 },
        companyChanges: {},
      },
      {
        id: 'not_ready',
        label: "We're not ready",
        description: 'Continue building. Wait for even better conditions.',
        outcomeText: 'The window may close. But you stay focused on fundamentals.',
        statChanges: {},
        companyChanges: {},
      },
    ],
  }),

  STRATEGIC_BUYER_INTEREST: (company) => ({
    id: `strategic_${company.id}_${Date.now()}`,
    type: 'STRATEGIC_BUYER_INTEREST',
    title: 'Strategic Interest',
    description: `A Fortune 500 company has reached out about acquiring ${company.name}. They're offering a 30% premium to current valuation. This could be the exit you've been waiting for.`,
    severity: 'INFO',
    consultWithMachiavelli: true,
    expiresWeek: 3,
    options: [
      {
        id: 'engage_seriously',
        label: 'Engage seriously',
        description: 'Open the data room. Start due diligence.',
        outcomeText: 'Negotiations begin. This could be transformational.',
        statChanges: { stress: 15 },
        companyChanges: { isInExitProcess: true, exitType: 'STRATEGIC_SALE' },
      },
      {
        id: 'play_hard_to_get',
        label: 'Play hard to get',
        description: 'Show interest but push for higher price.',
        outcomeText: 'They increase the offer. Or they walk.',
        statChanges: {},
        companyChanges: {},
        risk: 40,
      },
      {
        id: 'politely_decline',
        label: 'Politely decline',
        description: 'Not interested at any price right now.',
        outcomeText: 'They move on. Hopefully the offer comes back later.',
        statChanges: { reputation: 5 },
        companyChanges: {},
      },
    ],
  }),

  // ==================== NEW COMPANY EVENTS ====================

  CYBERSECURITY_BREACH: (company) => ({
    id: `cyber_${company.id}_${Date.now()}`,
    type: 'CYBERSECURITY_BREACH',
    title: 'Data Breach Detected',
    description: `${company.name}'s "head of security" (a sysadmin who also manages the printer) just discovered unauthorized access to customer databases. Someone used the password "admin123." It's unclear how long the breach lasted or how much data was exfiltrated, but the dark web forums are already selling the customer list for the price of a large pizza. The clock is ticking on disclosure requirements.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 1,
    options: [
      {
        id: 'immediate_disclosure',
        label: 'Immediate public disclosure',
        description: 'Get ahead of the story. Full transparency. The lawyers hate this.',
        outcomeText: 'The market reacts badly — stock drops, customers panic, and your inbox fills with angry emails from people who definitely never read the privacy policy. But regulators appreciate the transparency, and long-term trust is preserved. The CISO you\'re about to hire will cost a fortune.',
        statChanges: { reputation: 5, stress: 25, ethics: 15, auditRisk: -10 },
        companyChanges: {
          currentValuation: Math.round(company.currentValuation * 0.85),
          customerChurn: company.customerChurn + 0.03,
          cashBalance: company.cashBalance - 1000000,
        },
      },
      {
        id: 'quiet_investigation',
        label: 'Investigate quietly first',
        description: 'Assess the damage before going public. What they don\'t know won\'t hurt them. Right?',
        outcomeText: 'You buy time while a team of forensic analysts works around the clock. If this leaks before you disclose, the cover-up becomes the story. Every day is a game of regulatory Russian roulette.',
        statChanges: { stress: 30, ethics: -20, auditRisk: 20 },
        companyChanges: {
          ceoPerformance: company.ceoPerformance - 10,
        },
        risk: 60,
      },
      {
        id: 'hire_crisis_firm',
        label: 'Hire elite crisis management',
        description: 'Bring in the best PR and legal teams money can buy. Their hourly rate has its own hourly rate.',
        outcomeText: 'A SWAT team of crisis professionals descends on the office. They control the narrative, manage the disclosure, and somehow make you look like the victim. Expensive, but these people have cleaned up worse messes for bigger idiots.',
        statChanges: { cash: -2000000, stress: 15, reputation: 2 },
        companyChanges: {
          cashBalance: company.cashBalance - 2000000,
          customerChurn: company.customerChurn + 0.01,
        },
      },
    ],
  }),

  KEY_EMPLOYEE_POACHING: (company) => ({
    id: `poach_${company.id}_${Date.now()}`,
    type: 'KEY_EMPLOYEE_POACHING',
    title: 'Talent Raid',
    description: `A well-funded competitor is aggressively recruiting ${company.name}'s top engineers. Three key technical leads have received offers at 50% premiums. They're wavering.`,
    severity: 'WARNING',
    expiresWeek: 2,
    options: [
      {
        id: 'match_offers',
        label: 'Match the offers',
        description: 'Retain talent at any cost.',
        outcomeText: 'You keep your stars, but now everyone knows the price of loyalty.',
        statChanges: { cash: -800000 },
        companyChanges: {
          cashBalance: company.cashBalance - 800000,
        },
      },
      {
        id: 'let_them_go',
        label: 'Let them walk',
        description: 'No one is irreplaceable. Promote from within.',
        outcomeText: 'Key knowledge walks out the door. The remaining team is demoralized but also sees opportunity.',
        statChanges: { reputation: -5 },
        companyChanges: {
          ceoPerformance: company.ceoPerformance - 10,
          employeeCount: company.employeeCount - 3,
        },
      },
      {
        id: 'promote_and_equity',
        label: 'Promote them and accelerate vesting',
        description: 'Golden handcuffs. Make leaving too expensive.',
        outcomeText: 'New titles, accelerated equity. They stay, but you\'ve set a precedent.',
        statChanges: {},
        companyChanges: {
          ceoPerformance: company.ceoPerformance + 5,
        },
      },
    ],
  }),

  PRODUCT_RECALL: (company) => ({
    id: `recall_${company.id}_${Date.now()}`,
    type: 'PRODUCT_RECALL',
    title: 'Product Quality Crisis',
    description: `Quality control just flagged a serious defect in ${company.name}'s flagship product. Three customers have reported injuries. Legal is panicking. The factory is still running.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 1,
    options: [
      {
        id: 'full_recall',
        label: 'Immediate voluntary recall',
        description: 'Pull everything from shelves. Fix it right.',
        outcomeText: 'Massive short-term cost, but you\'ve done the right thing. The brand survives.',
        statChanges: { ethics: 20, reputation: 10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 0.85),
          cashBalance: company.cashBalance - 5000000,
        },
      },
      {
        id: 'silent_fix',
        label: 'Quietly fix future production',
        description: 'Don\'t acknowledge the problem. Just fix it going forward.',
        outcomeText: 'You save money. For now. The lawsuits will come eventually.',
        statChanges: { ethics: -30, auditRisk: 25 },
        companyChanges: {},
        risk: 70,
      },
      {
        id: 'blame_user_error',
        label: 'Claim user error',
        description: 'The product was used incorrectly. Deny responsibility.',
        outcomeText: 'Your legal team crafts a strong defense. The PR looks terrible.',
        statChanges: { ethics: -25, reputation: -15 },
        companyChanges: {
          customerChurn: company.customerChurn + 0.05,
        },
      },
    ],
  }),

  LAWSUIT_FILED: (company) => ({
    id: `lawsuit_${company.id}_${Date.now()}`,
    type: 'LAWSUIT_FILED',
    title: 'Class Action Filed',
    description: `A class action lawsuit has been filed against ${company.name} alleging anticompetitive practices. The plaintiffs are well-funded and their lawyers are experienced. Discovery will be brutal.`,
    severity: 'WARNING',
    expiresWeek: 3,
    options: [
      {
        id: 'settle_quickly',
        label: 'Settle quickly',
        description: 'Pay to make it go away before discovery.',
        outcomeText: 'Settlement reached. The terms are confidential, but the check was significant.',
        statChanges: { cash: -4000000, stress: -10 },
        companyChanges: {
          cashBalance: company.cashBalance - 4000000,
        },
      },
      {
        id: 'fight_vigorously',
        label: 'Fight in court',
        description: 'We did nothing wrong. Prove it in court.',
        outcomeText: 'Years of litigation ahead. Legal fees will compound. But sometimes you have to stand on principle.',
        statChanges: { stress: 20, cash: -1500000 },
        companyChanges: {
          cashBalance: company.cashBalance - 1500000,
        },
        risk: 50,
      },
      {
        id: 'countersue',
        label: 'Countersue aggressively',
        description: 'Attack is the best defense. File counterclaims.',
        outcomeText: 'Legal warfare. The plaintiffs didn\'t expect this level of aggression.',
        statChanges: { reputation: -10, cash: -2000000, stress: 25 },
        companyChanges: {
          cashBalance: company.cashBalance - 2000000,
        },
      },
    ],
  }),

  VIRAL_PR_CRISIS: (company) => ({
    id: `viral_${company.id}_${Date.now()}`,
    type: 'VIRAL_PR_CRISIS',
    title: 'Social Media Firestorm',
    description: `A video of ${company.name}'s CEO making spectacularly insensitive comments at a "private" event (nothing is private when every attendee has a phone) just went viral. The hashtag #Boycott${company.name.replace(/\s+/g, '')} is trending in 14 countries. Advertisers are calling — not to advertise. The PR firm you have on retainer just texted "call me ASAP" which is never, ever good.`,
    severity: 'CRITICAL',
    expiresWeek: 1,
    options: [
      {
        id: 'ceo_apology',
        label: 'CEO public apology tour',
        description: 'Full accountability. Morning shows, press conference, the works. Prepare the CEO for the phrase "I\'m deeply sorry."',
        outcomeText: 'The CEO delivers a masterclass in controlled contrition. Tears are shed (possibly genuine). The apology is seen as authentic enough that the news cycle moves on to the next outrage. Some brand damage remains, like a stain that never fully comes out, but the bleeding stops.',
        statChanges: { reputation: -5, stress: 20, ethics: 5 },
        companyChanges: {
          ceoPerformance: company.ceoPerformance - 20,
          customerChurn: company.customerChurn + 0.01,
        },
      },
      {
        id: 'fire_ceo',
        label: 'Fire the CEO immediately',
        description: 'Swift, decisive action. Send a message. The guillotine is quick and the crowd loves a spectacle.',
        outcomeText: 'The board announces the "mutual decision to part ways" (it was not mutual). Markets stabilize. Twitter celebrates. But now you have a leadership vacuum, a severance package that could fund a small nation, and an interim CEO who looks like a deer in headlights.',
        statChanges: { reputation: 5, stress: 15 },
        companyChanges: {
          ceoPerformance: 50, // New interim CEO
          boardAlignment: company.boardAlignment - 20,
          employeeGrowth: -0.03,
        },
      },
      {
        id: 'wait_it_out',
        label: 'Wait for the news cycle to move on',
        description: 'Say nothing. The internet has the attention span of a goldfish on espresso. This too shall pass.',
        outcomeText: 'You hunker down and ride it out. The hashtag trends for 72 hours, then a celebrity does something stupid and the mob moves on. But the screenshots live forever. Some customers don\'t forget, and that one journalist is writing a "deep dive" that will resurface this in six months.',
        statChanges: { ethics: -10 },
        companyChanges: {
          customerChurn: company.customerChurn + 0.04,
          revenue: Math.round(company.revenue * 0.95),
          revenueGrowth: -0.03,
        },
        risk: 40,
      },
    ],
  }),

  PARTNERSHIP_OPPORTUNITY: (company) => ({
    id: `partner_${company.id}_${Date.now()}`,
    type: 'PARTNERSHIP_OPPORTUNITY',
    title: 'Strategic Partnership Offer',
    description: `A major tech platform wants to integrate ${company.name}'s product as a default option for their 200 million users. It could double your distribution overnight — the kind of deal that makes venture capitalists weep with joy. But they want exclusivity, a revenue share that would make a loan shark blush, and a contract so one-sided it might technically be a hostage situation.`,
    severity: 'INFO',
    expiresWeek: 3,
    options: [
      {
        id: 'accept_terms',
        label: 'Accept their terms',
        description: 'Scale trumps margin. Get the distribution. Worry about profitability later, like every great tech company.',
        outcomeText: 'The partnership launches to fanfare. Revenue nearly doubles overnight. Margins get obliterated. Your CFO develops a twitch every time someone says "unit economics." But the top-line growth makes the next fundraise a breeze, and your exit multiple just got a serious upgrade.',
        statChanges: { reputation: 10, stress: 10 },
        companyChanges: {
          revenue: Math.round(company.revenue * 1.8),
          ebitdaMargin: company.ebitdaMargin * 0.6,
          revenueGrowth: 0.20,
          employeeGrowth: 0.05,
        },
      },
      {
        id: 'negotiate_better',
        label: 'Push back on terms',
        description: 'They need you too. Negotiate harder. Channel your inner "I\'m prepared to walk away" energy.',
        outcomeText: 'After weeks of back-and-forth, midnight emails, and one dramatic "final offer" that was followed by three more offers, you either get better terms or they partner with your competitor out of spite. The outcome depends on how much they actually needed you versus how much they said they needed you.',
        statChanges: { stress: 15 },
        companyChanges: {
          boardAlignment: company.boardAlignment - 5,
        },
        risk: 35,
      },
      {
        id: 'decline_partnership',
        label: 'Decline and stay independent',
        description: 'Preserve optionality. Don\'t become a vassal state to Big Tech.',
        outcomeText: 'You keep your independence, your margins, and your pride. The platform announces a partnership with your competitor the following Tuesday. Your sales team sends you the press release with a single-word message: "great." The board asks if you\'ve "considered all options."',
        statChanges: { reputation: -5, stress: 5 },
        companyChanges: {
          revenueGrowth: company.revenueGrowth - 0.03,
        },
      },
    ],
  }),

  TECHNOLOGY_DISRUPTION: (company) => ({
    id: `disruption_${company.id}_${Date.now()}`,
    type: 'TECHNOLOGY_DISRUPTION',
    title: 'Technological Disruption',
    description: `A Y Combinator startup with three employees and a dog just launched an AI-powered solution that could make ${company.name}'s core product obsolete within 18 months. They built it in a weekend hackathon. The technology is real — your CTO tried the demo and went silent for a very long time. Your R&D team, which spent $8M last year on incremental improvements, is having an existential crisis.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 2,
    options: [
      {
        id: 'acquire_disruptor',
        label: 'Acquire the disruptor',
        description: 'If you can\'t beat them, buy them before they know how much they\'re really worth.',
        outcomeText: 'You swoop in before the Series A closes and acquire the entire startup for what feels like a fortune now but will look like a bargain in two years. You now own the technology that would have killed you. The founders are now your highest-paid employees and they are insufferable about it.',
        statChanges: { cash: -10000000, reputation: 15, stress: 10 },
        companyChanges: {
          cashBalance: company.cashBalance - 10000000,
          revenueGrowth: company.revenueGrowth + 0.15,
          employeeGrowth: 0.05,
        },
      },
      {
        id: 'accelerate_rd',
        label: 'Build competing technology',
        description: 'Double down on R&D. If three people in a garage can do it, surely your 40-person engineering org can too.',
        outcomeText: 'R&D budget triples. The CTO promises a prototype in six months. Your existing engineers grumble about "pivoting again" while the new AI hires look at the legacy codebase with visible horror. The race is on. You\'re behind, but corporate bureaucracy has never stopped a determined engineering team. Wait, yes it has.',
        statChanges: { stress: 20 },
        companyChanges: {
          cashBalance: company.cashBalance - 3000000,
          employeeGrowth: 0.03,
        },
        risk: 50,
      },
      {
        id: 'pivot_business',
        label: 'Pivot to services',
        description: 'If the product becomes a commodity, sell the expertise. Every disruption creates a consulting opportunity.',
        outcomeText: 'You pivot to implementation and consulting with the elegance of a cargo ship making a U-turn. The product team is quietly devastated. But margins actually improve as you sell $400/hour advisory services to companies trying to adopt the very technology that disrupted you. Irony is the best business model.',
        statChanges: { reputation: -5 },
        companyChanges: {
          revenueGrowth: -0.1,
          ebitdaMargin: company.ebitdaMargin + 0.1,
          employeeGrowth: -0.05,
        },
      },
    ],
  }),

  CEO_SCANDAL: (company) => ({
    id: `scandal_${company.id}_${Date.now()}`,
    type: 'CEO_SCANDAL',
    title: 'CEO Personal Scandal',
    description: `${company.name}'s CEO has been accused of serious personal misconduct. The allegations are detailed, credible, and — because the universe has a cruel sense of timing — broke during your biggest customer conference. Media requests are flooding in faster than the PR team can say "no comment." The board WhatsApp group has 47 unread messages. The general counsel just texted "we need to talk" which, as everyone knows, is the professional equivalent of a death knell.`,
    severity: 'CRITICAL',
    consultWithMachiavelli: true,
    expiresWeek: 1,
    options: [
      {
        id: 'immediate_termination',
        label: 'Terminate immediately',
        description: 'Swift, decisive action. Zero tolerance. The axe falls before the next news cycle.',
        outcomeText: 'The CEO is out before they can clear their browser history. The board announcement is crisp, the messaging is aligned, and the market breathes a sigh of relief. Leadership transition is bumpy — the interim CEO keeps asking "where\'s the org chart?" — but the moral high ground is yours. ESG rating actually goes up.',
        statChanges: { ethics: 20, reputation: 10, stress: 15 },
        companyChanges: {
          ceoPerformance: 40, // New interim CEO
          boardAlignment: company.boardAlignment + 10,
          employeeGrowth: -0.02,
        },
      },
      {
        id: 'paid_leave_investigation',
        label: 'Paid leave pending investigation',
        description: 'Due process. Investigate before acting. Hire a law firm that charges by the syllable.',
        outcomeText: 'The CEO is "on leave" but still emailing the team at 2am. The investigation drags on like a Netflix series that should have been four episodes. Every day brings new headlines, new accusers, and new "anonymous sources close to the situation." The company is paralyzed. Productivity drops as employees spend more time on Twitter than on work.',
        statChanges: { stress: 25, cash: -1000000 },
        companyChanges: {
          ceoPerformance: company.ceoPerformance - 30,
          revenueGrowth: -0.05,
          customerChurn: company.customerChurn + 0.02,
        },
        risk: 60,
      },
      {
        id: 'stand_by_ceo',
        label: 'Publicly support the CEO',
        description: 'Innocent until proven guilty. Stand by your leader. Double down. What could go wrong?',
        outcomeText: 'The board issues a statement of "unwavering support" that ages like milk in the sun. If the allegations prove true, you\'re not just complicit — you\'re the punchline. Half the employees are appalled. The other half are updating LinkedIn. Your LP calls to "check in" which is investor code for "explain yourself."',
        statChanges: { ethics: -30, reputation: -20 },
        companyChanges: {
          employeeGrowth: -0.08,
          boardAlignment: company.boardAlignment - 15,
        },
        risk: 70,
      },
    ],
  }),

  DEBT_COVENANT_BREACH: (company) => ({
    id: `covenant_${company.id}_${Date.now()}`,
    type: 'DEBT_COVENANT_BREACH',
    title: 'Debt Covenant Breach',
    description: `${company.name} just missed its EBITDA coverage ratio by 0.2x — the financial equivalent of tripping the alarm at a bank you already own. Technically, the lenders can call the entire loan. They're "reviewing the situation," which is banker-speak for "sharpening knives." Your CFO is on a red-eye to meet them, rehearsing the phrase "one-time adjustment" like a mantra. The lenders' lawyer has already billed three hours just reading the covenant language.`,
    severity: 'CRITICAL',
    expiresWeek: 1,
    options: [
      {
        id: 'negotiate_amendment',
        label: 'Negotiate covenant amendment',
        description: 'Hat in hand. Pay the amendment fee. Promise it won\'t happen again (it might).',
        outcomeText: 'After a groveling session that would make a medieval serf uncomfortable, the lenders agree to modified terms. The amendment fee is steep enough to make your CFO physically wince. But the loan stays in place, the covenant gets reset, and you live to fight another quarter. The lenders now monitor your financials like a helicopter parent.',
        statChanges: { cash: -1500000, stress: 20, reputation: -5 },
        companyChanges: {
          cashBalance: company.cashBalance - 1500000,
          boardAlignment: company.boardAlignment - 5,
        },
      },
      {
        id: 'equity_injection',
        label: 'Inject equity to cure breach',
        description: 'Write a check from the fund. Fix the ratio with brute-force capital.',
        outcomeText: 'You wire $5M from the fund to cure the breach. The lenders are satisfied — nothing soothes a creditor like cold hard cash. Your LPs are less thrilled. Your ownership effectively dilutes, and the IRR calculation just took a hit that would make a finance professor weep. But hey, you\'re solvent.',
        statChanges: { cash: -5000000, financialEngineering: 2 },
        companyChanges: {
          debt: Math.round(company.debt * 0.9),
          cashBalance: company.cashBalance + 3000000,
        },
      },
      {
        id: 'refinance_completely',
        label: 'Find new lenders',
        description: 'Refinance the entire debt package. Start from scratch with someone who doesn\'t hate you yet.',
        outcomeText: 'After weeks of humiliating roadshows where you explain "what happened" to increasingly skeptical credit committees, new lenders emerge from the shadows. The terms are worse — higher rate, tighter covenants, a personal guarantee that makes your lawyer nervous. But you survive. The old lenders wave goodbye with a mix of relief and pity.',
        statChanges: { stress: 30, reputation: -8 },
        companyChanges: {
          debt: Math.round(company.debt * 1.1), // Higher debt load from worse terms
          runwayMonths: -3,
        },
        risk: 40,
      },
    ],
  }),

  ACQUISITION_OFFER_RECEIVED: (company) => ({
    id: `offer_${company.id}_${Date.now()}`,
    type: 'ACQUISITION_OFFER_RECEIVED',
    title: 'Unsolicited Acquisition Offer',
    description: `A private equity competitor — the kind that names their conference rooms after Greek gods — just made an unsolicited offer for ${company.name} at a 40% premium. They want exclusivity for 30 days, which in PE time is basically "right now." The offer letter is annoyingly well-written. The premium is compelling, but you had bigger plans. Or did you? The board is suddenly very interested in "exploring all options."`,
    severity: 'INFO',
    consultWithMachiavelli: true,
    expiresWeek: 2,
    options: [
      {
        id: 'accept_offer',
        label: 'Accept the offer',
        description: 'A bird in hand is worth two in the IC memo. Take the premium and exit.',
        outcomeText: 'Deal closes in 60 days. You book a solid return that will look great on the track record. The carry check clears. Was there more value to unlock? Probably. Will you lose sleep over it? Only on the nights you don\'t sleep on your new boat. Your LPs send a fruit basket.',
        statChanges: { reputation: 10, cash: Math.round(company.currentValuation * 0.4), stress: -10 },
        companyChanges: { isInExitProcess: true, exitType: 'SECONDARY_SALE' },
      },
      {
        id: 'shop_the_offer',
        label: 'Use offer to solicit competing bids',
        description: 'Let everyone know there\'s interest. Create a feeding frenzy. Nothing drives up price like FOMO.',
        outcomeText: 'You "accidentally" let slip that there\'s a credible offer on the table. Suddenly every PE fund in town wants a look. The price creeps up as egos and checkbooks compete. Or the original buyer gets offended by your betrayal and walks, leaving you with tire-kickers and time-wasters. High risk, high reward.',
        statChanges: { stress: 20, reputation: -3 },
        companyChanges: {
          boardAlignment: company.boardAlignment - 10,
        },
        risk: 30,
      },
      {
        id: 'reject_outright',
        label: 'Reject and continue executing',
        description: 'You have a plan. A five-year plan, in fact, with 47 slides. Stick to it.',
        outcomeText: 'You send a polite rejection that your lawyer spent three hours wordsmithing. The buyer moves on to destroy someone else\'s inbox. Your team is focused on the original strategy. The board nods approvingly. Secretly, everyone wonders if you just left money on the table. Time will tell.',
        statChanges: { reputation: 5, stress: 5 },
        companyChanges: {
          boardAlignment: company.boardAlignment + 5,
          ceoPerformance: company.ceoPerformance + 5,
        },
      },
    ],
  }),
};

/**
 * Generate a full event for a company based on event type
 */
export const generateCompanyEvent = (
  company: PortfolioCompany,
  eventType: CompanyEventType
): CompanyActiveEvent => {
  const generator = COMPANY_EVENTS[eventType];
  return generator(company);
};

/**
 * Determine if an event should trigger based on company state
 * Returns the event type to trigger, or null if no event should occur
 */
export const shouldTriggerEvent = (
  company: PortfolioCompany,
  currentWeek: number
): CompanyEventType | null => {
  // Don't trigger if company already has active event
  if (company.activeEvent) return null;

  // Base probability per week
  const baseProbability = 0.08; // 8% chance per company per week

  // Adjust based on company health
  let probability = baseProbability;
  if (company.revenueGrowth < -0.1) probability += 0.10; // Struggling = more events
  if (company.ceoPerformance < 40) probability += 0.05;
  if (company.boardAlignment < 50) probability += 0.05;

  if (Math.random() > probability) return null;

  // Select event type based on company state
  const possibleEvents: CompanyEventType[] = [];

  if (company.revenueGrowth < 0) possibleEvents.push('REVENUE_DROP');
  if (Math.random() > 0.7) possibleEvents.push('KEY_CUSTOMER_LOSS');
  if (company.ceoPerformance < 50) possibleEvents.push('MANAGEMENT_DEPARTURE');
  if (company.currentValuation > 100000000) {
    possibleEvents.push('ACTIVIST_INVESTOR');
    possibleEvents.push('STRATEGIC_BUYER_INTEREST');
    possibleEvents.push('ACQUISITION_OFFER_RECEIVED');
  }
  if (company.revenueGrowth > 0.2 && company.currentValuation > 50000000) {
    possibleEvents.push('IPO_WINDOW');
  }
  if (Math.random() > 0.8) possibleEvents.push('COMPETITOR_THREAT');
  if (Math.random() > 0.9) {
    possibleEvents.push('REGULATORY_ISSUE');
    possibleEvents.push('SUPPLY_CHAIN_CRISIS');
    possibleEvents.push('UNION_DISPUTE');
  }

  // New event triggers
  if (Math.random() > 0.85) possibleEvents.push('CYBERSECURITY_BREACH');
  if (company.revenueGrowth > 0.15) possibleEvents.push('KEY_EMPLOYEE_POACHING');
  if (Math.random() > 0.92) possibleEvents.push('PRODUCT_RECALL');
  if (Math.random() > 0.88) possibleEvents.push('LAWSUIT_FILED');
  if (company.ceoPerformance > 70 && Math.random() > 0.9) possibleEvents.push('VIRAL_PR_CRISIS');
  if (company.revenueGrowth > 0.25) possibleEvents.push('PARTNERSHIP_OPPORTUNITY');
  if (Math.random() > 0.9) possibleEvents.push('TECHNOLOGY_DISRUPTION');
  if (Math.random() > 0.95) possibleEvents.push('CEO_SCANDAL');
  if (company.debt > company.ebitda * 5) possibleEvents.push('DEBT_COVENANT_BREACH');

  if (possibleEvents.length === 0) return null;

  return possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
};

/**
 * Apply the outcome of an event option
 */
export const applyEventOutcome = (
  option: EventOption,
  company: PortfolioCompany
): { statChanges: typeof option.statChanges; companyUpdates: Partial<PortfolioCompany>; wasRisky: boolean } => {
  let wasRisky = false;

  // Check if risky outcome occurs
  if (option.risk && Math.random() * 100 < option.risk) {
    wasRisky = true;
    // Risky outcomes are worse versions of the normal outcome
    // This is a simplified version - could be expanded
  }

  return {
    statChanges: option.statChanges,
    companyUpdates: option.companyChanges,
    wasRisky,
  };
};
