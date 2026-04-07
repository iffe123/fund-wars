# Playtest Notes — 2026-04-07

## Run 1: First 10 Minutes (Default Simulation Mode)

### Flow Trace
1. Login screen → Google auth
2. Legal disclaimer → Accept
3. SystemBoot animation → Terminal boot sequence (SQI tone: strong)
4. IntroSequence → Character setup / story intro (SQI tone: excellent)
5. EventDrivenWorkspace → Onboarding events (RPG event system)
6. Main game loop → Event feed + quick actions

### Fun-Bugs Identified and Fixed

| # | Location | Issue | Severity | Status |
|---|----------|-------|----------|--------|
| 1 | EventDrivenWorkspace | Background messages generic ("Operations running normally") | HIGH | FIXED — 6 company + 6 NPC SQI-flavored rotating lines |
| 2 | Inner Monologue | 5 fully-written inner voices (397 lines) never speak | CRITICAL | FIXED — Wired into event choice flow with UI |
| 3 | EventFeed | Phase descriptions are bland ("A new week begins") | MEDIUM | FIXED — Rewritten with SQI voice |
| 4 | EventFeed | Empty state text generic ("No pending events") | MEDIUM | FIXED — "Suspiciously quiet" sardonic copy |
| 5 | EventCard | Runtime style injection via document.createElement | LOW | FIXED — Removed, using Tailwind class |
| 6 | EventCard | Confirmation dialog generic ("significant consequences") | MEDIUM | FIXED — "Point of No Return" SQI copy |
| 7 | useGameFlow | All system messages robotic ("[SYSTEM_LOG]", "TIME_ADVANCED") | HIGH | FIXED — Full narrative rewrite |
| 8 | NpcListPanel | Flat list with no personality or flavor | MEDIUM | FIXED — Micro-flavor lines based on mood/trust |
| 9 | ActivityFeed | Empty state "NO ACTIVITY YET" generic | MEDIUM | FIXED — "THE DESK IS QUIET" with voice |
| 10 | ActivityFeed | Runtime style injection | LOW | FIXED — Removed, using Tailwind class |
| 11 | useAuctionFlow | Auction messages robotic ("DEAL CLOSED", "DEAL DISMISSED") | MEDIUM | FIXED — Narrative voice |
| 12 | useChatHandlers | Error message "COMMS_ERROR: Signal Lost" | LOW | FIXED — "Message failed. They might be in a meeting." |
| 13 | DealMarket | Empty state generic | LOW | FIXED — SQI voice |
| 14 | index.html | Stale importmap from AI Studio (React 19, wrong CDN) | LOW | FIXED — Removed |

### Observations

**What works well (keep these):**
- SystemBoot sequence is pitch-perfect SQI ("ERROR: ETHICS_MODULE NOT FOUND (SKIPPING...)")
- IntroSequence is genuinely funny and sets stakes immediately
- EventCard choice UI is clean — alignment colors, skill checks, impact previews
- RPG event content (rpgContent.ts) has strong hooks and real consequences
- Machiavelli advisor panel integration on event cards is smart
- WarningPanel with severity tiers is well-designed
- GameEndModal copy is solid ("Your career just got archived by HR")

**What still needs work (future pass):**
- Living Newspaper system still dormant (would be great in NewsTicker)
- Gossip/Reputation Web system dormant
- Crisis/Chaos Engine dormant
- No UI to switch to Story Classic mode
- CommsTerminal NPC quick responses could be punchier
