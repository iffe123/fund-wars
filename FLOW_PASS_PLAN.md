# Flow-pass plan

Phase 0 revert is in. This plan is **layout, state, labels, units, game logic only** — no
typography, color, casing, border, spacing, or panel-shape changes. Anything that can't be
done within those constraints is in `FOLLOWUPS.md` instead of being forced.

One commit per work item. Subjects: `flow: <item>`.

---

## Conflicts I want to flag before touching code

1. **Keyboard `1` / `2` / `3` already bound in `App.tsx:310-312`** to tab switching
   (Workspace / Assets / Deals). The task wants those keys for choice options on the
   active event card. I'll scope the choice handler to "fires only when an active event
   card is mounted and expanded" and let the App-level handler short-circuit on the same
   condition (set a `data-event-active="true"` flag on `document.body` from EventFeed).
   Tab switching keeps working when no card is open.

2. **"Top progress bar showing 100%"** — the only top-area progress bar I can find that
   reads as "currently 100%" on a fresh week is the Action-Points fill in
   `TimeActionBar.tsx:67-72`. It's bound to `(actionsRemaining / maxActions) * 100`. I'll
   label it inline as `AP` in the same monospace ALL CAPS style. If you meant a different
   bar I haven't located, this turns into a FOLLOWUPS entry.

3. **Status bar dedup needs Energy moved, not just deleted.** Energy currently shows only
   in the EventFeed footer (`EventFeed.tsx:505-507`), nowhere in the header. To remove
   the footer block (which also dupes Stress and Cash) I'll add a labeled Energy chip to
   the PlayerStats header in the existing style. That's a layout addition (one chip in
   existing slot), not a restyle.

---

## P0

### 1. `flow: decision focal point`

**Files:** `components/EventFeed.tsx`, `components/EventCard.tsx`, `App.tsx`

- Reorder the EventFeed DOM so the active card (priority event, else first sorted
  optional) renders **first**, before the spotlight summary, decisionPulse banner, and
  inner-voice interjections. Phase header stays but its description text is hidden when
  a priority is active, so the card lands at the very top.
- Hide `Background Activity` block and collapse non-active optional cards while a
  priority event is unresolved.
- Audit EventFeed footer's "Continue Event Feed" / "Advance Week" buttons
  (`EventFeed.tsx:521-543`) — confirm they don't share the exact rounded-bordered
  alignment-colored treatment of choice rows. They look different (cyan border-only vs.
  alignment-tinted hover bg) but I'll verify.
- Add `[1]` / `[2]` / `[3]` prefix to each rendered choice in `EventCard.tsx:381-429`
  using existing `tracking-wider` mono styling. Wire a scoped `keydown` listener inside
  EventCard that fires the matching choice when the card is mounted, expanded, and
  available. Set `document.body.dataset.eventActive` while mounted; gate
  `App.tsx:310-312` on that flag so tab switching and choice picking don't collide.

### 2. `flow: status bar semantics`

**Files:** `components/TimeActionBar.tsx`, `components/PlayerStats.tsx`,
`components/EventFeed.tsx`

- `TimeActionBar.tsx:62-64` — confirmed: format is `{remaining}/{max}`. Change label to
  `AP {remaining}/{max}` so each number is unambiguous; leave the existing tooltip.
- Label the action-fill bar inline (`TimeActionBar.tsx:67-72`) with `AP` in existing
  mono ALL CAPS style. Same component, no styling changes.
- Add a labeled Energy chip to the PlayerStats desktop header
  (`PlayerStats.tsx:215-289`) using the same chip pattern as Stress/Reputation (icon +
  label + value, no new colors).
- Remove the duplicate Quick Stats block from `EventFeed.tsx:500-516` (Energy / Stress /
  Cash). Footer is now buttons only.
- Mobile header: confirm Stress is still present (it is, line 169-185); leave as-is.
- Audit pass on every numeric value in PlayerStats and TimeActionBar — each must have a
  textual label or a `title=`/`aria-label` that names the unit.

### 3. `flow: burnout danger signaling`

**Files:** `components/EventCard.tsx`, `services/blueprintAIService.ts`,
`reducers/gameReducer.ts`, `services/innerMonologueService.ts` (or wherever advisor
lines are surfaced)

- Define "burnout imminent" = `stress >= STRESS_THRESHOLDS.WARNING` (70). Use existing
  constant from `constants/difficulty.ts:89`.
- In `EventCard.checkChoiceAvailability` (lines 94-104), when burnout is imminent and a
  choice's `consequences.stats.stress > 0`, append an inline `[RISK]` tag in the
  existing amber palette (no new red). Disable choices that would push stress past
  `BREAKDOWN`.
- Event deck biasing: locate event-draw call site (likely `gameReducer.ts` or a service)
  and add a weight multiplier toward events tagged with sleep / delegation / time-off
  themes when stress is high. If the event data lacks such tags, add a simple
  `tags?: string[]` filter and skip the bias for events that don't opt in (no new UI).
- Machiavelli reaction: the `burnout` inner voice is already defined
  (`innerMonologueService.ts:177-200`, activates at stress > 50). Verify it's being
  surfaced by EventFeed when active; if not, wire it. Add one new line to the burnout
  voice's pool that explicitly names "burnout imminent."
- Repeated-clicks confirmation: keep a per-event counter of risky clicks while stress >=
  WARNING. On the third risky click within a single event, push an inline systemLog line
  via existing `systemLogs` channel (terminal chatter, not a modal).

---

## P1

### 4. `flow: choice consequence previews`

**Files:** `components/EventCard.tsx`

- `describeChoiceImpact` currently iterates `Object.entries(stats)` — order is
  insertion-dependent. Sort by a fixed key order: cash → reputation → stress → energy →
  ethics → analystRating → financialEngineering → auditRisk → score → health →
  dependency. Always render in that order.
- Surface NPC trust/relationship deltas if present on the choice (extend
  `describeChoiceImpact` to read `consequences.relationshipChanges`).
- For choices with `skillCheck` (already shown as a yellow chip), prefix the impact line
  with `±` in existing palette to indicate randomness. No new glyph.

### 5. `flow: market feed flow`

**Files:** `components/NewsTicker.tsx`

- Replace the modulo-based type rotation (`headlineTypes[i % headlineTypes.length]`,
  line 107) with a deterministic mapping from `e.type/category` (or a stable hash of
  `e.headline`) so each headline always carries the same type/color.
- Items with `e.actionable === true` (or a similar flag — add if missing) get a leading
  `>` or `!` in existing mono.
- Dim items older than 3 turns by attaching `opacity-50` from existing utility set.
  Today the ticker uses fake "minutes ago"; needs a turn counter on each item to sort
  this out — if no turn counter exists in `NewsEvent`, add one (game-state field, not
  visual).

### 6. `flow: contact list flow`

**Files:** `components/NpcListPanel.tsx`, plus the parent that owns `selectedNpcId` to
verify in-place expansion

- Sort NPCs so any with `npc.hasUnreadMessage` / `npc.pendingInteraction` bubble to the
  top of their group.
- Keep the existing mood/trust dot. Add a second status dot (cyan, an existing-palette
  hue) when there's a pending interaction. Stack the two dots in the existing slot.
- Verify clicking opens `CommsTerminal` in context (already does; just confirm).

### 7. `flow: turn pacing`

**Files:** `hooks/useGameFlow.ts`, `hooks/useGameLoop.ts`, `reducers/gameReducer.ts`

- When `endWeek` resolves, queue side-effects (feed lines, stat updates) and dispatch
  them sequentially with ~150ms gaps instead of one batch.
- Wrap the queue in a `prefers-reduced-motion` check; if set, dispatch all immediately.
- Risk: this is the most invasive change; if it forces a reducer architecture change
  bigger than one commit, I'll split into setup + apply commits.

### 8. `flow: advisor behavior`

**Files:** `services/blueprintAIService.ts`, hooks that fire advisor messages

- Hook advisor-line generation into the post-action callback so messages are reactive,
  not on a generic timer.
- When `stress >= WARNING` or a high-stakes priority event is active, prepend a
  "tone-sharper" addendum to the Machiavelli system prompt.
- Idle-nudge: if a priority event has been on screen for N seconds without action,
  fire a one-shot in-character advisor line via existing channel. (No new UI; uses
  existing advisor surface in EventCard.)

---

## Execution order

1. P0-2 status bar semantics — pure labeling and dedup, smallest blast radius, lays the
   foundation for naming used elsewhere.
2. P0-1 decision focal point — DOM reorder + scoped keyboard handler.
3. P0-3 burnout danger signaling — game logic + advisor + event deck.
4. P1-4 choice consequence previews.
5. P1-5 market feed flow.
6. P1-6 contact list flow.
7. P1-8 advisor behavior.
8. P1-7 turn pacing (last; biggest reducer surface area).

Waiting for go-ahead.
