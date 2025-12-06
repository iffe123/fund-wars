import type { NPC, NPCDrama, Choice } from '../types';

/**
 * NPC Drama System
 *
 * This file contains drama templates that can trigger based on NPC states
 * and relationships. Each drama generator checks specific conditions and
 * returns a drama event if conditions are met.
 */

// Drama generator type - returns drama if conditions are met, null otherwise
type DramaGenerator = (npcs: NPC[], currentWeek: number) => NPCDrama | null;

/**
 * All available drama templates
 * Each template checks conditions and generates a drama event
 */
export const NPC_DRAMA_TEMPLATES: DramaGenerator[] = [
  // Sarah vs Hunter rivalry
  (npcs, currentWeek) => {
    const sarah = npcs.find(n => n.id === 'sarah');
    const hunter = npcs.find(n => n.id === 'hunter');
    if (!sarah || !hunter) return null;
    if (sarah.relationship < 40 || hunter.relationship < 40) return null;

    return {
      id: 'sarah_hunter_rivalry',
      title: 'Office Politics Erupts',
      description: `Sarah storms into your office. "Hunter is taking credit for MY model work on the PackFancy deal. I've been here until 2am for weeks while he schmoozed clients. Now he's telling Chad HE ran the analysis?" She's furious. Hunter's version is... different.`,
      involvedNpcs: ['sarah', 'hunter'],
      playerMustChooseSide: true,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Back Sarah',
          description: 'Tell Chad the truth. Sarah did the work.',
          outcome: {
            description: 'Sarah is vindicated. Hunter is humiliated—and now your enemy.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'sarah', change: 25, memory: 'Defended me when it mattered' },
              npcRelationshipUpdate2: { npcId: 'hunter', change: -30, memory: 'Sided against me in front of Chad' },
            },
          },
        },
        {
          text: 'Back Hunter',
          description: 'Tell Chad they were both involved. Give Hunter the win.',
          outcome: {
            description: 'Hunter owes you one. Sarah looks at you differently now.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'hunter', change: 20, memory: 'Had my back in the credit dispute' },
              npcRelationshipUpdate2: { npcId: 'sarah', change: -20, trustChange: -15, memory: 'Threw me under the bus' },
            },
          },
        },
        {
          text: 'Stay out of it',
          description: "Not your circus, not your monkeys.",
          outcome: {
            description: "Both feel abandoned. But at least you didn't make an enemy.",
            statChanges: {
              npcRelationshipUpdate: { npcId: 'sarah', change: -10, memory: "Wouldn't stand up for me" },
              npcRelationshipUpdate2: { npcId: 'hunter', change: -5, memory: 'Too weak to pick a side' },
              reputation: -5,
            },
          },
        },
      ],
    };
  },

  // Chad's secret
  (npcs, currentWeek) => {
    const chad = npcs.find(n => n.id === 'chad');
    if (!chad || chad.relationship < 30) return null;

    return {
      id: 'chad_secret',
      title: "Chad's Little Problem",
      description: `Late night at the office. Chad pulls you aside. He's been drinking. "Listen, kid. I made a mistake. Told an LP we have a deal in exclusivity when... we don't. The meeting is tomorrow. I need you to make it look real. Create a fake data room. Just for 24 hours." He looks desperate.`,
      involvedNpcs: ['chad'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 1,
      choices: [
        {
          text: 'Cover for him',
          description: 'Build the fake data room. Help Chad save face.',
          outcome: {
            description: "The LP is fooled. Chad owes you everything. But you've crossed a line.",
            statChanges: {
              ethics: -30,
              auditRisk: 20,
              npcRelationshipUpdate: { npcId: 'chad', change: 40, trustChange: 30, memory: 'Saved my career when I needed it' },
              setsFlags: ['COVERED_FOR_CHAD'],
            },
          },
        },
        {
          text: "I can't do that",
          description: 'Tell Chad he needs to come clean.',
          outcome: {
            description: 'Chad stares at you coldly. "Remember this moment." He finds another way. Your ethics intact, your career at risk.',
            statChanges: {
              ethics: 20,
              npcRelationshipUpdate: { npcId: 'chad', change: -35, trustChange: -20, memory: 'Abandoned me in my hour of need' },
              reputation: -10,
            },
          },
        },
        {
          text: 'Anonymous compliance tip',
          description: 'Protect yourself. Report to the compliance hotline.',
          outcome: {
            description: "Compliance investigates. Chad is put on leave. You're safe... for now. But someone will figure out it was you.",
            statChanges: {
              ethics: 30,
              reputation: 15,
              auditRisk: -20,
              npcRelationshipUpdate: { npcId: 'chad', change: -50, memory: 'The rat who ended my career' },
              setsFlags: ['WHISTLEBLOWER_CHAD'],
            },
          },
        },
      ],
    };
  },

  // Emma jealousy (romantic tension)
  (npcs, currentWeek) => {
    const emma = npcs.find(n => n.id === 'girlfriend_emma');
    const sarah = npcs.find(n => n.id === 'sarah');
    if (!emma || !sarah) return null;
    if (emma.relationship < 50 || sarah.relationship < 60) return null;

    return {
      id: 'emma_jealousy',
      title: 'Emma Suspects Something',
      description: `Emma scrolls through your phone. "Who's Sarah? Why are you texting at midnight about 'models'?" She's not buying the "work colleague" explanation. Meanwhile, Sarah has been staying late specifically when you're in the office...`,
      involvedNpcs: ['girlfriend_emma', 'sarah'],
      playerMustChooseSide: false,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 3,
      choices: [
        {
          text: 'Prove your commitment to Emma',
          description: 'Plan a special weekend. Distance yourself from Sarah at work.',
          outcome: {
            description: 'Emma feels loved. Sarah notices the cold shoulder and focuses on work.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'girlfriend_emma', change: 20, trustChange: 15, memory: 'Chose me over everything' },
              npcRelationshipUpdate2: { npcId: 'sarah', change: -10, memory: 'Suddenly became distant' },
              cash: -3000,
            },
          },
        },
        {
          text: 'Better at compartmentalizing',
          description: 'Keep both relationships but be more careful about communication.',
          outcome: {
            description: "You're walking a tightrope. Nothing changes, but everything feels fragile.",
            statChanges: {
              stress: 15,
            },
          },
        },
        {
          text: 'Examine your feelings',
          description: 'Maybe there IS something with Sarah...',
          outcome: {
            description: "You spend a long night thinking. The answer isn't clear, but the question is now real.",
            statChanges: {
              stress: 10,
              setsFlags: ['CONSIDERING_SARAH'],
            },
          },
        },
      ],
    };
  },

  // Hunter's scheme
  (npcs, currentWeek) => {
    const hunter = npcs.find(n => n.id === 'hunter');
    if (!hunter || hunter.relationship < 50) return null;

    return {
      id: 'hunter_scheme',
      title: "Hunter's Proposition",
      description: `Hunter catches you in the parking garage. "I've got a line on a deal. Biotech company, pre-revenue but the tech is legit. My buddy at FDA says approval is coming. We could front-run this." He winks. "Chad doesn't need to know."`,
      involvedNpcs: ['hunter'],
      playerMustChooseSide: true,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'I\'m in',
          description: 'Trade on the inside information. Make some real money.',
          outcome: {
            description: 'The trade works. You made $50K. But now you\'re complicit.',
            statChanges: {
              cash: 50000,
              ethics: -40,
              auditRisk: 30,
              npcRelationshipUpdate: { npcId: 'hunter', change: 25, trustChange: 20, memory: 'Partner in crime' },
              setsFlags: ['INSIDER_TRADING'],
            },
          },
        },
        {
          text: 'Too risky for me',
          description: 'Decline but keep it between you two.',
          outcome: {
            description: 'Hunter shrugs. "Your loss." He does the trade anyway. You saw nothing.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'hunter', change: -5, memory: 'Too straight-laced for the real game' },
            },
          },
        },
        {
          text: 'This is insider trading',
          description: 'Tell Hunter this is illegal and he should stop.',
          outcome: {
            description: 'Hunter laughs. "Thanks, Boy Scout." The SEC might be interested in your tip...',
            statChanges: {
              ethics: 15,
              npcRelationshipUpdate: { npcId: 'hunter', change: -25, memory: 'Threatened to expose me' },
            },
          },
        },
      ],
    };
  },

  // Family emergency - Mom needs money
  (npcs, currentWeek) => {
    const mom = npcs.find(n => n.id === 'mom');
    if (!mom || mom.relationship < 30) return null;

    return {
      id: 'mom_medical',
      title: "Mom's Medical Bills",
      description: `Your mom calls in tears. Your dad's insurance won't cover a procedure he needs. It's $25,000. "I wouldn't ask if we had any other option, honey. I know you're busy with your important job..."`,
      involvedNpcs: ['mom'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Pay the full amount',
          description: 'Family comes first. Always.',
          outcome: {
            description: 'Dad gets the procedure. Your parents are eternally grateful.',
            statChanges: {
              cash: -25000,
              stress: -10,
              npcRelationshipUpdate: { npcId: 'mom', change: 30, trustChange: 20, memory: 'Saved your father without hesitation' },
            },
          },
        },
        {
          text: 'Pay half, suggest a payment plan',
          description: 'Help, but set boundaries.',
          outcome: {
            description: 'Mom is grateful but slightly hurt. Dad gets the procedure eventually.',
            statChanges: {
              cash: -12500,
              npcRelationshipUpdate: { npcId: 'mom', change: 10, memory: 'Helped, but hesitated' },
            },
          },
        },
        {
          text: 'Suggest they find another option',
          description: 'You can\'t afford it right now.',
          outcome: {
            description: 'The silence on the phone says everything. Your mom hangs up without saying goodbye.',
            statChanges: {
              stress: 20,
              npcRelationshipUpdate: { npcId: 'mom', change: -35, trustChange: -25, memory: 'Abandoned us when we needed you most' },
            },
          },
        },
      ],
    };
  },

  // Brother Mike's startup
  (npcs, currentWeek) => {
    const mike = npcs.find(n => n.id === 'brother_mike');
    if (!mike || mike.relationship < 40) return null;

    return {
      id: 'mike_startup',
      title: "Mike's Big Ask",
      description: `Your brother Mike wants $100K to fund his startup. "It's the next Uber, but for dog walking. I just need seed capital. You're in PE, you understand these things. This is a 10x opportunity, guaranteed."`,
      involvedNpcs: ['brother_mike'],
      playerMustChooseSide: true,
      urgency: 'LOW',
      expiresWeek: currentWeek + 4,
      choices: [
        {
          text: 'Invest the full $100K',
          description: 'He\'s your brother. Believe in him.',
          outcome: {
            description: 'Mike is thrilled. The startup... well, we\'ll see.',
            statChanges: {
              cash: -100000,
              npcRelationshipUpdate: { npcId: 'brother_mike', change: 35, trustChange: 25, memory: 'Believed in me when no one else did' },
              setsFlags: ['INVESTED_IN_MIKE'],
            },
          },
        },
        {
          text: 'Offer $25K and mentorship',
          description: 'Support him, but do proper due diligence first.',
          outcome: {
            description: 'Mike is initially disappointed but appreciates your professional approach.',
            statChanges: {
              cash: -25000,
              npcRelationshipUpdate: { npcId: 'brother_mike', change: 15, memory: 'Helped on your terms, not mine' },
            },
          },
        },
        {
          text: 'Explain why you can\'t invest',
          description: 'It\'s not personal, it\'s business.',
          outcome: {
            description: '"You invest in strangers\' companies but not your own brother\'s?" The door slams.',
            statChanges: {
              reputation: 5, // Kept professional boundaries
              npcRelationshipUpdate: { npcId: 'brother_mike', change: -30, trustChange: -20, memory: 'Thought money was more important than family' },
            },
          },
        },
      ],
    };
  },

  // The Sheikh's test
  (npcs, currentWeek) => {
    const sheikh = npcs.find(n => n.id === 'sheikh');
    if (!sheikh || sheikh.relationship < 50) return null;

    return {
      id: 'sheikh_test',
      title: 'The Sheikh\'s Invitation',
      description: `Sheikh Al-Maktoum invites you to Dubai for a "private discussion about future opportunities." His assistant mentions it's an informal event with some of his closest business partners. First class, of course. But Chad wasn't invited, and you sense this is some kind of test.`,
      involvedNpcs: ['sheikh'],
      playerMustChooseSide: true,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Accept the invitation',
          description: 'Fly to Dubai. See what he really wants.',
          outcome: {
            description: 'The Sheikh appreciates directness. You\'re now in his inner circle. Doors open.',
            statChanges: {
              reputation: 15,
              energy: -20,
              npcRelationshipUpdate: { npcId: 'sheikh', change: 30, trustChange: 25, memory: 'Came when I called' },
              factionReputation: { LIMITED_PARTNERS: 10, MANAGING_DIRECTORS: 5, ANALYSTS: 0, REGULATORS: 0, RIVALS: 0 },
            },
          },
        },
        {
          text: 'Tell Chad about the invite',
          description: 'Loop in your boss. Play it safe.',
          outcome: {
            description: 'Chad is furious he wasn\'t invited and makes it weird. The Sheikh\'s assistant calls to rescind the invitation.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'sheikh', change: -20, memory: 'Couldn\'t keep a simple confidence' },
              npcRelationshipUpdate2: { npcId: 'chad', change: 10, memory: 'Loyal to the firm, at least' },
            },
          },
        },
        {
          text: 'Politely decline',
          description: 'Too busy right now. Perhaps another time.',
          outcome: {
            description: 'The Sheikh understands. But his assistant never calls again.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'sheikh', change: -10, memory: 'Not ready for the big leagues' },
            },
          },
        },
      ],
    };
  },

  // Agent Smith's warning
  (npcs, currentWeek) => {
    const smith = npcs.find(n => n.id === 'agent_smith');
    if (!smith || smith.relationship < 25) return null;

    return {
      id: 'smith_warning',
      title: 'A Visit from Agent Smith',
      description: `Agent Smith appears at your favorite coffee shop. Coincidence? "We've noticed some... irregularities in recent filings. Not yours specifically, but we're looking at everyone connected to certain deals. I thought you'd appreciate a heads up." He slides a business card across the table.`,
      involvedNpcs: ['agent_smith'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 1,
      choices: [
        {
          text: 'Cooperate fully',
          description: 'Offer to help with the investigation.',
          outcome: {
            description: 'Smith nods approvingly. "Smart choice." You might have just made a powerful ally... or marked yourself.',
            statChanges: {
              auditRisk: -15,
              npcRelationshipUpdate: { npcId: 'agent_smith', change: 25, trustChange: 15, memory: 'Cooperated when it mattered' },
              setsFlags: ['SEC_COOPERATOR'],
            },
          },
        },
        {
          text: 'Say nothing, consult lawyers',
          description: 'Don\'t admit anything. Get legal advice.',
          outcome: {
            description: 'Smith sighs. "Everyone needs a lawyer these days." He leaves the card.',
            statChanges: {
              cash: -10000, // Legal fees
              stress: 15,
              npcRelationshipUpdate: { npcId: 'agent_smith', change: -5, memory: 'Lawyered up immediately' },
            },
          },
        },
        {
          text: 'Suggest focusing elsewhere',
          description: 'Point him toward someone who might deserve scrutiny more.',
          outcome: {
            description: 'Smith raises an eyebrow. "That\'s interesting information." You\'ve just traded someone else\'s future for yours.',
            statChanges: {
              ethics: -25,
              auditRisk: -10,
              npcRelationshipUpdate: { npcId: 'agent_smith', change: 15, memory: 'Provided useful intelligence' },
              setsFlags: ['RATTED_TO_SEC'],
            },
          },
        },
      ],
    };
  },
];

/**
 * Check all drama conditions and return the first valid drama
 */
export const checkForNPCDrama = (npcs: NPC[], currentWeek: number): NPCDrama | null => {
  // Shuffle templates to add randomness
  const shuffledTemplates = [...NPC_DRAMA_TEMPLATES].sort(() => Math.random() - 0.5);

  for (const template of shuffledTemplates) {
    // Only a 20% chance to trigger each drama even if conditions are met
    if (Math.random() > 0.20) continue;

    const drama = template(npcs, currentWeek);
    if (drama) return drama;
  }

  return null;
};

/**
 * Get drama by specific ID (for saved game loading)
 */
export const getDramaById = (dramaId: string, npcs: NPC[], currentWeek: number): NPCDrama | null => {
  for (const template of NPC_DRAMA_TEMPLATES) {
    const drama = template(npcs, currentWeek);
    if (drama && drama.id === dramaId) return drama;
  }
  return null;
};

/**
 * Get all possible dramas for current NPC states (useful for debugging)
 */
export const getAllPossibleDramas = (npcs: NPC[], currentWeek: number): NPCDrama[] => {
  const dramas: NPCDrama[] = [];

  for (const template of NPC_DRAMA_TEMPLATES) {
    const drama = template(npcs, currentWeek);
    if (drama) dramas.push(drama);
  }

  return dramas;
};
