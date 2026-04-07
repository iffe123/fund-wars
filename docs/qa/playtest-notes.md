# Playtest Notes — 2026-04-07

## Run 1: First 10 Minutes (Default Simulation Mode)

### Flow Trace
1. Login screen → Google auth
2. Legal disclaimer → Accept
3. SystemBoot animation → Terminal boot sequence
4. IntroSequence → Character setup / story intro
5. EventDrivenWorkspace → Onboarding events (RPG event system)
6. Main game loop → Event feed + quick actions

### Fun-Bugs Identified
(Will be filled during Phase 3)

| # | Location | Issue | Severity | Fix |
|---|----------|-------|----------|-----|
| 1 | EventDrivenWorkspace | Background messages are generic/flat ("Operations running normally") | HIGH | Rewrite with SQI tone |
| 2 | Inner Monologue | 5 fully-written inner voices never speak | CRITICAL | Wire into event choices |
| 3 | NewsTicker | Living Newspaper system dormant | HIGH | Consider wiring |
| 4 | Event consequences | Toast-only feedback, no narrative voice | HIGH | Add inner voice reactions |
| 5 | | | | |
