# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
npm run dev      # Start dev server with hot reload (--host enabled)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Architecture

Digital Umbra is a Svelte 4 cyberpunk deck-builder. Players are "runners" infiltrating organizations over 12 runs. Two resources: Cash (upgrade currency) and Secrets (victory points). Two negative resources: Heat (authority attention) and Fatigue (exhaustion).

### Game Loop

1. **TARGET_SELECT** — Player picks 1 of 3 weighted targets
2. **OBSTACLE** — Draw cards from hand, satisfy obstacle requirements (data + skills)
3. **OBSTACLE_RESULT** — Collect rewards, decide to go deeper or escape
4. **ESCAPE** — Clear N random escape obstacles to keep your haul
5. **RUN_RESULT** — See final run rewards
6. **DOWNTIME** — 2 actions: Rest (reduce Heat/Fatigue) or Shop (buy cards/upgrades)
7. Repeat for 12 runs; final run (12) is longer and more rewarding

### State Management (`src/lib/gameState.js`)

All game state uses Svelte writable stores. Key stores:
- `gamePhase` — Current phase (PHASES constant object)
- `player` — cash, secrets, heat, fatigue, burnerIds, upgrades, handLimit, abilityUses, extraCards, removedStartingCards
- `deck / hand / discardPile` — Current run's cards
- `runObstacles / obstacleIndex` — Obstacles for this run
- `dataPool / satisfiedSkills` — Progress toward current obstacle
- `pendingMultiplier` — When Amplifier/Overclock card is active
- `mustDiscardCount` — When player must discard after drawing over limit

Key functions exported from gameState.js:
- `selectRunnerAndDifficulty(runnerId, difficultyId)` — Starts a new game
- `selectTarget(targetId)` — Picks target, builds deck, starts run
- `playCard(cardId, optionIndex)` — Plays a card from hand
- `drawForFatigue()` — Draw 1 card, gain 1 Fatigue
- `passObstacle()` — Confirm obstacle is cleared
- `beginEscape()` — Start escape phase
- `acceptRunResult()` — Collect rewards, proceed to downtime

### Card System (`src/lib/cards.js`)

Cards have `effects` (single play) or `options` (player chooses). Effect types: data, skill, skill_category, expertise, draw, heat, fatigue. Multiplier cards (`isMultiplier: true`) enter selection mode. Cards with `mustPlayImmediately: true` auto-trigger when drawn (Ghost Protocol).

The starting deck (10 cards) is defined by `STARTING_DECK_IDS`. Additional cards are stored on `player.extraCards` (array of defIds).

### Target & Obstacle System (`src/lib/targets.js`)

6 target templates across 3 difficulty tiers. `pickTargetsForRun(runNumber, lastId)` returns 3 weighted target IDs. `buildRunObstacles(target, runNumber)` materialises the full obstacle list, scaling data requirements with `CONFIG.scaleDataReq`. Random obstacle slots are generated at materialisation time.

Obstacle kinds: `data`, `skill`, `data_and_skill`, `choice`. `checkObstacleSatisfied(obs, dataPool, satisfiedSkills)` returns `{ satisfied, via }`.

Skills are tracked in `satisfiedSkills` as either a skill name (e.g. `'cryptography'`) or a category marker (e.g. `'__cat__social'` from skill_category effects).

### Shop System (`src/lib/shop.js`)

`generateShopOptions(runNumber, upgrades)` returns 3 options (4 if Black Market App is equipped). Option types: `card`, `upgrade`, `remove`, `purge`. Purchases handled by `buyShopOption(option)` in gameState. Card removal requires a follow-up `confirmCardRemoval(defId, option)`.

### Persistence (`src/lib/persistence.js`)

Auto-saves to localStorage on all store changes (500ms debounce). `loadSavedGame(stores)` restores on page load and reseeds ID counters. `SAVE_VERSION = 1` — bump on incompatible shape changes.

**When adding new persistent state:**
1. Add store to `saveGame` serialization in persistence.js
2. Add to `loadSavedGame` restoration (with safe default)
3. Add to `initAutoSave` subscription list
4. Bump SAVE_VERSION

### Configuration (`src/lib/constants.js`)

`CONFIG` object has all balance values. Key fields:
- `startingHandLimit: 3`
- `totalRuns: 12`
- `maxUpgrades: 3`
- `heatBonusThreshold(maxHeat)` — crossing this gives +1 hand limit and 1 free card
- `escapeObstacleCount(runNumber)` — 1/2/3 for early/mid/late game
- `obstaclesPerRun(runNumber)` — 7, except run 12 has 10
- `scaleDataReq(base, runNumber)` — linear scaling

Skills: 9 total across Social (deception, charm, connections), Making (architecture, comprehension, style), Breaking (cryptography, automation, malice).

## Styling

Cyberpunk aesthetic: dark backgrounds (#0a0a0f), cyan accents (#00f5ff), magenta for Social skills (#ff79c6), green for Making (#50fa7b), red for Breaking (#ff5555). Monospace font: 'Share Tech Mono'. Body font: 'Exo 2'.
