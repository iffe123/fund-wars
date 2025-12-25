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
    ],
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
    type: 'outcome',
    atmosphere: 'celebration',
    narrative: `**CHAPTER 2 COMPLETE**

*The First Deal*

Your first real recommendation is on the record. The consequences—good or bad—will unfold in the chapters to come.

The Kowalski family is just the beginning. In Private Equity, every deal creates ripples. And sometimes, waves.`,
    choices: [],
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
];

// ============================================================================
// ALL SCENES
// ============================================================================

export const STORY_SCENES: Scene[] = [
  ...CHAPTER_1_SCENES,
  ...CHAPTER_2_SCENES,
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
