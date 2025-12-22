# Fund Wars RPG Redesign: Event-Driven Narrative Architecture

## Executive Summary

This document proposes a complete redesign of Fund Wars from a management sim with scattered events into a **narrative-driven RPG** where **every action drives a story forward**. The core insight: players don't want to manage spreadsheets—they want to make consequential decisions that shape their character's journey.

---

## Current Problems

### 1. Events Feel Random & Disconnected
- Scenarios, company events, and NPC dramas exist separately
- No narrative thread connects them
- Player has no sense of "what's next" or "why this matters"

### 2. Action Points Are Mechanical, Not Dramatic
- 2 AP/week feels like a resource management puzzle
- Doesn't create the tension of "I can only do one thing, what matters most?"
- Actions don't advance a story—they tick boxes

### 3. Progression Lacks Emotional Stakes
- Levels, reputation, cash go up/down without feeling earned
- No clear "chapter" structure or milestones
- Victory/defeat conditions feel arbitrary

### 4. NPCs Are Static Despite Having Memories
- Sarah, Chad, Hunter have backstories but don't grow
- Relationships track numbers but don't unlock story arcs
- No sense that NPCs have their own lives progressing

### 5. No Cause & Effect Chain
- Choosing to back Hunter in one event doesn't affect future Hunter events
- No "your choice in Week 3 led to this crisis in Week 15"
- World doesn't remember and adapt

---

## The New Vision: Every Week Tells a Story

### Core Principle: **The Week as an Episode**

Each game week is structured like a TV episode:
1. **Cold Open**: A dramatic hook (event, crisis, opportunity)
2. **Main Conflict**: 1-2 meaningful choices that define the episode
3. **Resolution**: Consequences play out with clear cause/effect
4. **Next Time On...**: Teaser of what's building

### New Core Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    THE WEEKLY EPISODE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PHASE 1: THE MORNING BRIEFING                       │   │
│  │  - Read your priority event (mandatory)             │   │
│  │  - See 2-3 optional opportunities                   │   │
│  │  - Review active storylines and deadlines           │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PHASE 2: THE DECISION                               │   │
│  │  - Handle PRIORITY event (must choose)              │   │
│  │  - Pick ONE optional action (or skip)               │   │
│  │  - Each choice has clear stakes & consequences      │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PHASE 3: THE FALLOUT                                │   │
│  │  - See immediate consequences                       │   │
│  │  - NPCs react with dialogue                         │   │
│  │  - New events queue based on your choice            │   │
│  │  - World state updates                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PHASE 4: END WEEK                                   │   │
│  │  - Portfolio auto-updates                           │   │
│  │  - Salary deposited, lifestyle costs                │   │
│  │  - Preview next week's priority event               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Event System Architecture

### Event Categories

1. **Priority Events** (Must handle each week)
   - Story-driven: Part of main narrative arc
   - Crisis: Urgent situations with deadlines
   - Opportunity: Time-limited chances

2. **Optional Events** (2-3 available per week)
   - Side Quests: NPC relationship moments
   - Business Actions: Portfolio management
   - Personal Life: Family, health, lifestyle

3. **Background Events** (Passive, news-ticker style)
   - Market movements
   - Rival activities
   - Industry news

### Event Structure

```typescript
interface StoryEvent {
  id: string;
  type: 'PRIORITY' | 'OPTIONAL' | 'BACKGROUND';
  category: 'DEAL' | 'NPC' | 'CRISIS' | 'OPPORTUNITY' | 'PERSONAL';
  
  // Narrative elements
  title: string;
  hook: string;           // Opening dramatic line
  description: string;    // Full situation
  context?: string;       // Why this matters now
  
  // Source and stakes
  sourceNpcId?: string;   // Who's bringing this to you
  involvedNpcs: string[];
  involvedCompanies: number[];
  stakes: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Choices
  choices: EventChoice[];
  
  // Gating
  requirements?: EventRequirements;
  
  // Timing
  expiresInWeeks?: number;
  triggerChain?: string;  // ID of story arc this belongs to
  
  // Consequences
  completionEffects: ConsequenceChain;
}

interface EventChoice {
  id: string;
  label: string;
  description: string;
  
  // Personality alignment
  alignment?: 'RUTHLESS' | 'DIPLOMATIC' | 'CAUTIOUS' | 'BOLD' | 'ETHICAL';
  
  // Requirements to unlock this choice
  requires?: {
    stat?: { name: string; min?: number; max?: number };
    flag?: string;
    npcRelationship?: { npcId: string; min?: number };
    skill?: { name: string; min?: number };
  };
  
  // Risk mechanics
  successChance?: number;  // 0-100, if undefined = guaranteed
  skillCheck?: {
    skill: string;
    threshold: number;
    bonusOnSuccess: Partial<Consequences>;
    penaltyOnFailure: Partial<Consequences>;
  };
  
  // What happens
  consequences: Consequences;
  
  // What this choice leads to
  triggersEvents?: string[];  // Event IDs to add to queue
  advancesArc?: { arcId: string; stage: number };
  
  // Dialogue
  playerLine?: string;        // What you say choosing this
  immediateResponse?: string; // NPC's immediate reaction
  epilogue?: string;          // Narrative wrap-up text
}

interface Consequences {
  // Stats
  stats?: Partial<StatChanges>;
  
  // Relationships
  npcEffects?: Array<{
    npcId: string;
    relationship?: number;
    trust?: number;
    mood?: number;
    memory: string;
    revealsSecret?: string;
    unlocksArc?: string;
  }>;
  
  // World state
  setsFlags?: string[];
  clearsFlags?: string[];
  
  // Future events
  queuesEvent?: { eventId: string; delayWeeks: number };
  blocksEvent?: string[];
  
  // Portfolio
  companyEffects?: Array<{
    companyId: number;
    changes: Partial<PortfolioCompany>;
  }>;
  
  // UI/UX
  notification?: string;
  logMessage?: string;
}
```

---

## Story Arc System

### What's a Story Arc?
A **Story Arc** is a multi-week narrative that progresses based on player choices. Think of it like a TV season subplot that runs alongside the main game.

### Arc Structure

```typescript
interface StoryArc {
  id: string;
  title: string;
  description: string;  // Hidden from player initially
  
  // Arc metadata
  category: 'MAIN' | 'NPC' | 'COMPANY' | 'CAREER' | 'PERSONAL';
  priority: number;     // Higher = more likely to spawn events
  
  // Arc stages
  stages: ArcStage[];
  currentStage: number;
  
  // Requirements to unlock arc
  unlockConditions?: {
    minWeek?: number;
    requiredFlags?: string[];
    requiredLevel?: PlayerLevel;
    npcRelationship?: { npcId: string; min: number };
    completedArcs?: string[];
  };
  
  // Arc state
  state: 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  
  // Outcomes
  possibleEndings: ArcEnding[];
}

interface ArcStage {
  stage: number;
  title: string;
  description: string;
  
  // Events that can fire at this stage
  events: string[];  // Event IDs
  
  // How to advance to next stage
  advanceConditions: {
    requiredEvents?: string[];
    requiredFlags?: string[];
    autoAdvanceWeeks?: number;  // Auto-progress after X weeks
  };
  
  // What happens if time runs out
  timeoutConsequences?: Consequences;
}

interface ArcEnding {
  id: string;
  title: string;
  type: 'VICTORY' | 'DEFEAT' | 'NEUTRAL' | 'PYRRHIC';
  
  conditions: {
    requiredFlags: string[];
    requiredChoices?: string[];  // Specific choices made
  };
  
  // Final consequences
  rewards?: Consequences;
  penalties?: Consequences;
  epilogue: string;
  
  // What this unlocks
  unlocksArcs?: string[];
  achievementId?: string;
}
```

---

## Example Story Arcs

### Arc 1: "The Hunter Problem" (NPC Arc)

```typescript
const hunterArc: StoryArc = {
  id: 'arc_hunter_rivalry',
  title: 'The Hunter Problem',
  description: 'Hunter Sterling is either your greatest rival or your closest ally.',
  category: 'NPC',
  priority: 8,
  
  unlockConditions: {
    minWeek: 4,
  },
  
  stages: [
    {
      stage: 1,
      title: 'First Blood',
      description: 'Hunter makes his first move against you.',
      events: ['hunter_credit_steal', 'hunter_client_poach'],
      advanceConditions: {
        requiredEvents: ['hunter_credit_steal', 'hunter_client_poach'],
      },
    },
    {
      stage: 2,
      title: 'Escalation',
      description: 'The rivalry deepens.',
      events: ['hunter_deal_sabotage', 'hunter_secret_offer'],
      advanceConditions: {
        autoAdvanceWeeks: 8,
      },
    },
    {
      stage: 3,
      title: 'The Reckoning',
      description: 'One of you will come out on top.',
      events: ['hunter_final_confrontation'],
      advanceConditions: {
        requiredEvents: ['hunter_final_confrontation'],
      },
    },
  ],
  
  possibleEndings: [
    {
      id: 'hunter_destroyed',
      title: 'The Fall of Hunter',
      type: 'VICTORY',
      conditions: { requiredFlags: ['HUNTER_EXPOSED', 'HUNTER_FIRED'] },
      rewards: { stats: { reputation: 25, score: 1000 } },
      epilogue: 'Hunter cleans out his desk. As he passes you, he whispers: "This isn\'t over." But it is.',
    },
    {
      id: 'hunter_alliance',
      title: 'Strange Bedfellows',
      type: 'NEUTRAL',
      conditions: { requiredFlags: ['HUNTER_DEAL_ACCEPTED'] },
      rewards: { stats: { financialEngineering: 10 } },
      epilogue: 'You and Hunter now control the deal flow. The partners are uneasy, but they can\'t argue with results.',
    },
    {
      id: 'hunter_wins',
      title: 'The Better Man',
      type: 'DEFEAT',
      conditions: { requiredFlags: ['PLAYER_DISCREDITED'] },
      penalties: { stats: { reputation: -30 } },
      epilogue: 'Hunter smiles as you\'re called into HR. You played his game and lost.',
    },
  ],
  
  currentStage: 0,
  state: 'LOCKED',
};
```

### Arc 2: "Deal of a Lifetime" (Main Arc)

```typescript
const megaDealArc: StoryArc = {
  id: 'arc_mega_deal',
  title: 'Deal of a Lifetime',
  description: 'A once-in-a-decade opportunity that could make or break your career.',
  category: 'MAIN',
  priority: 10,
  
  unlockConditions: {
    minWeek: 12,
    requiredLevel: PlayerLevel.VICE_PRESIDENT,
    npcRelationship: { npcId: 'chad', min: 60 },
  },
  
  stages: [
    {
      stage: 1,
      title: 'The Whisper',
      description: 'Rumors of a massive deal circulate.',
      events: ['mega_deal_rumor', 'mega_deal_tip'],
      advanceConditions: {
        requiredEvents: ['mega_deal_tip'],
      },
    },
    {
      stage: 2,
      title: 'The Scramble',
      description: 'Multiple parties race to position.',
      events: ['mega_deal_dd', 'mega_deal_competitor', 'mega_deal_leak'],
      advanceConditions: {
        autoAdvanceWeeks: 4,
      },
    },
    {
      stage: 3,
      title: 'The Auction',
      description: 'Final bids are due.',
      events: ['mega_deal_final_bid', 'mega_deal_sabotage'],
      advanceConditions: {
        requiredEvents: ['mega_deal_final_bid'],
      },
    },
    {
      stage: 4,
      title: 'The Aftermath',
      description: 'Win or lose, the consequences ripple.',
      events: ['mega_deal_win', 'mega_deal_lose', 'mega_deal_controversy'],
      advanceConditions: {
        requiredEvents: ['mega_deal_win', 'mega_deal_lose'],
      },
    },
  ],
  
  possibleEndings: [
    {
      id: 'mega_deal_hero',
      title: 'The Dealmaker',
      type: 'VICTORY',
      conditions: { requiredFlags: ['MEGA_DEAL_WON', 'MEGA_DEAL_CLEAN'] },
      rewards: { 
        stats: { reputation: 50, cash: 500000, score: 5000 },
      },
      epilogue: 'The champagne flows. Chad actually smiles. You\'ve just made Partner in everything but title.',
      achievementId: 'deal_of_century',
    },
    {
      id: 'mega_deal_pyrrhic',
      title: 'At What Cost?',
      type: 'PYRRHIC',
      conditions: { requiredFlags: ['MEGA_DEAL_WON', 'MEGA_DEAL_DIRTY'] },
      rewards: { stats: { cash: 500000 } },
      penalties: { stats: { ethics: -40, auditRisk: 30 } },
      epilogue: 'You won. But the SEC has questions. And so does your mirror.',
    },
  ],
  
  currentStage: 0,
  state: 'LOCKED',
};
```

---

## Sample Priority Events

### Week 1: The Tutorial Event

```typescript
const tutorialEvent: StoryEvent = {
  id: 'evt_first_day',
  type: 'PRIORITY',
  category: 'DEAL',
  
  title: 'The Cardboard Empire',
  hook: 'Chad drops a CIM on your desk. "Don\'t waste my time if it\'s garbage."',
  description: `
    It's your first real deal. PackFancy Inc. - a mid-market manufacturer of 
    artisanal cardboard boxes. The numbers look... flat. Revenue's going nowhere.
    
    But you notice something on page 40. A patent reference buried in the footnotes.
    Patent #8829. Hydrophobic coating technology.
    
    This might be more than just a box company.
  `,
  context: 'Your first impression matters. How you handle this will set your trajectory.',
  
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
        stats: { stress: 5, analystRating: 10 },
        npcEffects: [
          { npcId: 'sarah', relationship: 5, memory: 'Impressed by thorough research' },
        ],
        setsFlags: ['FOUND_PATENT'],
        notification: 'You found something. The patent is real—and potentially game-changing.',
      },
      triggersEvents: ['evt_patent_discovery'],
      playerLine: 'Something doesn\'t add up. I need to look closer.',
      epilogue: 'At 2am, you find it. Patent #8829 is for a revolutionary hydrophobic coating. This "box company" might be sitting on a gold mine.',
    },
    {
      id: 'play_safe',
      label: 'Recommend Pass',
      description: 'The numbers don\'t work. Tell Chad it\'s not worth pursuing.',
      alignment: 'CAUTIOUS',
      consequences: {
        stats: { stress: -5, reputation: -5 },
        npcEffects: [
          { npcId: 'chad', relationship: -10, memory: 'Dismissed a deal without digging' },
        ],
        notification: 'Chad grunts. "I didn\'t ask for your opinion. I asked for analysis."',
      },
      playerLine: 'The fundamentals don\'t support an investment.',
      epilogue: 'Chad gives it to Hunter instead. You hear the champagne pop two weeks later. They found the patent.',
    },
    {
      id: 'aggressive_bid',
      label: 'Go All In',
      description: 'Trust your gut. Push for an aggressive IOI based on the growth story.',
      alignment: 'BOLD',
      skillCheck: {
        skill: 'financialEngineering',
        threshold: 30,
        bonusOnSuccess: {
          stats: { reputation: 15, cash: 5000 },
          notification: 'Your aggressive model impressed the partners. Bold move.',
        },
        penaltyOnFailure: {
          stats: { reputation: -10 },
          notification: 'The model fell apart under scrutiny. Chad is not happy.',
        },
      },
      consequences: {
        stats: { stress: 10 },
        setsFlags: ['AGGRESSIVE_APPROACH'],
      },
      playerLine: 'Sometimes you have to trust your instincts.',
    },
  ],
  
  expiresInWeeks: 1,
  triggerChain: 'arc_first_deal',
};
```

### Crisis Event: The CFO Betrayal

```typescript
const cfoBetrayalEvent: StoryEvent = {
  id: 'evt_cfo_betrayal',
  type: 'PRIORITY',
  category: 'CRISIS',
  
  title: 'The CFO\'s Gambit',
  hook: 'Your portfolio company\'s CFO just resigned. He\'s going to your biggest competitor.',
  description: `
    Sarah bursts into your office. "We have a problem."
    
    Marcus Chen, the CFO you personally recruited for TechSync, just handed in 
    his notice. He's joining Apex Capital—your biggest rival. 
    
    He knows everything. Product roadmap. Customer pipeline. Your playbook.
    
    The board meeting is in 3 hours. What's your move?
  `,
  
  sourceNpcId: 'sarah',
  involvedNpcs: ['sarah', 'hunter'],
  involvedCompanies: [2],
  stakes: 'CRITICAL',
  
  choices: [
    {
      id: 'counteroffer',
      label: 'Make a Counter-Offer',
      description: 'Double his compensation. Give him equity. Keep him at any cost.',
      alignment: 'DIPLOMATIC',
      requires: {
        stat: { name: 'cash', min: 100000 },
      },
      consequences: {
        stats: { cash: -100000, stress: 10 },
        companyEffects: [{
          companyId: 2,
          changes: { ceoPerformance: 80 },
        }],
        notification: 'Marcus stays. But everyone knows he\'s a flight risk now.',
        queuesEvent: { eventId: 'evt_marcus_loyalty_test', delayWeeks: 8 },
      },
      playerLine: 'Name your price, Marcus. Everyone has one.',
      immediateResponse: 'He pauses. "This isn\'t about money. But... let\'s talk."',
    },
    {
      id: 'enforce_noncompete',
      label: 'Enforce the Non-Compete',
      description: 'Lawyer up. Make an example of him.',
      alignment: 'RUTHLESS',
      consequences: {
        stats: { cash: -50000, reputation: -10, ethics: -15 },
        setsFlags: ['SUED_MARCUS'],
        npcEffects: [
          { npcId: 'sarah', relationship: -5, memory: 'Went scorched earth on Marcus' },
        ],
        notification: 'The lawsuit is filed. It\'ll drag for years, but Apex is nervous.',
      },
      playerLine: 'He signed a contract. I intend to hold him to it.',
      epilogue: 'The legal battle begins. Marcus posts on LinkedIn about "toxic PE culture." This is going to get ugly.',
    },
    {
      id: 'accelerated_transition',
      label: 'Accelerate the Transition',
      description: 'Let him go gracefully. Extract every piece of knowledge before he leaves.',
      alignment: 'DIPLOMATIC',
      consequences: {
        stats: { reputation: 10, stress: 5 },
        companyEffects: [{
          companyId: 2,
          changes: { ceoPerformance: 60 },
        }],
        npcEffects: [
          { npcId: 'sarah', relationship: 10, memory: 'Handled CFO exit with class' },
        ],
        setsFlags: ['GRACEFUL_DEPARTURE'],
      },
      triggersEvents: ['evt_cfo_search'],
      playerLine: 'Let\'s make this professional. Two weeks of proper handover.',
      epilogue: 'Marcus is surprised by your professionalism. He agrees to comprehensive documentation. The search for his replacement begins.',
    },
    {
      id: 'promote_from_within',
      label: 'Promote the Controller',
      description: 'Jennifer from accounting has been ready for years. Give her the shot.',
      alignment: 'BOLD',
      skillCheck: {
        skill: 'reputation',
        threshold: 50,
        bonusOnSuccess: {
          npcEffects: [{
            npcId: 'jennifer',
            relationship: 30,
            memory: 'You believed in me when no one else did',
            unlocksArc: 'arc_jennifer_loyalty',
          }],
          notification: 'Jennifer rises to the occasion. The team rallies around her.',
        },
        penaltyOnFailure: {
          stats: { reputation: -15 },
          notification: 'Jennifer struggles with the pressure. The board questions your judgment.',
        },
      },
      consequences: {
        companyEffects: [{
          companyId: 2,
          changes: { ceoPerformance: 70 },
        }],
      },
      playerLine: 'Jennifer, you\'re the new CFO. Effective immediately.',
    },
  ],
  
  expiresInWeeks: 0,  // Must resolve this week
  triggerChain: 'arc_techsync_crisis',
};
```

---

## NPC Evolution System

### NPCs as Dynamic Characters

Each NPC has:
- **Relationship Track**: How much they trust you
- **Story Arc**: Their personal journey
- **Secrets**: Information they can reveal at high trust
- **Agenda**: What they want (may conflict with yours)
- **Evolution Points**: Key moments that change them

```typescript
interface EnhancedNPC extends NPC {
  // Story elements
  personalArc?: StoryArc;
  secrets: NPCSecret[];
  agenda: NPCAgenda;
  
  // Evolution tracking
  evolutionStage: number;  // 0-3: Stranger → Ally/Enemy
  evolutionPoints: string[];  // Key decision IDs that shaped this
  
  // Dialogue state
  availableConversations: string[];
  unlockedTopics: string[];
  
  // Dynamic behavior
  currentMood: 'FRIENDLY' | 'NEUTRAL' | 'COLD' | 'HOSTILE';
  willingness: number;  // 0-100: How willing to help/engage
}

interface NPCSecret {
  id: string;
  title: string;
  content: string;
  requiredTrust: number;  // Minimum trust to reveal
  revealed: boolean;
  impactOnReveal: Consequences;
  relatedEventId?: string;  // Unlocks this event when revealed
}

interface NPCAgenda {
  primary: string;   // Their main goal
  secondary: string; // What else they want
  fears: string;     // What they're avoiding
  
  // How aligned are they with you?
  alignment: number;  // -100 to 100
  
  // What would make them betray you?
  betrayalThreshold?: {
    condition: string;
    consequenceEventId: string;
  };
}
```

### Example: Sarah's Evolution

```typescript
const sarahEvolution = {
  stages: [
    {
      stage: 0,
      title: 'The Analyst',
      description: 'Sarah is a hardworking analyst eager to prove herself.',
      unlocks: ['Diligence help', 'Model reviews'],
      traits: ['eager', 'competent', 'by-the-book'],
    },
    {
      stage: 1,
      title: 'The Ally',
      description: 'Sarah trusts you and will go the extra mile.',
      unlocks: ['After-hours intel', 'Off-the-record opinions', 'Hunter gossip'],
      triggers: [
        { eventId: 'evt_sarah_credit', choiceId: 'back_sarah' },
        { trustThreshold: 60 },
      ],
      traits: ['loyal', 'insightful', 'slightly rebellious'],
    },
    {
      stage: 2,
      title: 'The Partner',
      description: 'Sarah is more than a colleague. She sees you as an equal.',
      unlocks: ['Strategic advice', 'LP connections', 'Career guidance'],
      triggers: [
        { eventId: 'evt_sarah_promotion', outcome: 'supported' },
        { trustThreshold: 80 },
        { requiredFlags: ['SARAH_SAVED_DEAL'] },
      ],
      traits: ['confident', 'protective', 'ambitious'],
    },
    {
      stage: 3,
      title: 'The ?',
      description: 'What happens next depends on choices you haven\'t made yet...',
      unlocks: ['???'],
      triggers: [
        { requiredFlags: ['SARAH_ROMANCE_PATH'] },
        // OR
        { requiredFlags: ['SARAH_RIVAL_PATH'] },
        // OR
        { requiredFlags: ['SARAH_COFOUNDER_PATH'] },
      ],
    },
  ],
  
  secrets: [
    {
      id: 'sarah_secret_1',
      title: 'Hunter\'s Weakness',
      content: 'Sarah knows Hunter faked his MBA from Wharton.',
      requiredTrust: 70,
      revealed: false,
      relatedEventId: 'evt_hunter_exposed',
    },
    {
      id: 'sarah_secret_2',
      title: 'Her Own Startup',
      content: 'Sarah is building a fintech startup on the side.',
      requiredTrust: 85,
      revealed: false,
      relatedEventId: 'evt_sarah_startup',
    },
  ],
  
  agenda: {
    primary: 'Become a Partner before 35',
    secondary: 'Prove she\'s not just "the smart one in the corner"',
    fears: 'Being seen as a model monkey forever',
    alignment: 20,  // Starts neutral-positive
    betrayalThreshold: {
      condition: 'Trust drops below 20 AND player takes credit for her work',
      consequenceEventId: 'evt_sarah_resignation',
    },
  },
};
```

---

## UI/UX Redesign

### The Weekly Hub Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WEEK 14 · Q2 YEAR 2                           │
│                        ━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔥 PRIORITY: The CFO's Gambit                                   │   │
│  │ ─────────────────────────────────────────────────────────────── │   │
│  │ Marcus Chen just resigned and is going to Apex Capital.        │   │
│  │                                                                 │   │
│  │ Stakes: CRITICAL        Source: Sarah                          │   │
│  │ Expires: This Week      Related: TechSync Portfolio            │   │
│  │                                                                 │   │
│  │ [VIEW DETAILS]                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐     │
│  │ 📞 OPTIONAL       │ │ 📊 OPTIONAL       │ │ ✈️ OPTIONAL       │     │
│  │ Hunter's Offer    │ │ Portfolio Review  │ │ Dubai Invitation  │     │
│  │                   │ │                   │ │                   │     │
│  │ Stakes: HIGH      │ │ Stakes: LOW       │ │ Stakes: MEDIUM    │     │
│  │ NPC: Hunter       │ │ Business          │ │ NPC: Sheikh       │     │
│  │                   │ │                   │ │                   │     │
│  │ [ENGAGE]          │ │ [ENGAGE]          │ │ [ENGAGE]          │     │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘     │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  📈 ACTIVE STORYLINES                                                  │
│  ├─ The Hunter Problem [Stage 2/3] ████████░░ 75%                      │
│  ├─ Sarah's Ambition [Stage 1/3] ███░░░░░░░ 30%                        │
│  └─ Mega Deal [Stage 1/4] ██░░░░░░░░ 20%                               │
│                                                                         │
│  ⏰ UPCOMING DEADLINES                                                  │
│  ├─ TechSync Board Meeting: 2 weeks                                    │
│  └─ LP Annual Report: 5 weeks                                          │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ [END WEEK]                                           [VIEW PORTFOLIO]   │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Choice Interface

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          THE CFO'S GAMBIT                               │
│                        ━━━━━━━━━━━━━━━━━━━━━                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Sarah bursts into your office. "We have a problem."                   │
│                                                                         │
│  Marcus Chen, the CFO you personally recruited for TechSync,           │
│  just handed in his notice. He's joining Apex Capital.                 │
│                                                                         │
│  He knows everything. Product roadmap. Customer pipeline.              │
│  Your playbook.                                                         │
│                                                                         │
│  The board meeting is in 3 hours. What's your move?                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 💰 MAKE A COUNTER-OFFER                              [-$100K]   │   │
│  │ "Name your price, Marcus. Everyone has one."                    │   │
│  │ ───────────────────────────────────────────────────────────     │   │
│  │ Double his comp. Keep him at any cost.                          │   │
│  │ ⚡ Requires: $100,000 cash                                       │   │
│  │ 📊 Outcome: +Stress, Marcus stays (but for how long?)           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ⚖️ ENFORCE THE NON-COMPETE                           [RUTHLESS] │   │
│  │ "He signed a contract. I intend to hold him to it."             │   │
│  │ ───────────────────────────────────────────────────────────     │   │
│  │ Lawyer up. Make an example of him.                              │   │
│  │ ⚠️ Risk: Sarah disapproves, public relations nightmare          │   │
│  │ 📊 Outcome: -$50K legal, -Rep, Apex backs off                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🤝 GRACEFUL TRANSITION                              [DIPLOMATIC]│   │
│  │ "Let's make this professional."                                 │   │
│  │ ───────────────────────────────────────────────────────────     │   │
│  │ Let him go with class. Extract knowledge first.                 │   │
│  │ ⭐ Sarah approves                                                │   │
│  │ 📊 Outcome: +Rep, triggers CFO search quest                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🌟 PROMOTE JENNIFER                                      [BOLD] │   │
│  │ "Jennifer, you're the new CFO. Effective immediately."         │   │
│  │ ───────────────────────────────────────────────────────────     │   │
│  │ Bet on internal talent. Skip the search.                        │   │
│  │ 🎲 Skill Check: Reputation 50+ for success                      │   │
│  │ 📊 Outcome: Variable - could create loyal ally or disaster      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ [ASK MACHIAVELLI FOR ADVICE]                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Event System (1-2 weeks)
- [ ] Create new event types and interfaces
- [ ] Build EventQueue manager
- [ ] Implement Priority/Optional event system
- [ ] Create WeeklyHub component

### Phase 2: Story Arc Framework (1-2 weeks)  
- [ ] Implement StoryArc state machine
- [ ] Build arc progression logic
- [ ] Create arc UI components
- [ ] Add timeline/progress visualization

### Phase 3: Consequence Engine (1 week)
- [ ] Build event chaining system
- [ ] Implement flag-based gating
- [ ] Create NPC evolution tracker
- [ ] Add consequence preview system

### Phase 4: Content Creation (2-3 weeks)
- [ ] Write 50+ events across categories
- [ ] Create 5-7 major story arcs
- [ ] Develop NPC evolution paths
- [ ] Design multiple endings

### Phase 5: Polish & Balance (1-2 weeks)
- [ ] Playtest and iterate
- [ ] Balance difficulty curves
- [ ] Polish UI/UX
- [ ] Add sound/animation feedback

---

## Migration Strategy

### Preserving Existing Content

The current scenarios, company events, and NPC dramas can be migrated:
- `SCENARIOS` → Converted to `StoryEvent` format
- `COMPANY_EVENTS` → Become stage events in company arcs
- `NPC_DRAMA_TEMPLATES` → Become NPC arc events

### Backward Compatibility

For existing saves:
- Current `tutorialStep` → Maps to `arc_tutorial` progress
- `playedScenarioIds` → Maps to completed events
- `playerFlags` → Preserved as-is (central to new system)

---

## Key Differences from Current System

| Aspect | Current | New RPG System |
|--------|---------|----------------|
| **Weekly Flow** | Open sandbox, pick any action | Structured: Priority event + 1 optional |
| **Events** | Random chance triggers | Narrative-driven queues |
| **Choices** | Isolated outcomes | Chain reactions & consequences |
| **NPCs** | Static with memories | Evolving characters with arcs |
| **Progression** | Level/stat increases | Story arcs with endings |
| **Tension** | Resource management | Dramatic stakes |
| **Replay Value** | Try different stats | Discover different story paths |

---

## Conclusion

This redesign transforms Fund Wars from "spreadsheet management with flavor text" into a genuine **narrative RPG** where:

1. **Every week matters** - There's always a story to tell
2. **Choices have weight** - Your decisions echo through the game
3. **Characters come alive** - NPCs evolve based on your relationship
4. **The world reacts** - Flags and consequences create emergent stories
5. **Multiple endings** - Different playthroughs reveal different stories

The player should finish a session thinking "What happens next?" not "What number do I optimize?"

---

*"In the end, private equity isn't about the deals. It's about the people you destroy—or save—along the way."*
