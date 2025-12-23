# How to Use the New Event-Driven Flow

## Quick Start

The new event-driven system is integrated into `RPGEventContext`. Here's how to use it:

### 1. Enable Auto-Flow Mode

```typescript
import { useRPGEvents } from '../contexts/RPGEventContext';

const MyComponent = () => {
  const rpgEvents = useRPGEvents();
  
  // Enable the new continuous flow system
  rpgEvents.toggleAutoFlow(true);
  
  // ...
};
```

### 2. Get Next Event (Always Available)

```typescript
const MyGameLoop = () => {
  const rpgEvents = useRPGEvents();
  const { playerStats, npcs } = useGameState();
  const marketVolatility = 'NORMAL';
  
  // This ALWAYS returns an event - game never stops
  const nextEvent = rpgEvents.getNextEvent(playerStats, npcs, marketVolatility);
  
  if (nextEvent) {
    return <EventDisplay event={nextEvent} />;
  }
  
  // This should never happen with auto-flow enabled
  return <div>Loading...</div>;
};
```

### 3. Check Flow Status

```typescript
const FlowStatus = () => {
  const { getFlowStatus } = useRPGEvents();
  
  const status = getFlowStatus();
  
  return (
    <div>
      <p>Available Events: {status.availableEventCount}</p>
      <p>Can Progress: {status.canProgress ? 'Yes' : 'No'}</p>
      <p>Suggestion: {status.suggestion}</p>
    </div>
  );
};
```

### 4. Create Free Interactions (0 AP)

```typescript
const ChatWithNPC = ({ npcId, message }) => {
  const { createFreeInteraction } = useRPGEvents();
  
  const handleQuickChat = () => {
    const event = createFreeInteraction('NPC_CHAT', {
      npcId,
      message,
    });
    
    // This creates an instant 0 AP event
    // Game continues flowing smoothly
  };
  
  return <button onClick={handleQuickChat}>Quick Chat (Free)</button>;
};
```

### 5. Refresh Event Queue

```typescript
const RefreshButton = () => {
  const { refreshEventQueue } = useRPGEvents();
  const { playerStats, npcs } = useGameState();
  const marketVolatility = 'NORMAL';
  
  const handleRefresh = () => {
    // Manually refresh if you need fresh events
    // (Auto-flow does this automatically)
    refreshEventQueue(playerStats, npcs, marketVolatility);
  };
  
  return <button onClick={handleRefresh}>Get More Events</button>;
};
```

## Complete Example: Continuous Game Loop

```typescript
import React, { useEffect } from 'react';
import { useRPGEvents } from '../contexts/RPGEventContext';
import { useGameState } from '../contexts/GameStateContext';

const ContinuousGameLoop: React.FC = () => {
  const rpgEvents = useRPGEvents();
  const { playerStats, npcs, marketVolatility } = useGameState();
  
  // Enable auto-flow on mount
  useEffect(() => {
    rpgEvents.toggleAutoFlow(true);
  }, []);
  
  // Get flow status
  const status = rpgEvents.getFlowStatus();
  
  // Get next event
  const nextEvent = rpgEvents.getNextEvent(playerStats, npcs, marketVolatility);
  
  // Get available free actions
  const freeActions = [
    { label: 'Check Portfolio', type: 'PORTFOLIO_UPDATE' },
    { label: 'Read News', type: 'NEWS_UPDATE' },
    { label: 'Quick Chat', type: 'NPC_CHAT' },
  ];
  
  return (
    <div className="game-container">
      {/* Flow Status */}
      <div className="status-bar">
        <span>Events Available: {status.availableEventCount}</span>
        <span>{status.suggestion}</span>
      </div>
      
      {/* Main Event Display */}
      {nextEvent && (
        <div className="event-card">
          <h2>{nextEvent.title}</h2>
          <p>{nextEvent.hook}</p>
          
          <div className="choices">
            {nextEvent.choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => {
                  rpgEvents.makeChoice(choice, playerStats, npcs);
                  // Next event automatically loads - game never stops
                }}
              >
                {choice.label}
                {choice.apCost > 0 && <span> ({choice.apCost} AP)</span>}
                {choice.apCost === 0 && <span> (Free)</span>}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Free Actions - Always Available */}
      <div className="free-actions">
        <h3>Quick Actions (0 AP)</h3>
        {freeActions.map(action => (
          <button
            key={action.type}
            onClick={() => {
              const event = rpgEvents.createFreeInteraction(
                action.type as any,
                {}
              );
              // Instantly creates and displays a free event
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
      
      {/* Always can progress */}
      <div className="progress-section">
        {status.canProgress && (
          <button onClick={() => rpgEvents.advanceWeek()}>
            Advance to Next Week
          </button>
        )}
      </div>
    </div>
  );
};

export default ContinuousGameLoop;
```

## Key Differences from Old System

### OLD SYSTEM:
```typescript
// Check if player has AP
if (playerStats.gameTime.actionsRemaining < 1) {
  return <div>Out of AP - Advance time to continue</div>;
}

// Player stuck, game stops
```

### NEW SYSTEM:
```typescript
// Get next event (always available)
const nextEvent = rpgEvents.getNextEvent(playerStats, npcs, marketVolatility);

// Event is NEVER null - game never stops
// Free actions (0 AP) keep player engaged even at 0 strategic AP
```

## AP Costs in New System

### Free Actions (0 AP):
- Checking portfolio
- Reading news
- Casual NPC chats
- Reviewing deals
- Market research
- General exploration

### Strategic Actions (1 AP):
- Priority event responses
- Major deal negotiations
- Board meetings
- Deep NPC engagement
- Strategic interventions

### The Key Insight:
**Players can always DO things (0 AP), but strategic focus (AP) determines which high-stakes events they can engage with.**

## Migration Path

### Phase 1: Run Both Systems (Current)
```typescript
// Toggle between old and new
rpgEvents.toggleAutoFlow(true);  // New system
rpgEvents.toggleAutoFlow(false); // Old system
```

### Phase 2: Gradual Conversion
- Convert one game area at a time
- Test continuously
- Get player feedback

### Phase 3: Full Migration
- Remove old action blocking
- Standardize on event-driven flow
- Polish UI for continuous experience

## Testing Checklist

- [ ] Events always available (5+ in queue)
- [ ] Free actions don't consume AP
- [ ] Strategic actions properly cost 1 AP
- [ ] Event chains work (choice → consequence → next event)
- [ ] Game never hits "nothing to do" state
- [ ] Flow status updates correctly
- [ ] Player can always progress

## Troubleshooting

### "No events available"
- Check if auto-flow is enabled: `rpgEvents.toggleAutoFlow(true)`
- Manually refresh: `rpgEvents.refreshEventQueue(...)`
- This should NEVER happen with auto-flow on

### "Running out of things to do"
- Use free actions (0 AP) more
- Create free-flow interactions
- Check event queue count (should be 5+)

### "AP feels meaningless"
- Ensure strategic actions cost 1 AP
- Make free actions feel less impactful
- Balance high-stakes vs casual content

## Best Practices

1. **Always check flow status** - Shows what's available
2. **Use free actions liberally** - Keep game feeling active
3. **Reserve AP for meaningful choices** - Makes it feel strategic
4. **Chain events naturally** - One leads to another
5. **Never block the player** - Always have something to do

## Support

Questions? Check:
- `/docs/EVENT_DRIVEN_REDESIGN.md` - Design document
- `/docs/REDESIGN_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `/utils/gameFlowManager.ts` - Core flow logic
- `/utils/eventQueueManager.ts` - Event queue management
