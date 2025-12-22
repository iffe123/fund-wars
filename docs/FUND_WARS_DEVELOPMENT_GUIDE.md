# Fund Wars - Development Guide & Cursor Rules

## Project Identity

**Fund Wars** is a premium turn-based strategy simulator that puts players in the shoes of a private equity professional, navigating the high-stakes world of leveraged buyouts, portfolio management, and career advancement. This is not a casual clicker game—it's a sophisticated business simulation that respects player intelligence while remaining accessible to newcomers.

---

## Vision & Purpose

### The Core Experience

Fund Wars delivers the authentic experience of a PE/VC career without requiring an MBA or years of industry experience. Players should feel the weight of every decision: the thrill of winning a competitive auction, the anxiety of a portfolio company missing earnings, the satisfaction of a successful exit, and the personal sacrifices required to climb to the top.

### Why This Game Exists

1. **Demystify Private Equity**: Make the opaque world of PE accessible and understandable through experiential learning
2. **Strategic Depth**: Create meaningful decisions with lasting consequences—no optimal path, only tradeoffs
3. **Professional Polish**: Demonstrate that sophisticated, App Store-quality games can be built through AI-assisted development
4. **Authentic Simulation**: Capture the real dynamics of deal-making, relationship management, and career progression

### Success Criteria

- **App Store Approval**: The game must meet all Apple requirements for native app distribution
- **Professional Quality**: Indistinguishable from games built by traditional development teams
- **Engaging Gameplay**: Players should want to complete multiple playthroughs to explore different strategies
- **Educational Value**: Players learn real PE concepts through gameplay, not tutorials

---

## Game Design Philosophy

### Core Pillars

#### 1. Meaningful Scarcity

Every resource in the game should feel precious:

- **Action Points (2/week)**: Force strategic prioritization—you cannot do everything
- **Time**: Career progression creates urgency; opportunities don't wait forever
- **Capital**: Fund size limits deal capacity; personal finances affect life choices
- **Relationships**: Trust takes time to build and moments to destroy

#### 2. Consequential Decisions

No decision should be reversible or trivial:

- Choosing Deal A means missing Deal B
- Neglecting relationships damages them permanently
- Portfolio companies evolve based on your attention (or neglect)
- Career moves close some doors while opening others

#### 3. Living World

The game world progresses with or without player action:

- Companies grow, struggle, or fail independently
- Market conditions shift (bull/bear cycles, sector rotations)
- Competitors pursue the same deals
- NPCs have their own agendas and memories

#### 4. Earned Mastery

Complexity should be discoverable, not overwhelming:

- Tutorial teaches core loop; advanced mechanics reveal through play
- Early deals are forgiving; later deals punish mistakes
- NPC relationships unlock deeper strategic options
- Multiple viable strategies reward experimentation

### What This Game Is NOT

- ❌ A clicker/idle game with passive progression
- ❌ A fantasy simulation with unrealistic outcomes
- ❌ A game where you can do everything perfectly
- ❌ A punishing roguelike that frustrates new players
- ❌ A spreadsheet simulator without narrative or personality

---

## Core Game Systems

### 1. The Weekly Cycle

Each game week represents a turn with exactly **2 Action Points**:

```
WEEKLY FLOW:
┌─────────────────────────────────────────────────────┐
│  Week Start                                         │
│  ├── Review notifications/events                   │
│  ├── Check portfolio status                        │
│  └── Plan actions                                  │
│                                                     │
│  Action Phase (2 AP)                               │
│  ├── Deal activities (source, diligence, negotiate)│
│  ├── Portfolio management                          │
│  ├── Relationship building                         │
│  └── Personal life activities                      │
│                                                     │
│  Week End                                          │
│  ├── World simulation tick                         │
│  ├── Random events process                         │
│  └── Progress to next week                         │
└─────────────────────────────────────────────────────┘
```

**Critical Rule**: No action can be repeated on the same target within a single week. Each action must advance the game state.

### 2. Deal Pipeline System

Deals flow through distinct states with clear progression:

```
DEAL STATES:
PIPELINE ──────────────────────────────────────────────────► OWNED ────────► EXITING
    │                                                            │               │
    ├── Sourced (new opportunity)                               │               │
    ├── Initial Review (basic DD)                               │               │
    ├── Deep Diligence (comprehensive analysis)                 │               │
    ├── Negotiation (price/terms discussion)                    ├── Active      │
    ├── IC Approval (internal committee)                        ├── Improving   │
    └── Closing (final execution)                               ├── Struggling  │
                                                                └── Turnaround  │
                                                                                 │
                                                                    ├── IPO      │
                                                                    ├── Strategic│
                                                                    ├── Secondary│
                                                                    └── Write-off│
```

Each stage requires specific actions and has success/failure probabilities affected by:

- Player skill/experience level
- Relationship with relevant NPCs
- Market conditions
- Company-specific factors
- Time invested in due diligence

### 3. NPC Relationship System

NPCs are not quest-givers—they're strategic assets with:

- **Memory**: They remember your actions across the entire game
- **Preferences**: Different communication styles, deal types, risk appetites
- **Networks**: Connections to other NPCs, companies, and opportunities
- **Agendas**: Personal goals that may align or conflict with yours

**Relationship Tiers**:

1. **Unknown**: Cold outreach only
2. **Acquaintance**: Basic professional courtesy
3. **Colleague**: Willing to share information
4. **Trusted**: Proactive deal flow, honest advice
5. **Inner Circle**: Priority access, partnership opportunities

**AI Integration**: NPCs use Google Gemini API for dynamic, contextual conversations that remember history and respond authentically to player choices.

### 4. Portfolio Management

Owned companies require ongoing attention:

| Company Status | Player Actions Available | Risk Level |
|----------------|---------------------------|------------|
| Performing     | Optimize, prepare exit    | Low        |
| Underperforming| Diagnose, intervene       | Medium     |
| Distressed     | Turnaround, restructure   | High       |
| Failing        | Salvage, write-off        | Critical   |

Portfolio events create ongoing decision pressure:

- Management changes
- Market disruptions
- Competitor moves
- Operational issues
- Exit windows

### 5. Career Progression

```
CAREER LADDER:
Analyst → Associate → VP → Principal → Partner → Managing Partner
   │          │        │       │          │            │
   └──────────┴────────┴───────┴──────────┴────────────┘
                            │
              Each level unlocks:
              • Larger deal sizes
              • More autonomy
              • Higher stakes
              • New mechanics
              • Greater consequences
```

Promotion requires:

- Successful deals closed
- Portfolio performance
- Firm reputation contribution
- Key relationship milestones
- Time in role

### 6. Personal Life System

Career success has personal costs:

- **Energy**: Depletes with work actions, recovers with personal time
- **Relationships**: Family/friends require maintenance or deteriorate
- **Health**: Neglect leads to burnout mechanics
- **Lifestyle**: Spending choices affect happiness and energy recovery

The game should create tension between professional ambition and personal wellbeing—there is no "perfect" balance, only choices.

---

## Technical Architecture

### Technology Stack

- **Framework**: React 18+ with TypeScript (strict mode)
- **Styling**: Tailwind CSS with consistent design tokens
- **State Management**: React Context with structured reducers
- **AI Integration**: Google Gemini API for NPC conversations
- **Deployment**: PWA → Capacitor → Native iOS/Android
- **Icons**: Font Awesome (migrate to build-time for App Store)

### Code Quality Standards

#### File Organization

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI primitives
│   ├── game/            # Game-specific components
│   └── modals/          # Modal dialogs
├── contexts/            # React contexts (keep under 500 lines each)
├── hooks/               # Custom hooks
├── services/            # API integrations, game logic services
├── types/               # TypeScript interfaces/types
├── utils/               # Pure utility functions
└── constants/           # Game constants, configuration
```

#### Component Guidelines

- **Maximum file size**: 500 lines (refactor if exceeding)
- **Single responsibility**: One component, one job
- **Props interface**: Always explicitly typed
- **No inline styles**: Tailwind classes only
- **Accessibility**: Proper ARIA labels, keyboard navigation

#### State Management Rules

- Game state changes through explicit actions only
- No direct state mutation
- All state transitions logged for debugging
- Undo/redo capability for critical actions

### Performance Requirements

- **Initial load**: < 3 seconds on 4G
- **Interaction response**: < 100ms
- **Animation frame rate**: 60fps
- **Bundle size**: < 2MB gzipped
- **Offline capable**: Full gameplay without network

### App Store Compliance Checklist

- [ ] No CDN dependencies (all assets bundled)
- [ ] Service worker for offline functionality
- [ ] Proper app icons (all required sizes)
- [ ] Launch screen/splash configuration
- [ ] Privacy policy accessible in-app
- [ ] No external webviews for core functionality
- [ ] Capacitor plugins for native features
- [ ] App Store metadata prepared

---

## User Experience Standards

### Visual Design Principles

1. **Professional Aesthetic**: Clean, modern, business-appropriate
2. **Information Hierarchy**: Critical info prominent, details progressive
3. **Consistent Patterns**: Same actions look the same everywhere
4. **Responsive Feedback**: Every tap/click acknowledged immediately
5. **Dark Mode Support**: Full dark theme implementation

### Feedback Systems

Every player action must have clear feedback:

| Action Type | Immediate Feedback | Delayed Feedback |
|-------------|---------------------|------------------|
| Button tap  | Visual press state  | Toast notification |
| Deal progress | Progress indicator | Status change    |
| Relationship | Sentiment indicator | NPC response     |
| Week advance | Transition animation | Event summary   |

### Error Handling

- Never show technical errors to players
- Graceful degradation when AI unavailable
- Clear recovery paths from any failure state
- Automatic save to prevent progress loss

### Tutorial System

- Step-by-step onboarding for first game
- Contextual hints for new mechanics
- Skippable for experienced players
- Tutorial state persists across sessions

**Critical**: Tutorial overlays must appear ABOVE all other modals with z-index management.

---

## Development Workflow

### Prompt Structure for AI-Assisted Development

Each development session should follow this structure:

```markdown
## Task: [Clear, specific objective]

### Context
- Current state: [What exists now]
- Problem: [What's wrong or missing]
- Goal: [Desired end state]

### Files to Modify
- `path/to/file.tsx`: [What changes needed]

### Implementation Requirements
1. [Specific requirement]
2. [Specific requirement]

### Validation Steps
- [ ] [How to verify success]
- [ ] [How to verify no regressions]

### Rollback Plan
If issues arise: [How to safely revert]
```

### Code Review Checklist

Before considering any feature complete:

- [ ] TypeScript compiles with no errors
- [ ] No console warnings in development
- [ ] Works on mobile viewport (375px width)
- [ ] Keyboard navigation functional
- [ ] Loading states for async operations
- [ ] Error boundaries for component failures
- [ ] Game state persists correctly across sessions

### Testing Priorities

1. **Critical Path**: Can player complete a full game loop?
2. **State Management**: Does save/load work correctly?
3. **Edge Cases**: Empty states, maximum values, rapid actions
4. **Mobile**: Touch targets, scrolling, orientation changes

---

## Content Guidelines

### Writing Voice

- **Professional but accessible**: Industry terms with context
- **Confident, not arrogant**: Authoritative without condescension
- **Concise**: Respect player time, avoid filler text
- **Contextual humor**: Occasional wit, never forced

### NPC Personalities

Each NPC should have:

- Distinct communication style
- Memorable quirks or preferences
- Consistent behavior patterns
- Realistic motivations

### Deal Descriptions

- Specific industry details (not generic "Company A")
- Realistic financial metrics
- Clear risk/reward profiles
- Compelling narratives

---

## Success Metrics (Internal)

### Quality Indicators

- Zero crash reports in production
- < 1% rage quit rate (rapid exits after failure)
- Average session length > 10 minutes
- Positive App Store reviews (when launched)

### Completion Indicators

- Full game loop functional (start → multiple exits → career progression)
- All NPC archetypes implemented and responsive
- Tutorial covers core mechanics completely
- No placeholder content visible to players

---

## Quick Reference

### Do This ✅

- Make every action feel impactful
- Show consequences clearly
- Respect player intelligence
- Provide clear feedback immediately
- Keep code modular and typed
- Test on mobile first

### Don't Do This ❌

- Allow meaningless choices
- Hide critical information
- Overwhelm with complexity upfront
- Leave players guessing what happened
- Create monolithic files
- Ignore edge cases

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0     | Dec 2024 | Initial comprehensive prompt |

---

*This document serves as the source of truth for Fund Wars development. All implementation decisions should align with these principles. When in doubt, ask: "Does this make the player feel like a PE professional making real decisions?"*

