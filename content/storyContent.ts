/**
 * Story Content Library
 *
 * The narrative content for Fund Wars - a sarcastic, educational journey
 * through the world of Private Equity.
 *
 * Organized by Chapters, each containing multiple Scenes.
 */

import type {
  Scene,
  Chapter,
  StoryArc,
  ContentRegistry,
} from '../types/storyEngine';

// ============================================================================
// CHAPTER 1: THE FIRST DAY
// ============================================================================

const CHAPTER_1_SCENES: Scene[] = [
  // Opening Scene
  {
    id: 'ch1_opening',
    chapterId: 'chapter_1',
    title: 'Welcome to the Machine',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `The elevator doors slide open to the 47th floor of Sterling Partners.

Glass, chrome, and the faint smell of ambition mixed with expensive cologne.

A receptionist who looks like she stepped out of a magazine glances up from her desk. Her smile is professional. Her eyes are assessing your net worth.

**"You must be the new Associate. Chad is expecting you."**

She gestures toward a corner office where a man in a Patagonia vest is gesturing animatedly at a Bloomberg terminal.

*Welcome to Private Equity. Where dreams are leveraged and synergies are realized.*`,
    choices: [
      {
        id: 'ch1_opening_confident',
        text: 'Walk in confidently',
        subtext: 'Fake it till you make it',
        narratorComment: 'Ah, the classic "act like you belong" strategy. It works until it doesn\'t.',
        nextSceneId: 'ch1_meet_chad_confident',
        effects: {
          stats: { reputation: 2, stress: 5 },
          setFlags: ['CONFIDENT_ENTRANCE'],
        },
      },
      {
        id: 'ch1_opening_nervous',
        text: 'Take a deep breath first',
        subtext: 'Collect yourself',
        narratorComment: 'Self-awareness. A rare trait in this building.',
        nextSceneId: 'ch1_meet_chad_nervous',
        effects: {
          stats: { stress: -5 },
          setFlags: ['HUMBLE_START'],
        },
      },
      {
        id: 'ch1_opening_observe',
        text: 'Observe the office first',
        subtext: 'Get the lay of the land',
        narratorComment: 'Reconnaissance. Smart. The analysts are watching you too.',
        nextSceneId: 'ch1_observe_office',
        effects: {
          stats: { politics: 3 },
          setFlags: ['OBSERVANT'],
        },
      },
    ],
  },

  // Branch: Observe office first
  {
    id: 'ch1_observe_office',
    chapterId: 'chapter_1',
    title: 'Reading the Room',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `You pause, taking in the battlefield.

**The Bullpen:** Rows of analysts hunched over Excel. Their eyes are dead. Their fingers are fast. One of them catches your gaze and offers a weak smile of solidarity.

**The Partner Offices:** Corner real estate with views of the city. The doors are mostly closed. Power resides there.

**The Kitchen:** Someone has labeled their oat milk. Another label reads "TOUCH THIS AND DIE - Hunter."

**The War Room:** Through the glass, you can see deal tombstones mounted like hunting trophies. Each one represents a company acquired, optimized, and flipped.

A woman in her late twenties approaches. She's carrying three laptops and looks like she hasn't slept in days.

**"New blood? I'm Sarah. Senior Associate. Don't trust anyone, the coffee is terrible, and whatever Chad tells you is urgent actually is. Welcome to hell."**

She's already walking away.`,
    choices: [
      {
        id: 'ch1_observe_thank_sarah',
        text: '"Thanks for the intel"',
        subtext: 'Try to connect with Sarah',
        nextSceneId: 'ch1_sarah_bond',
        effects: {
          relationships: [{ npcId: 'sarah', change: 10, memory: 'Showed appreciation on first day' }],
          setFlags: ['SARAH_INTRO'],
        },
      },
      {
        id: 'ch1_observe_ignore_sarah',
        text: 'Head straight to Chad\'s office',
        subtext: 'You have a boss to impress',
        nextSceneId: 'ch1_meet_chad_confident',
        effects: {
          relationships: [{ npcId: 'sarah', change: -5, memory: 'Blew off my advice' }],
        },
      },
    ],
  },

  // Branch: Connect with Sarah
  {
    id: 'ch1_sarah_bond',
    chapterId: 'chapter_1',
    title: 'An Unexpected Ally',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'sarah',
      name: 'Sarah Chen',
      mood: 'worried',
    },
    narrative: `Sarah pauses mid-stride and turns back. For a moment, her exhausted facade cracks.

**"Look, I know I just dumped a lot on you. But seriously—"** She lowers her voice. **"—Chad assigns the new people the dead deals. The ones no one else wants. Don't let him bury you with garbage."**

She glances at Chad's office.

**"Your first deal will define you here. If it's obviously bad, push back. Find the angle. Or find a way to trade up."**

Her phone buzzes. She checks it, winces.

**"Board meeting in 10. I've gotta run. But if you need help with the model... I'm in the bullpen. Row 3."**

She's gone before you can respond.

*A potential ally. In Private Equity, those are rarer than good deals.*`,
    nextSceneId: 'ch1_meet_chad_confident',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Meeting Chad - Confident version
  {
    id: 'ch1_meet_chad_confident',
    chapterId: 'chapter_1',
    title: 'The Managing Director',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'neutral',
    },
    narrative: `Chad Sterling doesn't look up as you enter. He's on speakerphone, and whoever is on the other end is getting eviscerated.

**"—Listen, I don't care what your DCF says. Your terminal value assumptions are divorced from reality. Call me when you have real numbers."**

He ends the call and finally acknowledges you with a glance that lasts exactly 0.7 seconds.

**"You're the new body. Harvard or Wharton?"**

Before you can answer:

**"Doesn't matter. Everyone thinks they're special until they see their first live deal."**

He slides a thick document across his desk. The cover reads: **PackFancy Inc. - Confidential Information Memorandum.**

**"Corrugated cardboard packaging. Sexy, right? This landed on my desk yesterday. I need a preliminary model by Friday."**

His phone rings. He's already moving on.

**"Desk 7. Ask Sarah if you get stuck. Don't get stuck."**`,
    choices: [
      {
        id: 'ch1_chad_accept',
        text: 'Accept the assignment',
        subtext: 'Take the CIM and get to work',
        nextSceneId: 'ch1_first_desk',
        effects: {
          stats: { stress: 10 },
          setFlags: ['PACKFANCY_ASSIGNED'],
        },
      },
      {
        id: 'ch1_chad_question',
        text: '"What\'s the thesis on packaging?"',
        subtext: 'Show analytical curiosity',
        narratorComment: 'Bold move, questioning Chad. Let\'s see how this plays out.',
        nextSceneId: 'ch1_chad_thesis',
        effects: {
          stats: { dealcraft: 3, stress: 5 },
          relationships: [{ npcId: 'chad', change: 5, memory: 'Asked smart questions on day one' }],
          setFlags: ['PACKFANCY_ASSIGNED', 'ASKED_THESIS'],
        },
      },
      {
        id: 'ch1_chad_pushback',
        text: '"Is there anything more... strategic?"',
        subtext: 'Try to get a better deal',
        narratorComment: 'Asking for a better deal on your first day. Gutsy. Stupid, but gutsy.',
        nextSceneId: 'ch1_chad_angry',
        style: 'risky',
        effects: {
          stats: { reputation: -5, stress: 15 },
          relationships: [{ npcId: 'chad', change: -10, memory: 'Tried to negotiate on day one' }],
          setFlags: ['PACKFANCY_ASSIGNED', 'PUSHED_BACK_DAY_ONE'],
        },
      },
    ],
  },

  // Meeting Chad - Nervous version
  {
    id: 'ch1_meet_chad_nervous',
    chapterId: 'chapter_1',
    title: 'The Managing Director',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'smug',
    },
    narrative: `You knock on the door frame. Chad Sterling looks up with the expression of a man whose time is being wasted.

**"Come in. You're blocking the hall."**

He doesn't stand to greet you. Doesn't offer a handshake. Just waves at a chair while finishing an email with aggressive keystrokes.

Finally, he swivels.

**"Let me guess. Top of your class. 'Passion for private equity.' Probably did a summer at Goldman or McKinsey."**

He reaches for a thick document without waiting for your answer.

**"None of that matters here. This is the real world."**

The document lands on your side of the desk. **PackFancy Inc. - Confidential Information Memorandum.**

**"Cardboard boxes. The backbone of e-commerce. Or a dying industry riding the Amazon wave. Figure out which. Model by Friday."**

He's already back to his emails.`,
    choices: [
      {
        id: 'ch1_chad_nervous_accept',
        text: 'Take the CIM quietly',
        subtext: 'Don\'t make waves on day one',
        nextSceneId: 'ch1_first_desk',
        effects: {
          stats: { stress: 5 },
          setFlags: ['PACKFANCY_ASSIGNED', 'QUIET_START'],
        },
      },
      {
        id: 'ch1_chad_nervous_question',
        text: '"Any guidance on the model structure?"',
        subtext: 'Ask for help (risky)',
        nextSceneId: 'ch1_chad_guidance',
        effects: {
          relationships: [{ npcId: 'chad', change: -5, memory: 'Asked for hand-holding on day one' }],
          setFlags: ['PACKFANCY_ASSIGNED', 'ASKED_FOR_HELP'],
        },
      },
    ],
  },

  // Chad provides thesis
  {
    id: 'ch1_chad_thesis',
    chapterId: 'chapter_1',
    title: 'The Investment Thesis',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'neutral',
    },
    narrative: `For a moment, Chad actually looks at you. Like, *really* looks at you.

**"Alright. You want to know the thesis?"**

He leans back, fingers steepled.

**"Everyone's talking about SaaS and fintech. But you know what every one of those companies needs? Boxes. To ship their stuff. E-commerce is up 40% year over year. Corrugated packaging demand follows."**

He points at the CIM.

**"PackFancy has been around for 30 years. Family-owned. The old man's retiring, kids don't want to run it. They're asking 6x EBITDA, which is rich for packaging."**

**"Your job: figure out if there's hidden value. Maybe it's their customer contracts. Maybe it's real estate. Maybe it's all garbage and we pass."**

He checks his Rolex.

**"Questions asked. Now go answer them."**`,
    nextSceneId: 'ch1_first_desk',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Chad angry
  {
    id: 'ch1_chad_angry',
    chapterId: 'chapter_1',
    title: 'First Mistake',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'angry',
    },
    narrative: `Chad's expression doesn't change, but the temperature in the room drops about 10 degrees.

**"Strategic."**

He lets the word hang in the air.

**"You want strategic? Here's some strategy for you: Analysts don't get to pick their deals. Associates don't get to pick their deals. *I* barely get to pick my deals."**

He stands, walking to his window overlooking the city.

**"The partners decide what's strategic. We decide what's worth our time. And *you* get what you're given until you prove you deserve better."**

He turns back, his smile completely devoid of warmth.

**"PackFancy. Friday. Or I can find someone who wants the opportunity."**

*Note to self: Chad remembers everything.*`,
    nextSceneId: 'ch1_first_desk',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Chad gives guidance (slightly mocking)
  {
    id: 'ch1_chad_guidance',
    chapterId: 'chapter_1',
    title: 'Helpful... Ish',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'smug',
    },
    narrative: `Chad chuckles, but it's not a friendly sound.

**"Guidance. Okay."**

He pulls out a worn business card from his desk drawer.

**"This is the investment banking associate who put the CIM together. His name is Miles. He'll talk your ear off if you let him. Filter the BS."**

**"Standard LBO model. Nothing fancy. 5-year projection, multiple exit scenarios. If you don't know what that means..."**

He shrugs.

**"...Google is free."**

*So much for mentorship.*`,
    nextSceneId: 'ch1_first_desk',
    choices: [],
    requiresAcknowledgment: true,
  },

  // First desk scene
  {
    id: 'ch1_first_desk',
    chapterId: 'chapter_1',
    title: 'Desk Seven',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `Desk 7 is exactly what you'd expect: a Bloomberg terminal, two monitors, and a phone that already has three voicemails from "Miles - Banker."

The analyst next to you—nametag says **Hunter Sterling** (yes, *that* Sterling)—doesn't look up from his model. His fingers move across the keyboard with mechanical precision.

On your desk, you find:
- The PackFancy CIM (400+ pages)
- A company laptop (locked, password on sticky note: "Welcome2Sterling!")
- A Keurig cup of cold coffee from whoever was here before you

The CIM stares back at you. Inside those pages is either your first win or your first failure.

*Time to find out which.*`,
    choices: [
      {
        id: 'ch1_desk_dive_in',
        text: 'Start reading the CIM',
        subtext: 'Do the work',
        nextSceneId: 'ch1_cim_review',
        effects: {
          stats: { dealcraft: 2, stress: 5 },
        },
      },
      {
        id: 'ch1_desk_talk_hunter',
        text: 'Introduce yourself to Hunter',
        subtext: 'He might have intel',
        nextSceneId: 'ch1_hunter_intro',
        effects: {
          setFlags: ['MET_HUNTER'],
        },
      },
      {
        id: 'ch1_desk_call_miles',
        text: 'Call back Miles the banker',
        subtext: 'Get the inside scoop',
        nextSceneId: 'ch1_call_miles',
        effects: {
          stats: { politics: 2 },
          setFlags: ['CALLED_MILES'],
        },
      },
    ],
  },

  // Hunter introduction
  {
    id: 'ch1_hunter_intro',
    chapterId: 'chapter_1',
    title: 'The Nephew',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'hunter',
      name: 'Hunter Sterling',
      mood: 'smug',
    },
    narrative: `Hunter finally deigns to look at you. His smile is the kind they teach at prep school—polished, practiced, and completely predatory.

**"New blood. Let me guess... Chad gave you PackFancy?"**

He chuckles.

**"That deal's been kicking around for months. Nobody wants it. It's a cardboard company in Delaware. The numbers don't work unless you find some hidden gem."**

He leans back, clearly enjoying himself.

**"Pro tip? There's probably something in the real estate. These old manufacturing companies always sit on undervalued land. But you didn't hear that from me."**

His phone buzzes. He checks it, smirks.

**"Gotta run. Drinks with the partners tonight. Uncle Chad's introducing me to the LP network."**

*Hunter Sterling: proof that in PE, your family tree matters more than your skill tree.*`,
    choices: [
      {
        id: 'ch1_hunter_thanks',
        text: '"Thanks for the tip"',
        subtext: 'Be polite',
        nextSceneId: 'ch1_cim_review',
        effects: {
          relationships: [{ npcId: 'hunter', change: 5, memory: 'Was polite on first meeting' }],
        },
      },
      {
        id: 'ch1_hunter_cold',
        text: 'Get back to work without responding',
        subtext: 'You don\'t need him',
        nextSceneId: 'ch1_cim_review',
        effects: {
          relationships: [{ npcId: 'hunter', change: -5, memory: 'Cold shoulder on first day' }],
          stats: { stress: -5 },
        },
      },
      {
        id: 'ch1_hunter_challenge',
        text: '"Drinks with partners? That explain why you\'re still an analyst?"',
        subtext: 'Risky move',
        style: 'risky',
        nextSceneId: 'ch1_hunter_enemy',
        effects: {
          relationships: [{ npcId: 'hunter', change: -20, memory: 'Insulted me on day one' }],
          stats: { reputation: 5, stress: 10 },
          setFlags: ['HUNTER_RIVALRY'],
        },
      },
    ],
  },

  // Hunter becomes enemy
  {
    id: 'ch1_hunter_enemy',
    chapterId: 'chapter_1',
    title: 'First Enemy',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'hunter',
      name: 'Hunter Sterling',
      mood: 'angry',
    },
    narrative: `Hunter's smile freezes. Then it transforms into something much colder.

**"Cute."**

He stands, straightening his jacket.

**"You know, I was going to help you out. Give you the inside track on how things work around here."**

He leans in close.

**"But now? Now I'm going to enjoy watching you fail. PackFancy is a dead deal, and when Chad realizes you can't find the angle, you'll be gone by month-end."**

He grabs his bag.

**"Good luck. You're going to need it."**

*Congratulations. You just made an enemy whose last name is on the building.*`,
    nextSceneId: 'ch1_cim_review',
    choices: [],
    requiresAcknowledgment: true,
  },

  // CIM Review
  {
    id: 'ch1_cim_review',
    chapterId: 'chapter_1',
    title: 'The Deep Dive',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `Four hours later. Three cups of terrible coffee. And 200 pages of the most boring document ever created by investment bankers.

**PackFancy Inc.** is exactly what it sounds like: a 30-year-old cardboard box company. Family-owned, steady revenues, zero exciting growth.

But as you dig deeper, some things start to stand out:

**The Good:**
- Strong customer relationships (Amazon is 15% of revenue)
- Clean balance sheet, minimal debt
- Cash flow positive for 20 consecutive years

**The Bad:**
- Revenue flat for 5 years
- Margins declining (commodity pricing pressure)
- CEO is 72 and has no succession plan

**The Interesting:**
- They own their manufacturing facilities outright
- One facility sits on 40 acres in... *wait, is that Newark Airport adjacent?*

Your phone buzzes. A text from an unknown number:

*"Heard you got PackFancy. Check the real estate. The bankers buried the good stuff on page 347. - S"*

*S... Sarah?*`,
    choices: [
      {
        id: 'ch1_cim_check_property',
        text: 'Flip to page 347',
        subtext: 'Follow the tip',
        nextSceneId: 'ch1_discovery',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['FOUND_REAL_ESTATE'],
        },
      },
      {
        id: 'ch1_cim_ignore_tip',
        text: 'Keep reading systematically',
        subtext: 'Don\'t trust anyone',
        nextSceneId: 'ch1_slow_discovery',
        effects: {
          stats: { dealcraft: 2, stress: 10 },
        },
      },
      {
        id: 'ch1_cim_thank_sarah',
        text: 'Text back: "Thanks. Coffee on me."',
        subtext: 'Build the relationship',
        nextSceneId: 'ch1_discovery',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['FOUND_REAL_ESTATE', 'THANKED_SARAH'],
          relationships: [{ npcId: 'sarah', change: 10, memory: 'Appreciated my help' }],
        },
      },
    ],
  },

  // The Discovery
  {
    id: 'ch1_discovery',
    chapterId: 'chapter_1',
    title: 'Hidden Value',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `Page 347. Buried in the appendix. Past the customer contracts and employee lists.

**Property Schedule.**

And there it is.

The Newark facility isn't just 40 acres. It's 40 acres *directly adjacent to the airport expansion zone*. The city has been buying up industrial land for years to extend the runway.

You pull up recent comparable sales. Similar parcels went for **$15-20M per acre**.

You do the math three times. Then a fourth.

*40 acres × $17M average = $680 million*

The entire company is being offered for **$120 million**.

The bankers either don't know what they have, or they're hoping nobody notices.

*Holy. Shit.*`,
    choices: [
      {
        id: 'ch1_discovery_tell_chad',
        text: 'Take this to Chad immediately',
        subtext: 'Show what you found',
        nextSceneId: 'ch1_chad_impressed',
        effects: {
          stats: { reputation: 10 },
          relationships: [{ npcId: 'chad', change: 15, memory: 'Found the hidden value in PackFancy' }],
          setFlags: ['TOLD_CHAD_FIRST'],
        },
      },
      {
        id: 'ch1_discovery_verify',
        text: 'Verify the numbers first',
        subtext: 'Make sure you\'re right',
        nextSceneId: 'ch1_verify',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['VERIFIED_NUMBERS'],
        },
      },
      {
        id: 'ch1_discovery_tell_sarah',
        text: 'Tell Sarah what you found',
        subtext: 'She helped you find it',
        nextSceneId: 'ch1_sarah_team',
        effects: {
          relationships: [{ npcId: 'sarah', change: 15, memory: 'Shared the discovery with me' }],
          setFlags: ['TOLD_SARAH'],
        },
      },
    ],
  },

  // Slow discovery path
  {
    id: 'ch1_slow_discovery',
    chapterId: 'chapter_1',
    title: 'The Long Way',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `It takes you another three hours, but you eventually find it on your own.

Page 347. The property schedule. The Newark facility.

$680 million in hidden real estate value sitting underneath a $120 million asking price.

Your back aches. Your eyes burn. The office is nearly empty now—it's past 11 PM.

But you found it. Without help. On your own terms.

*Sometimes the slow path builds character. And calluses on your fingertips from too much scrolling.*`,
    choices: [
      {
        id: 'ch1_slow_tell_chad',
        text: 'Email Chad tonight',
        subtext: 'Strike while the iron is hot',
        nextSceneId: 'ch1_chad_impressed',
        effects: {
          stats: { reputation: 8, stress: 5 },
          relationships: [{ npcId: 'chad', change: 10, memory: 'Found PackFancy value independently' }],
        },
      },
      {
        id: 'ch1_slow_sleep',
        text: 'Get some sleep, present tomorrow',
        subtext: 'Fresh eyes for the pitch',
        nextSceneId: 'ch1_morning_pitch',
        effects: {
          stats: { stress: -10, dealcraft: 3 },
          setFlags: ['SLEPT_ON_IT'],
        },
      },
    ],
  },

  // Chad impressed
  {
    id: 'ch1_chad_impressed',
    chapterId: 'chapter_1',
    title: 'First Win',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'happy',
    },
    narrative: `Chad leans back in his chair, the ghost of an actual smile on his face.

**"$680 million in land value. For a $120 million purchase price."**

He shakes his head slowly.

**"Either the bankers are idiots, or they're hoping for an idiot buyer. Either way..."**

He stands, actually extends his hand for a handshake.

**"Not bad, kid. Not bad at all."**

He's already pulling out his phone.

**"I'm calling the partners. We're moving on this. And you—"** he points at you **"—you're on the deal team. Don't screw it up."**

*One day. One deal. One foot in the door.*

*Welcome to Private Equity.*`,
    choices: [
      {
        id: 'ch1_chad_humble',
        text: '"Just doing the work, sir"',
        subtext: 'Stay humble',
        nextSceneId: 'ch1_chapter_end',
        effects: {
          stats: { reputation: 5, ethics: 5 },
          setFlags: ['STAYED_HUMBLE'],
        },
      },
      {
        id: 'ch1_chad_confident_reply',
        text: '"I knew there was something they missed"',
        subtext: 'Take credit',
        nextSceneId: 'ch1_chapter_end',
        effects: {
          stats: { reputation: 10, ethics: -5 },
          setFlags: ['TOOK_CREDIT'],
        },
      },
    ],
  },

  // Verify numbers
  {
    id: 'ch1_verify',
    chapterId: 'chapter_1',
    title: 'Due Diligence',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `You spend the next two hours triple-checking everything.

**County property records:** Confirmed. 40 acres, zoned industrial.
**Recent transactions:** Three comparable sales at $15-22M per acre.
**Airport expansion news:** Publicly announced. Phase 2 starts next year.
**Seller motivation:** Retirement, kids not interested.

By 1 AM, you have a bulletproof case.

This isn't just a good deal. This is the kind of deal that launches careers.

*Now comes the hard part: taking credit without looking desperate.*`,
    choices: [
      {
        id: 'ch1_verify_email_chad',
        text: 'Send Chad a detailed email',
        subtext: 'Document everything',
        nextSceneId: 'ch1_chad_impressed',
        effects: {
          stats: { dealcraft: 5, reputation: 5 },
          relationships: [{ npcId: 'chad', change: 12, memory: 'Thoroughly verified PackFancy discovery' }],
        },
      },
      {
        id: 'ch1_verify_morning',
        text: 'Present in person tomorrow',
        subtext: 'Make it an event',
        nextSceneId: 'ch1_morning_pitch',
        effects: {
          stats: { politics: 5, stress: -5 },
        },
      },
    ],
  },

  // Tell Sarah path
  {
    id: 'ch1_sarah_team',
    chapterId: 'chapter_1',
    title: 'Building Trust',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'sarah',
      name: 'Sarah Chen',
      mood: 'happy',
    },
    narrative: `Sarah's eyes widen as you explain what you found.

**"$680 million? Are you sure?"**

She grabs your laptop, scrolling through the property records you pulled up.

**"Holy... okay, this is real. This is actually real."**

She looks at you with new respect.

**"Most associates would have run straight to Chad. Tried to take all the credit."**

She closes the laptop.

**"Here's what we're going to do. I'll help you build the presentation tonight. We go to Chad together tomorrow morning. I back up your analysis, you get the discovery credit."**

She smiles—a real one this time.

**"In this business, having someone who's got your back is worth more than any single deal."**`,
    choices: [
      {
        id: 'ch1_sarah_accept',
        text: 'Accept the partnership',
        subtext: 'Allies are valuable',
        nextSceneId: 'ch1_chapter_end_team',
        effects: {
          relationships: [{ npcId: 'sarah', change: 20, memory: 'We became a team on day one' }],
          stats: { politics: 10 },
          setFlags: ['SARAH_ALLY'],
        },
      },
      {
        id: 'ch1_sarah_solo',
        text: '"I appreciate it, but this is my find"',
        subtext: 'Go it alone',
        nextSceneId: 'ch1_chad_impressed',
        effects: {
          relationships: [{ npcId: 'sarah', change: -10, memory: 'Rejected my help' }],
          stats: { reputation: 5 },
          setFlags: ['SOLO_PLAYER'],
        },
      },
    ],
  },

  // Morning pitch
  {
    id: 'ch1_morning_pitch',
    chapterId: 'chapter_1',
    title: 'The Presentation',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `9 AM. Conference room B. Chad is there with two Partners you haven't met yet.

You've rehearsed this pitch in your head a dozen times.

**"PackFancy appears to be a standard packaging company,"** you begin. **"But there's hidden value the bankers missed."**

You pull up the property map.

**"The Newark facility sits on 40 acres adjacent to the airport expansion zone. Comparable land sales put the value at $15-20 million per acre."**

The Partners lean forward.

**"That's $600-800 million in real estate... for a company asking $120 million."**

Silence.

Then one of the Partners—a silver-haired man with eyes like a shark—actually smiles.

**"Chad,"** he says, **"I think we found a good one."**`,
    nextSceneId: 'ch1_chapter_end',
    choices: [],
  },

  // Chapter End - Standard
  {
    id: 'ch1_chapter_end',
    chapterId: 'chapter_1',
    title: 'End of Day One',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `The city lights glitter below as you finally pack up for the night.

One day in Private Equity. One deal found. One career started.

Tomorrow will bring new challenges. More deals. More politics. More chances to succeed—or fail.

But tonight?

Tonight, you're no longer just another new hire.

You're the one who found the hidden value in PackFancy.

*Chapter 1 Complete.*

*The real game is just beginning.*`,
    choices: [
      {
        id: 'ch1_end_continue',
        text: 'Continue to Chapter 2',
        nextSceneId: 'chapter_complete',
        effects: {
          stats: { reputation: 5, dealcraft: 5 },
          achievement: 'FIRST_DAY_SURVIVOR',
          setFlags: ['CHAPTER_1_COMPLETE'],
        },
      },
    ],
  },

  // Chapter End - Team version
  {
    id: 'ch1_chapter_end_team',
    chapterId: 'chapter_1',
    title: 'End of Day One',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `Sarah raises her coffee cup—the fifth one today.

**"To finding hidden value,"** she says.

You clink your cup against hers.

**"To allies in unexpected places."**

Tomorrow, you'll present to Chad together. You'll face Hunter's jealousy, the partners' scrutiny, and the relentless grind of deal-making.

But tonight, you've learned something they don't teach at business school:

In Private Equity, who you know matters. But who trusts you? That's everything.

*Chapter 1 Complete.*

*You didn't just survive day one. You found your first ally.*`,
    choices: [
      {
        id: 'ch1_end_team_continue',
        text: 'Continue to Chapter 2',
        nextSceneId: 'chapter_complete',
        effects: {
          stats: { reputation: 5, dealcraft: 5, politics: 5 },
          achievement: 'TEAM_PLAYER',
          setFlags: ['CHAPTER_1_COMPLETE'],
        },
      },
    ],
  },

  // Call Miles
  {
    id: 'ch1_call_miles',
    chapterId: 'chapter_1',
    title: 'The Banker\'s Pitch',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'miles',
      name: 'Miles Patterson (Investment Banker)',
      mood: 'happy',
    },
    narrative: `Miles picks up on the first ring. His voice is caffeinated enthusiasm.

**"Sterling Partners! Great to hear from you guys. So excited about PackFancy. Really unique asset. The family's been in the business for three generations..."**

He talks for seven minutes straight. You learn:
- He's been trying to sell this company for 8 months
- Three other funds passed already
- He's "very motivated" to close a deal

When you finally get a word in:

**"Miles, what's the story on the real estate?"**

Brief silence.

**"The... real estate? I mean, they own their facilities. Standard stuff. Why do you ask?"**

*Interesting. Either he doesn't know, or he's hoping you don't figure it out.*`,
    choices: [
      {
        id: 'ch1_miles_dig',
        text: '"Tell me more about the Newark property"',
        subtext: 'Press for details',
        nextSceneId: 'ch1_discovery',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['FOUND_REAL_ESTATE', 'PRESSED_MILES'],
        },
      },
      {
        id: 'ch1_miles_end',
        text: '"I\'ll dig into the CIM. Thanks for the overview."',
        subtext: 'Do your own research',
        nextSceneId: 'ch1_cim_review',
        effects: {
          stats: { politics: 3 },
        },
      },
      {
        id: 'ch1_miles_leak',
        text: '"I\'ll send you our internal valuation model"',
        subtext: 'Share confidential information',
        narratorComment: 'Wait, what? Did you just... oh no. No no no.',
        style: 'risky',
        nextSceneId: 'ch1_catastrophic_leak',
        effects: {
          stats: { ethics: -50, stress: 50 },
          setFlags: ['LEAKED_CONFIDENTIAL_INFO', 'CATASTROPHIC_MISTAKE'],
        },
      },
    ],
  },

  // CATASTROPHIC PATH: Leaked confidential information
  {
    id: 'ch1_catastrophic_leak',
    chapterId: 'chapter_1',
    title: 'Career-Ending Mistake',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `You hear a sharp intake of breath from behind you.

You spin around.

**Chad Sterling** is standing in the doorway. His face is ashen. His hand grips the doorframe like he's preventing himself from lunging at you.

**"Did you just..."** His voice is barely a whisper. **"Did you just offer to send our INTERNAL VALUATION MODEL to an investment banker?"**

The phone is still in your hand. Miles is still on the line. You can hear his awkward cough.

Chad walks slowly to your desk. Takes the phone. Ends the call.

**"Do you have ANY idea what you've just done? That model contains our acquisition strategy, our assumptions, our EDGE. You just offered to hand our playbook to the other team."**

He's shaking now.

**"If Miles tells anyone—if this gets back to his clients—we're finished. I'm finished. And YOU..."**

He can't even finish the sentence.

*You just committed what might be the most catastrophic mistake in Sterling Partners' history.*`,
    choices: [],
    nextSceneId: 'ch1_point_of_no_return',
    requiresAcknowledgment: true,
  },

  // Point of No Return - Quit or Continue
  {
    id: 'ch1_point_of_no_return',
    chapterId: 'chapter_1',
    title: 'Point of No Return',
    type: 'decision',
    atmosphere: 'crisis',
    narrative: `The silence in Chad's office is deafening.

Outside, the bullpen has gone quiet. Word travels fast in this place. You can feel every eye on you through the glass walls.

Chad sits behind his desk, rubbing his temples.

**"Here's where we are,"** he says finally. **"I have two options. One: I call security, have them escort you out, and we pretend this never happened. You sign an NDA, we pay you for today, and you disappear."**

**"Two: You stay. You face the consequences. The partners will want blood. Your career at Sterling—maybe your career in PE entirely—is almost certainly over. But you'll face it like an adult."**

He looks at you with something between contempt and... pity?

**"Door one means you walk away now. Clean break. But you'll always know you ran."**

**"Door two means you stay and face the firing squad. Probably get fired anyway, but at least you won't have quit."**

**"Your choice. You've got ten seconds."**

*This is it. The point of no return.*`,
    choices: [
      {
        id: 'ch1_quit_now',
        text: 'Take the exit. Walk away now.',
        subtext: 'End the game and start over',
        nextSceneId: 'ch1_quit_ending',
        effects: {
          setFlags: ['CHOSE_TO_QUIT'],
        },
      },
      {
        id: 'ch1_face_consequences',
        text: 'Stay and face the consequences',
        subtext: 'See this through to the bitter end',
        narratorComment: 'Brave. Stupid, but brave.',
        nextSceneId: 'ch1_dramatic_ending',
        effects: {
          stats: { ethics: 5 },
          setFlags: ['CHOSE_TO_STAY'],
        },
      },
    ],
  },

  // Quit Ending - Clean restart
  {
    id: 'ch1_quit_ending',
    chapterId: 'chapter_1',
    title: 'Exit Stage Left',
    type: 'outcome',
    atmosphere: 'quiet',
    narrative: `You stand up slowly.

**"I'll take the exit."**

Chad nods, no surprise in his eyes. **"Smart choice. Cowardly, but smart."**

Security arrives within minutes. A woman with a kind face hands you a box for your belongings. There's nothing to pack—you've only been here a day.

The elevator ride down is the longest 47 floors of your life.

As you step onto the street, your phone buzzes. A text from an unknown number:

*"Heard what happened. Industry's small. Good luck with whatever's next. - S"*

Sarah. Even now, she's looking out for you.

The city stretches before you. Somewhere out there, there are other opportunities. Other chances.

Maybe next time, you won't try to give away the company's secrets.

**SIMULATION TERMINATED**

*Your career at Sterling Partners lasted approximately 8 hours.*

*Would you like to try again?*`,
    choices: [
      {
        id: 'ch1_restart',
        text: 'Start Over',
        nextSceneId: 'game_over_restart',
        effects: {
          setFlags: ['GAME_OVER_QUIT'],
        },
      },
    ],
  },

  // Dramatic Ending - Stayed to face consequences
  {
    id: 'ch1_dramatic_ending',
    chapterId: 'chapter_1',
    title: 'The Firing Squad',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `You sit back down.

**"I'll stay."**

Chad stares at you for a long moment. Then, slowly, he picks up his phone.

**"Margaret, clear my afternoon. And get the partners on a call. All of them."**

The next three hours are a blur of conference rooms, raised voices, and legal documents.

The partners are... not pleased. Words like "liability," "termination," and "lawsuit" are thrown around liberally.

But something unexpected happens.

Miles Patterson—the banker—calls Chad directly. He laughs off the whole thing.

**"Look, the kid made a mistake. I didn't hear anything useful anyway. Let's just pretend it never happened. I still want to do this deal."**

It's not absolution. But it's something.

At 11 PM, you're finally released from the conference room. Chad walks you out.

**"You're not fired,"** he says. **"Yet. But you're on probation. Indefinitely. One more mistake and you're done. Understand?"**

You nod.

**"And kid? That took guts, staying. Stupid guts, but guts. Don't waste your second chance."**

*You survived. Barely. But the stain on your reputation may never wash out.*

**CAREER SEVERELY DAMAGED**

*Continue with heavy penalties...*`,
    choices: [
      {
        id: 'ch1_dramatic_continue',
        text: 'Continue (with penalties)',
        nextSceneId: 'ch1_chapter_end_damaged',
        effects: {
          stats: { reputation: -50, stress: 30, ethics: 10 },
          achievement: 'SURVIVED_CATASTROPHE',
          setFlags: ['CHAPTER_1_COMPLETE', 'SURVIVED_CATASTROPHE', 'ON_PROBATION'],
        },
      },
    ],
  },

  // Damaged ending for Chapter 1
  {
    id: 'ch1_chapter_end_damaged',
    chapterId: 'chapter_1',
    title: 'End of Day One (Damaged)',
    type: 'chapter_end',
    atmosphere: 'crisis',
    narrative: `The city lights seem dimmer tonight.

You made it through day one at Sterling Partners. But at what cost?

Your reputation is in tatters. The partners view you with suspicion. Chad has made it clear that you're on thin ice.

But you're still here. You didn't run.

In Private Equity, second chances are rare. Third chances don't exist.

*Chapter 1 Complete.*

*You survived. But the game just got much, much harder.*`,
    choices: [
      {
        id: 'ch1_damaged_continue',
        text: 'Continue to Chapter 2',
        nextSceneId: 'chapter_complete',
        effects: {
          setFlags: ['CHAPTER_1_COMPLETE'],
        },
      },
    ],
  },

  // Game Over / Restart scene
  {
    id: 'game_over_restart',
    chapterId: 'chapter_1',
    title: 'Game Over',
    type: 'outcome',
    atmosphere: 'quiet',
    narrative: `**GAME OVER**

Your journey ends here—for now.

But every ending is a new beginning. Every failure, a lesson learned.

The world of Private Equity is unforgiving. But it rewards those who learn from their mistakes.

*Ready to try again?*`,
    choices: [],
  },

  // Chapter complete transition
  {
    id: 'chapter_complete',
    chapterId: 'chapter_1',
    title: 'Chapter Complete',
    type: 'outcome',
    atmosphere: 'celebration',
    narrative: `**CHAPTER 1 COMPLETE**

*The First Day*

Your choices have shaped your path. The relationships you've built—or burned—will echo through the chapters to come.`,
    choices: [],
    nextSceneId: 'ch2_opening',
  },
];

// ============================================================================
// CHAPTER 2: THE FIRST DEAL
// ============================================================================

const CHAPTER_2_SCENES: Scene[] = [
  // Opening Scene - One Week Later
  {
    id: 'ch2_opening',
    chapterId: 'chapter_2',
    title: 'One Week Later',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `**CHAPTER 2: THE FIRST DEAL**

*One Week Later*

The PackFancy deal is moving fast. Too fast.

Your discovery of the hidden real estate value has caught fire. The partners are excited—a rare sight. Chad has been almost pleasant.

But in PE, excitement means pressure. And pressure has a way of finding the cracks.

Your desk is covered in printouts: property surveys, zoning maps, comparable transactions. The CIM you once dreaded is now dog-eared and coffee-stained.

A new email notification pops up. Subject line: **"URGENT: PackFancy Site Visit Tomorrow - Mandatory"**

*Time to see if your paper analysis holds up in the real world.*`,
    choices: [
      {
        id: 'ch2_opening_prepare',
        text: 'Start preparing your questions',
        subtext: 'Be ready for anything',
        nextSceneId: 'ch2_prepare',
        effects: {
          stats: { dealcraft: 3 },
          setFlags: ['PREPARED_SITE_VISIT'],
        },
      },
      {
        id: 'ch2_opening_ask_sarah',
        text: 'Ask Sarah for site visit tips',
        subtext: 'Lean on experience',
        nextSceneId: 'ch2_sarah_tips',
        requirements: {
          requiredFlags: ['SARAH_INTRO'],
        },
        effects: {
          relationships: [{ npcId: 'sarah', change: 5, memory: 'Asked for my advice again' }],
        },
      },
      {
        id: 'ch2_opening_relax',
        text: 'You know the numbers. Relax.',
        subtext: 'Confidence is key',
        nextSceneId: 'ch2_overconfident',
        effects: {
          stats: { stress: -5 },
          setFlags: ['UNPREPARED_SITE_VISIT'],
        },
      },
    ],
  },

  // Prepare for site visit
  {
    id: 'ch2_prepare',
    chapterId: 'chapter_2',
    title: 'Preparation',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `You spend the evening building a site visit checklist:

**Operations:**
- Current production capacity vs. theoretical max
- Age and condition of equipment
- Maintenance backlog
- Workforce composition and union status

**Real Estate (the prize):**
- Actual condition of the Newark facility
- Any environmental concerns
- Existing lease arrangements
- Proximity to airport expansion zone

**Management:**
- CEO succession readiness
- Key person risk
- Culture assessment

You also print out aerial photos of the Newark site, comparing them to the airport's published expansion plans.

*Preparation is the armor against uncertainty. But even armor has gaps.*`,
    nextSceneId: 'ch2_site_visit_morning',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Sarah's tips
  {
    id: 'ch2_sarah_tips',
    chapterId: 'chapter_2',
    title: 'Advice from Experience',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'sarah',
      name: 'Sarah Chen',
      mood: 'neutral',
    },
    narrative: `Sarah looks up from her model, rubbing her eyes.

**"Site visit tomorrow? Here's what they don't teach you in B-school."**

She ticks off points on her fingers:

**"One: Look at the parking lot. Empty spaces at 2 PM means they're overstaffed or underperforming. Full lot with old cars means loyal, long-term workforce—hard to replace."**

**"Two: Check the bathrooms. Seriously. If they can't keep the bathrooms clean, the equipment maintenance is worse."**

**"Three: Talk to the floor managers, not just the C-suite. Executives lie. Middle managers complain. Complaints are information."**

**"Four: If something feels wrong, it probably is. Trust your gut."**

She pauses.

**"And five: Bring comfortable shoes. These site visits never end when they're supposed to."**`,
    nextSceneId: 'ch2_site_visit_morning',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Overconfident path
  {
    id: 'ch2_overconfident',
    chapterId: 'chapter_2',
    title: 'Confidence or Hubris?',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `You close your laptop early for once.

The numbers are locked in. The real estate angle is solid. Tomorrow is just due diligence theater—checking boxes so the partners can feel good about the investment memo.

You grab a beer with some college friends. Share your "big deal" story. Enjoy their impressed reactions.

At 11 PM, you notice a text from Sarah: *"Don't forget to bring the zoning docs tomorrow. Chad specifically asked for them."*

Zoning docs?

*You didn't print those.*

A frantic hour later, you finally crash, alarm set for 5 AM.

*Confidence is a currency. Overconfidence is a debt.*`,
    nextSceneId: 'ch2_site_visit_morning',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Site visit morning
  {
    id: 'ch2_site_visit_morning',
    chapterId: 'chapter_2',
    title: 'The Drive to Newark',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `6:47 AM. A black SUV idles outside your apartment.

Chad is already in the back seat, eyes on his phone. He doesn't look up as you climb in.

**"Coffee's in the cupholder. Don't spill it on the leather."**

The drive to Newark takes 45 minutes. Chad spends most of it on calls—a different deal, something about a healthcare rollup. You catch fragments: *"...synergies are real but execution risk is high..."*

Finally, he ends the call and looks at you.

**"The Kowalski family has owned PackFancy for 30 years. Old Man Kowalski built it from nothing. His kids want to cash out and disappear to Boca. The old man isn't happy about it."**

He checks his Rolex.

**"Don't be fooled by the cardboard boxes. This is a family drama wrapped in a transaction. Tread carefully."**

The Newark skyline appears through the windshield.`,
    choices: [
      {
        id: 'ch2_morning_ask_family',
        text: '"What do I need to know about the family?"',
        subtext: 'Get the full picture',
        nextSceneId: 'ch2_family_dynamics',
        effects: {
          stats: { politics: 3 },
        },
      },
      {
        id: 'ch2_morning_focus_deal',
        text: '"I\'ll focus on the property and operations"',
        subtext: 'Stick to the numbers',
        nextSceneId: 'ch2_arrival',
        effects: {
          stats: { dealcraft: 2 },
        },
      },
    ],
  },

  // Family dynamics
  {
    id: 'ch2_family_dynamics',
    chapterId: 'chapter_2',
    title: 'The Kowalski Dynasty',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'neutral',
    },
    narrative: `Chad sets down his phone—a rare gesture.

**"Stanley Kowalski. 72. Polish immigrant who started manufacturing boxes in his garage in 1993. Classic American dream story. Built this into a $120 million company."**

**"His wife died three years ago. He's been... different since. Less sharp. More nostalgic. He sees the sale as the end of his legacy."**

**"His son, Tommy Jr., runs operations. Mid-40s, competent but uninspired. His daughter, Monica, is CFO. She's the one pushing the sale—wants her inheritance liquid, not tied up in cardboard."**

**"Tommy Jr. doesn't want to sell but doesn't want to run it alone either. Classic middle-child paralysis."**

He checks his phone again.

**"The old man likes to be listened to. Let him talk. You'll learn more that way."**`,
    nextSceneId: 'ch2_arrival',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Arrival at facility
  {
    id: 'ch2_arrival',
    chapterId: 'chapter_2',
    title: 'First Impressions',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `The PackFancy facility is... not what you expected.

The building is old—1960s industrial—but well-maintained. Fresh paint on the corrugated metal exterior. The parking lot is full, mostly pickup trucks and older sedans.

A sign at the entrance reads: **"PackFancy Inc. - 30 Years of Boxing Excellence. Safety Record: 847 Days Without Incident."**

Inside the lobby, faded photos line the walls. Stanley Kowalski shaking hands with various governors. Newspaper clippings about community awards. A glass case displaying vintage boxes from the company's history.

A woman in her early 50s approaches, hand extended.

**"Sterling Partners? I'm Monica Kowalski, CFO. My father is expecting you. He's... in a mood today, so bear with us."**

Her smile doesn't reach her eyes.`,
    choices: [
      {
        id: 'ch2_arrival_professional',
        text: 'Match her professional energy',
        subtext: 'All business',
        nextSceneId: 'ch2_meet_stanley',
        effects: {
          relationships: [{ npcId: 'monica', change: 5, memory: 'Professional demeanor' }],
        },
      },
      {
        id: 'ch2_arrival_warm',
        text: 'Try to connect personally',
        subtext: 'Build rapport',
        nextSceneId: 'ch2_monica_opens_up',
        effects: {
          relationships: [{ npcId: 'monica', change: 10, memory: 'Showed genuine interest' }],
          setFlags: ['MONICA_RAPPORT'],
        },
      },
    ],
  },

  // Monica opens up
  {
    id: 'ch2_monica_opens_up',
    chapterId: 'chapter_2',
    title: 'Behind the Numbers',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'monica',
      name: 'Monica Kowalski',
      mood: 'worried',
    },
    narrative: `You ask Monica about the company history as she walks you down the hall.

Her guard drops slightly.

**"Thirty years. I've worked here since I was sixteen, counting inventory on summer breaks. Now I'm trying to convince my father to let go of his life's work."**

She stops walking, lowers her voice.

**"Look, between us—Dad's not... he's not who he was. Mom's death hit him hard. He comes in every day, but half the time he's just wandering the floor, talking to machines like they're old friends."**

**"Tommy thinks we should ride it out, let him retire naturally. But the market's changing. Amazon's squeezing us. If we don't sell now, in five years there might be nothing left to sell."**

She glances toward a corner office.

**"Just... be patient with him. He still thinks he can negotiate like it's 1995."**`,
    nextSceneId: 'ch2_meet_stanley',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Meet Stanley
  {
    id: 'ch2_meet_stanley',
    chapterId: 'chapter_2',
    title: 'The Patriarch',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'stanley',
      name: 'Stanley Kowalski',
      mood: 'neutral',
    },
    narrative: `Stanley Kowalski sits behind a desk that's too big for the small corner office. The walls are covered with photos, awards, and a Polish flag.

He's smaller than you expected. Weathered hands. Sharp eyes that haven't dimmed with age.

**"Sterling Partners."**

He pronounces it like a verdict.

**"I've been reading about your firm. Very impressive. You bought that restaurant chain last year. Fired half the staff and sold the real estate."**

He leans forward.

**"My father came to this country with eight dollars and a dream. I built this company with these hands. I know every machine on that floor by name."**

**"So tell me, Mr. Sterling—"** he looks at Chad **"—when you 'optimize' my company, how many of my people lose their jobs?"**

The room goes quiet.`,
    choices: [
      {
        id: 'ch2_stanley_honest',
        text: 'Be honest about PE\'s approach',
        subtext: 'Risky but respectful',
        style: 'ethical',
        nextSceneId: 'ch2_stanley_respects',
        effects: {
          stats: { ethics: 10, reputation: -5 },
          relationships: [{ npcId: 'stanley', change: 15, memory: 'Told me the truth' }],
          setFlags: ['HONEST_WITH_STANLEY'],
        },
      },
      {
        id: 'ch2_stanley_deflect',
        text: 'Defer to Chad',
        subtext: 'Let the boss handle it',
        nextSceneId: 'ch2_chad_handles_it',
        effects: {
          stats: { stress: -5 },
        },
      },
      {
        id: 'ch2_stanley_promise',
        text: '"We\'ll take care of your people"',
        subtext: 'Tell him what he wants to hear',
        style: 'unethical',
        nextSceneId: 'ch2_stanley_suspicious',
        effects: {
          stats: { ethics: -10, politics: 5 },
          relationships: [{ npcId: 'stanley', change: -10, memory: 'Empty promises' }],
          setFlags: ['PROMISED_STANLEY'],
        },
      },
      {
        id: 'ch2_stanley_insult',
        text: '"Your workers are line items. That\'s how this works."',
        subtext: 'Be brutally honest',
        narratorComment: 'Oh no. Oh no no no. Did you really just say that to a 72-year-old Polish immigrant in front of his family business?',
        style: 'risky',
        nextSceneId: 'ch2_catastrophic_insult',
        effects: {
          stats: { ethics: -30, stress: 40 },
          relationships: [
            { npcId: 'stanley', change: -100, memory: 'Called my workers line items' },
            { npcId: 'chad', change: -30, memory: 'Destroyed the PackFancy deal' },
          ],
          setFlags: ['INSULTED_STANLEY', 'CATASTROPHIC_MISTAKE'],
        },
      },
    ],
  },

  // CATASTROPHIC PATH: Insulted Stanley
  {
    id: 'ch2_catastrophic_insult',
    chapterId: 'chapter_2',
    title: 'The Bridge Burns',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `The room goes dead silent.

Stanley Kowalski's face transforms. The weathered lines deepen. His eyes—those sharp, immigrant survivor's eyes—go cold.

**"Line items."**

He stands. Slowly. Like a glacier calving.

**"My Maria—who has been with me thirty years—is a line item. My Eddie—who I taught to run the corrugating machine—is a line item. My family..."**

He gestures at Monica and Tommy Jr., who are staring at you with open horror.

**"...are LINE ITEMS."**

He turns to Chad.

**"Mr. Sterling. I have entertained many buyers. Investment banks, private equity, strategic acquirers. Some were smart. Some were foolish. But NONE of them have ever insulted me in my own building."**

He points at you.

**"Get this person out of my sight. And if you want to continue this conversation, you will call me in three months. Maybe six. Maybe never."**

Chad's face is ashen. The deal is dead. Killed by a single sentence.

*You just cost Sterling Partners the deal of the decade.*`,
    choices: [],
    nextSceneId: 'ch2_point_of_no_return',
    requiresAcknowledgment: true,
  },

  // Chapter 2 Point of No Return
  {
    id: 'ch2_point_of_no_return',
    chapterId: 'chapter_2',
    title: 'The Ride Back',
    type: 'decision',
    atmosphere: 'crisis',
    narrative: `The drive back to Manhattan is the longest 45 minutes of your life.

Chad doesn't speak. Doesn't look at you. His knuckles are white on his phone.

When you finally hit traffic near the Lincoln Tunnel, he turns.

**"I just got off the phone with the senior partners."** His voice is flat. Dead. **"They want you gone. Immediately. No severance. No reference. No NDA—they want everyone to know what you did."**

He pauses.

**"But I told them to wait. Because I want to understand something first."**

He leans in close.

**"You had everything. A good school, a good opportunity, a deal that could have made your career. And you threw it all away because you couldn't keep your mouth shut."**

**"So here's your choice. You can walk into that office tomorrow and resign. Clean exit. I'll say you weren't a good fit. Happens all the time."**

**"Or you can let them fire you. In which case, I will make sure everyone in this industry knows exactly what you did. Your career in finance will be over. Permanently."**

**"Which is it?"**

*This is the end. One way or another.*`,
    choices: [
      {
        id: 'ch2_resign_quietly',
        text: 'Resign quietly',
        subtext: 'Accept defeat and start over',
        nextSceneId: 'ch2_resign_ending',
        effects: {
          setFlags: ['CHOSE_TO_RESIGN'],
        },
      },
      {
        id: 'ch2_get_fired',
        text: 'Let them fire me. I\'ll take my chances.',
        subtext: 'Face the consequences',
        narratorComment: 'The absolute audacity. I respect it. Sort of.',
        nextSceneId: 'ch2_fired_ending',
        effects: {
          stats: { ethics: 10 },
          setFlags: ['CHOSE_TO_GET_FIRED'],
        },
      },
    ],
  },

  // Chapter 2 Resign Ending
  {
    id: 'ch2_resign_ending',
    chapterId: 'chapter_2',
    title: 'The Quiet Exit',
    type: 'outcome',
    atmosphere: 'quiet',
    narrative: `The next morning, you walk into HR.

The resignation letter is brief: *"I have decided to pursue other opportunities."*

The HR manager—a woman who has clearly done this before—nods sympathetically.

**"It happens more than you'd think. The PE world isn't for everyone."**

You clean out your desk. It takes three minutes.

Hunter Sterling watches you leave with barely concealed glee. **"See you never,"** he mouths through the glass.

But as you wait for the elevator, Sarah Chen appears.

**"I heard,"** she says quietly. **"For what it's worth... that took guts. Walking away instead of getting dragged out."**

She hands you a card.

**"My personal number. When you land somewhere—and you will—call me. The industry is smaller than you think, but it's also got a short memory."**

The elevator doors open.

**"Good luck. And maybe next time... read the room before you speak."**

**SIMULATION TERMINATED**

*Your career at Sterling Partners lasted approximately 10 days.*

*Would you like to try again?*`,
    choices: [
      {
        id: 'ch2_restart',
        text: 'Start Over',
        nextSceneId: 'game_over_restart',
        effects: {
          setFlags: ['GAME_OVER_RESIGNED'],
        },
      },
    ],
  },

  // Chapter 2 Fired Ending
  {
    id: 'ch2_fired_ending',
    chapterId: 'chapter_2',
    title: 'The Spectacle',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `You stand your ground.

**"Fire me. Let them all see."**

Chad's expression flickers—surprise? Respect? Disgust? All three?

**"Your funeral."**

The next morning is theatrical. Security meets you at the elevator. The partners watch from their corner offices as you're escorted to HR.

The termination letter is three pages long. Words like "gross misconduct" and "material breach" jump out.

**"Sign here,"** the HR director says. **"And here. And here."**

You sign.

As security walks you out—past the bullpen, past Hunter's smirking face, past Sarah's sympathetic eyes—something strange happens.

One of the analysts starts slow-clapping.

Then another.

Then the whole bullpen is applauding. Not mockingly. *Genuinely.*

Because everyone in that room has wanted to tell a client the truth. And you actually did it.

The senior partner—the shark-eyed one—catches your eye as you pass.

He nods. Once. Almost imperceptibly.

*You're blacklisted from PE. But you've become a legend.*

**SIMULATION TERMINATED**

*Your career at Sterling Partners lasted 10 days.*
*But the story will last forever.*

*Would you like to try again?*`,
    choices: [
      {
        id: 'ch2_restart_fired',
        text: 'Start Over',
        nextSceneId: 'game_over_restart',
        effects: {
          achievement: 'LEGENDARY_FAILURE',
          setFlags: ['GAME_OVER_FIRED'],
        },
      },
    ],
  },

  // Stanley respects honesty
  {
    id: 'ch2_stanley_respects',
    chapterId: 'chapter_2',
    title: 'Unexpected Respect',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'stanley',
      name: 'Stanley Kowalski',
      mood: 'happy',
    },
    narrative: `You take a breath.

**"Mr. Kowalski, I'd be lying if I said PE firms never cut jobs. That's sometimes part of how we create value. But the real opportunity here isn't headcount—it's the real estate you're sitting on."**

Stanley's eyebrows rise.

**"This facility is adjacent to the airport expansion zone. Your land could be worth more than the entire company. We're not looking to gut your operations—we're looking to unlock value you might not even know you have."**

The old man studies you for a long moment.

Then he laughs. A real laugh, deep and warm.

**"Finally! Someone who doesn't treat me like I'm senile."**

He stands, extends a weathered hand.

**"I like you, kid. You've got guts. Not many people look a man in the eye and tell him the truth anymore."**

**"Come on. Let me show you my floor. And that 'valuable real estate' you're so excited about."**`,
    nextSceneId: 'ch2_floor_tour',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Chad handles it
  {
    id: 'ch2_chad_handles_it',
    chapterId: 'chapter_2',
    title: 'The Senior Touch',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'chad',
      name: 'Chad Sterling',
      mood: 'neutral',
    },
    narrative: `Chad leans back, unfazed.

**"Mr. Kowalski, I appreciate your directness. Here's ours: We're not in the business of buying companies to destroy them. Destroyed companies don't make money."**

**"What we do is identify unrealized potential. Sometimes that means changes. But our best outcomes come from companies that grow, not shrink."**

**"And frankly? Your real estate position here is more valuable than your box business. That's not an insult—that's an opportunity."**

Stanley's expression doesn't change.

**"Show me the floor,"** he says finally. **"Then we'll talk about 'opportunities.'"**

*Chad's smooth. But you notice Stanley glancing at you as you leave. You could have spoken up. You didn't.*`,
    nextSceneId: 'ch2_floor_tour',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Stanley suspicious
  {
    id: 'ch2_stanley_suspicious',
    chapterId: 'chapter_2',
    title: 'The Old Man\'s Doubt',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'stanley',
      name: 'Stanley Kowalski',
      mood: 'angry',
    },
    narrative: `Stanley's eyes narrow.

**"Take care of my people. That's what everyone says. The last group who said that? A consulting firm. 'We'll take care of your people.' Six months later, they recommended cutting the pension."**

He stands, towering despite his age.

**"I may be old, but I'm not stupid. Don't insult me with platitudes."**

The temperature in the room drops. Monica steps forward.

**"Dad, let's just show them the facility. They came all this way—"**

**"Fine."** Stanley waves dismissively. **"Let's see how much you like our 'valuable real estate' up close."**

*Not the best start.*`,
    nextSceneId: 'ch2_floor_tour',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Floor tour
  {
    id: 'ch2_floor_tour',
    chapterId: 'chapter_2',
    title: 'The Factory Floor',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `The manufacturing floor is surprisingly modern.

Corrugating machines hum with precision. Workers in safety gear move with practiced efficiency. Quality control stations dot the production line.

Stanley transforms on the floor. His shuffle becomes a stride. He greets workers by name, asks about their kids, their weekends.

**"Maria! How's your grandson? Still playing soccer?"**

**"Eddie! That back of yours better? Don't let me catch you lifting anything heavy."**

This isn't just a factory to him. It's a family.

But you notice things too. Some machines look ancient. Maintenance logs on the wall show increasing repair frequency. A section of the floor is roped off—old equipment waiting for replacement that never came.

The real estate angle is solid. But the operations might need more work than the CIM suggested.`,
    choices: [
      {
        id: 'ch2_floor_ask_machines',
        text: 'Ask about the aging equipment',
        subtext: 'Get the full picture',
        nextSceneId: 'ch2_equipment_truth',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['FOUND_CAPEX_ISSUE'],
        },
      },
      {
        id: 'ch2_floor_focus_workers',
        text: 'Talk to the floor workers',
        subtext: 'Sarah\'s advice',
        nextSceneId: 'ch2_worker_intel',
        requirements: {
          requiredFlags: ['SARAH_INTRO'],
        },
        effects: {
          stats: { politics: 3 },
          setFlags: ['WORKER_INTEL'],
        },
      },
      {
        id: 'ch2_floor_check_property',
        text: 'Step outside to see the property',
        subtext: 'The main prize',
        nextSceneId: 'ch2_property_reveal',
        effects: {
          setFlags: ['SAW_PROPERTY_FIRST'],
        },
      },
    ],
  },

  // Equipment truth
  {
    id: 'ch2_equipment_truth',
    chapterId: 'chapter_2',
    title: 'Hidden Liabilities',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'tommy',
      name: 'Tommy Kowalski Jr.',
      mood: 'worried',
    },
    narrative: `Tommy Kowalski Jr. intercepts you near the roped-off section. Mid-40s, tired eyes, coffee-stained shirt.

**"You're looking at the graveyard,"** he says quietly. **"Dad doesn't like to talk about it."**

He glances toward his father, who's showing Chad the quality control station.

**"We've got about $8 million in deferred capex. Some of these machines are held together with prayer and duct tape. The CIM didn't mention that, did it?"**

He shakes his head.

**"Monica handled the CIM. She... simplified some things. Thought it would help the valuation."**

**"I've been begging Dad for years to reinvest. But after Mom died, he just... stopped caring about the future."**

*$8 million in deferred capex. That changes the math.*`,
    nextSceneId: 'ch2_property_reveal',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Worker intel
  {
    id: 'ch2_worker_intel',
    chapterId: 'chapter_2',
    title: 'Shop Floor Wisdom',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'floor_worker',
      name: 'Eddie (Floor Manager)',
      mood: 'neutral',
    },
    narrative: `You find Eddie, the floor manager Stanley mentioned, during a brief break.

**"You're the money guys, huh?"** He doesn't seem hostile, just tired. **"Wondering how we feel about being sold?"**

He takes a sip of coffee.

**"Honestly? Most of us have been here 15, 20 years. We're too old to start over, too young to retire. Whatever happens, we're stuck."**

**"Stanley treats us right. Pays fair, respects the union, never asks us to cut corners on safety. But..."**

He hesitates.

**"The kids—Tommy and Monica—they're not like him. Monica especially. She's been 'streamlining' things for years. Pushed out some of the older guys. Called it 'efficiency.'"**

**"If she gets control after a sale? That 'safety record' on the sign out front won't last long."**

*Interesting intel. Monica might not be just the seller—she might be the problem.*`,
    nextSceneId: 'ch2_property_reveal',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Property reveal
  {
    id: 'ch2_property_reveal',
    chapterId: 'chapter_2',
    title: 'The Real Prize',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `You step outside through a loading dock.

And there it is.

Forty acres of industrial land stretching toward the Newark Airport fence line. In the distance, you can see the construction cranes of the expansion project. A new runway being built that will come within half a mile of where you're standing.

The zoning map you studied was accurate, but seeing it in person makes it real.

This isn't just valuable real estate. This is a goldmine waiting to be dug.

A plane takes off in the distance, banking over the property. You imagine what this land will be worth when the airport needs to expand further. Cargo facilities. Logistics hubs. High-value commercial real estate.

$120 million for the whole company.

Potentially $600-800 million for just the land.

*The deal of a decade. If you can close it.*`,
    nextSceneId: 'ch2_decision_point',
    choices: [],
    requiresAcknowledgment: true,
  },

  // Decision point
  {
    id: 'ch2_decision_point',
    chapterId: 'chapter_2',
    title: 'The Real Question',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `On the drive back to Manhattan, Chad is silent.

Finally, he speaks.

**"What do you think?"**

It's the first time he's asked your opinion directly. On anything.

You think about everything you saw:
- Stanley's love for his workers and his failing grip on reality
- Monica's eagerness to sell and the suspiciously clean CIM
- Tommy's revelation about $8 million in deferred capex
- The workers' fear of what comes after
- And that land. That impossibly valuable land.

**"I'm asking because the partners want your recommendation,"** Chad continues. **"You found this deal. You own it. What do we do?"**

*This is it. Your first real decision.*`,
    choices: [
      {
        id: 'ch2_decision_aggressive',
        text: '"Buy it. Separate the land, flip it, move on."',
        subtext: 'Maximum returns',
        style: 'unethical',
        nextSceneId: 'ch2_aggressive_path',
        effects: {
          stats: { reputation: 10, ethics: -15, stress: 10 },
          setFlags: ['AGGRESSIVE_RECOMMENDATION', 'CHOSE_PROFIT'],
        },
      },
      {
        id: 'ch2_decision_balanced',
        text: '"Buy it, but factor in the capex. Realistic valuation."',
        subtext: 'Smart deal-making',
        nextSceneId: 'ch2_balanced_path',
        effects: {
          stats: { dealcraft: 10, ethics: 5 },
          setFlags: ['BALANCED_RECOMMENDATION'],
        },
      },
      {
        id: 'ch2_decision_ethical',
        text: '"We need to protect the workers. Structure it right."',
        subtext: 'Do well by doing good',
        style: 'ethical',
        nextSceneId: 'ch2_ethical_path',
        effects: {
          stats: { ethics: 15, reputation: -5 },
          relationships: [{ npcId: 'chad', change: -5, memory: 'Got soft on the PackFancy deal' }],
          setFlags: ['ETHICAL_RECOMMENDATION', 'CHOSE_PEOPLE'],
        },
      },
      {
        id: 'ch2_decision_pass',
        text: '"I have concerns. Maybe we should pass."',
        subtext: 'Walk away',
        style: 'safe',
        nextSceneId: 'ch2_pass_path',
        effects: {
          stats: { stress: -15, reputation: -10 },
          relationships: [{ npcId: 'chad', change: -15, memory: 'Got cold feet on the first deal' }],
          setFlags: ['PASSED_ON_DEAL'],
        },
      },
    ],
  },

  // Chapter 2 ending - Aggressive path
  {
    id: 'ch2_aggressive_path',
    chapterId: 'chapter_2',
    title: 'The Hard Path',
    type: 'chapter_end',
    atmosphere: 'crisis',
    narrative: `Chad nods slowly.

**"That's the play. Acquire, separate the real estate, sell the operations to whoever wants them. Or close it down."**

He pulls out his phone.

**"I'll tell the partners we're moving forward. Aggressive bid, fast close."**

As the city lights appear on the horizon, you feel a strange mix of triumph and unease.

Stanley's face flashes in your mind. The workers. The 847-day safety record.

But this is Private Equity. Value creation isn't always pretty.

*Chapter 2 Complete.*

*You've made your first real call. The consequences are still to come.*`,
    choices: [
      {
        id: 'ch2_aggressive_continue',
        text: 'Continue to Chapter 3',
        nextSceneId: 'ch2_complete',
        effects: {
          stats: { money: 5000 },
          achievement: 'FIRST_RECOMMENDATION',
          setFlags: ['CHAPTER_2_COMPLETE'],
        },
      },
    ],
  },

  // Chapter 2 ending - Balanced path
  {
    id: 'ch2_balanced_path',
    chapterId: 'chapter_2',
    title: 'The Smart Path',
    type: 'chapter_end',
    atmosphere: 'office',
    narrative: `Chad raises an eyebrow.

**"Factor in the capex? That means a lower bid. We might lose to a more aggressive buyer."**

**"But,"** he admits, **"it also means we don't overpay for a company that needs $8 million in equipment. And we have leverage in negotiations when Monica tries to hide the truth."**

He considers.

**"Alright. Revised model. Adjusted offer. Let's see how they respond."**

As Manhattan appears through the windshield, you feel satisfied. You found the angle—all of them. The opportunity and the risk.

*This is what dealmaking feels like.*

*Chapter 2 Complete.*

*You've shown you can find value and avoid traps. The game is just beginning.*`,
    choices: [
      {
        id: 'ch2_balanced_continue',
        text: 'Continue to Chapter 3',
        nextSceneId: 'ch2_complete',
        effects: {
          stats: { money: 3000 },
          achievement: 'BALANCED_DEALER',
          setFlags: ['CHAPTER_2_COMPLETE'],
        },
      },
    ],
  },

  // Chapter 2 ending - Ethical path
  {
    id: 'ch2_ethical_path',
    chapterId: 'chapter_2',
    title: 'The Right Path',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `Chad is quiet for a long moment.

**"Protect the workers."**

He says it like he's tasting something unfamiliar.

**"You know that's not how this usually works, right? We buy, we optimize, we exit. Workers are line items."**

**"But..."** He sighs. **"The old man reminded me of my grandfather. Built his own business. Same stubborn pride."**

**"Fine. We structure it with employment guarantees. Limited layoffs. Transition support. It'll cost us some returns, but..."**

He shrugs.

**"Maybe you're onto something. ESG is hot right now. 'Responsible PE' could be a selling point."**

*You chose a harder path. But maybe the right one.*

*Chapter 2 Complete.*

*Ethics and profit don't always conflict. Sometimes they create unexpected opportunities.*`,
    choices: [
      {
        id: 'ch2_ethical_continue',
        text: 'Continue to Chapter 3',
        nextSceneId: 'ch2_complete',
        effects: {
          stats: { money: 2000 },
          achievement: 'ETHICAL_DEALER',
          setFlags: ['CHAPTER_2_COMPLETE'],
        },
      },
    ],
  },

  // Chapter 2 ending - Pass path
  {
    id: 'ch2_pass_path',
    chapterId: 'chapter_2',
    title: 'The Cautious Path',
    type: 'chapter_end',
    atmosphere: 'crisis',
    narrative: `Chad's expression hardens.

**"Pass? After you brought us this deal? After the partners are already excited?"**

He shakes his head.

**"Kid, this is Private Equity. Not every deal is perfect. If you wait for perfect, you wait forever."**

**"But..."** He takes a breath. **"...you're the one who did the work. If your gut says walk, I'll back you up. Once."**

**"Just know that next time, 'concerns' won't cut it. You need conviction. Either in or out."**

The rest of the drive is silent.

*You chose caution over commitment. It saved you from risk—but did it cost you opportunity?*

*Chapter 2 Complete.*

*Sometimes the best deals are the ones you don't make. Sometimes you're just afraid.*`,
    choices: [
      {
        id: 'ch2_pass_continue',
        text: 'Continue to Chapter 3',
        nextSceneId: 'ch2_complete',
        effects: {
          stats: { money: 1000 },
          achievement: 'CAUTIOUS_PLAYER',
          setFlags: ['CHAPTER_2_COMPLETE'],
        },
      },
    ],
  },

  // Chapter complete transition
  {
    id: 'ch2_complete',
    chapterId: 'chapter_2',
    title: 'Chapter Complete',
    type: 'chapter_end',
    atmosphere: 'celebration',
    requiresAcknowledgment: true,
    narrative: `**CHAPTER 2 COMPLETE**

*The First Deal*

Your first real recommendation is on the record. The consequences—good or bad—will unfold in the chapters to come.

The Kowalski family is just the beginning. In Private Equity, every deal creates ripples. And sometimes, waves.`,
    choices: [],
    nextSceneId: 'ch3_opening',
  },
];

// ============================================================================
// CHAPTER 3: THE NEGOTIATION
// ============================================================================

const CHAPTER_3_SCENES: Scene[] = [
  // Opening Scene - The Table
  {
    id: 'ch3_opening',
    chapterId: 'chapter_3',
    title: 'The Table',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `**CHAPTER 3: THE NEGOTIATION**

*Three Weeks Later*

The PackFancy conference room feels smaller than you remember. Maybe it's the tension.

On one side: Sterling Partners. Chad sits at the head, flanked by you and the legal team. Across the table: the Kowalski family in force—Stanley with his weathered hands folded, Monica shuffling papers nervously, and Tommy Jr. glaring at everyone.

Between you all: a term sheet that could make or break careers.

**"Let's talk numbers,"** Chad begins. **"We've prepared an offer that we believe reflects fair value."**

Monica's pen stops moving. Stanley's eyes narrow.

*This is where it gets real.*`,
    choices: [
      {
        id: 'ch3_opening_aggressive',
        text: 'Push hard from the start',
        subtext: 'Establish dominance early',
        nextSceneId: 'ch3_aggressive_open',
        requirements: {
          requiredFlags: ['CHAPTER_2_COMPLETE'],
        },
        effects: {
          stats: { stress: 10 },
          setFlags: ['AGGRESSIVE_NEGOTIATOR'],
        },
      },
      {
        id: 'ch3_opening_rapport',
        text: 'Build rapport first',
        subtext: 'Relationships matter',
        nextSceneId: 'ch3_rapport_open',
        effects: {
          stats: { politics: 5 },
          setFlags: ['DIPLOMATIC_APPROACH'],
        },
      },
      {
        id: 'ch3_opening_observe',
        text: 'Let Chad lead, observe carefully',
        subtext: 'Watch and learn',
        nextSceneId: 'ch3_observe_open',
        effects: {
          stats: { dealcraft: 3 },
          setFlags: ['CAREFUL_OBSERVER'],
        },
      },
    ],
  },

  // Aggressive opening
  {
    id: 'ch3_aggressive_open',
    chapterId: 'chapter_3',
    title: 'Power Play',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `Before Chad can continue, you slide the valuation summary across the table.

**"The equipment maintenance backlog alone represents $8 million in deferred capex,"** you say. **"Your financials didn't disclose that."**

The room goes cold.

Monica's face drains of color. Tommy Jr. starts to stand, but Stanley's hand stops him.

**"Kid's got sharp eyes,"** Stanley says slowly. **"Too sharp, maybe."**

Chad shoots you a warning look. You've shown your cards early—maybe too early.`,
    choices: [
      {
        id: 'ch3_double_down',
        text: 'Double down on the pressure',
        subtext: 'They\'re off balance—keep pushing',
        nextSceneId: 'ch3_pressure_point',
        effects: {
          stats: { reputation: -5, dealcraft: 5 },
          relationships: [{ npcId: 'stanley', change: -20, memory: 'Publicly embarrassed us' }],
        },
      },
      {
        id: 'ch3_soften',
        text: 'Soften the approach',
        subtext: 'You made your point',
        nextSceneId: 'ch3_soften_after',
        effects: {
          stats: { politics: 3 },
          relationships: [{ npcId: 'monica', change: -10, memory: 'Called out our capex issue' }],
        },
      },
    ],
  },

  // Rapport opening
  {
    id: 'ch3_rapport_open',
    chapterId: 'chapter_3',
    title: 'Common Ground',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `**"Mr. Kowalski,"** you begin, **"before we get to numbers, I want to say—what you've built here is remarkable. Three generations of family ownership. That's rare."**

Stanley's posture shifts almost imperceptibly. Less defensive.

**"Not many young folks appreciate that anymore,"** he says. **"Everyone wants the quick buck."**

**"We want to honor what you've built,"** you continue. **"This deal needs to work for everyone."**

Monica exchanges a glance with her father. Tommy Jr. still looks skeptical, but the tension has eased.

Chad nods approvingly. *Nice move.*`,
    choices: [
      {
        id: 'ch3_rapport_transition',
        text: 'Transition to business',
        subtext: 'Time to talk numbers',
        nextSceneId: 'ch3_business_transition',
        effects: {
          relationships: [{ npcId: 'stanley', change: 15, memory: 'Showed respect for our legacy' }],
          stats: { politics: 5 },
        },
      },
      {
        id: 'ch3_rapport_more',
        text: 'Keep building the relationship',
        subtext: 'Trust takes time',
        nextSceneId: 'ch3_deeper_rapport',
        effects: {
          relationships: [{ npcId: 'stanley', change: 25, memory: 'Genuinely seemed to care' }],
          stats: { stress: 5 },
        },
      },
    ],
  },

  // Observe opening
  {
    id: 'ch3_observe_open',
    chapterId: 'chapter_3',
    title: 'The Watcher',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `You stay quiet, watching. Chad presents the offer. The legal team drones about structure.

But you're focused on the family.

Stanley: Checks his watch twice. Impatient or nervous?

Monica: Won't make eye contact with her father. Something there.

Tommy Jr.: Keeps clenching his jaw. He wants to fight.

*There are cracks in this family. The question is whether to exploit them or bridge them.*`,
    choices: [
      {
        id: 'ch3_exploit_dynamics',
        text: 'Note the tensions for later',
        subtext: 'Knowledge is leverage',
        nextSceneId: 'ch3_leverage_noted',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['FAMILY_TENSIONS_NOTED'],
        },
      },
      {
        id: 'ch3_bridge_dynamics',
        text: 'Try to ease the family tension',
        subtext: 'A unified seller is easier to work with',
        nextSceneId: 'ch3_bridge_attempt',
        effects: {
          stats: { ethics: 5 },
          setFlags: ['TRIED_TO_HELP_FAMILY'],
        },
      },
    ],
  },

  // Pressure point scene
  {
    id: 'ch3_pressure_point',
    chapterId: 'chapter_3',
    title: 'Breaking Point',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'angry',
    },
    narrative: `**"You know what?"** Tommy slams his hand on the table. **"I've had enough of this."**

He's on his feet now, pointing at you.

**"You come into our company, find one thing wrong, and think you can shake us down? My grandfather built this from nothing. My father kept it alive through three recessions."**

**"Tommy—"** Monica tries.

**"No! These Wall Street vultures don't get to pick our bones!"**

Stanley stands slowly. The room holds its breath.

**"Sit down, son."** His voice is quiet but iron. **"We're not done here."**

Tommy sits. But the damage is done. The negotiation just got personal.`,
    choices: [
      {
        id: 'ch3_apologize',
        text: 'Apologize for the aggressive approach',
        subtext: 'De-escalate',
        nextSceneId: 'ch3_de_escalate',
        effects: {
          stats: { ethics: 5 },
          relationships: [{ npcId: 'tommy', change: 10, memory: 'At least apologized' }],
        },
      },
      {
        id: 'ch3_stay_firm',
        text: 'Hold your ground',
        subtext: 'Don\'t show weakness',
        nextSceneId: 'ch3_standoff',
        effects: {
          stats: { reputation: 5 },
          relationships: [{ npcId: 'stanley', change: -15, memory: 'Wouldn\'t back down' }],
        },
      },
    ],
  },

  // Soften after aggression
  {
    id: 'ch3_soften_after',
    chapterId: 'chapter_3',
    title: 'Course Correction',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `**"I apologize if that came across harshly,"** you say. **"We're not here to play gotcha. We just want a deal that works for everyone—and that requires honest numbers."**

Stanley studies you for a long moment.

**"Fair enough,"** he finally says. **"Monica, let's talk about that maintenance schedule."**

The tension drops by half. Not gone, but manageable.

Chad leans back, satisfied. You caught yourself before going too far.`,
    choices: [
      {
        id: 'ch3_proceed_discussion',
        text: 'Continue with constructive discussion',
        nextSceneId: 'ch3_business_transition',
        effects: {
          stats: { politics: 5 },
          relationships: [{ npcId: 'monica', change: 5, memory: 'Walked back the attack' }],
        },
      },
    ],
  },

  // Business transition (convergence point)
  {
    id: 'ch3_business_transition',
    chapterId: 'chapter_3',
    title: 'Down to Business',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The conversation shifts to specifics.

Purchase price. Earnout structure. Employment guarantees. Real estate carve-out.

Each item is a battlefield. Each concession, a small victory or defeat.

After two hours, the shape of a deal begins to emerge:

**Offer: $85 million**
- $70M cash at close
- $15M earnout over 3 years
- Stanley stays as "Chairman Emeritus" (advisory role)
- 18-month employment guarantee for key staff

Monica is taking furious notes. Tommy looks sick. Stanley's face is unreadable.

**"We need to discuss this privately,"** Stanley says. **"Can we reconvene tomorrow?"**`,
    choices: [
      {
        id: 'ch3_give_time',
        text: 'Agree to reconvene tomorrow',
        subtext: 'Let them process',
        nextSceneId: 'ch3_recess',
        effects: {
          stats: { politics: 3 },
        },
      },
      {
        id: 'ch3_push_decision',
        text: 'Push for a decision today',
        subtext: 'Time pressure works',
        nextSceneId: 'ch3_push_close',
        effects: {
          stats: { stress: 10 },
          setFlags: ['PUSHED_FOR_SPEED'],
        },
      },
    ],
  },

  // Deeper rapport path
  {
    id: 'ch3_deeper_rapport',
    chapterId: 'chapter_3',
    title: 'Stories',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'stanley',
      name: 'Stanley Kowalski',
      mood: 'neutral',
    },
    narrative: `Stanley starts talking about the old days. 1975. His father's small shop in Jersey City. The move to Newark. The growth years.

**"We almost went under in '08,"** he admits. **"Banks wouldn't touch us. Had to mortgage my house. Monica's college fund."**

Monica looks down. You hadn't known that.

**"But we made it. Every recession, every crisis, we survived. Because this family doesn't quit."**

His eyes find yours.

**"So you understand—this isn't just business for us. This is our blood."**

The room is silent. Even Chad looks moved.`,
    choices: [
      {
        id: 'ch3_honor_legacy',
        text: '"We\'ll honor that legacy."',
        subtext: 'Make a promise',
        nextSceneId: 'ch3_promise_made',
        effects: {
          stats: { ethics: 10 },
          relationships: [{ npcId: 'stanley', change: 20, memory: 'Promised to honor our legacy' }],
          setFlags: ['LEGACY_PROMISE'],
        },
      },
      {
        id: 'ch3_business_reality',
        text: '"We have to be realistic about what we can guarantee."',
        subtext: 'Don\'t overpromise',
        nextSceneId: 'ch3_honest_limits',
        effects: {
          stats: { dealcraft: 5 },
          relationships: [{ npcId: 'stanley', change: -5, memory: 'Wouldn\'t commit to our legacy' }],
        },
      },
    ],
  },

  // Leverage noted path
  {
    id: 'ch3_leverage_noted',
    chapterId: 'chapter_3',
    title: 'Information Gathering',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `You file away what you've seen:

**Stanley:** Ready to sell, but wants his legacy protected. Pride is his weakness.

**Monica:** Hiding something about the financials. Defensive when challenged. Might crack under pressure.

**Tommy Jr.:** Emotional. Against the sale. Could be an ally—or a saboteur.

*In negotiations, information is ammunition. You're building an arsenal.*

The formal presentation continues, but you're already thinking three moves ahead.`,
    choices: [
      {
        id: 'ch3_exploit_tommy',
        text: 'Tommy seems like the weak link',
        subtext: 'He might reveal useful information',
        nextSceneId: 'ch3_tommy_approach',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['TARGETING_TOMMY'],
        },
      },
      {
        id: 'ch3_exploit_monica',
        text: 'Monica knows more than she\'s saying',
        subtext: 'The CFO always knows the bodies',
        nextSceneId: 'ch3_monica_approach',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['TARGETING_MONICA'],
        },
      },
    ],
  },

  // Bridge attempt path
  {
    id: 'ch3_bridge_attempt',
    chapterId: 'chapter_3',
    title: 'The Mediator',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `During a break, you catch Tommy alone by the coffee machine.

**"Look,"** you say quietly, **"I know this is hard. Selling your family business feels like losing something."**

He stares at you, surprised.

**"What do you know about it?"**

**"Nothing. But I can see you care. That matters."**

His guard drops slightly.

**"Dad thinks this is the only way. Monica's been pushing for it. I just..."** He shakes his head. **"Thirty years of my life, you know?"**

*You've created an opening. What you do with it is up to you.*`,
    choices: [
      {
        id: 'ch3_genuine_help',
        text: 'Genuinely try to address his concerns',
        subtext: 'Maybe there\'s a way to help',
        nextSceneId: 'ch3_helping_tommy',
        effects: {
          stats: { ethics: 10 },
          relationships: [{ npcId: 'tommy', change: 25, memory: 'Actually listened to me' }],
        },
      },
      {
        id: 'ch3_tactical_sympathy',
        text: 'Use the opening strategically',
        subtext: 'Information is power',
        nextSceneId: 'ch3_tommy_intel',
        effects: {
          stats: { dealcraft: 5 },
          relationships: [{ npcId: 'tommy', change: 10, memory: 'Seemed sympathetic' }],
        },
      },
    ],
  },

  // De-escalate scene
  {
    id: 'ch3_de_escalate',
    chapterId: 'chapter_3',
    title: 'Walking It Back',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'worried',
    },
    narrative: `**"I apologize. That was out of line."**

You look directly at Tommy.

**"You're right to defend your family's legacy. I should have raised the capex issue more diplomatically."**

Tommy's jaw unclenches. Just slightly.

Stanley nods slowly.

**"Takes a big person to admit a mistake. Let's start over."**

Chad exhales with relief. The negotiation continues—on much better footing.`,
    choices: [
      {
        id: 'ch3_continue_carefully',
        text: 'Proceed more carefully',
        nextSceneId: 'ch3_business_transition',
        effects: {
          stats: { ethics: 5, politics: 5 },
          relationships: [
            { npcId: 'tommy', change: 15, memory: 'Apologized sincerely' },
            { npcId: 'stanley', change: 10, memory: 'Showed humility' },
          ],
        },
      },
    ],
  },

  // Standoff scene
  {
    id: 'ch3_standoff',
    chapterId: 'chapter_3',
    title: 'Impasse',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `The silence stretches. You don't blink.

Neither does Stanley.

**"We're not backing down on the valuation,"** Chad finally says. **"The numbers are the numbers."**

**"Then maybe we don't have a deal,"** Stanley replies.

Monica looks panicked. Tommy looks triumphant.

*You've pushed too hard. But sometimes you have to lose a battle to win a war.*`,
    choices: [
      {
        id: 'ch3_tactical_retreat',
        text: 'Suggest a recess to regroup',
        subtext: 'Live to fight another day',
        nextSceneId: 'ch3_recess',
        effects: {
          stats: { stress: 15 },
        },
      },
      {
        id: 'ch3_call_bluff',
        text: 'Call their bluff',
        subtext: 'They need this deal too',
        nextSceneId: 'ch3_bluff_called',
        effects: {
          stats: { reputation: 10, stress: 20 },
          setFlags: ['CALLED_BLUFF'],
        },
      },
    ],
  },

  // Recess scene
  {
    id: 'ch3_recess',
    chapterId: 'chapter_3',
    title: 'Intermission',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `The Kowalski family retreats to their side of the building. Sterling's team huddles in the parking lot.

**"Well,"** Chad says, lighting a cigarette he's definitely not supposed to have, **"that could have gone better. Or worse."**

**"They'll come back,"** the lead lawyer predicts. **"They need this deal. The company's burning cash."**

**"But at what price?"** Chad muses. **"And what concessions?"**

He looks at you.

**"What's your read?"**`,
    choices: [
      {
        id: 'ch3_read_optimistic',
        text: '"They\'ll accept. Stanley wants this done."',
        subtext: 'Confidence',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { dealcraft: 3 },
          setFlags: ['PREDICTED_SUCCESS'],
        },
      },
      {
        id: 'ch3_read_cautious',
        text: '"We might need to sweeten the deal."',
        subtext: 'Pragmatism',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { politics: 3 },
          setFlags: ['SUGGESTED_CONCESSIONS'],
        },
      },
      {
        id: 'ch3_read_uncertain',
        text: '"Honestly? I\'m not sure. Tommy\'s a wild card."',
        subtext: 'Honesty',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { ethics: 3 },
          setFlags: ['ADMITTED_UNCERTAINTY'],
        },
      },
    ],
  },

  // Push for close scene
  {
    id: 'ch3_push_close',
    chapterId: 'chapter_3',
    title: 'Now or Never',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'neutral',
    },
    narrative: `**"With respect, Stanley, we've been at this for months. Our partners are getting impatient. Other opportunities are emerging."**

Chad's playing hardball. Classic PE move.

**"We need a decision today. Or we walk."**

Stanley's face hardens. Monica whispers something to him urgently.

After an agonizing pause:

**"Fine. Let's talk final numbers."**

*The gamble worked. But at what cost?*`,
    choices: [
      {
        id: 'ch3_close_aggressive_terms',
        text: 'Push for aggressive terms',
        subtext: 'Strike while they\'re pressured',
        nextSceneId: 'ch3_aggressive_close',
        effects: {
          stats: { dealcraft: 10, ethics: -10 },
          setFlags: ['AGGRESSIVE_TERMS'],
        },
      },
      {
        id: 'ch3_close_fair_terms',
        text: 'Offer reasonable terms',
        subtext: 'Win-win is sustainable',
        nextSceneId: 'ch3_fair_close',
        effects: {
          stats: { ethics: 5, politics: 5 },
          setFlags: ['FAIR_TERMS'],
        },
      },
    ],
  },

  // Promise made scene
  {
    id: 'ch3_promise_made',
    chapterId: 'chapter_3',
    title: 'The Promise',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `**"Mr. Kowalski, I give you my word. We will treat your employees with respect. We will maintain quality. We will not strip this company and leave a corpse."**

Stanley's eyes glisten.

**"You know, most of your kind... they say whatever it takes to close. Then the layoffs start week one."**

**"I'm not most of my kind."**

He extends his hand. You shake it.

**"I'm going to hold you to that."**

*You've made a promise. In Private Equity, promises have a way of becoming complicated.*`,
    choices: [
      {
        id: 'ch3_proceed_deal',
        text: 'Proceed with the deal',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { reputation: 10 },
          relationships: [{ npcId: 'stanley', change: 30, memory: 'Made a promise and shook on it' }],
        },
      },
    ],
  },

  // Honest limits scene
  {
    id: 'ch3_honest_limits',
    chapterId: 'chapter_3',
    title: 'Managing Expectations',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `**"Mr. Kowalski, I wish I could promise to keep everything exactly as it is. But that wouldn't be honest."**

His face tightens.

**"What we can promise,"** you continue, **"is thoughtful transitions. No mass layoffs. Investments in modernization that actually help your people."**

**"That's not nothing,"** Monica says quietly.

**"It's not enough,"** Tommy mutters.

Stanley sighs.

**"At least you're not lying to my face. Let's keep talking."**

*Honesty isn't always rewarded. But at least you can live with yourself.*`,
    choices: [
      {
        id: 'ch3_continue_honest',
        text: 'Continue negotiations',
        nextSceneId: 'ch3_business_transition',
        effects: {
          stats: { ethics: 5 },
          relationships: [{ npcId: 'monica', change: 10, memory: 'Was honest about limitations' }],
        },
      },
    ],
  },

  // Tommy approach scene
  {
    id: 'ch3_tommy_approach',
    chapterId: 'chapter_3',
    title: 'The Son',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'worried',
    },
    narrative: `You catch Tommy during a break.

**"You really don't want this deal, do you?"**

He looks at you with surprise and suspicion.

**"Would you? Watch your whole life get sold to strangers?"**

**"So why is your family selling?"**

His guard drops slightly.

**"Dad's tired. Monica says the banks are circling. And me?"** He laughs bitterly. **"I'm just the operations guy. Nobody listens to me."**

*Interesting. Tommy has information—and resentment.*`,
    choices: [
      {
        id: 'ch3_tommy_ally',
        text: 'Offer to include him in post-acquisition plans',
        subtext: 'Make him a stakeholder',
        nextSceneId: 'ch3_tommy_deal',
        effects: {
          relationships: [{ npcId: 'tommy', change: 20, memory: 'Offered me a real role' }],
          setFlags: ['TOMMY_ALLY'],
        },
      },
      {
        id: 'ch3_tommy_extract',
        text: 'Probe for more information about the financial pressure',
        subtext: 'Use his frustration',
        nextSceneId: 'ch3_tommy_intel',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['EXTRACTED_INTEL'],
        },
      },
    ],
  },

  // Monica approach scene
  {
    id: 'ch3_monica_approach',
    chapterId: 'chapter_3',
    title: 'The CFO',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'monica',
      name: 'Monica Kowalski',
      mood: 'worried',
    },
    narrative: `You approach Monica while the others are distracted.

**"The capex disclosure—that wasn't intentional, was it?"**

She freezes.

**"I... we had to present the company in the best light. Dad doesn't know how bad some of the equipment really is."**

**"How bad?"**

She hesitates.

**"Another year, maybe two, before major failures. If we don't sell now..."**

*The CFO is more desperate than she's showing. This changes the leverage.*`,
    choices: [
      {
        id: 'ch3_monica_reassure',
        text: 'Reassure her—you\'ll help make this work',
        subtext: 'Build trust',
        nextSceneId: 'ch3_monica_trust',
        effects: {
          relationships: [{ npcId: 'monica', change: 20, memory: 'Didn\'t use my confession against us' }],
          setFlags: ['MONICA_TRUSTS'],
        },
      },
      {
        id: 'ch3_monica_leverage',
        text: 'Note the urgency—adjust negotiation accordingly',
        subtext: 'They need this more than us',
        nextSceneId: 'ch3_monica_exploited',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['KNOWS_SELLER_DESPERATE'],
        },
      },
    ],
  },

  // Helping Tommy scene
  {
    id: 'ch3_helping_tommy',
    chapterId: 'chapter_3',
    title: 'A Real Conversation',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'neutral',
    },
    narrative: `**"What would you want?"** you ask. **"If this deal goes through—what would make it work for you?"**

Tommy blinks. Apparently no one's asked him that.

**"I... I want to matter. I've run operations here for fifteen years. I know every machine, every worker, every customer. But PE firms always bring in their own people."**

**"What if we didn't?"**

**"What?"**

**"What if you stayed on? Real authority. Real stake in the outcome."**

For the first time, Tommy looks at you without hostility.

**"You'd do that?"**

*Sometimes the best deal is the one where everyone wins.*`,
    choices: [
      {
        id: 'ch3_tommy_deal_offer',
        text: 'Propose it formally to Chad',
        nextSceneId: 'ch3_tommy_proposal',
        effects: {
          stats: { ethics: 10, politics: 5 },
          relationships: [{ npcId: 'tommy', change: 30, memory: 'Actually fought for me' }],
          setFlags: ['TOMMY_RETENTION_DEAL'],
        },
      },
    ],
  },

  // Tommy intel scene
  {
    id: 'ch3_tommy_intel',
    chapterId: 'chapter_3',
    title: 'Intelligence Gathered',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `Tommy keeps talking, barely noticing your careful questions.

**Key intel gathered:**
- The equipment is worse than reported—three major machines need replacement within 18 months
- Monica's been hiding a $2M inventory write-off from the board
- A key customer (35% of revenue) is threatening to leave if quality issues continue
- Stanley doesn't know most of this

*You now have ammunition. How you use it will define what kind of dealmaker you are.*`,
    choices: [
      {
        id: 'ch3_use_intel_hard',
        text: 'Use this to negotiate a lower price',
        subtext: 'Business is business',
        nextSceneId: 'ch3_hardball_intel',
        effects: {
          stats: { dealcraft: 10, ethics: -15 },
          setFlags: ['USED_INTEL_HARD'],
        },
      },
      {
        id: 'ch3_use_intel_soft',
        text: 'Use this to structure better protections',
        subtext: 'Informed but not exploitative',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['USED_INTEL_SOFT'],
        },
      },
    ],
  },

  // Tommy deal scene
  {
    id: 'ch3_tommy_deal',
    chapterId: 'chapter_3',
    title: 'Unexpected Alliance',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'happy',
    },
    narrative: `**"You're serious?"** Tommy's whole demeanor has changed.

**"Operations expertise is valuable. You know this business better than anyone we could hire."**

**"Monica always said I should go get an MBA, stop being just the 'factory guy.'"**

**"Some of the best operators I've met never set foot in business school."**

Tommy actually smiles.

**"You know what? Maybe this sale doesn't have to be a funeral."**

*You've just turned an obstacle into an ally.*`,
    choices: [
      {
        id: 'ch3_tommy_partnership',
        text: 'Formalize the partnership',
        nextSceneId: 'ch3_night_before',
        effects: {
          relationships: [{ npcId: 'tommy', change: 25, memory: 'Made me feel valued' }],
          setFlags: ['TOMMY_PARTNER'],
        },
      },
    ],
  },

  // Tommy proposal scene
  {
    id: 'ch3_tommy_proposal',
    chapterId: 'chapter_3',
    title: 'The Pitch',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'neutral',
    },
    narrative: `You pull Chad aside.

**"I think we should keep Tommy on. Give him a real role. Maybe even equity participation."**

Chad raises an eyebrow.

**"That's... not typical. PE usually means new management."**

**"He knows the operations cold. And right now he's our biggest obstacle. Make him a stakeholder, and he becomes an asset."**

Chad considers.

**"That's actually not stupid. I'll think about it."**

*High praise from Chad.*`,
    choices: [
      {
        id: 'ch3_proposal_accepted',
        text: 'Return to negotiations',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { politics: 10 },
          relationships: [{ npcId: 'chad', change: 15, memory: 'Had a good strategic idea' }],
        },
      },
    ],
  },

  // Monica trust scene
  {
    id: 'ch3_monica_trust',
    chapterId: 'chapter_3',
    title: 'A Secret Kept',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'monica',
      name: 'Monica Kowalski',
      mood: 'neutral',
    },
    narrative: `**"I won't use this against your family,"** you say. **"But we should build protections into the deal for the real equipment needs. It protects everyone."**

Monica looks at you like you're an alien.

**"Why? You could crush our valuation with this."**

**"Because a deal that blows up six months later helps no one. I'd rather close something sustainable."**

She takes a breath.

**"I... thank you. Maybe you're not all sharks."**

*Trust is worth more than leverage. Sometimes.*`,
    choices: [
      {
        id: 'ch3_monica_partnership',
        text: 'Work together on realistic projections',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { ethics: 10 },
          relationships: [{ npcId: 'monica', change: 30, memory: 'Could have destroyed us, didn\'t' }],
          setFlags: ['MONICA_PARTNER'],
        },
      },
    ],
  },

  // Monica exploited scene
  {
    id: 'ch3_monica_exploited',
    chapterId: 'chapter_3',
    title: 'Leverage Noted',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `You file away Monica's confession.

The seller is more desperate than they're showing. The equipment problems are worse than disclosed. They need to close before the truth comes out.

*This is leverage. Pure, clean leverage.*

Back at the table, you catch Chad's eye and give a slight nod. He understands.

**"Perhaps we should revisit the valuation..."** he begins.

Monica's face goes pale.`,
    choices: [
      {
        id: 'ch3_exploit_fully',
        text: 'Push for a significant price reduction',
        nextSceneId: 'ch3_hardball_intel',
        effects: {
          stats: { dealcraft: 10, ethics: -20 },
          relationships: [{ npcId: 'monica', change: -30, memory: 'Used my confession against us' }],
        },
      },
      {
        id: 'ch3_exploit_moderately',
        text: 'Push for modest adjustments',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['MODERATE_PRESSURE'],
        },
      },
    ],
  },

  // Hardball intel scene
  {
    id: 'ch3_hardball_intel',
    chapterId: 'chapter_3',
    title: 'The Hammer',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'smug',
    },
    narrative: `Armed with your intelligence, Chad goes for the kill.

**"We've become aware of... additional issues. Equipment problems beyond what was disclosed. Customer concentration risk. Potential write-offs."**

Stanley turns to Monica.

**"Is this true?"**

She can't meet his eyes.

**"We need to revise our offer. Significantly."**

The new number is $15 million less than before. Stanley looks like he's aged ten years.

*You got the better deal. But at what cost?*`,
    choices: [
      {
        id: 'ch3_hardball_continue',
        text: 'This is business—proceed',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { dealcraft: 10, ethics: -10 },
          relationships: [{ npcId: 'stanley', change: -25, memory: 'Humiliated my family' }],
          setFlags: ['HARDBALL_DEAL'],
        },
      },
    ],
  },

  // Bluff called scene
  {
    id: 'ch3_bluff_called',
    chapterId: 'chapter_3',
    title: 'Chicken',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'stanley',
      name: 'Stanley Kowalski',
      mood: 'angry',
    },
    narrative: `**"Walk, then."** Stanley stands. **"I've had other offers. Maybe they won't try to rob me."**

He's bluffing. You're almost sure.

But almost isn't certain.

The moment stretches. Monica looks terrified. Tommy looks hopeful.

Chad's poker face doesn't crack.

**"Stanley—"** Monica starts.

**"Quiet."**

Finally, Chad speaks: **"Perhaps we can find middle ground. Sit down. Let's talk."**

Stanley hesitates... then sits.

*The bluff held. Barely.*`,
    choices: [
      {
        id: 'ch3_negotiate_from_strength',
        text: 'Negotiate from this position of strength',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { dealcraft: 10, stress: 10 },
          setFlags: ['BLUFF_SUCCEEDED'],
        },
      },
    ],
  },

  // Aggressive close scene
  {
    id: 'ch3_aggressive_close',
    chapterId: 'chapter_3',
    title: 'Pressing the Advantage',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `You press hard on every term:

- Purchase price reduced by $7 million
- Earnout conditions tightened (harder to achieve)
- Employment guarantees shortened to 6 months
- Real estate held separately (maximum flexibility)

Monica looks sick. Tommy has left the room. Stanley signs with a trembling hand.

**"I hope you're proud of yourselves,"** he says.

Chad collects the papers without emotion.

*You got the deal you wanted. But some deals leave scars.*`,
    choices: [
      {
        id: 'ch3_aggressive_complete',
        text: 'The deal is what matters',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { money: 10000, ethics: -15 },
          setFlags: ['AGGRESSIVE_DEAL'],
        },
      },
    ],
  },

  // Fair close scene
  {
    id: 'ch3_fair_close',
    chapterId: 'chapter_3',
    title: 'Finding Balance',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `You structure terms that work for everyone:

- Purchase price adjusted moderately for the capex issues
- Earnout structured achievably—if they hit targets, they get paid
- 18-month employment guarantees maintained
- Legacy considerations for Stanley's role

It's not the most aggressive deal possible. But it's one everyone can live with.

**"This is fair,"** Stanley says finally. **"We can work with this."**

Chad glances at you. A slight nod of approval.

*Sometimes the best deal isn't the one that extracts every dollar—it's the one that actually closes.*`,
    choices: [
      {
        id: 'ch3_fair_complete',
        text: 'A deal everyone can live with',
        nextSceneId: 'ch3_night_before',
        effects: {
          stats: { reputation: 10, ethics: 5 },
          setFlags: ['FAIR_DEAL'],
        },
      },
    ],
  },

  // Night before scene
  {
    id: 'ch3_night_before',
    chapterId: 'chapter_3',
    title: 'The Night Before',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `It's 11 PM. The deal is agreed in principle. Tomorrow: signatures, wire transfers, press releases.

You're at your desk, reviewing the final documents. The office is empty except for the cleaning crew.

Your phone buzzes. A text from an unknown number:

*"You should know what you're really buying. Meet me in the parking garage. -T"*

Tommy.`,
    choices: [
      {
        id: 'ch3_meet_tommy',
        text: 'Go meet him',
        subtext: 'What does he want?',
        nextSceneId: 'ch3_garage_meeting',
        effects: {
          stats: { stress: 10 },
        },
      },
      {
        id: 'ch3_ignore_tommy',
        text: 'Ignore the message',
        subtext: 'The deal is done',
        nextSceneId: 'ch3_morning_arrives',
        effects: {
          setFlags: ['IGNORED_TOMMY_WARNING'],
        },
      },
      {
        id: 'ch3_tell_chad',
        text: 'Tell Chad about the message',
        subtext: 'This could be important',
        nextSceneId: 'ch3_chad_notified',
        effects: {
          stats: { politics: 5 },
          setFlags: ['TOLD_CHAD_WARNING'],
        },
      },
    ],
  },

  // Garage meeting scene
  {
    id: 'ch3_garage_meeting',
    chapterId: 'chapter_3',
    title: 'In the Shadows',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'worried',
    },
    narrative: `Tommy is waiting by a concrete pillar, looking like he hasn't slept in days.

**"Thanks for coming."**

**"What is this about?"**

He hands you a folder.

**"Environmental study from 2019. Monica buried it. There's contamination under the Newark facility. PCBs from the old manufacturing process."**

You flip through the pages. The numbers are damning.

**"This could kill the deal."**

**"I know."** Tommy's voice is hollow. **"But you need to know what you're buying. What you're really buying."**

*Your move.*`,
    choices: [
      {
        id: 'ch3_halt_deal',
        text: 'This changes everything—we need to halt the deal',
        subtext: 'Environmental liability is no joke',
        nextSceneId: 'ch3_deal_halted',
        effects: {
          stats: { ethics: 15 },
          setFlags: ['ENVIRONMENTAL_ISSUE_RAISED'],
        },
      },
      {
        id: 'ch3_price_adjustment',
        text: 'We can still close—with price adjustment and indemnities',
        subtext: 'Every problem has a price',
        nextSceneId: 'ch3_last_minute_changes',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['ENVIRONMENTAL_PRICED_IN'],
        },
      },
      {
        id: 'ch3_ignore_info',
        text: 'Tommy, why are you sabotaging your own family\'s sale?',
        subtext: 'Question his motives',
        nextSceneId: 'ch3_tommy_motives',
        effects: {
          stats: { politics: 5 },
        },
      },
    ],
  },

  // Morning arrives scene
  {
    id: 'ch3_morning_arrives',
    chapterId: 'chapter_3',
    title: 'Closing Day',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `Morning arrives. Signing day.

The conference room is packed: lawyers, bankers, the Kowalski family, Sterling Partners' senior leadership.

Documents are signed. Wires are confirmed. Hands are shaken.

**"Congratulations,"** Chad says. **"PackFancy is ours."**

Stanley looks tired but relieved. Monica avoids your eyes. Tommy is conspicuously absent.

*The deal is closed. Whatever Tommy wanted to tell you, it's too late now.*`,
    choices: [
      {
        id: 'ch3_closing_celebration',
        text: 'Celebrate the win',
        nextSceneId: 'ch3_chapter_end_standard',
        effects: {
          stats: { money: 5000 },
          setFlags: ['STANDARD_CLOSE'],
        },
      },
    ],
  },

  // Chad notified scene
  {
    id: 'ch3_chad_notified',
    chapterId: 'chapter_3',
    title: 'Escalation',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'worried',
    },
    narrative: `You forward the text to Chad. He calls immediately.

**"Tommy Kowalski? What does he want?"**

**"Don't know yet. Could be nothing. Could be a last-minute sabotage attempt."**

**"Meet him. Find out. But be careful—if he's trying to blow up this deal, we need to know why."**

**"And if he has something real?"**

Chad pauses.

**"Then we deal with it. But for God's sake, don't promise him anything."**`,
    choices: [
      {
        id: 'ch3_meet_with_backup',
        text: 'Meet Tommy with Chad informed',
        nextSceneId: 'ch3_garage_meeting',
        effects: {
          setFlags: ['CHAD_AWARE'],
        },
      },
    ],
  },

  // Deal halted scene
  {
    id: 'ch3_deal_halted',
    chapterId: 'chapter_3',
    title: 'Emergency Stop',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `You call Chad immediately. The signing is postponed.

The next week is chaos. Environmental consultants. Lawyers. Angry phone calls.

The contamination is real—cleanup estimates range from $3 million to $12 million, depending on scope.

**"Monica knew,"** Stanley says, looking broken. **"My own daughter hid this from me."**

The deal restructures completely. New terms. New prices. New timeline.

*You did the right thing. But "right" in PE is never simple.*`,
    choices: [
      {
        id: 'ch3_restructured_deal',
        text: 'Close the restructured deal',
        nextSceneId: 'ch3_chapter_end_ethical',
        effects: {
          stats: { ethics: 15, reputation: 10 },
          relationships: [
            { npcId: 'tommy', change: 30, memory: 'Did the right thing' },
            { npcId: 'monica', change: -40, memory: 'Exposed my failure' },
          ],
        },
      },
    ],
  },

  // Last minute changes scene
  {
    id: 'ch3_last_minute_changes',
    chapterId: 'chapter_3',
    title: 'The 11th Hour',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `You work through the night with lawyers.

By morning, you have new terms:
- Price reduced by $5 million
- Full environmental indemnity from the sellers
- Escrow holdback for potential cleanup
- Monica personally liable for any undisclosed issues

The signing happens—but with Tommy's disclosure on the table.

Monica's career is effectively over. She'll face personal liability for the cover-up.

Stanley signs without looking at his daughter.

*The deal closes. But families break.*`,
    choices: [
      {
        id: 'ch3_adjusted_close',
        text: 'Sign the papers',
        nextSceneId: 'ch3_chapter_end_pragmatic',
        effects: {
          stats: { dealcraft: 15 },
          relationships: [{ npcId: 'monica', change: -50, memory: 'Destroyed my career' }],
          setFlags: ['ADJUSTED_DEAL_CLOSED'],
        },
      },
    ],
  },

  // Tommy motives scene
  {
    id: 'ch3_tommy_motives',
    chapterId: 'chapter_3',
    title: 'The Real Reason',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'angry',
    },
    narrative: `Tommy's face hardens.

**"Sabotage? You think I want to destroy my family?"**

**"Then why show me this?"**

**"Because Monica's been running this company into the ground and Dad can't see it. Because if you buy this mess without knowing what's underneath, you'll fail. And then everyone loses."**

He takes a breath.

**"I'm not trying to kill the deal. I'm trying to save it. The real one. The one where PackFancy actually has a future."**

*Maybe you misjudged him.*`,
    choices: [
      {
        id: 'ch3_reconsider_tommy',
        text: 'Work with Tommy to find a solution',
        nextSceneId: 'ch3_last_minute_changes',
        effects: {
          relationships: [{ npcId: 'tommy', change: 20, memory: 'Finally understood' }],
        },
      },
      {
        id: 'ch3_proceed_anyway',
        text: 'This is a family matter—close the deal as-is',
        nextSceneId: 'ch3_morning_arrives',
        effects: {
          stats: { stress: 15 },
          setFlags: ['IGNORED_ENVIRONMENTAL'],
        },
      },
    ],
  },

  // Chapter end - standard
  {
    id: 'ch3_chapter_end_standard',
    chapterId: 'chapter_3',
    title: 'Deal Closed',
    type: 'chapter_end',
    atmosphere: 'celebration',
    narrative: `The champagne flows. PackFancy is now a Sterling Partners portfolio company.

Chad raises a glass.

**"To our newest acquisition. And to the analyst who found the value."**

Eyes turn to you. You've proven yourself.

*But somewhere, Tommy Kowalski is sitting alone with a folder full of truths no one wanted to hear.*

*Chapter 3 Complete.*

*You closed your first deal. What comes next will test whether you made the right calls.*`,
    choices: [
      {
        id: 'ch3_standard_continue',
        text: 'Continue to Chapter 4',
        nextSceneId: 'ch3_complete',
        effects: {
          stats: { money: 7500 },
          achievement: 'DEAL_CLOSER',
          setFlags: ['CHAPTER_3_COMPLETE'],
        },
      },
    ],
  },

  // Chapter end - ethical
  {
    id: 'ch3_chapter_end_ethical',
    chapterId: 'chapter_3',
    title: 'The Right Way',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `The deal closes—smaller, cleaner, more honest.

**"You cost us money,"** Chad says afterward. **"Maybe $10 million in value we could have extracted."**

**"And saved us from a $12 million environmental lawsuit."**

He doesn't argue.

**"The partners aren't happy. But I told them: this one has integrity. That's worth something."**

Tommy catches your eye across the room and nods.

*You chose the harder path. Time will tell if it was the wiser one.*

*Chapter 3 Complete.*

*Integrity has a price. But so does its absence.*`,
    choices: [
      {
        id: 'ch3_ethical_continue',
        text: 'Continue to Chapter 4',
        nextSceneId: 'ch3_complete',
        effects: {
          stats: { money: 4000, ethics: 10 },
          achievement: 'ETHICAL_CLOSER',
          setFlags: ['CHAPTER_3_COMPLETE'],
        },
      },
    ],
  },

  // Chapter end - pragmatic
  {
    id: 'ch3_chapter_end_pragmatic',
    chapterId: 'chapter_3',
    title: 'Pragmatic Victory',
    type: 'chapter_end',
    atmosphere: 'office',
    narrative: `The deal closes with protections in place.

Not perfect. Not pretty. But closed.

**"That was surgical,"** Chad admits in the car back. **"The way you handled the last-minute disclosure. Turned a disaster into an adjusted win."**

**"Monica's finished though."**

**"Monica lied. That has consequences."** He shrugs. **"You didn't destroy her. She destroyed herself."**

*You found a middle path. Protected Sterling, closed the deal, exposed the truth. Not everyone survived. But the deal did.*

*Chapter 3 Complete.*

*In PE, every deal leaves bodies. The question is whose.*`,
    choices: [
      {
        id: 'ch3_pragmatic_continue',
        text: 'Continue to Chapter 4',
        nextSceneId: 'ch3_complete',
        effects: {
          stats: { money: 6000, dealcraft: 5 },
          achievement: 'PRAGMATIC_CLOSER',
          setFlags: ['CHAPTER_3_COMPLETE'],
        },
      },
    ],
  },

  // Chapter complete transition
  {
    id: 'ch3_complete',
    chapterId: 'chapter_3',
    title: 'Chapter Complete',
    type: 'chapter_end',
    atmosphere: 'celebration',
    requiresAcknowledgment: true,
    narrative: `**CHAPTER 3 COMPLETE**

*The Negotiation*

PackFancy is now part of the Sterling Partners portfolio. Your first deal has closed.

But in Private Equity, closing is just the beginning. Now comes the hard part: delivering on the promises you made—or didn't make.

The real test is still ahead.`,
    choices: [],
    nextSceneId: 'ch4_opening',
  },
];

// ============================================================================
// CHAPTER 4: THE RECKONING
// ============================================================================

const CHAPTER_4_SCENES: Scene[] = [
  // Opening Scene - Six Months Later
  {
    id: 'ch4_opening',
    chapterId: 'chapter_4',
    title: 'Six Months Later',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `**CHAPTER 4: THE RECKONING**

*Six Months Later*

The PackFancy acquisition was supposed to be a proving ground. A stepping stone.

Instead, it's become a crucible.

Six months in, and the portfolio company is bleeding. Revenue down 15%. The equipment failures came faster than anyone predicted. Two key customers left for competitors.

And now you're sitting in Chad's office, looking at a report that will change everything.

**"The board meets tomorrow,"** Chad says. His face is grim. **"They want answers. And they're looking at you."**

*The deal you closed is falling apart. What happens next depends on the choices you made—and the ones you're about to make.*`,
    choices: [
      {
        id: 'ch4_accept_responsibility',
        text: 'Accept responsibility for the situation',
        subtext: 'Own the problems',
        nextSceneId: 'ch4_take_ownership',
        effects: {
          stats: { ethics: 10, stress: 15 },
          setFlags: ['ACCEPTED_RESPONSIBILITY'],
        },
      },
      {
        id: 'ch4_deflect_blame',
        text: 'Point to factors outside your control',
        subtext: 'The market changed, the sellers lied',
        nextSceneId: 'ch4_deflection',
        effects: {
          stats: { politics: 5, ethics: -10 },
          setFlags: ['DEFLECTED_BLAME'],
        },
      },
      {
        id: 'ch4_propose_solution',
        text: 'Come with a turnaround plan',
        subtext: 'Problems need solutions',
        nextSceneId: 'ch4_turnaround_pitch',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['PROPOSED_TURNAROUND'],
        },
      },
    ],
  },

  // Take ownership scene
  {
    id: 'ch4_take_ownership',
    chapterId: 'chapter_4',
    title: 'Accountability',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'worried',
    },
    narrative: `**"The problems at PackFancy are real, and I bear responsibility for the deal. I should have pushed harder on the equipment due diligence. I should have insisted on longer warranties."**

Chad studies you.

**"That's... refreshingly honest. Most associates would be building a bunker of excuses right now."**

**"Excuses don't fix companies."**

**"No. They don't."** He leans back. **"Alright. You own it. Now what are you going to do about it?"**

*Accountability is the first step. But it's not a solution.*`,
    choices: [
      {
        id: 'ch4_ownership_turnaround',
        text: 'Present a turnaround strategy',
        nextSceneId: 'ch4_turnaround_pitch',
        effects: {
          relationships: [{ npcId: 'chad', change: 10, memory: 'Took responsibility like a professional' }],
        },
      },
    ],
  },

  // Deflection scene
  {
    id: 'ch4_deflection',
    chapterId: 'chapter_4',
    title: 'The Blame Game',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'disappointed',
    },
    narrative: `**"The sellers misrepresented the equipment condition. The market shifted. Our operating team was slow to implement changes—"**

Chad holds up a hand.

**"Stop."**

His voice is cold.

**"I've heard this speech a hundred times from a hundred failed dealmakers. None of them work here anymore."**

**"I'm not saying I'm blameless—"**

**"Then don't sound like you are."** He sighs. **"Look, the board doesn't want excuses. They want to know if this investment is salvageable. So: is it?"**

*You've lost ground. Time to recover.*`,
    choices: [
      {
        id: 'ch4_deflection_recover',
        text: 'Pivot to solutions',
        nextSceneId: 'ch4_turnaround_pitch',
        effects: {
          relationships: [{ npcId: 'chad', change: -10, memory: 'Tried to blame others first' }],
        },
      },
    ],
  },

  // Turnaround pitch scene
  {
    id: 'ch4_turnaround_pitch',
    chapterId: 'chapter_4',
    title: 'The Plan',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `You pull out your notes. Three AM work, fueled by desperation and cold coffee.

**"Here's what I'm proposing:"**

**Option A: Aggressive Restructuring**
- Immediate workforce reduction (30% of staff)
- Sell the Newark real estate (the hidden value you originally found)
- Use proceeds to recapitalize equipment
- Expected turnaround: 18 months

**Option B: Strategic Pivot**
- Shift from manufacturing to distribution
- Partner with overseas producers
- Retain brand and customer relationships
- Expected turnaround: 24 months

**Option C: Managed Exit**
- Acknowledge the investment won't meet targets
- Find a strategic buyer or merge with competitor
- Minimize losses, preserve reputation
- Timeline: 6-9 months

Chad reads through your analysis in silence.

**"And your recommendation?"**`,
    choices: [
      {
        id: 'ch4_recommend_aggressive',
        text: 'Aggressive restructuring',
        subtext: 'Maximum returns, maximum pain',
        nextSceneId: 'ch4_aggressive_path',
        requirements: {
          blockedByFlags: ['LEGACY_PROMISE'],
        },
        effects: {
          stats: { dealcraft: 10, ethics: -15 },
          setFlags: ['CHOSE_AGGRESSIVE'],
        },
      },
      {
        id: 'ch4_recommend_pivot',
        text: 'Strategic pivot',
        subtext: 'Transform the business model',
        nextSceneId: 'ch4_pivot_path',
        effects: {
          stats: { dealcraft: 5, politics: 5 },
          setFlags: ['CHOSE_PIVOT'],
        },
      },
      {
        id: 'ch4_recommend_exit',
        text: 'Managed exit',
        subtext: 'Cut losses, learn lessons',
        nextSceneId: 'ch4_exit_path',
        effects: {
          stats: { reputation: -5, ethics: 5 },
          setFlags: ['CHOSE_EXIT'],
        },
      },
      {
        id: 'ch4_recommend_ethical',
        text: 'Modified restructuring—protect employees',
        subtext: 'Honor your promises',
        requirements: {
          requiredFlags: ['LEGACY_PROMISE'],
        },
        nextSceneId: 'ch4_ethical_restructure',
        effects: {
          stats: { ethics: 15 },
          setFlags: ['CHOSE_ETHICAL_RESTRUCTURE'],
        },
      },
    ],
  },

  // Aggressive path scene
  {
    id: 'ch4_aggressive_path',
    chapterId: 'chapter_4',
    title: 'The Hard Way',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `Chad nods slowly.

**"Aggressive restructuring. That's the PE playbook. Cut deep, recapitalize, sell high."**

**"It works."**

**"It does. When it works."** He pauses. **"The Newark real estate sale—that was your original thesis. Selling it now feels like admitting the rest of the deal was a mistake."**

**"The real estate was always the value. We just... got distracted by the operating business."**

**"Alright. I'll take it to the board. But you're going to be the one telling Stanley Kowalski that half his workforce is getting fired."**

*You're about to learn what your promises are worth.*`,
    choices: [
      {
        id: 'ch4_aggressive_continue',
        text: 'Proceed with the plan',
        nextSceneId: 'ch4_kowalski_confrontation',
        effects: {
          stats: { stress: 20 },
          setFlags: ['AGGRESSIVE_APPROVED'],
        },
      },
    ],
  },

  // Pivot path scene
  {
    id: 'ch4_pivot_path',
    chapterId: 'chapter_4',
    title: 'Reinvention',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'neutral',
    },
    narrative: `**"A strategic pivot."** Chad considers. **"That's... ambitious. You're essentially proposing we turn a manufacturing company into a brand management company."**

**"The brand has value. The customer relationships have value. The manufacturing capability is a liability."**

**"But the manufacturing is what the Kowalskis built. What Stanley's father built."**

**"And it's what's killing them."**

Chad drums his fingers on the desk.

**"The board will have questions. The timeline is long. And Tommy Kowalski is going to lose his mind when he hears 'offshore production.'"**

**"I know. But it's the path that preserves the most jobs while actually fixing the business."**

**"Alright. Let's see if you can sell it."**`,
    choices: [
      {
        id: 'ch4_pivot_continue',
        text: 'Prepare for the board meeting',
        nextSceneId: 'ch4_board_meeting',
        effects: {
          stats: { politics: 5 },
          setFlags: ['PIVOT_APPROVED'],
        },
      },
    ],
  },

  // Exit path scene
  {
    id: 'ch4_exit_path',
    chapterId: 'chapter_4',
    title: 'Knowing When to Fold',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'disappointed',
    },
    narrative: `Chad is silent for a long moment.

**"A managed exit. You're recommending we write off a $85 million investment."**

**"I'm recommending we stop throwing good money after bad. Sell now, we might recover 60 cents on the dollar. Wait another year, we might get 30."**

**"The partners won't like hearing that their rising star's first deal is a loss."**

**"Better a managed loss than a catastrophic one."**

Chad looks at you with something that might be respect—or pity.

**"You know this will follow you, right? 'The analyst who recommended giving up.' That's a reputation."**

**"Better than 'the analyst who kept doubling down on a disaster.'"**

**"Maybe. Let's see if the board agrees."**`,
    choices: [
      {
        id: 'ch4_exit_continue',
        text: 'Face the board',
        nextSceneId: 'ch4_board_meeting',
        effects: {
          stats: { ethics: 5, reputation: -10 },
          setFlags: ['EXIT_APPROVED'],
        },
      },
    ],
  },

  // Ethical restructure path
  {
    id: 'ch4_ethical_restructure',
    chapterId: 'chapter_4',
    title: 'A Promise Kept',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `**"I made Stanley Kowalski a promise. No mass layoffs. Thoughtful transitions."**

Chad's eyebrows rise.

**"You remember that?"**

**"I shook his hand. That means something to me."**

**"Even if it costs us money?"**

**"Especially then."** You take a breath. **"The restructuring can work without gutting the workforce. It'll take longer. Returns will be lower. But we won't leave a corpse."**

Chad studies you for a long moment.

**"You know, most people in this business... they say whatever they need to close. Then they forget."**

**"I'm not most people."**

**"No. You're not."** He almost smiles. **"Alright. Let's see if integrity pays dividends."**`,
    choices: [
      {
        id: 'ch4_ethical_continue',
        text: 'Proceed with the ethical approach',
        nextSceneId: 'ch4_board_meeting',
        effects: {
          stats: { ethics: 20, reputation: 10 },
          relationships: [{ npcId: 'chad', change: 20, memory: 'Kept a promise even when it cost' }],
          setFlags: ['ETHICAL_APPROVED'],
        },
      },
    ],
  },

  // Kowalski confrontation scene
  {
    id: 'ch4_kowalski_confrontation',
    chapterId: 'chapter_4',
    title: 'Facing Stanley',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'stanley',
      name: 'Stanley Kowalski',
      mood: 'angry',
    },
    narrative: `The meeting takes place in the same conference room where you closed the deal. Stanley looks older.

**"Thirty percent."** His voice is hollow. **"You're firing thirty percent of my people."**

**"The company needs to be restructured to survive—"**

**"Don't give me corporate speak!"** He slams the table. **"These are people! Maria in accounting—she's been here twenty years. Tom in shipping—his wife just had twins."**

**"Mr. Kowalski—"**

**"You shook my hand."** His voice cracks. **"You looked me in the eye and said you'd treat my people with respect."**

The silence is crushing.

**"This is what respect looks like,"** you say quietly. **"If we don't restructure, everyone loses their job. Not thirty percent. Everyone."**

Stanley stares at you. Something in his eyes breaks.

**"Get out. Just... get out."**`,
    choices: [
      {
        id: 'ch4_confrontation_leave',
        text: 'Leave him to his grief',
        nextSceneId: 'ch4_aftermath_aggressive',
        effects: {
          stats: { stress: 25, ethics: -10 },
          relationships: [{ npcId: 'stanley', change: -50, memory: 'Broke every promise' }],
        },
      },
      {
        id: 'ch4_confrontation_stay',
        text: 'Stay. Explain the full picture.',
        nextSceneId: 'ch4_full_explanation',
        effects: {
          stats: { stress: 15 },
        },
      },
    ],
  },

  // Full explanation scene
  {
    id: 'ch4_full_explanation',
    chapterId: 'chapter_4',
    title: 'The Truth',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'worried',
    },
    narrative: `**"Mr. Kowalski, please. Let me show you the numbers."**

You spread the financials on the table. The declining revenue. The equipment failures. The customer losses.

**"Your company was dying when we bought it. Monica's CFO work—she was hiding how bad it really was. From you. From us. From everyone."**

Stanley's anger wavers.

**"If we do nothing, PackFancy closes in eighteen months. Everyone loses their jobs. The buildings get sold. The name disappears."**

**"If we restructure—yes, thirty percent lose their jobs. But seventy percent keep them. And in two years, we're hiring again."**

**"You swear to that?"**

**"I can't swear to anything in business. But I can promise I'll fight for it."**

Stanley is silent for a long time.

**"That's the most honest thing anyone from your firm has ever said to me."**`,
    choices: [
      {
        id: 'ch4_explanation_understood',
        text: 'Ask for his support',
        nextSceneId: 'ch4_stanley_support',
        effects: {
          relationships: [{ npcId: 'stanley', change: 20, memory: 'Told me the truth, even when it hurt' }],
        },
      },
    ],
  },

  // Stanley support scene
  {
    id: 'ch4_stanley_support',
    chapterId: 'chapter_4',
    title: 'Unexpected Ally',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'stanley',
      name: 'Stanley Kowalski',
      mood: 'neutral',
    },
    narrative: `Stanley looks at the papers, then at you.

**"When I was twenty-five, my father had to lay off half our workers. Depression-era thinking, he called it. 'You can't save everyone, but you can save some.'"**

He sighs.

**"I've spent fifty years trying to prove him wrong. Building a company where layoffs never happened. Where loyalty meant something."**

**"It did mean something. It still does."**

**"Maybe."** He stands slowly. **"I'll support your restructuring. On one condition: you look every person you fire in the eye. You explain why. And you help them find something else."**

**"Deal."**

**"Then let's go save what's left of my father's company."**`,
    choices: [
      {
        id: 'ch4_support_proceed',
        text: 'Begin the restructuring together',
        nextSceneId: 'ch4_board_meeting',
        effects: {
          stats: { ethics: 10, politics: 10 },
          relationships: [{ npcId: 'stanley', change: 30, memory: 'We worked together to save the company' }],
          setFlags: ['STANLEY_ALLY'],
        },
      },
    ],
  },

  // Aftermath aggressive scene
  {
    id: 'ch4_aftermath_aggressive',
    chapterId: 'chapter_4',
    title: 'The Cost',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `You drive back to Manhattan in silence.

The restructuring will proceed. The layoffs will happen. The real estate will sell.

On paper, it's the right call. The numbers work. The investors will be satisfied.

But Stanley Kowalski's face will haunt you.

Your phone buzzes. A text from an unknown number:

*"You're worse than Monica. At least she was family."*

Tommy.

*Some victories feel like defeats.*`,
    choices: [
      {
        id: 'ch4_aftermath_continue',
        text: 'Push forward',
        nextSceneId: 'ch4_board_meeting',
        effects: {
          stats: { stress: 10 },
          relationships: [{ npcId: 'tommy', change: -40, memory: 'Betrayed everything' }],
        },
      },
    ],
  },

  // Board meeting scene
  {
    id: 'ch4_board_meeting',
    chapterId: 'chapter_4',
    title: 'The Board',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The Sterling Partners boardroom. Mahogany table. Leather chairs. Portraits of founders on the walls.

The partners file in: graying men in expensive suits, a few younger faces trying to look equally serious.

Hunter Sterling—the nephew you met on day one—is notably present. He's been waiting for you to fail.

Chad presents the situation. The numbers. The options.

Then all eyes turn to you.

**"Walk us through your recommendation,"** the managing partner says.

*This is the moment. Everything you've done—every choice, every relationship, every compromise—has led here.*`,
    choices: [
      {
        id: 'ch4_board_present',
        text: 'Present your case',
        nextSceneId: 'ch4_board_presentation',
        effects: {
          stats: { stress: 15 },
        },
      },
    ],
  },

  // Board presentation scene
  {
    id: 'ch4_board_presentation',
    chapterId: 'chapter_4',
    title: 'Making the Case',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `You stand. Your voice is steady.

The presentation flows: market analysis, operational review, financial projections. You answer questions crisply. Challenge pushback confidently.

Hunter tries to interrupt twice. Both times, Chad shuts him down.

After forty-five minutes, the managing partner holds up a hand.

**"Enough. We've heard the analysis."** He looks around the table. **"Comments?"**

The discussion is brief. The partners have already decided—they just needed to see if you'd crack under pressure.

**"Motion to approve the restructuring plan as presented."**

Hands go up.

**"Carried. Meeting adjourned."**

*You've survived the board. But the real test is just beginning.*`,
    choices: [
      {
        id: 'ch4_board_aftermath',
        text: 'Leave the boardroom',
        nextSceneId: 'ch4_post_board',
        effects: {
          stats: { reputation: 10 },
          achievement: 'BOARD_SURVIVOR',
        },
      },
    ],
  },

  // Post board scene
  {
    id: 'ch4_post_board',
    chapterId: 'chapter_4',
    title: 'After the Vote',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'neutral',
    },
    narrative: `Chad catches you in the hallway.

**"Not bad in there. You handled the pressure."**

**"Thanks."**

**"Don't thank me yet."** He looks at you seriously. **"The board approved the plan. Now you have to execute it. Six months to show results, or PackFancy gets sold for parts and you get reassigned to due diligence purgatory."**

**"I understand."**

**"Do you?"** He pauses. **"Hunter's been whispering to the partners. Says you're in over your head. That the PackFancy deal proves you got lucky on the real estate analysis but don't have what it takes for the long game."**

**"And what do you think?"**

Chad almost smiles.

**"I think the next six months will answer that question. Don't disappoint me."**`,
    choices: [
      {
        id: 'ch4_accept_challenge',
        text: 'Accept the challenge',
        nextSceneId: 'ch4_execution_montage',
        effects: {
          stats: { dealcraft: 5 },
        },
      },
    ],
  },

  // Execution montage scene
  {
    id: 'ch4_execution_montage',
    chapterId: 'chapter_4',
    title: 'The Grind',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Six months of execution.*

Week 1: The layoffs. You honor Stanley's request—looking each person in the eye, explaining why, connecting them with outplacement services.

Week 4: The equipment upgrade begins. New machinery from Germany. Training programs for the remaining staff.

Week 8: The real estate sale closes. $45 million—less than you projected, but enough.

Week 12: The first customer win in months. A regional retailer impressed by improved quality.

Week 16: Tommy Kowalski returns to the facility. He's been avoiding you. Today, he has something to say.

Week 20: The board review approaches. The numbers are... complicated.

*You've done everything you can. Now comes the reckoning.*`,
    choices: [
      {
        id: 'ch4_face_tommy',
        text: 'Face Tommy first',
        nextSceneId: 'ch4_tommy_return',
        effects: {
          stats: { stress: 5 },
        },
      },
    ],
  },

  // Tommy return scene
  {
    id: 'ch4_tommy_return',
    chapterId: 'chapter_4',
    title: 'The Prodigal Son',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'neutral',
    },
    narrative: `Tommy finds you in the break room.

**"I hated you,"** he says without preamble. **"After the layoffs. I thought you were just another suit counting bodies."**

**"I understand."**

**"But I watched you. These last few months. The way you handled Maria's departure—getting her that job at the competitor. The way you actually listened when the floor workers had suggestions about the new equipment."**

He pauses.

**"My father... he's starting to come around. Says maybe you're different."**

**"And you?"**

Tommy looks at the floor.

**"I think you might actually be trying to save this place. Not just squeeze it dry."**

**"That's the goal."**

**"Then let me help. I know this business better than anyone. If you're really committed to a turnaround, you need me."**`,
    choices: [
      {
        id: 'ch4_accept_tommy',
        text: 'Bring Tommy into the turnaround team',
        nextSceneId: 'ch4_tommy_joins',
        effects: {
          relationships: [{ npcId: 'tommy', change: 30, memory: 'Gave me a real chance' }],
          setFlags: ['TOMMY_TURNAROUND_PARTNER'],
        },
      },
      {
        id: 'ch4_reject_tommy',
        text: 'Keep him at arm\'s length',
        subtext: 'He\'s unpredictable',
        nextSceneId: 'ch4_tommy_rejected',
        effects: {
          stats: { politics: 5 },
          relationships: [{ npcId: 'tommy', change: -10, memory: 'Still didn\'t trust me' }],
        },
      },
    ],
  },

  // Tommy joins scene
  {
    id: 'ch4_tommy_joins',
    chapterId: 'chapter_4',
    title: 'Alliance',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `**"You're in. But I need you all-in, Tommy. No more midnight texts. No more surprises. If there's a problem, we face it together."**

**"Deal."** He extends his hand.

You shake it. Different from Stanley's handshake six months ago—that was a promise you weren't sure you could keep. This one feels earned.

**"First order of business: the quality control issues on Line 3. The new equipment is great, but the operators are struggling with the transition."**

**"I've been working with them. Have some ideas."**

**"Then let's hear them."**

*The Kowalski family—or at least half of it—is on your side again.*`,
    choices: [
      {
        id: 'ch4_tommy_work',
        text: 'Work together on the turnaround',
        nextSceneId: 'ch4_final_review',
        effects: {
          stats: { dealcraft: 10 },
        },
      },
    ],
  },

  // Tommy rejected scene
  {
    id: 'ch4_tommy_rejected',
    chapterId: 'chapter_4',
    title: 'Distance',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'tommy',
      name: 'Tommy Jr.',
      mood: 'disappointed',
    },
    narrative: `**"I appreciate the offer, Tommy. But right now, the turnaround needs focused execution. Too many cooks..."**

His face hardens.

**"Too many cooks. Right. Because the family that built this company for fifty years is just... interference."**

**"That's not what I meant."**

**"Sure."** He turns to leave. **"Good luck with your focused execution. Hope it works out better than the focused acquisition did."**

The door closes harder than necessary.

*You've kept your team tight. But you may have lost an ally.*`,
    choices: [
      {
        id: 'ch4_tommy_rejected_continue',
        text: 'Continue with the turnaround',
        nextSceneId: 'ch4_final_review',
        effects: {
          stats: { stress: 10 },
        },
      },
    ],
  },

  // Final review scene
  {
    id: 'ch4_final_review',
    chapterId: 'chapter_4',
    title: 'Judgment Day',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Week 24. The final board review.*

The numbers are in:

**Revenue:** Up 8% from the low point, still down 7% from acquisition
**EBITDA:** Positive for the first time in two quarters
**Customer retention:** Stabilized, two new accounts signed
**Workforce:** Down 25% from acquisition, morale improving
**Equipment:** New machinery fully operational
**Real estate:** Sold, proceeds deployed

It's not a home run. But it's not a disaster either.

Chad reviews the summary.

**"Well. You didn't save the world. But you stopped the bleeding."**

**"Is that enough?"**

**"Let's find out."**`,
    choices: [
      {
        id: 'ch4_final_board',
        text: 'Enter the boardroom',
        nextSceneId: 'ch4_final_board_meeting',
        effects: {
          stats: { stress: 20 },
        },
      },
    ],
  },

  // Final board meeting scene
  {
    id: 'ch4_final_board_meeting',
    chapterId: 'chapter_4',
    title: 'The Verdict',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The board reviews the results. Questions are asked. Data is challenged.

Hunter makes one last attempt to undercut you—pointing out the deal still hasn't returned to acquisition value.

But the managing partner cuts him off.

**"The question isn't whether this deal hit our original targets. The question is whether it would have been worse without intervention."**

He looks at you.

**"Based on what I've seen, the answer is clearly yes. The turnaround isn't complete, but the trajectory is positive. The company is viable."**

A murmur of agreement around the table.

**"More importantly, I've seen something rare in this business: an associate who takes responsibility, executes under pressure, and maintains relationships even when delivering hard news."**

**"That's the kind of person we promote."**

The room goes quiet.

**"Effective immediately, you're being promoted to Vice President. Congratulations."**`,
    choices: [
      {
        id: 'ch4_promotion_accept',
        text: 'Accept the promotion',
        nextSceneId: 'ch4_chapter_end',
        effects: {
          stats: { money: 25000, reputation: 20 },
          achievement: 'VICE_PRESIDENT',
        },
      },
    ],
  },

  // Chapter end
  {
    id: 'ch4_chapter_end',
    chapterId: 'chapter_4',
    title: 'A New Beginning',
    type: 'chapter_end',
    atmosphere: 'celebration',
    narrative: `*Later that evening*

Chad finds you at the office bar, nursing a drink.

**"VP. Not bad for someone who almost torpedoed their first deal."**

**"Almost?"**

**"The key word."** He sits down. **"You know what separates the people who make it in this business from the ones who wash out?"**

**"Returns?"**

**"No. Anyone can get lucky with returns."** He takes a sip. **"It's the ability to sit with uncertainty. To make decisions without perfect information. To live with consequences."**

**"Sounds exhausting."**

**"It is. But it's also..."** He searches for the word. **"Meaningful. In a way that most jobs aren't."**

He raises his glass.

**"To your first deal. May your second be cleaner."**

**"And my third?"**

**"Let's not get ahead of ourselves."**

*The PackFancy chapter is closing. But in Private Equity, every ending is just another beginning.*

**CHAPTER 4 COMPLETE**

*You've survived your first deal cycle—from acquisition to turnaround. You've made promises and kept some. Broken others. Built relationships and burned bridges.*

*You're a Vice President now. New deals await. New choices. New consequences.*

*This is the game. And you're still playing.*`,
    choices: [],
    requiresAcknowledgment: true,
    nextSceneId: 'ch5_opening',
  },
];

// ============================================================================
// CHAPTER 5: THE HUNT - Deal Sourcing & Due Diligence
// ============================================================================

const CHAPTER_5_SCENES: Scene[] = [
  // Opening - MD confrontation about deal sourcing
  {
    id: 'ch5_opening',
    chapterId: 'chapter_5',
    title: 'Proprietary or Perish',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Three months after your promotion to VP*

The corner office. Chad's domain. You've been summoned.

The walls are lined with tombstones—lucite deal mementos from two decades of buyouts. Each one represents billions in enterprise value, hundreds of jobs transformed, fortunes made and lost.

Chad doesn't look up from his screen.

**"Close the door."**

*This isn't going to be a congratulations meeting.*`,
    choices: [
      {
        id: 'ch5_opening_sit',
        text: 'Take a seat',
        nextSceneId: 'ch5_cold_reality',
      },
    ],
  },

  // Cold Reality - MD criticism
  {
    id: 'ch5_cold_reality',
    chapterId: 'chapter_5',
    title: 'The Problem',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'disappointed',
    },
    narrative: `**"I've been reviewing your deal sheet. PackFancy. The retail roll-up you sourced from Goldman's CIM. The industrials deal that came through Jefferies."**

He finally looks at you.

**"Notice a pattern?"**

**"They're all banker deals."**

**"Every. Single. One."** He leans back. **"You know what bankers do? They run processes. Forty bidders. Competitive tension. Margins compressed to nothing."**

**"We still made money on PackFancy—"**

**"Luck. And a turnaround you almost botched."** His voice is flat. **"VPs who only work auction deals don't make Principal. They become permanent associates with better titles."**

*He's not wrong. Proprietary deal flow is the holy grail of PE.*`,
    choices: [
      {
        id: 'ch5_accept_criticism',
        text: 'Ask what you should do differently',
        nextSceneId: 'ch5_the_mandate',
        effects: {
          stats: { politics: 5 },
        },
      },
      {
        id: 'ch5_defend_record',
        text: 'Defend your track record',
        subtext: 'Risky move',
        nextSceneId: 'ch5_the_mandate_tense',
        style: 'risky',
        effects: {
          stats: { stress: 10 },
          relationships: [{ npcId: 'chad', change: -5, memory: 'Got defensive when criticized' }],
        },
      },
    ],
  },

  // The Mandate - normal path
  {
    id: 'ch5_the_mandate',
    chapterId: 'chapter_5',
    title: 'The Assignment',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'neutral',
    },
    narrative: `Chad nods slightly. Good answer.

**"I want you to source a proprietary deal. No bankers. No auctions. You find a company, you build a relationship with the owner, you bring it to IC."**

**"What sector?"**

**"Your choice. But make it defensible."** He slides a folder across the desk. **"There's a healthcare conference in Boston next week. The Private Equity Healthcare Forum. Owners, operators, and a lot of bad wine."**

**"You want me to work the conference?"**

**"I want you to come back with a target. One real opportunity. Not a stack of business cards—a relationship."**

He stands, signaling the meeting is over.

**"You've got three months. Source something proprietary, or start updating your resume."**

*No pressure.*`,
    choices: [
      {
        id: 'ch5_accept_mandate',
        text: 'Accept the challenge',
        nextSceneId: 'ch5_conference_prep',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['PROPRIETARY_MANDATE'],
        },
      },
    ],
  },

  // The Mandate - tense path (if defended record)
  {
    id: 'ch5_the_mandate_tense',
    chapterId: 'chapter_5',
    title: 'The Assignment',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'angry',
    },
    narrative: `Chad's eyes narrow.

**"Your track record? You mean the deal where you almost torched our relationship with the Kowalski family? Where we had to restructure six months after close because you missed the customer concentration risk?"**

You stay silent. He's not entirely wrong.

**"Here's the reality: I went to bat for your promotion. Partners asked if you were ready. I said yes."** His voice is ice. **"Don't make me a liar."**

He slides a folder across the desk.

**"Healthcare conference. Boston. Next week. Come back with a proprietary opportunity or don't come back at all."**

*He's giving you a chance. Barely.*`,
    choices: [
      {
        id: 'ch5_accept_mandate_tense',
        text: 'Accept the challenge',
        nextSceneId: 'ch5_conference_prep',
        effects: {
          stats: { stress: 10, dealcraft: 5 },
          setFlags: ['PROPRIETARY_MANDATE', 'CHAD_TENSE'],
        },
      },
    ],
  },

  // Conference Preparation
  {
    id: 'ch5_conference_prep',
    chapterId: 'chapter_5',
    title: 'The Approach',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Boston. The Westin Copley Place. Three days of networking, panels, and opportunity.*

You spend the flight reviewing the attendee list. Two hundred healthcare operators, fifty PE professionals, and a handful of investment bankers circling like sharks.

Three names catch your attention:

**Dr. Eleanor Vance** — Founder/CEO of MedDevice Solutions. Orthopedic implants. $80M revenue, bootstrapped. Rumored to be considering succession options.

**Marcus Webb** — CEO of ClearPath Diagnostics. Lab testing chain. $120M revenue, PE-backed (looking for secondary). Platform play potential.

**Patricia Okonkwo** — Founder of HomeFirst Senior Care. Home health services. $45M revenue, family-owned. Fragmented market ripe for consolidation.

*Three targets. Three days. Choose your approach.*`,
    choices: [
      {
        id: 'ch5_target_meddevice',
        text: 'Focus on MedDevice Solutions',
        subtext: 'Highest complexity, highest potential',
        nextSceneId: 'ch5_meddevice_approach',
        effects: {
          setFlags: ['TARGET_MEDDEVICE'],
        },
      },
      {
        id: 'ch5_target_clearpath',
        text: 'Focus on ClearPath Diagnostics',
        subtext: 'Secondary deal, faster path',
        nextSceneId: 'ch5_clearpath_approach',
        effects: {
          setFlags: ['TARGET_CLEARPATH'],
        },
      },
      {
        id: 'ch5_target_homefirst',
        text: 'Focus on HomeFirst Senior Care',
        subtext: 'Smaller but fragmented market',
        nextSceneId: 'ch5_homefirst_approach',
        effects: {
          setFlags: ['TARGET_HOMEFIRST'],
        },
      },
    ],
  },

  // MedDevice Approach
  {
    id: 'ch5_meddevice_approach',
    chapterId: 'chapter_5',
    title: 'The Surgeon',
    type: 'narrative',
    atmosphere: 'party',
    narrative: `*Day One. Evening reception.*

You spot Dr. Eleanor Vance near the bar—silver hair, sharp eyes, nursing a gin and tonic while a junior banker tries to pitch her on "strategic alternatives."

She looks bored. You know the look. She's heard this pitch a hundred times.

You wait for the banker to give up, then approach.

**"Dr. Vance? I read your paper on minimally invasive hip replacement techniques. The outcomes data on reduced recovery time was remarkable."**

She turns, surprised.

**"You actually read it? Most finance people just pretend."**

**"I spent three hours on PubMed before this conference. Your revision rates are half the industry average."**

A genuine smile.

**"Alright. You've earned five minutes. What do you want?"**

*This is the moment. Don't blow it.*`,
    choices: [
      {
        id: 'ch5_meddevice_honest',
        text: 'Be direct about your interest',
        subtext: 'Honesty approach',
        nextSceneId: 'ch5_vance_conversation',
        style: 'ethical',
        effects: {
          stats: { ethics: 5 },
          setFlags: ['VANCE_HONEST_APPROACH'],
        },
      },
      {
        id: 'ch5_meddevice_subtle',
        text: 'Focus on the science first',
        subtext: 'Build rapport before business',
        nextSceneId: 'ch5_vance_conversation',
        effects: {
          stats: { politics: 5 },
          setFlags: ['VANCE_SUBTLE_APPROACH'],
        },
      },
    ],
  },

  // ClearPath Approach
  {
    id: 'ch5_clearpath_approach',
    chapterId: 'chapter_5',
    title: 'The Operator',
    type: 'narrative',
    atmosphere: 'party',
    narrative: `*Day One. Evening reception.*

Marcus Webb is easy to spot—tall, charismatic, surrounded by a cluster of PE professionals all trying to get his attention. ClearPath is a known quantity in healthcare PE circles. His current sponsor, Granite Capital, is looking to exit.

The challenge: everyone here wants the same thing.

You notice Webb keeps glancing at his phone. Something's bothering him. When he excuses himself to take a call near the window, you see your opening.

He hangs up, looking frustrated.

**"Bad news?"** you ask, offering a subtle nod of sympathy.

**"Labor market."** He sighs. **"Third lab tech this month. Can't keep phlebotomists for more than six months."**

*This is your opening. Workforce challenges are existential for lab businesses.*`,
    choices: [
      {
        id: 'ch5_clearpath_solution',
        text: 'Share insights on retention strategies',
        subtext: 'Add value immediately',
        nextSceneId: 'ch5_webb_conversation',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['WEBB_HELPFUL_APPROACH'],
        },
      },
      {
        id: 'ch5_clearpath_direct',
        text: 'Pivot to discussing ClearPath\'s future',
        subtext: 'More aggressive',
        nextSceneId: 'ch5_webb_conversation',
        style: 'risky',
        effects: {
          stats: { politics: 5 },
          setFlags: ['WEBB_DIRECT_APPROACH'],
        },
      },
    ],
  },

  // HomeFirst Approach
  {
    id: 'ch5_homefirst_approach',
    chapterId: 'chapter_5',
    title: 'The Builder',
    type: 'narrative',
    atmosphere: 'party',
    narrative: `*Day One. Evening reception.*

Patricia Okonkwo sits alone at a corner table, reviewing notes on her tablet. Unlike the other executives working the room, she seems focused on preparation rather than networking.

You approach with two glasses of wine.

**"Mind if I join you? Everyone else seems intent on business card bingo."**

She looks up, cautious but amused.

**"And you're not?"**

**"I'm more interested in understanding the home health market. I've been reading about the demographic tailwinds, but the reimbursement complexity seems underappreciated."**

Her eyebrows rise.

**"You actually want to talk about reimbursement? At a cocktail party?"**

**"I find most interesting conversations happen in the margins."**

*She gestures to the seat across from her.*`,
    choices: [
      {
        id: 'ch5_homefirst_listen',
        text: 'Ask about her journey building HomeFirst',
        subtext: 'Let her tell her story',
        nextSceneId: 'ch5_okonkwo_conversation',
        style: 'ethical',
        effects: {
          stats: { ethics: 5, politics: 5 },
          setFlags: ['OKONKWO_LISTENER_APPROACH'],
        },
      },
      {
        id: 'ch5_homefirst_market',
        text: 'Discuss market consolidation opportunity',
        subtext: 'More transactional',
        nextSceneId: 'ch5_okonkwo_conversation',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['OKONKWO_MARKET_APPROACH'],
        },
      },
    ],
  },

  // Vance Conversation
  {
    id: 'ch5_vance_conversation',
    chapterId: 'chapter_5',
    title: 'Building Trust',
    type: 'dialogue',
    atmosphere: 'party',
    speaker: {
      id: 'vance',
      name: 'Dr. Eleanor Vance',
      mood: 'neutral',
    },
    narrative: `The conversation flows for an hour. Dr. Vance is brilliant, guarded, and deeply skeptical of private equity.

**"I've seen what you people do. Buy a company, load it with debt, cut R&D, flip it in three years. Leave the mess for someone else."**

**"Some firms operate that way. We try not to."**

**"They all say that."**

**"Fair."** You pause. **"What would convince you otherwise?"**

She studies you for a long moment.

**"Come visit the facility. See what we actually do. Meet the engineers who've spent a decade perfecting these implants. Then tell me your brilliant plan to 'unlock value.'"**

**"When?"**

**"Next month. If you can spare time from your spreadsheets."**

*An invitation. That's more than most PE professionals ever get from her.*`,
    choices: [
      {
        id: 'ch5_vance_accept',
        text: 'Accept the invitation enthusiastically',
        nextSceneId: 'ch5_conference_wrapup',
        effects: {
          setFlags: ['VANCE_FACILITY_INVITE'],
          relationships: [{ npcId: 'vance', change: 15, memory: 'Earned an invitation to see the facility' }],
        },
      },
    ],
  },

  // Webb Conversation
  {
    id: 'ch5_webb_conversation',
    chapterId: 'chapter_5',
    title: 'The Secondary Play',
    type: 'dialogue',
    atmosphere: 'party',
    speaker: {
      id: 'webb',
      name: 'Marcus Webb',
      mood: 'neutral',
    },
    narrative: `Marcus Webb is a professional. He's been through this dance before—built ClearPath, took PE money, now navigating the exit.

**"Look, I'll be honest with you,"** he says after twenty minutes of conversation. **"Granite wants out. They've got a good return locked in and their fund is winding down."**

**"And you? What do you want?"**

He pauses. Genuine question, rarely asked.

**"I want to build something bigger. We've got forty labs. I see a path to two hundred. But that takes a partner with real conviction, not just someone looking to flip me in eighteen months."**

**"What if we could structure something where you maintain significant equity?"**

**"Now you're speaking my language."** He pulls out a business card. **"Call my office Monday. Let's have a real conversation."**

*A secondary deal. Less romantic than a founder exit, but potentially faster to close.*`,
    choices: [
      {
        id: 'ch5_webb_accept',
        text: 'Accept and commit to following up',
        nextSceneId: 'ch5_conference_wrapup',
        effects: {
          setFlags: ['WEBB_FOLLOWUP'],
          relationships: [{ npcId: 'webb', change: 15, memory: 'Made a real connection at the conference' }],
        },
      },
    ],
  },

  // Okonkwo Conversation
  {
    id: 'ch5_okonkwo_conversation',
    chapterId: 'chapter_5',
    title: 'The Family Business',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'okonkwo',
      name: 'Patricia Okonkwo',
      mood: 'neutral',
    },
    narrative: `Patricia's story unfolds over the next two hours. A nurse who saw her own mother struggle with inadequate home care. Started HomeFirst with three caregivers and a used minivan. Now employs two hundred people across six locations.

**"My daughter thinks I'm crazy for not selling,"** she admits. **"She's an investment banker at Morgan Stanley. Keeps sending me 'comps.'"**

**"What keeps you going?"**

**"The mission. These aren't just patients—they're someone's mother, father. They deserve dignity."** She sighs. **"But I'm sixty-two. I can't do this forever. And my kids don't want the business."**

**"What would you need to feel comfortable with a transition?"**

She looks at you carefully.

**"Someone who understands that the caregivers are the product. Not the platform, not the technology—the people."**

**"I'd like to learn more. Could I visit one of your locations?"**

**"Perhaps. Call me next week."**

*A handshake seals it. Something about her reminds you of Stanley Kowalski—founders who built something real.*`,
    choices: [
      {
        id: 'ch5_okonkwo_accept',
        text: 'Promise to follow up with genuine interest',
        nextSceneId: 'ch5_conference_wrapup',
        effects: {
          setFlags: ['OKONKWO_FOLLOWUP'],
          relationships: [{ npcId: 'okonkwo', change: 20, memory: 'Listened to my story with genuine interest' }],
        },
      },
    ],
  },

  // Conference Wrapup
  {
    id: 'ch5_conference_wrapup',
    chapterId: 'chapter_5',
    title: 'First Contact',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `*The flight back to New York*

You review your notes. One genuine lead from three days of work. It doesn't sound like much, but in proprietary sourcing, quality beats quantity.

Your phone buzzes. A text from Sarah:

*"Heard you're chasing healthcare. Need any research support? I've been building a home health thesis on the side."*

Interesting. Sarah's always been quietly ambitious.

You also notice an email from Hunter Sterling:

*"Heard about your little field trip to Boston. Cute. While you were networking, I closed a $400M recap. Some of us prefer real work."*

*Hunter. Always watching. Always competing.*`,
    choices: [
      {
        id: 'ch5_accept_sarah_help',
        text: 'Accept Sarah\'s offer to help',
        nextSceneId: 'ch5_due_diligence_begins',
        effects: {
          relationships: [{ npcId: 'sarah', change: 10, memory: 'Brought me onto proprietary deal sourcing' }],
          setFlags: ['SARAH_DD_PARTNER'],
        },
      },
      {
        id: 'ch5_go_alone',
        text: 'Keep this deal close to the chest',
        subtext: 'Work solo for now',
        nextSceneId: 'ch5_due_diligence_begins',
        effects: {
          stats: { stress: 5 },
        },
      },
    ],
  },

  // Due Diligence Begins
  {
    id: 'ch5_due_diligence_begins',
    chapterId: 'chapter_5',
    title: 'The Deep Dive',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Two weeks later*

The site visit exceeded expectations. The business is real. The opportunity is genuine. Now comes the hard part: due diligence.

You've got a preliminary information package from the target. Revenue data, customer lists, employee census, contract summaries. But paper only tells part of the story.

Your diligence checklist is extensive:

**Financial DD** — Quality of Earnings analysis, working capital normalization, revenue sustainability
**Commercial DD** — Customer concentration, competitive positioning, market dynamics
**Operational DD** — Management assessment, systems evaluation, integration complexity
**Legal DD** — Contract review, litigation history, regulatory compliance

*You can't do everything. Time is limited. Where do you focus first?*`,
    choices: [
      {
        id: 'ch5_dd_financial_first',
        text: 'Start with Financial DD',
        subtext: 'Follow the money',
        nextSceneId: 'ch5_qoe_discovery',
        effects: {
          setFlags: ['DD_FINANCIAL_FIRST'],
        },
      },
      {
        id: 'ch5_dd_commercial_first',
        text: 'Start with Commercial DD',
        subtext: 'Understand the market',
        nextSceneId: 'ch5_commercial_discovery',
        effects: {
          setFlags: ['DD_COMMERCIAL_FIRST'],
        },
      },
      {
        id: 'ch5_dd_management_first',
        text: 'Start with Management Assessment',
        subtext: 'People first',
        nextSceneId: 'ch5_management_discovery',
        effects: {
          setFlags: ['DD_MANAGEMENT_FIRST'],
        },
      },
    ],
  },

  // QoE Discovery
  {
    id: 'ch5_qoe_discovery',
    chapterId: 'chapter_5',
    title: 'Following the Money',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Week three of diligence*

You're deep in the Quality of Earnings report when you find it.

The accounting firm has flagged several adjustments:

**Revenue Recognition** — $2.3M in "channel stuffing" in Q4. Product shipped to distributors who haven't actually sold through.

**EBITDA Add-backs** — $1.8M in "one-time" expenses that seem to recur every year. Legal settlements, facility repairs, executive bonuses.

**Working Capital** — Receivables aging has deteriorated significantly. DSO up from 45 to 67 days.

The adjusted EBITDA is 22% lower than presented. Your valuation model just took a significant hit.

*The numbers don't lie. But how you present them to the IC is your choice.*`,
    choices: [
      {
        id: 'ch5_qoe_transparent',
        text: 'Document everything transparently',
        subtext: 'Full disclosure to IC',
        nextSceneId: 'ch5_red_flag_decision',
        style: 'ethical',
        effects: {
          stats: { ethics: 10, dealcraft: 5 },
          setFlags: ['QOE_TRANSPARENT'],
        },
      },
      {
        id: 'ch5_qoe_minimize',
        text: 'Present the issues as manageable',
        subtext: 'Spin control',
        nextSceneId: 'ch5_red_flag_decision',
        style: 'risky',
        effects: {
          stats: { politics: 5 },
          setFlags: ['QOE_MINIMIZED'],
        },
      },
    ],
  },

  // Commercial Discovery
  {
    id: 'ch5_commercial_discovery',
    chapterId: 'chapter_5',
    title: 'The Market View',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Week three of diligence*

Your commercial due diligence calls paint a concerning picture.

**Expert Network Call #1 — Industry Consultant:**
*"The market's getting crowded. Three new entrants in the last eighteen months. Pricing pressure is real."*

**Expert Network Call #2 — Former Customer:**
*"We switched to a competitor last year. Quality was fine, but their service model couldn't scale with us."*

**Expert Network Call #3 — Current Customer:**
*"We're happy, but our contract is up for renewal. We're evaluating options."*

The competitive moat isn't as deep as the management presentation suggested. Customer loyalty is real but fragile.

*Red flags or yellow flags? The interpretation matters.*`,
    choices: [
      {
        id: 'ch5_commercial_transparent',
        text: 'Document competitive concerns clearly',
        subtext: 'Full picture for IC',
        nextSceneId: 'ch5_red_flag_decision',
        style: 'ethical',
        effects: {
          stats: { ethics: 10, dealcraft: 5 },
          setFlags: ['COMMERCIAL_TRANSPARENT'],
        },
      },
      {
        id: 'ch5_commercial_optimize',
        text: 'Focus on the positive customer relationships',
        subtext: 'Emphasize the upside',
        nextSceneId: 'ch5_red_flag_decision',
        style: 'risky',
        effects: {
          stats: { politics: 5 },
          setFlags: ['COMMERCIAL_OPTIMIZED'],
        },
      },
    ],
  },

  // Management Discovery
  {
    id: 'ch5_management_discovery',
    chapterId: 'chapter_5',
    title: 'The People Question',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Week three of diligence*

Your management assessment reveals complexity.

**The Founder** — Brilliant, passionate, but showing signs of burnout. Talks about "stepping back" but hasn't built a succession plan.

**The CFO** — Competent but defensive. Pushes back on every data request. Either protective of something or just exhausted.

**The COO** — Strong operationally, but openly critical of the founder's recent decisions. Potential flight risk if transition is handled poorly.

**The Sales VP** — Left three months ago for a competitor. No one wants to talk about why.

The org chart looks solid. The reality underneath is messier.

*Management is the deal. Everything else is just paper.*`,
    choices: [
      {
        id: 'ch5_management_transparent',
        text: 'Flag management risks in your memo',
        subtext: 'Honest assessment',
        nextSceneId: 'ch5_red_flag_decision',
        style: 'ethical',
        effects: {
          stats: { ethics: 10, politics: 5 },
          setFlags: ['MANAGEMENT_TRANSPARENT'],
        },
      },
      {
        id: 'ch5_management_optimistic',
        text: 'Present management as "coachable"',
        subtext: 'PE-speak for "we\'ll deal with it later"',
        nextSceneId: 'ch5_red_flag_decision',
        style: 'risky',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['MANAGEMENT_OPTIMISTIC'],
        },
      },
    ],
  },

  // Red Flag Decision Point
  {
    id: 'ch5_red_flag_decision',
    chapterId: 'chapter_5',
    title: 'The Crossroads',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Week five. IC presentation in three days.*

You stare at your investment memo draft. The diligence has revealed what diligence always reveals: reality is messier than the pitch.

There's a real business here. Real value. But also real risks that weren't apparent from the CIM.

Chad stops by your desk.

**"IC is Tuesday. Where are you landing?"**

**"The business is real. The risks are manageable. But we need to adjust our entry valuation."**

**"By how much?"**

You pause. This is the moment. The valuation you propose will determine whether this deal happens—and whether your reputation survives if it goes wrong.

*Fortune favors the bold. But boldness without wisdom is just recklessness.*`,
    choices: [
      {
        id: 'ch5_conservative_valuation',
        text: 'Propose a conservative valuation',
        subtext: '15% below asking price',
        nextSceneId: 'ch5_ic_prep',
        style: 'safe',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['CONSERVATIVE_VALUATION'],
        },
      },
      {
        id: 'ch5_aggressive_valuation',
        text: 'Propose an aggressive valuation',
        subtext: 'Match asking price, rely on upside',
        nextSceneId: 'ch5_ic_prep',
        style: 'risky',
        effects: {
          stats: { stress: 10 },
          setFlags: ['AGGRESSIVE_VALUATION'],
        },
      },
      {
        id: 'ch5_walk_away',
        text: 'Recommend passing on the deal',
        subtext: 'Risks outweigh opportunity',
        nextSceneId: 'ch5_walk_away_scene',
        style: 'ethical',
        effects: {
          stats: { ethics: 15, stress: 15 },
          setFlags: ['DEAL_PASSED'],
        },
      },
    ],
  },

  // Walk Away Scene
  {
    id: 'ch5_walk_away_scene',
    chapterId: 'chapter_5',
    title: 'The Hard No',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'neutral',
    },
    narrative: `Chad reads your memo in silence.

**"You're recommending we pass."**

**"The risks are too concentrated. Customer concentration, management gaps, competitive threats. Even at a discounted valuation, the risk-reward doesn't work."**

He sets down the paper.

**"You know how many deals get killed by diligence? Maybe ten percent. The rest just find ways to explain away the problems."**

**"I can't explain these away. Not honestly."**

A long pause.

**"Alright."** He nods slowly. **"You made a call. I respect that. Most people can't walk away from a deal they sourced."**

**"What happens now?"**

**"You find another one. That's the job."**

*A pass isn't a failure. But it doesn't feel like a win either.*`,
    choices: [
      {
        id: 'ch5_pass_accept',
        text: 'Accept the outcome and move forward',
        nextSceneId: 'ch5_chapter_end_pass',
        effects: {
          stats: { reputation: 5 },
          relationships: [{ npcId: 'chad', change: 10, memory: 'Had the courage to kill a bad deal' }],
        },
      },
    ],
  },

  // IC Prep
  {
    id: 'ch5_ic_prep',
    chapterId: 'chapter_5',
    title: 'The Dry Run',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Monday evening. IC prep meeting.*

You've rehearsed the presentation six times. Sarah helped polish the slides (if she's involved) or you did it alone through three sleepless nights.

Chad runs you through the expected questions:

**"What's the bear case?"**
**"How does management feel about the valuation?"**
**"What's the exit path?"**
**"Why isn't this an auction?"**

Each answer needs to be crisp, confident, and honest enough to survive scrutiny.

**"Remember,"** Chad says as you pack up, **"IC doesn't want to be sold. They want to be convinced. Show them you've thought about everything that could go wrong."**

*Tomorrow, you present your first proprietary deal to the Investment Committee.*`,
    choices: [
      {
        id: 'ch5_ic_ready',
        text: 'Get some sleep before the big day',
        nextSceneId: 'ch5_ic_presentation',
        effects: {
          stats: { stress: -5 },
        },
      },
      {
        id: 'ch5_ic_more_prep',
        text: 'Stay late and keep preparing',
        subtext: 'Perfectionism or paranoia?',
        nextSceneId: 'ch5_ic_presentation',
        effects: {
          stats: { stress: 10, dealcraft: 5 },
        },
      },
    ],
  },

  // IC Presentation
  {
    id: 'ch5_ic_presentation',
    chapterId: 'chapter_5',
    title: 'The Investment Committee',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Tuesday. 10 AM. The Sterling Partners Investment Committee.*

Seven partners around the mahogany table. Hunter Sterling sits in the corner, observer status, watching for any sign of weakness.

You present for forty-five minutes. The thesis, the opportunity, the risks, the mitigation strategies.

Then the questions begin.

**"Your Quality of Earnings adjustment is aggressive. What if the revenue recognition issues are structural, not one-time?"**

**"The founder wants to stay on. What's your conviction level on that working?"**

**"There's no banker. If we lose exclusivity, what's our fallback?"**

Each question is a test. Not just of the deal—of you.

Finally, the managing partner speaks.

**"You've done serious work here. The question is: are you betting your reputation on this company?"**

*Everyone is watching. This is your moment.*`,
    choices: [
      {
        id: 'ch5_ic_full_conviction',
        text: '"Yes. I believe in this deal."',
        subtext: 'Full conviction',
        nextSceneId: 'ch5_ic_outcome',
        style: 'risky',
        effects: {
          stats: { reputation: 10 },
          setFlags: ['IC_FULL_CONVICTION'],
        },
      },
      {
        id: 'ch5_ic_measured',
        text: '"I believe the risk-adjusted return is compelling."',
        subtext: 'Measured confidence',
        nextSceneId: 'ch5_ic_outcome',
        style: 'safe',
        effects: {
          stats: { dealcraft: 5, politics: 5 },
          setFlags: ['IC_MEASURED'],
        },
      },
    ],
  },

  // IC Outcome
  {
    id: 'ch5_ic_outcome',
    chapterId: 'chapter_5',
    title: 'The Verdict',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The managing partner polls the room.

Hands go up. One by one.

**"The motion carries. You're approved to proceed with an LOI at the proposed valuation."**

You try not to show too much relief. In the corner, Hunter's jaw tightens slightly. He voted no.

Chad catches your eye and gives an almost imperceptible nod.

**"One condition,"** the managing partner adds. **"Confirmatory diligence has a hard stop at sixty days. If you can't close by then, we walk."**

**"Understood."**

**"Good luck. You're going to need it."**

*You just got your first proprietary deal through IC. Now you have to close it.*`,
    choices: [
      {
        id: 'ch5_ic_celebrate',
        text: 'Celebrate briefly with the team',
        nextSceneId: 'ch5_loi_negotiation',
        effects: {
          stats: { stress: -10 },
          achievement: 'IC_APPROVED',
        },
      },
      {
        id: 'ch5_ic_focus',
        text: 'Skip the celebration—focus on the LOI',
        nextSceneId: 'ch5_loi_negotiation',
        effects: {
          stats: { dealcraft: 5 },
        },
      },
    ],
  },

  // LOI Negotiation
  {
    id: 'ch5_loi_negotiation',
    chapterId: 'chapter_5',
    title: 'Term Sheet',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*The Letter of Intent negotiation*

Three days of back-and-forth with the seller's counsel. Every term is contested.

**Exclusivity period** — You want 90 days, they offer 45. You settle on 60.

**Working capital adjustment** — Complex formulas, trailing averages, peg amounts. Their CFO fights every line.

**Management rollover** — The founder wants 25% of the equity. Standard is 15-20%. This will require a conversation.

**Non-compete provisions** — Three years or five? Geographic scope? Definitions that will matter if things go wrong.

Finally, at 2 AM on a Thursday, the LOI is signed.

You're now in exclusivity. Sixty days to close—or lose everything.

*The hunt was just the beginning. Now comes the kill.*`,
    choices: [
      {
        id: 'ch5_loi_complete',
        text: 'Move into confirmatory diligence',
        nextSceneId: 'ch5_chapter_end',
        effects: {
          stats: { dealcraft: 10, reputation: 5 },
          setFlags: ['LOI_SIGNED'],
        },
      },
    ],
  },

  // Chapter End - Success
  {
    id: 'ch5_chapter_end',
    chapterId: 'chapter_5',
    title: 'The Hunter Becomes...',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `*Late evening. Your office.*

The LOI sits on your desk, fully executed. Your first proprietary deal, sourced from a cold conference approach to signed term sheet in eight weeks.

Chad stops by on his way out.

**"Not bad. Not bad at all."**

**"Thanks."**

**"Don't thank me yet. You've got sixty days and about forty things that can still kill this deal."** He pauses at the door. **"But you did something most VPs never do. You created value instead of just processing it."**

He leaves. You look at the tombstones on your wall—still empty.

*Maybe soon you'll add one.*

**CHAPTER 5 COMPLETE**

*You've learned the hardest lesson in private equity: the best deals aren't bought—they're built. Relationship by relationship. Insight by insight. Trust by trust.*

*The LOI is signed. But the hunt never really ends.*`,
    choices: [],
    requiresAcknowledgment: true,
  },

  // Chapter End - Pass path
  {
    id: 'ch5_chapter_end_pass',
    chapterId: 'chapter_5',
    title: 'The One That Got Away',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `*Two weeks later*

You hear through the grapevine that another PE firm bought the company. At the valuation you walked away from.

Part of you wonders if you made a mistake. The other part remembers the diligence findings—the risks you couldn't unsee.

Chad finds you in the coffee room.

**"Heard about the deal. Having regrets?"**

**"Some."**

**"Don't."** He pours himself a cup. **"In this business, the deals that kill you are the ones you should have passed on but didn't. You'll find another opportunity. And when you do, you'll know what real conviction feels like."**

**"And if I don't find one?"**

**"Then you'll learn that too. That's how this works."**

**CHAPTER 5 COMPLETE**

*Sometimes the best deal is the one you don't do. You learned to trust your diligence over your desire to close.*

*Not every hunt ends with a kill. But every hunter gets better with practice.*`,
    choices: [],
    requiresAcknowledgment: true,
  },
];

// ============================================================================
// CHAPTER 6: THE SYNDICATE - Club Deal / Multi-Sponsor LBO
// ============================================================================

const CHAPTER_6_SCENES: Scene[] = [
  // Opening - The Whale surfaces
  {
    id: 'ch6_opening',
    chapterId: 'chapter_6',
    title: 'The Whale',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Six months after your first proprietary deal closed*

The Monday morning partners' meeting. Usually routine—portfolio updates, market commentary, the occasional argument about valuation multiples.

Today is different.

The managing partner stands at the head of the table, a single slide on the screen behind him:

**PROJECT ATLAS**
**Enterprise Value: $8.2 Billion**
**Equity Required: $2.4 Billion**

The room goes quiet. This isn't a deal. This is a *whale*.

**"Prometheus Technologies,"** he says. **"Global industrial software. Market leader in manufacturing execution systems. The founder wants to take it private."**

*$2.4 billion in equity. Sterling's entire fund is $3.5 billion. This would be the largest deal in firm history.*`,
    choices: [
      {
        id: 'ch6_opening_continue',
        text: 'Listen to the opportunity',
        nextSceneId: 'ch6_whale_details',
      },
    ],
  },

  // Whale Details
  {
    id: 'ch6_whale_details',
    chapterId: 'chapter_6',
    title: 'The Opportunity',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The managing partner continues:

**"Prometheus has 40% market share in MES software. $1.2 billion revenue, growing 15% annually. EBITDA margins north of 35%. Sticky customer base—average contract length is seven years."**

Numbers scroll across the screen. It's a beautiful business.

**"The founder, Victor Chen, built this over thirty years. He's sixty-eight, no succession plan, and tired of quarterly earnings calls. He wants a partner who'll let him finish his legacy without Wall Street breathing down his neck."**

Chad leans forward. **"What's the catch?"**

**"Two catches. First: the equity check. We can't do this alone—not without putting 70% of our fund in one deal. We need co-investors."**

**"And second?"**

**"We're not the only ones who got the call. Blackrock Capital and Titan Partners are both circling. If we want this, we need to move fast—and we need a consortium."**

*A club deal. Multiple PE sponsors sharing economics, governance, and risk. Also sharing credit... and blame.*`,
    choices: [
      {
        id: 'ch6_interested',
        text: 'Express strong interest',
        nextSceneId: 'ch6_assignment',
        effects: {
          stats: { dealcraft: 5 },
        },
      },
      {
        id: 'ch6_cautious',
        text: 'Ask about consortium dynamics',
        subtext: 'Show you understand the complexity',
        nextSceneId: 'ch6_assignment',
        effects: {
          stats: { politics: 5 },
        },
      },
    ],
  },

  // Assignment
  {
    id: 'ch6_assignment',
    chapterId: 'chapter_6',
    title: 'Your Role',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'chad',
      name: 'Chad Morrison',
      mood: 'neutral',
    },
    narrative: `After the meeting, Chad catches you in the hallway.

**"You're on the deal team. Congratulations."**

**"Seriously?"**

**"Don't look so surprised. You closed your proprietary deal. You've proven you can source and execute."** He pauses. **"But this is different. This is a club deal. Politics matter as much as numbers."**

**"What do you need from me?"**

**"Two things. First: build the model. I want a full LBO with sensitivities by end of week. Second..."** He looks at you seriously. **"I need you to help manage our co-investor relationships. We're bringing in Meridian Capital as a partner."**

**"Meridian? Aren't they our competitors?"**

**"Today's competitor is tomorrow's co-investor. That's how mega-deals work."** He hands you a folder. **"Their deal lead is someone named Alexandra Reyes. Apparently she's... intense."**

*Club deals: where you share a bed with people who'd happily steal your sheets.*`,
    choices: [
      {
        id: 'ch6_accept_assignment',
        text: 'Accept the assignment',
        nextSceneId: 'ch6_model_building',
        effects: {
          setFlags: ['ATLAS_DEAL_TEAM'],
        },
      },
    ],
  },

  // Model Building
  {
    id: 'ch6_model_building',
    chapterId: 'chapter_6',
    title: 'The Numbers',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Three days of modeling. Minimal sleep. Maximum caffeine.*

The LBO model comes together piece by piece:

**Sources & Uses:**
- Senior Debt: $4.2B (5.1x EBITDA)
- Mezzanine: $800M
- Equity: $2.4B (Sterling: $800M, Meridian: $800M, Management: $800M)
- Total: $8.2B

**Returns Analysis:**
- Base Case: 2.3x / 18% IRR over 5 years
- Upside Case: 3.1x / 25% IRR (assumes margin expansion)
- Downside Case: 1.4x / 8% IRR (assumes growth slowdown)

The math works. Barely. Everything depends on maintaining those 35% margins while growing revenue.

Your phone buzzes. A text from an unknown number:

*"This is Alexandra Reyes, Meridian. Heard you're running point on the model. We should sync before the consortium call tomorrow. Coffee? — AR"*

*The co-investor wants to meet. This could be collaborative... or competitive intelligence gathering.*`,
    choices: [
      {
        id: 'ch6_meet_alexandra',
        text: 'Agree to meet Alexandra',
        nextSceneId: 'ch6_alexandra_meeting',
        effects: {
          setFlags: ['MET_ALEXANDRA_EARLY'],
        },
      },
      {
        id: 'ch6_decline_meeting',
        text: 'Suggest meeting after the consortium call',
        subtext: 'Keep your cards close',
        nextSceneId: 'ch6_consortium_call',
        effects: {
          stats: { politics: 5 },
          setFlags: ['DECLINED_ALEXANDRA'],
        },
      },
    ],
  },

  // Alexandra Meeting
  {
    id: 'ch6_alexandra_meeting',
    chapterId: 'chapter_6',
    title: 'The Competition',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'alexandra',
      name: 'Alexandra Reyes',
      mood: 'neutral',
    },
    narrative: `*A coffee shop near Grand Central. Neutral territory.*

Alexandra Reyes is already there when you arrive—sharp suit, sharper eyes, a laptop open with what looks suspiciously like the same model you've been building.

**"Thanks for meeting,"** she says without preamble. **"Let's skip the pleasantries. We both know why we're here."**

**"The deal."**

**"The deal. And more specifically: who leads it."** She leans forward. **"Sterling wants to be lead sponsor. So does Meridian. We can't both be captain."**

**"What are you proposing?"**

**"Information sharing. Real information. You show me your model assumptions, I show you ours. We find common ground before tomorrow's call, we present a united front."**

**"And if we disagree?"**

**"Then we have that fight in private, not in front of the seller."** She smiles, thin and professional. **"I've seen club deals blow up because sponsors couldn't align. I don't intend to let that happen here."**

*She's smart. The question is whether she's trustworthy.*`,
    choices: [
      {
        id: 'ch6_share_model',
        text: 'Share your model assumptions',
        subtext: 'Build trust through transparency',
        nextSceneId: 'ch6_alexandra_alignment',
        style: 'ethical',
        effects: {
          stats: { ethics: 5 },
          relationships: [{ npcId: 'alexandra', change: 15, memory: 'Was transparent from the start' }],
          setFlags: ['SHARED_WITH_ALEXANDRA'],
        },
      },
      {
        id: 'ch6_partial_share',
        text: 'Share high-level assumptions only',
        subtext: 'Cautious collaboration',
        nextSceneId: 'ch6_alexandra_alignment',
        effects: {
          stats: { politics: 5 },
          relationships: [{ npcId: 'alexandra', change: 5, memory: 'Was cautious but professional' }],
        },
      },
      {
        id: 'ch6_deflect',
        text: 'Deflect and gather her assumptions first',
        subtext: 'Information asymmetry',
        nextSceneId: 'ch6_alexandra_tense',
        style: 'risky',
        effects: {
          stats: { dealcraft: 5 },
          relationships: [{ npcId: 'alexandra', change: -10, memory: 'Tried to play games with me' }],
          setFlags: ['ALEXANDRA_SUSPICIOUS'],
        },
      },
    ],
  },

  // Alexandra Alignment
  {
    id: 'ch6_alexandra_alignment',
    chapterId: 'chapter_6',
    title: 'Finding Common Ground',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'alexandra',
      name: 'Alexandra Reyes',
      mood: 'happy',
    },
    narrative: `An hour later, you've compared models. The good news: your assumptions are within 5% on most metrics.

**"Your revenue growth is more aggressive than ours,"** Alexandra notes. **"We're at 12%, you're at 15%."**

**"Management guidance was 15%. You're haircutting it?"**

**"Always."** She shrugs. **"Founders are optimists. That's how they build companies. It's also how they get PE firms to overpay."**

**"Fair point."**

**"Here's what I propose: we align on 13% growth, split the difference. Present a unified view to the consortium."**

**"And the lead sponsor question?"**

She pauses.

**"Let's table that for now. Get through the consortium call, prove we can work together. Then we figure out governance."**

*A reasonable proposal. Or a delay tactic. Hard to tell.*`,
    choices: [
      {
        id: 'ch6_agree_alignment',
        text: 'Agree to the unified approach',
        nextSceneId: 'ch6_consortium_call',
        effects: {
          relationships: [{ npcId: 'alexandra', change: 10, memory: 'We found common ground early' }],
          setFlags: ['ALEXANDRA_ALIGNED'],
        },
      },
    ],
  },

  // Alexandra Tense
  {
    id: 'ch6_alexandra_tense',
    chapterId: 'chapter_6',
    title: 'Trust Issues',
    type: 'dialogue',
    atmosphere: 'crisis',
    speaker: {
      id: 'alexandra',
      name: 'Alexandra Reyes',
      mood: 'angry',
    },
    narrative: `Alexandra's expression hardens.

**"I see. You want to play games."**

**"I'm just being careful—"**

**"You're being a typical Sterling VP."** She closes her laptop. **"I came here in good faith. I offered collaboration. And you're treating me like a competitor instead of a partner."**

**"We are competitors."**

**"Not on this deal. On this deal, we're married whether we like it or not."** She stands. **"Remember that when things get difficult. And they will get difficult."**

She leaves without another word.

*You may have just made the next three months significantly harder.*`,
    choices: [
      {
        id: 'ch6_tense_continue',
        text: 'Head to the consortium call',
        nextSceneId: 'ch6_consortium_call',
        effects: {
          stats: { stress: 10 },
        },
      },
    ],
  },

  // Consortium Call
  {
    id: 'ch6_consortium_call',
    chapterId: 'chapter_6',
    title: 'The Consortium',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*The consortium call. Three PE firms, one target, and $8.2 billion on the line.*

On the line:
- **Sterling Partners** (you, Chad, the managing partner)
- **Meridian Capital** (Alexandra, their senior partner Marcus Webb—wait, you know that name)
- **Apex Equity** (a smaller growth-oriented fund looking for co-invest allocation)

The managing partner leads:

**"Gentlemen, ladies—we have a unique opportunity here. Prometheus is a generational asset. The question is whether we can align quickly enough to present a unified bid."**

Marcus Webb's voice comes through the speaker—deep, confident:

**"Meridian agrees. We propose a 40/40/20 split. Sterling and Meridian as co-leads, Apex as a minority co-investor."**

The Apex partner pushes back: **"We want 25% minimum. We have sector expertise that—"**

**"Your fund is $800 million. You can't write a $600 million check."**

The call descends into negotiation. Economics. Governance. Board seats. Veto rights.

*Someone needs to mediate. Or this consortium falls apart before it starts.*`,
    choices: [
      {
        id: 'ch6_mediate',
        text: 'Propose a compromise structure',
        subtext: 'Step up as the dealmaker',
        nextSceneId: 'ch6_mediation',
        effects: {
          stats: { politics: 10, dealcraft: 5 },
          setFlags: ['CONSORTIUM_MEDIATOR'],
        },
      },
      {
        id: 'ch6_stay_quiet',
        text: 'Let the senior partners negotiate',
        subtext: 'Stay in your lane',
        nextSceneId: 'ch6_mediation',
        effects: {
          stats: { politics: -5 },
        },
      },
      {
        id: 'ch6_push_sterling',
        text: 'Advocate strongly for Sterling\'s position',
        subtext: 'Loyalty over diplomacy',
        nextSceneId: 'ch6_mediation_tense',
        effects: {
          stats: { stress: 5 },
          relationships: [{ npcId: 'chad', change: 10, memory: 'Fought for our position' }],
          setFlags: ['STERLING_ADVOCATE'],
        },
      },
    ],
  },

  // Mediation
  {
    id: 'ch6_mediation',
    chapterId: 'chapter_6',
    title: 'The Compromise',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `You take a breath and speak up:

**"What if we structure this differently? 35/35/15 equity split, with the remaining 15% reserved for management rollover. That gives everyone meaningful economics while ensuring management alignment."**

Silence on the line. Then Marcus Webb:

**"Interesting. But who leads? Two co-leads never works."**

**"What if lead sponsor rotates by function? Sterling leads deal execution and financing. Meridian leads operational improvement and value creation. Joint governance committee with tie-breaker provisions."**

More silence. Then Alexandra's voice:

**"That... could work. We'd need to define the committee structure carefully."**

The Apex partner: **"And our board seat?"**

**"Observer seat with upgrade to full seat if you exercise your pro-rata in future add-ons."**

The managing partner mutes the line. **"Where did that come from?"**

**"I've been thinking about it."**

He unmutes. **"Gentlemen, we have a framework. Let's draft a consortium agreement."**

*You just shaped an $8 billion deal structure. Not bad for a VP.*`,
    choices: [
      {
        id: 'ch6_mediation_success',
        text: 'Help draft the consortium agreement',
        nextSceneId: 'ch6_founder_meeting',
        effects: {
          stats: { reputation: 10 },
          achievement: 'CONSORTIUM_ARCHITECT',
        },
      },
    ],
  },

  // Mediation Tense
  {
    id: 'ch6_mediation_tense',
    chapterId: 'chapter_6',
    title: 'The Standoff',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `Your advocacy for Sterling's position doesn't go unnoticed—or appreciated.

**"Sterling seems to want lead economics without lead responsibilities,"** Marcus Webb observes coldly.

**"We sourced this relationship—"** Chad begins.

**"You got the same call we did. From the same banker. Let's not rewrite history."**

The call deteriorates. Positions harden. After ninety minutes, no agreement.

The managing partner mutes the line.

**"This is falling apart. We need a compromise or we lose the deal entirely."**

He looks at you.

**"You got us into this position. Any ideas for getting us out?"**

*The consortium is fracturing. Without alignment, Prometheus goes to someone else.*`,
    choices: [
      {
        id: 'ch6_propose_compromise',
        text: 'Propose a face-saving compromise',
        nextSceneId: 'ch6_founder_meeting',
        effects: {
          stats: { politics: 10, stress: 10 },
          setFlags: ['RECOVERED_CONSORTIUM'],
        },
      },
      {
        id: 'ch6_hold_firm',
        text: 'Recommend holding firm',
        subtext: 'They need us as much as we need them',
        nextSceneId: 'ch6_founder_meeting_tense',
        style: 'risky',
        effects: {
          stats: { stress: 15 },
          setFlags: ['CONSORTIUM_TENSE'],
        },
      },
    ],
  },

  // Founder Meeting
  {
    id: 'ch6_founder_meeting',
    chapterId: 'chapter_6',
    title: 'Meeting the Founder',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Two weeks later. Prometheus Technologies headquarters. Palo Alto.*

Victor Chen's office is surprisingly modest for a billionaire—books everywhere, family photos, a whiteboard covered in product diagrams.

The consortium presents united: Sterling, Meridian, Apex. Three firms, one voice.

Chen listens to the pitch—the vision, the resources, the commitment to his legacy—with the patience of a man who's heard many pitches.

Finally, he speaks:

**"You're not the only group interested. Blackrock came in yesterday with a higher headline number."**

The managing partner doesn't flinch. **"What matters more to you: the highest price or the right partner?"**

**"Both, ideally."** A thin smile. **"But you're right. I didn't build this company to sell it to the highest bidder. I want to know it'll be in good hands."**

He looks around the room, his gaze settling on you.

**"You. The young one. Why should I trust your consortium with my life's work?"**

*The founder is testing you. Everyone is watching.*`,
    choices: [
      {
        id: 'ch6_honest_answer',
        text: 'Give an honest, personal answer',
        subtext: 'Speak from experience',
        nextSceneId: 'ch6_founder_response',
        style: 'ethical',
        effects: {
          stats: { ethics: 10 },
          relationships: [{ npcId: 'victor', change: 20, memory: 'Spoke honestly about stewardship' }],
          setFlags: ['VICTOR_TRUST_HONEST'],
        },
      },
      {
        id: 'ch6_strategic_answer',
        text: 'Focus on strategic value-add',
        subtext: 'Professional and polished',
        nextSceneId: 'ch6_founder_response',
        effects: {
          stats: { dealcraft: 10 },
          relationships: [{ npcId: 'victor', change: 10, memory: 'Gave a competent presentation' }],
          setFlags: ['VICTOR_TRUST_STRATEGIC'],
        },
      },
    ],
  },

  // Founder Meeting Tense
  {
    id: 'ch6_founder_meeting_tense',
    chapterId: 'chapter_6',
    title: 'Meeting the Founder',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `*Two weeks later. Prometheus Technologies headquarters. The consortium barely held together.*

The tension in the room is palpable. Sterling and Meridian agreed to terms, but the relationship is strained. Victor Chen notices immediately.

**"Interesting dynamic in this room,"** he observes. **"You don't seem like a unified team."**

The managing partner smooths over: **"Every partnership has creative tension—"**

**"I've been married forty years. I know the difference between creative tension and a relationship on the rocks."**

He stands, walks to the window.

**"I'll be honest. Blackrock is offering more. Their consortium seems more... aligned. Why should I choose you?"**

*The deal is slipping away. Someone needs to salvage this.*`,
    choices: [
      {
        id: 'ch6_salvage_honest',
        text: 'Acknowledge the tension honestly',
        subtext: 'Transparency might be your only play',
        nextSceneId: 'ch6_founder_response',
        style: 'ethical',
        effects: {
          stats: { ethics: 15, stress: 10 },
          relationships: [{ npcId: 'victor', change: 15, memory: 'Was honest about the challenges' }],
          setFlags: ['VICTOR_TRUST_HONEST'],
        },
      },
      {
        id: 'ch6_salvage_pivot',
        text: 'Pivot to your unique value proposition',
        nextSceneId: 'ch6_founder_response',
        effects: {
          stats: { dealcraft: 10 },
          relationships: [{ npcId: 'victor', change: 5, memory: 'Tried to deflect from the obvious' }],
        },
      },
    ],
  },

  // Founder Response
  {
    id: 'ch6_founder_response',
    chapterId: 'chapter_6',
    title: 'The Test',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'victor',
      name: 'Victor Chen',
      mood: 'neutral',
    },
    narrative: `Victor Chen listens. Really listens—not the performative listening of someone waiting to talk.

When you finish, he's quiet for a long moment.

**"You know what I've learned in thirty years of building this company? The technical problems are never the hard part. It's the people problems. The trust problems."**

He looks at the consortium members.

**"I'm not selling to a spreadsheet. I'm trusting people with the careers of three thousand employees. With technology that took decades to perfect."**

He turns back to you.

**"You gave me a real answer. Not a polished pitch. I appreciate that."**

The managing partner speaks: **"Does that mean—"**

**"It means you're still in the running. But I have conditions. And they're not about price."**

*Victor Chen is going to make this deal on his terms. The question is whether you can live with them.*`,
    choices: [
      {
        id: 'ch6_hear_conditions',
        text: 'Ask about his conditions',
        nextSceneId: 'ch6_founder_conditions',
      },
    ],
  },

  // Founder Conditions
  {
    id: 'ch6_founder_conditions',
    chapterId: 'chapter_6',
    title: 'The Conditions',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'victor',
      name: 'Victor Chen',
      mood: 'neutral',
    },
    narrative: `Victor outlines his requirements:

**"First: no layoffs in the first year. My people stayed loyal through four recessions. I won't reward that with pink slips."**

**"Second: R&D budget stays at 18% of revenue. This company wins on innovation, not cost-cutting."**

**"Third: I stay as Chairman for three years. Advisory role, not operational—but I want a voice on major strategic decisions."**

**"Fourth..."** He pauses. **"My daughter, Michelle, runs our Asia Pacific business. She's not ready to be CEO—not yet—but I want a path for her. Mentorship. Development. Real consideration when the time comes."**

The managing partner shifts uncomfortably. These aren't typical LBO terms.

**"Victor, some of these conditions will impact our returns—"**

**"I know exactly how they'll impact your returns. I also know what this company is worth to the right buyer. Take it or leave it."**

*The founder has leverage, and he knows it. The consortium needs to decide how badly they want this deal.*`,
    choices: [
      {
        id: 'ch6_accept_conditions',
        text: 'Advocate for accepting the conditions',
        subtext: 'The deal is worth the constraints',
        nextSceneId: 'ch6_consortium_debate',
        style: 'ethical',
        effects: {
          stats: { ethics: 10 },
          relationships: [{ npcId: 'victor', change: 15, memory: 'Supported my conditions' }],
          setFlags: ['ACCEPTED_VICTOR_TERMS'],
        },
      },
      {
        id: 'ch6_negotiate_conditions',
        text: 'Suggest negotiating the terms',
        subtext: 'Find middle ground',
        nextSceneId: 'ch6_consortium_debate',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['NEGOTIATED_VICTOR_TERMS'],
        },
      },
      {
        id: 'ch6_push_back',
        text: 'Push back firmly on the constraints',
        subtext: 'Protect fund economics',
        nextSceneId: 'ch6_consortium_debate_tense',
        style: 'risky',
        effects: {
          stats: { stress: 10 },
          relationships: [{ npcId: 'victor', change: -15, memory: 'Pushed back on my life\'s work' }],
          setFlags: ['REJECTED_VICTOR_TERMS'],
        },
      },
    ],
  },

  // Consortium Debate
  {
    id: 'ch6_consortium_debate',
    chapterId: 'chapter_6',
    title: 'The Partners\' Debate',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Back in New York. Emergency consortium call.*

**Sterling's Position:**
Chad argues the conditions are manageable. *"The no-layoffs provision has a one-year sunset. R&D commitment is already in our model. Victor as Chairman is actually helpful—keeps customer relationships warm."*

**Meridian's Position:**
Alexandra pushes back. *"The daughter clause is a governance nightmare. We can't commit to CEO succession three years out. What if she's not ready? What if she's terrible?"*

**Apex's Position:**
*"We're a minority investor. We'll support whatever the leads decide."*

The debate goes in circles. Economics versus relationships. Returns versus reputation.

Finally, the managing partner turns to you.

**"You've spent the most time with Victor. What's your read? Can we live with these terms—and will he budge if we push?"**

*Your opinion will shape the consortium's approach.*`,
    choices: [
      {
        id: 'ch6_recommend_accept',
        text: 'Recommend accepting with minor clarifications',
        subtext: 'He won\'t budge on the fundamentals',
        nextSceneId: 'ch6_term_sheet',
        effects: {
          stats: { reputation: 10 },
          setFlags: ['RECOMMENDED_ACCEPT'],
        },
      },
      {
        id: 'ch6_recommend_negotiate',
        text: 'Recommend targeted negotiation',
        subtext: 'Push on the daughter clause specifically',
        nextSceneId: 'ch6_term_sheet_negotiation',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['RECOMMENDED_NEGOTIATE'],
        },
      },
    ],
  },

  // Consortium Debate Tense
  {
    id: 'ch6_consortium_debate_tense',
    chapterId: 'chapter_6',
    title: 'The Breaking Point',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `Your pushback in the room created a rift. Victor's expression hardened. The meeting ended without agreement.

*Back in New York. Emergency consortium call.*

**"You may have just cost us this deal,"** Alexandra says flatly.

**"The terms were unreasonable—"**

**"The terms were his prerogative. It's his company. His legacy. You treated it like a negotiation over office supplies."**

The managing partner intervenes: **"What's done is done. Question is: can we recover?"**

Chad speaks up: **"Victor's banker called. He's still willing to talk, but he wants an apology. From us. For 'not respecting his vision.'"**

*Swallowing pride might save the deal. Or it might just delay the inevitable.*`,
    choices: [
      {
        id: 'ch6_apologize',
        text: 'Recommend apologizing and re-engaging',
        nextSceneId: 'ch6_term_sheet_recovery',
        effects: {
          stats: { stress: 15, politics: 10 },
          setFlags: ['APOLOGIZED_TO_VICTOR'],
        },
      },
      {
        id: 'ch6_walk',
        text: 'Recommend walking away',
        subtext: 'Some deals aren\'t worth the compromise',
        nextSceneId: 'ch6_walk_away',
        effects: {
          stats: { ethics: 10 },
          setFlags: ['WALKED_FROM_ATLAS'],
        },
      },
    ],
  },

  // Term Sheet
  {
    id: 'ch6_term_sheet',
    chapterId: 'chapter_6',
    title: 'The Term Sheet',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Two weeks of document negotiation. Lawyers billing by the minute.*

The consortium term sheet comes together:

**Economics:**
- Purchase price: $8.2B (7.8x LTM EBITDA)
- Equity split: Sterling 35%, Meridian 35%, Apex 15%, Management 15%
- Debt: $4.2B senior + $800M mezzanine

**Victor's Conditions (Accepted):**
- No workforce reductions in Year 1
- R&D minimum at 18% of revenue
- Victor as Chairman for 3 years
- Career development path for Michelle Chen (no CEO commitment)

**Governance:**
- Joint Sterling-Meridian board control
- Unanimous consent required for: CEO changes, acquisitions >$500M, dividends
- Quarterly operating committee reviews

The signing happens at 2 AM on a Thursday. Handshakes. Photographs. Champagne nobody really wants.

**"Congratulations,"** Victor says quietly as the crowd disperses. **"Now the real work begins."**

*The term sheet is signed. But this consortium will be tested.*`,
    choices: [
      {
        id: 'ch6_term_sheet_complete',
        text: 'Celebrate briefly with the team',
        nextSceneId: 'ch6_consortium_crisis',
        effects: {
          stats: { stress: -10 },
          achievement: 'MEGA_DEAL_SIGNED',
        },
      },
    ],
  },

  // Term Sheet Negotiation
  {
    id: 'ch6_term_sheet_negotiation',
    chapterId: 'chapter_6',
    title: 'The Compromise',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `Your recommendation to negotiate the daughter clause proves prescient. Victor, it turns out, was testing you.

**"I wanted to see if you'd push back,"** he admits in a follow-up call. **"Anyone who accepts everything isn't thinking critically. Michelle knows she's not ready for CEO. She told me that herself."**

The revised terms:
- Michelle gets a seat on the operating committee (not the board)
- Executive coaching and development program funded by the consortium
- "Consideration" for senior leadership roles as they open—no promises

Victor signs.

**"You handled that well,"** Alexandra admits after the call. **"I misjudged you."**

**"We're partners now. Let's make it work."**

*The term sheet is signed. But the real test is still coming.*`,
    choices: [
      {
        id: 'ch6_negotiation_complete',
        text: 'Move forward with the deal',
        nextSceneId: 'ch6_consortium_crisis',
        effects: {
          stats: { dealcraft: 10, reputation: 5 },
          relationships: [{ npcId: 'alexandra', change: 15, memory: 'Earned my respect through smart negotiation' }],
          achievement: 'MEGA_DEAL_SIGNED',
        },
      },
    ],
  },

  // Term Sheet Recovery
  {
    id: 'ch6_term_sheet_recovery',
    chapterId: 'chapter_6',
    title: 'The Apology',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `The apology call is uncomfortable. You take point—it was your pushback that caused the rift.

**"Mr. Chen, I want to apologize. I approached our discussion as a negotiation when I should have approached it as a partnership conversation. I disrespected your vision for the company, and that was wrong."**

Silence on the line. Then:

**"I've had a lot of people try to buy my company over the years. Most of them saw numbers on a page. You..."** He pauses. **"You made a mistake. You're owning it. That tells me something."**

**"Does it tell you enough to continue the conversation?"**

**"Send me revised terms. We'll see."**

*The door reopened. Barely. The final terms are less favorable—but the deal survives.*`,
    choices: [
      {
        id: 'ch6_recovery_complete',
        text: 'Push forward with revised terms',
        nextSceneId: 'ch6_consortium_crisis',
        effects: {
          stats: { stress: 10, politics: 10 },
          relationships: [{ npcId: 'victor', change: 10, memory: 'Had the courage to apologize' }],
          setFlags: ['DEAL_RECOVERED'],
        },
      },
    ],
  },

  // Walk Away
  {
    id: 'ch6_walk_away',
    chapterId: 'chapter_6',
    title: 'The Walk',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `The consortium disbands. Meridian and Apex are furious. Chad is disappointed. The managing partner says nothing, which is worse.

Two months later, you hear Blackrock closed the Prometheus deal. $8.5 billion. They accepted all of Victor's conditions without pushback.

The industry press calls it "transformational." You try not to read the articles.

Hunter Sterling finds you in the break room.

**"Heard you walked from Atlas. Bold move."** His smile is sharp. **"Some people might say stupid. But bold."**

**"Did you have a point?"**

**"Just that the Partners' meeting next week is going to be interesting. Walking from an $8 billion deal tends to come up in performance reviews."**

*Some lessons cost more than others. This one might cost your career.*`,
    choices: [
      {
        id: 'ch6_walk_accept',
        text: 'Face the consequences',
        nextSceneId: 'ch6_chapter_end_walk',
        effects: {
          stats: { stress: 20, reputation: -15 },
          relationships: [{ npcId: 'chad', change: -10, memory: 'Walked from a career-defining deal' }],
        },
      },
    ],
  },

  // Consortium Crisis
  {
    id: 'ch6_consortium_crisis',
    chapterId: 'chapter_6',
    title: 'The Crisis',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `*Three weeks before closing. Everything is falling apart.*

A consortium call. Emergency status.

**"We have a problem,"** the Meridian senior partner announces. **"Our credit committee is balking at the debt terms. They want to reduce our equity commitment by $200 million."**

Chad responds: **"That blows up the capital structure. We'd need to find replacement equity in three weeks."**

**"Or reduce the purchase price."**

**"Victor won't accept a price cut. He has competing bids."**

**"Then Sterling needs to step up and fill the gap."**

The managing partner mutes the line.

**"If we fill Meridian's gap, we're at 45% of the deal. That's concentration risk the LPs will scream about."**

**"And if we don't?"**

**"The deal dies. Three months of work, down the drain."**

*The consortium is fracturing at the worst possible moment. Someone needs to find a solution.*`,
    choices: [
      {
        id: 'ch6_fill_gap',
        text: 'Recommend Sterling fills the gap',
        subtext: 'Concentration risk, but saves the deal',
        nextSceneId: 'ch6_crisis_resolution',
        effects: {
          stats: { dealcraft: 10, stress: 10 },
          setFlags: ['STERLING_FILLED_GAP'],
        },
      },
      {
        id: 'ch6_find_replacement',
        text: 'Propose finding replacement capital',
        subtext: 'Risky timeline',
        nextSceneId: 'ch6_find_capital',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['SOUGHT_REPLACEMENT'],
        },
      },
      {
        id: 'ch6_call_victor',
        text: 'Suggest calling Victor directly',
        subtext: 'Unconventional approach',
        nextSceneId: 'ch6_victor_call',
        effects: {
          stats: { politics: 10 },
          setFlags: ['CALLED_VICTOR_CRISIS'],
        },
      },
    ],
  },

  // Crisis Resolution - Fill Gap
  {
    id: 'ch6_crisis_resolution',
    chapterId: 'chapter_6',
    title: 'Stepping Up',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `Sterling fills the gap. The LP calls are difficult—explaining why you're now 45% of a single deal—but the managing partner makes it work.

**"This is a generational asset,"** he tells the advisory committee. **"Sometimes you have to lean in."**

Meridian is grateful. Alexandra sends a private message:

*"I won't forget this. You could have let us twist. You didn't. — AR"*

The deal stays on track. Closing in two weeks.

*Sometimes the best deals require taking on more risk than you'd like.*`,
    choices: [
      {
        id: 'ch6_resolution_continue',
        text: 'Push toward closing',
        nextSceneId: 'ch6_closing',
        effects: {
          relationships: [{ npcId: 'alexandra', change: 20, memory: 'Sterling stepped up when we couldn\'t' }],
        },
      },
    ],
  },

  // Find Capital
  {
    id: 'ch6_find_capital',
    chapterId: 'chapter_6',
    title: 'The Hunt for Capital',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `*Seventy-two hours. Fifty phone calls. Zero sleep.*

You work your network, calling everyone who might write a $200 million check on short notice. Sovereign wealth funds. Family offices. Insurance companies.

Finally, on day three, a breakthrough:

**"Pacific Rim Partners,"** Sarah reports, looking as exhausted as you feel. **"Hong Kong-based family office. They want in. $200 million, passive co-invest, no board seat required."**

**"What's the catch?"**

**"They want a 15% discount on the equity."**

**"That's—"**

**"Better than the deal dying. And they can close in ten days."**

*Not perfect. But sometimes good enough is good enough.*`,
    choices: [
      {
        id: 'ch6_accept_pacific',
        text: 'Recommend accepting Pacific Rim\'s terms',
        nextSceneId: 'ch6_closing',
        effects: {
          stats: { dealcraft: 15 },
          relationships: [{ npcId: 'sarah', change: 15, memory: 'We saved the deal together' }],
        },
      },
    ],
  },

  // Victor Call
  {
    id: 'ch6_victor_call',
    chapterId: 'chapter_6',
    title: 'The Founder\'s Wisdom',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'victor',
      name: 'Victor Chen',
      mood: 'neutral',
    },
    narrative: `You call Victor directly. It's unconventional—founders aren't supposed to know about consortium drama—but you've built enough trust.

**"The consortium is having capital issues,"** you explain. **"I wanted you to hear it from me, not from a banker."**

**"I appreciate that."** A pause. **"How bad?"**

**"$200 million gap. We're working on solutions, but the timeline is tight."**

**"And if you can't fill it?"**

**"The deal might not close."**

Another long pause.

**"I have an idea. What if I roll over more equity? Instead of 15%, I take 20%. That's $160 million you don't need to find."**

**"Victor, that's... significant."**

**"I believe in this partnership. Show me I'm right to believe."**

*The founder just saved his own acquisition. That's conviction.*`,
    choices: [
      {
        id: 'ch6_accept_victor_help',
        text: 'Accept Victor\'s offer gratefully',
        nextSceneId: 'ch6_closing',
        effects: {
          relationships: [{ npcId: 'victor', change: 25, memory: 'Called me when things got hard' }],
          setFlags: ['VICTOR_INCREASED_ROLLOVER'],
        },
      },
    ],
  },

  // Closing
  {
    id: 'ch6_closing',
    chapterId: 'chapter_6',
    title: 'The Closing',
    type: 'narrative',
    atmosphere: 'celebration',
    narrative: `*Closing day. Davis Polk conference room. Forty lawyers, twenty bankers, and $8.2 billion changing hands.*

The wire transfers clear at 4:47 PM. Prometheus Technologies is now owned by the Sterling-Meridian consortium.

Victor Chen signs the final documents with a fountain pen his father gave him.

**"Thirty-two years,"** he says quietly. **"Started in a garage in San Jose. Ended in a conference room on Park Avenue."**

**"It's not ending,"** you say. **"It's transitioning."**

He smiles. **"You might actually believe that."**

The champagne flows. The deal toys will arrive in a few weeks—lucite tombstones commemorating the transaction.

Chad pulls you aside.

**"Not bad. You kept the consortium together when it was falling apart. That's not a technical skill. That's leadership."**

**"Thanks."**

**"Don't thank me. Thank yourself by making sure this investment works. The hard part starts now."**

*$8.2 billion. The largest deal in Sterling Partners history. And you helped make it happen.*`,
    choices: [
      {
        id: 'ch6_closing_complete',
        text: 'Take a moment to appreciate the achievement',
        nextSceneId: 'ch6_chapter_end',
        effects: {
          stats: { reputation: 15, money: 50000 },
          achievement: 'WHALE_HUNTER',
        },
      },
    ],
  },

  // Chapter End - Success
  {
    id: 'ch6_chapter_end',
    chapterId: 'chapter_6',
    title: 'The Syndicate',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `*One month after closing*

The deal tombstone arrives. Lucite, heavy, engraved:

**PROJECT ATLAS**
**$8.2 Billion**
**Sterling Partners • Meridian Capital • Apex Equity**

You place it on your shelf—the first of what you hope will be many.

Alexandra calls that evening.

**"Heard you're being considered for Principal,"** she says. **"Congratulations."**

**"News travels fast."**

**"In this industry? Always."** A pause. **"We should do another deal together sometime. You're not as bad as I expected."**

**"High praise."**

**"The highest I give."**

You hang up, looking at the Manhattan skyline. Somewhere out there, Prometheus Technologies is running—three thousand employees, thirty years of technology, now backed by the consortium you helped build.

**CHAPTER 6 COMPLETE**

*You've learned the art of the club deal: balancing economics with relationships, competition with collaboration, ego with execution.*

*In private equity, the biggest deals require the biggest partnerships. And partnerships require trust—earned slowly, lost quickly.*`,
    choices: [],
    requiresAcknowledgment: true,
  },

  // Chapter End - Walk Away
  {
    id: 'ch6_chapter_end_walk',
    chapterId: 'chapter_6',
    title: 'The Road Not Taken',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `*Three months later*

The Prometheus deal closed without you. Blackrock's consortium. $8.5 billion. Victor Chen got his terms.

You read about it in the Wall Street Journal, sitting in a coffee shop near the office. The article mentions Sterling Partners as "a firm that was in discussions but ultimately chose not to proceed."

Your phone buzzes. A text from Chad:

*"Partners meeting tomorrow. Be prepared for questions."*

The performance review is brutal. Not because anyone yells—worse, they're disappointed. The walk from Atlas will follow you for years. Maybe forever.

But you made a choice. You refused to compromise on terms you couldn't live with.

Whether that was wisdom or weakness, only time will tell.

**CHAPTER 6 COMPLETE**

*Some deals are worth walking away from. Some aren't. You won't know which this was until the dust settles—and by then, it'll be too late to change your mind.*

*That's the weight of every decision in this business. You carry it forward.*`,
    choices: [],
    requiresAcknowledgment: true,
  },
];

// ============================================================================
// CHAPTER 7: THE 100 DAYS - Operational Turnaround
// ============================================================================

const CHAPTER_7_SCENES: Scene[] = [
  // Opening - Day 1 Reality
  {
    id: 'ch7_opening',
    chapterId: 'chapter_7',
    title: 'Day One',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Day 1 of ownership. The first board meeting.*

The Prometheus Technologies boardroom. Floor-to-ceiling windows overlooking Silicon Valley. A view that costs about $50 million a year in real estate.

Around the table: Victor Chen (Chairman), the new CEO you helped recruit, the CFO who survived the transition, and representatives from Sterling, Meridian, and Apex.

You're here as Sterling's operating partner on this deal. Your job: make sure the $2.4 billion in equity turns into $6 billion in five years.

The CFO begins her presentation. Slide one: **"Q1 Performance Update."**

The room goes quiet.

**"We have a problem."**

*This is not how Day 1 is supposed to go.*`,
    choices: [
      {
        id: 'ch7_opening_continue',
        text: 'Listen to the problem',
        nextSceneId: 'ch7_day_one_surprise',
      },
    ],
  },

  // Day One Surprise
  {
    id: 'ch7_day_one_surprise',
    chapterId: 'chapter_7',
    title: 'The Surprise',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `The CFO clicks through the slides. Each one is worse than the last.

**Revenue:** Down 8% from the model. A major customer—15% of sales—announced they're "evaluating alternatives."

**Margins:** EBITDA margin compressed from 35% to 29%. "One-time" restructuring costs that somehow recur every quarter.

**Cash:** The company burned $40 million more than projected. Working capital is a mess.

**Pipeline:** The sales team missed Q1 targets by 30%. The new product launch is delayed six months.

The new CEO, David Park, looks shell-shocked. He's been on the job for three weeks.

**"How did this happen?"** Alexandra demands. **"This wasn't in the diligence."**

The CFO's voice is steady but strained.

**"Some of it was. Some of it... developed. The customer situation escalated after signing. The product delays were hidden by the previous team."**

Victor Chen says nothing. His expression is unreadable.

*The investment thesis just took a $400 million haircut. Someone needs to fix this.*`,
    choices: [
      {
        id: 'ch7_take_charge',
        text: 'Take the lead on developing a response',
        subtext: 'Step up as the operating partner',
        nextSceneId: 'ch7_take_charge',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['TOOK_CHARGE_DAY_ONE'],
        },
      },
      {
        id: 'ch7_defer_ceo',
        text: 'Let the CEO take the lead',
        subtext: 'It\'s his job, not yours',
        nextSceneId: 'ch7_ceo_leads',
        effects: {
          stats: { politics: 5 },
        },
      },
    ],
  },

  // Take Charge
  {
    id: 'ch7_take_charge',
    chapterId: 'chapter_7',
    title: 'Taking Point',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'player',
      name: 'You',
      mood: 'neutral',
    },
    narrative: `**"Let's not panic,"** you say, standing. **"We have problems. We also have resources and a plan. Let me walk through what I'm proposing."**

You move to the whiteboard.

**"First: the customer situation. I want a war room by end of day. CEO, head of sales, head of customer success. We're not losing that account."**

**"Second: cash burn. CFO, I need a zero-based budget review in two weeks. Every line item justified from scratch."**

**"Third: product delays. I want an honest assessment from engineering. Not what they think we want to hear—what's actually possible."**

David Park looks relieved. He's in over his head, and he knows it.

**"What's the timeline?"** Alexandra asks.

**"One hundred days. That's what we tell the board. One hundred days to stabilize, assess, and present a revised value creation plan."**

Victor Chen finally speaks: **"And if a hundred days isn't enough?"**

**"Then we'll know we have bigger problems than timeline."**

*The 100-day clock starts now.*`,
    choices: [
      {
        id: 'ch7_hundred_days_start',
        text: 'Begin the 100-day plan',
        nextSceneId: 'ch7_hundred_day_plan',
        effects: {
          stats: { reputation: 10 },
          relationships: [{ npcId: 'david_park', change: 15, memory: 'Took charge when I was drowning' }],
          setFlags: ['HUNDRED_DAY_LEADER'],
        },
      },
    ],
  },

  // CEO Leads
  {
    id: 'ch7_ceo_leads',
    chapterId: 'chapter_7',
    title: 'Delegation',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `You defer to David Park. It's the right organizational move—he's the CEO, after all.

He stands, uncertain.

**"We'll... we'll need to assess the situation. I'll have my team put together a response plan by end of week."**

Alexandra's expression says everything. End of week? In a crisis?

The meeting dissolves into side conversations. No clear ownership. No urgency.

Chad pulls you aside afterward.

**"That was a mistake."**

**"He's the CEO—"**

**"He's a CEO who's been on the job three weeks and just found out his company is on fire. You're the operating partner. You're supposed to be the adult in the room."**

**"So what do I do now?"**

**"Fix it. Before this becomes a portfolio committee issue."**

*You need to get involved. Fast.*`,
    choices: [
      {
        id: 'ch7_course_correct',
        text: 'Step in and take operational control',
        nextSceneId: 'ch7_hundred_day_plan',
        effects: {
          stats: { stress: 10 },
          relationships: [{ npcId: 'david_park', change: -5, memory: 'Had to step over me' }],
          setFlags: ['COURSE_CORRECTED'],
        },
      },
    ],
  },

  // 100-Day Plan
  {
    id: 'ch7_hundred_day_plan',
    chapterId: 'chapter_7',
    title: 'The Plan',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Day 5. The war room.*

Whiteboards cover every wall. Post-its in four colors track initiatives. A countdown clock shows: **95 DAYS REMAINING.**

Your 100-day plan has four pillars:

**STABILIZE (Days 1-30)**
- Retain the at-risk customer
- Stop the cash bleed
- Assess management team capabilities

**DIAGNOSE (Days 31-60)**
- Root cause analysis on margin compression
- Product roadmap reality check
- Customer satisfaction deep-dive

**PLAN (Days 61-90)**
- Revised operating model
- Cost structure optimization
- Growth initiatives identification

**EXECUTE (Days 91-100)**
- Board presentation
- Resource allocation decisions
- Go-forward commitment

The team is assembled. The clock is ticking.

*Which pillar do you tackle first?*`,
    choices: [
      {
        id: 'ch7_customer_first',
        text: 'Focus on saving the at-risk customer',
        subtext: 'Revenue protection is priority one',
        nextSceneId: 'ch7_customer_war_room',
        effects: {
          setFlags: ['CUSTOMER_FIRST'],
        },
      },
      {
        id: 'ch7_cash_first',
        text: 'Focus on stopping the cash burn',
        subtext: 'Cash is oxygen',
        nextSceneId: 'ch7_cash_crisis',
        effects: {
          setFlags: ['CASH_FIRST'],
        },
      },
      {
        id: 'ch7_management_first',
        text: 'Focus on assessing the management team',
        subtext: 'People problems first',
        nextSceneId: 'ch7_management_assessment',
        effects: {
          setFlags: ['MANAGEMENT_FIRST'],
        },
      },
    ],
  },

  // Customer War Room
  {
    id: 'ch7_customer_war_room',
    chapterId: 'chapter_7',
    title: 'The Customer Crisis',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `*Day 8. Customer war room.*

GlobalMfg—the customer threatening to leave—represents $180 million in annual revenue. Losing them would crater the investment thesis.

The head of customer success, Maria Santos, briefs you:

**"The relationship started deteriorating eighteen months ago. Product quality issues, missed SLAs, unresponsive support. They've been building a business case to switch to our competitor."**

**"Why didn't this come up in diligence?"**

**"Because the previous management told us not to mention it. Said they had it under control."** Her jaw tightens. **"They didn't."**

**"What do we need to save the account?"**

**"Honestly? A miracle. Or..."** She hesitates.

**"Or?"**

**"We fly to Detroit. You, me, David. We sit in their conference room and we listen. We don't pitch. We don't defend. We listen to every complaint they have. And then we fix it."**

**"And if that's not enough?"**

**"Then we negotiate the best exit terms we can and start replacing the revenue."**

*$180 million on the line. What's your approach?*`,
    choices: [
      {
        id: 'ch7_customer_humble',
        text: 'Go to Detroit. Listen and commit to fixing issues.',
        subtext: 'Humility over pride',
        nextSceneId: 'ch7_customer_meeting',
        style: 'ethical',
        effects: {
          stats: { ethics: 5 },
          setFlags: ['CUSTOMER_HUMBLE_APPROACH'],
        },
      },
      {
        id: 'ch7_customer_negotiate',
        text: 'Negotiate from strength. Offer concessions strategically.',
        subtext: 'Business is business',
        nextSceneId: 'ch7_customer_meeting',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['CUSTOMER_NEGOTIATE_APPROACH'],
        },
      },
    ],
  },

  // Cash Crisis
  {
    id: 'ch7_cash_crisis',
    chapterId: 'chapter_7',
    title: 'Following the Money',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Day 8. CFO's office.*

Jennifer Walsh, the CFO, has been with Prometheus for twelve years. She survived four CEOs and one IPO. She knows where the bodies are buried.

**"Show me the real numbers,"** you say. **"Not the board deck. The real numbers."**

She pulls up a spreadsheet. The picture is ugly.

**"We're burning $15 million a month. Cash runway is eight months if nothing changes."**

**"The model showed positive free cash flow by Q3."**

**"The model was wrong."** She pauses. **"Or optimistic. Take your pick."**

**"Where's the money going?"**

**"Three buckets: R&D headcount that's not producing, sales & marketing that's not converting, and G&A that crept up during the go-go years."**

She slides a paper across the desk. **"I've identified $60 million in annual savings. But it requires decisions. Hard ones."**

**"How hard?"**

**"Two hundred people hard."**

*Layoffs. The word no one wants to say. But the math is the math.*`,
    choices: [
      {
        id: 'ch7_layoffs_review',
        text: 'Review the layoff proposal in detail',
        nextSceneId: 'ch7_tough_call',
        effects: {
          stats: { stress: 10 },
          setFlags: ['REVIEWED_LAYOFFS'],
        },
      },
      {
        id: 'ch7_alternatives',
        text: 'Push for alternatives to layoffs first',
        subtext: 'Look for other levers',
        nextSceneId: 'ch7_alternatives_search',
        style: 'ethical',
        effects: {
          stats: { ethics: 10 },
          setFlags: ['SOUGHT_ALTERNATIVES'],
        },
      },
    ],
  },

  // Management Assessment
  {
    id: 'ch7_management_assessment',
    chapterId: 'chapter_7',
    title: 'The People Problem',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Day 8. One-on-ones with the executive team.*

You spend three days in back-to-back meetings. Coffee. Lunch. Dinner. Late-night drinks. Getting to know the people who will make or break this turnaround.

Your assessment notes:

**David Park (CEO):** Smart, strategic, but struggles with execution. Needs coaching, not replacement. Yet.

**Jennifer Walsh (CFO):** Rock solid. Knows the business cold. Keep.

**Marcus Thompson (CTO):** Defensive, protective of his team. Product delays are on him. Question mark.

**Lisa Chen (VP Sales):** New hire, six months in. Inheriting a mess. Jury's out.

**Robert Kim (VP Engineering):** Marcus's right hand. Loyal to a fault. Possible resistance to change.

The management team is... mixed. Not a disaster, but not the A-team either.

*What's your priority intervention?*`,
    choices: [
      {
        id: 'ch7_cto_conversation',
        text: 'Have a direct conversation with the CTO',
        subtext: 'The product delays are existential',
        nextSceneId: 'ch7_cto_confrontation',
        effects: {
          setFlags: ['CTO_FOCUS'],
        },
      },
      {
        id: 'ch7_coach_ceo',
        text: 'Focus on coaching the CEO',
        subtext: 'He needs to lead the turnaround',
        nextSceneId: 'ch7_ceo_coaching',
        effects: {
          setFlags: ['CEO_COACHING'],
        },
      },
    ],
  },

  // Customer Meeting
  {
    id: 'ch7_customer_meeting',
    chapterId: 'chapter_7',
    title: 'Detroit',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Day 15. GlobalMfg headquarters. Detroit.*

The GlobalMfg team files in: the CTO, the VP of Operations, the procurement head, and a lawyer. Not a good sign.

You spend three hours listening. Really listening.

The complaints are legitimate:
- Product quality declined after Prometheus cut their QA team
- Support response times went from 4 hours to 4 days
- Three critical bugs went unfixed for six months
- The account team stopped showing up to quarterly reviews

When they finish, the CTO leans forward:

**"So. What are you going to do about it?"**

You have a choice. Promise everything and risk over-committing. Or be honest about what you can deliver and risk losing them anyway.

*What's your commitment?*`,
    choices: [
      {
        id: 'ch7_customer_promise_big',
        text: 'Make specific, measurable commitments',
        subtext: 'Promise what you can deliver—and deliver it',
        nextSceneId: 'ch7_customer_outcome',
        effects: {
          stats: { reputation: 10 },
          setFlags: ['CUSTOMER_COMMITTED'],
        },
      },
      {
        id: 'ch7_customer_honest',
        text: 'Be honest about the turnaround timeline',
        subtext: 'Set realistic expectations',
        nextSceneId: 'ch7_customer_outcome',
        style: 'ethical',
        effects: {
          stats: { ethics: 10 },
          setFlags: ['CUSTOMER_HONEST'],
        },
      },
    ],
  },

  // Customer Outcome
  {
    id: 'ch7_customer_outcome',
    chapterId: 'chapter_7',
    title: 'The Verdict',
    type: 'dialogue',
    atmosphere: 'meeting',
    speaker: {
      id: 'globalmfg_cto',
      name: 'GlobalMfg CTO',
      mood: 'neutral',
    },
    narrative: `The GlobalMfg CTO confers with his team. Five minutes that feel like an hour.

**"Here's what we're going to do,"** he says finally. **"We're going to give you six months. Six months to prove this new ownership is different."**

**"And if we deliver?"**

**"Then we sign a three-year extension. But if you slip—if quality drops, if support fails, if we see the same patterns—we're gone. And we're taking the three other companies in our group with us."**

**"Understood."**

He stands, extends his hand.

**"I hope you're different. I really do. We've been partners for fifteen years. I don't want that to end."**

The flight back to California is quiet. You just bought six months. Now you have to deliver.

*One pillar stabilized. Two to go.*`,
    choices: [
      {
        id: 'ch7_customer_success',
        text: 'Move to the next crisis',
        nextSceneId: 'ch7_tough_call',
        effects: {
          relationships: [{ npcId: 'maria_santos', change: 15, memory: 'Helped save the GlobalMfg account' }],
        },
      },
    ],
  },

  // Alternatives Search
  {
    id: 'ch7_alternatives_search',
    chapterId: 'chapter_7',
    title: 'Finding Another Way',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Day 12. Searching for alternatives.*

You push Jennifer to find other levers before resorting to layoffs.

**Lever 1: Vendor renegotiation** — $8M in annual savings from better cloud and software contracts. Doable.

**Lever 2: Real estate consolidation** — $12M by closing two satellite offices and going hybrid. Six-month timeline.

**Lever 3: Hiring freeze** — $15M in avoided costs by not backfilling open positions. Immediate.

**Lever 4: Compensation reset** — Executive team takes 20% salary cuts until profitability. Symbolic, but meaningful.

**Total: $35 million.** Still $25 million short.

Jennifer looks at you.

**"I appreciate what you're trying to do. But the math doesn't lie. We can soften the blow, but we can't avoid it entirely."**

**"How many if we do all of this?"**

**"A hundred instead of two hundred. And we have to move fast—the longer we wait, the more cash we burn."**

*Sometimes there are no good options. Only less bad ones.*`,
    choices: [
      {
        id: 'ch7_proceed_reduced',
        text: 'Proceed with the reduced layoffs',
        nextSceneId: 'ch7_tough_call',
        effects: {
          stats: { ethics: 5, stress: 10 },
          setFlags: ['REDUCED_LAYOFFS'],
        },
      },
    ],
  },

  // Tough Call
  {
    id: 'ch7_tough_call',
    chapterId: 'chapter_7',
    title: 'The Hardest Day',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `*Day 30. The restructuring.*

The notices go out at 9 AM Pacific. By 10 AM, the office is in chaos. People crying at their desks. Security escorting confused employees to HR. Boxes appearing in cubicles.

You walk the floor. Some people avoid eye contact. Others stare with naked hostility. One woman—mid-fifties, probably been here twenty years—stops you in the hallway.

**"I hope you're proud of yourself,"** she says. **"We were a family before you people showed up."**

You don't have a good answer. There isn't one.

David Park finds you in the stairwell, looking shell-shocked.

**"I've never had to do anything like this."**

**"Neither have I."** You pause. **"But it's done now. The question is what we do next."**

**"What do we do next?"**

**"We prove it was worth it. We turn this company around. We show everyone who's still here that their jobs are secure because we made the hard call."**

**"And if we don't?"**

**"Then we're the villains they think we are."**

*Fifty days remaining. The stabilization phase is complete. Now comes the hard part.*`,
    choices: [
      {
        id: 'ch7_aftermath',
        text: 'Move to the diagnosis phase',
        nextSceneId: 'ch7_diagnosis_phase',
        effects: {
          stats: { stress: 15, ethics: -5 },
        },
      },
    ],
  },

  // CTO Confrontation
  {
    id: 'ch7_cto_confrontation',
    chapterId: 'chapter_7',
    title: 'The Product Truth',
    type: 'dialogue',
    atmosphere: 'office',
    speaker: {
      id: 'marcus_thompson',
      name: 'Marcus Thompson',
      mood: 'angry',
    },
    narrative: `Marcus Thompson's office is cluttered with whiteboards, sticky notes, and half-empty coffee cups. The debris of a product organization under siege.

**"The product delays,"** you begin. **"I need to understand what happened."**

His defensiveness is immediate.

**"What happened is we got pushed to ship features before they were ready. Sales made promises we couldn't keep. Leadership changed priorities every quarter. And now everyone wants to blame engineering."**

**"I'm not here to blame anyone. I'm here to fix it."**

**"You want to fix it?"** He laughs bitterly. **"Give me six more months and the headcount we lost in last year's 'efficiency' round. Then we'll talk about fixing it."**

**"You're not getting six months. You're getting sixty days to show me a realistic roadmap."**

**"Then you're not getting a product that works."**

*The CTO is burned out and defensive. But he might also be right about the resource constraints.*`,
    choices: [
      {
        id: 'ch7_cto_push',
        text: 'Push back firmly on the excuses',
        subtext: 'Accountability matters',
        nextSceneId: 'ch7_cto_resolution',
        effects: {
          stats: { dealcraft: 5 },
          relationships: [{ npcId: 'marcus_thompson', change: -10, memory: 'Pushed back on my excuses' }],
          setFlags: ['CTO_PUSHED'],
        },
      },
      {
        id: 'ch7_cto_listen',
        text: 'Listen to his concerns seriously',
        subtext: 'He might have a point',
        nextSceneId: 'ch7_cto_resolution',
        style: 'ethical',
        effects: {
          stats: { ethics: 5, politics: 5 },
          relationships: [{ npcId: 'marcus_thompson', change: 10, memory: 'Actually listened to my side' }],
          setFlags: ['CTO_LISTENED'],
        },
      },
    ],
  },

  // CEO Coaching
  {
    id: 'ch7_ceo_coaching',
    chapterId: 'chapter_7',
    title: 'Leadership Development',
    type: 'dialogue',
    atmosphere: 'quiet',
    speaker: {
      id: 'david_park',
      name: 'David Park',
      mood: 'worried',
    },
    narrative: `*Day 10. Dinner with David Park.*

Away from the office, David opens up.

**"I'm not sure I'm the right person for this,"** he admits. **"I came from a growth environment. Scale mode. This is... this is survival mode."**

**"What makes you say that?"**

**"Every skill I developed—building teams, expanding markets, raising capital—none of it applies here. Here I need to cut, and focus, and say no. I've never been good at saying no."**

**"You can learn."**

**"Can I learn fast enough?"** He stares at his drink. **"The board is watching. You're watching. If I stumble again..."**

**"Then we'll help you. That's what operating partners do."**

**"Is that what you really do? Or is that what you say before you replace me?"**

*He's scared. He's also not wrong to be scared.*`,
    choices: [
      {
        id: 'ch7_ceo_support',
        text: 'Commit to supporting his development',
        subtext: 'Give him a real chance',
        nextSceneId: 'ch7_cto_resolution',
        style: 'ethical',
        effects: {
          stats: { ethics: 10 },
          relationships: [{ npcId: 'david_park', change: 20, memory: 'Believed in me when no one else did' }],
          setFlags: ['CEO_SUPPORTED'],
        },
      },
      {
        id: 'ch7_ceo_conditional',
        text: 'Be honest about the performance bar',
        subtext: 'Support with accountability',
        nextSceneId: 'ch7_cto_resolution',
        effects: {
          stats: { politics: 5, dealcraft: 5 },
          relationships: [{ npcId: 'david_park', change: 5, memory: 'Was honest about expectations' }],
          setFlags: ['CEO_ACCOUNTABLE'],
        },
      },
    ],
  },

  // CTO Resolution
  {
    id: 'ch7_cto_resolution',
    chapterId: 'chapter_7',
    title: 'The Engineering Question',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Day 20. Product review.*

After days of deep-dives with the engineering team, the picture becomes clearer.

Marcus Thompson was half-right. The team is under-resourced for the roadmap they were given. But he was also half-wrong. The architecture decisions from three years ago have created technical debt that's slowing everything down.

You present your findings to the consortium partners:

**"We have two options. One: rebuild the core platform. Eighteen months, $30 million in investment. Risky, but solves the root cause."**

**"Two: patch and stabilize. Six months, $10 million. Keeps us competitive short-term, but we'll face the same issues in three years."**

Alexandra speaks first: **"What's your recommendation?"**

**"Depends on our exit timeline. If we're selling in three years, we patch. If we're building for the long term, we rebuild."**

**"And the CTO?"**

**"He stays. With clearer priorities and realistic resources. If he can't deliver with that support, then we revisit."**

*The product strategy is set. Now for the hard part: execution.*`,
    choices: [
      {
        id: 'ch7_rebuild',
        text: 'Recommend the rebuild',
        subtext: 'Long-term value creation',
        nextSceneId: 'ch7_diagnosis_phase',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['CHOSE_REBUILD'],
        },
      },
      {
        id: 'ch7_patch',
        text: 'Recommend the patch',
        subtext: 'Preserve optionality',
        nextSceneId: 'ch7_diagnosis_phase',
        effects: {
          stats: { politics: 5 },
          setFlags: ['CHOSE_PATCH'],
        },
      },
    ],
  },

  // Diagnosis Phase
  {
    id: 'ch7_diagnosis_phase',
    chapterId: 'chapter_7',
    title: 'The Diagnosis',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Day 45. Diagnosis complete.*

After six weeks of intensive work, the turnaround thesis comes into focus:

**What Went Wrong:**
- Previous management prioritized growth over profitability
- Technical debt accumulated faster than investment
- Customer success was underfunded
- Sales incentives rewarded new logos over retention

**What We're Fixing:**
- Restructured cost base saves $45M annually
- Customer retention program showing early results
- Product roadmap reset with realistic timelines
- Sales compensation aligned to profitability

**What Still Worries Us:**
- Key engineer turnover risk is high
- Competitive pressure increasing
- Customer concentration still dangerous
- CEO still finding his footing

The board review is in five days. You need to present a credible path to the original investment thesis—or a revised one they can live with.

*How do you frame the message?*`,
    choices: [
      {
        id: 'ch7_board_optimistic',
        text: 'Present an optimistic recovery path',
        subtext: 'The original thesis is achievable',
        nextSceneId: 'ch7_board_pressure',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['BOARD_OPTIMISTIC'],
        },
      },
      {
        id: 'ch7_board_realistic',
        text: 'Present a realistic, revised thesis',
        subtext: 'Lower returns, higher confidence',
        nextSceneId: 'ch7_board_pressure',
        style: 'ethical',
        effects: {
          stats: { ethics: 10 },
          setFlags: ['BOARD_REALISTIC'],
        },
      },
    ],
  },

  // Board Pressure
  {
    id: 'ch7_board_pressure',
    chapterId: 'chapter_7',
    title: 'The Board Review',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Day 50. Consortium board meeting.*

The presentation goes well—until the Q&A.

Alexandra leads the charge:

**"Your revised projections show 2.1x return over five years. We modeled 2.5x. That's a $400 million gap."**

**"The gap reflects reality. The business we bought isn't the business we diligenced."**

**"Then someone should be accountable for that."**

The room goes tense. She's not wrong—but accountability is complicated when everyone shares blame.

Victor Chen speaks for the first time:

**"What I'm hearing is that we have a good business with fixable problems. The question is whether we have the right team to fix them."**

He looks at you.

**"You've been running this turnaround for fifty days. In fifty more, what will be different?"**

*The founder is testing your conviction. Everyone is watching.*`,
    choices: [
      {
        id: 'ch7_defend_team',
        text: 'Defend the current team and plan',
        subtext: 'We have what we need',
        nextSceneId: 'ch7_thesis_pivot',
        effects: {
          stats: { politics: 5 },
          relationships: [{ npcId: 'david_park', change: 10, memory: 'Defended me to the board' }],
          setFlags: ['DEFENDED_TEAM'],
        },
      },
      {
        id: 'ch7_acknowledge_gaps',
        text: 'Acknowledge gaps and propose changes',
        subtext: 'Honesty about what\'s not working',
        nextSceneId: 'ch7_thesis_pivot',
        effects: {
          stats: { ethics: 5, dealcraft: 5 },
          setFlags: ['ACKNOWLEDGED_GAPS'],
        },
      },
    ],
  },

  // Thesis Pivot
  {
    id: 'ch7_thesis_pivot',
    chapterId: 'chapter_7',
    title: 'The Pivot',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Day 60. The pivot decision.*

The numbers don't lie. The original investment thesis—premium growth with high margins—isn't achievable in the current market.

You present the consortium with a choice:

**OPTION A: Stay the Course**
- Maintain premium positioning
- Accept slower growth (8% vs 15%)
- Target 2.0x return over 5 years

**OPTION B: Pivot to Platform**
- Acquire two smaller competitors
- Consolidate market share
- Target 2.5x return over 6 years
- Requires additional $200M equity

**OPTION C: Prepare for Early Exit**
- Stabilize operations
- Position for strategic sale
- Target 1.5x return over 3 years

The partners debate for hours. Finally, they turn to you.

**"You've been closest to this. What do you recommend?"**

*The next forty days depend on this decision.*`,
    choices: [
      {
        id: 'ch7_stay_course',
        text: 'Recommend staying the course',
        subtext: 'Execute the turnaround we started',
        nextSceneId: 'ch7_execution_hell',
        effects: {
          stats: { stress: 10 },
          setFlags: ['CHOSE_STAY_COURSE'],
        },
      },
      {
        id: 'ch7_pivot_platform',
        text: 'Recommend the platform strategy',
        subtext: 'Buy your way to scale',
        nextSceneId: 'ch7_execution_hell',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['CHOSE_PLATFORM'],
        },
      },
      {
        id: 'ch7_early_exit',
        text: 'Recommend preparing for early exit',
        subtext: 'Cut losses and move on',
        nextSceneId: 'ch7_early_exit_path',
        effects: {
          stats: { politics: 5 },
          setFlags: ['CHOSE_EARLY_EXIT'],
        },
      },
    ],
  },

  // Early Exit Path
  {
    id: 'ch7_early_exit_path',
    chapterId: 'chapter_7',
    title: 'The Exit Option',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `The recommendation lands like a bomb.

**"You're suggesting we give up?"** Alexandra's voice is ice.

**"I'm suggesting we be realistic. The market has changed. The competitive position has weakened. We can fight for three more years and maybe get to 2x, or we can sell now to a strategic buyer who values the customer base and get 1.5x with certainty."**

**"Our LPs didn't invest for 1.5x returns."**

**"Our LPs also didn't invest to watch us throw good money after bad."**

The debate continues. Finally, Victor Chen cuts through:

**"I didn't build this company to see it sold for parts. But I also didn't build it to watch it die slowly."** He pauses. **"If the recommendation is early exit, I'll support it. But I want to know you've exhausted the alternatives."**

**"We have. And an early exit isn't failure—it's recognizing reality."**

*The consortium votes. The decision is made.*`,
    choices: [
      {
        id: 'ch7_exit_proceed',
        text: 'Begin the exit preparation',
        nextSceneId: 'ch7_chapter_end_exit',
        effects: {
          stats: { reputation: -5 },
        },
      },
    ],
  },

  // Execution Hell
  {
    id: 'ch7_execution_hell',
    chapterId: 'chapter_7',
    title: 'The Grind',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Days 61-90. Execution.*

The next thirty days are a blur:

**Week 9:** The GlobalMfg retention program shows results. Renewal signed.

**Week 10:** Two key engineers resign. Counteroffer fails. Scramble to redistribute work.

**Week 11:** Competitor announces a price cut. Sales team panics. You hold the line on value pricing.

**Week 12:** First positive EBITDA month since acquisition. Small win, but a win.

**Week 13:** David Park finally finds his footing. Leads an all-hands that doesn't feel scripted.

The war room countdown clock shows: **10 DAYS REMAINING.**

The final board presentation is drafted. The numbers are... not great, but defensible. The story is credible. The team is exhausted but intact.

One more week until judgment day.

*You've done everything you can. Now you find out if it was enough.*`,
    choices: [
      {
        id: 'ch7_final_prep',
        text: 'Make final preparations',
        nextSceneId: 'ch7_day_100',
        effects: {
          stats: { stress: 10 },
        },
      },
    ],
  },

  // Day 100
  {
    id: 'ch7_day_100',
    chapterId: 'chapter_7',
    title: 'Day 100',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Day 100. The final presentation.*

The consortium board gathers. Sterling. Meridian. Apex. Victor Chen. The new management team. Everyone who matters.

You present for ninety minutes. The journey. The challenges. The wins and losses. The revised plan.

When you finish, the room is quiet.

The Sterling managing partner speaks first:

**"A hundred days ago, this company was in crisis. Customer retention failing, cash burning, management struggling."**

**"Today, we have a stabilized customer base, positive cash flow trajectory, and a management team that's finding its footing."**

**"Is it where we wanted to be? No. Is it enough to justify continued investment? That's the question."**

Victor Chen stands.

**"I've been through a lot of turnarounds in my career. Most of them fail. Not because the strategy was wrong, but because the people gave up."**

He looks around the room.

**"This team didn't give up. They did the hard work. They made the hard calls. That's worth something."**

*The vote is called. The future of your turnaround hangs in the balance.*`,
    choices: [
      {
        id: 'ch7_await_verdict',
        text: 'Await the board\'s decision',
        nextSceneId: 'ch7_chapter_end',
        effects: {
          stats: { stress: 15 },
        },
      },
    ],
  },

  // Chapter End - Success
  {
    id: 'ch7_chapter_end',
    chapterId: 'chapter_7',
    title: 'The Verdict',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `The vote passes. The turnaround continues.

**"Twelve more months,"** the managing partner says. **"Show us the trajectory holds. Then we'll talk about what comes next."**

It's not a ringing endorsement. But it's not a death sentence either.

After the meeting, David Park finds you.

**"Thank you,"** he says simply. **"For not giving up on us."**

**"Don't thank me yet. We've got twelve months of hard work ahead."**

**"I know. But for the first time since I took this job, I think we might actually make it."**

That night, you look at the war room one last time. The countdown clock now reads: **DAY 101.**

The whiteboard still has your original four pillars. Next to each one, in red marker, someone has written: **DONE.**

*The 100 days are over. The real work is just beginning.*

**CHAPTER 7 COMPLETE**

*You've learned that turnarounds aren't about spreadsheets—they're about people. The numbers matter, but the decisions are human. Every cost cut is someone's job. Every strategy shift is someone's career.*

*The best operators don't just fix companies. They help the people inside them find a way forward.*`,
    choices: [],
    requiresAcknowledgment: true,
  },

  // Chapter End - Exit Path
  {
    id: 'ch7_chapter_end_exit',
    chapterId: 'chapter_7',
    title: 'The Strategic Exit',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `*Six months later*

The sale to TechGiant closes at 1.6x invested capital. Not the return anyone wanted, but better than the alternative.

Victor Chen signs the final documents with the same fountain pen his father gave him—now used twice to sell companies he built.

**"I thought I'd feel worse,"** he admits afterward. **"But seeing it go to someone who'll invest in it... that's something."**

**"You built something real. That doesn't disappear because the ownership changed."**

**"No. It just changes."** He pauses. **"Will you stay to help with integration?"**

**"For six months. Then I'm back to Sterling."**

**"Back to the next deal."**

**"Back to the next deal."**

He shakes your hand.

**"You made a hard call. Easier to keep fighting than to know when to stop. That takes a different kind of courage."**

**CHAPTER 7 COMPLETE**

*Sometimes the best outcome isn't a home run—it's a base hit that keeps the game going. You learned when to fight and when to fold.*

*Not every investment thesis survives contact with reality. The best investors know the difference between persistence and denial.*`,
    choices: [],
    requiresAcknowledgment: true,
  },
];

// ============================================================================
// CHAPTER 8: THE EXIT - Liquidity Event
// ============================================================================

const CHAPTER_8_SCENES: Scene[] = [
  // Opening - Exit Readiness
  {
    id: 'ch8_opening',
    chapterId: 'chapter_8',
    title: 'The Beginning of the End',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Four years into the Prometheus investment*

The portfolio review deck sits on your desk. You've read it a dozen times, but the numbers still feel surreal:

**Prometheus Technologies — Investment Summary**
- Entry: $8.2B EV / $2.4B equity (Year 0)
- Current: $14.5B implied EV / $5.8B equity value (Year 4)
- MOIC: 2.4x gross
- IRR: 28%

The turnaround worked. The platform strategy worked. Three add-on acquisitions, margin expansion, accelerating growth.

Now comes the question every PE investment eventually faces: *How do we get out?*

Your phone buzzes. Chad's assistant: **"Exit committee meeting. Conference room A. Now."**

*The exit process is about to begin.*`,
    choices: [
      {
        id: 'ch8_opening_continue',
        text: 'Head to the meeting',
        nextSceneId: 'ch8_exit_committee',
      },
    ],
  },

  // Exit Committee
  {
    id: 'ch8_exit_committee',
    chapterId: 'chapter_8',
    title: 'The Exit Committee',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The exit committee includes the Sterling partners, Meridian's Alexandra Reyes (now a managing director), and Victor Chen, still Chairman after all these years.

The managing partner opens:

**"Prometheus has exceeded our base case. We're looking at a 2.4x return in a four-year hold. The question is: do we exit now, or hold for more upside?"**

Alexandra speaks first: **"Our fund is in Year 7. Our LPs are expecting distributions. We need liquidity in the next twelve months."**

Chad counters: **"The business is still accelerating. Another two years could take us to 3x or higher."**

Victor Chen interjects quietly: **"I'm seventy-two years old. I'd like to see this chapter close while I can still appreciate it."**

The room considers the competing interests. Fund timelines. Founder legacy. Return optimization.

**"What are our options?"** the managing partner asks, looking at you. You've been preparing for this question.

*Three paths to exit. Each with different risk-reward profiles.*`,
    choices: [
      {
        id: 'ch8_present_options',
        text: 'Present the exit options',
        nextSceneId: 'ch8_exit_options',
      },
    ],
  },

  // Exit Options
  {
    id: 'ch8_exit_options',
    chapterId: 'chapter_8',
    title: 'Three Paths',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `You move to the whiteboard.

**OPTION 1: IPO**
- Timeline: 12-18 months
- Implied valuation: $16-18B (premium for public market access)
- Pros: Highest valuation, partial liquidity, ongoing upside
- Cons: Market risk, lock-up period, public company costs
- Key risk: Market conditions

**OPTION 2: STRATEGIC SALE**
- Timeline: 6-9 months
- Implied valuation: $14-16B (control premium)
- Pros: Full liquidity, certainty of close, potential synergies
- Cons: Regulatory risk, cultural integration, founder concerns
- Key risk: Buyer universe depth

**OPTION 3: SECONDARY / SPONSOR-TO-SPONSOR**
- Timeline: 4-6 months
- Implied valuation: $13-14B (liquidity discount)
- Pros: Speed, certainty, continuation of strategy
- Cons: Lower valuation, LP scrutiny, GP conflict questions
- Key risk: Rollover negotiation

The room absorbs the options. Each partner has different preferences.

**"What's your recommendation?"** the managing partner asks.

*The choice you make will define how this investment ends.*`,
    choices: [
      {
        id: 'ch8_recommend_ipo',
        text: 'Recommend the IPO path',
        subtext: 'Maximize valuation, accept market risk',
        nextSceneId: 'ch8_ipo_path',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['CHOSE_IPO'],
        },
      },
      {
        id: 'ch8_recommend_strategic',
        text: 'Recommend strategic sale',
        subtext: 'Certainty over optimization',
        nextSceneId: 'ch8_strategic_path',
        effects: {
          stats: { politics: 5 },
          setFlags: ['CHOSE_STRATEGIC'],
        },
      },
      {
        id: 'ch8_recommend_secondary',
        text: 'Recommend secondary sale',
        subtext: 'Speed and simplicity',
        nextSceneId: 'ch8_secondary_path',
        effects: {
          stats: { dealcraft: 5 },
          setFlags: ['CHOSE_SECONDARY'],
        },
      },
      {
        id: 'ch8_dual_track',
        text: 'Recommend a dual-track process',
        subtext: 'Run IPO and strategic in parallel',
        nextSceneId: 'ch8_dual_track_path',
        effects: {
          stats: { dealcraft: 10, stress: 5 },
          setFlags: ['CHOSE_DUAL_TRACK'],
        },
      },
    ],
  },

  // IPO Path
  {
    id: 'ch8_ipo_path',
    chapterId: 'chapter_8',
    title: 'Going Public',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The committee approves the IPO path. The next step: selecting underwriters.

*The beauty contest begins.*

Three banks pitch for the lead role:

**Goldman Sachs:** The prestige choice. Best distribution, highest fees. Their tech banker has taken fifteen companies public this year.

**Morgan Stanley:** Strong institutional relationships. More aggressive on valuation. Hungry for the deal.

**Evercore:** Boutique credibility. Lower fees, more senior attention. Less distribution firepower.

Each bank presents for two hours. Slides. Comps. Market positioning. Promises of "flawless execution."

After they leave, the committee debates.

**"Goldman has the track record,"** Chad argues. **"When markets get choppy, you want the best team."**

**"Morgan is promising a higher range,"** Alexandra counters. **"That's $500 million in incremental value."**

Victor Chen is quiet, then speaks: **"I care less about the fees than about who will represent my company to the market. This is my legacy."**

*Your recommendation will tip the balance.*`,
    choices: [
      {
        id: 'ch8_choose_goldman',
        text: 'Recommend Goldman Sachs',
        subtext: 'Safety and prestige',
        nextSceneId: 'ch8_banker_selected',
        effects: {
          setFlags: ['BANKER_GOLDMAN'],
        },
      },
      {
        id: 'ch8_choose_morgan',
        text: 'Recommend Morgan Stanley',
        subtext: 'Aggressive on valuation',
        nextSceneId: 'ch8_banker_selected',
        effects: {
          setFlags: ['BANKER_MORGAN'],
        },
      },
      {
        id: 'ch8_choose_evercore',
        text: 'Recommend Evercore',
        subtext: 'Senior attention, lower fees',
        nextSceneId: 'ch8_banker_selected',
        effects: {
          setFlags: ['BANKER_EVERCORE'],
          relationships: [{ npcId: 'victor', change: 10, memory: 'Chose the banker who would treat my company right' }],
        },
      },
    ],
  },

  // Strategic Path
  {
    id: 'ch8_strategic_path',
    chapterId: 'chapter_8',
    title: 'Finding a Buyer',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The committee approves the strategic sale path. Now: build the buyer universe.

*Who would pay a premium for Prometheus?*

**TIER 1 — Strategic Buyers (Control Premium):**
- **TechGiant Corp** — $400B market cap, aggressive M&A, cultural concerns
- **IndustrialSoft AG** — German conglomerate, PE-backed history, slower process
- **CloudFirst Inc** — High-growth acquirer, stock deal likely, integration risk

**TIER 2 — Financial Sponsors (Continuation):**
- **Blackstone** — Massive fund, continuation vehicle possible
- **KKR** — Tech sector focus, existing relationship
- **Advent** — European angle, cross-border complexity

The banker—you've hired Lazard for the sell-side—presents their outreach strategy:

**"We recommend a targeted process. Five to seven buyers, compressed timeline, create competitive tension without running a broad auction."**

**"Why not a broader process?"** Alexandra asks.

**"Leak risk. The moment this hits the market, your competitors know, your customers worry, your employees panic. Controlled is better than comprehensive."**

*How aggressive should the outreach be?*`,
    choices: [
      {
        id: 'ch8_targeted_process',
        text: 'Approve the targeted process',
        subtext: 'Quality over quantity',
        nextSceneId: 'ch8_buyer_meetings',
        effects: {
          setFlags: ['TARGETED_PROCESS'],
        },
      },
      {
        id: 'ch8_broader_process',
        text: 'Push for a broader auction',
        subtext: 'Maximize competitive tension',
        nextSceneId: 'ch8_buyer_meetings',
        effects: {
          stats: { stress: 5 },
          setFlags: ['BROAD_PROCESS'],
        },
      },
    ],
  },

  // Secondary Path
  {
    id: 'ch8_secondary_path',
    chapterId: 'chapter_8',
    title: 'Sponsor to Sponsor',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The secondary path has unique complexities. You're selling to another PE firm—people who do this for a living.

**"The key question,"** you explain to the committee, **"is rollover. Do we take liquidity completely, or do we roll equity into the new structure?"**

Alexandra's response is immediate: **"Meridian needs full liquidity. Our fund timeline doesn't allow rollover."**

Chad hesitates: **"Sterling could consider rolling 20-25% if the valuation is right. Shows conviction to the buyer."**

Victor Chen adds: **"If there's a new sponsor, I want to understand their plans. I'm not handing my company to someone who'll strip it for parts."**

The secondary buyers are already circling:

**Vista Equity** — Software specialist, operational playbook, reputation for efficiency (and layoffs)
**Thoma Bravo** — Sector leader, premium valuations, aggressive integration
**Silver Lake** — Tech focus, founder-friendly reputation, longer hold periods

*Each buyer represents a different future for Prometheus.*`,
    choices: [
      {
        id: 'ch8_vista_focus',
        text: 'Prioritize Vista Equity',
        subtext: 'Highest likely price',
        nextSceneId: 'ch8_secondary_negotiation',
        effects: {
          setFlags: ['SECONDARY_VISTA'],
        },
      },
      {
        id: 'ch8_silver_lake_focus',
        text: 'Prioritize Silver Lake',
        subtext: 'Founder-friendly, longer horizon',
        nextSceneId: 'ch8_secondary_negotiation',
        effects: {
          relationships: [{ npcId: 'victor', change: 10, memory: 'Chose a buyer who would respect my legacy' }],
          setFlags: ['SECONDARY_SILVERLAKE'],
        },
      },
    ],
  },

  // Dual Track Path
  {
    id: 'ch8_dual_track_path',
    chapterId: 'chapter_8',
    title: 'The Dual Track',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `The dual-track approach is ambitious: run an IPO process and a strategic sale simultaneously, choosing the better outcome at the end.

**"It's expensive,"** the CFO warns. **"We're talking $15 million in banking fees, legal costs, management distraction. And if either process leaks that we're running both, we lose credibility."**

**"But the optionality is valuable,"** Chad argues. **"If markets tank, we have a strategic fallback. If strategics lowball us, we have the IPO."**

Victor Chen looks uncomfortable: **"This feels like we're playing games with my company's future."**

**"We're maximizing outcomes for all stakeholders,"** you respond. **"Including your equity."**

The committee votes. The dual-track is approved—narrowly.

*Now you have to execute two processes at once without either one discovering the other.*`,
    choices: [
      {
        id: 'ch8_dual_begin',
        text: 'Begin the dual-track process',
        nextSceneId: 'ch8_banker_selected',
        effects: {
          stats: { stress: 15, dealcraft: 10 },
        },
      },
    ],
  },

  // Banker Selected
  {
    id: 'ch8_banker_selected',
    chapterId: 'chapter_8',
    title: 'The Process Begins',
    type: 'narrative',
    atmosphere: 'office',
    narrative: `*Three months into the exit process*

The machine is in motion. Bankers. Lawyers. Accountants. Consultants. An army of advisors billing thousands per hour.

The S-1 draft is on its fifth revision. The management presentation has been rehearsed twelve times. The data room contains 2,000 documents.

David Park—still CEO, now a seasoned executive—handles the pressure well. He's come a long way from that shell-shocked leader on Day 1.

**"How do you feel?"** you ask him during a break.

**"Terrified. Excited. Exhausted."** He laughs. **"Is this what it's always like?"**

**"Every exit is different. This one is going well."**

**"So far."** He pauses. **"What happens if it doesn't work? If the market crashes, or the buyer walks, or..."**

**"Then we adapt. That's what we do."**

Your phone buzzes. The lead banker: **"We have a situation. Call me now."**

*In M&A, 'situations' are never good news.*`,
    choices: [
      {
        id: 'ch8_take_call',
        text: 'Take the call',
        nextSceneId: 'ch8_market_shock',
      },
    ],
  },

  // Buyer Meetings
  {
    id: 'ch8_buyer_meetings',
    chapterId: 'chapter_8',
    title: 'The Buyer Parade',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Six weeks of management presentations*

Every buyer meeting follows the same pattern: the pitch, the questions, the poker faces.

**TechGiant Corp** sends a team of twenty. They ask about integration synergies and "cultural alignment." Victor Chen is visibly uncomfortable.

**IndustrialSoft AG** is methodical, German, thorough. They spend three hours on revenue recognition policies.

**CloudFirst Inc** is fast-moving and aggressive. Their CEO joins the call personally—always a good sign.

After the last presentation, you debrief with David Park:

**"CloudFirst is the most excited. TechGiant has the deepest pockets. IndustrialSoft is the most thorough."**

**"Which one do you want?"**

He hesitates. **"Honestly? None of them feel like the right home for what we've built."**

**"That's not how this works. Someone is going to own this company. Our job is to pick the best option."**

**"And if the best option isn't good enough?"**

*The CEO is having second thoughts. Manage carefully.*`,
    choices: [
      {
        id: 'ch8_reassure_ceo',
        text: 'Reassure him about the process',
        nextSceneId: 'ch8_bid_deadline',
        effects: {
          relationships: [{ npcId: 'david_park', change: 10, memory: 'Helped me through the exit anxiety' }],
        },
      },
      {
        id: 'ch8_reality_check',
        text: 'Give him a reality check',
        subtext: 'This is happening whether he likes it or not',
        nextSceneId: 'ch8_bid_deadline',
        effects: {
          stats: { politics: 5 },
          relationships: [{ npcId: 'david_park', change: -5, memory: 'Was cold about the exit' }],
        },
      },
    ],
  },

  // Secondary Negotiation
  {
    id: 'ch8_secondary_negotiation',
    chapterId: 'chapter_8',
    title: 'The Sponsor Dance',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Negotiating with PE buyers is different. They know every trick because they use them.*

The term sheet from your chosen sponsor arrives:

**Headline:** $14.2B enterprise value
**Structure:** $10B debt / $4.2B equity
**Rollover:** Sterling invited to roll 25% at flat valuation
**Management:** New MIP with 8% pool
**Governance:** Standard sponsor controls
**Timeline:** 60 days to close

Alexandra reviews it first: **"The valuation is light. Our IRR target needs $15B."**

Chad disagrees: **"The certainty value is real. No market risk, no regulatory approval, close in sixty days."**

The sponsor's deal lead calls you directly:

**"Look, we both know the game. You want a higher number, we want a lower one. But here's the thing: we actually like this business. We're not looking to flip it. We want to build."**

**"That's what everyone says."**

**"We're offering Victor a five-year consulting agreement and board observer rights. Does that sound like someone planning to gut the company?"**

*The sponsor is trying to build trust. Real or performative?*`,
    choices: [
      {
        id: 'ch8_push_valuation',
        text: 'Push back hard on valuation',
        subtext: 'We need $15B or we walk',
        nextSceneId: 'ch8_bid_deadline',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['PUSHED_VALUATION'],
        },
      },
      {
        id: 'ch8_accept_terms',
        text: 'Accept the terms with minor modifications',
        subtext: 'Good enough is good enough',
        nextSceneId: 'ch8_bid_deadline',
        effects: {
          stats: { politics: 5 },
          setFlags: ['ACCEPTED_TERMS'],
        },
      },
    ],
  },

  // Market Shock
  {
    id: 'ch8_market_shock',
    chapterId: 'chapter_8',
    title: 'The Black Swan',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `The banker's voice is tense:

**"The Fed just announced an emergency rate hike. Tech stocks are down 8% in pre-market. The IPO window may be closing."**

You check your Bloomberg terminal. It's worse than he's describing. The NASDAQ is in freefall. The IPO pipeline is freezing.

**"What are our options?"**

**"Three paths: One, we accelerate—price this week at a discount and get out before it gets worse. Two, we pause—wait six months for markets to stabilize. Three, we pivot—switch to a strategic sale and hope buyers don't reprice."**

Your phone is exploding. The consortium partners, the management team, Victor Chen—everyone wants answers.

Chad finds you in the hallway: **"This is why we have insurance. We always knew markets could turn."**

**"Insurance doesn't help if we're mid-process."**

**"No. But we still have options. The question is which bad option is least bad."**

*Market crisis. Mid-exit. Every decision matters.*`,
    choices: [
      {
        id: 'ch8_accelerate',
        text: 'Recommend accelerating the IPO',
        subtext: 'Price at a discount, get out now',
        nextSceneId: 'ch8_ipo_decision',
        style: 'risky',
        effects: {
          stats: { stress: 15 },
          setFlags: ['ACCELERATED_IPO'],
        },
      },
      {
        id: 'ch8_pause',
        text: 'Recommend pausing the process',
        subtext: 'Wait for markets to stabilize',
        nextSceneId: 'ch8_pause_decision',
        effects: {
          stats: { politics: 10 },
          setFlags: ['PAUSED_PROCESS'],
        },
      },
      {
        id: 'ch8_pivot_strategic',
        text: 'Recommend pivoting to strategic sale',
        subtext: 'Find a buyer who ignores markets',
        nextSceneId: 'ch8_strategic_pivot',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['PIVOTED_STRATEGIC'],
        },
      },
    ],
  },

  // Bid Deadline
  {
    id: 'ch8_bid_deadline',
    chapterId: 'chapter_8',
    title: 'Final Bids',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Bid deadline day*

The final bids arrive by 5 PM. Three envelopes. Three potential futures.

**CloudFirst Inc:** $15.8B, all stock, minimal conditions
**TechGiant Corp:** $16.2B, 70% cash / 30% stock, regulatory approval required
**IndustrialSoft AG:** $14.5B, all cash, fastest close

The committee convenes.

**"CloudFirst has the headline,"** the banker explains, **"but it's all stock. If their shares drop 20%, we're at $12.6B."**

**"TechGiant is cash-heavy,"** Chad observes, **"but DOJ might block this on antitrust grounds. That's six months of uncertainty."**

**"IndustrialSoft is certain,"** Alexandra says, **"but it's below our target. Our LPs will ask questions."**

Victor Chen looks at each bid.

**"Which buyer will take care of my people?"**

The room goes quiet. That's not usually the deciding factor.

*Final decision time. Value versus certainty versus legacy.*`,
    choices: [
      {
        id: 'ch8_choose_cloudFirst',
        text: 'Recommend CloudFirst',
        subtext: 'Highest upside, stock risk',
        nextSceneId: 'ch8_final_negotiation',
        effects: {
          setFlags: ['BUYER_CLOUDFIRST'],
        },
      },
      {
        id: 'ch8_choose_techgiant',
        text: 'Recommend TechGiant',
        subtext: 'Best economics, regulatory risk',
        nextSceneId: 'ch8_final_negotiation',
        effects: {
          setFlags: ['BUYER_TECHGIANT'],
        },
      },
      {
        id: 'ch8_choose_industrialsoft',
        text: 'Recommend IndustrialSoft',
        subtext: 'Certainty of close, lower price',
        nextSceneId: 'ch8_final_negotiation',
        effects: {
          relationships: [{ npcId: 'victor', change: 5, memory: 'Chose the buyer who would preserve my company' }],
          setFlags: ['BUYER_INDUSTRIALSOFT'],
        },
      },
    ],
  },

  // IPO Decision
  {
    id: 'ch8_ipo_decision',
    chapterId: 'chapter_8',
    title: 'The Pricing Call',
    type: 'narrative',
    atmosphere: 'crisis',
    narrative: `*The night before pricing*

The IPO roadshow is complete. Institutional investors have placed orders. The book is covered—but at what price?

The banker presents the range:

**"We can price at $42 per share—the low end of the range. That gives us 3x oversubscription and a smooth opening."**

**"Or we can push to $48—the top of the range. More aggressive, but the book is thinner there. If the market drops tomorrow, we could break issue."**

**"What's your gut?"** you ask.

**"My gut says take the certainty. $42 still gets you to a $15B valuation. That's a win."**

The managing partner weighs in: **"We didn't run this process to leave money on the table. Push for $46."**

Alexandra disagrees: **"A broken IPO is worse than a conservative price. Our reputation matters."**

*Pricing is an art, not a science. What's your call?*`,
    choices: [
      {
        id: 'ch8_price_conservative',
        text: 'Price conservatively at $42',
        subtext: 'Certainty over optimization',
        nextSceneId: 'ch8_ipo_outcome',
        style: 'safe',
        effects: {
          setFlags: ['IPO_CONSERVATIVE'],
        },
      },
      {
        id: 'ch8_price_aggressive',
        text: 'Push for $46',
        subtext: 'Maximize value, accept risk',
        nextSceneId: 'ch8_ipo_outcome',
        style: 'risky',
        effects: {
          setFlags: ['IPO_AGGRESSIVE'],
        },
      },
    ],
  },

  // Pause Decision
  {
    id: 'ch8_pause_decision',
    chapterId: 'chapter_8',
    title: 'The Wait',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `*The hardest part of pausing is the uncertainty*

You recommend shelving the IPO until markets stabilize. The committee agrees—reluctantly.

The announcement goes out: "Due to market conditions, Prometheus Technologies has postponed its planned initial public offering."

The next six months are limbo. The company keeps performing, but the exit uncertainty weighs on everyone.

David Park struggles with morale: **"The employees saw the S-1. They know we were going public. Now they're wondering if something's wrong."**

**"Nothing's wrong. Markets turned. It happens."**

**"Easy for you to say. You can wait. Some of my people have been here ten years waiting for a liquidity event."**

He's not wrong. Delayed gratification only works if gratification eventually arrives.

*Six months later, markets recover. The process restarts.*`,
    choices: [
      {
        id: 'ch8_restart_process',
        text: 'Restart the exit process',
        nextSceneId: 'ch8_final_negotiation',
        effects: {
          stats: { stress: -10 },
          setFlags: ['PROCESS_RESTARTED'],
        },
      },
    ],
  },

  // Strategic Pivot
  {
    id: 'ch8_strategic_pivot',
    chapterId: 'chapter_8',
    title: 'The Pivot',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `You pivot from IPO to strategic sale. The bankers reach out to three potential acquirers:

**"We've been approached about a potential combination opportunity..."**

The story works. Strategic buyers often see market downturns as buying opportunities—fewer competitors, less frothy pricing.

Within two weeks, you have serious interest from two parties:

**GlobalTech Partners** — A strategic consolidator, offering $14.5B in cash
**NexGen Software** — A larger PE-backed platform, offering $15.2B in stock and cash

The pivot worked. You're back in a competitive process.

**"This is actually better positioning,"** the banker admits. **"Strategic buyers know the IPO market is closed. They have to pay up or lose the asset."**

*Sometimes the best path isn't the one you started on.*`,
    choices: [
      {
        id: 'ch8_continue_strategic',
        text: 'Continue with strategic process',
        nextSceneId: 'ch8_final_negotiation',
        effects: {
          stats: { dealcraft: 10 },
        },
      },
    ],
  },

  // IPO Outcome
  {
    id: 'ch8_ipo_outcome',
    chapterId: 'chapter_8',
    title: 'Opening Bell',
    type: 'narrative',
    atmosphere: 'celebration',
    narrative: `*Pricing night. Then the morning of.*

The stock is priced. The press release goes out. CNBC runs the ticker: **PRMS**.

9:30 AM. The opening bell. Victor Chen and David Park stand on the NYSE floor, surrounded by Prometheus employees flown in for the occasion.

The first trade prints.

**$48.50.**

Above the IPO price. The deal is a success.

You watch from the gallery. The floor erupts in cheers. Four years of work—turnarounds, crises, negotiations—culminating in this moment.

Chad finds you in the crowd.

**"Not bad. 2.8x MOIC on the first trade. By the time the lock-up expires, could be 3.5x."**

**"If the stock holds."**

**"If the stock holds."** He pauses. **"But today, we celebrate. Tomorrow, we start the next one."**

*The exit is complete. The returns are locked. But the lock-up period still has six months to go.*`,
    choices: [
      {
        id: 'ch8_ipo_celebrate',
        text: 'Celebrate with the team',
        nextSceneId: 'ch8_closing_bell',
        effects: {
          stats: { reputation: 15, money: 100000 },
          achievement: 'IPO_SUCCESS',
        },
      },
    ],
  },

  // Final Negotiation
  {
    id: 'ch8_final_negotiation',
    chapterId: 'chapter_8',
    title: 'The Home Stretch',
    type: 'narrative',
    atmosphere: 'meeting',
    narrative: `*Final negotiations with the winning bidder*

The term sheet is almost done. But "almost" in M&A means nothing is finished.

**Remaining issues:**

**Price adjustment:** The buyer wants a working capital collar. You want a fixed price.

**Indemnification:** They want 18 months of rep coverage. You're offering 12.

**Break-up fee:** They want 3% if the deal falls through. Standard is 2%.

**Management retention:** They want David Park to commit to three years. He's offering two.

Every point is a negotiation. Every concession has a cost.

At 2 AM, the lawyers are still arguing over a MAC clause definition. You step out for coffee and find Victor Chen in the hallway.

**"Is it always like this?"** he asks.

**"The last 10% takes 90% of the time. That's M&A."**

**"I'm too old for this."** He sighs. **"But I'm glad you're here. I trust you to get this right."**

*Final push. Everything comes down to the next few hours.*`,
    choices: [
      {
        id: 'ch8_hold_line',
        text: 'Hold the line on key terms',
        subtext: 'Don\'t give away value at the finish',
        nextSceneId: 'ch8_signing',
        effects: {
          stats: { dealcraft: 10 },
          setFlags: ['HELD_LINE'],
        },
      },
      {
        id: 'ch8_compromise',
        text: 'Compromise to get the deal done',
        subtext: 'A closed deal beats a perfect deal',
        nextSceneId: 'ch8_signing',
        effects: {
          stats: { politics: 10 },
          setFlags: ['COMPROMISED'],
        },
      },
    ],
  },

  // Signing
  {
    id: 'ch8_signing',
    chapterId: 'chapter_8',
    title: 'Signing',
    type: 'narrative',
    atmosphere: 'quiet',
    narrative: `*4:47 AM. The signing.*

The conference room is littered with coffee cups and takeout containers. Forty people in various states of exhaustion.

The final documents are printed. Signature pages are circulated.

Victor Chen signs first. His hand is steady, but his eyes are wet.

**"Thirty-four years,"** he says quietly. **"Started in a garage. Ended in a law firm conference room."**

**"It's not ending,"** you say. **"It's transitioning."**

**"You said that before. After the LBO."** He smiles. **"Maybe this time I'll believe it."**

The consortium partners sign. The buyer signs. The documents are collected, compiled, and sent to escrow.

**"Ladies and gentlemen,"** the lead lawyer announces, **"we have a deal."**

Applause. Handshakes. A few tears.

*$15.8 billion. 3.2x MOIC. 32% IRR. The deal of a career.*`,
    choices: [
      {
        id: 'ch8_signing_complete',
        text: 'Acknowledge the moment',
        nextSceneId: 'ch8_closing_bell',
        effects: {
          stats: { reputation: 15, money: 150000 },
          achievement: 'STRATEGIC_EXIT_SUCCESS',
        },
      },
    ],
  },

  // Closing Bell
  {
    id: 'ch8_closing_bell',
    chapterId: 'chapter_8',
    title: 'The Closing',
    type: 'narrative',
    atmosphere: 'celebration',
    narrative: `*Closing day. The wire transfers clear.*

The money flows: $15.8 billion from buyer to seller. Debt repaid. Equity distributed. Carried interest calculated.

Sterling Partners' share: $2.1 billion in proceeds.
Your personal carry (after years of accumulation): $4.2 million.

It's more money than you ever imagined having. And somehow, it feels beside the point.

The real achievement isn't the money. It's what you built—and what survives.

Prometheus Technologies will continue. Three thousand employees will keep their jobs. Victor Chen's legacy will endure.

David Park sends you a text: **"Thank you. For everything. I wouldn't be here without you."**

You look out the window at Manhattan. Somewhere out there, another company is struggling. Another founder is wondering if they should sell. Another PE firm is circling.

*The cycle continues. The only question is: what role will you play in the next one?*`,
    choices: [
      {
        id: 'ch8_reflect',
        text: 'Reflect on the journey',
        nextSceneId: 'ch8_chapter_end',
        effects: {
          stats: { stress: -20 },
        },
      },
    ],
  },

  // Chapter End
  {
    id: 'ch8_chapter_end',
    chapterId: 'chapter_8',
    title: 'Full Circle',
    type: 'chapter_end',
    atmosphere: 'quiet',
    narrative: `*One month later. Sterling Partners annual meeting.*

The managing partner stands at the podium. The room is full of LPs—pension funds, endowments, family offices—the people whose capital you've been managing.

**"Fund IV delivered a 2.8x net MOIC and 24% net IRR. Prometheus Technologies was our largest and most successful investment."**

He pauses.

**"But the numbers don't tell the full story. Behind every return is a team. Analysts who built the models. Associates who ran the diligence. VPs who managed the process. Principals who led the execution."**

**"And sometimes, there's someone who does all of those things across an entire investment lifecycle. Who learns to source deals, negotiate terms, execute turnarounds, and manage exits."**

He looks at you.

**"It is my pleasure to announce the promotion of our newest Partner."**

The room applauds. You stand, not quite believing it.

From first day to Partner. From spreadsheets to strategy. From observer to owner.

*This is what you worked for. This is what it means.*

**CHAPTER 8 COMPLETE**

*The journey ends where it began: in a room full of people deciding what's next. But now you're not the one asking questions. You're the one providing answers.*

*Private equity is a game of cycles—buying, building, selling, repeating. You've completed your first full cycle. The next one starts tomorrow.*

*What will you build?*

**THE END**

*Thank you for playing Fund Wars.*`,
    choices: [],
    requiresAcknowledgment: true,
  },
];

// ============================================================================
// CHAPTER DEFINITIONS
// ============================================================================

export const STORY_CHAPTERS: Chapter[] = [
  {
    id: 'chapter_1',
    number: 1,
    title: 'The First Day',
    teaser: 'Your first day at Sterling Partners. Make an impression—or get buried.',
    openingSceneId: 'ch1_opening',
    endingSceneIds: ['ch1_chapter_end', 'ch1_chapter_end_team'],
    estimatedMinutes: 15,
    theme: 'introduction',
  },
  {
    id: 'chapter_2',
    number: 2,
    title: 'The First Deal',
    teaser: 'Your PackFancy discovery is moving to acquisition. Time to see if your paper analysis holds up in the real world.',
    openingSceneId: 'ch2_opening',
    endingSceneIds: ['ch2_aggressive_path', 'ch2_balanced_path', 'ch2_ethical_path', 'ch2_pass_path'],
    requirements: {
      completedChapters: ['chapter_1'],
    },
    estimatedMinutes: 20,
    theme: 'rising_action',
  },
  {
    id: 'chapter_3',
    number: 3,
    title: 'The Negotiation',
    teaser: 'The term sheet is on the table. The Kowalski family waits across from you. Every word matters now.',
    openingSceneId: 'ch3_opening',
    endingSceneIds: ['ch3_chapter_end_standard', 'ch3_chapter_end_ethical', 'ch3_chapter_end_pragmatic'],
    requirements: {
      completedChapters: ['chapter_2'],
    },
    estimatedMinutes: 25,
    theme: 'crisis',
  },
  {
    id: 'chapter_4',
    number: 4,
    title: 'The Reckoning',
    teaser: 'Six months after closing, PackFancy is struggling. The board wants answers. Time to prove your worth.',
    openingSceneId: 'ch4_opening',
    endingSceneIds: ['ch4_chapter_end'],
    requirements: {
      completedChapters: ['chapter_3'],
    },
    estimatedMinutes: 30,
    theme: 'resolution',
  },
  {
    id: 'chapter_5',
    number: 5,
    title: 'The Hunt',
    teaser: 'No more banker deals. Source your first proprietary opportunity—or watch your career stall.',
    openingSceneId: 'ch5_opening',
    endingSceneIds: ['ch5_chapter_end', 'ch5_chapter_end_pass'],
    requirements: {
      completedChapters: ['chapter_4'],
    },
    estimatedMinutes: 25,
    theme: 'rising_action',
  },
  {
    id: 'chapter_6',
    number: 6,
    title: 'The Syndicate',
    teaser: 'A deal too big for one fund. Navigate co-investor politics in the largest LBO of your career.',
    openingSceneId: 'ch6_opening',
    endingSceneIds: ['ch6_chapter_end', 'ch6_chapter_end_walk'],
    requirements: {
      completedChapters: ['chapter_5'],
    },
    estimatedMinutes: 30,
    theme: 'crisis',
  },
  {
    id: 'chapter_7',
    number: 7,
    title: 'The 100 Days',
    teaser: 'Post-acquisition reality hits hard. You have 100 days to prove the investment thesis—or watch it collapse.',
    openingSceneId: 'ch7_opening',
    endingSceneIds: ['ch7_chapter_end', 'ch7_chapter_end_exit'],
    requirements: {
      completedChapters: ['chapter_6'],
    },
    estimatedMinutes: 35,
    theme: 'resolution',
  },
  {
    id: 'chapter_8',
    number: 8,
    title: 'The Exit',
    teaser: 'Four years in. Time to return capital. Choose your exit path and close the deal of your career.',
    openingSceneId: 'ch8_opening',
    endingSceneIds: ['ch8_chapter_end'],
    requirements: {
      completedChapters: ['chapter_7'],
    },
    estimatedMinutes: 30,
    theme: 'epilogue',
  },
];

// ============================================================================
// ALL SCENES
// ============================================================================

export const STORY_SCENES: Scene[] = [
  ...CHAPTER_1_SCENES,
  ...CHAPTER_2_SCENES,
  ...CHAPTER_3_SCENES,
  ...CHAPTER_4_SCENES,
  ...CHAPTER_5_SCENES,
  ...CHAPTER_6_SCENES,
  ...CHAPTER_7_SCENES,
  ...CHAPTER_8_SCENES,
];

// ============================================================================
// CONTENT REGISTRY
// ============================================================================

let contentRegistry: ContentRegistry | null = null;

export function createContentRegistry(): ContentRegistry {
  if (contentRegistry) return contentRegistry;

  const scenes = new Map<string, Scene>();
  const chapters = new Map<string, Chapter>();
  const arcs = new Map<string, StoryArc>();
  const scenesByChapter = new Map<string, Scene[]>();

  // Build scene map
  for (const scene of STORY_SCENES) {
    scenes.set(scene.id, scene);

    // Group by chapter
    if (!scenesByChapter.has(scene.chapterId)) {
      scenesByChapter.set(scene.chapterId, []);
    }
    scenesByChapter.get(scene.chapterId)!.push(scene);
  }

  // Build chapter map
  for (const chapter of STORY_CHAPTERS) {
    chapters.set(chapter.id, chapter);
  }

  contentRegistry = {
    scenes,
    chapters,
    arcs,
    scenesByChapter,
  };

  return contentRegistry;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  STORY_CHAPTERS,
  STORY_SCENES,
  createContentRegistry,
};
