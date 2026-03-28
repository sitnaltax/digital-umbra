// State persistence to localStorage.

import { get } from 'svelte/store';
import { RUNNERS, DIFFICULTIES } from './runners.js';
import { TARGET_TEMPLATES } from './targets.js';
import { resetCardIds } from './cards.js';
import { resetObstacleIds } from './targets.js';

const SAVE_KEY = 'digital-umbra-save';
const SAVE_VERSION = 1;

const TRANSIENT_PHASES = ['start', 'runnerSelect'];

export function saveGame(stores) {
  const phase = get(stores.gamePhase);
  if (TRANSIENT_PHASES.includes(phase)) return;

  const $player = get(stores.player);
  const { runner, difficulty, ...playerRest } = $player;
  const $currentTarget = get(stores.currentTarget);

  try {
    const data = {
      version: SAVE_VERSION,
      gamePhase: phase,
      runNumber: get(stores.runNumber),
      player: {
        ...playerRest,
        runnerId: runner?.id ?? null,
        difficultyId: difficulty?.id ?? null,
      },
      deck: get(stores.deck),
      hand: get(stores.hand),
      discardPile: get(stores.discardPile),
      currentTargetId: $currentTarget?.id ?? null,
      runObstacles: get(stores.runObstacles),
      obstacleIndex: get(stores.obstacleIndex),
      runCash: get(stores.runCash),
      runSecrets: get(stores.runSecrets),
      runEndReason: get(stores.runEndReason),
      playedCards: get(stores.playedCards),
      dataPool: get(stores.dataPool),
      satisfiedSkills: get(stores.satisfiedSkills),
      pendingMultiplier: get(stores.pendingMultiplier),
      mustDiscardCount: get(stores.mustDiscardCount),
      availableTargetIds: get(stores.availableTargetIds),
      lastChosenTargetId: get(stores.lastChosenTargetId),
      isEscaping: get(stores.isEscaping),
      escapeObstacles: get(stores.escapeObstacles),
      escapeObstacleIndex: get(stores.escapeObstacleIndex),
      downtimeActionsLeft: get(stores.downtimeActionsLeft),
      shopOptions: get(stores.shopOptions),
      gameResult: get(stores.gameResult),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadSavedGame(stores) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) {
      clearSave();
      return false;
    }

    const { runnerId, difficultyId, ...playerRest } = data.player;
    const runner = runnerId ? (RUNNERS[runnerId] ?? null) : null;
    const difficulty = difficultyId ? (DIFFICULTIES[difficultyId] ?? null) : null;
    const currentTargetObj = data.currentTargetId
      ? (TARGET_TEMPLATES.find(t => t.id === data.currentTargetId) ?? null)
      : null;

    stores.gamePhase.set(data.gamePhase);
    stores.runNumber.set(data.runNumber ?? 1);
    stores.player.set({ ...playerRest, runner, difficulty });
    stores.deck.set(data.deck ?? []);
    stores.hand.set(data.hand ?? []);
    stores.discardPile.set(data.discardPile ?? []);
    stores.currentTarget.set(currentTargetObj);
    stores.runObstacles.set(data.runObstacles ?? []);
    stores.obstacleIndex.set(data.obstacleIndex ?? 0);
    stores.runCash.set(data.runCash ?? 0);
    stores.runSecrets.set(data.runSecrets ?? 0);
    stores.runEndReason.set(data.runEndReason ?? null);
    stores.playedCards.set(data.playedCards ?? []);
    stores.dataPool.set(data.dataPool ?? 0);
    stores.satisfiedSkills.set(data.satisfiedSkills ?? []);
    stores.pendingMultiplier.set(data.pendingMultiplier ?? null);
    stores.mustDiscardCount.set(data.mustDiscardCount ?? 0);
    stores.availableTargetIds.set(data.availableTargetIds ?? []);
    stores.lastChosenTargetId.set(data.lastChosenTargetId ?? null);
    stores.isEscaping.set(data.isEscaping ?? false);
    stores.escapeObstacles.set(data.escapeObstacles ?? []);
    stores.escapeObstacleIndex.set(data.escapeObstacleIndex ?? 0);
    stores.downtimeActionsLeft.set(data.downtimeActionsLeft ?? 0);
    stores.shopOptions.set(data.shopOptions ?? []);
    stores.gameResult.set(data.gameResult ?? null);

    // Reseed ID counters so new cards don't collide with restored ones
    const allCards = [
      ...(data.deck ?? []),
      ...(data.hand ?? []),
      ...(data.discardPile ?? []),
      ...(data.playedCards ?? []),
    ];
    const maxId = allCards.reduce((m, c) => Math.max(m, typeof c.id === 'number' ? c.id : 0), 0);
    resetCardIds(maxId + 1);

    const allObsIds = [
      ...(data.runObstacles ?? []),
      ...(data.escapeObstacles ?? []),
    ].map(o => o?.id ?? 0).filter(n => typeof n === 'number');
    const maxObsId = allObsIds.length > 0 ? Math.max(...allObsIds) : 0;
    resetObstacleIds(maxObsId + 1);

    return true;
  } catch {
    clearSave();
    return false;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function initAutoSave(stores) {
  let timer = null;

  function scheduleSave() {
    clearTimeout(timer);
    timer = setTimeout(() => saveGame(stores), 500);
  }

  const toWatch = [
    stores.gamePhase,
    stores.runNumber,
    stores.player,
    stores.deck,
    stores.hand,
    stores.discardPile,
    stores.currentTarget,
    stores.runObstacles,
    stores.obstacleIndex,
    stores.runCash,
    stores.runSecrets,
    stores.runEndReason,
    stores.playedCards,
    stores.dataPool,
    stores.satisfiedSkills,
    stores.pendingMultiplier,
    stores.mustDiscardCount,
    stores.availableTargetIds,
    stores.lastChosenTargetId,
    stores.isEscaping,
    stores.escapeObstacles,
    stores.escapeObstacleIndex,
    stores.downtimeActionsLeft,
    stores.shopOptions,
    stores.gameResult,
  ];

  const unsubs = toWatch.map(s => s.subscribe(scheduleSave));
  return () => {
    unsubs.forEach(u => u());
    clearTimeout(timer);
  };
}
