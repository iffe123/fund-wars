# 🚀 Quick Start: Enable Continuous Event Flow

## TL;DR

Your game has been redesigned to **never stop**. Here's how to enable it:

## 1. Enable Auto-Flow (1 line of code)

In your main game component (e.g., `App.tsx` or `WeeklyHub.tsx`):

```typescript
import { useRPGEvents } from './contexts/RPGEventContext';

const YourGameComponent = () => {
  const rpgEvents = useRPGEvents();
  
  // Enable continuous event flow
  useEffect(() => {
    rpgEvents.toggleAutoFlow(true); // ← Add this line
  }, []);
  
  // Rest of your component...
};
```

**That's it!** The new system is now active.

## 2. Test It (5 minutes)

```typescript
// Add this to your component to see it working
const TestNewFlow = () => {
  const rpgEvents = useRPGEvents();
  const { playerStats, npcs } = useGameState();
  
  // Check status
  const status = rpgEvents.getFlowStatus();
  console.log('Events available:', status.availableEventCount); // Should be 5+
  console.log('Can progress:', status.canProgress);             // Should be true
  
  // Get next event
  const event = rpgEvents.getNextEvent(playerStats, npcs, 'NORMAL');
  console.log('Next event:', event?.title);                     // Should always have one
  
  return (
    <div>
      <p>Events: {status.availableEventCount}</p>
      <p>Status: {status.suggestion}</p>
    </div>
  );
};
```

## 3. See It In Action

### Before
```
Player: *tries to do something*
Game: "Out of AP" ❌
Player: *stuck*
```

### After
```
Player: *wants to check portfolio*
Game: "Quick Scan (Free)" ✅
Game: "Deep Analysis (1 AP)" ✅
Player: *can always do something*
```

## 4. What Changed for You

### Event Queue
- **Before:** Could run empty → game stops
- **After:** Always has 5+ events → game flows

### AP System
- **Before:** All actions cost AP → blocks player
- **After:** Most actions free, AP for strategy → player chooses focus

### Player Experience
- **Before:** Stop-start, frustrating
- **After:** Continuous, engaging

## 5. Quick Wins

### Show Event Count
```typescript
const EventCounter = () => {
  const { getFlowStatus } = useRPGEvents();
  const status = getFlowStatus();
  
  return <div>Events Available: {status.availableEventCount}</div>;
};
```

### Always Available Actions
```typescript
const FreeActions = () => {
  const { createFreeInteraction } = useRPGEvents();
  
  return (
    <div>
      <button onClick={() => createFreeInteraction('PORTFOLIO_UPDATE', {})}>
        Check Portfolio (Free)
      </button>
      <button onClick={() => createFreeInteraction('NEWS_UPDATE', {})}>
        Read News (Free)
      </button>
      <button onClick={() => createFreeInteraction('NPC_CHAT', {})}>
        Quick Chat (Free)
      </button>
    </div>
  );
};
```

### Get Next Event
```typescript
const EventDisplay = () => {
  const rpgEvents = useRPGEvents();
  const { playerStats, npcs } = useGameState();
  
  const event = rpgEvents.getNextEvent(playerStats, npcs, 'NORMAL');
  
  return (
    <div>
      {event ? (
        <>
          <h2>{event.title}</h2>
          <p>{event.hook}</p>
          {/* Show choices */}
        </>
      ) : (
        <p>Loading events...</p> // Should never see this
      )}
    </div>
  );
};
```

## 6. Verify It's Working

### ✅ Checklist
- [ ] Auto-flow enabled: `rpgEvents.toggleAutoFlow(true)`
- [ ] Event count shows 5+: `getFlowStatus().availableEventCount >= 5`
- [ ] Can always progress: `getFlowStatus().canProgress === true`
- [ ] Free actions work: Create interaction with 0 AP cost
- [ ] Strategic actions work: Actions with 1 AP cost function properly

### 🐛 Troubleshooting

**"No events available"**
```typescript
// Force refresh
rpgEvents.refreshEventQueue(playerStats, npcs, marketVolatility);
```

**"Not seeing new events"**
```typescript
// Check if auto-flow is on
console.log(rpgEvents.state.autoFlowEnabled); // Should be true
```

**"Events seem repetitive"**
- Need to expand event library (see `/constants/rpgContent.ts`)
- Event generation is working, just need more content

## 7. Next Steps

### Immediate (Required)
1. Enable auto-flow in production: `toggleAutoFlow(true)`
2. Test event queue never empties
3. Verify free actions don't consume AP

### Short-term (Recommended)
1. Update UI to show event count
2. Add "free action" indicators
3. Show flow status to player

### Long-term (When Ready)
1. Convert existing actions to events (see `/docs/CONVERSION_EXAMPLE.md`)
2. Expand event library
3. Create event chains
4. Add dynamic event generation

## 8. Full Documentation

- **Overview:** `/docs/REDESIGN_COMPLETE_SUMMARY.md`
- **Design:** `/docs/EVENT_DRIVEN_REDESIGN.md`
- **Usage:** `/docs/HOW_TO_USE_NEW_FLOW.md`
- **Examples:** `/docs/CONVERSION_EXAMPLE.md`
- **Implementation:** `/docs/REDESIGN_IMPLEMENTATION_SUMMARY.md`

## 9. Support

### Questions?
Check the docs above or:
- `/utils/gameFlowManager.ts` - Core flow logic
- `/utils/eventQueueManager.ts` - Event queue management
- `/contexts/RPGEventContext.tsx` - Context integration

### Issues?
The system is designed to never fail:
- Event queue auto-refills
- Free actions always available
- Player never blocked
- Game always flows

If you see "no events available", that's a bug - the queue should auto-generate.

## 10. Summary

```typescript
// Before (stops constantly)
if (ap < 1) return <div>Out of AP - game stopped</div>;

// After (never stops)
rpgEvents.toggleAutoFlow(true);
const event = rpgEvents.getNextEvent(...); // Always returns something
const status = rpgEvents.getFlowStatus();  // canProgress: true
```

**Your game will never stop again. Just enable it and test!**

---

**Ready to enable?**

1. Add one line: `rpgEvents.toggleAutoFlow(true)`
2. Test: Check event count is 5+
3. Play: Game flows continuously

**That's it. Your game is now event-driven and never stops.**
