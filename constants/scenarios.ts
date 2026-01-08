/**
 * Scenarios Constants
 *
 * Game scenarios, news events, quiz questions, predefined questions,
 * portfolio actions, and other game content.
 */

import type { Scenario, QuizQuestion, PortfolioAction, DueDiligencePhase, FinancingPhase, PortfolioCompany } from '../types';
import { DealType } from '../types';

// Due diligence and financing phase definitions (internal to scenarios)
const dueDiligencePhaseLBO: DueDiligencePhase = {
  description: "DUE DILIGENCE (LBO): The numbers need to be bulletproof. Where do you focus your limited time?",
  choices: [
    {
      text: "Stress test the debt covenants.",
      outcome: {
        description: "You find that a minor dip in revenue would trigger a default. You renegotiate terms, earning a nod of respect from the debt team. They still think you're a child in a suit.",
        statChanges: { reputation: +5, analystRating: +5, score: +200 },
      },
    },
    {
      text: "Dig for 'synergies' (i.e., people to fire).",
      outcome: {
        description: "You identify millions in 'redundancies'. It's cold, but it makes the model sing. Your sociopathic tendencies are noted as a positive trait for this career path.",
        statChanges: { stress: +5, analystRating: +10, score: +150, ethics: -10 },
      },
    },
    {
      text: "Conduct 'off-channel' reference checks on the management team.",
      outcome: {
        description: "Your discreet inquiries reveal the CEO is a visionary held back by a board of fossils. Replacing them could unlock massive value. You've found the real alpha.",
        statChanges: { reputation: +10, analystRating: +5, score: +300 },
      },
    },
    {
      text: "Analyze the customer list for concentration risk.",
      outcome: {
        description: "You discover 80% of revenue comes from a single client whose contract is up for renewal in six months. You've just saved the fund from buying a ticking time bomb. Chad gives you a rare, almost perceptible nod of approval.",
        statChanges: { reputation: +15, stress: -5, score: +500 },
      },
    },
    {
      text: "Investigate supply chain dependencies.",
      outcome: {
        description: "You find a dangerous reliance on a single supplier in a politically unstable region. You force the company to diversify its sourcing before closing. A boring, unsexy move that saves the company two years later.",
        statChanges: { analystRating: +10, stress: -5, score: +350 },
      },
    },
  ],
};

const financingPhaseLBO: FinancingPhase = {
  description: "FINANCING: The deal lives or dies by the debt. How do you structure the capital stack? Your choice will modify the final deal terms.",
  choices: [
    {
      text: "Max out on cheap, senior debt.",
      description: "High leverage, low cost of capital, but very restrictive covenants. This is the classic, high-risk, high-reward PE play.",
      sarcasticGuidance: "Lever up to the eyeballs. What could possibly go wrong? It's not your money anyway.",
      outcome: {
        description: "You convince the banks to fund the majority of the deal. It's cheap, but the covenants are tight as a drum. One misstep and they'll own the company. This increases leverage but also risk.",
        statChanges: { financialEngineering: +5, stress: +10, dealModification: { debt: 95000000, currentValuation: 58000000 } }
      },
      skillCheck: {
        skill: 'financialEngineering',
        threshold: 30,
        bonus: {
          description: "Your sharp skills allow you to negotiate a bullet payment, giving the company more breathing room. The bankers are sweating.",
          statChanges: { financialEngineering: +5, stress: -5 }
        }
      }
    },
    {
      text: "Bring in a mezzanine partner.",
      description: "Use expensive, flexible debt with equity kickers. Less restrictive than senior debt, but it dilutes your upside.",
      sarcasticGuidance: "Expensive debt with a friend attached. They'll be very helpful... right up until they try to take the company from you.",
      outcome: {
        description: "You bring in a mezzanine fund for a slice of expensive debt with equity kickers. It gives you more flexibility but eats into your returns and adds a vulture to your cap table.",
        statChanges: { reputation: +5, dealModification: { debt: 70000000, ownershipPercentage: 60, currentValuation: 56000000 } }
      }
    },
    {
      text: "Bring in an equity partner.",
      description: "Syndicate the deal with another PE firm. It lowers your risk and cash contribution, but you have to share control and the upside.",
      sarcasticGuidance: "Share the blame if it goes wrong, and the credit if it goes right. A true politician's move.",
      outcome: {
        description: "You can't get the debt numbers to work, so you syndicate the deal, bringing in another PE firm. You get the deal done, but you have to share the upside and the credit. Your firm is seen as a junior partner.",
        statChanges: { reputation: -5, dealModification: { investmentCost: 40000000, ownershipPercentage: 45 } }
      }
    }
  ]
};

const dueDiligencePhaseGrowth: DueDiligencePhase = {
  description: "DUE DILIGENCE (Growth Equity): The story is great, but is it real? How do you verify the hype?",
  choices: [
    {
      text: "Interview key customers.",
      outcome: {
        description: "You discover the customers love the product but have no intention of paying more. The growth story is weaker than you thought. This valuable intel prevents a bad deal.",
        statChanges: { reputation: +10, analystRating: +5, score: +350 },
      },
    },
    {
      text: "Analyze competitor tech.",
      outcome: {
        description: "You realize their 'proprietary tech' is just an off-the-shelf software with a new logo. You've uncovered a major risk, saving the firm from embarrassment.",
        statChanges: { reputation: +5, stress: +5, score: +200 },
      },
    },
    {
      text: "Audit their operational scalability.",
      outcome: {
        description: "Their 'scalable infrastructure' is one overworked engineer and a mountain of technical debt. Pouring money on this fire would just make it bigger. You recommend a smaller investment tied to key hiring milestones.",
        statChanges: { analystRating: +10, reputation: +5, score: +400 },
      },
    },
  ],
};

const dueDiligencePhaseVC: DueDiligencePhase = {
  description: "DUE DILIGENCE (Venture): Forget profits. Is the founder a 'visionary' or just delusional? How do you find out?",
  choices: [
    {
      text: "Check the founder's background.",
      outcome: {
        description: "Turns out the founder's last three 'unicorn' startups were actually ponies that went to the glue factory. You avoid a charismatic fraud.",
        statChanges: { reputation: +10, score: +300 },
      },
    },
    {
      text: "Talk to ex-employees.",
      outcome: {
        description: "You hear horror stories of a toxic culture and a leader who thinks 'strategy' is a new flavor of kombucha. You dodge a bullet disguised as a messiah.",
        statChanges: { stress: -5, reputation: +5, score: +200, ethics: +5 },
      },
    },
    {
      text: "Scrutinize the cap table for red flags.",
      outcome: {
        description: "The cap table is a mess of dead equity and toxic preference stacks. The founder gave away 40% of the company for seed money. You've identified a major roadblock for future funding rounds.",
        statChanges: { analystRating: +10, stress: +5, score: +350 },
      },
    },
    {
      text: "Pressure test the Total Addressable Market (TAM) claims.",
      outcome: {
        description: "Their 'trillion-dollar market' includes every human with a pulse. Your bottoms-up analysis reveals a realistic market size that's a fraction of their claim. You save the fund from investing in a PowerPoint fantasy.",
        statChanges: { reputation: +10, analystRating: +15, score: +500 }
      }
    }
  ],
};

const financingPhaseVC: FinancingPhase = {
  description: "TERM SHEET: Even in VC, terms matter. How do you structure the investment?",
  choices: [
    {
      text: "SAFE Note (Founder Friendly).",
      description: "Simple Agreement for Future Equity. Fast, cheap, no control.",
      sarcasticGuidance: "Just give them the money and hope. It's the Valley way.",
      outcome: {
        description: "You sign the SAFE. The founder loves you because you asked zero questions. You have no board seat and no rights, but you're 'in'.",
        statChanges: { reputation: +5, stress: -5, dealModification: { investmentCost: 5000000, ownershipPercentage: 10 } }
      }
    },
    {
      text: "Priced Round with Board Seat.",
      description: "Force a valuation and demand oversight.",
      sarcasticGuidance: "Ruining the vibe with 'governance'. The founder hates it, but takes the check.",
      outcome: {
        description: "You grind them on valuation and take a board seat. It's a tense marriage, but at least you can fire them if they buy a yacht.",
        statChanges: { reputation: +10, stress: +5, analystRating: +5, dealModification: { investmentCost: 5000000, ownershipPercentage: 20 } }
      }
    },
    {
      text: "Participating Preferred.",
      description: "Aggressive downside protection.",
      sarcasticGuidance: "Double-dipping on the exit. You absolute shark.",
      outcome: {
        description: "You negotiate harsh terms. You get your money back first, then share the upside. Everyone calls you a vulture, but your downside is covered.",
        statChanges: { reputation: -10, financialEngineering: +10, score: +200, dealModification: { investmentCost: 5000000, ownershipPercentage: 15 }, ethics: -5 }
      }
    }
  ]
};

// Partial portfolio company type - fields that get auto-initialized by GameContext
// Using 'any' for addPortfolioCompany in scenarios since GameContext handles initialization
type PartialPortfolioCompany = Omit<PortfolioCompany, 'acquisitionDate' | 'eventHistory' | 'dealPhase' | 'actionsThisWeek' | 'lastManagementActions' | 'pendingDecisions' | 'isAnalyzed' | 'employeeCount' | 'employeeGrowth' | 'ebitdaMargin' | 'cashBalance' | 'runwayMonths' | 'customerChurn' | 'ceoPerformance' | 'boardAlignment' | 'managementTeam' | 'dealClosed' | 'isInExitProcess' | 'nextBoardMeetingWeek' | 'lastFinancialUpdate'>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ScenarioPortfolioCompany = any; // GameContext initializes missing fields

const firstCompany: PartialPortfolioCompany = {
  id: 1,
  name: "PackFancy Inc.",
  ceo: "Doris Chen",
  investmentCost: 50000000,
  ownershipPercentage: 65,
  currentValuation: 55000000,
  latestCeoReport: "Q3 performance is flat. Doris is 'exploring strategic alternatives' which means she's out of ideas. Needs a kick in the pants.",
  nextBoardMeeting: "In 2 weeks",
  dealType: DealType.LBO,
  revenue: 120000000,
  ebitda: 15000000,
  debt: 80000000,
  revenueGrowth: 0.02,
};

const synergySystems: PartialPortfolioCompany = {
  id: 2,
  name: "Synergy Systems",
  ceo: "Mark Donaldson",
  investmentCost: 80000000,
  ownershipPercentage: 80,
  currentValuation: 85000000,
  latestCeoReport: "Cutting-edge B2B SaaS platform. High growth, but burning cash like it's going out of style. Management is strong but needs adult supervision.",
  nextBoardMeeting: "In 4 weeks",
  dealType: DealType.GROWTH_EQUITY,
  revenue: 40000000,
  ebitda: -5000000,
  debt: 10000000,
  revenueGrowth: 0.60,
};

const ventureBoxCo: PartialPortfolioCompany = {
  id: 5,
  name: "Box.ai",
  ceo: "Skyler",
  investmentCost: 5000000,
  ownershipPercentage: 15,
  currentValuation: 33000000,
  latestCeoReport: "We are pivoting to 'Packaging as a Service' on the blockchain. Need more runway.",
  nextBoardMeeting: "TBD (Founder at meditation retreat)",
  dealType: DealType.VENTURE_CAPITAL,
  revenue: 50000,
  ebitda: -1500000,
  debt: 0,
  revenueGrowth: 3.0,
};

export const SCENARIOS: Scenario[] = [
  // Intro Scenario MUST be first
  {
    id: 1,
    title: "PackFancy Inc.",
    description: "It's a CIM for a mid-market manufacturer of... artisanal cardboard boxes. The MD, Chad, tosses it on your desk. 'Don't waste my time if it's garbage,' he grunts. The deadline for an IOI is Friday. HIDDEN INTEL: Page 40 mentions Patent #8829 for a proprietary Hydrophobic Coating. This might be more than just a box company.",
    structureOptions: [
      {
        type: DealType.LBO,
        description: "Classic PE. Load it with debt, squeeze out efficiencies, and flip it in 5 years. High risk, high reward.",
        dueDiligence: dueDiligencePhaseLBO,
        financingPhase: financingPhaseLBO,
        followUpChoices: [
          {
            text: "Recommend a full-throated, aggressive LBO.",
            sarcasticGuidance: "Tell the partners what they want to hear: that debt is cheap and growth is forever.",
            outcome: {
              description: "You build a model so aggressive it verges on fiction. But it tells the partners what they want to hear. The deal gets done. Welcome to the portfolio, PackFancy Inc. Now the real work begins.",
              statChanges: { cash: -10000, reputation: +20, stress: +15, score: +1000, addPortfolioCompany: firstCompany as ScenarioPortfolioCompany, npcRelationshipUpdate: { npcId: 'chad', change: 10, memory: 'Backed the aggressive LBO of PackFancy' } },
            },
            skillCheck: {
              skill: 'financialEngineering',
              threshold: 25,
              bonus: {
                description: "Your financial engineering skills allow you to structure the debt tranches so elegantly that you secure better terms, saving the fund millions in interest payments down the line. You're not just a model monkey anymore.",
                statChanges: { reputation: +10, financialEngineering: +5, score: +500 }
              }
            }
          },
          {
            text: "Pass. The leverage required is insane.",
            sarcasticGuidance: "Be the voice of reason. Warning: No one likes the guy who says 'no' to fees.",
            outcome: {
              description: "You tell Chad the deal is too risky. He sneers, 'I didn't ask for your risk assessment, I asked for a model.' You dodge a potential bankruptcy, but you also dodge a bonus. The firm does the deal without you.",
              statChanges: { reputation: -10, stress: +5, analystRating: -5, score: -250, npcRelationshipUpdate: { npcId: 'chad', change: -5, memory: 'Too chicken to back PackFancy' } },
            },
          },
        ],
      },
      {
        type: DealType.GROWTH_EQUITY,
        description: "Minority stake in a 'high-growth' company. Less control, but maybe less work. Focus on TAM and founder genius.",
        dueDiligence: dueDiligencePhaseGrowth,
        followUpChoices: [
          {
            text: "Pitch as a Tech Play (Hydrophobic Coating).",
            sarcasticGuidance: "You found the hidden IP. Pivot the narrative from manufacturing to 'Materials Science'.",
            outcome: {
              description: "You pitch the hydrophobic patent as a game-changer. The partners eat it up. 'It's not boxes, it's Advanced Materials!' The valuation soars, and you look like a genius.",
              statChanges: { reputation: +25, stress: +5, score: +800, addPortfolioCompany: { ...firstCompany, name: "PackFancy Tech", dealType: DealType.GROWTH_EQUITY, currentValuation: 80000000 } as ScenarioPortfolioCompany, npcRelationshipUpdate: { npcId: 'chad', change: 20, memory: 'Found the hidden IP value in PackFancy' } },
            }
          },
          {
            text: "Pass. Too much hype, not enough substance.",
            sarcasticGuidance: "Be the adult in the room who points out the emperor has no clothes. Or in this case, no EBITDA.",
            outcome: {
              description: "You recommend passing. The company is all sizzle and no steak. A few months later, it implodes. Your skepticism saved the firm a lot of money.",
              statChanges: { reputation: +15, stress: -10, analystRating: +10, score: +600 },
            }
          }
        ]
      },
      {
        type: DealType.VENTURE_CAPITAL,
        description: "Basically gambling. Throw money at a charismatic founder with a PowerPoint and pray for a 100x return. High chance of total loss.",
        dueDiligence: dueDiligencePhaseVC,
        financingPhase: financingPhaseVC,
        followUpChoices: [
          {
            text: "Finalize the investment memo and wire the funds.",
            sarcasticGuidance: "Pull the trigger. Don't think about the fact that 90% of startups fail.",
            outcome: {
              description: "You convince the IC that Box.ai is the next Amazon. Funds are wired. You are now a venture capitalist. God help us all.",
              statChanges: { cash: -5000, reputation: +10, stress: +5, score: +500, addPortfolioCompany: ventureBoxCo as ScenarioPortfolioCompany },
            }
          },
          {
            text: "Pull the term sheet at the last minute.",
            sarcasticGuidance: "The ultimate power move. Waste everyone's time and walk away.",
            outcome: {
              description: "You get cold feet and kill the deal. The founder tweets about you angrily. You saved the firm money, but your reputation in the Valley is torched.",
              statChanges: { reputation: -20, stress: -10, analystRating: +10, score: +100 },
            }
          }
        ]
      },
    ],
  },
  {
    id: 100,
    title: "The SEC Inquiry",
    description: "Two agents in cheap suits are waiting in the lobby. They're asking questions about the 'Synergy Systems' deal and some rumors regarding competitor sabotage. It seems your 'dirty tricks' with Hunter didn't go unnoticed. The firm is exposed.",
    requiredFlags: ['PLAYED_DIRTY_WITH_HUNTER'],
    allowedVolatility: ['CREDIT_CRUNCH', 'PANIC'],
    triggerTags: ['regulatory', 'rival'],
    factionRequirements: [{ faction: 'REGULATORS', max: 80 }],
    choices: [
      {
        text: "Deny everything and lawyer up.",
        sarcasticGuidance: "Standard operating procedure. Admit nothing, deny everything, make counter-accusations.",
        outcome: {
          description: "You stone-wall the agents. The legal fees are astronomical, and the partners are furious at the scrutiny. You survive, but you're on thin ice.",
          statChanges: { cash: -10000, reputation: -10, stress: +20, score: -200, auditRisk: +20, factionReputation: { REGULATORS: -25, MANAGING_DIRECTORS: +5 } },
        },
      },
      {
        text: "Cooperate fully and throw Hunter under the bus.",
        sarcasticGuidance: "The prisoner's dilemma. Snitch first and snitch hard.",
        outcome: {
          description: "You provide evidence that Hunter instigated the market manipulation. The SEC turns its gaze on him. You're seen as a rat, but a rat who isn't in jail.",
          statChanges: { reputation: -20, stress: -10, score: +100, factionReputation: { REGULATORS: +15, RIVALS: -15, MANAGING_DIRECTORS: -5 }, npcRelationshipUpdate: { npcId: 'hunter', change: -100, memory: 'Testified against Hunter to the SEC' } },
        },
      },
      {
        text: "Pay a settlement (Bribe).",
        sarcasticGuidance: "It's not a bribe, it's a 'civil penalty' paid in advance. Wink wink.",
        outcome: {
          description: "You arrange a back-channel settlement. It clears the problem, but it costs you a significant chunk of your personal liquidity. The problem goes away, for now.",
          statChanges: { cash: -25000, stress: -20, reputation: +5, score: +300, ethics: -20, auditRisk: +10, factionReputation: { REGULATORS: -30, LIMITED_PARTNERS: -5 } },
        },
      },
    ]
  },
  {
    id: 200,
    title: "The Golf Course Whisper",
    description: "You're at the club on a Saturday. A very drunk CFO of a major public company mistakes you for his nephew and mumbles about a 'massive buyout' being announced Monday. This information is worth millions. It is also illegal.",
    minReputation: 25,
    dayTypeGate: { dayType: 'WEEKEND', timeSlots: ['AFTERNOON', 'EVENING'] },
    allowedVolatility: ['BULL_RUN', 'NORMAL'],
    triggerTags: ['insider', 'lp'],
    factionRequirements: [
      { faction: 'REGULATORS', max: 90 },
      { faction: 'LIMITED_PARTNERS', min: 30 }
    ],
    choices: [
      {
        text: "Buy calls on the stock immediately.",
        sarcasticGuidance: "A sure thing is a sure thing. Who's going to know? Just don't buy the yacht until the heat dies down.",
        outcome: {
          description: "You leverage your personal account and make a killing. The stock pops 40% on Monday. You feel invincible. You also feel a slight tightening in your chest every time the phone rings.",
          statChanges: { cash: +150000, stress: +30, score: +500, setsFlags: ['COMMITTED_INSIDER_TRADING'], ethics: -50, auditRisk: +80, factionReputation: { REGULATORS: -40, MANAGING_DIRECTORS: +10, LIMITED_PARTNERS: -5 } }
        }
      },
      {
        text: "Tip off the fund's trading desk anonymously.",
        sarcasticGuidance: "Let the firm take the risk. If it works, you claim credit. If it blows up, you were never there.",
        outcome: {
          description: "The firm makes a small fortune. You casually mention to Chad that you 'had a hunch'. He knows you know, but nothing is on paper. Your value rises.",
          statChanges: { reputation: +15, analystRating: +10, score: +200, factionReputation: { MANAGING_DIRECTORS: +8, REGULATORS: -15, LIMITED_PARTNERS: +5 }, npcRelationshipUpdate: { npcId: 'chad', change: 10, memory: 'Provided extremely accurate market intel' } }
        }
      },
      {
        text: "Ignore it. Too much risk.",
        sarcasticGuidance: "Boring. Safe. Probably why you'll never own an island. But you will sleep tonight.",
        outcome: {
          description: "You watch the stock soar on Monday from the sidelines. It hurts, but you're not in an orange jumpsuit.",
          statChanges: { stress: -5, reputation: +5, score: +50, ethics: +10, factionReputation: { REGULATORS: +10, MANAGING_DIRECTORS: -5 } }
        }
      }
    ]
  },
  {
    id: 101,
    title: "Cardiac Event",
    description: "You're in the middle of a modeling session at 3 AM when your left arm goes numb. The screen blurs. Your heart is hammering like a techno drum. Your body is rejecting your lifestyle.",
    minStress: 80,
    choices: [
      {
        text: "Call an ambulance.",
        sarcasticGuidance: "Admit defeat. Go to the hospital like a normal human being. Weak.",
        outcome: {
          description: "You spend 3 days in the hospital. The doctors say it was a panic attack induced by exhaustion. The partners send flowers, but you know they're interviewing your replacement.",
          statChanges: { stress: -50, energy: +40, reputation: -10, cash: -5000, score: -100 },
        },
      },
      {
        text: "Take a beta blocker and keep working.",
        sarcasticGuidance: "Chemistry is better than biology. Suppress the symptoms and push through.",
        outcome: {
          description: "The drugs kick in. The shaking stops. You finish the model. You feel like a god, but a very fragile one. You've dodged a bullet, but the gun is still loaded.",
          statChanges: { stress: -10, energy: -10, score: +200 },
        },
      },
      {
        text: "Pass out on your desk.",
        sarcasticGuidance: "The ultimate power nap. Let the cleaning crew find you.",
        outcome: {
          description: "You wake up to the cleaning lady vacuuming around your drooling face. It's humiliating, but you got 4 hours of sleep. Back to work.",
          statChanges: { stress: -5, energy: +10, reputation: -5, score: -50 },
        },
      },
    ]
  },
  {
    id: 102,
    title: "The Headhunter's Offer",
    description: "A top-tier headhunter calls you on your personal cell. 'I have a role at a mega-fund,' she whispers. 'Double your comp, carry from day one.' It sounds too good to be true. It usually is.",
    minReputation: 75,
    allowedVolatility: ['BULL_RUN', 'NORMAL'],
    triggerTags: ['career'],
    factionRequirements: [
      { faction: 'MANAGING_DIRECTORS', min: 50 },
      { faction: 'LIMITED_PARTNERS', min: 35 }
    ],
    choices: [
      {
        text: "Take the interview.",
        sarcasticGuidance: "Grass is always greener. Go see what the big boys are paying.",
        outcome: {
          description: "You ace the interview. The offer is real. You leverage it to get a massive raise at your current firm. You're now the golden child.",
          statChanges: { cash: +20000, reputation: +10, stress: +5, score: +500, factionReputation: { MANAGING_DIRECTORS: +10, LIMITED_PARTNERS: +8, RIVALS: -5 } },
        },
      },
      {
        text: "Politely decline. Loyalty pays.",
        sarcasticGuidance: "Loyalty? In this industry? That's adorable. But maybe sticking with the devil you know is safer.",
        outcome: {
          description: "You stay put. Your MD finds out you turned it down and is impressed. 'Good man,' he grunts. You get a slightly better deal on your next co-invest.",
          statChanges: { reputation: +5, analystRating: +5, score: +100, factionReputation: { MANAGING_DIRECTORS: +12, LIMITED_PARTNERS: +4 } },
        },
      },
      {
        text: "Jump ship immediately.",
        sarcasticGuidance: "Burn the bridge. Take the money and run. New firm, new problems.",
        outcome: {
          description: "You quit. The new firm is a sweatshop, but the pay is incredible. You've reset your reputation, but your bank account is happy.",
          statChanges: { cash: +50000, reputation: -10, stress: +15, score: +600, factionReputation: { MANAGING_DIRECTORS: -25, LIMITED_PARTNERS: -10, RIVALS: +10 } },
        },
      },
    ]
  },
  {
    id: 2,
    title: "The Recalcitrant CEO",
    requiresPortfolio: true,
    description: "The CEO of a portfolio company is resisting your 'suggestions' for improvement. He claims your financial engineering will 'destroy the company's soul.' He needs to be brought in line, or replaced.",
    choices: [
      {
        text: "Be assertive. Remind him who owns the company.",
        sarcasticGuidance: "Assert dominance. He works for you, not the other way around. Make sure he understands that.",
        outcome: {
          description: "You deliver a cold, hard lecture on fiduciary duty. The CEO sullenly complies, but your relationship is toast. He'll be a problem later.",
          statChanges: { reputation: +5, stress: +10, score: +200 },
        },
      },
      {
        text: "Try to find a compromise.",
        sarcasticGuidance: "The gentle touch. Maybe you can convince him with logic and reason. A novel approach.",
        outcome: {
          description: "You spend hours finding a middle ground. The CEO is mollified, but the partners see you as soft. You can't please everyone.",
          statChanges: { reputation: -5, stress: -5, analystRating: +5, score: -100 },
        },
      },
      {
        text: "Go behind his back and talk to the board.",
        sarcasticGuidance: "A classic political power play. High risk, but very satisfying if it works.",
        outcome: {
          description: "A bold, political move. It works. The board sides with you, and the CEO is marginalized. You've won the battle, but started a war.",
          statChanges: { reputation: +10, stress: +15, cash: -2000, score: +350 },
        },
      },
    ],
  },
  {
    id: 3,
    title: "Bonus Season",
    description: "It's that time of year. Your bonus is on the line. The rumor mill is churning. You have your year-end review with your MD.",
    choices: [
      {
        text: "Accept whatever they give you. Don't rock the boat.",
        sarcasticGuidance: "Be grateful for the scraps from the masters' table. A true team player.",
        outcome: {
          description: "You get a mediocre bonus. You're a team player, which means you're a sucker. They'll walk all over you next year too.",
          statChanges: { cash: +20000, stress: -5, reputation: -5, score: -150 },
        },
      },
      {
        text: "Come prepared with a list of your wins.",
        sarcasticGuidance: "Actually advocate for yourself? A bold strategy. Let's see if it pays off.",
        outcome: {
          description: "You make a strong case for your contributions. Your MD is impressed by your audacity and preparation. You get a slightly better bonus.",
          statChanges: { cash: +35000, reputation: +5, analystRating: +5, score: +250 },
        },
      },
      {
        text: "Hint that you have a competing offer.",
        sarcasticGuidance: "The high-stakes bluff. Make them think you're wanted elsewhere. Just be prepared to walk if they call you on it.",
        outcome: {
          description: "A high-stakes bluff. It works. They match the imaginary offer to keep you. You're a stone-cold killer. They'll be watching you closely now.",
          statChanges: { cash: +50000, reputation: +10, stress: +10, score: +500 },
        },
      },
    ],
  },
  {
    id: 4,
    title: "The All-Nighter",
    description: "A partner has a 'brilliant' idea at 6 PM on a Friday. They need a 100-page deck on the market for left-handed widgets by Monday morning. Your weekend is gone.",
    choices: [
      {
        text: "Suck it up and pull the all-nighter.",
        sarcasticGuidance: "Ah, the sweet smell of burnout. Do it for the 'team.' They'll definitely remember this. (They won't.)",
        outcome: {
          description: "You survive on coffee and spite. The deck is flawless. The partner barely glances at it. Your health is failing but your reputation is solid.",
          statChanges: { energy: -40, stress: +20, reputation: +10, analystRating: +5, score: +300 },
        },
      },
      {
        text: "Delegate to the intern.",
        sarcasticGuidance: "Push the misery downhill. That's what interns are for, right?",
        outcome: {
          description: "You dump the work on the terrified intern. Their work is a disaster, and you spend all of Sunday fixing it anyway. You look like a poor manager.",
          statChanges: { energy: -20, stress: +10, reputation: -10, analystRating: -5, score: -400, npcRelationshipUpdate: { npcId: 'sarah', change: -10, memory: 'Dumped weekend work on junior team' } },
        },
      },
      {
        text: "Push back. Say it's an unreasonable request.",
        sarcasticGuidance: "Go on, try setting 'boundaries'. Let's see how that works out for your career trajectory. I'll get the popcorn.",
        outcome: {
          description: "The partner is stunned. No one has ever said 'no' to them before. You're fired. Just kidding. But you're definitely not on the partner track anymore.",
          statChanges: { stress: -20, reputation: -15, energy: +10, score: -750 },
        },
      },
    ],
  },
  {
    id: 5,
    title: "Whispers in the Pantry",
    description: "You overhear Hunter, your smug rival from the LBO group, telling an MD a damaging (and false) rumor about you botching the analysis on a recent deal. It could kill your reputation if it spreads.",
    isRivalEvent: true,
    blockedByFlags: ['PARTNERED_WITH_HUNTER'],
    choices: [
      {
        text: "Confront him publicly.",
        sarcasticGuidance: "Cause a scene. Showing emotion in the workplace is always a good look.",
        outcome: {
          description: "You cause a scene. Hunter plays innocent, and you look unhinged. The MD is unimpressed with your lack of composure. Bad move.",
          statChanges: { reputation: -10, stress: +15, score: -300, setsFlags: ['LOST_COOL'], npcRelationshipUpdate: { npcId: 'hunter', change: -10, memory: 'Public shouting match in pantry' } },
        },
      },
      {
        text: "Spread a worse rumor about him.",
        sarcasticGuidance: "The nuclear option. He started it, you're just finishing it. With overwhelming force.",
        outcome: {
          description: "You anonymously start a rumor that Hunter's analysis is so bad, he uses a Magic 8-Ball for his projections. It sticks. Mutually assured destruction is a valid strategy.",
          statChanges: { reputation: +10, stress: +5, cash: -1000, score: +400, setsFlags: ['RUMOR_MONGER'], npcRelationshipUpdate: { npcId: 'hunter', change: -20, memory: 'Retaliated with vicious rumors' } },
        },
      },
      {
        text: "Go to your MD with proof it's false.",
        sarcasticGuidance: "The professional approach. Tattling, but with spreadsheets to back it up.",
        outcome: {
          description: "You calmly present your work to your MD, disproving the rumor. They appreciate your professionalism, but also view it as you handling your own mess. You're seen as competent, if a bit of a tattletale.",
          statChanges: { reputation: +5, analystRating: +5, score: +150, setsFlags: ['PROFESSIONAL'] },
        },
      },
      {
        text: "Ignore it. Let your work speak for itself.",
        sarcasticGuidance: "The high road. A noble path, usually leading directly off a cliff.",
        outcome: {
          description: "You take the high road. Unfortunately, the high road is where people get run over in this business. The rumor spreads, and your reputation takes a hit. Perceptions matter more than reality.",
          statChanges: { reputation: -15, stress: +10, score: -500 },
        },
      },
    ],
  },
  // ==================== FAMILY EVENTS ====================
  {
    id: 5001,
    title: "Mom's Medical Bills",
    description: "Your mom calls, trying to sound casual. 'It's nothing major, honey, just some tests. But you know your father's pension doesn't stretch...' She needs $15,000 for medical bills she's been hiding.",
    dayTypeGate: { dayType: 'WEEKEND' },
    choices: [
      {
        text: "Pay it all",
        description: "Transfer $15,000 immediately. She's your mother.",
        sarcasticGuidance: "Blood is thicker than IRR.",
        outcome: {
          description: "Mom cries. Dad sends a gruff text: 'Thanks, son.' You feel good for the first time in weeks. Family comes first, even when your bank account says otherwise.",
          statChanges: {
            personalCash: -15000,
            stress: -20,
            ethics: +10,
            npcRelationshipUpdate: { npcId: 'mom', change: 20, memory: 'Paid medical bills without hesitation' },
            npcRelationshipUpdate2: { npcId: 'dad', change: 15, memory: 'Stepped up for the family' }
          },
        },
      },
      {
        text: "Send $5,000",
        description: "Help out but keep some boundaries. You're not a bank.",
        sarcasticGuidance: "Partial credit. Better than nothing, worse than everything.",
        outcome: {
          description: "Mom thanks you, but you hear the disappointment. 'Every bit helps, honey.' The remaining balance becomes a silent tension at every family dinner.",
          statChanges: {
            personalCash: -5000,
            stress: -5,
            ethics: +5,
            npcRelationshipUpdate: { npcId: 'mom', change: 5, memory: 'Helped with bills but had limits' }
          },
        },
      },
      {
        text: "Can't right now",
        description: "Make excuses about cash flow. Suggest payment plans.",
        sarcasticGuidance: "You're a finance professional. You can construct a narrative.",
        outcome: {
          description: "Awkward silence. 'Of course, dear. We'll figure it out.' The guilt hits different at 2am when you're checking your bonus projections.",
          statChanges: {
            stress: +15,
            ethics: -10,
            npcRelationshipUpdate: { npcId: 'mom', change: -15, memory: 'Couldn\'t help when it mattered' }
          },
        },
      },
    ],
  },
  {
    id: 5002,
    title: "Brother Needs 'Investment'",
    description: "Mike corners you at Thanksgiving. His 'revolutionary' crypto-gaming startup needs $50,000 seed money. He's convinced it's the next big thing. Your finance brain says no. Your guilt says he's family.",
    dayTypeGate: { dayType: 'WEEKEND' },
    minCash: 25000,
    choices: [
      {
        text: "Write the check",
        description: "Family first. Maybe he'll surprise you.",
        sarcasticGuidance: "Your due diligence standards seem to vary by blood relation.",
        outcome: {
          description: "Mike is ecstatic. 'You won't regret this, bro!' (Narrator: He will almost certainly regret this.) But hey, at least Christmas won't be awkward.",
          statChanges: {
            personalCash: -50000,
            stress: +10,
            ethics: -5,
            npcRelationshipUpdate: { npcId: 'brother_mike', change: 30, memory: 'Believed in me when no one else did' },
            setsFlags: ['INVESTED_IN_MIKE']
          },
        },
      },
      {
        text: "Offer advice instead",
        description: "Walk him through his business plan. Point out the holes. Gently.",
        sarcasticGuidance: "Pro bono consulting. The gift that keeps on giving... awkward dinners.",
        outcome: {
          description: "Mike's face falls. 'So you think I'm an idiot.' But deep down, he knows you care. He'll thank you in two years when he pivots to something real.",
          statChanges: {
            energy: -10,
            analystRating: +5,
            npcRelationshipUpdate: { npcId: 'brother_mike', change: -10, trustChange: +15, memory: 'Shot down my idea but tried to help' }
          },
        },
      },
      {
        text: "Hard pass",
        description: "Tell him the truth: it's a bad investment and you're not his VC.",
        sarcasticGuidance: "Brutal honesty. Effective in spreadsheets, devastating in families.",
        outcome: {
          description: "Mike storms off. 'Must be nice having all the answers from your ivory tower.' Christmas dinner is going to be very quiet this year.",
          statChanges: {
            stress: +5,
            ethics: +10,
            npcRelationshipUpdate: { npcId: 'brother_mike', change: -25, memory: 'Wouldn\'t even give me a chance' }
          },
        },
      },
    ],
  },
  {
    id: 5003,
    title: "Emma's Ultimatum",
    description: "Emma sits you down. 'I love you, but I can't keep doing this. I need to know if there's a future here, or if I'm just waiting for someone who's already married to their job.' She's not wrong. You've missed 8 of the last 10 planned dates.",
    dayTypeGate: { dayType: 'WEEKEND', timeSlots: ['EVENING'] },
    minStress: 40,
    choices: [
      {
        text: "I'll change",
        description: "Promise to make time. Mean it. Block off calendar.",
        sarcasticGuidance: "You're committing to something that doesn't have a valuation. Novel.",
        outcome: {
          description: "Emma tears up. 'I want to believe you.' You block off every Saturday for the next month. Chad is going to hate this, but maybe that's the point.",
          statChanges: {
            stress: -15,
            energy: +20,
            reputation: -5,
            npcRelationshipUpdate: { npcId: 'girlfriend_emma', change: 25, trustChange: 10, memory: 'Committed to making time for us' },
            npcRelationshipUpdate2: { npcId: 'chad', change: -10, memory: 'Started prioritizing personal life over deals' }
          },
        },
      },
      {
        text: "You deserve better",
        description: "End it clean. You can't give her what she needs right now.",
        sarcasticGuidance: "The cleanest exit strategy. No earn-out, no drag-along.",
        outcome: {
          description: "She cries. You feel hollow. But at least you're not stringing her along. Maybe in a few years, when you make Partner, you'll have time to be human again.",
          statChanges: {
            stress: +25,
            energy: -20,
            ethics: +15,
            removeNpcId: 'girlfriend_emma'
          },
        },
      },
      {
        text: "Just a few more months",
        description: "Stall. The deal pipeline will calm down. Probably.",
        sarcasticGuidance: "Kicking the can. A time-honored tradition in both M&A and relationships.",
        outcome: {
          description: "Emma sighs. 'You always say that.' She stays, but something's broken. The trust isn't there anymore. How long until she walks?",
          statChanges: {
            stress: +10,
            npcRelationshipUpdate: { npcId: 'girlfriend_emma', change: -15, trustChange: -20, memory: 'Made empty promises again' }
          },
        },
      },
    ],
  },
  {
    id: 5004,
    title: "Dad's Retirement Advice",
    description: "Dad calls on Sunday morning. 'I've been thinking about your... private equity work. I ran some numbers. You should be putting at least 30% into index funds and maxing out your 401k. None of this 'carried interest' gambling.' He sounds genuinely worried.",
    dayTypeGate: { dayType: 'WEEKEND', timeSlots: ['MORNING'] },
    choices: [
      {
        text: "Humor him",
        description: "Listen politely. Nod along. He means well.",
        sarcasticGuidance: "He still thinks you make money by 'working hard.' Precious.",
        outcome: {
          description: "You spend 45 minutes hearing about the magic of compound interest. He ends with 'I'm proud of you, even if I don't understand what you do.' That hits different.",
          statChanges: {
            stress: -10,
            energy: -5,
            npcRelationshipUpdate: { npcId: 'dad', change: 10, memory: 'Actually listened to my advice for once' }
          },
        },
      },
      {
        text: "Explain PE economics",
        description: "Walk him through fund structure, GP/LP splits, and the J-curve.",
        sarcasticGuidance: "Finally, someone who has to listen to your deck.",
        outcome: {
          description: "After an hour, he's silent. Then: 'So you're telling me you only make money if other people make money first?' He almost sounds impressed. Almost.",
          statChanges: {
            energy: -15,
            analystRating: +5,
            npcRelationshipUpdate: { npcId: 'dad', change: 5, trustChange: +10, memory: 'Tried to explain carry to me - still seems like gambling' }
          },
        },
      },
      {
        text: "Blow him off",
        description: "You don't have time for this. Cut the call short.",
        sarcasticGuidance: "Time is money. And you're about to save some time.",
        outcome: {
          description: "'I'll call you later, Dad. Busy.' The line goes quiet. He says 'Sure, son' and hangs up. Mom texts an hour later: 'Your father was just trying to help.'",
          statChanges: {
            stress: +5,
            energy: +10,
            npcRelationshipUpdate: { npcId: 'dad', change: -15, memory: 'Dismissed my concern like I was a client' },
            npcRelationshipUpdate2: { npcId: 'mom', change: -5, memory: 'Hurt your father\'s feelings' }
          },
        },
      },
    ],
  },
  {
    id: 5005,
    title: "Lifestyle Pressure",
    description: "Your apartment is fine, but every VP you know lives in a doorman building. Your suits are off-the-rack while Partners wear Zegna. Emma mentioned she'd love a vacation somewhere 'nice.' The unspoken pressure to upgrade your lifestyle is crushing.",
    minReputation: 40,
    choices: [
      {
        text: "Level up your lifestyle",
        description: "Move to a better place. Upgrade the wardrobe. Fake it till you make it.",
        sarcasticGuidance: "Looking the part is half the battle. The other half is paying for it.",
        outcome: {
          description: "You sign a lease for a sick apartment in Tribeca. New suits. New watch. Your bank account weeps, but damn you look good. The Partners notice.",
          statChanges: {
            personalCash: -10000,
            reputation: +10,
            stress: -10,
            lifestyleLevel: 'ASPIRATIONAL'
          },
        },
      },
      {
        text: "Stay humble",
        description: "Keep the same lifestyle. Save and invest the difference.",
        sarcasticGuidance: "Delayed gratification. Very Warren Buffett of you.",
        outcome: {
          description: "You resist the urge. Your bank account thanks you. But at the next firm dinner, you notice the MD eyeing your shoes. 'Are those... Cole Haan?' he asks, barely hiding his disdain.",
          statChanges: {
            reputation: -5,
            ethics: +5,
            stress: +5,
            analystRating: +5
          },
        },
      },
      {
        text: "Live beyond your means",
        description: "Charge it all. Pay minimums. Deal with it when bonus hits.",
        sarcasticGuidance: "Leveraged lifestyle buyout. Very PE of you.",
        outcome: {
          description: "You max out your credit cards. The lifestyle is intoxicating. But the interest compounds, and bonus season feels very far away. Hope that deal closes.",
          statChanges: {
            personalCash: -5000,
            reputation: +15,
            stress: +20,
            loanBalanceChange: +25000,
            loanRate: 0.22,
            lifestyleLevel: 'BALLER'
          },
        },
      },
    ],
  },
  // ==================== NEW DEAL SCENARIOS ====================
  {
    id: 6,
    title: "The Distressed Hospital Chain",
    description: "A regional hospital chain with 12 facilities is drowning in debt. COVID backlogs, nursing shortages, and Medicare rate cuts have pushed them to the brink. The PE vultures are circling. There's real estate value here, but also real patients.",
    minReputation: 30,
    triggerTags: ['healthcare', 'distressed'],
    choices: [
      {
        text: "Acquire and optimize operations.",
        sarcasticGuidance: "Healthcare PE. Where 'optimization' means figuring out how few nurses you legally need.",
        outcome: {
          description: "You close the deal. The turnaround will be brutal—layoffs, facility closures, battles with unions. But if you can stabilize it, the real estate alone is worth 2x your investment.",
          statChanges: { reputation: +15, stress: +25, cash: -50000, score: +800, ethics: -15 },
        },
      },
      {
        text: "Strip the real estate, sell the operations.",
        sarcasticGuidance: "Classic sale-leaseback. Extract the land, burden the hospitals with rent. Elegant and soulless.",
        outcome: {
          description: "You separate the real estate into a REIT and lease it back to the operating company at market rates. The hospitals now pay rent they can't afford. But your returns look spectacular.",
          statChanges: { reputation: -10, cash: +100000, score: +600, ethics: -30, factionReputation: { REGULATORS: -15, LIMITED_PARTNERS: +10 } },
        },
      },
      {
        text: "Pass. Healthcare is a minefield.",
        sarcasticGuidance: "Regulatory risk, headline risk, actual sick people. Too many variables you can't model.",
        outcome: {
          description: "You walk away. Six months later, the chain files for bankruptcy and three rural hospitals close. You feel... nothing. That's probably fine.",
          statChanges: { stress: -5, score: +100 },
        },
      },
    ],
  },
  {
    id: 7,
    title: "The AI Hype Machine",
    description: "A startup claims to have 'revolutionary AI' that can predict consumer behavior with 99% accuracy. Their pitch deck is beautiful. Their revenue is $200K. They want a $500M valuation. The founder was on the cover of Wired.",
    minReputation: 20,
    triggerTags: ['tech', 'venture'],
    choices: [
      {
        text: "Lead the Series C at their valuation.",
        sarcasticGuidance: "FOMO is a legitimate investment thesis. Everyone else is in. What could go wrong?",
        outcome: {
          description: "You wire $50M for 10% of a company with no revenue. The founder tweets about your 'visionary partnership.' Your LPs see the press release and smile. For now.",
          statChanges: { reputation: +20, stress: +10, cash: -50000, score: +400, ethics: -5 },
        },
      },
      {
        text: "Demand a down round and real metrics.",
        sarcasticGuidance: "Actually do due diligence. Revolutionary concept in venture.",
        outcome: {
          description: "The founder is insulted. 'You don't understand AI.' They take Softbank's money instead. Two years later they pivot to 'AI-powered NFTs.' You dodged a bullet.",
          statChanges: { reputation: +5, analystRating: +15, score: +300 },
        },
      },
      {
        text: "Invest in their competitor instead.",
        sarcasticGuidance: "The boring company with actual customers. How pedestrian.",
        outcome: {
          description: "You back the unsexy competitor with real revenue. Less press, more profit. Your LPs don't know what they own, but the returns will speak.",
          statChanges: { reputation: +10, analystRating: +10, score: +500, cash: -25000 },
        },
      },
    ],
  },
  {
    id: 8,
    title: "The Family Business Succession",
    description: "A third-generation manufacturing company. $80M EBITDA, zero debt, loyal workforce. The patriarch just died. His three children hate each other. One wants to sell, one wants to run it, one wants to burn it down for the insurance.",
    minReputation: 40,
    triggerTags: ['manufacturing', 'family'],
    choices: [
      {
        text: "Buy out all three siblings.",
        sarcasticGuidance: "Nothing like family drama to create motivated sellers. Offer cash, close fast.",
        outcome: {
          description: "You pay a fair price and take 100% control. The siblings take the money and stop speaking to each other. The employees are nervous. Now you need to prove you're not here to strip the place.",
          statChanges: { reputation: +15, stress: +15, cash: -20000, score: +700 },
        },
      },
      {
        text: "Back the competent sibling, buy out the others.",
        sarcasticGuidance: "Pick a winner. Hope you picked right.",
        outcome: {
          description: "You partner with Sarah, the COO daughter who actually runs the place. Her siblings are furious. Family lawsuits are threatened. But she knows the business cold.",
          statChanges: { reputation: +10, stress: +20, cash: -15000, score: +600 },
        },
      },
      {
        text: "Let them fight it out, circle back later.",
        sarcasticGuidance: "Family disputes only get more expensive with time. Wait for desperation.",
        outcome: {
          description: "You wait. A year later, they've burned through half the cash on lawyers. Now they're desperate to sell at any price. Cold, but effective.",
          statChanges: { reputation: -5, analystRating: +5, score: +200, ethics: -10 },
        },
      },
    ],
  },
  {
    id: 9,
    title: "The Crypto Exchange",
    description: "A mid-tier crypto exchange wants growth capital. They're profitable (somehow), have 2M users, and their compliance is... 'evolving.' The founder keeps his keys in a hardware wallet around his neck. Literally.",
    minReputation: 25,
    allowedVolatility: ['BULL_RUN', 'NORMAL'],
    triggerTags: ['crypto', 'fintech'],
    choices: [
      {
        text: "Invest with board control and compliance overhaul.",
        sarcasticGuidance: "Try to make crypto respectable. A Sisyphean task.",
        outcome: {
          description: "You take a board seat and hire a real compliance team. The founder resents your 'interference.' But when the SEC comes knocking, you'll be ready. Maybe.",
          statChanges: { reputation: +10, stress: +20, cash: -30000, score: +500, auditRisk: +15 },
        },
      },
      {
        text: "Quick flip—ride the hype, exit before regulation hits.",
        sarcasticGuidance: "Greater fool theory. Be faster than the SEC.",
        outcome: {
          description: "You invest, pump the valuation with a PR blitz, and sell to a SPAC six months later. You 3x your money. The SPAC investors? Less fortunate.",
          statChanges: { cash: +150000, reputation: -15, score: +800, ethics: -25 },
        },
      },
      {
        text: "Hard pass. This is a regulatory landmine.",
        sarcasticGuidance: "The boring, responsible choice. Your grandchildren will thank you.",
        outcome: {
          description: "You pass. The exchange gets hacked three months later. The founder tweets that it's 'actually good for crypto.' You feel vindicated and slightly smug.",
          statChanges: { reputation: +5, analystRating: +10, score: +300 },
        },
      },
    ],
  },
  {
    id: 10,
    title: "The Roll-Up Play",
    description: "Fragmented market. 500 independent HVAC contractors across the Midwest. No one has more than 2% market share. Your thesis: consolidate 50 of them, centralize back-office, squeeze margins, flip to a strategic.",
    minReputation: 35,
    triggerTags: ['industrials', 'rollup'],
    choices: [
      {
        text: "Execute the roll-up. Acquire aggressively.",
        sarcasticGuidance: "Buy fast, integrate later. The classic PE playbook.",
        outcome: {
          description: "You start buying. The first 10 integrations go smoothly. Then you discover every owner used different accounting software, some in actual paper ledgers. Integration hell awaits.",
          statChanges: { reputation: +20, stress: +30, cash: -40000, score: +900 },
        },
      },
      {
        text: "Build a platform first, then acquire.",
        sarcasticGuidance: "Patience. Build the machine before you feed it deals.",
        outcome: {
          description: "You hire a CEO, build shared services, create the playbook. It takes 18 months before you buy your first contractor. Slow and steady. Your LPs are impatient.",
          statChanges: { reputation: +5, stress: +10, cash: -25000, score: +500, analystRating: +10 },
        },
      },
      {
        text: "Too fragmented. The integration risk is insane.",
        sarcasticGuidance: "Death by a thousand paper cuts. Every owner thinks they're special.",
        outcome: {
          description: "You pass on the roll-up thesis. A competitor executes it successfully and sells for a 5x. You tell yourself their accounting must be a mess. It probably is.",
          statChanges: { stress: -10, score: +100 },
        },
      },
    ],
  },
  {
    id: 11,
    title: "The Sports Franchise",
    description: "A second-tier professional soccer team is for sale. The stadium needs $200M in renovations. The team hasn't made the playoffs in a decade. But the city is growing fast, and streaming rights are exploding.",
    minReputation: 50,
    minCash: 50000,
    triggerTags: ['sports', 'media'],
    choices: [
      {
        text: "Buy the team. Sports is the new media.",
        sarcasticGuidance: "Live sports are the only thing people still watch live. That has to be worth something.",
        outcome: {
          description: "You become a sports owner. The local paper calls you a 'savior.' The stadium renovation will bleed you dry, but the franchise value keeps climbing. You get courtside seats forever.",
          statChanges: { reputation: +30, stress: +15, cash: -100000, score: +1200, lifestyleLevel: 'MASTER_OF_UNIVERSE' },
        },
      },
      {
        text: "Invest in the streaming rights, not the team.",
        sarcasticGuidance: "Own the content, not the headaches. Let someone else deal with player egos.",
        outcome: {
          description: "You structure a deal for regional streaming rights. Lower profile, higher margins. No one knows your name, but your returns are excellent.",
          statChanges: { cash: +50000, reputation: +10, score: +700 },
        },
      },
      {
        text: "Sports teams are ego investments. Pass.",
        sarcasticGuidance: "Unless you want to see your face on SportsCenter during a losing streak.",
        outcome: {
          description: "You pass. The team is bought by a tech billionaire who immediately fires the coach and signs three overpriced players. Classic.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 12,
    title: "The Nursing Home Chain",
    description: "30 nursing homes across three states. Occupancy is at 85%. Margins are thin. The demographics are undeniable—America is getting old. But the lawsuits, the regulation, the staffing... this is not for the faint of heart.",
    minReputation: 35,
    triggerTags: ['healthcare', 'real_estate'],
    choices: [
      {
        text: "Acquire and professionalize operations.",
        sarcasticGuidance: "Old people need care. There's money in that. Try not to think about it too hard.",
        outcome: {
          description: "You buy the chain and bring in experienced operators. The first year is brutal—three wrongful death lawsuits, two state investigations. But occupancy is climbing.",
          statChanges: { reputation: +10, stress: +30, cash: -35000, score: +600, ethics: -10 },
        },
      },
      {
        text: "Sale-leaseback the real estate.",
        sarcasticGuidance: "The land under nursing homes is valuable. The nursing homes themselves... less so.",
        outcome: {
          description: "You extract the real estate, lease it back at aggressive rates. The operating company struggles with the new rent burden. But that's not your problem anymore.",
          statChanges: { cash: +80000, reputation: -15, score: +500, ethics: -25 },
        },
      },
      {
        text: "Too much headline risk. Pass.",
        sarcasticGuidance: "One viral video of a mistreated patient and your fund is toxic.",
        outcome: {
          description: "You pass. Probably the right call for your mental health. Your LPs will never know about the returns you didn't chase.",
          statChanges: { stress: -10, ethics: +5, score: +100 },
        },
      },
    ],
  },
  {
    id: 13,
    title: "The Podcast Network",
    description: "A network of 50 podcasts, mostly true crime and self-help. 100M downloads per month. Revenue is growing 200% YoY. The founder is a 26-year-old who thinks he's the next Spotify. Valuation: $400M.",
    minReputation: 20,
    triggerTags: ['media', 'growth'],
    choices: [
      {
        text: "Lead the round. Audio is the future.",
        sarcasticGuidance: "Everyone's commute needs content. And true crime addicts are loyal customers.",
        outcome: {
          description: "You invest at the inflated valuation. The founder immediately buys a Tesla and starts a podcast about 'the founder journey.' Downloads plateau. Monetization remains elusive.",
          statChanges: { reputation: +15, stress: +10, cash: -40000, score: +400 },
        },
      },
      {
        text: "Invest at a lower valuation with revenue milestones.",
        sarcasticGuidance: "Structure protects you from founder delusion.",
        outcome: {
          description: "You negotiate hard. Tranched investment tied to revenue targets. The founder grumbles but takes the deal. Smart money protects itself.",
          statChanges: { reputation: +5, analystRating: +15, cash: -20000, score: +500 },
        },
      },
      {
        text: "Audio is a feature, not a company. Pass.",
        sarcasticGuidance: "Spotify and Apple will crush all independent players eventually.",
        outcome: {
          description: "You pass. Spotify acquires them 18 months later for 2x what you would have paid. But Spotify then writes off the acquisition. You were right. Sort of.",
          statChanges: { analystRating: +5, score: +200 },
        },
      },
    ],
  },
  {
    id: 14,
    title: "The Defense Contractor",
    description: "A small defense contractor with classified contracts and 90% recurring revenue. Margins are incredible. Growth is steady. The catch? You need security clearance to even see the financials, and the ethics of selling weapons are... debatable.",
    minReputation: 45,
    triggerTags: ['defense', 'government'],
    factionRequirements: [{ faction: 'REGULATORS', min: 40 }],
    choices: [
      {
        text: "Acquire it. Defense is recession-proof.",
        sarcasticGuidance: "There's always a war somewhere. That's just geography.",
        outcome: {
          description: "You navigate the security clearance process and close the deal. The margins are spectacular. You try not to think about what the products are actually used for.",
          statChanges: { reputation: +15, cash: -60000, score: +900, ethics: -20, factionReputation: { REGULATORS: +10, LIMITED_PARTNERS: +5 } },
        },
      },
      {
        text: "ESG concerns. Take a pass.",
        sarcasticGuidance: "Your LPs include pension funds. They might have opinions about cluster munitions.",
        outcome: {
          description: "You pass on ethical grounds. Your ESG-focused LPs are pleased. Your returns-focused LPs are less so. You sleep slightly better at night.",
          statChanges: { reputation: -5, ethics: +20, score: +200, factionReputation: { LIMITED_PARTNERS: -5 } },
        },
      },
      {
        text: "Invest in the non-classified subsidiary only.",
        sarcasticGuidance: "Have your cake and eat it too. Own the boring commercial stuff.",
        outcome: {
          description: "You carve out the commercial division—satellite components for civilian use. Lower margins, cleaner conscience. A reasonable compromise.",
          statChanges: { cash: -30000, score: +500, ethics: +5 },
        },
      },
    ],
  },
  {
    id: 15,
    title: "The Cannabis Cultivator",
    description: "A vertically integrated cannabis company in three legal states. EBITDA positive, which is rare in the industry. Federal legalization seems inevitable. But banking is a nightmare, and the industry is a regulatory minefield.",
    minReputation: 30,
    allowedVolatility: ['BULL_RUN', 'NORMAL'],
    triggerTags: ['cannabis', 'growth'],
    choices: [
      {
        text: "Make a big bet on federal legalization.",
        sarcasticGuidance: "Congress will definitely act rationally and quickly on this. Definitely.",
        outcome: {
          description: "You invest heavily. Federal legalization doesn't happen. Again. Your investment is trapped in regulatory limbo. But hey, the product is pretty good.",
          statChanges: { reputation: +10, stress: +20, cash: -30000, score: +300, ethics: -5 },
        },
      },
      {
        text: "Invest in ancillary services—the picks and shovels.",
        sarcasticGuidance: "Sell equipment to the gold miners. Let them take the federal risk.",
        outcome: {
          description: "You back companies selling grow lights, packaging, and compliance software. No plant touching, no banking problems. Smart.",
          statChanges: { cash: -20000, score: +600, analystRating: +10 },
        },
      },
      {
        text: "Too much regulatory risk. Pass.",
        sarcasticGuidance: "Your fund's bank might close your account if you invest in this.",
        outcome: {
          description: "You pass. The industry continues to consolidate without you. Federal legalization keeps not happening. You feel vindicated but also curious about what might have been.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 16,
    title: "The SaaS Darling",
    description: "Enterprise software with 95% gross margins and 130% net revenue retention. Every metric is perfect. The problem? Every other PE fund wants it too. The auction is going to be a bloodbath.",
    minReputation: 40,
    triggerTags: ['tech', 'saas'],
    choices: [
      {
        text: "Bid aggressively. Win at any cost.",
        sarcasticGuidance: "FOMO is a real thing. You can always grow into the valuation. Probably.",
        outcome: {
          description: "You win the auction at a nosebleed valuation. The bankers are thrilled. Your returns now depend on perfect execution for the next seven years. No pressure.",
          statChanges: { reputation: +25, stress: +25, cash: -100000, score: +700 },
        },
      },
      {
        text: "Set a disciplined max bid and stick to it.",
        sarcasticGuidance: "Have conviction in your numbers. Walk away if the price doesn't work.",
        outcome: {
          description: "You lose the auction to a sovereign wealth fund that paid 30% more. Your discipline is admirable. Your LPs wish you'd been less disciplined.",
          statChanges: { reputation: +5, analystRating: +10, score: +300, stress: -5 },
        },
      },
      {
        text: "Find a proprietary angle—partner with management.",
        sarcasticGuidance: "Convince the founder to take you to dinner before the auction starts.",
        outcome: {
          description: "You build a relationship with the CEO who convinces the board to negotiate exclusively with you. You pay a fair price. Sometimes relationships matter.",
          statChanges: { reputation: +15, cash: -70000, score: +900, npcRelationshipUpdate: { npcId: 'chad', change: 15, memory: 'Sourced a deal proprietary' } },
        },
      },
    ],
  },
  {
    id: 17,
    title: "The Founder in Crisis",
    description: "A portfolio company founder is going through a brutal divorce. She's distracted, the company is drifting, and her soon-to-be-ex-husband owns 20% of the stock. He's threatening to sue the company. This is a mess.",
    requiresPortfolio: true,
    triggerTags: ['crisis', 'founder'],
    choices: [
      {
        text: "Buy out the ex-husband to make him go away.",
        sarcasticGuidance: "Pay the nuisance premium. Remove the drama.",
        outcome: {
          description: "You pay a 30% premium to buy out the hostile shareholder. The founder can focus on the business again. Your other LPs grumble about the price.",
          statChanges: { cash: -50000, stress: -10, reputation: +10, score: +400 },
        },
      },
      {
        text: "Replace the founder as CEO.",
        sarcasticGuidance: "She's too distracted. Bring in a professional.",
        outcome: {
          description: "You install a new CEO. The founder is devastated but stays on as Chief Product Officer. The company stabilizes, but the culture is never quite the same.",
          statChanges: { reputation: -5, stress: +15, score: +500, ethics: -10 },
        },
      },
      {
        text: "Support the founder and fight the lawsuit.",
        sarcasticGuidance: "Stand by your operator. Loyalty matters. So do lawyers.",
        outcome: {
          description: "You fund the legal fight. It drags on for two years. The founder appreciates the support. Eventually the ex settles. But it was expensive.",
          statChanges: { cash: -30000, stress: +20, reputation: +15, score: +300, ethics: +10 },
        },
      },
    ],
  },
  {
    id: 18,
    title: "The Luxury Brand",
    description: "An Italian heritage luxury brand. Hand-crafted goods, celebrity clientele, but zero digital presence. The founding family wants to 'preserve the brand' while also 'unlocking shareholder value.' These goals may be incompatible.",
    minReputation: 45,
    triggerTags: ['consumer', 'luxury'],
    choices: [
      {
        text: "Invest with a digital transformation plan.",
        sarcasticGuidance: "Teach the old craftsmen about e-commerce. What could go wrong?",
        outcome: {
          description: "You invest and hire a digital team. The family hates every change. Sales grow 40% online, but the brand purists are writing angry think pieces about you.",
          statChanges: { cash: -50000, reputation: +15, stress: +15, score: +700, ethics: -5 },
        },
      },
      {
        text: "Keep it exclusive. No digital scaling.",
        sarcasticGuidance: "Scarcity is the point. Some things shouldn't scale.",
        outcome: {
          description: "You preserve the brand's exclusivity. Growth is modest but sustainable. The family treats you like an adopted son. LVMH eventually acquires you at a premium.",
          statChanges: { cash: -40000, reputation: +20, score: +800 },
        },
      },
      {
        text: "Too many family dynamics. Pass.",
        sarcasticGuidance: "Italian family businesses are beautiful until you're in the middle of one.",
        outcome: {
          description: "You pass. The brand eventually sells to a conglomerate that strips it for parts. The founding family is devastated. At least it's not your problem.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 19,
    title: "The Turnaround",
    description: "A retailer that missed the e-commerce transition. 500 stores, declining traffic, mounting debt. The CEO promises a 'digital renaissance.' Your model says the equity is worthless unless something changes dramatically.",
    minReputation: 35,
    triggerTags: ['retail', 'distressed'],
    choices: [
      {
        text: "Buy the debt at a discount, own it through restructuring.",
        sarcasticGuidance: "Loan-to-own. The most elegant hostile takeover.",
        outcome: {
          description: "You buy the debt at 60 cents on the dollar. When the company restructures, you convert to equity. You now own a retail chain. Time to close some stores.",
          statChanges: { cash: -40000, reputation: +10, stress: +25, score: +600, ethics: -10 },
        },
      },
      {
        text: "Invest in the equity with a new management team.",
        sarcasticGuidance: "The turnaround specialist play. New CEO, new strategy, same declining foot traffic.",
        outcome: {
          description: "You back a rockstar retail CEO to lead the turnaround. She closes 200 stores, launches e-commerce, and... it's still not enough. The secular decline continues.",
          statChanges: { cash: -30000, stress: +20, score: +200, reputation: -10 },
        },
      },
      {
        text: "Retail is dead. Pass.",
        sarcasticGuidance: "Amazon wins. Accept it.",
        outcome: {
          description: "You pass. The company files for bankruptcy two years later. The real estate gets carved up. Some PE fund makes a killing on the liquidation. It wasn't you.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 20,
    title: "The Infrastructure Play",
    description: "A portfolio of toll roads across three states. Steady cash flows, inflation protection, but zero growth. The politics are tricky—every time you raise tolls, some state senator holds a press conference.",
    minReputation: 50,
    triggerTags: ['infrastructure', 'real_assets'],
    choices: [
      {
        text: "Acquire and optimize toll pricing.",
        sarcasticGuidance: "People will pay to avoid traffic. That's just human nature.",
        outcome: {
          description: "You buy the toll roads and implement dynamic pricing. Cash flows increase 20%. Commuters hate you. Local news does a special on 'greedy Wall Street.' Standard.",
          statChanges: { cash: -80000, reputation: -5, stress: +10, score: +800, ethics: -15 },
        },
      },
      {
        text: "Hold for yield, no price increases.",
        sarcasticGuidance: "Be the good guy. Collect steady checks. Let inflation do the work.",
        outcome: {
          description: "You keep prices flat, collect dividends, and sell to a pension fund in five years. Boring, predictable, profitable. Your LPs are thrilled with the distributions.",
          statChanges: { cash: -60000, reputation: +10, score: +600 },
        },
      },
      {
        text: "Infrastructure returns are too low. Pass.",
        sarcasticGuidance: "Single-digit IRRs? What is this, a pension fund?",
        outcome: {
          description: "You pass on infrastructure and chase higher returns in growth equity. Your infrastructure-focused competitors have a good year. But you're playing a different game.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 21,
    title: "The Pharma Patent Cliff",
    description: "A specialty pharma company with one blockbuster drug. Patent expires in 18 months. The pipeline is thin. Management is hyping an acquisition strategy. The stock has cratered 70%.",
    minReputation: 40,
    triggerTags: ['pharma', 'distressed'],
    choices: [
      {
        text: "Take it private at the bottom.",
        sarcasticGuidance: "Buy the despair, sell the hope.",
        outcome: {
          description: "You acquire the company at a depressed valuation. The pipeline drug fails. The generics destroy the core product. You're stuck holding an empty shell. Sometimes the market is right.",
          statChanges: { cash: -50000, stress: +30, score: -200, reputation: -15 },
        },
      },
      {
        text: "Fund the acquisition strategy with new capital.",
        sarcasticGuidance: "Give them the warchest to buy their way out of the hole.",
        outcome: {
          description: "You inject capital for M&A. They acquire three small biotechs. One of them has a Phase 3 winner. Your portfolio company survives. Sometimes you get lucky.",
          statChanges: { cash: -40000, reputation: +15, score: +800 },
        },
      },
      {
        text: "Pharma is too binary. Pass.",
        sarcasticGuidance: "Drug either works or it doesn't. That's not investing, that's gambling.",
        outcome: {
          description: "You pass. The company does eventually find a pipeline winner and the stock recovers. You missed a 5x. But you also avoided a potential zero.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 22,
    title: "The ESG Pivot",
    description: "A traditional energy company wants to reinvent itself as a renewable energy player. They have cash from legacy oil assets and a CEO with green ambitions. The transition will take a decade.",
    minReputation: 30,
    triggerTags: ['energy', 'esg'],
    choices: [
      {
        text: "Fund the green transition.",
        sarcasticGuidance: "Stranded assets are someone else's problem. You're buying the future.",
        outcome: {
          description: "You invest in the renewable buildout. The legacy business subsidizes the transition. ESG investors love your portfolio. Traditional energy investors think you're virtue signaling.",
          statChanges: { cash: -60000, reputation: +20, score: +700, ethics: +15, factionReputation: { LIMITED_PARTNERS: +10 } },
        },
      },
      {
        text: "Milk the legacy assets, ignore the transition talk.",
        sarcasticGuidance: "Oil isn't going anywhere for decades. Follow the cash.",
        outcome: {
          description: "You focus on the cash-generating oil fields. Dividends flow. The ESG crowd protests at your LP meetings. Returns are excellent. Sleep is slightly harder.",
          statChanges: { cash: +80000, reputation: -10, score: +500, ethics: -20, factionReputation: { LIMITED_PARTNERS: -5 } },
        },
      },
      {
        text: "Energy transitions are 20-year plays. Pass.",
        sarcasticGuidance: "Your fund has a 10-year life. The math doesn't work.",
        outcome: {
          description: "You pass. The energy transition continues without you. Wind and solar stocks are volatile. You watch from the sidelines, neither relieved nor regretful.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 23,
    title: "The Cybersecurity Incident",
    description: "A portfolio company just got hacked. Customer data is on the dark web. The CEO is panicking. The PR team wants to minimize. Legal wants to delay disclosure. The clock is ticking.",
    requiresPortfolio: true,
    triggerTags: ['crisis', 'cyber'],
    choices: [
      {
        text: "Full disclosure immediately.",
        sarcasticGuidance: "Transparency is the only option. Rip off the bandaid.",
        outcome: {
          description: "You force immediate disclosure. The stock drops 30%. Regulators appreciate the transparency. Customers are angry but stay. The long-term trust is preserved.",
          statChanges: { reputation: +10, stress: +20, score: +400, ethics: +20, auditRisk: -15 },
        },
      },
      {
        text: "Minimize and delay disclosure.",
        sarcasticGuidance: "Control the narrative. Investigate first, disclose later.",
        outcome: {
          description: "You delay disclosure for 'investigation purposes.' A reporter breaks the story anyway. Now you look like you were covering up. The SEC is interested.",
          statChanges: { reputation: -20, stress: +30, score: -300, ethics: -30, auditRisk: +30 },
        },
      },
      {
        text: "Fire the CEO and bring in crisis management.",
        sarcasticGuidance: "Someone has to take the fall. Might as well be the person in charge.",
        outcome: {
          description: "You install a crisis CEO and let the previous leader 'pursue other opportunities.' The transition is messy but the narrative shifts. The company survives.",
          statChanges: { reputation: +5, stress: +25, score: +300, ethics: -5 },
        },
      },
    ],
  },
  {
    id: 24,
    title: "The Secondary Seller",
    description: "Another PE firm wants to sell you their portfolio company. They've held it for 8 years. They claim it's a 'growth story' but you suspect they've exhausted the easy value. Why are they selling?",
    minReputation: 45,
    triggerTags: ['secondary', 'lbo'],
    choices: [
      {
        text: "Buy it if the price is right.",
        sarcasticGuidance: "Everyone's garbage is someone's treasure. At the right price.",
        outcome: {
          description: "You negotiate hard and buy at a fair valuation. The previous PE firm was indeed out of ideas, but you have a fresh playbook. The turnaround begins.",
          statChanges: { cash: -70000, reputation: +10, score: +600 },
        },
      },
      {
        text: "Pass—secondary deals are where returns go to die.",
        sarcasticGuidance: "If they could create more value, they would. They can't. They're selling.",
        outcome: {
          description: "You pass. The selling PE firm finds another buyer. You'll never know if you missed a winner or dodged a loser. That's the game.",
          statChanges: { score: +100 },
        },
      },
      {
        text: "Co-invest with the seller—split the remaining value.",
        sarcasticGuidance: "Aligned incentives. They keep skin in the game.",
        outcome: {
          description: "You structure a creative deal where the seller rolls 30% of their equity. Their continued alignment gives you confidence. Everyone's incentives are aligned.",
          statChanges: { cash: -50000, reputation: +10, score: +700, analystRating: +10 },
        },
      },
    ],
  },
  {
    id: 25,
    title: "The Management Buyout",
    description: "A division of a Fortune 500 company is being spun off. The division's management team wants to buy it themselves but needs capital. They know the business cold but have never run a standalone company.",
    minReputation: 35,
    triggerTags: ['mbo', 'carveout'],
    choices: [
      {
        text: "Back the management team.",
        sarcasticGuidance: "Operators who want to own equity are the best partners.",
        outcome: {
          description: "You fund the MBO. The management team is fiercely committed. They work weekends without complaint because they're building their own wealth. This is what alignment looks like.",
          statChanges: { cash: -60000, reputation: +15, score: +800 },
        },
      },
      {
        text: "Fund it but install your own CEO.",
        sarcasticGuidance: "Trust but verify. They know the business but do they know how to run a board?",
        outcome: {
          description: "You bring in a professional CEO to 'support' the management team. They resent the oversight. Tension builds. But governance is tight.",
          statChanges: { cash: -55000, reputation: +5, stress: +15, score: +500, ethics: -5 },
        },
      },
      {
        text: "Carve-outs are too complex. Pass.",
        sarcasticGuidance: "Transition service agreements, stranded costs, IT separation... nightmare.",
        outcome: {
          description: "You pass on the operational complexity. A competitor funds the MBO and it goes spectacularly well. You add 'carve-out expertise' to your hiring wishlist.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 26,
    title: "The Activist Attack",
    description: "An activist hedge fund just took a 5% stake in a company you're evaluating. They're demanding a sale, board seats, and the CEO's head. The stock is up 20% on the news. Do you join the fray?",
    minReputation: 40,
    triggerTags: ['activist', 'public'],
    choices: [
      {
        text: "Acquire alongside the activist—take private together.",
        sarcasticGuidance: "The enemy of my target is my friend. Temporarily.",
        outcome: {
          description: "You partner with the activist to force a sale. They handle the public warfare, you provide the capital. The company sells. You split the spoils. An uneasy but profitable alliance.",
          statChanges: { cash: -80000, reputation: +15, stress: +20, score: +900 },
        },
      },
      {
        text: "Wait for the activist to fail, buy the dip.",
        sarcasticGuidance: "Activists don't always win. Sometimes the board fights back.",
        outcome: {
          description: "The activist campaign fails. The stock crashes. You buy on weakness. Sometimes patience is the best strategy. The company eventually recovers.",
          statChanges: { cash: -50000, reputation: +5, score: +600 },
        },
      },
      {
        text: "This is a circus. Stay away.",
        sarcasticGuidance: "Activists create noise, not value. Let them fight.",
        outcome: {
          description: "You stay on the sidelines while the proxy war rages. It's entertaining to watch from a distance. Eventually everyone settles and pretends they won.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 27,
    title: "The Climate Tech Bet",
    description: "A startup claims to have cracked direct air carbon capture at scale. The science is real but the economics are unproven. Governments are starting to mandate carbon removal. This could be huge or a complete waste.",
    minReputation: 30,
    triggerTags: ['climate', 'deeptech'],
    choices: [
      {
        text: "Make a big bet on the energy transition.",
        sarcasticGuidance: "Save the planet and make money. Surely both are possible.",
        outcome: {
          description: "You lead the round. The technology works in the lab. The question is whether it works at scale. Government contracts start coming in. Maybe you're early to something real.",
          statChanges: { cash: -40000, reputation: +20, score: +600, ethics: +15 },
        },
      },
      {
        text: "Wait for technology de-risking.",
        sarcasticGuidance: "Let someone else fund the science experiment. Buy in later at a higher price.",
        outcome: {
          description: "You wait. A year later, the technology is proven and the valuation triples. You missed the best entry point, but you also avoided the technology risk.",
          statChanges: { score: +200, analystRating: +5 },
        },
      },
      {
        text: "Climate tech is too speculative. Pass.",
        sarcasticGuidance: "Government subsidies aren't a business model. They're a political football.",
        outcome: {
          description: "You pass. The company eventually gets acquired by an oil major looking for carbon offsets. The founders get rich. You feel... something. Regret? Relief? Both?",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 28,
    title: "The Public-to-Private",
    description: "A mid-cap public company is trading at depressed multiples. The founder still owns 30% and is tired of quarterly earnings calls. He's open to a take-private. But public-to-privates are expensive and scrutinized.",
    minReputation: 50,
    minCash: 75000,
    triggerTags: ['p2p', 'lbo'],
    choices: [
      {
        text: "Launch a full take-private offer.",
        sarcasticGuidance: "Pay the control premium. Own the whole thing.",
        outcome: {
          description: "You make the offer. The board hires Goldman to run a process. Competing bids emerge. You win, but at a higher price than planned. Still, you own a real business now.",
          statChanges: { cash: -150000, reputation: +25, stress: +30, score: +1000 },
        },
      },
      {
        text: "Partner with the founder for a management buyout.",
        sarcasticGuidance: "Aligned founders make everything easier.",
        outcome: {
          description: "You structure a deal where the founder rolls his equity and management joins. The board approves without a fight. Everyone's aligned. This is how deals should work.",
          statChanges: { cash: -100000, reputation: +20, score: +900 },
        },
      },
      {
        text: "Public-to-privates are too complex. Pass.",
        sarcasticGuidance: "SEC scrutiny, minority shareholders, deal litigation... too many moving parts.",
        outcome: {
          description: "You pass. The company stays public, eventually gets acquired by a strategic at a premium. You watch from the sidelines.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
  {
    id: 29,
    title: "The LP Co-Investment",
    description: "Your largest LP wants a co-investment right on your next deal. They'll put up $100M alongside the fund. But they want information rights, a board observer seat, and veto over the exit. Are they a partner or a backseat driver?",
    minReputation: 45,
    triggerTags: ['lp', 'fundraising'],
    factionRequirements: [{ faction: 'LIMITED_PARTNERS', min: 50 }],
    choices: [
      {
        text: "Accept the co-investment with their terms.",
        sarcasticGuidance: "Their money, their rules. That's how LP relationships work.",
        outcome: {
          description: "You accept. Their capital helps you win a bigger deal. But every board meeting now includes their observer asking 'clarifying questions.' The partnership is... complicated.",
          statChanges: { reputation: +10, stress: +15, score: +600, factionReputation: { LIMITED_PARTNERS: +20, MANAGING_DIRECTORS: -5 } },
        },
      },
      {
        text: "Negotiate lighter governance rights.",
        sarcasticGuidance: "Take their money but limit their interference.",
        outcome: {
          description: "After tense negotiations, they get information rights but no board seat. A fair compromise. The relationship survives. Barely.",
          statChanges: { reputation: +5, stress: +10, score: +500, factionReputation: { LIMITED_PARTNERS: +10 } },
        },
      },
      {
        text: "Decline the co-investment. Preserve GP control.",
        sarcasticGuidance: "Your fund, your rules. Even if it means smaller deals.",
        outcome: {
          description: "You politely decline. The LP is offended. They reduce their commitment to your next fund. But your governance is clean.",
          statChanges: { reputation: -10, score: +200, factionReputation: { LIMITED_PARTNERS: -15, MANAGING_DIRECTORS: +10 } },
        },
      },
    ],
  },
  {
    id: 30,
    title: "The Geographic Expansion",
    description: "An opportunity to acquire a company in Brazil. The growth potential is enormous. But currency risk, political instability, and a legal system you don't understand add layers of complexity.",
    minReputation: 40,
    triggerTags: ['international', 'emerging'],
    choices: [
      {
        text: "Expand internationally. Growth is worth the risk.",
        sarcasticGuidance: "Emerging markets: where fortunes are made and lost in equal measure.",
        outcome: {
          description: "You close the Brazilian deal. Currency devalues 20% in year one. But the underlying business grows 50%. Net-net, you're ahead. For now. Always for now.",
          statChanges: { cash: -60000, reputation: +15, stress: +25, score: +700 },
        },
      },
      {
        text: "Partner with a local fund.",
        sarcasticGuidance: "They understand the terrain. You provide the capital.",
        outcome: {
          description: "You co-invest with a Brazilian PE firm. They navigate the politics, you bring the expertise. A true partnership. Cultural differences are challenging but manageable.",
          statChanges: { cash: -40000, reputation: +10, score: +600, analystRating: +10 },
        },
      },
      {
        text: "Stick to markets you understand. Pass.",
        sarcasticGuidance: "Circle of competence. Stay in your lane.",
        outcome: {
          description: "You pass on the international expansion. Brazil has a currency crisis six months later. You feel relieved. Then the currency recovers and the company triples. Investing is humbling.",
          statChanges: { score: +100 },
        },
      },
    ],
  },
];

export const PORTFOLIO_ACTIONS: PortfolioAction[] = [
  {
    id: 'fire_ceo',
    text: 'Fire CEO',
    description: 'The current leadership is underperforming. Time to make a change at the top.',
    icon: 'fa-user-slash',
    outcome: {
      description: "You orchestrated the CEO's exit. It was a messy, political battle, but the board backed you. Now to find a replacement who will actually do what they're told. The move signals you're not afraid to make tough calls.",
      statChanges: { reputation: +10, stress: +15, score: +300 },
      logMessage: "Orchestrated CEO ousting and initiated executive search.",
    }
  },
  {
    id: 'increase_incentives',
    text: 'Increase Incentives',
    description: 'Juice the management team with a new, more aggressive incentive plan.',
    icon: 'fa-money-bill-trend-up',
    outcome: {
      description: "You've sweetened the pot for the management team. They're more motivated, but it cost the company cash. Hopefully their greed translates into performance.",
      statChanges: { cash: -5000, analystRating: +5, score: +150 },
      logMessage: "Rolled out a new, more aggressive management incentive plan.",
    }
  },
  {
    id: 'strategic_review',
    text: 'Initiate Strategic Review',
    description: 'Hire consultants to tear the business apart and find areas for "optimization."',
    icon: 'fa-magnifying-glass-chart',
    outcome: {
      description: "The consultants produced a 200-slide deck confirming what you already knew, but now it has fancy charts. It creates a lot of work, but it also gives you a clear roadmap for your value creation plan.",
      statChanges: { stress: +10, analystRating: +10, score: +200 },
      logMessage: "Hired consultants to conduct a full strategic review.",
    }
  },
  {
    id: 'initiate_dividend',
    text: 'Initiate Dividend Payout',
    description: 'Extract cash from the company. Requires positive EBITDA.',
    icon: 'fa-hand-holding-dollar',
    outcome: {
      description: "You initiate a dividend recapitalisation. Cash is extracted from the portfolio company.",
      statChanges: {},
      logMessage: "Initiated dividend payout."
    }
  },
  {
    id: 'initiate_sale',
    text: 'Initiate Sale Process',
    description: 'It is time to harvest. Hire a bank and prepare the company for a sale.',
    icon: 'fa-gavel',
    outcome: {
      description: "The bankers are hired and the CIM is being drafted. This is the big one. The stress is immense, but the potential payday is even bigger. This will define your year.",
      statChanges: { reputation: +15, stress: +20, cash: +10000, score: +750 },
      logMessage: "Hired investment bank to officially begin sale process.",
    }
  },
  {
    id: 'initiate_ipo',
    text: 'Initiate IPO Process',
    description: 'Take the company public. The ultimate exit. Maximum prestige, maximum scrutiny. You will be ringing the bell or wringing your hands if the market turns.',
    icon: 'fa-bell',
    outcome: {
      description: "You've pulled the trigger on the IPO. The S-1 is filed, and the roadshow begins. You're pitching to skeptical mutual fund managers by day and proofreading legal docs by night. The scrutiny is intense—every number is questioned. But if this prices at the top of the range, you're a legend.",
      statChanges: { reputation: +50, stress: +40, cash: -15000, score: +2000, analystRating: +20 },
      logMessage: "Formally initiated the Initial Public Offering (IPO) process.",
    }
  }
];

export const NEWS_EVENTS = [
  {
    id: 1,
    headline: "Fed unexpectedly raises interest rates by 50 basis points, citing inflation fears.",
    effect: {
      description: "The cost of debt just went up, rookie. Every LBO model in the world just got a little bit worse. Valuations are tightening.",
      statChanges: { stress: 5, portfolioImpact: { valuationChangePercentage: -0.05, applicableDealTypes: [DealType.LBO] } }
    }
  },
];

export const PREDEFINED_QUESTIONS: string[] = [
  "Should I take this deal?",
  "LBO or Growth Equity?",
  "What's the exit path here?",
  "How do I lever up?",
  "What's the angle here?",
  "Test my financial knowledge"
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // --- Category 1: The "Analyst's Nightmare" (Technical Modeling) ---
  {
    id: 1,
    category: 'MODELING',
    question: "If Accounts Receivable goes UP by $10M, what happens to your Operating Cash Flow?",
    options: ["It increases by $10M", "It decreases by $10M", "No change", "It depends on Net Income"],
    correctIndex: 1,
    explanation: "An increase in Assets uses cash. If AR goes up, you have booked the revenue but haven't received the cash yet. Thus, Cash Flow decreases."
  },
  {
    id: 2,
    category: 'MODELING',
    question: "Where does Depreciation Expense sit on the Cash Flow Statement?",
    options: ["Investing Activities (Outflow)", "Financing Activities (Outflow)", "Operating Activities (Added Back)", "It doesn't appear on CFS"],
    correctIndex: 2,
    explanation: "Depreciation is a non-cash expense that reduces Net Income. To get to Cash Flow from Operations, you must add it back to Net Income."
  },
  {
    id: 3,
    category: 'MODELING',
    question: "You bought a company with negative EBITDA but positive Net Income. How is this possible?",
    options: ["They have huge Depreciation", "They have a massive Interest Expense", "They had a one-off asset sale or tax credit", "It's impossible"],
    correctIndex: 2,
    explanation: "EBITDA ignores one-off gains/losses and taxes. If Net Income is > EBITDA, there must be a large positive item below the operating line, like a gain on sale of assets."
  },
  // --- Category 2: The "Shark's Term Sheet" (Deal Structure) ---
  {
    id: 4,
    category: 'DEAL_STRUCTURE',
    question: "The majority shareholders want to sell the company, but you (a minority holder) refuse. Which clause allows them to force you to sell?",
    options: ["Tag-Along Rights", "Drag-Along Rights", "Pre-emptive Rights", "Right of First Refusal"],
    correctIndex: 1,
    explanation: "Drag-Along Rights allow the majority to 'drag' the minority into a sale, forcing them to sell their shares on the same terms."
  },
  {
    id: 5,
    category: 'DEAL_STRUCTURE',
    question: "In a 'Down Round', what provision protects early investors from being heavily diluted?",
    options: ["Liquidation Preference", "Anti-Dilution (Full Ratchet / Weighted Average)", "Pay-to-Play", "Dividend Recap"],
    correctIndex: 1,
    explanation: "Anti-dilution clauses adjust the conversion price of preferred stock downwards to protect investors if new shares are issued at a lower price."
  },
  {
    id: 6,
    category: 'DEAL_STRUCTURE',
    question: "For a quick flip (exit in 18 months), which metric matters most to your carry?",
    options: ["IRR (Internal Rate of Return)", "MoIC (Multiple on Invested Capital)", "EBITDA Margin", "Revenue Growth"],
    correctIndex: 0,
    explanation: "IRR is time-sensitive. A quick exit boosts IRR massively. MoIC is just a cash multiplier and doesn't care about time. For a 'quick flip', you are optimizing for high IRR."
  },
  // --- Category 3: "Due Diligence" (Logic/Common Sense) ---
  {
    id: 7,
    category: 'DUE_DILIGENCE',
    question: "The Founder refuses to show you the Cap Table during due diligence. What do you do?",
    options: ["Offer a higher valuation to build trust", "Sign an NDA and ask again", "Walk away immediately", "Ask the intern to hack their server"],
    correctIndex: 2,
    explanation: "A hidden Cap Table usually means a mess of lawsuits, dead equity, or toxic investors. It's a massive red flag. Walk away."
  },
  {
    id: 8,
    category: 'DUE_DILIGENCE',
    question: "Which of the following creates the most value in a successful LBO?",
    options: ["Multiple Expansion", "Deleverage (Debt Paydown)", "Operational Improvement (EBITDA Growth)", "Dividend Recaps"],
    correctIndex: 2,
    explanation: "While leverage amplifies returns, operational improvement (growing EBITDA) is the most sustainable and controllable driver of value creation."
  },
  {
    id: 9,
    category: 'MODELING',
    question: "If a company has $10M EBITDA, $2M Interest Expense, and $2M Principal Repayment, what is its DSCR?",
    options: ["1.5x", "2.0x", "2.5x", "5.0x"],
    correctIndex: 2,
    explanation: "DSCR = (EBITDA - CapEx) / (Interest + Principal). Assuming 0 CapEx for simplicity here: 10 / (2 + 2) = 2.5x."
  },
  {
    id: 10,
    category: 'GENERAL',
    question: "What happens to a company's Equity Beta when you increase its leverage?",
    options: ["It decreases", "It increases", "It stays the same", "It becomes negative"],
    correctIndex: 1,
    explanation: "Leverage increases financial risk, which increases the volatility of equity returns relative to the market, thus increasing Equity Beta."
  }
];

export const BLACK_BOX_FILE = {
  name: "DO_NOT_OPEN.enc",
  size: "4.2 GB",
  encryption: "AES-256 (Weak)",
  content: "PROJECT_CICADA // MONEY LAUNDERING OPERATIONS FOR SINALOA CARTEL // SHELL COMPANIES: PANAMA, CAYMAN, DELAWARE"
};
