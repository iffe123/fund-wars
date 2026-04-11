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

  // ==================== NEW NPC DRAMA EVENTS ====================

  // Victoria Chen rivalry - Competitor MP
  (npcs, currentWeek) => {
    const victoria = npcs.find(n => n.id === 'victoria');
    const chad = npcs.find(n => n.id === 'chad');
    if (!victoria || !chad) return null;
    if (victoria.relationship < 30 || chad.relationship < 40) return null;

    return {
      id: 'victoria_poaching',
      title: 'Victoria Makes a Move',
      description: `Victoria Chen from Meridian Partners just called. "I've been watching you. You're wasted at that firm. I have a Principal role open—more carry, better deals, actual respect. Think about it." Chad doesn't know about this call. Yet.`,
      involvedNpcs: ['victoria', 'chad'],
      playerMustChooseSide: true,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 3,
      choices: [
        {
          text: 'Take the meeting',
          description: 'Hear her out. What\'s the harm in talking?',
          outcome: {
            description: 'You meet Victoria for coffee. The offer is real. The path forward at your current firm suddenly feels less certain.',
            statChanges: {
              stress: 10,
              npcRelationshipUpdate: { npcId: 'victoria', change: 20, trustChange: 15, memory: 'Took me seriously' },
              setsFlags: ['CONSIDERING_MERIDIAN'],
            },
          },
        },
        {
          text: 'Tell Chad immediately',
          description: 'Loyalty to the firm. Use this as leverage.',
          outcome: {
            description: 'Chad is furious—at Victoria, not you. "That snake." He promises to "take care of you" at bonus time. Whether that happens remains to be seen.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'chad', change: 25, trustChange: 20, memory: 'Stayed loyal when tested' },
              npcRelationshipUpdate2: { npcId: 'victoria', change: -30, memory: 'Ratted me out' },
            },
          },
        },
        {
          text: 'Politely decline',
          description: 'Not interested. You\'re building something here.',
          outcome: {
            description: 'Victoria seems genuinely surprised. "Your loss." She moves on to someone else. The door is closed.',
            statChanges: {
              reputation: 5,
              npcRelationshipUpdate: { npcId: 'victoria', change: -10, memory: 'Turned me down flat' },
            },
          },
        },
      ],
    };
  },

  // Hans Gruber LP concerns
  (npcs, currentWeek) => {
    const hans = npcs.find(n => n.id === 'lp_swiss');
    if (!hans || hans.relationship < 35) return null;

    return {
      id: 'hans_concerns',
      title: 'The Swiss Banker\'s Concerns',
      description: `Hans Gruber requests a private call. "I've been reviewing the quarterly reports. The leverage ratios on your recent deals concern me. We have capital preservation mandates. I need assurances." He's your largest LP.`,
      involvedNpcs: ['lp_swiss'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Provide detailed risk analysis',
          description: 'Walk him through every covenant, every stress test.',
          outcome: {
            description: 'After three hours on the phone, Hans is mollified. "You clearly understand the risks." He increases his commitment to your next fund.',
            statChanges: {
              energy: -20,
              reputation: 10,
              npcRelationshipUpdate: { npcId: 'lp_swiss', change: 20, trustChange: 15, memory: 'Took my concerns seriously' },
              factionReputation: { LIMITED_PARTNERS: 10, MANAGING_DIRECTORS: 0, ANALYSTS: 0, REGULATORS: 0, RIVALS: 0 },
            },
          },
        },
        {
          text: 'Dismiss his concerns',
          description: 'He\'s too conservative. Your returns speak for themselves.',
          outcome: {
            description: 'Hans goes quiet. "I see." Two weeks later, you hear he\'s doing reference calls on competing funds. Your biggest LP is shopping.',
            statChanges: {
              stress: 25,
              npcRelationshipUpdate: { npcId: 'lp_swiss', change: -30, trustChange: -25, memory: 'Dismissed my legitimate concerns' },
              factionReputation: { LIMITED_PARTNERS: -15, MANAGING_DIRECTORS: 0, ANALYSTS: 0, REGULATORS: 0, RIVALS: 0 },
            },
          },
        },
        {
          text: 'Offer a side letter with downside protection',
          description: 'Give him preferential terms to keep him happy.',
          outcome: {
            description: 'Hans accepts the side letter. Other LPs find out and demand the same terms. You\'ve opened Pandora\'s box.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'lp_swiss', change: 15, memory: 'Gave me special treatment' },
              reputation: -10,
              stress: 15,
            },
          },
        },
      ],
    };
  },

  // Dad's disapproval
  (npcs, currentWeek) => {
    const dad = npcs.find(n => n.id === 'dad');
    const mom = npcs.find(n => n.id === 'mom');
    if (!dad || !mom) return null;
    if (dad.relationship < 40) return null;

    return {
      id: 'dad_career_talk',
      title: 'Dad Has Questions',
      description: `Sunday dinner. Dad puts down his fork. "I read an article about private equity. They called you people 'corporate raiders' who destroy jobs. Is that what you do? Is that what I raised you for?" Mom looks mortified. The mashed potatoes are getting cold.`,
      involvedNpcs: ['dad', 'mom'],
      playerMustChooseSide: false,
      urgency: 'LOW',
      expiresWeek: currentWeek + 4,
      choices: [
        {
          text: 'Defend your profession passionately',
          description: 'Explain value creation, operational improvement, capital allocation.',
          outcome: {
            description: 'Dad listens. Really listens. "I still don\'t like it, but I can see you believe in what you do." Mom squeezes your hand under the table.',
            statChanges: {
              energy: -10,
              npcRelationshipUpdate: { npcId: 'dad', change: 15, trustChange: 10, memory: 'Actually explained the job to me' },
              npcRelationshipUpdate2: { npcId: 'mom', change: 10, memory: 'Handled your father with grace' },
            },
          },
        },
        {
          text: 'Admit it\'s complicated',
          description: 'Some of what he read is true. You wrestle with it.',
          outcome: {
            description: 'Dad nods slowly. "At least you\'re honest." The conversation shifts to sports. Something has thawed between you.',
            statChanges: {
              ethics: 5,
              npcRelationshipUpdate: { npcId: 'dad', change: 20, trustChange: 15, memory: 'Showed humility about the work' },
            },
          },
        },
        {
          text: 'Tell him you don\'t need his approval',
          description: 'You\'re an adult. You make your own choices.',
          outcome: {
            description: 'The table goes silent. Mom starts crying. Dad gets up and leaves. Christmas is going to be very awkward this year.',
            statChanges: {
              stress: 20,
              npcRelationshipUpdate: { npcId: 'dad', change: -35, trustChange: -20, memory: 'Threw my concern back in my face' },
              npcRelationshipUpdate2: { npcId: 'mom', change: -15, memory: 'Made dinner a disaster' },
            },
          },
        },
      ],
    };
  },

  // Marcus Webb backstab
  (npcs, currentWeek) => {
    const marcus = npcs.find(n => n.id === 'marcus');
    if (!marcus || marcus.relationship < 30) return null;

    return {
      id: 'marcus_backstab',
      title: 'Marcus\'s True Colors',
      description: `You just lost a deal you thought was locked up. Word on the street: Marcus Webb from Apex Equity leaked your bid to the seller to drive up the price, then swooped in with his own offer. He's at the same conference as you right now.`,
      involvedNpcs: ['marcus'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 1,
      choices: [
        {
          text: 'Confront him publicly',
          description: 'Make a scene at the conference. Let everyone know what he did.',
          outcome: {
            description: 'You corner Marcus at the cocktail hour. "Everyone, let me tell you about Marcus\'s negotiation tactics." The room goes quiet. Marcus laughs it off, but the damage is done. To both of you.',
            statChanges: {
              reputation: -10,
              stress: 15,
              npcRelationshipUpdate: { npcId: 'marcus', change: -40, memory: 'Humiliated me in front of the industry' },
              setsFlags: ['PUBLIC_FEUD_MARCUS'],
            },
          },
        },
        {
          text: 'Play the long game',
          description: 'Remember this. Wait for the right moment to return the favor.',
          outcome: {
            description: 'You smile at Marcus across the room. He knows you know. The score will be settled, but on your terms, at your time.',
            statChanges: {
              stress: 10,
              npcRelationshipUpdate: { npcId: 'marcus', change: -20, memory: 'Knows what I did but is biding time' },
              setsFlags: ['OWES_MARCUS'],
            },
          },
        },
        {
          text: 'Let it go—focus on the next deal',
          description: 'This is the business. Everyone plays rough sometimes.',
          outcome: {
            description: 'You buy Marcus a drink. "Nice move. I would have done the same." He looks confused, then relieved. In this industry, today\'s enemy is tomorrow\'s co-investor.',
            statChanges: {
              reputation: 5,
              npcRelationshipUpdate: { npcId: 'marcus', change: 10, memory: 'Surprisingly gracious about the backstab' },
            },
          },
        },
      ],
    };
  },

  // Sarah's burnout
  (npcs, currentWeek) => {
    const sarah = npcs.find(n => n.id === 'sarah');
    if (!sarah || sarah.relationship < 50) return null;

    return {
      id: 'sarah_burnout',
      title: 'Sarah\'s Breaking Point',
      description: `Sarah comes to you after hours. She looks exhausted. "I can't do this anymore. The hours, the pressure, the way Chad treats us. I'm thinking about quitting. Going to business school. Starting over." She's one of your best analysts.`,
      involvedNpcs: ['sarah'],
      playerMustChooseSide: false,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 3,
      choices: [
        {
          text: 'Mentor her through it',
          description: 'Share your own struggles. Help her find meaning in the work.',
          outcome: {
            description: 'You spend hours over coffee talking about careers, purpose, and what comes next. Sarah decides to stay, at least for now. You\'ve built something real here.',
            statChanges: {
              energy: -15,
              npcRelationshipUpdate: { npcId: 'sarah', change: 30, trustChange: 25, memory: 'Was there when I was falling apart' },
            },
          },
        },
        {
          text: 'Offer to help with the MBA applications',
          description: 'If she wants to leave, support her decision.',
          outcome: {
            description: 'You write her a glowing recommendation. She gets into Wharton. You lose a great analyst, but you\'ve made a friend for life. The network grows.',
            statChanges: {
              reputation: 10,
              npcRelationshipUpdate: { npcId: 'sarah', change: 25, trustChange: 30, memory: 'Helped me escape and supported my dreams' },
            },
          },
        },
        {
          text: 'Tell her to toughen up',
          description: 'Everyone goes through this. It\'s part of paying dues.',
          outcome: {
            description: 'Sarah\'s face hardens. "I thought you were different." She quits the next week. No two weeks notice. You\'re drowning in her workload.',
            statChanges: {
              stress: 25,
              npcRelationshipUpdate: { npcId: 'sarah', change: -40, memory: 'Showed no empathy when I needed it most' },
              reputation: -5,
            },
          },
        },
      ],
    };
  },

  // Hunter and Chad conspiracy
  (npcs, currentWeek) => {
    const hunter = npcs.find(n => n.id === 'hunter');
    const chad = npcs.find(n => n.id === 'chad');
    if (!hunter || !chad) return null;
    if (hunter.relationship > 50 || chad.relationship < 30) return null;

    return {
      id: 'hunter_chad_conspiracy',
      title: 'Whispers in the Corner Office',
      description: `You walk past Chad's office and hear Hunter's voice inside. They stop talking when they see you. Later, you hear them mention your name and the word "restructure." Something is happening behind closed doors.`,
      involvedNpcs: ['hunter', 'chad'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Confront Chad directly',
          description: 'Demand to know what they were discussing.',
          outcome: {
            description: 'Chad waves you off. "Relax. We were discussing team structure. You\'re fine." But the look he exchanges with Hunter tells a different story.',
            statChanges: {
              stress: 20,
              npcRelationshipUpdate: { npcId: 'chad', change: -10, memory: 'Got paranoid about a private conversation' },
              npcRelationshipUpdate2: { npcId: 'hunter', change: -5, memory: 'Knows we were talking about something' },
            },
          },
        },
        {
          text: 'Start documenting everything',
          description: 'Keep records. Prepare for the worst.',
          outcome: {
            description: 'You start saving emails, noting conversations, building a paper trail. If they try something, you\'ll be ready. The paranoia is exhausting, but necessary.',
            statChanges: {
              stress: 15,
              analystRating: 10,
              setsFlags: ['DOCUMENTING_CONSPIRACY'],
            },
          },
        },
        {
          text: 'Build alliances with other partners',
          description: 'If a political fight is coming, you need allies.',
          outcome: {
            description: 'You start taking other partners to lunch. Building relationships. If Hunter and Chad are plotting, they\'ll find you\'re not isolated.',
            statChanges: {
              energy: -10,
              reputation: 5,
              factionReputation: { MANAGING_DIRECTORS: 10, LIMITED_PARTNERS: 0, ANALYSTS: 0, REGULATORS: 0, RIVALS: 0 },
            },
          },
        },
      ],
    };
  },

  // Emma meets Sarah
  (npcs, currentWeek) => {
    const emma = npcs.find(n => n.id === 'girlfriend_emma');
    const sarah = npcs.find(n => n.id === 'sarah');
    if (!emma || !sarah) return null;
    if (emma.relationship < 60 || sarah.relationship < 40) return null;

    return {
      id: 'emma_meets_sarah',
      title: 'The Dinner Party Disaster',
      description: `You finally bring Emma to a work event. She spots Sarah across the room. "So that's Sarah. She's pretty." Emma's smile doesn't reach her eyes. Sarah comes over to say hi. The conversation is excruciatingly polite.`,
      involvedNpcs: ['girlfriend_emma', 'sarah'],
      playerMustChooseSide: false,
      urgency: 'LOW',
      expiresWeek: currentWeek + 4,
      choices: [
        {
          text: 'Stay by Emma\'s side all night',
          description: 'Make it clear where your priorities are.',
          outcome: {
            description: 'You hold Emma\'s hand all evening. She relaxes. Sarah notices and keeps her distance. The message is received, by everyone.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'girlfriend_emma', change: 20, trustChange: 15, memory: 'Made me feel like a priority' },
              npcRelationshipUpdate2: { npcId: 'sarah', change: -10, memory: 'Clearly avoided me at the party' },
            },
          },
        },
        {
          text: 'Facilitate a real conversation between them',
          description: 'They might actually like each other.',
          outcome: {
            description: 'You engineer a conversation. Turns out they have a lot in common. By the end of the night, they\'re exchanging Instagram handles. Crisis averted. Maybe.',
            statChanges: {
              stress: -10,
              npcRelationshipUpdate: { npcId: 'girlfriend_emma', change: 10, memory: 'Sarah is actually nice' },
              npcRelationshipUpdate2: { npcId: 'sarah', change: 10, memory: 'Emma is cooler than I expected' },
            },
          },
        },
        {
          text: 'Let them figure it out themselves',
          description: 'You have networking to do. They\'re adults.',
          outcome: {
            description: 'You get pulled into conversations with partners. When you look back, Emma is alone at the bar, looking miserable. Sarah is nowhere to be seen. The ride home is silent.',
            statChanges: {
              reputation: 10,
              npcRelationshipUpdate: { npcId: 'girlfriend_emma', change: -20, trustChange: -15, memory: 'Left me alone at a party I didn\'t want to go to' },
            },
          },
        },
      ],
    };
  },

  // Brother Mike's startup actually works
  (npcs, currentWeek) => {
    const mike = npcs.find(n => n.id === 'brother_mike');
    if (!mike || mike.relationship < 50) return null;

    return {
      id: 'mike_success',
      title: 'Mike\'s Big News',
      description: `Mike calls, excited. "Remember that idea you said was stupid? We just got a term sheet. $5M Series A, $20M pre-money valuation. They want you on the cap table. What do you say now, big shot?"`,
      involvedNpcs: ['brother_mike'],
      playerMustChooseSide: true,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Invest and apologize',
          description: 'You were wrong. Put your money where your mouth should have been.',
          outcome: {
            description: 'You wire $50K and call Mike to apologize. "I should have believed in you." Family dinner is going to be a lot warmer this Thanksgiving.',
            statChanges: {
              cash: -50000,
              ethics: 10,
              npcRelationshipUpdate: { npcId: 'brother_mike', change: 40, trustChange: 30, memory: 'Admitted being wrong and backed me' },
            },
          },
        },
        {
          text: 'Pass but offer congratulations',
          description: 'You have conflict of interest concerns. But wish him well.',
          outcome: {
            description: 'Mike is disappointed but understands. "Professional stuff, I get it." The relationship survives. But something\'s different now.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'brother_mike', change: 5, memory: 'Still didn\'t invest but at least was gracious' },
            },
          },
        },
        {
          text: 'Demand better terms for yourself',
          description: 'If you\'re going to invest, you want preferred shares and a board observer seat.',
          outcome: {
            description: 'Mike\'s excitement turns to anger. "You can\'t just be happy for me? It always has to be a deal with you." He hangs up. The term sheet closes without you.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'brother_mike', change: -30, trustChange: -25, memory: 'Tried to shark my Series A' },
              reputation: -5,
            },
          },
        },
      ],
    };
  },

  // The Promotion Race - Sarah vs Hunter for VP
  (npcs, currentWeek) => {
    const sarah = npcs.find(n => n.id === 'sarah');
    const hunter = npcs.find(n => n.id === 'hunter');
    const chad = npcs.find(n => n.id === 'chad');
    if (!sarah || !hunter || !chad) return null;
    if (sarah.relationship <= 45 || hunter.relationship <= 45) return null;

    return {
      id: 'promotion_race',
      title: 'The Promotion Race',
      description: `Chad pulls you into his office and shuts the door. "We have one VP slot open. Sarah and Hunter are both in the running. I trust your judgment—who should get it?" This is a career-defining recommendation. Both of them will find out what you said.`,
      involvedNpcs: ['sarah', 'hunter', 'chad'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Recommend Sarah',
          description: 'She has the analytical chops and deserves recognition.',
          outcome: {
            description: 'Sarah gets the promotion. She tears up in your office. Hunter finds out you recommended her and goes cold.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'sarah', change: 30, trustChange: 20, memory: 'Championed me for VP' },
              npcRelationshipUpdate2: { npcId: 'hunter', change: -25, trustChange: -15, memory: 'Passed me over for Sarah' },
              reputation: 5,
            },
          },
        },
        {
          text: 'Recommend Hunter',
          description: 'He has the client relationships and deal origination skills.',
          outcome: {
            description: 'Hunter gets VP. He buys you a bottle of Macallan 25. Sarah quietly updates her LinkedIn.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'hunter', change: 30, trustChange: 20, memory: 'Got me the VP title' },
              npcRelationshipUpdate2: { npcId: 'sarah', change: -25, trustChange: -15, memory: 'Recommended Hunter over me' },
              reputation: 5,
            },
          },
        },
        {
          text: 'Suggest both deserve it',
          description: 'Tell Chad to create two VP slots.',
          outcome: {
            description: 'Chad rolls his eyes. "This isn\'t a participation trophy factory." He promotes Hunter anyway. Sarah blames you for being wishy-washy.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'sarah', change: -15, memory: 'Couldn\'t even advocate for me directly' },
              npcRelationshipUpdate2: { npcId: 'hunter', change: 10, memory: 'At least didn\'t block my promotion' },
              reputation: -5,
            },
          },
        },
        {
          text: 'Suggest yourself instead',
          description: 'Why not you? Seize the moment.',
          outcome: {
            description: 'Chad laughs. "I like the ambition." He promotes you instead. Both Sarah and Hunter are furious. You\'ve made two enemies and one very surprised HR department.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'sarah', change: -20, memory: 'Stole the promotion from under us' },
              npcRelationshipUpdate2: { npcId: 'hunter', change: -20, memory: 'Backstabbed us both for the VP slot' },
              reputation: 15,
              score: 500,
              stress: 10,
            },
          },
        },
      ],
    };
  },

  // Dad's Retirement Crisis
  (npcs, currentWeek) => {
    const dad = npcs.find(n => n.id === 'dad');
    if (!dad) return null;
    if (dad.relationship <= 30) return null;

    return {
      id: 'dad_retirement_crisis',
      title: 'Dad\'s Retirement Crisis',
      description: `Dad calls, voice shaking. "Remember those stocks you told me to look at? I put... I put most of my retirement in them. They're down 60%." He followed your offhand advice to the letter and bet the farm. Mom doesn't know yet.`,
      involvedNpcs: ['dad'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Bail him out ($50K)',
          description: 'Write a check. Cover the losses. It\'s your fault.',
          outcome: {
            description: 'You wire $50K to Dad\'s account. He cries on the phone. "I\'ll pay you back." You both know he won\'t. But family is family.',
            statChanges: {
              cash: -50000,
              stress: -10,
              ethics: 10,
              npcRelationshipUpdate: { npcId: 'dad', change: 35, trustChange: 25, memory: 'Bailed me out when I lost everything' },
            },
          },
        },
        {
          text: 'Help restructure his portfolio',
          description: 'Use your skills to rebuild his retirement savings properly.',
          outcome: {
            description: 'You spend a weekend going through his accounts. You move him into index funds and bonds. It\'ll take years to recover, but there\'s a plan now.',
            statChanges: {
              energy: -20,
              stress: 5,
              npcRelationshipUpdate: { npcId: 'dad', change: 20, trustChange: 15, memory: 'Helped me rebuild after the crash' },
            },
          },
        },
        {
          text: 'Tough love',
          description: 'You never told him to bet everything. He made his own choices.',
          outcome: {
            description: '"I never said go all in, Dad." The silence on the line is deafening. "You sound just like those Wall Street guys on TV." He hangs up.',
            statChanges: {
              stress: 15,
              npcRelationshipUpdate: { npcId: 'dad', change: -30, trustChange: -20, memory: 'Blamed me for my own losses then walked away' },
            },
          },
        },
        {
          text: 'Apologize and distance yourself',
          description: 'Say sorry but explain you can\'t give family financial advice anymore.',
          outcome: {
            description: 'Dad understands intellectually, but emotionally he\'s devastated. The calls become less frequent. The Sunday dinners stop.',
            statChanges: {
              stress: 10,
              npcRelationshipUpdate: { npcId: 'dad', change: -15, trustChange: -10, memory: 'Apologized but then disappeared from our lives' },
            },
          },
        },
      ],
    };
  },

  // The Leak Investigation
  (npcs, currentWeek) => {
    const chad = npcs.find(n => n.id === 'chad');
    const hunter = npcs.find(n => n.id === 'hunter');
    const sarah = npcs.find(n => n.id === 'sarah');
    const smith = npcs.find(n => n.id === 'agent_smith');
    if (!chad || !hunter || !sarah || !smith) return null;
    if (chad.relationship <= 40) return null;

    return {
      id: 'leak_investigation',
      title: 'The Leak Investigation',
      description: `Confidential details about your fund's biggest pending acquisition just appeared in the Wall Street Journal. Chad is apoplectic. "Someone in this office talked to a reporter. I want to know who." He suspects Hunter or Sarah. Agent Smith's office has already called.`,
      involvedNpcs: ['chad', 'hunter', 'sarah', 'agent_smith'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 1,
      choices: [
        {
          text: 'Defend Hunter',
          description: 'Vouch for Hunter\'s loyalty. Point out he has the most to lose.',
          outcome: {
            description: 'You go to bat for Hunter. Chad redirects the investigation. Hunter is grateful—but if it was him, you\'ve just covered for a leaker.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'hunter', change: 25, trustChange: 15, memory: 'Defended me during the leak investigation' },
              npcRelationshipUpdate2: { npcId: 'sarah', change: -10, memory: 'Defended Hunter but not me' },
              auditRisk: 10,
            },
          },
        },
        {
          text: 'Deflect suspicion to Sarah',
          description: 'Mention that Sarah had access to the documents and has been stressed lately.',
          outcome: {
            description: 'Chad turns his attention to Sarah. She\'s put on administrative leave pending investigation. If she\'s innocent, you\'ve just destroyed a colleague.',
            statChanges: {
              ethics: -20,
              npcRelationshipUpdate: { npcId: 'sarah', change: -40, trustChange: -30, memory: 'Threw me under the bus in the leak investigation' },
              npcRelationshipUpdate2: { npcId: 'chad', change: 15, memory: 'Helped identify the leak suspect' },
            },
          },
        },
        {
          text: 'Conduct your own investigation',
          description: 'Go through email logs, check who accessed the data room, find the real source.',
          outcome: {
            description: 'You spend three sleepless nights digging. You find that the leak came from an outside advisor, not anyone internal. Chad is impressed. Agent Smith takes note of your thoroughness.',
            statChanges: {
              energy: -25,
              stress: 15,
              reputation: 15,
              npcRelationshipUpdate: { npcId: 'chad', change: 20, trustChange: 15, memory: 'Found the real leaker when everyone else was pointing fingers' },
              npcRelationshipUpdate2: { npcId: 'agent_smith', change: 10, memory: 'Conducted a credible internal investigation' },
              auditRisk: -10,
            },
          },
        },
        {
          text: 'Stay silent',
          description: 'Don\'t point fingers. Let the process play out.',
          outcome: {
            description: 'Chad takes your silence as indifference. "I expected more from you." The investigation drags on for weeks, poisoning the office atmosphere.',
            statChanges: {
              stress: 20,
              npcRelationshipUpdate: { npcId: 'chad', change: -15, memory: 'Didn\'t help when the firm was under threat' },
              reputation: -5,
            },
          },
        },
      ],
    };
  },

  // Hans's Ultimatum
  (npcs, currentWeek) => {
    const hans = npcs.find(n => n.id === 'hans');
    if (!hans) return null;
    if (hans.relationship <= 40) return null;

    return {
      id: 'hans_ultimatum',
      title: 'Hans\'s Ultimatum',
      description: `Hans Gruber requests an emergency video call. His face fills the screen, stone-cold. "I've reviewed the fund's performance attribution. Three of your portfolio companies are dragging returns below our hurdle rate. Either you remove the underperformers from the portfolio, or we pull our $200M commitment. You have two weeks."`,
      involvedNpcs: ['hans'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Comply and fire underperformers',
          description: 'Do what Hans says. Cut the dead weight from the portfolio.',
          outcome: {
            description: 'You execute a brutal restructuring. Three management teams are let go. Hans is satisfied. Your reputation as a ruthless operator grows.',
            statChanges: {
              ethics: -15,
              stress: 10,
              reputation: 10,
              npcRelationshipUpdate: { npcId: 'hans', change: 25, trustChange: 20, memory: 'Made the tough calls when I demanded it' },
              factionReputation: { LIMITED_PARTNERS: 10, MANAGING_DIRECTORS: 5, ANALYSTS: -5, REGULATORS: 0, RIVALS: 0 },
            },
          },
        },
        {
          text: 'Push back diplomatically',
          description: 'Present a turnaround plan. Ask for more time.',
          outcome: {
            description: 'You fly to Zurich and present a 90-day turnaround plan with milestones. Hans is skeptical but agrees to wait. "Ninety days. Not ninety-one."',
            statChanges: {
              energy: -20,
              cash: -5000,
              npcRelationshipUpdate: { npcId: 'hans', change: 5, memory: 'Pushed back with a plan, not just words' },
            },
          },
        },
        {
          text: 'Find a compromise',
          description: 'Replace management at the weakest company, keep the other two.',
          outcome: {
            description: 'You sacrifice one portfolio company CEO as a show of action. Hans accepts the middle ground. "Progress, not perfection. For now."',
            statChanges: {
              ethics: -5,
              npcRelationshipUpdate: { npcId: 'hans', change: 15, trustChange: 10, memory: 'Found a reasonable middle ground' },
              reputation: 5,
            },
          },
        },
        {
          text: 'Call his bluff',
          description: 'Tell Hans you won\'t be dictated to. If he wants out, show him the door.',
          outcome: {
            description: 'Hans goes quiet. "Nobody has ever spoken to me like that." He pulls $200M. Other LPs hear about it and start asking questions. The fundraise just got a lot harder.',
            statChanges: {
              stress: 30,
              reputation: -15,
              npcRelationshipUpdate: { npcId: 'hans', change: -40, trustChange: -30, memory: 'Called my bluff and lost' },
              factionReputation: { LIMITED_PARTNERS: -20, MANAGING_DIRECTORS: -10, ANALYSTS: 0, REGULATORS: 0, RIVALS: 5 },
            },
          },
        },
      ],
    };
  },

  // The Office Romance Scandal
  (npcs, currentWeek) => {
    const hunter = npcs.find(n => n.id === 'hunter');
    if (!hunter) return null;

    return {
      id: 'office_romance_scandal',
      title: 'The Office Romance Scandal',
      description: `The office is buzzing. Hunter was caught in the conference room after hours with a junior analyst. HR has photos from the security cameras. Hunter corners you in the hallway. "It's not what it looks like. Okay, it's exactly what it looks like. But I need you to keep this quiet. Please."`,
      involvedNpcs: ['hunter'],
      playerMustChooseSide: true,
      urgency: 'MEDIUM',
      expiresWeek: currentWeek + 2,
      choices: [
        {
          text: 'Cover for Hunter',
          description: 'Tell HR you saw nothing. Help Hunter manage the situation.',
          outcome: {
            description: 'You corroborate Hunter\'s story about "late-night deal prep." HR drops the investigation. Hunter owes you—big time. But lying to HR has its own risks.',
            statChanges: {
              ethics: -15,
              auditRisk: 10,
              npcRelationshipUpdate: { npcId: 'hunter', change: 30, trustChange: 25, memory: 'Covered for me when I needed it most' },
            },
          },
        },
        {
          text: 'Report to HR',
          description: 'Follow protocol. This is a clear policy violation.',
          outcome: {
            description: 'You report what you know. Hunter is put on probation. The analyst is transferred. Hunter won\'t even look at you in the hallway anymore.',
            statChanges: {
              ethics: 15,
              reputation: 5,
              npcRelationshipUpdate: { npcId: 'hunter', change: -35, trustChange: -25, memory: 'Reported me to HR like a boy scout' },
            },
          },
        },
        {
          text: 'Use it as leverage',
          description: 'You won\'t say anything... but Hunter will owe you a favor.',
          outcome: {
            description: 'Hunter\'s eyes narrow. "You\'re playing a dangerous game." But he agrees. You now have a chit to cash in when the time is right.',
            statChanges: {
              ethics: -25,
              npcRelationshipUpdate: { npcId: 'hunter', change: -10, trustChange: -15, memory: 'Blackmailed me over the analyst situation' },
              setsFlags: ['HUNTER_OWES_FAVOR'],
            },
          },
        },
        {
          text: 'Stay out of it',
          description: 'Not your problem. You didn\'t see anything.',
          outcome: {
            description: 'HR finds out anyway through other means. Hunter is reprimanded. He assumes you stayed quiet and gives you a grateful nod. The analyst quietly resigns.',
            statChanges: {
              npcRelationshipUpdate: { npcId: 'hunter', change: 5, memory: 'Stayed out of the drama' },
              stress: 5,
            },
          },
        },
      ],
    };
  },

  // Agent Smith's Audit
  (npcs, currentWeek) => {
    const smith = npcs.find(n => n.id === 'agent_smith');
    if (!smith) return null;

    return {
      id: 'smith_audit',
      title: 'Agent Smith\'s Audit',
      description: `Your inbox pings at 6:47 AM. It's an official SEC notice: a surprise examination of your fund's compliance program. Agent Smith is personally overseeing it. He's requesting documents on every deal you've touched in the last 18 months. The walls feel like they're closing in.`,
      involvedNpcs: ['agent_smith'],
      playerMustChooseSide: true,
      urgency: 'HIGH',
      expiresWeek: currentWeek + 1,
      choices: [
        {
          text: 'Cooperate fully',
          description: 'Open the books. Give them everything they ask for and more.',
          outcome: {
            description: 'You spend a week pulling documents and answering questions. Smith seems almost disappointed at how clean things look. "Thorough records. Unusual for this industry."',
            statChanges: {
              energy: -25,
              stress: 10,
              auditRisk: -25,
              ethics: 15,
              npcRelationshipUpdate: { npcId: 'agent_smith', change: 20, trustChange: 20, memory: 'Full cooperation during the audit' },
            },
          },
        },
        {
          text: 'Hire top lawyers',
          description: 'Bring in the best securities defense attorneys. Respond to the letter of the law, nothing more.',
          outcome: {
            description: 'Your lawyers slow-walk every request. Smith is annoyed but can\'t force anything beyond the subpoena scope. It costs a fortune, but nothing incriminating surfaces.',
            statChanges: {
              cash: -30000,
              stress: 20,
              auditRisk: -10,
              npcRelationshipUpdate: { npcId: 'agent_smith', change: -15, memory: 'Lawyered up hard during the audit' },
            },
          },
        },
        {
          text: 'Destroy potentially problematic documents',
          description: 'There are some emails that could be misinterpreted. Better to be safe.',
          outcome: {
            description: 'You delete emails and shred memos late at night. If they find out, it\'s obstruction. But if they don\'t, you\'re clean. Your hands won\'t stop shaking.',
            statChanges: {
              ethics: -40,
              auditRisk: -5,
              stress: 30,
              setsFlags: ['DESTROYED_EVIDENCE'],
            },
          },
        },
        {
          text: 'Preemptively disclose minor issues',
          description: 'Get ahead of it. Admit to small compliance gaps before they find bigger ones.',
          outcome: {
            description: 'You voluntarily disclose a few minor reporting errors. Smith raises an eyebrow. "Interesting strategy." The audit wraps up quickly. You get a fine, but nothing career-ending.',
            statChanges: {
              cash: -15000,
              ethics: 10,
              auditRisk: -20,
              stress: 5,
              npcRelationshipUpdate: { npcId: 'agent_smith', change: 15, trustChange: 10, memory: 'Self-reported issues before we found them' },
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
