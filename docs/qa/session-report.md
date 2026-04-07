# QA Session Report — 2026-04-07

## Build & Test Status
- **Build**: PASSES (vite build, 3.7s, no errors)
- **Tests**: 86/86 PASS (7 test files)
- **Lint**: No lint script configured (no eslint)
- **Node warning**: Engine mismatch (project wants ^18/^20/^22, running v24.11.1) — non-blocking

## Critical Issues Found

### 1. Stale importmap in index.html
The `<script type="importmap">` block (lines 314-326) references `aistudiocdn.com` CDN URLs for React 19, Firebase 12.6, Vite 7, etc. This is a leftover from Google AI Studio. Vite ignores it during bundling, but it's confusing and references wrong versions (app uses React 18, Firebase 12.0). **Fix: Remove it.**

### 2. Blueprint AI Systems — Fully Dormant
Seven sophisticated AI systems are implemented but completely disconnected from gameplay:
- **Inner Monologue** (5 voices: Greed, Paranoia, Empathy, Ego, Burnout) — `innerMonologueService.ts` (397 lines). Never rendered. `generateInterjection()` and `getSceneInterjections()` never called.
- **Living Newspaper** — `blueprintAIService.ts`. `generateWeeklyNewspaper()` never called.
- **Gossip/Reputation Web** — `processGossipTick()` never called.
- **Crisis/Chaos Engine** — `generateCrisisEvent()` never called.
- **Deal Autopsy** — `generateForensicEvidence()` never called.
- **Information Economy** — Never triggered.
- **Machiavelli Upgrades** — State exists but unused.

**Root cause**: `GameContext` doesn't expose `blueprintAI` state. Reducer has 10+ action types that are never dispatched. The generation functions are never invoked.

### 3. Story Mode Hidden
A complete visual novel mode (`StoryApp.tsx` → `StoryGame`) exists but requires setting `gameMode = 'STORY_CLASSIC'` via `useGameMode()`. No UI button lets players switch modes.

### 4. No Mode Switch UI
`HybridApp.tsx` provides `useGameMode()` but nothing in the rendered UI calls `setGameMode('STORY_CLASSIC')`.

## Dormant Systems Status

| System | Status | Files | Action Needed |
|--------|--------|-------|---------------|
| Inner Monologue | DORMANT | innerMonologueService.ts | Wire into EventDrivenWorkspace |
| Living Newspaper | DORMANT | blueprintAIService.ts | Wire into NewsTicker |
| Gossip Feed | DORMANT | blueprintAIService.ts | Not prioritized |
| Crisis Modal | DORMANT | blueprintAIService.ts | Not prioritized |
| Deal Autopsy | DORMANT | blueprintAIService.ts | Not prioritized |
| Story Mode | LIVE but hidden | components/story/* | Add mode switch button |
| Dynamic AI Service | LIVE (story only) | dynamicAIService.ts | N/A |
| RPG Event System | LIVE | RPGEventContext.tsx | Working correctly |

## North Star Violations

1. **No Inner Monologue** — The most "story-first" system in the codebase is completely dormant. Players never hear their inner voices during deal decisions. This is the #1 fun-bug.
2. **Background messages are generic** — EventDrivenWorkspace shows "Operations running normally" and "[NPC] is working on something". Flat, zero SQI tone.
3. **No consequences feel personal** — Choices trigger toast messages but no narrative voice reacts to what just happened.
4. **Newspaper is static** — NewsTicker shows hardcoded NEWS_EVENTS plus occasional AI-generated ones, but the Living Newspaper system (satirical tabloid) is dormant.

## Files Changed (tracking)
- [x] index.html — Remove importmap
- [ ] EventDrivenWorkspace.tsx — Wire Inner Monologue
- [ ] App.tsx — Expose blueprintAI if needed
- [ ] Background messages — Add SQI tone
- [ ] Fun-bugs — See playtest-notes.md
