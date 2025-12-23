/**
 * RPG Event Content Library
 *
 * Sample story events and arcs demonstrating the event-driven RPG system.
 * This serves as both example content and the starting point for the game.
 */

import type {
  StoryEvent,
  StoryArc,
  NPCEvolutionStage,
  RPGEnhancedNPC
} from '../types/rpgEvents';
import { PlayerLevel } from '../types';
import { ONBOARDING_ARC, ONBOARDING_EVENTS } from './onboardingContent';

// ============================================================================
// MAIN STORY ARCS
// ============================================================================

export const STORY_ARCS: StoryArc[] = [
  // Onboarding Arc (Tutorial) - Always first
  ONBOARDING_ARC,

  // First Deal Arc
  {
    id: 'arc_first_deal',
    title: 'The Cardboard Empire',
    description: 'Your first deal will define your career trajectory.',
    teaser: 'Chad just threw a CIM on your desk. Time to prove yourself.',
    category: 'MAIN',
    priority: 10,
    estimatedWeeks: 4,
    unlockConditions: {
      minWeek: 1,
    },
    stages: [
      {
        stage: 0,
        title: 'The Assignment',
        description: 'Receive and analyze your first deal.',
        events: ['evt_first_deal'],
        advanceConditions: {
          completedEvents: ['evt_first_deal'],
        },
      },
      {
        stage: 1,
        title: 'The Discovery',
        description: 'Uncover hidden value or walk away.',
        events: ['evt_patent_discovery', 'evt_deal_doubt'],
        advanceConditions: {
          anyEvents: ['evt_patent_discovery', 'evt_deal_doubt'],
        },
      },
      {
        stage: 2,
        title: 'The Pitch',
        description: 'Present your findings to the partners.',
        events: ['evt_partner_pitch'],
        advanceConditions: {
          completedEvents: ['evt_partner_pitch'],
        },
      },
      {
        stage: 3,
        title: 'The Close',
        description: 'Close the deal or face the consequences.',
        events: ['evt_first_deal_close'],
        advanceConditions: {
          completedEvents: ['evt_first_deal_close'],
        },
      },
    ],
    state: 'AVAILABLE',
    currentStage: 0,
    possibleEndings: [
      {
        id: 'first_deal_hero',
        title: 'The Prodigy',
        type: 'VICTORY',
        conditions: { 
          requiredFlags: ['FOUND_PATENT', 'DEAL_CLOSED'],
        },
        rewards: { 
          stats: { reputation: 20, cash: 10000, score: 1000 },
          notification: { title: 'Deal Closed!', message: 'You found value where others saw cardboard.', type: 'success' }
        },
        epilogue: 'Chad actually smiles. "Not bad, kid. Not bad at all." You\'re no longer invisible.',
        achievementId: 'first_blood',
      },
      {
        id: 'first_deal_pass',
        title: 'The Safe Play',
        type: 'NEUTRAL',
        conditions: { 
          requiredFlags: ['DEAL_PASSED'],
        },
        epilogue: 'You passed on the deal. Hunter closed it instead. Whenever you see the champagne photos on LinkedIn, you wonder what could have been.',
      },
      {
        id: 'first_deal_disaster',
        title: 'The Learning Experience',
        type: 'DEFEAT',
        conditions: { 
          requiredFlags: ['DEAL_BOTCHED'],
        },
        penalties: { 
          stats: { reputation: -15 },
        },
        epilogue: 'The partners remember your name now. Not for the right reasons.',
      },
    ],
    primaryNpcs: ['chad', 'sarah', 'hunter'],
    playerChoices: [],
    keyMoments: [],
  },

  // Hunter Rivalry Arc
  {
    id: 'arc_hunter_rivalry',
    title: 'The Hunter Problem',
    description: 'Hunter Sterling is either your greatest rival or your closest ally.',
    teaser: 'Hunter has been eyeing you since day one. The question is: friend or foe?',
    category: 'NPC',
    priority: 8,
    estimatedWeeks: 20,
    unlockConditions: {
      minWeek: 4,
      completedArcs: ['arc_first_deal'],
    },
    stages: [
      {
        stage: 0,
        title: 'First Blood',
        description: 'Hunter makes his opening move.',
        events: ['evt_hunter_credit_steal', 'evt_hunter_lunch'],
        advanceConditions: {
          anyEvents: ['evt_hunter_credit_steal', 'evt_hunter_lunch'],
        },
      },
      {
        stage: 1,
        title: 'Escalation',
        description: 'The rivalry deepens or transforms.',
        events: ['evt_hunter_sabotage', 'evt_hunter_proposition', 'evt_hunter_vulnerable'],
        advanceConditions: {
          autoAdvanceWeeks: 8,
        },
      },
      {
        stage: 2,
        title: 'The Reckoning',
        description: 'One of you will come out on top.',
        events: ['evt_hunter_final'],
        advanceConditions: {
          completedEvents: ['evt_hunter_final'],
        },
      },
    ],
    state: 'LOCKED',
    currentStage: 0,
    possibleEndings: [
      {
        id: 'hunter_destroyed',
        title: 'The Fall of Hunter',
        type: 'VICTORY',
        conditions: { 
          requiredFlags: ['HUNTER_EXPOSED'],
        },
        rewards: { 
          stats: { reputation: 25, score: 1500 },
        },
        epilogue: 'Hunter cleans out his desk. As he passes you, he whispers: "This isn\'t over." But it is.',
        achievementId: 'rival_slayer',
      },
      {
        id: 'hunter_alliance',
        title: 'Strange Bedfellows',
        type: 'NEUTRAL',
        conditions: { 
          requiredFlags: ['HUNTER_ALLIANCE'],
          npcRelationship: { npcId: 'hunter', min: 60 },
        },
        rewards: { 
          stats: { financialEngineering: 10 },
        },
        epilogue: 'You and Hunter now control the deal flow together. The partners are uneasy, but they can\'t argue with results.',
        unlocksArcs: ['arc_power_duo'],
      },
      {
        id: 'hunter_wins',
        title: 'The Better Man',
        type: 'DEFEAT',
        conditions: { 
          requiredFlags: ['PLAYER_DISCREDITED'],
        },
        penalties: { 
          stats: { reputation: -30 },
        },
        epilogue: 'Hunter smiles as you\'re called into HR. You played his game and lost.',
      },
    ],
    primaryNpcs: ['hunter'],
    playerChoices: [],
    keyMoments: [],
  },

  // Sarah Personal Arc
  {
    id: 'arc_sarah_evolution',
    title: 'Sarah\'s Ambition',
    description: 'Sarah has dreams bigger than the analyst bullpen.',
    teaser: 'Sarah stays later than anyone. She\'s watching. Learning. Waiting.',
    category: 'NPC',
    priority: 6,
    estimatedWeeks: 30,
    unlockConditions: {
      minWeek: 8,
      npcRelationship: { npcId: 'sarah', min: 40 },
    },
    stages: [
      {
        stage: 0,
        title: 'The Confidante',
        description: 'Sarah opens up about her goals.',
        events: ['evt_sarah_late_night', 'evt_sarah_confession'],
        advanceConditions: {
          anyEvents: ['evt_sarah_late_night', 'evt_sarah_confession'],
        },
      },
      {
        stage: 1,
        title: 'The Opportunity',
        description: 'Sarah\'s chance arrives—will you help?',
        events: ['evt_sarah_project', 'evt_sarah_credit_dispute'],
        advanceConditions: {
          autoAdvanceWeeks: 10,
        },
      },
      {
        stage: 2,
        title: 'The Crossroads',
        description: 'Her future—and your relationship—hang in the balance.',
        events: ['evt_sarah_promotion', 'evt_sarah_startup', 'evt_sarah_departure'],
        advanceConditions: {
          anyEvents: ['evt_sarah_promotion', 'evt_sarah_startup', 'evt_sarah_departure'],
        },
      },
    ],
    state: 'LOCKED',
    currentStage: 0,
    possibleEndings: [
      {
        id: 'sarah_partner',
        title: 'The Partnership',
        type: 'VICTORY',
        conditions: { 
          requiredFlags: ['SARAH_PROMOTED', 'SARAH_ALLY'],
          npcRelationship: { npcId: 'sarah', min: 80 },
        },
        rewards: {
          setsFlags: ['HAS_TRUSTED_ALLY'],
        },
        epilogue: 'Sarah becomes the youngest VP in firm history. In her acceptance speech, she thanks "the one person who believed in me from day one." She\'s looking at you.',
        unlocksArcs: ['arc_power_couple'],
      },
      {
        id: 'sarah_founder',
        title: 'The Founder',
        type: 'NEUTRAL',
        conditions: { 
          requiredFlags: ['SARAH_STARTUP_BACKED'],
        },
        epilogue: 'Sarah leaves to build her fintech startup. You\'re listed as an advisor. When it IPOs, you get a very nice email.',
      },
      {
        id: 'sarah_rival',
        title: 'The Betrayal',
        type: 'PYRRHIC',
        conditions: { 
          requiredFlags: ['SARAH_BETRAYED'],
          npcRelationship: { npcId: 'sarah', max: 30 },
        },
        penalties: {
          stats: { reputation: -10 },
        },
        epilogue: 'Sarah joins a competitor. Her pitch deck has a slide titled "What NOT to do" with thinly veiled references to you.',
      },
    ],
    primaryNpcs: ['sarah'],
    playerChoices: [],
    keyMoments: [],
  },
];

// ============================================================================
// STORY EVENTS
// ============================================================================

export const STORY_EVENTS: StoryEvent[] = [
  // === ONBOARDING EVENTS (Tutorial) ===
  ...ONBOARDING_EVENTS,

  // === FIRST DEAL ARC EVENTS ===
  {
    id: 'evt_first_deal',
    type: 'PRIORITY',
    category: 'DEAL',
    title: 'The Cardboard Empire',
    hook: 'Chad drops a CIM on your desk. "Don\'t waste my time if it\'s garbage."',
    description: `
It's your first real deal. PackFancy Inc. — a mid-market manufacturer of artisanal cardboard boxes. 

The numbers look... flat. Revenue's barely moving. EBITDA margins are thin. The CEO's letter is full of buzzwords but short on substance.

But something catches your eye on page 40. A patent reference buried in the footnotes. Patent #8829. Hydrophobic coating technology.

This might be more than just a box company. Or it might be nothing.

The deadline for an IOI is Friday. What's your move?
    `.trim(),
    context: 'Your first impression matters. How you handle this will define how the partners see you.',
    sourceNpcId: 'chad',
    involvedNpcs: ['chad', 'sarah'],
    involvedCompanies: [1],
    stakes: 'HIGH',
    choices: [
      {
        id: 'dig_deeper',
        label: 'Investigate the Patent',
        description: 'Spend extra hours digging into Patent #8829. There might be something here.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { stress: 10, analystRating: 5 },
          npcEffects: [
            { npcId: 'sarah', relationship: 5, memory: 'Impressed by thorough research approach' },
          ],
          setsFlags: ['INVESTIGATING_PATENT'],
          queuesEvent: { eventId: 'evt_patent_discovery', delayWeeks: 0 },
          notification: { 
            title: 'Investigation Started', 
            message: 'You pull the patent filings. This is going to be a long night.', 
            type: 'info' 
          },
        },
        playerLine: 'Something doesn\'t add up here. I need to look closer.',
        epilogue: 'At 2am, surrounded by empty coffee cups and patent documents, you start to see the bigger picture...',
      },
      {
        id: 'recommend_pass',
        label: 'Recommend Pass',
        description: 'The numbers don\'t work. Tell Chad it\'s not worth pursuing.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { stress: -5, reputation: -5 },
          npcEffects: [
            { npcId: 'chad', relationship: -10, memory: 'Dismissed PackFancy without thorough analysis' },
          ],
          setsFlags: ['DEAL_PASSED'],
          notification: { 
            title: 'Deal Declined', 
            message: 'Chad grunts. "I didn\'t ask for your opinion. I asked for analysis."', 
            type: 'warning' 
          },
        },
        playerLine: 'The fundamentals don\'t support an investment at these multiples.',
        epilogue: 'Chad gives the deal to Hunter. Two weeks later, you see the champagne photos on LinkedIn. Hunter found something you missed.',
      },
      {
        id: 'aggressive_approach',
        label: 'Go All In',
        description: 'Trust your gut. Push for an aggressive IOI based on the growth story.',
        alignment: 'BOLD',
        skillCheck: {
          skill: 'financialEngineering',
          threshold: 35,
          successConsequences: {
            stats: { reputation: 15, cash: 5000 },
            notification: { 
              title: 'Model Approved', 
              message: 'Your aggressive model impressed the partners. Bold move.', 
              type: 'success' 
            },
          },
          failureConsequences: {
            stats: { reputation: -10 },
            setsFlags: ['DEAL_BOTCHED'],
            notification: { 
              title: 'Model Rejected', 
              message: 'The model fell apart under scrutiny. Chad is not happy.', 
              type: 'error' 
            },
          },
        },
        consequences: {
          stats: { stress: 15 },
          setsFlags: ['AGGRESSIVE_APPROACH'],
        },
        playerLine: 'Sometimes you have to trust your instincts. I see upside here.',
      },
      {
        id: 'ask_sarah',
        label: 'Loop in Sarah',
        description: 'Ask Sarah to help with the analysis. Two heads are better than one.',
        alignment: 'DIPLOMATIC',
        consequences: {
          stats: { stress: -5 },
          npcEffects: [
            { npcId: 'sarah', relationship: 10, trust: 5, memory: 'Included me from the start' },
          ],
          setsFlags: ['SARAH_INVOLVED'],
          queuesEvent: { eventId: 'evt_sarah_finds_patent', delayWeeks: 0 },
          notification: { 
            title: 'Teamwork', 
            message: 'Sarah\'s eyes light up. "I love a puzzle. Let\'s crack this."', 
            type: 'info' 
          },
        },
        playerLine: 'Sarah, got a minute? I could use a second set of eyes on this.',
        immediateResponse: 'She looks up from her terminal, already curious. "Show me what you\'ve got."',
      },
    ],
    expiresInWeeks: 1,
    triggerArcId: 'arc_first_deal',
    arcStage: 0,
    advisorHints: {
      machiavelli: 'Every first deal is a test. Not of the company, but of you. Show them you can find value where others see nothing.',
      sarah: 'Page 40 has some interesting patent references. Might be worth a deeper look at the IP portfolio.',
    },
  },

  {
    id: 'evt_patent_discovery',
    type: 'PRIORITY',
    category: 'DEAL',
    title: 'The Hidden Gem',
    hook: 'Patent #8829 is real. And it\'s worth a fortune.',
    description: `
After hours of research, you\'ve cracked it. Patent #8829 isn\'t just a footnote—it\'s a breakthrough.

Hydrophobic coating technology that could revolutionize packaging. Waterproof cardboard. Temperature-resistant shipping containers. Food-safe packaging without plastic liners.

PackFancy isn\'t a boring box company. It\'s a materials science company that doesn\'t know what it has.

The current management is focused on "operational excellence" while sitting on a gold mine. 

Now the question: how do you play this?
    `.trim(),
    context: 'You found something the market missed. This is your edge.',
    sourceNpcId: 'sarah',
    involvedNpcs: ['chad', 'sarah'],
    involvedCompanies: [1],
    stakes: 'HIGH',
    requirements: {
      requiredFlags: ['INVESTIGATING_PATENT'],
    },
    choices: [
      {
        id: 'pitch_tech_angle',
        label: 'Pitch as a Tech Play',
        description: 'Rebrand the investment thesis. This isn\'t manufacturing—it\'s Advanced Materials.',
        alignment: 'BOLD',
        consequences: {
          stats: { reputation: 20, analystRating: 10 },
          npcEffects: [
            { npcId: 'chad', relationship: 20, memory: 'Found the hidden value in PackFancy' },
          ],
          setsFlags: ['FOUND_PATENT', 'TECH_ANGLE'],
          companyEffects: [{
            companyId: 1,
            changes: { currentValuation: 80000000 },
          }],
          notification: { 
            title: 'Thesis Approved', 
            message: '"It\'s not boxes, it\'s Advanced Materials!" The partners eat it up.', 
            type: 'success' 
          },
        },
        triggersEvents: [{ eventId: 'evt_partner_pitch', delayWeeks: 1 }],
        playerLine: 'Forget the boxes. We\'re buying a materials science platform with unique IP.',
        epilogue: 'Chad leans back. "I knew there was something there. Glad you found it."',
      },
      {
        id: 'quiet_approach',
        label: 'Keep It Quiet',
        description: 'Don\'t tip your hand. Bid low and hope no one else sees it.',
        alignment: 'CAUTIOUS',
        successChance: 60,
        consequences: {
          stats: { financialEngineering: 5 },
          setsFlags: ['FOUND_PATENT', 'QUIET_PLAY'],
          notification: { 
            title: 'Cards Close', 
            message: 'You submit a "fair" IOI that hides your real thesis. Risky.', 
            type: 'warning' 
          },
        },
        triggersEvents: [{ eventId: 'evt_quiet_bid', delayWeeks: 1, probability: 60 }],
        playerLine: 'We don\'t need to advertise what we know. Let\'s play this close.',
      },
      {
        id: 'share_with_sarah',
        label: 'Credit Sarah',
        description: 'She helped find this. Make sure she gets recognition.',
        alignment: 'ETHICAL',
        requires: {
          flag: 'SARAH_INVOLVED',
        },
        consequences: {
          stats: { reputation: 10, ethics: 10 },
          npcEffects: [
            { npcId: 'sarah', relationship: 25, trust: 15, memory: 'Shared credit for the patent discovery' },
          ],
          setsFlags: ['FOUND_PATENT', 'SHARED_CREDIT'],
          notification: { 
            title: 'Team Win', 
            message: 'You present it as a team discovery. Sarah\'s loyalty deepens.', 
            type: 'success' 
          },
        },
        triggersEvents: [{ eventId: 'evt_partner_pitch', delayWeeks: 1 }],
        playerLine: 'Sarah and I worked on this together. She deserves recognition.',
        immediateResponse: 'Sarah\'s eyes widen. No one has ever done that for her before.',
      },
    ],
    expiresInWeeks: 1,
    triggerArcId: 'arc_first_deal',
    arcStage: 1,
  },

  // === HUNTER RIVALRY EVENTS ===
  {
    id: 'evt_hunter_credit_steal',
    type: 'PRIORITY',
    category: 'NPC',
    title: 'Credit Where It\'s Due',
    hook: 'Hunter is telling Chad YOUR analysis was HIS idea.',
    description: `
You\'re in the pantry grabbing coffee when you overhear it.

Hunter\'s voice carries through the door: "Yeah, the PackFancy angle? I suggested they look at the IP portfolio. You know how it is—you can\'t do everything yourself."

Your blood runs cold. That was YOUR discovery. YOUR late nights. YOUR breakthrough.

Chad makes an approving sound. "Good instinct. I always knew you had the nose for it."

Hunter walks out, sees you, and smiles. "Oh hey, great job on the model by the way. Really solid execution."

He knows you heard. And he doesn\'t care.
    `.trim(),
    context: 'This is about more than credit. It\'s about power.',
    sourceNpcId: 'hunter',
    involvedNpcs: ['hunter', 'chad'],
    involvedCompanies: [],
    stakes: 'HIGH',
    requirements: {
      completedEvents: ['evt_patent_discovery'],
      requiredFlags: ['FOUND_PATENT'],
      blockedByFlags: ['SHARED_CREDIT'], // If Sarah got credit, Hunter can't steal it
    },
    choices: [
      {
        id: 'confront_publicly',
        label: 'Call Him Out',
        description: 'Confront Hunter in front of Chad. Set the record straight.',
        alignment: 'BOLD',
        skillCheck: {
          skill: 'reputation',
          threshold: 40,
          successConsequences: {
            stats: { reputation: 10 },
            npcEffects: [
              { npcId: 'hunter', relationship: -25, memory: 'Publicly humiliated over credit dispute' },
              { npcId: 'chad', relationship: 5, memory: 'Stood up for self with evidence' },
            ],
            notification: { title: 'Truth Wins', message: 'You show Chad the timestamps. Hunter sputters excuses.', type: 'success' },
          },
          failureConsequences: {
            stats: { reputation: -15 },
            npcEffects: [
              { npcId: 'chad', relationship: -10, memory: 'Made a scene without solid proof' },
            ],
            notification: { title: 'Overplayed', message: 'Chad looks uncomfortable. "Let\'s not make this personal."', type: 'error' },
          },
        },
        consequences: {
          stats: { stress: 15 },
          setsFlags: ['CONFRONTED_HUNTER'],
        },
        playerLine: 'Actually, Chad, I need to clarify something about the IP discovery.',
        immediateResponse: 'Hunter\'s smile freezes. "What are you doing?"',
      },
      {
        id: 'gather_evidence',
        label: 'Document Everything',
        description: 'Don\'t react. Build a paper trail. Wait for the right moment.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { stress: 10 },
          setsFlags: ['BUILDING_CASE'],
          queuesEvent: { eventId: 'evt_hunter_exposed', delayWeeks: 4 },
          notification: { 
            title: 'Playing the Long Game', 
            message: 'You smile and walk away. But you\'re not forgetting this.', 
            type: 'info' 
          },
        },
        playerLine: 'You know what, Hunter? Great teamwork. Really great.',
        epilogue: 'You spend the next week documenting every interaction, every timestamp, every email. When the moment comes, you\'ll be ready.',
      },
      {
        id: 'let_it_go',
        label: 'Let It Slide',
        description: 'Credit isn\'t everything. Keep your head down.',
        alignment: 'DIPLOMATIC',
        consequences: {
          stats: { stress: -5, reputation: -5 },
          npcEffects: [
            { npcId: 'hunter', relationship: 5, memory: 'Didn\'t fight back when I took credit' },
          ],
          notification: { 
            title: 'Swallowed Pride', 
            message: 'You let it go. Hunter\'s smile widens. He knows he won.', 
            type: 'warning' 
          },
        },
        playerLine: 'Thanks, Hunter. Appreciate the kind words.',
        epilogue: 'You tell yourself it doesn\'t matter. The work speaks for itself. But late at night, it gnaws at you.',
      },
      {
        id: 'flip_the_script',
        label: 'Beat Him at His Game',
        description: 'Spread your own version. Play politics right back.',
        alignment: 'RUTHLESS',
        consequences: {
          stats: { ethics: -10, reputation: 5 },
          npcEffects: [
            { npcId: 'hunter', relationship: -15, memory: 'Playing the same game' },
          ],
          setsFlags: ['PLAYS_POLITICS'],
          notification: { 
            title: 'Game On', 
            message: 'You start casually mentioning the discovery to everyone. The real story spreads.', 
            type: 'info' 
          },
        },
        playerLine: 'Two can play this game, Hunter.',
        epilogue: 'By end of week, everyone knows the truth—and knows Hunter tried to steal credit. He\'s watching you differently now.',
      },
    ],
    expiresInWeeks: 1,
    triggerArcId: 'arc_hunter_rivalry',
    arcStage: 0,
  },

  // === PERSONAL LIFE EVENTS ===
  {
    id: 'evt_family_emergency',
    type: 'PRIORITY',
    category: 'PERSONAL',
    title: 'Mom\'s Call',
    hook: 'Your phone buzzes. It\'s mom. At 2am. This can\'t be good.',
    description: `
"Honey, I didn\'t want to worry you, but..."

Your dad collapsed at work. He\'s in the hospital. Stable, they say, but they\'re running tests. Something about his heart.

Your mom\'s voice is steady in that way it gets when she\'s trying not to fall apart.

"You don\'t need to come. I know you\'re busy with your important job. The insurance is being difficult about the specialist, but we\'ll figure it out..."

She\'s asking for $25,000. She\'s asking without asking.

There\'s a partner meeting in 6 hours. Chad expects your deck by 8am. 

What do you do?
    `.trim(),
    context: 'Work will always have deadlines. But some calls you can\'t miss.',
    involvedNpcs: ['mom'],
    involvedCompanies: [],
    stakes: 'CRITICAL',
    choices: [
      {
        id: 'drop_everything',
        label: 'Book the Next Flight',
        description: 'Family first. Always. You\'ll deal with work later.',
        alignment: 'ETHICAL',
        consequences: {
          stats: { stress: 20, cash: -2500 },
          npcEffects: [
            { npcId: 'mom', relationship: 30, memory: 'Dropped everything when dad was sick' },
            { npcId: 'chad', relationship: -15, memory: 'Disappeared before the partner meeting' },
          ],
          setsFlags: ['FAMILY_FIRST'],
          notification: { 
            title: 'On My Way', 
            message: 'You book the 6am flight. Chad can wait.', 
            type: 'info' 
          },
        },
        playerLine: 'I\'m coming, Mom. Tell Dad I\'m on my way.',
        epilogue: 'You hold your dad\'s hand in the hospital. He smiles weakly. "Shouldn\'t you be at work?" Some things matter more than work.',
      },
      {
        id: 'wire_money',
        label: 'Send the Money',
        description: 'Wire $25,000 for the specialist. You\'ll visit when things calm down.',
        alignment: 'NEUTRAL',
        requires: {
          stat: { name: 'cash', min: 25000 },
        },
        consequences: {
          stats: { cash: -25000, stress: 10 },
          npcEffects: [
            { npcId: 'mom', relationship: 15, memory: 'Sent money when we needed it' },
          ],
          notification: { 
            title: 'Transfer Complete', 
            message: 'The money hits their account within the hour.', 
            type: 'info' 
          },
        },
        playerLine: 'Mom, I\'m wiring the money now. Get Dad the best specialist.',
        immediateResponse: '"Oh honey... thank you. But when will we see you?"',
        epilogue: 'You make the partner meeting. You nail the presentation. But you can\'t stop thinking about the hospital.',
      },
      {
        id: 'send_half',
        label: 'Send What You Can',
        description: 'Wire $10,000 and promise more when bonus hits.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { cash: -10000, stress: 15 },
          npcEffects: [
            { npcId: 'mom', relationship: 5, memory: 'Helped but with limits' },
          ],
          notification: { 
            title: 'Partial Help', 
            message: 'It\'s not everything, but it\'s something.', 
            type: 'warning' 
          },
        },
        playerLine: 'I can send $10k now. More when my bonus comes in.',
        immediateResponse: '"Of course, honey. Every bit helps." There\'s a pause. "We understand."',
      },
      {
        id: 'cant_help',
        label: 'Make Excuses',
        description: 'You can\'t afford it. Tell her you\'ll figure something out.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { stress: 25, ethics: -10 },
          npcEffects: [
            { npcId: 'mom', relationship: -20, trust: -15, memory: 'Couldn\'t help when we needed it most' },
          ],
          notification: { 
            title: 'Empty Hands', 
            message: 'You explain about the bonus timing, the market, the deals...', 
            type: 'error' 
          },
        },
        playerLine: 'Mom, things are really tight right now. I\'m sure the hospital has payment plans...',
        immediateResponse: 'Silence. Then: "Of course. We understand. You\'re very busy." Click.',
        epilogue: 'You nail the presentation. Chad says "good work." It feels hollow.',
      },
    ],
    expiresInWeeks: 0,
    advisorHints: {
      machiavelli: 'Money is replaceable. Parents are not. But remember: you can\'t help anyone if your career implodes.',
    },
  },

  // === OPTIONAL EVENTS ===
  {
    id: 'evt_networking_gala',
    type: 'OPTIONAL',
    category: 'OPPORTUNITY',
    title: 'The Charity Gala',
    hook: 'An invitation to the PE industry\'s most exclusive event.',
    description: `
The Blackstone Foundation Gala. $5,000 a plate. The who\'s who of private equity will be there.

Your firm has one extra ticket. Chad\'s offering it to you or Hunter. First to claim it wins.

This is where deals get whispered. Where careers get made. Where the wrong fork at dinner can cost you a partnership.

Do you want in?
    `.trim(),
    context: 'Networking isn\'t optional in this business. It\'s oxygen.',
    sourceNpcId: 'chad',
    involvedNpcs: ['chad', 'hunter', 'sheikh'],
    involvedCompanies: [],
    stakes: 'MEDIUM',
    choices: [
      {
        id: 'claim_ticket',
        label: 'Claim It',
        description: 'Drop $5k on the ticket. Investment in your future.',
        alignment: 'BOLD',
        requires: {
          stat: { name: 'cash', min: 5000 },
        },
        consequences: {
          stats: { cash: -5000, reputation: 10 },
          npcEffects: [
            { npcId: 'hunter', relationship: -5, memory: 'Beat me to the gala ticket' },
          ],
          setsFlags: ['GALA_ATTENDEE'],
          queuesEvent: { eventId: 'evt_gala_night', delayWeeks: 2 },
          notification: { 
            title: 'You\'re In', 
            message: 'You confirm your spot. Time to buy a better suit.', 
            type: 'success' 
          },
        },
        playerLine: 'I\'ll take it. Put me down.',
      },
      {
        id: 'pass_to_hunter',
        label: 'Let Hunter Have It',
        description: 'Save the money. There\'ll be other opportunities.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { stress: -5 },
          npcEffects: [
            { npcId: 'hunter', relationship: 5, memory: 'Let me have the gala ticket' },
          ],
          notification: { 
            title: 'Passed', 
            message: 'Hunter grins. "Thanks for stepping aside."', 
            type: 'info' 
          },
        },
        playerLine: 'You know what? Hunter can have this one.',
      },
    ],
    expiresInWeeks: 1,
  },

  {
    id: 'evt_portfolio_review',
    type: 'OPTIONAL',
    category: 'DEAL',
    title: 'Portfolio Deep Dive',
    hook: 'Time to check on your investments.',
    description: `
Your portfolio companies are running on autopilot, but autopilot eventually crashes.

PackFancy\'s Q2 numbers are in. TechSync has a board meeting next week. 
There are warning signs if you look for them.

You could spend the afternoon reviewing reports and making calls. 
Or you could trust the management teams to handle it.

What\'s your approach?
    `.trim(),
    context: 'Neglected companies become problem companies.',
    involvedNpcs: [],
    involvedCompanies: [1, 2],
    stakes: 'LOW',
    requirements: {
      hasCompanyInStatus: 'OWNED',
    },
    choices: [
      {
        id: 'deep_review',
        label: 'Conduct Full Review',
        description: 'Clear your afternoon. Go through every metric.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { stress: 10, analystRating: 5 },
          companyEffects: [
            { companyId: 1, changes: { ceoPerformance: 75 } },
          ],
          notification: { 
            title: 'Eyes On', 
            message: 'You catch a few issues before they become crises.', 
            type: 'success' 
          },
        },
      },
      {
        id: 'spot_check',
        label: 'Quick Spot Check',
        description: 'Skim the highlights. Flag anything urgent.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { stress: 5 },
          notification: { 
            title: 'Good Enough', 
            message: 'Nothing seems urgent. Probably fine.', 
            type: 'info' 
          },
        },
      },
      {
        id: 'trust_management',
        label: 'Trust the Team',
        description: 'That\'s what you pay management for.',
        alignment: 'BOLD',
        successChance: 70,
        consequences: {
          stats: { stress: -5 },
          notification: {
            title: 'Delegated',
            message: 'You have other things to worry about.',
            type: 'info'
          },
        },
      },
    ],
    expiresInWeeks: 2,
  },

  // === EARLY GAME VARIETY EVENTS ===
  {
    id: 'evt_coffee_meeting',
    type: 'OPTIONAL',
    category: 'NPC',
    title: 'Coffee with Sarah',
    hook: 'Sarah catches you at the coffee machine. She looks like she hasn\'t slept.',
    description: `
"Got a minute?" Sarah glances around to make sure no one's listening.

"I've been grinding on the TechSync model all night. Found something weird in the cap table—there's a series of small transactions that don't match the investor list."

She hesitates. "Could be nothing. Could be someone skimming. But if I bring it to Chad and I'm wrong..."

She's asking if you'll look at it with her. Fresh eyes.

This isn't your deal. But Sarah's asking.
    `.trim(),
    context: 'Building alliances early can pay off later.',
    sourceNpcId: 'sarah',
    involvedNpcs: ['sarah'],
    involvedCompanies: [],
    stakes: 'LOW',
    choices: [
      {
        id: 'help_sarah',
        label: 'Take a Look',
        description: 'Spend 30 minutes reviewing her work.',
        alignment: 'DIPLOMATIC',
        consequences: {
          stats: { stress: 5, analystRating: 3 },
          npcEffects: [
            { npcId: 'sarah', relationship: 15, trust: 10, memory: 'Helped me when I needed a second opinion' },
          ],
          setsFlags: ['HELPED_SARAH_EARLY'],
          notification: {
            title: 'Team Player',
            message: 'You spot the issue—clerical error in Series B. Sarah owes you one.',
            type: 'success'
          },
        },
        playerLine: 'Show me what you\'ve got.',
        epilogue: 'Sarah grins. "I knew I could count on you." She doesn\'t forget favors.',
      },
      {
        id: 'too_busy',
        label: 'Not Now',
        description: 'You have your own work to do.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { stress: -5 },
          npcEffects: [
            { npcId: 'sarah', relationship: -5, memory: 'Too busy to help' },
          ],
          notification: {
            title: 'Focused',
            message: 'Sarah nods stiffly. "Sure. I get it."',
            type: 'info'
          },
        },
        playerLine: 'Sorry, Sarah. Drowning here. Ask Hunter maybe?',
      },
      {
        id: 'escalate',
        label: 'Tell Her to Escalate',
        description: 'If it\'s that serious, Chad should know.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { ethics: 5 },
          npcEffects: [
            { npcId: 'sarah', relationship: -10, memory: 'Suggested I escalate without support' },
          ],
          notification: {
            title: 'By the Book',
            message: 'Sarah\'s face falls. "Right. The official way."',
            type: 'warning'
          },
        },
        playerLine: 'If there\'s fraud, that\'s above our pay grade. Document it and tell Chad.',
      },
    ],
    expiresInWeeks: 2,
    requirements: {
      minWeek: 2,
    },
  },

  {
    id: 'evt_late_night_pizza',
    type: 'OPTIONAL',
    category: 'PERSONAL',
    title: 'Burning the Midnight Oil',
    hook: 'It\'s 11pm. Everyone else has gone home. You\'re still at your desk.',
    description: `
The office is dark except for your monitor and the city lights.

Your body aches from sitting. Your eyes burn from spreadsheets. The cleaning crew has already come and gone.

You could order pizza and push through—there's always more work. Or you could call it a night and start fresh tomorrow.

Sometimes the extra hours pay off. Sometimes they just burn you out faster.

What's it going to be?
    `.trim(),
    context: 'Sustainable pace matters. Or does it?',
    involvedNpcs: [],
    involvedCompanies: [],
    stakes: 'LOW',
    choices: [
      {
        id: 'push_through',
        label: 'Pizza and Grind',
        description: 'Order delivery. Keep working. Sleep when you\'re Partner.',
        alignment: 'BOLD',
        consequences: {
          stats: { energy: -20, stress: 10, analystRating: 5, cash: -25, score: 50 },
          notification: {
            title: 'Night Owl',
            message: 'You demolish the model by 2am. Tomorrow\'s you problem.',
            type: 'success'
          },
        },
        playerLine: 'Just one more hour. Then maybe another.',
        epilogue: 'The sun is coming up when you finally leave. But your work is impeccable.',
      },
      {
        id: 'go_home',
        label: 'Call It',
        description: 'Fresh eyes in the morning will be more productive.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { energy: 10, stress: -10 },
          notification: {
            title: 'Lights Out',
            message: 'You save your work and shut down. Tomorrow is another day.',
            type: 'info'
          },
        },
        playerLine: 'Nothing good happens after midnight.',
      },
      {
        id: 'gym_break',
        label: 'Hit the 24-Hour Gym',
        description: 'Clear your head with a workout. Then decide.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { energy: 15, stress: -15, health: 5, cash: -0 },
          notification: {
            title: 'Reset',
            message: 'An hour of iron therapy. You return with fresh perspective.',
            type: 'success'
          },
        },
        playerLine: 'I need to move. My brain is mush.',
        epilogue: 'After the workout, the problem seems simpler. You knock it out in an hour.',
      },
    ],
    expiresInWeeks: 3,
    requirements: {
      minWeek: 1,
    },
  },

  {
    id: 'evt_headhunter_call',
    type: 'OPTIONAL',
    category: 'CAREER',
    title: 'The Call',
    hook: 'Unknown number. You almost let it go to voicemail.',
    description: `
"Hi there. My name is Rebecca Chen. I'm a recruiter at Korn Ferry."

Your heart rate spikes. Headhunters don't call unless someone's watching.

"I have a client—top-tier firm, you'd recognize the name—looking for someone with your profile. They're building out their deal team and your name came up."

She won't say which firm. But she wants to meet for coffee. "Just a conversation."

You've been at Apex for six months. Is it too early to explore? Or is this the kind of opportunity you'd regret missing?
    `.trim(),
    context: 'Your career is your responsibility. No one else\'s.',
    involvedNpcs: [],
    involvedCompanies: [],
    stakes: 'MEDIUM',
    choices: [
      {
        id: 'take_meeting',
        label: 'Take the Meeting',
        description: 'Coffee can\'t hurt. Information is power.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { reputation: -5 },
          setsFlags: ['MET_HEADHUNTER'],
          queuesEvent: { eventId: 'evt_rival_offer', delayWeeks: 4, probability: 70 },
          notification: {
            title: 'Meeting Set',
            message: 'Thursday, 7am, Blue Bottle. Discrete.',
            type: 'info'
          },
        },
        playerLine: 'I\'m listening. When and where?',
        epilogue: 'You meet Rebecca in a quiet corner. She slides a folder across the table. The numbers are... compelling.',
      },
      {
        id: 'loyal_decline',
        label: 'Politely Decline',
        description: 'You\'re focused on Apex right now.',
        alignment: 'ETHICAL',
        consequences: {
          stats: { stress: -5 },
          npcEffects: [
            { npcId: 'chad', relationship: 5, memory: 'Loyal to the firm' },
          ],
          notification: {
            title: 'Commitment',
            message: '"I understand. I\'ll keep your number." Click.',
            type: 'info'
          },
        },
        playerLine: 'I appreciate the call, but I\'m not looking right now.',
      },
      {
        id: 'fish_for_info',
        label: 'Fish for Information',
        description: 'Get details without committing to anything.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { financialEngineering: 2 },
          setsFlags: ['KNOWS_MARKET_RATES'],
          notification: {
            title: 'Intel Gathered',
            message: 'You learn the going rate for your role. Useful leverage.',
            type: 'success'
          },
        },
        playerLine: 'I\'m not sure about a meeting, but hypothetically... what kind of package are we talking?',
      },
    ],
    expiresInWeeks: 2,
    requirements: {
      minWeek: 4,
      minReputation: 20,
    },
  },

  {
    id: 'evt_analyst_burnout',
    type: 'OPTIONAL',
    category: 'NPC',
    title: 'Sarah\'s Breaking Point',
    hook: 'Sarah\'s making mistakes. That never happens.',
    description: `
You notice the typo in her model. Then another. Then a formula error that would have blown up the entire DCF.

This isn't like Sarah. She's usually bulletproof.

You watch her more closely. The trembling hands. The third Red Bull. The way she startles when anyone approaches.

She's been pulling 100-hour weeks for a month straight. Everyone has. But some people break faster than others.

Do you say something? It's not really your business. But if she crashes and burns, it becomes everyone's problem.
    `.trim(),
    context: 'We watch out for each other. Or we don\'t.',
    sourceNpcId: 'sarah',
    involvedNpcs: ['sarah'],
    involvedCompanies: [],
    stakes: 'MEDIUM',
    requirements: {
      minWeek: 6,
      npcRelationships: [{ npcId: 'sarah', minRelationship: 30 }],
    },
    choices: [
      {
        id: 'private_talk',
        label: 'Pull Her Aside',
        description: 'Quiet conversation. Express genuine concern.',
        alignment: 'ETHICAL',
        consequences: {
          stats: { ethics: 10 },
          npcEffects: [
            { npcId: 'sarah', relationship: 20, trust: 15, memory: 'Noticed when I was struggling and reached out' },
          ],
          notification: {
            title: 'Human Moment',
            message: 'Sarah\'s eyes water. "You\'re the first person to ask if I\'m okay."',
            type: 'success'
          },
        },
        playerLine: 'Hey. Can we talk for a minute? Not about work.',
        epilogue: 'She takes a personal day. Comes back sharper. Remembers who noticed.',
      },
      {
        id: 'cover_mistakes',
        label: 'Fix Quietly',
        description: 'Catch her errors before anyone else sees them.',
        alignment: 'DIPLOMATIC',
        consequences: {
          stats: { stress: 10, analystRating: 5 },
          npcEffects: [
            { npcId: 'sarah', relationship: 10, memory: 'Covered for my mistakes' },
          ],
          notification: {
            title: 'Silent Support',
            message: 'You fix the errors. She never knows. But you\'re carrying extra weight.',
            type: 'info'
          },
        },
        playerLine: 'I\'ll clean this up. She\'ll get through it.',
      },
      {
        id: 'tell_chad',
        label: 'Report to Chad',
        description: 'Quality control is a team issue. He needs to know.',
        alignment: 'RUTHLESS',
        consequences: {
          stats: { reputation: 5, ethics: -10 },
          npcEffects: [
            { npcId: 'sarah', relationship: -30, trust: -20, memory: 'Reported me when I was struggling' },
            { npcId: 'chad', relationship: 10, memory: 'Watches out for quality issues' },
          ],
          notification: {
            title: 'Flag Raised',
            message: 'Chad thanks you for the heads up. Sarah is called into his office.',
            type: 'warning'
          },
        },
        playerLine: 'Chad should know there are quality issues coming from Sarah\'s desk.',
        epilogue: 'Sarah returns from Chad\'s office red-eyed. She doesn\'t look at you the rest of the day. Or the next.',
      },
      {
        id: 'not_my_problem',
        label: 'Stay Out of It',
        description: 'Everyone has bad weeks. She\'ll figure it out.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { stress: -5 },
          notification: {
            title: 'Not Your Circus',
            message: 'You focus on your own work. Sarah spirals or doesn\'t.',
            type: 'info'
          },
        },
        playerLine: 'She\'s a professional. She\'ll handle it.',
      },
    ],
    expiresInWeeks: 1,
  },

  {
    id: 'evt_market_downturn',
    type: 'OPTIONAL',
    category: 'MARKET',
    title: 'Blood in the Streets',
    hook: 'The market dropped 800 points this morning. The office is tense.',
    description: `
CNBC is on every screen. Red everywhere.

Some trade deal collapsed. Or rates are spiking. Or it's just random chaos—the market being the market.

Your portfolio companies are getting crushed on paper. LPs are going to have questions. Partners are in emergency meetings.

This is either a moment of panic or a moment of opportunity. PE is about buying when others are scared.

But timing the bottom is how fortunes are lost.

What's your read?
    `.trim(),
    context: 'Volatility creates opportunity. And danger.',
    involvedNpcs: ['chad'],
    involvedCompanies: [],
    stakes: 'MEDIUM',
    choices: [
      {
        id: 'buy_opportunity',
        label: 'Call It Opportunity',
        description: 'Draft a memo identifying distressed targets.',
        alignment: 'BOLD',
        consequences: {
          stats: { reputation: 10, stress: 10 },
          npcEffects: [
            { npcId: 'chad', relationship: 10, memory: 'Saw opportunity in the chaos' },
          ],
          setsFlags: ['MARKET_OPPORTUNIST'],
          notification: {
            title: 'Contrarian',
            message: 'You pitch buying while everyone else is selling. Chad raises an eyebrow.',
            type: 'success'
          },
        },
        playerLine: 'This is when deals get made. I\'m running screens on distressed targets.',
        epilogue: 'Three months later, one of your screens turns into the firm\'s best deal of the year.',
      },
      {
        id: 'defensive_posture',
        label: 'Protect the Portfolio',
        description: 'Focus on shoring up existing investments.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { analystRating: 5 },
          notification: {
            title: 'Defense First',
            message: 'You call every portfolio CEO. Make sure no one does anything stupid.',
            type: 'info'
          },
        },
        playerLine: 'Forget new deals. We need to protect what we have.',
      },
      {
        id: 'ride_it_out',
        label: 'Don\'t Overreact',
        description: 'Markets bounce. Panic is the real danger.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { stress: -5 },
          notification: {
            title: 'Steady Hand',
            message: 'You stay calm while others scramble. There\'s wisdom in that.',
            type: 'info'
          },
        },
        playerLine: 'This is noise. We\'ll know more in a week.',
      },
    ],
    expiresInWeeks: 1,
    requirements: {
      minWeek: 3,
      allowedVolatility: ['HIGH', 'CRISIS'],
    },
  },

  {
    id: 'evt_morning_briefing',
    type: 'OPTIONAL',
    category: 'OPERATIONS',
    title: 'The Daily Grind',
    hook: 'Another Monday. What\'s on the agenda?',
    description: `
Your inbox has 47 unread messages. Your calendar is a war crime.

Somewhere in there is actual work that matters. But first you need to prioritize.

There's a partner meeting in an hour where your opinion might be asked. There's a portfolio company crisis simmering. There's a new CIM that landed overnight that looks interesting.

And you haven't responded to that recruiter email yet.

What gets your attention first?
    `.trim(),
    context: 'How you spend your time defines your career.',
    involvedNpcs: [],
    involvedCompanies: [],
    stakes: 'LOW',
    choices: [
      {
        id: 'prep_partner_meeting',
        label: 'Prep for Partner Meeting',
        description: 'Get your talking points ready. Be seen.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { reputation: 5, stress: 5 },
          notification: {
            title: 'Prepared',
            message: 'You nail your points in the meeting. Partners nod.',
            type: 'success'
          },
        },
        playerLine: 'The meeting is where visibility happens.',
      },
      {
        id: 'handle_crisis',
        label: 'Handle the Crisis',
        description: 'The portfolio company issue won\'t fix itself.',
        alignment: 'CAUTIOUS',
        consequences: {
          stats: { analystRating: 5, stress: 10 },
          notification: {
            title: 'Firefighting',
            message: 'You spend the morning on calls. The fire is contained.',
            type: 'info'
          },
        },
        playerLine: 'Crises don\'t wait for convenient scheduling.',
      },
      {
        id: 'review_new_deal',
        label: 'Review the New CIM',
        description: 'New deals are the lifeblood. Get first look.',
        alignment: 'BOLD',
        consequences: {
          stats: { analystRating: 3, financialEngineering: 2 },
          setsFlags: ['DEAL_HUNTER'],
          notification: {
            title: 'Deal Hunter',
            message: 'You skim the CIM. Something catches your eye...',
            type: 'info'
          },
        },
        playerLine: 'I need to see this deal before Hunter does.',
      },
      {
        id: 'catch_up',
        label: 'Just Clear the Inbox',
        description: 'Sometimes survival means treading water.',
        alignment: 'NEUTRAL',
        consequences: {
          stats: { stress: -5 },
          notification: {
            title: 'Maintenance Mode',
            message: 'Nothing exciting. Nothing urgent. Just staying afloat.',
            type: 'info'
          },
        },
        playerLine: 'I need to get to inbox zero before I can think.',
      },
    ],
    expiresInWeeks: 1,
    requirements: {
      minWeek: 2,
    },
  },
];

// ============================================================================
// NPC EVOLUTION PATHS
// ============================================================================

export const NPC_EVOLUTIONS: Record<string, NPCEvolutionStage[]> = {
  sarah: [
    {
      stage: 0,
      title: 'The Analyst',
      description: 'Sarah is a hardworking analyst eager to prove herself.',
      unlocks: ['Diligence help', 'Model reviews', 'Basic intel'],
      triggers: [], // Default state
      traitChanges: ['eager', 'competent', 'by-the-book'],
      moodDefault: 'NEUTRAL',
    },
    {
      stage: 1,
      title: 'The Ally',
      description: 'Sarah trusts you and will go the extra mile.',
      unlocks: ['After-hours intel', 'Off-the-record opinions', 'Hunter gossip', 'Cover stories'],
      triggers: [
        { eventId: 'evt_sarah_credit_dispute', choiceId: 'defend_sarah' },
        { trustThreshold: 60 },
        { requiredFlags: ['SHARED_CREDIT'] },
      ],
      traitChanges: ['loyal', 'insightful', 'slightly rebellious'],
      moodDefault: 'FRIENDLY',
    },
    {
      stage: 2,
      title: 'The Partner',
      description: 'Sarah is more than a colleague. She sees you as an equal.',
      unlocks: ['Strategic advice', 'LP connections', 'Career guidance', 'Risk-taking'],
      triggers: [
        { eventId: 'evt_sarah_promotion', choiceId: 'support_fully' },
        { trustThreshold: 80 },
        { requiredFlags: ['SARAH_ALLY'] },
      ],
      traitChanges: ['confident', 'protective', 'ambitious'],
      moodDefault: 'FRIENDLY',
    },
    {
      stage: 3,
      title: 'The Inner Circle',
      description: 'Sarah would take a bullet for you. And you for her.',
      unlocks: ['Unconditional support', 'Secret projects', 'Ultimate loyalty'],
      triggers: [
        { trustThreshold: 95 },
        { requiredFlags: ['SARAH_INNER_CIRCLE'] },
      ],
      traitChanges: ['unshakeable', 'brilliant', 'ride-or-die'],
      moodDefault: 'GRATEFUL',
    },
  ],
  
  hunter: [
    {
      stage: 0,
      title: 'The Rival',
      description: 'Hunter sees you as competition. Nothing personal.',
      unlocks: ['Competitive intel', 'Power plays'],
      triggers: [],
      traitChanges: ['ambitious', 'calculating', 'charming'],
      moodDefault: 'NEUTRAL',
    },
    {
      stage: 1,
      title: 'The Enemy',
      description: 'Hunter is actively working against you.',
      unlocks: ['Sabotage warnings', 'Counter-intel'],
      triggers: [
        { eventId: 'evt_hunter_credit_steal', choiceId: 'confront_publicly' },
        { trustThreshold: 25 },
        { requiredFlags: ['CONFRONTED_HUNTER'] },
      ],
      traitChanges: ['hostile', 'scheming', 'dangerous'],
      moodDefault: 'HOSTILE',
    },
    {
      stage: 2,
      title: 'The Ally',
      description: 'Against all odds, you\'ve found common ground with Hunter.',
      unlocks: ['Deal partnerships', 'Power sharing', 'Inside info'],
      triggers: [
        { eventId: 'evt_hunter_proposition', choiceId: 'accept_alliance' },
        { trustThreshold: 60 },
        { requiredFlags: ['HUNTER_ALLIANCE'] },
      ],
      traitChanges: ['respectful', 'pragmatic', 'valuable'],
      moodDefault: 'FRIENDLY',
    },
  ],
};

// ============================================================================
// HELPER: CREATE EVENT MAP
// ============================================================================

export const createEventMap = (): Map<string, StoryEvent> => {
  const map = new Map<string, StoryEvent>();
  for (const event of STORY_EVENTS) {
    map.set(event.id, event);
  }
  return map;
};

export const createArcMap = (): Map<string, StoryArc> => {
  const map = new Map<string, StoryArc>();
  for (const arc of STORY_ARCS) {
    map.set(arc.id, arc);
  }
  return map;
};
