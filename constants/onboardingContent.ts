/**
 * Onboarding Content - Tutorial as Event-Driven Story Arc
 *
 * This replaces the legacy TutorialOverlay with integrated story events.
 * New players experience the tutorial as their first story arc.
 */

import type { StoryEvent, StoryArc } from '../types/rpgEvents';

// ============================================================================
// ONBOARDING STORY ARC
// ============================================================================

export const ONBOARDING_ARC: StoryArc = {
  id: 'arc_onboarding',
  title: 'First Day at Apex',
  description: 'Learn the ropes of private equity through your first deal.',
  teaser: 'Every career starts somewhere. Yours starts now.',
  category: 'MAIN',
  priority: 100, // Highest priority - always runs first
  estimatedWeeks: 1,
  unlockConditions: {
    // No conditions - always available for new players
  },
  stages: [
    {
      stage: 0,
      title: 'Welcome',
      description: 'Your first day at Apex Capital.',
      events: ['evt_onboarding_arrival'],
      advanceConditions: {
        completedEvents: ['evt_onboarding_arrival'],
      },
    },
    {
      stage: 1,
      title: 'The Assignment',
      description: 'Receive your first deal from Chad.',
      events: ['evt_onboarding_assignment'],
      advanceConditions: {
        completedEvents: ['evt_onboarding_assignment'],
      },
    },
    {
      stage: 2,
      title: 'Analysis',
      description: 'Learn to analyze deals.',
      events: ['evt_onboarding_analysis'],
      advanceConditions: {
        completedEvents: ['evt_onboarding_analysis'],
      },
    },
    {
      stage: 3,
      title: 'Meet the Team',
      description: 'Get to know your colleagues.',
      events: ['evt_onboarding_sarah'],
      advanceConditions: {
        completedEvents: ['evt_onboarding_sarah'],
      },
    },
    {
      stage: 4,
      title: 'Research',
      description: 'Learn to gather intel from NPCs.',
      events: ['evt_onboarding_research'],
      advanceConditions: {
        completedEvents: ['evt_onboarding_research'],
      },
    },
    {
      stage: 5,
      title: 'Decision Time',
      description: 'Make your first deal decision.',
      events: ['evt_onboarding_complete'],
      advanceConditions: {
        completedEvents: ['evt_onboarding_complete'],
      },
    },
  ],
  state: 'AVAILABLE',
  currentStage: 0,
  possibleEndings: [
    {
      id: 'onboarding_complete',
      title: 'Ready for Action',
      type: 'VICTORY',
      conditions: {
        requiredFlags: ['TUTORIAL_COMPLETE'],
      },
      epilogue: 'You\'ve learned the basics. Now the real game begins.',
      achievementId: 'tutorial_complete',
    },
    {
      id: 'onboarding_skipped',
      title: 'Fast Learner',
      type: 'NEUTRAL',
      conditions: {
        requiredFlags: ['TUTORIAL_SKIPPED'],
      },
      epilogue: 'No hand-holding needed. Let\'s see what you\'ve got.',
    },
  ],
  primaryNpcs: ['chad', 'sarah', 'machiavelli'],
  playerChoices: [],
  keyMoments: [],
};

// ============================================================================
// ONBOARDING EVENTS
// ============================================================================

export const ONBOARDING_EVENTS: StoryEvent[] = [
  // === EVENT 1: Arrival ===
  {
    id: 'evt_onboarding_arrival',
    type: 'PRIORITY',
    category: 'CAREER',
    title: 'Your First Day',
    hook: 'Day one at Apex Capital. Don\'t blow it.',
    description: `The elevator opens to mahogany and money.

Welcome to Apex Capital Partners. $2.4 billion AUM. Top-quartile returns. A place where careers are made—or destroyed in a single bad quarter.

Your desk awaits in the analyst bullpen. Coffee's already getting cold. And somewhere across the trading floor, a Managing Director is about to drop something on your desk that will define your next six months.

The question is: are you ready for this?`,
    context: 'This is your introduction to the world of private equity.',
    involvedNpcs: ['machiavelli'],
    involvedCompanies: [],
    stakes: 'HIGH',
    isOnboarding: true,
    mentorGuidance: {
      character: 'machiavelli',
      message: 'Welcome, rookie. I\'m your AI advisor—think of me as the cynical voice in your head that knows how this game is actually played.',
      tip: 'Throughout the game, I\'ll provide hints on choices. Whether you listen is up to you.',
      highlight: true,
    },
    choices: [
      {
        id: 'ready_to_start',
        label: 'Let\'s Do This',
        description: 'Time to prove yourself in the big leagues.',
        alignment: 'BOLD',
        consequences: {
          stats: { stress: 5 },
          setsFlags: ['ONBOARDING_STARTED'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 1 },
          queuesEvent: { eventId: 'evt_onboarding_assignment', delayWeeks: 0 },
          notification: {
            title: 'Game On',
            message: 'Your private equity career begins now.',
            type: 'success',
          },
        },
        playerLine: 'I\'ve been waiting for this moment my whole life.',
        epilogue: 'You take a deep breath and step into the bullpen. Time to make your mark.',
      },
      {
        id: 'skip_tutorial',
        label: 'Skip the Tour',
        description: 'I know how PE works. Let\'s get straight to business.',
        alignment: 'BOLD',
        consequences: {
          setsFlags: ['TUTORIAL_SKIPPED', 'TUTORIAL_COMPLETE'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 6 },
          queuesEvent: { eventId: 'evt_first_deal', delayWeeks: 0 },
          notification: {
            title: 'Fast Start',
            message: 'No hand-holding. Let\'s see what you\'ve got.',
            type: 'info',
          },
        },
        playerLine: 'I didn\'t come here for a lecture. Show me the deal flow.',
      },
    ],
    triggerArcId: 'arc_onboarding',
    arcStage: 0,
    advisorHints: {
      machiavelli: 'The tutorial teaches you the basics. Skip it if you\'re impatient, but don\'t blame me when you miss something important.',
    },
  },

  // === EVENT 2: The Assignment ===
  {
    id: 'evt_onboarding_assignment',
    type: 'PRIORITY',
    category: 'DEAL',
    title: 'The Assignment',
    hook: 'Chad drops something on your desk. "Don\'t disappoint me."',
    description: `Chad Worthington III—yes, the third—tosses a thick document on your desk without breaking stride.

"PackFancy Inc. Cardboard box manufacturer. Mid-market. The usual garbage metrics, but there might be something there. Or not."

He pauses at your cubicle entrance. "Have your analysis ready by end of day. And don't waste my time if it's obviously a pass."

The CIM (Confidential Information Memorandum) sits there, waiting. Your first real deal.

Time to check your **ASSET MANAGER** to see what you're working with.`,
    context: 'The Asset Manager shows your deal pipeline. Click it to view deals.',
    sourceNpcId: 'chad',
    involvedNpcs: ['chad'],
    involvedCompanies: [1],
    stakes: 'MEDIUM',
    isOnboarding: true,
    requirements: {
      requiredFlags: ['ONBOARDING_STARTED'],
      blockedByFlags: ['ONBOARDING_ASSIGNMENT_DONE'],
    },
    mentorGuidance: {
      character: 'machiavelli',
      message: 'The ASSET MANAGER is your command center for deals. You\'ll see them flow through stages: Pipeline → Diligence → Owned → Exit.',
      tip: 'Every deal starts in your pipeline. Analyzing them costs Action Points (AP).',
      highlight: true,
    },
    choices: [
      {
        id: 'open_assets',
        label: 'Review the Pipeline',
        description: 'Open the Asset Manager to see PackFancy\'s details.',
        alignment: 'CAUTIOUS',
        consequences: {
          setsFlags: ['ONBOARDING_ASSIGNMENT_DONE'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 2 },
          queuesEvent: { eventId: 'evt_onboarding_analysis', delayWeeks: 0 },
          switchToTab: 'ASSETS',
          guidedAction: {
            targetElement: '[data-tab="ASSETS"]',
            pulseColor: 'amber',
            tooltip: 'Click to view your deal pipeline',
          },
          notification: {
            title: 'Asset Manager',
            message: 'Your pipeline awaits. Let\'s see what PackFancy looks like.',
            type: 'info',
          },
        },
        playerLine: 'Time to see what we\'re dealing with.',
      },
    ],
    triggerArcId: 'arc_onboarding',
    arcStage: 1,
    advisorHints: {
      machiavelli: 'First impressions matter. A sloppy analysis will follow you. Take your time.',
    },
  },

  // === EVENT 3: Analysis ===
  {
    id: 'evt_onboarding_analysis',
    type: 'PRIORITY',
    category: 'DEAL',
    title: 'Making Sense of the Numbers',
    hook: 'Revenue, EBITDA, multiples... time to dig in.',
    requirements: {
      requiredFlags: ['ONBOARDING_ASSIGNMENT_DONE'],
      blockedByFlags: ['ONBOARDING_ANALYSIS_DONE'],
    },
    description: `PackFancy's financials are on your screen.

**Revenue:** $120M (flat YoY)
**EBITDA:** ~$15M
**Asking Multiple:** 8x EBITDA

The numbers look... mediocre. A commodity business in a commoditized market. Nothing that screams "buy me."

But wait—there's something in the footnotes on page 40. A patent reference. **Patent #8829**. Something about "hydrophobic coating technology."

That's interesting. Very interesting.

Try running the **LEVERAGE MODEL** to see what the deal economics could look like.`,
    context: 'The Leverage Model shows how debt and equity combine in a buyout.',
    involvedNpcs: [],
    involvedCompanies: [1],
    stakes: 'MEDIUM',
    isOnboarding: true,
    mentorGuidance: {
      character: 'machiavelli',
      message: 'The LEVERAGE MODEL lets you see how debt amplifies returns—but also risk. Click it on any deal you\'re analyzing.',
      tip: 'In an LBO, you use debt to buy a company. Strong cash flow (EBITDA) pays down that debt. Weak cash flow = bankruptcy.',
      highlight: true,
    },
    choices: [
      {
        id: 'run_model',
        label: 'Run the Model',
        description: 'Open the Leverage Model to see PackFancy\'s potential returns.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { analystRating: 2 },
          setsFlags: ['ONBOARDING_ANALYSIS_DONE'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 3 },
          queuesEvent: { eventId: 'evt_onboarding_sarah', delayWeeks: 0 },
          guidedAction: {
            targetElement: '[data-action="leverage-model"]',
            pulseColor: 'cyan',
            tooltip: 'Click to run the financial model',
          },
          notification: {
            title: 'Model Running',
            message: 'Let\'s see what the numbers tell us...',
            type: 'info',
          },
        },
        playerLine: 'Let\'s crunch the numbers on this thing.',
        epilogue: 'The model spins up. With current assumptions, returns look modest. But if that patent is valuable...',
      },
    ],
    triggerArcId: 'arc_onboarding',
    arcStage: 2,
    advisorHints: {
      machiavelli: 'A model is only as good as its assumptions. Change the assumptions, change the outcome.',
    },
  },

  // === EVENT 4: Meet Sarah ===
  {
    id: 'evt_onboarding_sarah',
    type: 'PRIORITY',
    category: 'NPC',
    title: 'Your Analyst',
    hook: 'Someone clears their throat. "Need a hand?"',
    requirements: {
      requiredFlags: ['ONBOARDING_ANALYSIS_DONE'],
      blockedByFlags: ['ONBOARDING_SARAH_MET'],
    },
    description: `Sarah Chen. Senior Analyst. Wire-rimmed glasses, sharp eyes, coffee permanently in hand.

She leans against your cubicle wall. "I've been through the PackFancy CIM already. Did you catch the footnote on page 40?"

You nod.

"That patent—8829—could be interesting. I did some digging." She pauses. "But you should probably ask me about it yourself. Through **COMMS**."

She's offering help. In this place, that's rare.

Open the **COMMS** tab to talk to colleagues and gather intel.`,
    context: 'NPCs have information. Building relationships unlocks it.',
    sourceNpcId: 'sarah',
    involvedNpcs: ['sarah'],
    involvedCompanies: [1],
    stakes: 'LOW',
    isOnboarding: true,
    mentorGuidance: {
      character: 'sarah',
      message: 'Hi! I\'m Sarah. I can help with research, analysis, and intel. Just ask me questions in COMMS.',
      tip: 'NPCs have relationships and trust levels. Help them, and they\'ll help you. Betray them... and they\'ll remember.',
      highlight: true,
    },
    choices: [
      {
        id: 'talk_to_sarah',
        label: 'Open Comms',
        description: 'Go to the COMMS tab to chat with Sarah.',
        alignment: 'DIPLOMATIC',
        consequences: {
          npcEffects: [
            { npcId: 'sarah', relationship: 5, memory: 'Listened during onboarding' },
          ],
          setsFlags: ['ONBOARDING_SARAH_MET'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 4 },
          queuesEvent: { eventId: 'evt_onboarding_research', delayWeeks: 0 },
          switchToTab: 'COMMS',
          guidedAction: {
            targetElement: '[data-tab="COMMS"]',
            pulseColor: 'blue',
            tooltip: 'Click to talk to colleagues',
          },
          notification: {
            title: 'Team Communication',
            message: 'COMMS lets you chat with colleagues and advisors.',
            type: 'info',
          },
        },
        playerLine: 'I\'d love to hear what you found.',
        immediateResponse: 'Sarah smiles slightly. "Finally, someone who asks questions. Come on."',
      },
    ],
    triggerArcId: 'arc_onboarding',
    arcStage: 3,
    advisorHints: {
      machiavelli: 'Sarah\'s a straight shooter. Unlike some people in this office.',
    },
  },

  // === EVENT 5: The Patent Question ===
  {
    id: 'evt_onboarding_research',
    type: 'PRIORITY',
    category: 'NPC',
    title: 'The Patent Question',
    hook: 'Sarah\'s waiting. What do you want to know?',
    requirements: {
      requiredFlags: ['ONBOARDING_SARAH_MET'],
      blockedByFlags: ['KNOWS_PATENT_VALUE'],
    },
    description: `You're at Sarah's desk now. She has a folder open—printed pages covered in highlighter marks.

"Patent #8829," she says. "Hydrophobic coating technology. Do you know what that means?"

You shake your head.

"Waterproof cardboard. Temperature-resistant packaging. Food-safe containers without plastic liners." She taps the document. "This isn't just a box company. It's a materials science company that doesn't know what it has."

She looks at you meaningfully. "The current management is focused on 'operational excellence'—cost cutting and efficiency. They're sitting on a gold mine and using it as a paperweight."

This changes everything.`,
    context: 'Asking the right questions gets you critical intel.',
    sourceNpcId: 'sarah',
    involvedNpcs: ['sarah'],
    involvedCompanies: [1],
    stakes: 'MEDIUM',
    isOnboarding: true,
    mentorGuidance: {
      character: 'machiavelli',
      message: 'This is why you build relationships. Sarah just handed you the key to this deal. Remember who helps you.',
      tip: 'In COMMS, you can ask NPCs specific questions. The more they trust you, the more they share.',
      highlight: true,
    },
    choices: [
      {
        id: 'ask_about_patent',
        label: 'Thanks for the Intel',
        description: 'Acknowledge Sarah\'s help and continue.',
        alignment: 'DIPLOMATIC',
        playerLine: 'This is huge. Thank you, Sarah.',
        immediateResponse: 'She nods. "Just don\'t forget who found it when you\'re presenting to the partners."',
        consequences: {
          npcEffects: [
            { npcId: 'sarah', relationship: 10, trust: 5, memory: 'Appreciated my help with the PackFancy patent' },
          ],
          setsFlags: ['KNOWS_PATENT_VALUE', 'SARAH_HELPED'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 5 },
          queuesEvent: { eventId: 'evt_onboarding_complete', delayWeeks: 0 },
          notification: {
            title: 'Intel Acquired',
            message: 'You now understand PackFancy\'s hidden value.',
            type: 'success',
          },
        },
        epilogue: 'Armed with this knowledge, the deal looks completely different. Time to make a decision.',
      },
    ],
    triggerArcId: 'arc_onboarding',
    arcStage: 4,
    advisorHints: {
      sarah: 'The patent portfolio is the real story here. Everything else is just cardboard.',
    },
  },

  // === EVENT 6: Decision Time ===
  {
    id: 'evt_onboarding_complete',
    type: 'PRIORITY',
    category: 'DEAL',
    title: 'Decision Time',
    hook: 'Chad\'s waiting. What\'s your recommendation?',
    requirements: {
      requiredFlags: ['KNOWS_PATENT_VALUE'],
      blockedByFlags: ['TUTORIAL_COMPLETE'],
    },
    description: `You've done the analysis. You've found the hidden value. Now it's time for your first real decision.

Chad appears at your desk. "Well? PackFancy. In or out?"

An **Indication of Interest (IOI)** tells the seller you're serious about acquiring the company. It's the first step toward a deal.

After you submit an IOI, you'll need to choose your **deal structure**:
- **LBO (Leveraged Buyout)**: Buy the company using debt. High risk, high reward.
- **Growth Equity**: Take a minority stake. Less control, less debt.
- **Venture**: Pure equity bet on explosive growth.

But first—are you in or out on PackFancy?`,
    context: 'Your first deal decision. Choose wisely.',
    sourceNpcId: 'chad',
    involvedNpcs: ['chad', 'sarah'],
    involvedCompanies: [1],
    stakes: 'HIGH',
    isOnboarding: true,
    mentorGuidance: {
      character: 'machiavelli',
      message: 'This is it—your first real decision. Whatever you choose, own it. Second-guessing gets you nowhere in this business.',
      tip: 'After the IOI, you\'ll pick a deal structure and the real game begins. You have 2 Action Points per week—spend them wisely.',
      highlight: true,
    },
    choices: [
      {
        id: 'submit_ioi',
        label: 'Submit IOI',
        description: 'You\'re in. This patent is worth pursuing.',
        alignment: 'BOLD',
        playerLine: 'I\'m in. The IP portfolio changes the entire thesis.',
        immediateResponse: 'Chad\'s eyebrow raises slightly. "Interesting. Show me what you\'ve got."',
        consequences: {
          stats: { reputation: 10, analystRating: 5 },
          setsFlags: ['TUTORIAL_COMPLETE', 'IOI_SUBMITTED', 'FOUND_PATENT'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 6 },
          queuesEvent: { eventId: 'evt_first_deal', delayWeeks: 0 },
          notification: {
            title: 'Tutorial Complete!',
            message: 'Welcome to Apex Capital. The real game begins now.',
            type: 'success',
          },
        },
        epilogue: 'Chad walks away with your IOI. One way or another, you\'ve made your mark. The tutorial is over. The game begins.',
      },
      {
        id: 'pass_deal',
        label: 'Pass on the Deal',
        description: 'The risk isn\'t worth it. Wait for a better opportunity.',
        alignment: 'CAUTIOUS',
        playerLine: 'I don\'t like the risk profile. Let\'s see what else comes in.',
        immediateResponse: 'Chad shrugs. "Your funeral. Hunter\'s been eyeing this one."',
        consequences: {
          stats: { reputation: -5, stress: -10 },
          setsFlags: ['TUTORIAL_COMPLETE', 'FIRST_DEAL_PASSED'],
          advancesArc: { arcId: 'arc_onboarding', toStage: 6 },
          queuesEvent: { eventId: 'evt_morning_briefing', delayWeeks: 0 },
          notification: {
            title: 'Conservative Play',
            message: 'You passed on PackFancy. Let\'s see what\'s next.',
            type: 'warning',
          },
        },
        epilogue: 'You watch Hunter grab the PackFancy file with a grin. Sometimes the best deal is the one you don\'t do. Sometimes.',
      },
    ],
    triggerArcId: 'arc_onboarding',
    arcStage: 5,
    advisorHints: {
      machiavelli: 'Fortune favors the bold. But so do spectacular flameouts. Your call.',
      sarah: 'The patent is real. The question is whether management can execute. That\'s a judgment call.',
    },
  },
];
