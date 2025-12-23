# Event-Driven Game Redesign

## Problem Statement

The current game architecture "stops all the time" because:
1. Players have only 2 Action Points (AP) per week
2. Every action consumes AP
3. Actions can't be repeated on same target within a week
4. Players quickly run out of things to do and must advance time
5. This creates a frustrating stop-start flow

## Solution: Event-Driven RPG Architecture

### Core Principle
**The game should NEVER stop.** There's always an event, choice, or consequence happening.

### New Game Loop

```
Morning Briefing
  ↓
Priority Event (if any)
  ↓
Player Makes Choice
  ↓
Immediate Consequences
  ↓
Background Events Trigger
  ↓
Optional Events Available
  ↓
Player Chooses Next Event OR Advances Week
  ↓
Week End Processing
  ↓
LOOP BACK TO MORNING BRIEFING
```

### Redesigned AP System

**OLD:** AP blocks actions → game stops when AP = 0
**NEW:** AP represents **focus capacity** - you can always DO things, but AP determines which high-stakes events you can engage with

#### New AP Rules:
1. **Free Actions:** Most interactions are FREE (chat with NPCs, review portfolio, check market)
2. **AP-Required Events:** Only major decisions cost AP:
   - Priority events (MUST respond, 1 AP)
   - High-stakes optional events (0-1 AP depending on complexity)
   - Portfolio management interventions (1 AP)
   - Deal negotiations (1 AP)

3. **Event Flow:** Even at 0 AP, events keep happening - you just can't influence high-stakes ones
4. **Week Advancement:** Can advance week anytime, but consequences play out first

### Event Queue Architecture

```typescript
EventQueue {
  priorityEvent: Event | null        // MUST be addressed (1 AP)
  immediateEvents: Event[]           // Happening NOW (free or low cost)
  optionalEvents: Event[]            // Available this week (0-1 AP)
  scheduledEvents: ScheduledEvent[]  // Future events
  backgroundEvents: Event[]          // Auto-resolve, create atmosphere
}
```

### Event Flow System

Every choice leads to:
1. **Immediate Consequence** - Stat changes, NPC reactions
2. **Cascade Events** - New events triggered by choice
3. **Background Updates** - World keeps moving
4. **Next Event Selection** - Queue offers next event

**Key: The player is never stuck with "nothing to do"**

### Event Types

#### 1. PRIORITY Events (1 AP, MUST resolve)
- Board crises
- Regulatory deadlines
- Major competitor moves
- Critical NPC drama

#### 2. OPTIONAL Events (0-1 AP, choose engagement level)
- Deal opportunities (free to review, 1 AP to bid)
- NPC conversations (free to chat, 1 AP for deep engagement)
- Portfolio reviews (free to check, 1 AP to intervene)
- Market opportunities (free to scout, 1 AP to execute)

#### 3. BACKGROUND Events (0 AP, auto-resolve or flavor)
- News updates
- Market shifts
- NPC small talk
- Portfolio quarterly updates
- Rival fund actions

#### 4. CHAIN Events (0 AP, consequences of choices)
- Immediate fallout from decisions
- NPC follow-up conversations
- Deal counter-offers
- Cascading effects

### Implementation Plan

#### Phase 1: Event Queue Manager Enhancement
- Ensure queue ALWAYS has events available
- Implement event generation system
- Create event chains/cascades
- Add background event stream

#### Phase 2: Redesign Action System
- Convert existing actions to events
- Make most actions free (0 AP)
- Reserve AP for strategic choices only
- Remove per-target action locks (replaced by event logic)

#### Phase 3: Integrate RPGEventContext
- Make RPGEventContext the primary game driver
- Migrate game loop to event-driven model
- Update UI to show event flow
- Add WeeklyHub as main interface

#### Phase 4: Event Content Expansion
- Create diverse event library
- Add event chains and branching
- Implement consequence system
- Build narrative arcs

### Example Flow

```
MORNING BRIEFING
├─ News Update: "Tech Sector Hot" (background, 0 AP)
├─ Sarah Messages You: "Found a deal" (optional, 0 AP to read, 1 AP to pursue)
└─ Board Meeting Scheduled (priority event upcoming)

PLAYER: Reads Sarah's message (free)
├─ Event: Sarah presents deal details
├─ Choice 1: "Pursue this" (1 AP)
├─ Choice 2: "Pass for now" (0 AP)
└─ Choice 3: "Need more info" (0 AP, triggers research event)

PLAYER: Chooses "Need more info" (free)
├─ Immediate: Sarah runs numbers
├─ Cascade: Rival fund hears about deal (background)
└─ Next Event: Financial analysis ready (free to review)

PLAYER: Reviews analysis (free)
├─ Now informed, can pursue (1 AP) or pass (0 AP)
└─ OR advance to next event in queue

PLAYER: Pursues deal (1 AP consumed)
├─ Immediate: Enter negotiation event
├─ Consequence: Reputation +5, Stress +10
└─ Next Event: Rival makes counter-offer (new priority event)

[Game continues flowing - no stoppage]
```

### Key Benefits

1. **Continuous Flow:** Always something happening
2. **Strategic AP Usage:** AP becomes meaningful choice about WHAT to engage with
3. **More Interactions:** Players can explore, chat, research without hitting walls
4. **Better Narrative:** Events chain together creating story flow
5. **Less Frustration:** No more "nothing to do, must advance time"

### Migration Strategy

1. Keep existing systems operational
2. Build event layer on top
3. Gradually convert actions to events
4. Switch primary game loop
5. Clean up old action system

### Success Metrics

- Player never hits "no available actions" state
- At least 3-5 events available at any time
- Average 10+ player interactions per week (up from 2)
- Smooth narrative flow between events
- AP feels strategic, not limiting
