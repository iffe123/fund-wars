# Fund Wars OS v9.2 — Comprehensive UX Test Report

**Date:** 2026-03-22
**Tester:** Claude (automated code-level game review)
**Build:** v9.2.0 (66/66 tests passing after fix)
**Scope:** AI systems, navigation/UX, storyline, game dynamics & balance

---

## Executive Summary

Fund Wars is an impressive, deeply systems-driven PE career simulator with strong narrative design and sophisticated AI integration. However, the code review uncovered **several categories of issues** that would significantly impact a real player's experience. The most critical problems are: unused game balance mechanics (weekly decay, stress/reputation thresholds), exposed API keys, incomplete rival AI tactics, and dead-end story paths.

**Overall Assessment:** The game's *design* is excellent — the systems are rich and well-conceived. The *implementation* has gaps that prevent many of those systems from working as intended.

---

## 1. DOES THE AI WORK?

### Verdict: Partially — Core works, but with significant gaps

### What Works
- NPC conversations powered by Claude API with context-aware memory
- Deal analysis and financial blueprint generation
- Inner monologue system with 5 competing voices (Greed, Paranoia, Empathy, Ego, Burnout)
- Rival AI with vendetta system, learning, and coalition mechanics
- Offline fallback responses for NPCs when API unavailable

### Critical AI Issues

| # | Issue | Severity | File | Impact |
|---|-------|----------|------|--------|
| 1 | **API key exposed client-side** | CRITICAL | `services/aiClient.ts:1-32` | Any user can steal the API key from browser DevTools. The `anthropic-dangerous-direct-browser-access` header explicitly bypasses security. Risk: unauthorized usage, cost overruns, quota exhaustion. |
| 2 | **No timeout on API calls** | HIGH | `services/aiClient.ts:26-41` | No `AbortController`. If the API hangs, the game freezes. Browser eventually times out after ~30s but gives no feedback. Players think the game crashed. |
| 3 | **6 of 8 rival tactical moves are unimplemented** | CRITICAL | `hooks/useRivalAI.ts:189-214` | Only POACH and RUMOR work in the switch statement. COALITION, SABOTAGE, MARKET_MANIPULATION, SURPRISE_BID, STRATEGIC_RETREAT all silently do nothing. Rival AI appears broken. |
| 4 | **Race condition: only first rival processed per tick** | HIGH | `hooks/useRivalAI.ts:217-218` | `break` after first successful action means other rivals' moves are dropped. |
| 5 | **No user feedback on AI failures** | HIGH | `services/aiClient.ts:43-49` | Errors thrown but never shown to user. Blank responses with no explanation. |
| 6 | **No AI response caching** | MEDIUM | All AI services | Every identical prompt makes a fresh API call. Wastes quota, adds latency. |
| 7 | **No validation of AI-generated numeric values** | HIGH | `services/dynamicAIService.ts:268-277` | AI could return Infinity, NaN, or -999999 for money/stat effects. No range checks. |
| 8 | **Inconsistent offline fallbacks** | MEDIUM | Multiple services | Some return `null`, others return hardcoded strings. Inconsistent player experience. |

### Recommendations
1. **Move API calls server-side** (proxy through Vercel serverless function)
2. Add `AbortController` with 15s timeout + cancel button
3. Complete all rival tactical move implementations
4. Add toast notifications for AI failures
5. Cache AI responses for identical prompts (5-min TTL)

---

## 2. IS IT EASY TO NAVIGATE AND PLAY?

### Verdict: Good desktop UX, mobile needs work

### What Works
- Clean terminal/retro aesthetic with consistent design language
- Desktop 3-column layout (Comms | Workspace | News) is intuitive
- Tab-based mobile navigation with haptic feedback
- Error boundary with friendly "SYSTEM FAULT" recovery screen
- Glossary tooltips for financial terminology
- Boot sequence and intro narrative set the tone well

### Navigation & UX Issues

| # | Issue | Severity | File | Impact |
|---|-------|----------|------|--------|
| 1 | **Intro sequence has no skip option** | HIGH | `components/IntroSequence.tsx` | Returning players must re-watch the entire intro on restart. Significant friction for testing or replaying. |
| 2 | **NPC availability not communicated** | HIGH | `components/CommsTerminal.tsx:114-118` | NPCs have schedules (weekday/weekend, morning/evening) but the UI shows no indicator. Players message unavailable NPCs and think the game is broken. |
| 3 | **Mobile stats are nearly unreadable** | HIGH | `components/PlayerStats.tsx:106-170` | Critical stats (cash, stress, debt) use `text-[8px]` to `text-[10px]`. Below accessibility minimum of 14px. |
| 4 | **Portfolio full state is confusing** | MEDIUM | `components/DealMarket.tsx:78-83` | When portfolio is full, auction button grays out with no guidance on what to do. Needs explicit "Exit a company first" CTA. |
| 5 | **Toast spam on week advance** | MEDIUM | `hooks/useGameFlow.ts:238-255` | Multiple toasts fire simultaneously: interest, time advance, deal count. Players miss important messages. |
| 6 | **Deal affordability hidden until expansion** | MEDIUM | `components/DealMarket.tsx:42,227-236` | "INSUFFICIENT FUNDS" only shows after expanding deal details. Players waste time reading before realizing they can't afford it. |
| 7 | **Login form lacks validation** | LOW | `components/LoginScreen.tsx:84-142` | Can submit empty email/password. No retry button on error. Password stays visible after failure. |
| 8 | **Missing ARIA labels on interactive elements** | MEDIUM | Multiple files | `role="button"` divs lack `aria-label`. Screen readers can't announce purpose. |
| 9 | **Low color contrast** | MEDIUM | `components/PlayerStats.tsx:173` | `text-slate-500` on `bg-slate-900` fails WCAG AA contrast ratio. |
| 10 | **WeekTransition creates duplicate style elements** | LOW | `components/WeekTransition.tsx:79-112` | Style element injected into DOM on every module load. CSS bloat in long sessions. |

### Recommendations
1. Add "Skip Intro" button (save `hasSeenIntro` to localStorage)
2. Show NPC availability badges (green=available, gray=offline, with next available time)
3. Increase mobile font minimums to 12px
4. Show deal affordability status in collapsed deal card
5. Consolidate weekly toasts into single summary notification

---

## 3. DOES THE STORYLINE WORK?

### Verdict: Rich content, but broken navigation and dead-ends

### What Works
- Dual mode: SIMULATION (sandbox PE career) + STORY_CLASSIC (visual novel)
- Satirical, educational tone with genuine financial literacy
- NPC drama system with multi-character relationship impacts
- Chapter structure with scene branching and consequence tracking
- Dynamic AI-generated bonus choices in story scenes

### Storyline Issues

| # | Issue | Severity | File | Impact |
|---|-------|----------|------|--------|
| 1 | **Missing `game_over_restart` scene** | CRITICAL | `content/storyContent.ts` | Multiple scenes reference `nextSceneId: 'game_over_restart'` but this scene doesn't exist. Players hit dead-end at certain story endings. |
| 2 | **55 dialogue scenes with empty choices** | HIGH | `content/storyContent.ts` | 55 scenes have `choices: []` + `requiresAcknowledgment: true`. Creates on-rails experience with no player agency for long stretches. |
| 3 | **30+ orphaned/unreachable scenes** | HIGH | `content/storyContent.ts` | Scenes like `ch1_chad_accept`, `ch1_chad_confident_reply`, etc. are defined but never referenced by any `nextSceneId`. Content players can never reach. |
| 4 | **Mystery contact arc never resolves** | MEDIUM | `content/storyContent.ts:164-180` | Mysterious texter in stairwell is set up but identity/purpose never paid off. Unresolved plot thread. |
| 5 | **NPC `girlfriend_emma` may not exist** | HIGH | `constants/npcDramas.ts:132-141` | Drama arc checks for NPC `girlfriend_emma` but it may not be initialized. Drama silently returns null. |
| 6 | **Multi-NPC consequences capped at 2** | MEDIUM | `contexts/RPGEventContext.tsx:552-568` | Only `npcRelationshipUpdate` and `npcRelationshipUpdate2` handled. 3rd+ NPC effects silently dropped. |
| 7 | **No fallback for stuck story navigation** | MEDIUM | `content/storyContent.ts` | If `nextSceneId` scene doesn't render, player is permanently stuck. No menu/escape hatch. |
| 8 | **Inconsistent narrative voice** | LOW | `content/storyContent.ts:2-8` | Meta-commentary sets cynical tone but some scenes lack this voice. |

### Recommendations
1. Create the `game_over_restart` scene (restart prompt + stats summary)
2. Audit all 55 empty-choice scenes — add at least 2 choices per scene or convert to auto-advance narration
3. Connect or remove the 30+ orphaned scenes
4. Add "Return to Menu" escape option available at all times in story mode
5. Extend consequence system to handle unlimited NPC effects

---

## 4. DO THE GAME DYNAMICS WORK?

### Verdict: Sophisticated design, but critical balance systems are disabled

### What Works
- Deal pipeline: PIPELINE → ANALYZING → ANALYZED → BIDDING → WON/LOST
- Portfolio company lifecycle with management actions
- Competitive auction system with AI rival bidding
- Market volatility cycles (NORMAL, BULL_RUN, CREDIT_CRUNCH, PANIC)
- Career progression: Associate → Senior Associate → VP → Principal → Partner → Founder
- Action point economy (2 AP/week forces strategic decisions)
- Living world with company events, NPC drama, and market shifts

### Game Dynamics Issues

| # | Issue | Severity | File | Impact |
|---|-------|----------|------|--------|
| 1 | **Weekly decay never applied** | CRITICAL | `constants/difficulty.ts:107-111` | `WEEKLY_DECAY` defined (reputation -1, stress +3, relationships -2) but **never imported or used anywhere**. Players accumulate stats infinitely. Breaks all balance. |
| 2 | **Stress breakdown not enforced** | CRITICAL | `constants/difficulty.ts:89-94` | `STRESS_THRESHOLDS.BREAKDOWN = 100` defined but `END_WEEK` reducer never checks it. Players exceed 100 stress with zero consequences. Burnout ending never triggers. |
| 3 | **Reputation floor not enforced** | CRITICAL | `constants/difficulty.ts:96-104` | `REPUTATION_THRESHOLDS.FIRED = 0` defined but never checked. Players can have -50 reputation without getting fired. Career consequences never trigger. |
| 4 | **Difficulty only affects starting stats** | HIGH | `constants/difficulty.ts`, `reducers/gameReducer.ts` | Difficulty modifiers (positive/negative multipliers) only used at game init. After week 1, Easy and Hard players face identical challenges. |
| 5 | **Event generation can starve** | HIGH | `utils/eventQueueManager.ts:395-407` | If all eligible events are completed/expired and player doesn't meet prerequisites for remaining ones, queue produces 0 events. Game stalls. |
| 6 | **Missed NPC meetings never trigger** | MEDIUM | `reducers/gameReducer.ts:644-673` | `lastContactTick` is never set anywhere. The condition always fails, so NPCs never penalize players for missing meetings. |
| 7 | **Event expiration 1-week lag** | MEDIUM | `utils/eventQueueManager.ts:427-435` | Expired events still playable for 1 extra week due to expiration check timing. |
| 8 | **Three separate time-tracking systems** | MEDIUM | `reducers/gameReducer.ts:254-263` | `gameTime.week/year`, `playerStats.gameYear/gameMonth`, `playerStats.timeCursor` all track time independently. Sync errors likely. |
| 9 | **Hard difficulty is mathematically impossible** | HIGH | `constants/difficulty.ts:52-79` | Starting cash $300, stress 45/100, loans $25k at 10%, negative modifier 1.5x. First-week salary barely covers loan interest. Near-impossible without exploits. |
| 10 | **Easy difficulty offers almost no advantage** | MEDIUM | `constants/difficulty.ts:12-37` | Easy modifiers: positive 1.0x, negative 0.9x. Barely distinguishable from Normal (0.9x/1.2x). Not a meaningful "easy" mode. |
| 11 | **DealMarket division by zero** | MEDIUM | `components/DealMarket.tsx:91` | `deal.askingPrice / deal.metrics.ebitda` without checking for zero EBITDA. Could show Infinity/NaN in UI. |
| 12 | **Double event system** | MEDIUM | `contexts/RPGEventContext.tsx:59-61` | Old event queue + new flow state system coexist. Race conditions possible. |

### Recommendations (Priority Order)
1. **Implement weekly decay** — Import and apply `WEEKLY_DECAY` in `END_WEEK` reducer
2. **Enforce stress breakdown** — Check `stress >= 100` in `END_WEEK`, trigger GAME_OVER
3. **Enforce reputation firing** — Check `reputation <= 0` in `END_WEEK`, trigger FIRED ending
4. **Apply difficulty modifiers throughout gameplay** — Use modifiers on all stat changes, not just init
5. **Add event generation failsafe** — Generate fallback "quiet week" events when queue is empty
6. **Rebalance Hard difficulty** — Start cash $2,000, loans $10,000, stress 30
7. **Strengthen Easy mode** — Modifiers: positive 1.3x, negative 0.7x

---

## 5. TEST FIX APPLIED

### Bug Fixed: Failing Test — `UPDATE_PLAYER_STATS` Level Initialization

**File:** `tests/e2e-bugfixes.test.ts:307`
**Problem:** Test expected level `'ANALYST'` but `PlayerLevel.ASSOCIATE` resolves to `'Associate'`. The enum value `ANALYST` doesn't exist.
**Fix:** Changed assertion from `toBe('ANALYST')` to `toBe('Associate')`.
**Result:** All 66 tests now pass (3 test files, 0 failures).

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| **AI System** | 6/10 | Core NPC AI works, but API security, missing rival tactics, no timeouts |
| **Navigation & UX** | 7/10 | Strong desktop layout, but mobile readability and missing skip/feedback |
| **Storyline** | 5/10 | Great content but dead-ends, orphaned scenes, missing scene references |
| **Game Dynamics** | 4/10 | Excellent design, but 3 critical balance systems (decay, stress, reputation) are completely disabled |
| **Overall** | 5.5/10 | A game with 9/10 design hampered by 4/10 implementation completeness |

### Top 5 Fixes for Maximum Impact
1. Implement `WEEKLY_DECAY` in the game reducer (restores core game tension)
2. Enforce `STRESS_THRESHOLDS` and `REPUTATION_THRESHOLDS` (enables failure states)
3. Complete rival AI tactical moves (makes AI opponents feel alive)
4. Add API timeout + error feedback (prevents "frozen game" perception)
5. Fix story dead-ends: create `game_over_restart` scene + connect orphaned scenes

---

*Report generated by automated code-level review. All file paths and line numbers reference the v9.2.0 codebase.*
