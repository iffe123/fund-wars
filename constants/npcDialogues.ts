/**
 * NPC Dialogues
 *
 * Interactive conversations with NPCs that affect relationships and outcomes.
 */

import type { NPCDialogue } from '../types/npcDialogue';

export const NPC_DIALOGUES: NPCDialogue[] = [
  // ==================== CHAD WORTHINGTON (Senior Partner) ====================
  {
    id: 'chad_performance_review',
    npcId: 'chad',
    npcName: 'Chad Worthington III',
    npcRole: 'Senior Partner',
    triggerCondition: {
      weekRange: [4, 8],
      chance: 40,
    },
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Chad Worthington III',
        text: "Close the door. We need to talk about your performance. I've been watching you, and frankly, I'm not sure you have what it takes.",
        emotion: 'suspicious',
        responses: [
          {
            id: 'confident',
            text: "I've delivered on every assignment. What specifically concerns you?",
            tone: 'professional',
            nextNodeId: 'chad_specifics',
          },
          {
            id: 'humble',
            text: "I appreciate the feedback, Chad. How can I improve?",
            tone: 'humble',
            nextNodeId: 'chad_humble_response',
          },
          {
            id: 'aggressive',
            text: "My numbers speak for themselves. Maybe check the data before making accusations.",
            tone: 'aggressive',
            nextNodeId: 'chad_angry',
            effects: { stress: 10, relationship: -15 },
          },
        ],
      },
      chad_specifics: {
        id: 'chad_specifics',
        speaker: 'Chad Worthington III',
        text: "Your models are technically correct, but where's the killer instinct? Anyone can run numbers. What I want to know is - can you close a deal?",
        emotion: 'dismissive',
        responses: [
          {
            id: 'prove',
            text: "Give me a shot at the next sourcing opportunity. I'll prove myself.",
            tone: 'professional',
            nextNodeId: 'chad_opportunity',
            effects: { stress: 5 },
          },
          {
            id: 'defend',
            text: "Technical excellence is the foundation. The killer instinct comes with experience.",
            tone: 'professional',
            nextNodeId: 'chad_neutral_end',
          },
        ],
      },
      chad_humble_response: {
        id: 'chad_humble_response',
        speaker: 'Chad Worthington III',
        text: "At least you have some self-awareness. Most analysts think they're God's gift to finance. Here's the thing - I need someone who can think on their feet, not just follow a playbook.",
        emotion: 'neutral',
        responses: [
          {
            id: 'offer',
            text: "What would it take to prove I can do that?",
            tone: 'humble',
            nextNodeId: 'chad_opportunity',
          },
          {
            id: 'ask',
            text: "Can you give me an example of what you're looking for?",
            tone: 'professional',
            nextNodeId: 'chad_example',
          },
        ],
      },
      chad_angry: {
        id: 'chad_angry',
        speaker: 'Chad Worthington III',
        text: "Did you just... talk back to me? I've fired people for less. Get out of my office. We're done here.",
        emotion: 'angry',
        nextNodeId: 'chad_bad_end',
        autoAdvance: true,
      },
      chad_bad_end: {
        id: 'chad_bad_end',
        speaker: 'System',
        text: "Chad's door slams behind you. The entire floor heard that. This will have consequences.",
        effects: { reputation: -10, relationship: -20, setFlags: ['chad_angry'] },
      },
      chad_opportunity: {
        id: 'chad_opportunity',
        speaker: 'Chad Worthington III',
        text: "Alright. There's a company - mid-market manufacturing. Founder is... difficult. Most of our team has failed to get a meeting. You have two weeks. Don't embarrass the firm.",
        emotion: 'neutral',
        effects: {
          setFlags: ['chad_assignment'],
          unlockInfo: 'New sourcing opportunity: Difficult founder negotiation',
        },
        responses: [
          {
            id: 'accept',
            text: "I won't let you down.",
            tone: 'professional',
            nextNodeId: 'chad_good_end',
          },
        ],
      },
      chad_example: {
        id: 'chad_example',
        speaker: 'Chad Worthington III',
        text: "Last week, Sarah closed a deal by flying to meet the founder at 3am when he was about to sign with a competitor. That's what separates winners from also-rans. You think you have that in you?",
        emotion: 'impressed',
        responses: [
          {
            id: 'yes',
            text: "Absolutely. Tell me about this founder problem you mentioned.",
            tone: 'confident',
            nextNodeId: 'chad_opportunity',
          },
          {
            id: 'honest',
            text: "I'm willing to do what it takes, but I won't know until I'm tested.",
            tone: 'humble',
            nextNodeId: 'chad_neutral_end',
          },
        ],
      },
      chad_neutral_end: {
        id: 'chad_neutral_end',
        speaker: 'Chad Worthington III',
        text: "Hmph. We'll see. Get back to work.",
        emotion: 'dismissive',
        effects: { stress: 5 },
      },
      chad_good_end: {
        id: 'chad_good_end',
        speaker: 'Chad Worthington III',
        text: "Good. Now get out. And don't make me regret this.",
        emotion: 'neutral',
        effects: { reputation: 5, relationship: 10 },
      },
    },
    outcomes: {
      success: { reputation: 5, relationship: 10 },
      failure: { reputation: -10, stress: 15, relationship: -20 },
      neutral: { stress: 5 },
    },
  },

  // ==================== SARAH CHEN (VP) ====================
  {
    id: 'sarah_mentorship',
    npcId: 'sarah',
    npcName: 'Sarah Chen',
    npcRole: 'Vice President',
    triggerCondition: {
      weekRange: [2, 6],
      chance: 50,
    },
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Sarah Chen',
        text: "Hey, got a minute? I noticed you've been putting in crazy hours. I want to give you some advice - off the record.",
        emotion: 'neutral',
        responses: [
          {
            id: 'interested',
            text: "Sure, I'd appreciate any guidance you have.",
            tone: 'friendly',
            nextNodeId: 'sarah_advice',
          },
          {
            id: 'busy',
            text: "I'm actually in the middle of something. Can we talk later?",
            tone: 'professional',
            nextNodeId: 'sarah_dismissed',
            effects: { relationship: -5 },
          },
          {
            id: 'suspicious',
            text: "What's the catch? Nobody here does anything without an angle.",
            tone: 'sarcastic',
            nextNodeId: 'sarah_offended',
          },
        ],
      },
      sarah_advice: {
        id: 'sarah_advice',
        speaker: 'Sarah Chen',
        text: "Look, the partners value two things: results and loyalty. But here's what nobody tells you - sometimes those two things conflict. When they do, you need to decide who you really are.",
        emotion: 'neutral',
        responses: [
          {
            id: 'ask_more',
            text: "What do you mean by conflict? Can you give me an example?",
            tone: 'professional',
            nextNodeId: 'sarah_example',
          },
          {
            id: 'results',
            text: "Results should always come first. That's why we're here.",
            tone: 'professional',
            nextNodeId: 'sarah_disagrees',
          },
          {
            id: 'loyalty',
            text: "Loyalty matters. This is a relationship business.",
            tone: 'friendly',
            nextNodeId: 'sarah_agrees',
          },
        ],
      },
      sarah_example: {
        id: 'sarah_example',
        speaker: 'Sarah Chen',
        text: "Let's say you discover something in due diligence that kills a deal Chad really wants. Do you speak up and risk his wrath? Or do you stay quiet and let the deal close?",
        emotion: 'serious',
        responses: [
          {
            id: 'speak_up',
            text: "You have to speak up. The fiduciary duty is to the LPs, not to Chad's ego.",
            tone: 'professional',
            nextNodeId: 'sarah_impressed',
            effects: { relationship: 10 },
          },
          {
            id: 'political',
            text: "There has to be a way to raise concerns without making enemies.",
            tone: 'professional',
            nextNodeId: 'sarah_realistic',
          },
          {
            id: 'quiet',
            text: "Chad's track record is strong. Maybe trust his judgment?",
            tone: 'humble',
            nextNodeId: 'sarah_disappointed',
          },
        ],
      },
      sarah_impressed: {
        id: 'sarah_impressed',
        speaker: 'Sarah Chen',
        text: "That's the right answer. Most people here would tell you to keep your head down. I think you might actually make it here - if you can survive the politics.",
        emotion: 'impressed',
        effects: { reputation: 5, unlockInfo: "Sarah is an ally. She values integrity over politics." },
        responses: [
          {
            id: 'thanks',
            text: "Thanks for the advice, Sarah. I'll remember this.",
            tone: 'friendly',
            nextNodeId: 'sarah_good_end',
          },
        ],
      },
      sarah_realistic: {
        id: 'sarah_realistic',
        speaker: 'Sarah Chen',
        text: "Diplomatic answer. Sometimes that works, sometimes it doesn't. Just don't lose yourself trying to please everyone. I've seen it destroy good people.",
        emotion: 'neutral',
        effects: { unlockInfo: "Sarah has seen people burn out from political games." },
        responses: [
          {
            id: 'understood',
            text: "I'll keep that in mind. Thanks for the warning.",
            tone: 'professional',
            nextNodeId: 'sarah_neutral_end',
          },
        ],
      },
      sarah_disappointed: {
        id: 'sarah_disappointed',
        speaker: 'Sarah Chen',
        text: "Hmm. That's... a common perspective around here. Just be careful. Not everyone's judgment should be trusted blindly.",
        emotion: 'sad',
        effects: { relationship: -5 },
        responses: [
          {
            id: 'reflect',
            text: "You're giving me a lot to think about.",
            tone: 'humble',
            nextNodeId: 'sarah_neutral_end',
          },
        ],
      },
      sarah_disagrees: {
        id: 'sarah_disagrees',
        speaker: 'Sarah Chen',
        text: "I used to think that too. Then I watched someone get thrown under the bus for doing exactly what was asked. Results without relationships leave you vulnerable.",
        emotion: 'neutral',
        nextNodeId: 'sarah_realistic',
        autoAdvance: true,
      },
      sarah_agrees: {
        id: 'sarah_agrees',
        speaker: 'Sarah Chen',
        text: "It is a relationship business. But loyalty should be earned, not assumed. Some people here... aren't worthy of it.",
        emotion: 'suspicious',
        effects: { unlockInfo: "Sarah doesn't fully trust the partners." },
        responses: [
          {
            id: 'who',
            text: "Anyone in particular I should watch out for?",
            tone: 'curious',
            nextNodeId: 'sarah_warning',
          },
          {
            id: 'careful',
            text: "I appreciate the heads up. I'll be careful.",
            tone: 'professional',
            nextNodeId: 'sarah_neutral_end',
          },
        ],
      },
      sarah_warning: {
        id: 'sarah_warning',
        speaker: 'Sarah Chen',
        text: "I've said too much already. Just... keep your eyes open. Not everyone who smiles at you is your friend here.",
        emotion: 'suspicious',
        effects: { setFlags: ['sarah_warning'], unlockInfo: "There may be office politics you're not aware of." },
        responses: [
          {
            id: 'thanks',
            text: "Thanks for looking out for me, Sarah.",
            tone: 'friendly',
            nextNodeId: 'sarah_good_end',
          },
        ],
      },
      sarah_dismissed: {
        id: 'sarah_dismissed',
        speaker: 'Sarah Chen',
        text: "Sure. Another time then.",
        emotion: 'dismissive',
      },
      sarah_offended: {
        id: 'sarah_offended',
        speaker: 'Sarah Chen',
        text: "Wow. Okay. Good luck with that attitude. You're going to need it.",
        emotion: 'angry',
        effects: { relationship: -15 },
      },
      sarah_good_end: {
        id: 'sarah_good_end',
        speaker: 'Sarah Chen',
        text: "Anytime. Now get back to work before someone notices us talking.",
        emotion: 'happy',
        effects: { relationship: 15 },
      },
      sarah_neutral_end: {
        id: 'sarah_neutral_end',
        speaker: 'Sarah Chen',
        text: "Good luck out there. My door's open if you need anything.",
        emotion: 'neutral',
        effects: { relationship: 5 },
      },
    },
    outcomes: {
      success: { relationship: 15, reputation: 5 },
      failure: { relationship: -15 },
      neutral: { relationship: 5 },
    },
  },

  // ==================== FOUNDER NEGOTIATION ====================
  {
    id: 'founder_negotiation',
    npcId: 'founder_mike',
    npcName: 'Mike Brennan',
    npcRole: 'Founder & CEO',
    triggerCondition: {
      requiredFlags: ['chad_assignment'],
      chance: 100,
    },
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Mike Brennan',
        text: "Another private equity shark. I've turned away three of your competitors this month. I built this company with my own hands. Why should I sell to you?",
        emotion: 'suspicious',
        responses: [
          {
            id: 'honest',
            text: "I'm not going to pretend we're not here to make money. But I'm also not here to gut your company. What matters to you?",
            tone: 'professional',
            nextNodeId: 'mike_interested',
          },
          {
            id: 'pitch',
            text: "We can take your company to the next level. Our operational expertise and capital resources are unmatched.",
            tone: 'professional',
            nextNodeId: 'mike_skeptical',
          },
          {
            id: 'aggressive',
            text: "Because without capital, you'll be out of business in two years. The market is changing.",
            tone: 'aggressive',
            nextNodeId: 'mike_angry',
            effects: { relationship: -20 },
          },
        ],
      },
      mike_interested: {
        id: 'mike_interested',
        speaker: 'Mike Brennan',
        text: "Hm. At least you're not feeding me a line. What matters is my employees. I've got people who've been with me for 20 years. What happens to them?",
        emotion: 'neutral',
        responses: [
          {
            id: 'honest_workers',
            text: "I won't lie - there will probably be some restructuring. But we focus on growth, not just cost-cutting. We want to keep your best people.",
            tone: 'professional',
            nextNodeId: 'mike_considering',
          },
          {
            id: 'promise',
            text: "We'll keep everyone. Your people are the asset we're buying.",
            tone: 'friendly',
            nextNodeId: 'mike_suspicious_promise',
          },
        ],
      },
      mike_skeptical: {
        id: 'mike_skeptical',
        speaker: 'Mike Brennan',
        text: "Operational expertise? You're a 25-year-old in a suit. What do you know about running a manufacturing floor?",
        emotion: 'dismissive',
        responses: [
          {
            id: 'admit',
            text: "You're right, I don't. That's why we'd be partners, not replacements. You run operations, we help with capital and strategy.",
            tone: 'humble',
            nextNodeId: 'mike_softening',
          },
          {
            id: 'defend',
            text: "I know how to read a balance sheet and identify inefficiencies. That's what I bring.",
            tone: 'professional',
            nextNodeId: 'mike_still_skeptical',
          },
        ],
      },
      mike_angry: {
        id: 'mike_angry',
        speaker: 'Mike Brennan',
        text: "Get out. I've heard enough vulture capitalist threats. Tell your boss I'm not interested - ever.",
        emotion: 'angry',
        effects: { clearFlags: ['chad_assignment'], setFlags: ['founder_failed'] },
      },
      mike_suspicious_promise: {
        id: 'mike_suspicious_promise',
        speaker: 'Mike Brennan',
        text: "Keep everyone? That's what the last PE firm said before they laid off 40% of the workforce. You think I was born yesterday?",
        emotion: 'angry',
        responses: [
          {
            id: 'backtrack',
            text: "You're right to be skeptical. Let me be more honest about what we actually do.",
            tone: 'humble',
            nextNodeId: 'mike_considering',
          },
          {
            id: 'insist',
            text: "Our firm is different. We have a track record of protecting jobs.",
            tone: 'professional',
            nextNodeId: 'mike_still_skeptical',
          },
        ],
      },
      mike_softening: {
        id: 'mike_softening',
        speaker: 'Mike Brennan',
        text: "Partners, huh? That's a word that's thrown around a lot. But you're the first one who's admitted you don't have all the answers. Tell me more about this partnership.",
        emotion: 'neutral',
        effects: { relationship: 10 },
        responses: [
          {
            id: 'detail',
            text: "You stay on as CEO with a meaningful equity stake. We provide growth capital and board support. You still run the show.",
            tone: 'professional',
            nextNodeId: 'mike_deal',
          },
        ],
      },
      mike_considering: {
        id: 'mike_considering',
        speaker: 'Mike Brennan',
        text: "At least you're being straight with me. Most of you PE types dance around the hard questions. What does your firm actually want from this deal?",
        emotion: 'neutral',
        responses: [
          {
            id: 'returns',
            text: "We want 20-25% returns. That means growing the business, not stripping it. We make money when you succeed.",
            tone: 'professional',
            nextNodeId: 'mike_deal',
          },
          {
            id: 'growth',
            text: "We see potential for expansion - new markets, add-on acquisitions, maybe international. Your platform is strong.",
            tone: 'professional',
            nextNodeId: 'mike_deal',
          },
        ],
      },
      mike_still_skeptical: {
        id: 'mike_still_skeptical',
        speaker: 'Mike Brennan',
        text: "I'm not convinced. But I'll give you one more chance. What makes your firm different from every other PE shop that's come through here?",
        emotion: 'suspicious',
        responses: [
          {
            id: 'track_record',
            text: "Our portfolio companies have an average tenure of 6 years. We don't flip businesses for a quick buck.",
            tone: 'professional',
            nextNodeId: 'mike_considering',
            requirements: { minReputation: 30 },
          },
          {
            id: 'honest_2',
            text: "Honestly? We're probably not that different. But I'm the one in front of you, and I'm telling you I'll fight for the right approach.",
            tone: 'humble',
            nextNodeId: 'mike_softening',
          },
        ],
      },
      mike_deal: {
        id: 'mike_deal',
        speaker: 'Mike Brennan',
        text: "Alright. I'm not saying yes, but I'm not saying no. Send me a term sheet and I'll actually read it this time. But if I see any of that typical PE nonsense, we're done.",
        emotion: 'neutral',
        effects: {
          reputation: 10,
          relationship: 20,
          setFlags: ['founder_deal_possible'],
          clearFlags: ['chad_assignment'],
          unlockInfo: "Mike is willing to consider a deal. Prepare a fair term sheet.",
        },
        responses: [
          {
            id: 'thanks',
            text: "Thank you for the opportunity, Mike. You won't regret it.",
            tone: 'professional',
            nextNodeId: 'mike_end',
          },
        ],
      },
      mike_end: {
        id: 'mike_end',
        speaker: 'Mike Brennan',
        text: "We'll see about that. Now get out of my office - I have a company to run.",
        emotion: 'neutral',
      },
    },
    outcomes: {
      success: { reputation: 10, relationship: 20 },
      failure: { reputation: -15, stress: 20, relationship: -30 },
      neutral: { stress: 5 },
    },
  },

  // ==================== ANALYST COMPETITOR ====================
  {
    id: 'analyst_rivalry',
    npcId: 'marcus',
    npcName: 'Marcus Webb',
    npcRole: 'Fellow Analyst',
    triggerCondition: {
      weekRange: [3, 10],
      chance: 35,
    },
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        speaker: 'Marcus Webb',
        text: "Hey, nice work on that model last week. Really impressive stuff. Say, I'm working on a pitch for Chad and I could use some help with the sensitivity analysis. Mind sharing your template?",
        emotion: 'happy',
        responses: [
          {
            id: 'share',
            text: "Sure, I'll send it over. We're all on the same team, right?",
            tone: 'friendly',
            nextNodeId: 'marcus_takes',
            effects: { relationship: 5 },
          },
          {
            id: 'suspicious',
            text: "What's in it for me? Last time I helped someone, I didn't get any credit.",
            tone: 'sarcastic',
            nextNodeId: 'marcus_defensive',
          },
          {
            id: 'decline',
            text: "Sorry, I spent a lot of time building that. You should develop your own.",
            tone: 'professional',
            nextNodeId: 'marcus_angry',
          },
        ],
      },
      marcus_takes: {
        id: 'marcus_takes',
        speaker: 'Marcus Webb',
        text: "Thanks! You're the best. I'll definitely mention you contributed when I present to Chad.",
        emotion: 'happy',
        effects: { setFlags: ['helped_marcus'] },
        nextNodeId: 'marcus_later',
        autoAdvance: true,
      },
      marcus_later: {
        id: 'marcus_later',
        speaker: 'System',
        text: "A week later, you hear Marcus presented 'his' sensitivity analysis to Chad. He received high praise. Your contribution wasn't mentioned.",
        effects: { reputation: -5, setFlags: ['marcus_betrayed'], clearFlags: ['helped_marcus'] },
        responses: [
          {
            id: 'confront',
            text: "(Confront Marcus about this)",
            tone: 'aggressive',
            nextNodeId: 'marcus_confronted',
          },
          {
            id: 'ignore',
            text: "(Let it go and learn from it)",
            tone: 'professional',
            nextNodeId: 'marcus_lesson',
          },
        ],
      },
      marcus_confronted: {
        id: 'marcus_confronted',
        speaker: 'Marcus Webb',
        text: "What? I said I'd mention you if I got the chance. It just... never came up naturally. Don't be such a baby about it. This is how the game is played.",
        emotion: 'dismissive',
        effects: { relationship: -20, stress: 10 },
        responses: [
          {
            id: 'threaten',
            text: "Pull this again and I'll make sure everyone knows who really did that work.",
            tone: 'aggressive',
            nextNodeId: 'marcus_warned',
          },
          {
            id: 'walk_away',
            text: "I see how it is. Good to know.",
            tone: 'professional',
            nextNodeId: 'marcus_end',
          },
        ],
      },
      marcus_warned: {
        id: 'marcus_warned',
        speaker: 'Marcus Webb',
        text: "Whoa, relax. It's not that serious. Look, I'll throw you a bone next time, okay? We're still cool, right?",
        emotion: 'nervous',
        effects: { relationship: -10, setFlags: ['marcus_warned'] },
      },
      marcus_lesson: {
        id: 'marcus_lesson',
        speaker: 'System',
        text: "You file this experience away as a lesson in office politics. Trust is earned, not given.",
        effects: { stress: 5, unlockInfo: "Not everyone is trustworthy. Guard your work." },
      },
      marcus_end: {
        id: 'marcus_end',
        speaker: 'System',
        text: "You walk away, adding Marcus to your mental list of people not to trust.",
        effects: { setFlags: ['marcus_untrustworthy'] },
      },
      marcus_defensive: {
        id: 'marcus_defensive',
        speaker: 'Marcus Webb',
        text: "Wow, paranoid much? I'm just asking for a template, not your firstborn. Fine, I'll figure it out myself.",
        emotion: 'angry',
        effects: { relationship: -10 },
      },
      marcus_angry: {
        id: 'marcus_angry',
        speaker: 'Marcus Webb',
        text: "Seriously? We're supposed to be colleagues. Whatever, I'll remember this next time you need help.",
        emotion: 'angry',
        effects: { relationship: -15, setFlags: ['marcus_enemy'] },
      },
    },
    outcomes: {
      success: { relationship: 5 },
      failure: { relationship: -15, stress: 10 },
      neutral: { stress: 5 },
    },
  },
];

export const getDialogueByNpc = (npcId: string): NPCDialogue[] => {
  return NPC_DIALOGUES.filter(d => d.npcId === npcId);
};

export const getDialogueById = (dialogueId: string): NPCDialogue | undefined => {
  return NPC_DIALOGUES.find(d => d.id === dialogueId);
};

export const getTriggeredDialogues = (
  week: number,
  flags: string[]
): NPCDialogue[] => {
  return NPC_DIALOGUES.filter(dialogue => {
    const { triggerCondition } = dialogue;

    // Check week range
    if (triggerCondition.weekRange) {
      const [min, max] = triggerCondition.weekRange;
      if (week < min || week > max) return false;
    }

    // Check required flags
    if (triggerCondition.requiredFlags) {
      const hasAllFlags = triggerCondition.requiredFlags.every(f => flags.includes(f));
      if (!hasAllFlags) return false;
    }

    // Check chance
    if (triggerCondition.chance !== undefined) {
      if (Math.random() * 100 > triggerCondition.chance) return false;
    }

    return true;
  });
};
