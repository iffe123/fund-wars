# Fund Wars — Migration Plan: StoryApp → App.tsx som default

## Mål

Byta från den linjära StoryApp (visuell roman via StoryEngineContext) till den öppna sandbox-simulatorn App.tsx som huvudspelläge.

## Strategi

### 1. App.tsx blir default
- `index.tsx` renderar App.tsx (med GameProvider, AuthProvider, AudioProvider) istället för StoryApp
- App.tsx:s fulla PE-simulator med worldEngine, rivalAI, deals, portfolio, NPC-chat aktiveras

### 2. StoryEngine-scener bevaras som "milestone triggers"
- Befintliga StoryEngine-scener återanvänds som narrativa triggers som aktiveras av game state
- Exempelvis: en story-scen spelas upp när spelaren når en viss nivå, stänger sin första deal, eller möter en rival
- StoryEngineContext kan laddas on-demand istället för att vara primär driver

### 3. StoryApp bevaras som "Classic Mode"
- StoryApp.tsx behålls intakt som ett separat spelläge
- Tillgängligt via en menyval/toggle (t.ex. "Classic Story Mode")
- Ingen kod raderas — bara routing ändras

## Kända konflikter att lösa

| Konflikt | Lösning |
|----------|---------|
| Duplicerad `GameState`-typ (storyEngine vs reducers) | Namnrymd-separation: `StoryGameState` vs `SimGameState` |
| Duplicerad `PlayerStats`-typ | Rename story-varianten till `StoryPlayerStats` |
| Duplicerad `GamePhase`-typ | Prefix: `StoryGamePhase` vs `GamePhase` |
| Olika provider-stackar | App.tsx behåller sin stack; StoryApp behåller sin |
| Olika localStorage-nycklar | Inga konflikter — redan separata |

## Fasordning

1. **Fas 0** — Inventering och backup (detta dokument)
2. **Fas 1** — Byt rendering i index.tsx till App.tsx med alla providers
3. **Fas 2** — Verifiera att App.tsx:s sandbox-läge fungerar end-to-end
4. **Fas 3** — Integrera StoryEngine-scener som milestone triggers i sandbox-läget
5. **Fas 4** — Lägg till mode-switch för Classic Story Mode
6. **Fas 5** — Polish, tester, deploy
