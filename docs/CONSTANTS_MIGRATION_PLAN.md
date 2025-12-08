# Constants Migration Plan

This document outlines the migration of exports from `/constants.ts` (~2200 lines) to the modular `/constants/` folder structure.

## Current Architecture

### Root File: `/constants.ts`
- Single monolithic file containing ~2200 lines
- Contains all game constants mixed together
- Imports types from `./types`

### Existing `/constants/` Folder
Already contains modular files:
- `achievements.ts` - Achievement definitions
- `exits.ts` - Exit options (NOTE: imports from root `../constants.js`)
- `modelingChallenges.ts` - Financial modeling challenges
- `sectors.ts` - Industry sector definitions
- `companyEvents.ts` - Portfolio company event generators
- `npcDramas.ts` - NPC drama templates
- `managementActions.ts` - Management actions for owned companies
- `index.ts` - Re-exports from submodules

---

## Migration Plan

### New File: `/constants/player.ts`

**Purpose:** Player stats, compensation, and progression constants

| Export Name | Type | Current Location | Files That Import It |
|-------------|------|------------------|---------------------|
| `NORMAL_STATS` | `const` (internal) | constants.ts:16 | Used by DIFFICULTY_SETTINGS |
| `DEFAULT_FACTION_REPUTATION` | `const` | constants.ts:5 | context/GameContext.tsx, utils/gameUtils.ts |
| `LEVEL_RANKS` | `const` | constants.ts:406 | components/PlayerStats.tsx |
| `CompensationTier` | `interface` | constants.ts:418 | (type export) |
| `COMPENSATION_BY_LEVEL` | `const` | constants.ts:426 | App.tsx, context/GameContext.tsx, components/PersonalFinancePanel.tsx, components/WorkspacePanel.tsx |
| `BONUS_FACTORS` | `const` | constants.ts:472 | context/GameContext.tsx |
| `AFFORDABILITY_THRESHOLDS` | `const` | constants.ts:481 | App.tsx, components/WorkspacePanel.tsx |

---

### New File: `/constants/npcs.ts`

**Purpose:** NPC definitions including initial NPCs, family members, and rival fund NPCs

| Export Name | Type | Current Location | Files That Import It |
|-------------|------|------------------|---------------------|
| `INITIAL_NPCS` | `const` | constants.ts:81 | App.tsx, context/GameContext.tsx |
| `FAMILY_NPCS` | `const` | constants.ts:231 | context/GameContext.tsx |
| `RIVAL_FUND_NPCS` | `const` | constants.ts:2105 | context/GameContext.tsx |

---

### New File: `/constants/scenarios.ts`

**Purpose:** Game scenarios, questions, news events, and quiz content

| Export Name | Type | Current Location | Files That Import It |
|-------------|------|------------------|---------------------|
| `SCENARIOS` | `const` | constants.ts:896 | App.tsx, context/GameContext.tsx, tests/startup.test.ts |
| `NEWS_EVENTS` | `const` | constants.ts:1777 | App.tsx |
| `PREDEFINED_QUESTIONS` | `const` | constants.ts:1790 | App.tsx |
| `QUIZ_QUESTIONS` | `const` | constants.ts:1799 | App.tsx |
| `BLACK_BOX_FILE` | `const` | constants.ts:1887 | components/BlackBoxModal.tsx |
| `PORTFOLIO_ACTIONS` | `const` | constants.ts:1706 | App.tsx |

**Internal constants (used by SCENARIOS):**
- `dueDiligencePhaseLBO` - Due diligence phase for LBO deals
- `financingPhaseLBO` - Financing phase for LBO deals
- `dueDiligencePhaseGrowth` - Due diligence phase for growth equity
- `dueDiligencePhaseVC` - Due diligence phase for VC deals
- `financingPhaseVC` - Financing/term sheet for VC deals
- `firstCompany` - Partial portfolio company template
- `synergySystems` - Partial portfolio company template
- `ventureBoxCo` - Partial portfolio company template

---

### New File: `/constants/rivals.ts`

**Purpose:** Rival fund definitions, competitive deals, AI strategies, and taunt messages

| Export Name | Type | Current Location | Files That Import It |
|-------------|------|------------------|---------------------|
| `RIVAL_FUNDS` | `const` | constants.ts:1903 | App.tsx, context/GameContext.tsx, components/CompetitiveAuctionModal.tsx, components/DealMarket.tsx |
| `COMPETITIVE_DEALS` | `const` | constants.ts:1957 | context/GameContext.tsx |
| `RIVAL_BID_STRATEGIES` | `const` | constants.ts:2056 | components/CompetitiveAuctionModal.tsx |
| `HUNTER_WIN_TAUNTS` | `const` | constants.ts:2088 | components/CompetitiveAuctionModal.tsx |
| `HUNTER_LOSS_REACTIONS` | `const` | constants.ts:2097 | components/CompetitiveAuctionModal.tsx |
| `RIVAL_TAUNTS` | `const` | constants.ts:2144 | components/CompetitiveAuctionModal.tsx |
| `COALITION_ANNOUNCEMENTS` | `const` | constants.ts:2171 | context/GameContext.tsx |
| `PSYCHOLOGICAL_WARFARE_MESSAGES` | `const` | constants.ts:2179 | context/GameContext.tsx |
| `SURPRISE_ATTACK_MESSAGES` | `const` | constants.ts:2188 | context/GameContext.tsx |
| `VENDETTA_ESCALATION_MESSAGES` | `const` | constants.ts:2196 | context/GameContext.tsx |
| `AI_PERSONALITY_MODIFIERS` | `const` | constants.ts:2219 | (unused or internal) |

---

### New File: `/constants/difficulty.ts`

**Purpose:** Game difficulty settings and adaptive difficulty

| Export Name | Type | Current Location | Files That Import It |
|-------------|------|------------------|---------------------|
| `DIFFICULTY_SETTINGS` | `const` | constants.ts:334 | App.tsx, context/GameContext.tsx, tests/startup.test.ts |
| `ADAPTIVE_DIFFICULTY_THRESHOLDS` | `const` | constants.ts:2257 | (unused or internal) |

**Note:** Depends on `NORMAL_STATS` from player.ts

---

### New File: `/constants/lifestyle.ts`

**Purpose:** Lifestyle system, personal finances, skill investments, and life actions

| Export Name | Type | Current Location | Files That Import It |
|-------------|------|------------------|---------------------|
| `LIFESTYLE_TIERS` | `const` | constants.ts:493 | context/GameContext.tsx, components/PersonalFinancePanel.tsx |
| `DEFAULT_PERSONAL_FINANCES` | `const` | constants.ts:550 | context/GameContext.tsx |
| `DEFAULT_FUND_FINANCES` | `const` | constants.ts:563 | (internal use) |
| `SKILL_INVESTMENTS` | `const` | constants.ts:576 | context/GameContext.tsx, components/PersonalFinancePanel.tsx |
| `LIFE_ACTIONS` | `const` | constants.ts:1579 | App.tsx, components/WorkspacePanel.tsx |
| `VICE_ACTIONS` | `const` | constants.ts:1519 | App.tsx |
| `SHADOW_ACTIONS` | `const` | constants.ts:1549 | App.tsx |

---

### New File: `/constants/ui.ts`

**Purpose:** UI-related constants like styles and display configurations

| Export Name | Type | Current Location | Files That Import It |
|-------------|------|------------------|---------------------|
| `MARKET_VOLATILITY_STYLES` | `const` | constants.ts:1894 | components/PlayerStats.tsx, components/StatsExplainerModal.tsx, components/PortfolioView.tsx |

---

## Files Requiring Import Updates

| File | Current Import Source | Constants Imported |
|------|----------------------|-------------------|
| `App.tsx` | `./constants` | DIFFICULTY_SETTINGS, SCENARIOS, NEWS_EVENTS, LIFE_ACTIONS, PREDEFINED_QUESTIONS, PORTFOLIO_ACTIONS, INITIAL_NPCS, QUIZ_QUESTIONS, VICE_ACTIONS, SHADOW_ACTIONS, RIVAL_FUNDS, COMPENSATION_BY_LEVEL, AFFORDABILITY_THRESHOLDS |
| `context/GameContext.tsx` | `../constants` | DEFAULT_FACTION_REPUTATION, DIFFICULTY_SETTINGS, INITIAL_NPCS, SCENARIOS, RIVAL_FUNDS, COMPETITIVE_DEALS, RIVAL_FUND_NPCS, COMPENSATION_BY_LEVEL, BONUS_FACTORS, COALITION_ANNOUNCEMENTS, PSYCHOLOGICAL_WARFARE_MESSAGES, VENDETTA_ESCALATION_MESSAGES, SURPRISE_ATTACK_MESSAGES, FAMILY_NPCS, LIFESTYLE_TIERS, DEFAULT_PERSONAL_FINANCES, SKILL_INVESTMENTS |
| `components/PlayerStats.tsx` | `../constants` | MARKET_VOLATILITY_STYLES, LEVEL_RANKS |
| `components/PersonalFinancePanel.tsx` | `../constants` | LIFESTYLE_TIERS, SKILL_INVESTMENTS, COMPENSATION_BY_LEVEL |
| `components/CompetitiveAuctionModal.tsx` | `../constants` | RIVAL_FUNDS, RIVAL_BID_STRATEGIES, HUNTER_WIN_TAUNTS, HUNTER_LOSS_REACTIONS, RIVAL_TAUNTS |
| `components/StatsExplainerModal.tsx` | `../constants` | MARKET_VOLATILITY_STYLES |
| `components/DealMarket.tsx` | `../constants` | RIVAL_FUNDS |
| `components/BlackBoxModal.tsx` | `../constants` | BLACK_BOX_FILE |
| `components/PortfolioView.tsx` | `../constants` | MARKET_VOLATILITY_STYLES |
| `components/WorkspacePanel.tsx` | `../constants` | LIFE_ACTIONS, COMPENSATION_BY_LEVEL, AFFORDABILITY_THRESHOLDS |
| `utils/gameUtils.ts` | `../constants` | DEFAULT_FACTION_REPUTATION |
| `tests/startup.test.ts` | `../constants` | DIFFICULTY_SETTINGS, SCENARIOS |

---

## Existing `/constants/exits.ts` Fix

The file `constants/exits.ts` imports from the root file:
```typescript
import { COMPENSATION_BY_LEVEL } from '../constants.js';
```

This needs to be updated to:
```typescript
import { COMPENSATION_BY_LEVEL } from './player';
```

---

## Migration Order

1. **Create new files** (no breaking changes):
   - `/constants/player.ts`
   - `/constants/npcs.ts`
   - `/constants/scenarios.ts`
   - `/constants/rivals.ts`
   - `/constants/difficulty.ts`
   - `/constants/lifestyle.ts`
   - `/constants/ui.ts`

2. **Update `/constants/index.ts`** to re-export from new files

3. **Fix `/constants/exits.ts`** import to use `./player` instead of `../constants.js`

4. **Update all imports** in consumer files to use `./constants` or `../constants` (the folder)

5. **Delete `/constants.ts`** root file

6. **Verify** with TypeScript compilation

---

## Dependencies Between New Files

```
difficulty.ts --> player.ts (needs NORMAL_STATS for DIFFICULTY_SETTINGS)
exits.ts ------> player.ts (needs COMPENSATION_BY_LEVEL)
```

All other files are independent.
