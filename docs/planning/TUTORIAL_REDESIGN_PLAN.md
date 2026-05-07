# Tutorial Redesign: Event-Driven Onboarding System

## The Problem

The current tutorial system has fundamental issues:
1. **Z-index conflicts** - Tutorial overlay (z=140) fights with menus/modals
2. **Players get stuck** - Hardcoded steps don't adapt to game state
3. **Two systems** - Tutorial overlay is separate from the event-driven RPG system
4. **Not interactive** - "Click here" instructions instead of learning-by-doing
5. **Brittle** - Scattered setTutorialStep calls, regex triggers, manual tab switching

## The Solution: Tutorial as Story Arc

**Convert the tutorial FROM a separate overlay TO an integrated story arc in the existing event system.**

### Core Insight
The game already has:
- StoryEvents with narrative, choices, and consequences
- StoryArcs that progress through stages
- RPGEventModal for displaying events
- Event queue that ensures game never stops

**The tutorial becomes the `arc_onboarding` story arc** - the first story every new player experiences.

### Benefits
1. **No z-index conflicts** - Uses same RPGEventModal as regular events
2. **Always progresses** - Event queue system ensures game never blocks
3. **Interactive learning** - Choices teach mechanics, not "click here" text
4. **Easy to skip** - Just make quick choices through events
5. **Seamless transition** - Tutorial events naturally chain to game events
6. **Consistent UX** - Same modal pattern throughout the game

---

## Architecture Overview

### New Components

```
arc_onboarding (Story Arc)
├── Stage 0: "First Morning"
│   └── evt_onboarding_arrival (Priority Event)
│       ├── Meet Machiavelli (mentor introduction)
│       └── Choice: Ready to start → advances to Stage 1
│
├── Stage 1: "The Assignment"
│   └── evt_onboarding_assignment (Priority Event)
│       ├── Chad assigns PackFancy deal
│       ├── GuidedAction: Highlights ASSETS tab
│       └── Choice: View the deal → shows asset manager
│
├── Stage 2: "First Analysis"
│   └── evt_onboarding_analysis (Priority Event)
│       ├── Learn about pipeline/diligence/model
│       ├── GuidedAction: Highlights ANALYZE button
│       └── Choice: Analyze deal → runs leverage model
│
├── Stage 3: "Meet Sarah"
│   └── evt_onboarding_sarah (Priority Event)
│       ├── Introduces NPC system and relationships
│       ├── GuidedAction: Highlights COMMS tab
│       └── Choice: Talk to Sarah → opens COMMS
│
├── Stage 4: "The Patent Question"
│   └── evt_onboarding_research (Priority Event)
│       ├── Ask Sarah about Patent #8829
│       ├── Learn about NPC assistance
│       └── Choice: Ask about patent → Sarah provides intel
│
└── Stage 5: "First Decision"
    └── evt_onboarding_complete (Priority Event)
        ├── IOI decision point
        ├── Introduces deal structure concept
        └── Choice: Submit IOI → completes tutorial, chains to regular game
```

### GuidedAction System

A lightweight system to highlight UI elements during tutorial events without blocking interactions:

```typescript
interface GuidedAction {
  id: string;
  targetElement: string; // CSS selector or element ID
  pulseColor: string;    // Glow color for attention
  tooltip?: string;      // Optional tooltip text
  autoAdvance?: boolean; // Auto-advance when clicked
}

// Usage in event consequences:
consequences: {
  guidedAction: {
    targetElement: '#assets-tab',
    pulseColor: 'amber',
    tooltip: 'Click to view deals',
  }
}
```

### Mentor Guidance System

Instead of a separate overlay, show mentor guidance WITHIN the event modal:

```typescript
// In StoryEvent definition
mentorGuidance?: {
  character: 'machiavelli' | 'sarah';
  message: string;
  tip?: string; // Game mechanic tip
}
```

The RPGEventModal already has `advisorHints` - we enhance this:
- Show mentor avatar and name
- Highlight key game concepts
- Provide contextual tips

---

## Implementation Plan

### Phase 1: Core Infrastructure
- [x] Analyze existing architecture
- [ ] Create `ONBOARDING_ARC` story arc definition
- [ ] Create 6 tutorial events (evt_onboarding_*)
- [ ] Add `mentorGuidance` field to StoryEvent type
- [ ] Add `guidedAction` field to EventConsequences type

### Phase 2: GuidedAction System
- [ ] Create `useGuidedAction` hook
- [ ] Add pulse/glow styles to target elements
- [ ] Implement tooltip overlay (non-blocking)
- [ ] Wire up to event consequence processing

### Phase 3: Update RPGEventModal
- [ ] Enhance mentor hints display
- [ ] Add "tutorial mode" visual styling (optional)
- [ ] Show progress indicator for onboarding arc

### Phase 4: Game Flow Integration
- [ ] Modify game initialization to start with onboarding arc
- [ ] Remove old tutorialStep from GameState
- [ ] Remove TutorialOverlay component
- [ ] Remove PostTutorialGuide component
- [ ] Update App.tsx to use new system

### Phase 5: Polish
- [ ] Add skip tutorial button in first event
- [ ] Ensure smooth transition to regular gameplay
- [ ] Test complete flow

---

## Detailed Event Designs

### Event 1: evt_onboarding_arrival

```typescript
{
  id: 'evt_onboarding_arrival',
  type: 'PRIORITY',
  category: 'CAREER',
  title: 'Your First Day',
  hook: 'Day one at Apex Capital. Don\'t blow it.',
  description: `
    The elevator opens to mahogany and money.

    Welcome to Apex Capital Partners. $2.4 billion AUM.
    Top-quartile returns. A place where careers are made—or destroyed.

    Your desk awaits. Coffee's on. And somewhere, a Managing Director
    is about to drop a CIM on your desk that will define your future.

    Ready to play the game?
  `,
  stakes: 'HIGH',
  mentorGuidance: {
    character: 'machiavelli',
    message: 'Welcome, rookie. I\'m your AI advisor. I\'ll help you navigate this snake pit.',
    tip: 'I\'ll provide hints on choices. Listen or ignore—your call.',
  },
  choices: [
    {
      id: 'ready_to_start',
      label: 'Let\'s Do This',
      description: 'Time to prove yourself.',
      consequences: {
        advancesArc: { arcId: 'arc_onboarding', toStage: 1 },
        queuesEvent: { eventId: 'evt_onboarding_assignment', delayWeeks: 0 },
        notification: { title: 'Game On', message: 'Your career begins now.', type: 'success' },
      },
    },
    {
      id: 'skip_tutorial',
      label: 'Skip the Tour',
      description: 'I know what I\'m doing. Let\'s get to work.',
      consequences: {
        setsFlags: ['TUTORIAL_SKIPPED'],
        advancesArc: { arcId: 'arc_onboarding', toStage: 5 },
        queuesEvent: { eventId: 'evt_first_deal', delayWeeks: 0 },
      },
    },
  ],
  triggerArcId: 'arc_onboarding',
  arcStage: 0,
}
```

### Event 2: evt_onboarding_assignment

```typescript
{
  id: 'evt_onboarding_assignment',
  type: 'PRIORITY',
  category: 'DEAL',
  title: 'The Assignment',
  hook: 'Chad drops something on your desk. "Don\'t disappoint me."',
  description: `
    PackFancy Inc. A cardboard box company.

    Chad Worthington III, Managing Director, expects your analysis by EOD.
    No pressure.

    First step: Check your ASSET MANAGER to review the deal pipeline.
  `,
  stakes: 'MEDIUM',
  sourceNpcId: 'chad',
  mentorGuidance: {
    character: 'machiavelli',
    message: 'The ASSET MANAGER shows your deal pipeline. Click it to see what you\'re working with.',
    tip: 'Deals flow through stages: PIPELINE → DILIGENCE → OWNED → EXIT',
  },
  choices: [
    {
      id: 'open_assets',
      label: 'Review the Pipeline',
      description: 'Open the Asset Manager to see your deals.',
      consequences: {
        guidedAction: {
          targetElement: '[data-tab="ASSETS"]',
          pulseColor: 'amber',
        },
        advancesArc: { arcId: 'arc_onboarding', toStage: 2 },
        queuesEvent: { eventId: 'evt_onboarding_analysis', delayWeeks: 0 },
      },
    },
  ],
  triggerArcId: 'arc_onboarding',
  arcStage: 1,
}
```

### Event 3: evt_onboarding_analysis

```typescript
{
  id: 'evt_onboarding_analysis',
  type: 'PRIORITY',
  category: 'DEAL',
  title: 'Making Sense of the Numbers',
  hook: 'Revenue, EBITDA, multiples... time to dig in.',
  description: `
    PackFancy\'s financials are on your screen.

    $120M revenue. Decent margins. Nothing special on the surface.

    But wait—there's something interesting buried in the details.
    Run the LEVERAGE MODEL to see what the deal could look like.
  `,
  stakes: 'MEDIUM',
  mentorGuidance: {
    character: 'machiavelli',
    message: 'The LEVERAGE MODEL shows how debt and equity combine. Click it to model the deal.',
    tip: 'A good LBO needs strong cash flow to pay down debt. EBITDA is key.',
  },
  choices: [
    {
      id: 'run_model',
      label: 'Run the Model',
      description: 'Open the Leverage Model for PackFancy.',
      consequences: {
        guidedAction: {
          targetElement: '[data-action="leverage-model"]',
          pulseColor: 'cyan',
        },
        advancesArc: { arcId: 'arc_onboarding', toStage: 3 },
        queuesEvent: { eventId: 'evt_onboarding_sarah', delayWeeks: 0 },
      },
    },
  ],
  triggerArcId: 'arc_onboarding',
  arcStage: 2,
}
```

### Event 4: evt_onboarding_sarah

```typescript
{
  id: 'evt_onboarding_sarah',
  type: 'PRIORITY',
  category: 'NPC',
  title: 'Your Analyst',
  hook: 'Someone clears their throat. "Need a hand?"',
  description: `
    Sarah Chen. Senior Analyst. Sharp eyes behind wire-rimmed glasses.

    "I've been through the PackFancy CIM already. There's something
    weird on page 40. A patent reference—Patent #8829."

    She looks at you meaningfully. "Might be worth asking about."

    Open COMMS to talk to your colleagues.
  `,
  stakes: 'LOW',
  sourceNpcId: 'sarah',
  involvedNpcs: ['sarah'],
  mentorGuidance: {
    character: 'sarah',
    message: 'Hi! I\'m Sarah. I can help with research and analysis.',
    tip: 'NPCs have relationships. Help them, they help you. Betray them... well.',
  },
  choices: [
    {
      id: 'talk_to_sarah',
      label: 'Open Comms',
      description: 'Go to COMMS to chat with Sarah about the patent.',
      consequences: {
        guidedAction: {
          targetElement: '[data-tab="COMMS"]',
          pulseColor: 'blue',
        },
        npcEffects: [
          { npcId: 'sarah', relationship: 5, memory: 'Paid attention during onboarding' },
        ],
        advancesArc: { arcId: 'arc_onboarding', toStage: 4 },
        queuesEvent: { eventId: 'evt_onboarding_research', delayWeeks: 0 },
      },
    },
  ],
  triggerArcId: 'arc_onboarding',
  arcStage: 3,
}
```

### Event 5: evt_onboarding_research

```typescript
{
  id: 'evt_onboarding_research',
  type: 'PRIORITY',
  category: 'NPC',
  title: 'The Patent Question',
  hook: 'Sarah\'s waiting. What do you want to know?',
  description: `
    You've got Sarah's attention. Now's your chance to dig deeper.

    "Patent #8829," you say. "What do you know about it?"

    Sarah's eyes light up. "I thought you'd never ask. Pull up a chair."
  `,
  stakes: 'LOW',
  sourceNpcId: 'sarah',
  involvedNpcs: ['sarah'],
  mentorGuidance: {
    character: 'machiavelli',
    message: 'Sarah knows things. Building trust with NPCs unlocks intel and opportunities.',
    tip: 'In COMMS, you can ask NPCs specific questions. They remember how you treat them.',
  },
  choices: [
    {
      id: 'ask_about_patent',
      label: 'Tell Me About the Patent',
      description: 'Get Sarah\'s analysis of Patent #8829.',
      playerLine: 'What\'s the deal with Patent #8829?',
      immediateResponse: 'Sarah smiles. "Hydrophobic coating technology. Waterproof cardboard. It\'s not just a box company—it\'s a materials science company that doesn\'t know what it has."',
      consequences: {
        npcEffects: [
          { npcId: 'sarah', relationship: 10, trust: 5, memory: 'Asked the right questions about PackFancy' },
        ],
        setsFlags: ['KNOWS_PATENT_VALUE'],
        advancesArc: { arcId: 'arc_onboarding', toStage: 5 },
        queuesEvent: { eventId: 'evt_onboarding_complete', delayWeeks: 0 },
        notification: {
          title: 'Intel Acquired',
          message: 'You now understand PackFancy\'s hidden value.',
          type: 'success'
        },
      },
    },
  ],
  triggerArcId: 'arc_onboarding',
  arcStage: 4,
}
```

### Event 6: evt_onboarding_complete

```typescript
{
  id: 'evt_onboarding_complete',
  type: 'PRIORITY',
  category: 'DEAL',
  title: 'Decision Time',
  hook: 'Chad\'s waiting. What\'s your recommendation?',
  description: `
    You've done the analysis. You've found the hidden value.

    Now it's time to make your first real decision:
    Do you submit an Indication of Interest (IOI) for PackFancy?

    An IOI tells the seller you're serious. It's the first step
    toward acquiring a company.

    After this, you'll need to choose your deal structure.
    But first—are you in or out?
  `,
  stakes: 'HIGH',
  sourceNpcId: 'chad',
  mentorGuidance: {
    character: 'machiavelli',
    message: 'This is it. Your first deal decision. Make it count.',
    tip: 'After submitting an IOI, you\'ll choose a deal structure: LBO, Growth Equity, or Venture.',
  },
  choices: [
    {
      id: 'submit_ioi',
      label: 'Submit IOI',
      description: 'You\'re in. Let\'s buy this company.',
      consequences: {
        stats: { reputation: 10 },
        setsFlags: ['TUTORIAL_COMPLETE', 'IOI_SUBMITTED'],
        advancesArc: { arcId: 'arc_onboarding', toStage: 6 },
        // Chain to regular game events
        queuesEvent: { eventId: 'evt_first_deal', delayWeeks: 0 },
        notification: {
          title: 'Tutorial Complete!',
          message: 'Welcome to Apex Capital. The real game begins now.',
          type: 'success'
        },
      },
    },
    {
      id: 'pass_deal',
      label: 'Pass on the Deal',
      description: 'Not feeling it. Better to wait for the right opportunity.',
      consequences: {
        stats: { reputation: -5, stress: -10 },
        setsFlags: ['TUTORIAL_COMPLETE', 'FIRST_DEAL_PASSED'],
        advancesArc: { arcId: 'arc_onboarding', toStage: 6 },
        queuesEvent: { eventId: 'evt_morning_briefing', delayWeeks: 0 },
        notification: {
          title: 'Conservative Play',
          message: 'You passed on PackFancy. Let\'s see what else comes up.',
          type: 'warning'
        },
      },
    },
  ],
  triggerArcId: 'arc_onboarding',
  arcStage: 5,
}
```

---

## Migration Path

### What Gets Removed
1. `components/TutorialOverlay.tsx` - No longer needed
2. `components/PostTutorialGuide.tsx` - No longer needed
3. `tutorialStep` state in GameState - Replaced by arc progress
4. Tutorial-related code in App.tsx (auto-tab-switching, step callbacks)

### What Gets Modified
1. `types/rpgEvents.ts` - Add mentorGuidance and guidedAction fields
2. `constants/rpgContent.ts` - Add ONBOARDING_ARC and events
3. `contexts/RPGEventContext.tsx` - Handle guided actions
4. `components/RPGEventModal.tsx` - Enhanced mentor display
5. `App.tsx` - Remove tutorial logic, start with onboarding arc

### What Gets Added
1. `hooks/useGuidedAction.ts` - Highlight UI elements
2. `constants/onboardingContent.ts` - Tutorial event definitions
3. `styles/guidedAction.css` - Pulse/glow animations

---

## Timeline

1. **Phase 1** (Core): 2-3 hours
2. **Phase 2** (GuidedAction): 1-2 hours
3. **Phase 3** (Modal Updates): 1 hour
4. **Phase 4** (Integration): 2-3 hours
5. **Phase 5** (Polish): 1-2 hours

Total: ~8-12 hours of focused work

---

## Success Criteria

- [ ] New players see onboarding events immediately
- [ ] Tutorial teaches all key mechanics (assets, analysis, NPCs, deals)
- [ ] No z-index conflicts with menus/modals
- [ ] Skip option available from first event
- [ ] Smooth transition to regular gameplay
- [ ] Works on both mobile and desktop
- [ ] Legacy tutorial code fully removed
