// All Svelte stores and game logic for Digital Umbra.

import { writable, get } from 'svelte/store';
import { CONFIG, SKILL_CATEGORY } from './constants.js';
import { CARD_DEFS, STARTING_DECK_IDS, createCardInstance, shuffle,
         resetCardIds } from './cards.js';
import { RUNNERS, DIFFICULTIES } from './runners.js';
import { TARGET_TEMPLATES, getTargetById, pickTargetsForRun,
         buildRunObstacles, buildEscapeObstacles,
         checkObstacleSatisfied, resetObstacleIds } from './targets.js';
import { UPGRADES, generateShopOptions } from './shop.js';
import { clearSave } from './persistence.js';

// ─── Phase constants ──────────────────────────────────────────────────────────

export const PHASES = {
  START:           'start',
  RUNNER_SELECT:   'runnerSelect',
  TARGET_SELECT:   'targetSelect',
  OBSTACLE:        'obstacle',
  OBSTACLE_RESULT: 'obstacleResult',
  ESCAPE:          'escape',
  RUN_RESULT:      'runResult',
  DOWNTIME:        'downtime',
  DOWNTIME_SHOP:   'downtimeShop',
  GAME_OVER:       'gameOver',
};

// ─── Stores ───────────────────────────────────────────────────────────────────

export const gamePhase        = writable(PHASES.START);
export const runNumber        = writable(1);

export const player = writable({
  runner: null,
  difficulty: null,
  cash: 0,
  secrets: 0,
  heat: 0,
  fatigue: 0,
  burnerIds: 1,
  upgrades: [],
  handLimit: 3,
  heatBonusActivated: false,
  abilityUses: {},
  extraCards: [],           // defIds of purchased cards
  removedStartingCards: [], // defIds removed from starting deck
});

export const deck             = writable([]);
export const hand             = writable([]);
export const discardPile      = writable([]);

export const currentTarget    = writable(null);
export const runObstacles     = writable([]);
export const obstacleIndex    = writable(0);
export const runCash          = writable(0);
export const runSecrets       = writable(0);
export const runEndReason     = writable(null); // 'fatigue'|'heat_burned'|'captured'|'escaped'

// Per-obstacle state
export const playedCards      = writable([]);
export const dataPool         = writable(0);
export const satisfiedSkills  = writable([]); // skill names + '__cat__<category>' markers
export const pendingMultiplier = writable(null); // { card, factor } | null
export const mustDiscardCount = writable(0);
export const iceBreakUsed     = writable(false); // per obstacle

// Target selection
export const availableTargetIds  = writable([]);
export const lastChosenTargetId  = writable(null);

// Escape phase
export const isEscaping           = writable(false);
export const escapeObstacles      = writable([]);
export const escapeObstacleIndex  = writable(0);

// Downtime
export const downtimeActionsLeft = writable(0);
export const shopOptions         = writable([]);
export const shopBuying          = writable(null); // option being purchased (if needs card select)

// Game over
export const gameResult = writable(null); // 'complete'|'marginal'|'failure'|'captured'

// ─── Internal helpers ─────────────────────────────────────────────────────────

function p()  { return get(player); }
function gp() { return get(gamePhase); }

function hasUpgrade(id) {
  return p().upgrades.some(u => u.id === id);
}

// Build a player's deck from their current card collection.
function buildDeck(playerState) {
  const removed = new Set(playerState.removedStartingCards ?? []);
  const startingCards = STARTING_DECK_IDS
    .filter(id => !removed.has(id))
    .map(id => createCardInstance(id));
  const extraCards = (playerState.extraCards ?? []).map(id => createCardInstance(id));
  return shuffle([...startingCards, ...extraCards]);
}

// Reset per-obstacle state.
function resetObstacleState() {
  playedCards.set([]);
  dataPool.set(0);
  satisfiedSkills.set([]);
  pendingMultiplier.set(null);
  mustDiscardCount.set(0);
  iceBreakUsed.set(false);
}

// ─── Core draw logic ──────────────────────────────────────────────────────────

// Apply a list of effects. Returns true if the run ended as a side effect.
function applyEffects(effects) {
  for (const eff of effects) {
    const ended = applySingleEffect(eff);
    if (ended) return true;
  }
  return false;
}

function applySingleEffect(eff) {
  switch (eff.type) {
    case 'data':
      dataPool.update(d => d + eff.amount);
      return false;

    case 'skill':
      satisfiedSkills.update(s => [...s, eff.skill]);
      return false;

    case 'skill_category':
      satisfiedSkills.update(s => [...s, `__cat__${eff.category}`]);
      return false;

    case 'expertise':
      player.update(pp => ({ ...pp, expertise: (pp.expertise ?? 0) + eff.amount }));
      return false;

    case 'draw': {
      let ended = false;
      for (let i = 0; i < eff.amount; i++) {
        ended = drawCardIntoHand();
        if (ended === false) break; // run ended
      }
      return ended === false;
    }

    case 'heat':
      return applyHeatChange(eff.amount);

    case 'fatigue':
      return applyFatigueChange(eff.amount);

    default:
      return false;
  }
}

// Change heat by `delta` (positive = gain, negative = lose).
// Returns true if the run ended.
function applyHeatChange(delta) {
  const cur = p();
  const maxHeat = cur.runner.maxHeat;
  const newHeat = Math.max(0, Math.min(cur.heat + delta, maxHeat));
  const threshold = CONFIG.heatBonusThreshold(maxHeat);

  // Heat bonus: crossing threshold for the first time this run
  if (!cur.heatBonusActivated && newHeat >= threshold) {
    player.update(pp => ({
      ...pp,
      heat: newHeat,
      handLimit: pp.handLimit + 1,
      heatBonusActivated: true,
    }));
    // Draw 1 bonus card (first time)
    drawCardIntoHand();
    return false;
  }

  player.update(pp => ({ ...pp, heat: newHeat }));

  if (newHeat >= maxHeat) {
    return handleHeatFull();
  }
  return false;
}

function handleHeatFull() {
  if (p().burnerIds > 0) {
    player.update(pp => ({ ...pp, heat: 0, burnerIds: pp.burnerIds - 1 }));
    triggerRunEnd('heat_burned');
    return true;
  }
  triggerRunEnd('captured');
  return true;
}

// Change fatigue by `delta`. Returns true if run ended.
function applyFatigueChange(delta) {
  const cur = p();
  const maxFatigue = cur.runner.maxFatigue;
  const newFatigue = Math.max(0, Math.min(cur.fatigue + delta, maxFatigue));
  player.update(pp => ({ ...pp, fatigue: newFatigue }));
  if (newFatigue >= maxFatigue) {
    triggerRunEnd('fatigue');
    return true;
  }
  return false;
}

// Draw one card from the deck into hand.
// Handles ghost protocols (mustPlayImmediately) and reshuffles.
// Returns true normally, false if the run ended.
function drawCardIntoHand() {
  let d = get(deck);

  if (d.length === 0) {
    const disc = get(discardPile);
    if (disc.length === 0) return true; // nowhere left to draw from
    deck.set(shuffle([...disc]));
    discardPile.set([]);
    const ended = applyFatigueChange(1);
    if (ended) return false;
    d = get(deck);
    if (d.length === 0) return true;
  }

  const newDeck = [...d];
  const card = newDeck.pop();
  deck.set(newDeck);

  if (card.mustPlayImmediately) {
    discardPile.update(disc => [...disc, card]);
    const ended = applyEffects(card.effects);
    return !ended;
  }

  hand.update(h => [...h, card]);
  return true;
}

// Draw until hand has `targetSize` non-immediate cards (or run ends).
function fillHand(targetSize) {
  let iters = 0;
  while (get(hand).length < targetSize && iters < 60) {
    const ok = drawCardIntoHand();
    iters++;
    if (!ok) break;
    const phase = gp();
    if (phase === PHASES.RUN_RESULT || phase === PHASES.GAME_OVER) break;
  }
}

// ─── Run end ──────────────────────────────────────────────────────────────────

function triggerRunEnd(reason) {
  runEndReason.set(reason);

  let cash = get(runCash);
  let secrets = get(runSecrets);
  const isFinalRun = get(runNumber) === CONFIG.totalRuns;

  if (reason === 'fatigue' || reason === 'captured') {
    cash    = Math.floor(cash / 2);
    secrets = Math.floor(secrets / 2);
  }

  if (isFinalRun) {
    cash    = Math.floor(cash * CONFIG.finalRunMultiplier);
    secrets = Math.floor(secrets * CONFIG.finalRunMultiplier);
  }

  runCash.set(cash);
  runSecrets.set(secrets);

  if (reason === 'captured') {
    gameResult.set('captured');
    gamePhase.set(PHASES.GAME_OVER);
  } else {
    gamePhase.set(PHASES.RUN_RESULT);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function beginGame() {
  gamePhase.set(PHASES.RUNNER_SELECT);
}

export function selectRunnerAndDifficulty(runnerId, difficultyId) {
  clearSave();
  resetCardIds();
  resetObstacleIds();

  const runner = RUNNERS[runnerId];
  const difficulty = DIFFICULTIES[difficultyId];
  if (!runner || !difficulty) return;

  const abilityUses = {};
  for (const ab of runner.abilities) {
    abilityUses[ab.id] = ab.usesPerRun;
  }

  player.set({
    runner,
    difficulty,
    cash: runner.startingCash,
    secrets: 0,
    heat: 0,
    fatigue: 0,
    burnerIds: runner.startingBurnerIds,
    upgrades: [],
    handLimit: runner.startingHandLimit,
    heatBonusActivated: false,
    abilityUses,
    extraCards: [],
    removedStartingCards: [],
  });

  runNumber.set(1);
  lastChosenTargetId.set(null);
  _startTargetSelect();
}

function _startTargetSelect() {
  const rn = get(runNumber);
  const lastId = get(lastChosenTargetId);
  availableTargetIds.set(pickTargetsForRun(rn, lastId));
  gamePhase.set(PHASES.TARGET_SELECT);
}

export function selectTarget(targetId) {
  const target = TARGET_TEMPLATES.find(t => t.id === targetId);
  if (!target) return;

  const rn = get(runNumber);
  currentTarget.set(target);
  lastChosenTargetId.set(targetId);

  const obstacles = buildRunObstacles(target, rn);
  runObstacles.set(obstacles);
  obstacleIndex.set(0);

  runCash.set(0);
  runSecrets.set(0);
  runEndReason.set(null);
  isEscaping.set(false);
  escapeObstacles.set([]);
  escapeObstacleIndex.set(0);

  // Reset per-run player state
  const cur = p();
  const abilityUses = {};
  for (const ab of cur.runner.abilities) {
    abilityUses[ab.id] = ab.usesPerRun;
  }
  player.update(pp => ({
    ...pp,
    heatBonusActivated: false,
    abilityUses,
  }));

  // Build deck
  deck.set(buildDeck(p()));
  hand.set([]);
  discardPile.set([]);
  resetObstacleState();

  fillHand(p().handLimit);
  gamePhase.set(PHASES.OBSTACLE);
}

// ─── During a run ─────────────────────────────────────────────────────────────

// Get the currently active obstacle (regular or escape).
export function getActiveObstacle() {
  if (get(isEscaping)) {
    const obs = get(escapeObstacles);
    return obs[get(escapeObstacleIndex)] ?? null;
  }
  const obs = get(runObstacles);
  return obs[get(obstacleIndex)] ?? null;
}

// Check whether the active obstacle is satisfied.
export function getObstacleSatisfied() {
  const obs = getActiveObstacle();
  if (!obs) return { satisfied: false, via: null };
  return checkObstacleSatisfied(obs, get(dataPool), get(satisfiedSkills));
}

// Play a card from hand.
// optionIndex: for cards with options (0 or 1).
export function playCard(cardId, optionIndex = null) {
  if (get(mustDiscardCount) > 0) return false;
  if (gp() !== PHASES.OBSTACLE && gp() !== PHASES.ESCAPE) return false;

  const h = get(hand);
  const card = h.find(c => c.id === cardId);
  if (!card) return false;

  // Multiplier card: enter selection mode
  if (card.isMultiplier) {
    hand.update(hh => hh.filter(c => c.id !== cardId));
    pendingMultiplier.set({ card, factor: card.multiplierFactor });
    return true;
  }

  const mult = get(pendingMultiplier);

  // Determine effects
  let effects;
  if (card.options) {
    const idx = optionIndex ?? 0;
    effects = [...(card.options[idx]?.effects ?? [])];
  } else {
    effects = [...(card.effects ?? [])];
  }

  // Apply multiplier if pending and card has data
  const dataEffect = effects.find(e => e.type === 'data');
  if (mult && dataEffect) {
    effects = effects.map(e =>
      e.type === 'data' ? { ...e, amount: e.amount * mult.factor } : e
    );
    discardPile.update(d => [...d, mult.card]);
    pendingMultiplier.set(null);
  }

  // Move card from hand to discard and played pile
  hand.update(hh => hh.filter(c => c.id !== cardId));
  discardPile.update(d => [...d, card]);
  playedCards.update(pc => [...pc, card]);

  // ICE Breaker upgrade: once per obstacle, -1 heat when playing a Breaking skill
  if (!get(iceBreakUsed) && hasUpgrade('ice_breaker')) {
    const hasBreaking = effects.some(e =>
      (e.type === 'skill' && SKILL_CATEGORY[e.skill] === 'breaking') ||
      (e.type === 'skill_category' && e.category === 'breaking')
    );
    if (hasBreaking) {
      iceBreakUsed.set(true);
      applyHeatChange(-1);
    }
  }

  applyEffects(effects);
  return true;
}

// Cancel a pending multiplier (return multiplier card to hand)
export function cancelMultiplier() {
  const mult = get(pendingMultiplier);
  if (!mult) return;
  pendingMultiplier.set(null);
  hand.update(h => [...h, mult.card]);
}

// Discard a card when mustDiscardCount > 0
export function discardCard(cardId) {
  if (get(mustDiscardCount) <= 0) return;
  const h = get(hand);
  const card = h.find(c => c.id === cardId);
  if (!card) return;
  hand.update(hh => hh.filter(c => c.id !== cardId));
  discardPile.update(d => [...d, card]);
  mustDiscardCount.update(n => n - 1);
}

// Draw 1 card, paying 1 Fatigue. Then set mustDiscardCount if over limit.
export function drawForFatigue() {
  if (get(mustDiscardCount) > 0) return;
  const cur = p();
  const ended = applyFatigueChange(1);
  if (ended) return;

  drawCardIntoHand();

  const over = get(hand).length - p().handLimit;
  if (over > 0) mustDiscardCount.set(over);
}

// Re-randomize the current obstacle, paying 1 Heat.
export function rerandomizeObstacle() {
  if (get(mustDiscardCount) > 0) return;
  const target = get(currentTarget);
  const rn = get(runNumber);
  const ended = applyHeatChange(1);
  if (ended) return;

  if (get(isEscaping)) {
    const newObs = buildEscapeObstacles(target, rn).slice(0, 1);
    const idx = get(escapeObstacleIndex);
    escapeObstacles.update(obs => {
      const copy = [...obs];
      copy[idx] = newObs[0];
      return copy;
    });
  } else {
    const idx = get(obstacleIndex);
    const newObs = buildRunObstacles(target, rn);
    runObstacles.update(obs => {
      const copy = [...obs];
      copy[idx] = newObs[idx];
      return copy;
    });
  }

  resetObstacleState();
}

// Confirm passing the current (satisfied) obstacle.
export function passObstacle() {
  const { satisfied } = getObstacleSatisfied();
  if (!satisfied) return;

  if (get(isEscaping)) {
    _passEscapeObstacle();
    return;
  }

  // Accumulate rewards
  const obs = get(runObstacles)[get(obstacleIndex)];
  if (obs) {
    const mult = get(runNumber) === CONFIG.totalRuns ? CONFIG.finalRunMultiplier : 1;
    runCash.update(c => c + Math.floor((obs.rewards.cash ?? 0) * mult));
    runSecrets.update(s => s + Math.floor((obs.rewards.secrets ?? 0) * mult));
  }

  // Draw 1 free card
  drawCardIntoHand();

  resetObstacleState();
  gamePhase.set(PHASES.OBSTACLE_RESULT);
}

// Activate Ghost Mode (extra card draw after passing obstacle)
export function activateGhostMode() {
  const cur = p();
  if ((cur.abilityUses?.ghost_mode ?? 0) <= 0) return;
  player.update(pp => ({
    ...pp,
    abilityUses: { ...pp.abilityUses, ghost_mode: pp.abilityUses.ghost_mode - 1 },
  }));
  drawCardIntoHand();
}

// Continue deeper into the target
export function continueRun() {
  const allObs = get(runObstacles);
  const newIdx = get(obstacleIndex) + 1;
  if (newIdx >= allObs.length) {
    beginEscape();
    return;
  }
  obstacleIndex.set(newIdx);
  resetObstacleState();
  gamePhase.set(PHASES.OBSTACLE);
}

// Start the escape phase
export function beginEscape() {
  const target = get(currentTarget);
  const rn = get(runNumber);
  const escObs = buildEscapeObstacles(target, rn);
  escapeObstacles.set(escObs);
  escapeObstacleIndex.set(0);
  isEscaping.set(true);
  resetObstacleState();
  gamePhase.set(PHASES.ESCAPE);
}

function _passEscapeObstacle() {
  const idx = get(escapeObstacleIndex);
  const total = get(escapeObstacles).length;
  resetObstacleState();
  if (idx + 1 >= total) {
    triggerRunEnd('escaped');
  } else {
    escapeObstacleIndex.set(idx + 1);
    // Stay in ESCAPE phase
  }
}

// ─── Run result ───────────────────────────────────────────────────────────────

export function acceptRunResult() {
  const cash = get(runCash);
  const secrets = get(runSecrets);
  player.update(pp => ({
    ...pp,
    cash: pp.cash + cash,
    secrets: pp.secrets + secrets,
  }));
  _startDowntime();
}

function _startDowntime() {
  const rn = get(runNumber);
  if (rn >= CONFIG.totalRuns) {
    _evaluateGame();
    return;
  }

  // Free reductions
  player.update(pp => ({
    ...pp,
    heat:    Math.max(0, pp.heat    - CONFIG.downtimeFreeHeatReduction),
    fatigue: Math.max(0, pp.fatigue - CONFIG.downtimeFreeFatigueReduction),
  }));

  if (hasUpgrade('ghost_rig')) {
    player.update(pp => ({ ...pp, fatigue: Math.max(0, pp.fatigue - 1) }));
  }

  downtimeActionsLeft.set(CONFIG.downtimeActionsTotal);
  gamePhase.set(PHASES.DOWNTIME);
}

function _evaluateGame() {
  const cur = p();
  const thresh = cur.difficulty;
  if (cur.secrets >= thresh.secretsToWinComplete) {
    gameResult.set('complete');
  } else if (cur.secrets >= thresh.secretsToWinMarginal) {
    gameResult.set('marginal');
  } else {
    gameResult.set('failure');
  }
  gamePhase.set(PHASES.GAME_OVER);
}

// ─── Downtime ─────────────────────────────────────────────────────────────────

function _consumeDowntimeAction() {
  downtimeActionsLeft.update(n => n - 1);
  if (get(downtimeActionsLeft) <= 0) {
    runNumber.update(n => n + 1);
    _startTargetSelect();
  }
}

export function downtimeRest() {
  player.update(pp => ({
    ...pp,
    heat:    Math.max(0, pp.heat    - CONFIG.restHeatReduction),
    fatigue: Math.max(0, pp.fatigue - CONFIG.restFatigueReduction),
  }));
  _consumeDowntimeAction();
}

export function downtimeOpenShop() {
  const opts = generateShopOptions(get(runNumber), p().upgrades);
  shopOptions.set(opts);
  shopBuying.set(null);
  gamePhase.set(PHASES.DOWNTIME_SHOP);
}

export function returnFromShop() {
  shopBuying.set(null);
  gamePhase.set(PHASES.DOWNTIME);
  _consumeDowntimeAction();
}

export function buyShopOption(option) {
  const cur = p();
  if (cur.cash < option.cost) return false;

  if (option.type === 'remove' || option.type === 'purge') {
    shopBuying.set(option);
    return true;
  }

  player.update(pp => ({ ...pp, cash: pp.cash - option.cost }));

  if (option.type === 'card') {
    player.update(pp => ({ ...pp, extraCards: [...(pp.extraCards ?? []), option.defId] }));
  } else if (option.type === 'upgrade') {
    const upg = UPGRADES[option.upgradeId];
    if (!upg || cur.upgrades.length >= CONFIG.maxUpgrades) return false;
    player.update(pp => ({ ...pp, upgrades: [...pp.upgrades, upg] }));
    _applyUpgradeEffect(upg);
  }

  return true;
}

function _applyUpgradeEffect(upg) {
  switch (upg.effect.type) {
    case 'hand_limit':
      player.update(pp => ({ ...pp, handLimit: pp.handLimit + upg.effect.amount }));
      break;
    case 'burner_ids':
      player.update(pp => ({ ...pp, burnerIds: pp.burnerIds + upg.effect.amount }));
      break;
  }
}

// Confirm card removal after selecting a card in the shop
export function confirmCardRemoval(defId, option) {
  const cur = p();
  if (cur.cash < option.cost) return false;
  if (defId === 'ghost_protocol') return false; // cannot remove

  const isPurge = option.type === 'purge';
  const isStarting = cur.removedStartingCards != null &&
    !cur.extraCards?.includes(defId) &&
    ['packet','signal','stream','burst','raw_expertise','amplifier',
     'social_hack','bypass','shortcut'].includes(defId);

  if (!isPurge && isStarting) return false;

  player.update(pp => ({ ...pp, cash: pp.cash - option.cost }));

  if (isStarting) {
    player.update(pp => ({
      ...pp,
      removedStartingCards: [...(pp.removedStartingCards ?? []), defId],
    }));
  } else {
    player.update(pp => {
      const extras = [...(pp.extraCards ?? [])];
      const idx = extras.indexOf(defId);
      if (idx !== -1) extras.splice(idx, 1);
      return { ...pp, extraCards: extras };
    });
  }

  shopBuying.set(null);
  return true;
}

export function cancelCardRemoval() {
  shopBuying.set(null);
}

// ─── Reset ────────────────────────────────────────────────────────────────────

export function resetGame() {
  clearSave();
  resetCardIds();
  resetObstacleIds();
  gamePhase.set(PHASES.RUNNER_SELECT);
}
