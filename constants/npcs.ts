/**
 * NPC Constants
 *
 * Definitions for all non-player characters including initial NPCs,
 * family members, and rival fund managing partners.
 */

import type { NPC, FamilyMember } from '../types';

export const INITIAL_NPCS: NPC[] = [
  {
    id: 'chad',
    name: 'Chad (MD)',
    role: 'Managing Director',
    avatar: 'fa-user-tie',
    relationship: 50,
    mood: 55,
    trust: 45,
    traits: ['Aggressive', 'Results-Oriented', 'Impatient'],
    memories: [],
    isRival: false,
    faction: 'MANAGING_DIRECTORS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Chad (MD)', text: "Don't screw this up, rookie. I need this bonus." }],
    schedule: {
      weekday: ['MORNING', 'AFTERNOON'],
      weekend: ['MORNING'],
      preferredChannel: 'desk standup',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'MORNING', description: 'Pipeline standup' },
      ],
    },
    lastContactTick: 0,
    goals: ['Close a trophy deal this quarter', 'Protect my bonus pool'],
  },
  {
    id: 'hunter',
    name: 'Hunter',
    role: 'Rival VP',
    avatar: 'fa-user-ninja',
    relationship: 20,
    mood: 25,
    trust: 15,
    traits: ['Manipulative', 'Competitive', 'Shark'],
    memories: [],
    isRival: true,
    faction: 'RIVALS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Hunter', text: "Cute deal. Did you even check the Liquidation Preferences? or are you just donating money?" }],
    schedule: {
      weekday: ['AFTERNOON', 'EVENING'],
      weekend: ['EVENING'],
      preferredChannel: 'late-night texts',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'EVENING', description: 'Shadow auction updates' },
      ],
    },
    lastContactTick: 0,
    goals: ['Steal your deals', 'Win auctions on the cheap'],
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'Senior Analyst',
    avatar: 'fa-glasses',
    relationship: 60,
    mood: 65,
    trust: 60,
    traits: ['Overworked', 'Detail-Oriented', 'Anxious'],
    memories: [],
    isRival: false,
    faction: 'ANALYSTS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Sarah', text: "I haven't slept in 40 hours and the Cash Flow Statement is off by $1,000. It's probably a circular reference." }],
    schedule: {
      weekday: ['AFTERNOON', 'EVENING'],
      weekend: ['AFTERNOON'],
      preferredChannel: 'data room pings',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'AFTERNOON', description: 'Model scrub' },
      ],
    },
    lastContactTick: 0,
    goals: ['Keep the model clean', 'Get credit for solid diligence'],
  },
  {
    id: 'regulator',
    name: 'Agent Smith',
    role: 'SEC Regulator',
    avatar: 'fa-building-columns',
    relationship: 50,
    mood: 45,
    trust: 50,
    traits: ['Suspicious', 'Bureaucratic'],
    memories: [],
    isRival: false,
    faction: 'REGULATORS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Agent Smith', text: "We are monitoring market activity closely." }],
    schedule: {
      weekday: ['MORNING'],
      weekend: [],
      preferredChannel: 'formal memos',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'MORNING', description: 'Compliance check' },
      ],
    },
    lastContactTick: 0,
    goals: ['Lower your audit risk', 'Spot sloppy disclosures early'],
  },
  {
    id: 'lp_swiss',
    name: 'Hans Gruber',
    role: 'Limited Partner (Swiss Bank)',
    avatar: 'fa-landmark',
    relationship: 40,
    mood: 35,
    trust: 45,
    traits: ['Risk-Averse', 'Conservative', 'Traditional'],
    memories: [],
    isRival: false,
    faction: 'LIMITED_PARTNERS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Hans Gruber', text: "We prefer capital preservation over your... 'American' growth tactics. Show me your IP Roadmap." }],
    schedule: {
      weekday: ['MORNING'],
      weekend: ['MORNING'],
      preferredChannel: 'scheduled calls',
      standingMeetings: [
        { dayType: 'WEEKDAY', timeSlot: 'MORNING', description: 'Quarterly NAV review' },
      ],
    },
    lastContactTick: 0,
    goals: ['Allocate to disciplined managers', 'Avoid headline risk'],
  },
  {
    id: 'lp_oil',
    name: 'Sheikh Al-Maktoum',
    role: 'Limited Partner (SWF)',
    avatar: 'fa-coins',
    relationship: 30,
    mood: 35,
    trust: 25,
    traits: ['Aggressive', 'Visionary', 'Impatient'],
    memories: [],
    isRival: false,
    faction: 'LIMITED_PARTNERS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Sheikh Al-Maktoum', text: "We need alpha, not beta. Show me something bold." }],
    schedule: {
      weekday: ['AFTERNOON'],
      weekend: ['AFTERNOON', 'EVENING'],
      preferredChannel: 'deal dinners',
      standingMeetings: [
        { dayType: 'WEEKEND', timeSlot: 'EVENING', description: 'Deal dinner debrief' },
      ],
    },
    lastContactTick: 0,
    goals: ['Swing for outsize returns', 'Move quickly on bold ideas'],
  }
];

// ==================== FAMILY NPCs ====================
// Personal relationships that create financial and emotional obligations

export const FAMILY_NPCS: FamilyMember[] = [
  {
    id: 'mom',
    name: 'Mom',
    role: 'Retired Teacher',
    avatar: 'fa-heart',
    relationship: 80,
    mood: 70,
    trust: 90,
    traits: ['Worried', 'Supportive', 'Guilting'],
    memories: [],
    isRival: false,
    relationshipType: 'FAMILY',
    familyRole: 'PARENT',
    financialNeed: 30,
    emotionalNeed: 70,
    lastContactWeek: 0,
    dialogueHistory: [
      { sender: 'npc', senderName: 'Mom', text: "Honey, I know you're busy with your important job, but we haven't heard from you in weeks. Dad's back is acting up again. Call when you can? Love you." }
    ],
    schedule: {
      weekday: ['MORNING', 'EVENING'],
      weekend: ['MORNING', 'AFTERNOON', 'EVENING'],
    },
    goals: ['Make sure you eat', 'Guilt trip about not visiting', 'Ask about relationships'],
  },
  {
    id: 'dad',
    name: 'Dad',
    role: 'Retired Accountant',
    avatar: 'fa-user-tie',
    relationship: 60,
    mood: 50,
    trust: 75,
    traits: ['Skeptical', 'Old School', 'Secretly Proud'],
    memories: [],
    isRival: false,
    relationshipType: 'FAMILY',
    familyRole: 'PARENT',
    financialNeed: 40,
    emotionalNeed: 30,
    lastContactWeek: 0,
    dialogueHistory: [
      { sender: 'npc', senderName: 'Dad', text: "Private equity, huh? In my day we called that 'corporate raiding.' Your mother says you're doing well. I'll believe it when I see a real paycheck, not these 'carried interest' IOUs." }
    ],
    schedule: {
      weekday: ['MORNING'],
      weekend: ['MORNING', 'AFTERNOON'],
    },
    goals: ['Understand what you actually do', 'Give unsolicited financial advice', 'See you succeed on his terms'],
  },
  {
    id: 'brother_mike',
    name: 'Mike',
    role: 'Younger Brother',
    avatar: 'fa-user',
    relationship: 65,
    mood: 50,
    trust: 70,
    traits: ['Struggling', 'Resentful', 'Proud'],
    memories: [],
    isRival: false,
    relationshipType: 'FAMILY',
    familyRole: 'SIBLING',
    financialNeed: 80,
    emotionalNeed: 40,
    lastContactWeek: 0,
    dialogueHistory: [
      { sender: 'npc', senderName: 'Mike', text: "Hey big shot. So you're making the big bucks now huh? Must be nice. Anyway, I'm in a bit of a jam. Nothing major. Just need like $5k to cover rent this month. Pay you back when my startup takes off." }
    ],
    schedule: {
      weekday: ['EVENING'],
      weekend: ['AFTERNOON', 'EVENING'],
    },
    goals: ['Borrow money', 'Avoid feeling inferior', 'Get your advice on his "startup"'],
  },
  {
    id: 'girlfriend_emma',
    name: 'Emma',
    role: 'Girlfriend (6 months)',
    avatar: 'fa-face-smile',
    relationship: 70,
    mood: 55,
    trust: 60,
    traits: ['Neglected', 'Understanding', 'Has Limits'],
    memories: [],
    isRival: false,
    relationshipType: 'FAMILY',
    familyRole: 'PARTNER',
    financialNeed: 10,  // She has her own career
    emotionalNeed: 90,  // Needs quality time
    lastContactWeek: 0,
    dialogueHistory: [
      { sender: 'npc', senderName: 'Emma', text: "So are we still on for dinner Saturday? You cancelled the last three times. I get that work is crazy but I'm starting to wonder if I'm even a priority anymore." }
    ],
    schedule: {
      weekday: ['EVENING'],
      weekend: ['MORNING', 'AFTERNOON', 'EVENING'],
    },
    goals: ['Quality time', 'Feel valued', 'Evaluate if this relationship has a future'],
  },
];

// ==================== RIVAL FUND NPCs ====================
// Managing partners of competing funds

export const RIVAL_FUND_NPCS: NPC[] = [
  {
    id: 'victoria',
    name: 'Victoria Chen',
    role: 'MP at Meridian Partners',
    avatar: 'fa-user-tie',
    relationship: 45,
    mood: 50,
    trust: 38,
    traits: ['Calculated', 'Disciplined', 'Risk-Averse'],
    memories: [],
    isRival: true,
    faction: 'RIVALS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Victoria Chen', text: "I've seen your fund's deal flow. Interesting strategy. Risky, but interesting." }],
    relationshipType: 'WORK',
    dealPotential: 60,
    goals: ['Defend Meridian deal flow', 'Exploit your mistakes']
  },
  {
    id: 'marcus',
    name: 'Marcus Webb',
    role: 'Founder at Apex Equity',
    avatar: 'fa-user-secret',
    relationship: 35,
    mood: 40,
    trust: 30,
    traits: ['Opportunistic', 'Scrappy', 'Aggressive'],
    memories: [],
    isRival: true,
    faction: 'RIVALS',
    dialogueHistory: [{ sender: 'npc', senderName: 'Marcus Webb', text: "You and me, we're the same. Hungry. The old money boys like Hunter don't get it." }],
    relationshipType: 'WORK',
    dealPotential: 40,
    goals: ['Prove scrappy funds can win', 'Leverage gossip to ambush you']
  }
];
