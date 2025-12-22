# Converting Actions to Events: Example

This document shows how to convert an existing action-based feature to the new event-driven system.

## Example: Portfolio Review

### OLD SYSTEM (Action-Based)

```typescript
// In WorkspacePanel.tsx
<button
  onClick={() => {
    // Requires 1 AP
    if (!useAction(1)) {
      addToast('Not enough AP', 'error');
      return; // GAME STOPS - player blocked
    }
    
    // Do portfolio review
    updatePlayerStats({ stress: +5, score: +10 });
    addToast('Portfolio reviewed', 'success');
  }}
  className={playerStats.gameTime.actionsRemaining < 1 ? 'disabled' : ''}
>
  Review Portfolio (1 AP)
</button>

// PROBLEMS:
// - Blocks player at 0 AP
// - Generic, not narrative
// - Doesn't lead anywhere
// - Binary: do it or don't
```

### NEW SYSTEM (Event-Based)

```typescript
// Create event when player wants to review portfolio
const createPortfolioReviewEvent = (
  playerStats: PlayerStats,
  rpgEvents: RPGEventContextType
): void => {
  // This is FREE (0 AP) - player can always check portfolio
  const event = rpgEvents.createFreeInteraction('PORTFOLIO_UPDATE', {
    portfolioStatus: analyzePortfolio(playerStats.portfolio),
  });
  
  // Event now appears in queue - player can engage at their pace
};

// The generated event looks like:
{
  id: 'portfolio-review-12345',
  type: 'OPTIONAL',
  title: 'Portfolio Check-In',
  hook: 'Time to review your companies. Which one needs attention?',
  stakes: 'LOW',
  category: 'OPERATIONS',
  choices: [
    {
      id: 'deep-dive',
      label: 'Deep Analysis',
      playerLine: 'Let me dig into the numbers.',
      apCost: 1, // Strategic deep work
      consequences: {
        stats: { stress: +10, analystRating: +5, score: +20 },
        notification: {
          title: 'Deep Insights',
          message: 'You found critical issues and opportunities.',
          type: 'success',
        },
        // CHAINS TO NEXT EVENT
        queuesEvent: {
          eventId: 'company-intervention-needed',
          delayWeeks: 0, // Immediate
        },
      },
    },
    {
      id: 'quick-scan',
      label: 'Quick Scan',
      playerLine: 'Just checking in.',
      apCost: 0, // Free casual review
      consequences: {
        stats: { stress: +2, score: +5 },
        notification: {
          title: 'All Clear',
          message: 'Things look stable for now.',
          type: 'info',
        },
      },
    },
    {
      id: 'delegate',
      label: 'Ask Sarah for Summary',
      playerLine: 'Sarah, can you give me the highlights?',
      apCost: 0, // Free interaction
      consequences: {
        stats: { stress: -5 },
        npcEffects: [
          {
            npcId: 'sarah',
            relationship: +5,
            memory: 'Player trusts my judgment on portfolio reviews',
          },
        ],
        // CHAINS TO NPC RESPONSE
        queuesEvent: {
          eventId: 'sarah-portfolio-briefing',
          delayWeeks: 0,
        },
      },
    },
  ],
}

// BENEFITS:
// - Player can ALWAYS access (0 AP for quick scan)
// - Multiple engagement levels
// - Leads to follow-up events
// - Narrative and strategic
// - Game keeps flowing
```

## Conversion Pattern

### Step 1: Identify the Action
```typescript
// OLD: Single button, binary choice, AP gate
<button onClick={doThing} disabled={ap < 1}>
  Do Thing (1 AP)
</button>
```

### Step 2: Design Event Choices
```typescript
// NEW: Multiple levels of engagement
const choices = [
  {
    label: 'Deep Engagement',
    apCost: 1, // Strategic
    consequences: { /* Major impact */ },
  },
  {
    label: 'Casual Interaction',
    apCost: 0, // Free
    consequences: { /* Light impact */ },
  },
  {
    label: 'Delegate/Skip',
    apCost: 0, // Free
    consequences: { /* Minimal/different path */ },
  },
];
```

### Step 3: Add Event Chaining
```typescript
// Make choices lead to new events
consequences: {
  // ... stat changes ...
  queuesEvent: {
    eventId: 'follow-up-event',
    delayWeeks: 0, // Immediate follow-up
  },
}

// Game flows: Event → Choice → Consequence → Next Event
```

### Step 4: Implement in Code
```typescript
const handlePortfolioReview = () => {
  const { createFreeInteraction, getNextEvent } = useRPGEvents();
  
  // Create the event (always works, 0 AP)
  const event = createFreeInteraction('PORTFOLIO_UPDATE', {
    companyCount: playerStats.portfolio.length,
  });
  
  // Event is now in queue, player can engage when ready
  // Game never stops - event is available
};
```

## More Examples

### Deal Negotiation

**OLD:**
```typescript
<button onClick={submitBid} disabled={ap < 1}>
  Submit Bid (1 AP)
</button>
// Binary: bid or don't. Stops game if no AP.
```

**NEW:**
```typescript
{
  title: 'Deal Opportunity: TechCorp',
  choices: [
    { label: 'Aggressive Bid', apCost: 1, /* ... */ },
    { label: 'Conservative Offer', apCost: 1, /* ... */ },
    { label: 'Research More', apCost: 0, /* chains to research event */ },
    { label: 'Ask Sarah', apCost: 0, /* chains to NPC chat */ },
    { label: 'Pass', apCost: 0, /* move on */ },
  ],
}
// Multiple paths, some free. Game keeps flowing.
```

### NPC Interaction

**OLD:**
```typescript
<button onClick={talkToNPC} disabled={ap < 1}>
  Deep Conversation (1 AP)
</button>
// Blocks casual chat. Binary: deep talk or nothing.
```

**NEW:**
```typescript
{
  title: 'Sarah wants to chat',
  choices: [
    { 
      label: 'Heart-to-Heart', 
      apCost: 1, 
      /* Deep relationship building, major consequences */
    },
    { 
      label: 'Quick Chat', 
      apCost: 0, 
      /* Light interaction, small relationship gain */
    },
    { 
      label: 'Later', 
      apCost: 0, 
      /* Skip for now, maybe slight relationship penalty */
    },
  ],
}
// Spectrum of engagement. Can always interact.
```

## Conversion Checklist

For each action you convert:

- [ ] **Design event structure** - title, hook, stakes, category
- [ ] **Create multiple choices** - at least one 0 AP option
- [ ] **Add follow-up events** - chain consequences
- [ ] **Balance AP costs** - free for casual, 1 AP for strategic
- [ ] **Write narrative** - make it feel like story, not mechanics
- [ ] **Test flow** - ensure it leads naturally to next content
- [ ] **Verify accessibility** - players can engage without being blocked

## Anti-Patterns to Avoid

### ❌ DON'T: Make everything cost AP
```typescript
// BAD
{ label: 'Check Portfolio', apCost: 1 } // Blocks basic info
{ label: 'Read News', apCost: 1 }      // Blocks world awareness
{ label: 'Talk to NPC', apCost: 1 }    // Blocks relationships
```

### ✅ DO: Reserve AP for strategic choices
```typescript
// GOOD
{ label: 'Quick Check', apCost: 0 }      // Always available
{ label: 'Deep Analysis', apCost: 1 }    // Strategic
{ label: 'Casual Chat', apCost: 0 }      // Always available
{ label: 'Deep Conversation', apCost: 1 } // Strategic
```

### ❌ DON'T: Create dead-end events
```typescript
// BAD - event doesn't lead anywhere
consequences: {
  stats: { score: +10 },
  // Nothing else happens. Player back to same state.
}
```

### ✅ DO: Chain events naturally
```typescript
// GOOD - creates flow
consequences: {
  stats: { score: +10 },
  queuesEvent: {
    eventId: 'next-logical-step',
    delayWeeks: 0,
  },
  npcEffects: [/* NPC reacts, could spawn their event */],
}
```

### ❌ DON'T: Make choices binary
```typescript
// BAD - only one real option
choices: [
  { label: 'Do it', apCost: 1, /* good outcome */ },
  { label: 'Don\'t', apCost: 0, /* nothing happens */ },
]
```

### ✅ DO: Offer meaningful alternatives
```typescript
// GOOD - multiple valid paths
choices: [
  { label: 'Aggressive', apCost: 1, /* high risk/reward */ },
  { label: 'Conservative', apCost: 1, /* safe play */ },
  { label: 'Research First', apCost: 0, /* chains to research */ },
  { label: 'Get Advice', apCost: 0, /* chains to advisor */ },
]
```

## Testing Converted Features

1. **Flow Test**: Can player engage without being blocked?
2. **Choice Test**: Are there meaningful alternatives?
3. **Chain Test**: Does it lead to next content naturally?
4. **Balance Test**: Are AP costs appropriate?
5. **Narrative Test**: Does it feel like a story, not just mechanics?

## Summary

**Old System:**
- Actions → AP gates → Player blocked → Game stops

**New System:**
- Events → Multiple choices → Some free, some cost AP → Chains to next event → Game flows

The key insight: **Let players DO things (0 AP), but reserve AP for choosing WHAT to focus on strategically.**
