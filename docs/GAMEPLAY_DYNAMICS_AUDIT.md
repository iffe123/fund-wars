# Gameplay Dynamics Audit

## Purpose

This document is a plain-English walkthrough of the current playable loop in **Fund Wars**, followed by the main systemic issues that are making the experience feel inconsistent or broken.

---

## 1. What the player currently experiences

### 1.1 New game start

1. The app starts in `INTRO`.
2. Completing the intro calls `handleIntroComplete()`.
3. That function seeds the player with a single pipeline company: **PackFancy Inc.**
4. The game phase then switches to `LIFE_MANAGEMENT`, and the player lands on the workspace / desk experience.

### 1.2 The intended main loop

The current design is trying to merge **two loops**:

- **Loop A: classic 2 AP weekly sim**
  - spend AP on diligence / bidding / portfolio management
  - advance the week
  - process world changes

- **Loop B: event-driven RPG loop**
  - narrative event appears
  - player chooses a response
  - consequences apply
  - new events are generated so the game never feels empty

### 1.3 What the player sees after intro

Once the intro finishes:

- the center panel defaults to `EventDrivenWorkspace`
- onboarding events are shown if tutorial flags are not complete
- the player can switch to:
  - `ASSETS` for direct deal / portfolio actions
  - `DEALS` for competitive auctions
  - `FOUNDER` once wealthy enough

### 1.4 PackFancy onboarding flow

For the PackFancy path, the practical player journey is:

1. Open the desk / onboarding event.
2. Read the PackFancy event card.
3. Go to `ASSETS`.
4. Run **Diligence** on PackFancy.
5. Run the **Leverage Model**.
6. Submit **IOI**.
7. Potentially enter **IC / approval** flow.
8. If successful, move the company from pipeline into owned portfolio management.

### 1.5 The three action spaces the player must mentally reconcile

The game currently asks the player to understand three different play spaces:

1. **Desk / Event feed**
   - narrative tasks and onboarding beats
2. **Assets / PortfolioView**
   - deterministic deal buttons like Diligence, IOI, Improve, Exit
3. **Deals / DealMarket**
   - separate competitive auction system with rival funds

Each of these is individually understandable, but they currently feel only partially connected.

---

## 2. Current gameplay systems by area

### 2.1 Intro / boot / game initialization

The intro is structurally clear:

- the intro initializes the player
- PackFancy is inserted immediately as the first pipeline company
- the game then moves into the desk/workspace state

This is a solid starting structure because it gives the player one concrete first deal.

### 2.2 Desk / event-driven workspace

The desk is trying to become the **primary command center**.

It does a few good things:

- always tries to keep events available
- frames the experience narratively
- can guide the player to specific UI tabs
- supports tutorial onboarding better than static menus

But it currently works more like an **overlayed narrative shell** than the true source of gameplay state. In practice, most material actions still happen elsewhere.

### 2.3 Assets / pipeline and portfolio management

The assets tab contains the most concrete game logic.

#### Pipeline stage

For a pipeline company, the player can usually:

- run diligence
- run leverage model
- submit IOI
- walk away
- enter IC once enough prerequisites are met

#### Owned stage

For an owned company, the player can:

- review performance
- improve operations
- refinance debt
- dividend recap
- prepare for exit

#### Exiting stage

For an exiting company, the player can:

- list for sale
- negotiate
- prep IPO
- cancel exit

This area is the most “game-like” system because it contains explicit progression states and concrete buttons.

### 2.4 Competitive deal market

The `DEALS` tab is almost a different game mode:

- separate deal sourcing pool
- live bidding logic
- rival willingness-to-pay simulation
- hidden risk / hidden upside reveal
- direct conversion into portfolio companies if the player wins

This system is potentially strong, but it competes with PackFancy / pipeline progression for attention instead of feeling fully integrated with it.

### 2.5 Founder mode

Founder mode is gated behind wealth and feels like a later-stage fantasy / sandbox layer. It is not the source of the early-game confusion.

---

## 3. What is working already

### 3.1 Strong fantasy and presentation

The game fantasy is clear: satirical private equity career sim with narrative flavor and meaningful tradeoffs.

### 3.2 Good first-deal anchor

Using PackFancy as the initial company is the right move. It gives the player a named deal, real numbers, and a reason to learn the mechanics.

### 3.3 Good move toward narrative-first onboarding

The event-driven desk is a better onboarding surface than throwing new players directly into dense systems.

### 3.4 The asset manager has actual verbs

The `ASSETS` tab has the clearest mechanical verbs in the game and is the best foundation for the core loop.

---

## 4. Main gameplay dynamics that currently do not work well

## 4.1 The game is running **two AP philosophies at once**

There is a direct design contradiction in the codebase.

### Philosophy A: AP is scarce, 2 per week

The development guide says the weekly loop should have exactly **2 Action Points** and that scarcity is the core tension.

### Philosophy B: most actions should be free

`ACTION_COSTS` says the redesign makes many actions free, with AP representing strategic focus instead of basic activity.

### Actual player experience

The player still sees a large number of buttons in `PortfolioView` hard-coded to cost **1 AP** or **2 AP**, including actions that the redesign says should often be free.

**Result:** the rules feel arbitrary. The player cannot build intuition because the design language and the UI language disagree.

---

## 4.2 The game is running **two loop architectures at once**

There is also a structural conflict between:

- the old reducer/context turn-based sim
- the new RPG event flow layer

The desk implies “events drive everything,” but the main economic actions still happen in the old direct-action systems.

**Result:** the player is never fully sure whether the real game is:

- reading and resolving desk events,
- clicking asset management buttons,
- or playing auctions in the deals tab.

This creates cognitive overhead and makes progression feel fragmented.

---

## 4.3 Event flow is not yet the true source of action

`EventDrivenWorkspace` presents the desk as the core experience, but when a choice is made it mostly:

- processes choice consequences
- updates stats
- logs text
- sometimes nudges the player into another tab

It does **not** yet own the underlying deal-state machine in a fully unified way.

So the desk often feels like a narrative wrapper around systems that actually live elsewhere.

**Result:** events feel important, but not always mechanically decisive.

---

## 4.4 The player is asked to learn too many surface areas too early

Very early in the run, the player has to understand:

- desk events
- PackFancy analysis
- leverage model unlock logic
- IOI gating
- IC flow
- separate deals tab / auctions
- AP management
- warnings / office drama / company events

That is a lot of cognitive load for week 1.

**Result:** instead of feeling like “one good first deal,” the opening can feel like “several partially overlapping systems.”

---

## 4.5 PackFancy is a good tutorial object, but the closing path is still too diffuse

The PackFancy journey conceptually makes sense:

- analyze numbers
- find hidden upside / risk
- model leverage
- decide whether to bid

But the player’s actual journey spans multiple UI modes and unlock rules.

**Result:** the learning arc is correct in theory, but the user experience is not compact enough.

---

## 4.6 Competitive auctions are fun, but they fight the onboarding deal for attention

The competitive auction system is flavorful and mechanically rich.

But in the early game it can distract from the PackFancy learning loop because it introduces:

- additional deals
- rival behavior
- valuation pressure
- different close logic

before the player has fully internalized the first deal pipeline.

**Result:** the onboarding arc is diluted.

---

## 4.7 Time advancement is conceptually duplicated

The event system has its own `advanceWeek()` behavior, while the broader game flow also advances time and generates new deals.

This means week progression is conceptually split across systems instead of being owned by one authoritative game-loop transition.

**Result:** it becomes harder to reason about where world progression truly lives, and bugs / desync risks increase.

---

## 4.8 Tutorial migration is incomplete

The codebase still contains both:

- a new event-driven onboarding path
- legacy tutorial-step logic

The workspace even contains explicit compatibility behavior for the legacy tutorial.

**Result:** tutorial behavior is harder to maintain, and edge cases become more likely because both models still exist.

---

## 5. The real root problem

The root problem is **not** that individual components are bad.

The root problem is that the game currently has **too many partially-correct “primary loops.”**

Right now Fund Wars has:

1. a classic weekly AP sim
2. an event-driven narrative loop
3. a deterministic asset-management button grid
4. a separate auction game

All four are promising, but the player needs **one system to be unquestionably primary**.

---

## 6. Recommended direction

## 6.1 Choose one primary loop

The best option is:

### Make the desk / event system the presentation layer
### Make the asset pipeline the underlying economic state machine
### Make auctions a special sourcing mode, not a co-equal main loop

In practice:

- **Desk** = what the player reads and decides from
- **Assets** = where concrete company state changes are visualized and optionally executed
- **Auctions** = occasional high-intensity sourcing events

That would make the game feel coherent.

---

## 6.2 Simplify the first 30 minutes

For the first deal, hide or defer most unrelated systems.

### Recommended onboarding sequence

Week 1:
- one event explaining PackFancy
- one button path: Diligence
- one reveal: hidden patent / upside

Week 2:
- leverage model
- one simple explanation of debt + equity

Week 3:
- submit IOI or walk away
- one consequence explaining conviction vs caution

Week 4:
- IC / decision

Only after that should the game aggressively surface:

- rival auctions
- broader deal market
- more parallel portfolio noise
- heavier office politics

---

## 6.3 Resolve AP design once and everywhere

Pick one rule and enforce it everywhere.

### If using the new redesign:
- research, reading, consulting, and portfolio review should be free
- only strategic commitments cost AP

### If using the classic model:
- keep 2 AP scarcity but make every visible button consistent with it

The current hybrid model is the worst of both worlds because it is harder to understand than either pure model.

---

## 6.4 Give each tab a clear job

### Desk
- receive narrative prompts
- see consequences
- choose priorities

### Assets
- inspect company details
- execute concrete company actions
- visualize phase progression

### Deals
- source new external opportunities
- run auctions only when intentionally triggered

### Founder
- only appears when that fantasy is actually unlocked and relevant

This would reduce confusion immediately.

---

## 6.5 Create one authoritative week-advance pipeline

There should be exactly one place that means:

- consume remaining turn state
- process world tick
- process portfolio changes
- process rivals
- refresh events
- generate new opportunities
- start next week

Everything else should call into that single transition.

---

## 6.6 Finish the tutorial migration

Delete the old tutorial path once the event-driven onboarding is stable.

As long as both coexist, it will be harder to know whether a bug is:

- old tutorial behavior
- new event behavior
- or the interaction between both

---

## 7. Suggested priority fixes

### Highest priority

1. **Unify AP costs and visible UI labels**
2. **Make PackFancy the only meaningful early-game deal path**
3. **Reduce week-1 system noise**
4. **Create one true week-advance authority**
5. **Retire the old tutorial flow**

### Medium priority

6. Integrate auctions more tightly into the event system
7. Let event choices directly mutate deal phase more often
8. Make the desk clearly explain why a button or tab is the next recommended action

### Lower priority

9. Expand founder mode later
10. Add more portfolio complexity after the first deal loop is solid

---

## 8. Bottom line

The game has a **strong theme**, a **good first deal**, and several systems with real potential.

What is making it feel off right now is not lack of content. It is **loop competition**:

- too many “main” systems
- too many rule languages for AP
- too many overlapping onboarding methods

If the game commits to one clear onboarding path and one clear resource model, it should become dramatically easier to understand and much more satisfying to play.
