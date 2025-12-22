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

// ============================================================================
// MAIN STORY ARCS
// ============================================================================

export const STORY_ARCS: StoryArc[] = [
  // Tutorial Arc
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
