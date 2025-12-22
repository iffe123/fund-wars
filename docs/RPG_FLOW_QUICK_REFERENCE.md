# RPG Flow - Quick Reference Guide

## Quick Start: Adding a New Action

```typescript
import { useGame } from './context/GameContext';
import { useEnhancedToast } from './hooks/useEnhancedToast';

function MyComponent() {
  const { updatePlayerStats, addActivity } = useGame();
  const { toast } = useEnhancedToast();
  
  const handleAction = () => {
    // 1. Execute action
    const result = doSomething();
    
    // 2. Update state
    updatePlayerStats({ cash: -10000, reputation: +5 });
    
    // 3. Show toast
    toast.success("Deal completed", "TechCorp acquisition finalized");
    
    // 4. Log activity
    addActivity({
      type: 'deal',
      icon: 'fas fa-handshake',
      title: 'Deal completed',
      detail: 'TechCorp acquisition finalized',
      sentiment: 'positive'
    });
  };
  
  return <button onClick={handleAction}>Execute</button>;
}
```

---

## Toast System

### Basic Usage
```typescript
const { toast } = useEnhancedToast();

// Success (auto-dismisses in 3s)
toast.success("Title", "Description");

// Info
toast.info("Title", "Description");

// Warning (auto-dismisses in 5s)
toast.warning("Title", "Description");

// Error (stays until dismissed)
toast.error("Title", "Description");
```

### With Action Button
```typescript
toast.success("File uploaded", "Report.pdf ready", {
  label: "View File",
  onClick: () => openFile()
});
```

---

## Activity Feed

### Activity Types
- `'deal'` - Deal sourcing, progression, closing
- `'relationship'` - NPC interactions
- `'portfolio'` - Company updates, events
- `'personal'` - Life actions, health, wealth
- `'market'` - Market changes, volatility
- `'time'` - Week changes, quarter ends

### Sentiment
- `'positive'` - Green indicator
- `'neutral'` - Gray indicator
- `'negative'` - Red indicator
- `'warning'` - Amber indicator

### Example
```typescript
addActivity({
  type: 'relationship',
  icon: 'fas fa-user',
  title: 'Met with Sarah Chen',
  detail: 'Relationship improved to 75/100',
  sentiment: 'positive'
});
```

---

## Animated Numbers

### Currency
```typescript
<AnimatedNumber value={cashBalance} format="currency" />
// Output: $24.5M (with smooth transition)
```

### Multiplier
```typescript
<AnimatedNumber value={dealMultiple} format="multiplier" decimals={1} />
// Output: 2.3x
```

### Percentage
```typescript
<AnimatedNumber value={0.15} format="percentage" />
// Output: 15%
```

---

## Week Transition

Automatically triggered by `endWeek()` action. No manual integration needed.

To customize duration:
```typescript
// hooks/useWeekTransition.ts
setTimeout(() => {
  setIsTransitioning(false);
}, 2000); // Change from 1500ms to 2000ms
```

---

## Common Patterns

### Replace Confirmation Modal
```typescript
// ❌ OLD
const [showConfirm, setShowConfirm] = useState(false);

const handleClick = () => setShowConfirm(true);
const onConfirm = () => {
  setShowConfirm(false);
  doAction();
  setShowResult(true);
};

// ✅ NEW
const handleClick = () => {
  doAction();
  toast.success("Action completed");
  addActivity({ ... });
};
```

### Replace Result Modal
```typescript
// ❌ OLD
<Modal isOpen={showResult}>
  <h2>Success!</h2>
  <p>You earned $50,000</p>
  <button onClick={closeModal}>Continue</button>
</Modal>

// ✅ NEW
toast.success(
  "Success!", 
  "You earned $50,000"
);
addActivity({
  type: 'deal',
  icon: 'fas fa-dollar-sign',
  title: 'Profit realized',
  detail: 'You earned $50,000',
  sentiment: 'positive'
});
```

---

## Z-Index Quick Reference

```typescript
import { Z_INDEX } from './constants';

// Use these for layering
Z_INDEX.base          // 0    - Normal content
Z_INDEX.dropdown      // 10   - Dropdowns
Z_INDEX.sticky        // 20   - Sticky headers
Z_INDEX.toast         // 90   - Toast notifications
Z_INDEX.modalOverlay  // 100  - Modal backdrop
Z_INDEX.modal         // 110  - Modal content
Z_INDEX.tooltip       // 120  - Tooltips
Z_INDEX.tutorial      // 140  - Tutorial overlays
Z_INDEX.max           // 9999 - Debug/dev tools
```

---

## Animation Classes

### Button Press
```typescript
className="active:scale-95 active:border-amber-500 transition-all"
```

### Card Highlight
```typescript
className="transition-all duration-300"
// On update:
className="ring-2 ring-green-500 scale-[1.02]"
```

### Smooth Transitions
```typescript
className="transition-all duration-500 ease-out"
```

---

## Best Practices

### DO ✅
- Use toast for immediate feedback
- Add activity for historical record
- Animate state changes
- Keep toasts concise (1-2 lines)
- Use appropriate sentiment colors
- Test on mobile devices

### DON'T ❌
- Don't show confirmation for reversible actions
- Don't stack multiple toasts rapidly
- Don't animate everything (be selective)
- Don't block the UI unnecessarily
- Don't forget to add activities for major actions

---

## Troubleshooting

### Toast not appearing
- Check `ToastContainer` is in App.tsx
- Verify `useEnhancedToast` is called correctly
- Check Z_INDEX.toast is set properly

### Activity feed empty
- Ensure `addActivity` is being called
- Check GameState includes `activities` array
- Verify ADD_ACTIVITY reducer case exists

### Animations stuttering
- Use CSS transforms (not margin/padding)
- Enable hardware acceleration with `will-change`
- Reduce animation count on slower devices

### Week transition not showing
- Check `isTransitioning` state updates
- Verify `WeekTransition` component is rendered
- Ensure `startWeekTransition` is called in `endWeek`

---

## Performance Tips

1. **Activity Feed**: Auto-prunes to 100 items
2. **Toast Stack**: Max 3 visible
3. **Animations**: Use `transform` and `opacity`
4. **Memoization**: Use React.memo for heavy components
5. **Debouncing**: For rapid user actions

---

## Examples from Codebase

### Deal Advancement
See: `components/DealMarket.tsx`
- Click deal card → direct advancement
- Toast notification appears
- Activity logged automatically

### Company Exit
See: `components/ExitStrategyModal.tsx`
- Click exit option → immediate execution
- No confirmation modal
- Result shown with smooth animations

### Week End
See: `contexts/GameActionsContext.tsx`
- Single `endWeek()` call
- Brief transition animation
- Activity feed populated

---

## Need Help?

1. Check `/workspace/docs/RPG_FLOW_REFACTOR_SUMMARY.md` for full details
2. Review example components for patterns
3. Test in dev mode with React DevTools
4. Verify animations in Chrome DevTools Performance tab
