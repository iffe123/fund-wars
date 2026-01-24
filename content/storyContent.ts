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
