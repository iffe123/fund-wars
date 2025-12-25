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
  // More chapters would go here
];

// ============================================================================
// ALL SCENES
// ============================================================================

export const STORY_SCENES: Scene[] = [
  ...CHAPTER_1_SCENES,
  // More chapter scenes would be added here
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
