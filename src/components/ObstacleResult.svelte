<script>
  import {
    player, runNumber, runCash, runSecrets,
    runObstacles, obstacleIndex, hand,
    continueRun, beginEscape, activateGhostMode,
  } from '../lib/gameState.js';
  import { CONFIG } from '../lib/constants.js';

  $: hasMore = $obstacleIndex + 1 < $runObstacles.length;
  $: isFinalRun = $runNumber === CONFIG.totalRuns;
  $: ghostUsesLeft = $player.abilityUses?.ghost_mode ?? 0;
</script>

<div class="result-view">
  <div class="cleared">
    <div class="cleared-icon">✓</div>
    <div class="cleared-text">OBSTACLE CLEARED</div>
  </div>

  <div class="rewards-so-far">
    <div class="rw-label">Earned this run so far:</div>
    <div class="rw-values">
      <span class="cash">{$runCash}¢ Cash</span>
      <span class="secrets">{$runSecrets}◆ Secrets</span>
    </div>
  </div>

  <div class="hand-note">
    <span class="hand-count">{$hand.length} card{$hand.length !== 1 ? 's' : ''} in hand</span>
    <span class="hand-sub">Cards carry over to the next obstacle. You've drawn 1 free card.</span>
  </div>

  {#if ghostUsesLeft > 0}
    <div class="ability-box">
      <div class="ab-name">Ghost Mode available</div>
      <div class="ab-desc">Draw 2 extra cards now (uses 1 of {ghostUsesLeft} remaining this run)</div>
      <button class="btn ghost" on:click={activateGhostMode}>Activate Ghost Mode</button>
    </div>
  {/if}

  <div class="decision">
    <div class="decision-label">What next?</div>
    <div class="decision-btns">
      {#if hasMore}
        <button class="btn primary" on:click={continueRun}>
          Go Deeper
          <span class="btn-sub">Obstacle {$obstacleIndex + 2} of {$runObstacles.length}</span>
        </button>
      {/if}
      <button class="btn escape" on:click={beginEscape}>
        Begin Escape
        <span class="btn-sub">Secure your haul</span>
      </button>
    </div>

    {#if !hasMore}
      <div class="max-depth-note">
        You've reached maximum depth. You must escape.
      </div>
    {/if}
  </div>
</div>

<style>
  .result-view {
    display: flex; flex-direction: column;
    gap: 1.5rem; padding: 1.5rem 0;
    max-width: 560px;
  }

  .cleared {
    display: flex; align-items: center; gap: 0.75rem;
  }

  .cleared-icon {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #50fa7b22; border: 2px solid #50fa7b;
    color: #50fa7b;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem; font-weight: 700;
  }

  .cleared-text {
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.1rem;
    color: #50fa7b;
    letter-spacing: 0.1em;
  }

  .rewards-so-far {
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 0.85rem 1rem;
  }

  .rw-label { font-size: 0.7rem; color: #445; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.4rem; }
  .rw-values { display: flex; gap: 1.5rem; }
  .cash { color: #f1c40f; font-family: 'Share Tech Mono', monospace; font-size: 1.1rem; font-weight: 700; }
  .secrets { color: #bd93f9; font-family: 'Share Tech Mono', monospace; font-size: 1.1rem; font-weight: 700; }

  .hand-note {
    display: flex; flex-direction: column; gap: 0.2rem;
    font-size: 0.82rem;
  }
  .hand-count { color: #c8d0e0; font-weight: 600; }
  .hand-sub { color: #556; }

  .ability-box {
    background: #120820; border: 1px solid #ff79c644;
    border-radius: 6px; padding: 0.85rem 1rem;
    display: flex; flex-direction: column; gap: 0.5rem;
  }
  .ab-name { font-size: 0.85rem; font-weight: 700; color: #ff79c6; }
  .ab-desc { font-size: 0.8rem; color: #778; }

  .decision { display: flex; flex-direction: column; gap: 0.75rem; }
  .decision-label { font-size: 0.7rem; color: #445; letter-spacing: 0.08em; text-transform: uppercase; }
  .decision-btns { display: flex; gap: 1rem; flex-wrap: wrap; }

  .btn {
    padding: 0.75rem 1.5rem; border-radius: 4px;
    font-size: 0.85rem; font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.06em; cursor: pointer; border: 1px solid;
    display: flex; flex-direction: column; align-items: flex-start;
    transition: background 0.12s;
  }

  .btn.primary { background: #0d2010; border-color: #50fa7b; color: #50fa7b; }
  .btn.primary:hover { background: #50fa7b22; }
  .btn.escape { background: #0d0d20; border-color: #8899cc; color: #8899cc; }
  .btn.escape:hover { background: #8899cc22; }
  .btn.ghost { background: #1a082a; border-color: #ff79c6; color: #ff79c6; padding: 0.5rem 1rem; font-size: 0.8rem; flex-direction: row; align-items: center; }
  .btn.ghost:hover { background: #ff79c622; }

  .btn-sub {
    font-size: 0.65rem; color: inherit; opacity: 0.6;
    letter-spacing: 0.04em; margin-top: 0.15rem;
  }

  .max-depth-note { font-size: 0.8rem; color: #667; font-style: italic; }
</style>
