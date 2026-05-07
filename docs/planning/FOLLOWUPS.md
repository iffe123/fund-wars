# Follow-ups (deferred from flow pass)

Things I noticed during planning that I can't do without breaking the no-visual-change
constraint, or that require more than one commit to do cleanly. Listed here instead of
force-fitting them.

## Market feed: turn-accurate staleness

P1-5 specified "items older than N turns dim (suggest N=3); apply consistently." The
current architecture replaces `dynamicNews` wholesale on each weekly tick
(`App.tsx:394-414`) — an item never persists across turns, so there's no turn age to
read. The commit approximates staleness by dimming items at list index ≥ 3 (the
producers order newest-first).

To do this properly:
1. Change the news store from `NewsEvent[]` to something like `{ event: NewsEvent;
   createdWeek: number }[]` in `App.tsx` state and `services/geminiService.ts`
   return shape.
2. Merge new items with existing items on tick rather than replacing wholesale.
3. Compute `stale = playerStats.gameTime.week - item.createdWeek >= 3`.

That's a small refactor but it crosses the service boundary, so it warrants its own
commit rather than sliding into the flow pass.
