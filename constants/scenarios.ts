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
