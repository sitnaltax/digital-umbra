<script>
  import { runCash, runSecrets, runEndReason, player, runNumber, acceptRunResult } from '../lib/gameState.js';
  import { CONFIG } from '../lib/constants.js';

  const REASON_LABELS = {
    escaped:     { label: 'CLEAN ESCAPE', color: '#50fa7b' },
    fatigue:     { label: 'BURNOUT', color: '#7b8ec8' },
    heat_burned: { label: 'ID BURNED', color: '#f1c40f' },
    captured:    { label: 'CAPTURED', color: '#ff5555' },
  };

  $: reason = REASON_LABELS[$runEndReason] ?? { label: 'RUN COMPLETE', color: '#c8d0e0' };
  $: isHalved = $runEndReason === 'fatigue' || $runEndReason === 'captured';
  $: isFinalRun = $runNumber === CONFIG.totalRuns;
</script>

<div class="run-result">
  <div class="result-badge" style="color: {reason.color}; border-color: {reason.color}44">
    {reason.label}
  </div>

  {#if isHalved}
    <div class="penalty-note">Rewards halved due to {$runEndReason === 'fatigue' ? 'burnout' : 'capture'}.</div>
  {/if}

  {#if isFinalRun}
    <div class="final-note">Final run — rewards doubled.</div>
  {/if}

  <div class="rewards">
    <div class="reward-row">
      <span class="rw-label">Cash earned</span>
      <span class="rw-val cash">+{$runCash}¢</span>
    </div>
    <div class="reward-row">
      <span class="rw-label">Secrets earned</span>
      <span class="rw-val secrets">+{$runSecrets}◆</span>
    </div>
    <div class="reward-divider"/>
    <div class="reward-row">
      <span class="rw-label">Total Cash (after)</span>
      <span class="rw-val cash">{$player.cash + $runCash}¢</span>
    </div>
    <div class="reward-row">
      <span class="rw-label">Total Secrets (after)</span>
      <span class="rw-val secrets">{$player.secrets + $runSecrets}◆</span>
    </div>
  </div>

  {#if $runNumber < CONFIG.totalRuns}
    <div class="next-note">
      Run {$runNumber} complete. {CONFIG.totalRuns - $runNumber} run{CONFIG.totalRuns - $runNumber !== 1 ? 's' : ''} remaining.
    </div>
  {:else}
    <div class="next-note final">This was the final run. Tallying results...</div>
  {/if}

  <button class="continue-btn" on:click={acceptRunResult}>
    {$runNumber < CONFIG.totalRuns ? 'PROCEED TO DOWNTIME' : 'SEE FINAL RESULTS'}
  </button>
</div>

<style>
  .run-result { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.5rem 0; max-width: 480px; }

  .result-badge {
    display: inline-block;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.1rem;
    letter-spacing: 0.12em;
    padding: 0.4rem 1rem;
    border: 2px solid;
    border-radius: 4px;
    align-self: flex-start;
  }

  .penalty-note { font-size: 0.82rem; color: #7b8ec8; font-style: italic; }
  .final-note { font-size: 0.82rem; color: #f1c40f; font-style: italic; }

  .rewards {
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 1rem 1.25rem;
    display: flex; flex-direction: column; gap: 0.6rem;
  }

  .reward-row { display: flex; justify-content: space-between; align-items: center; }
  .rw-label { font-size: 0.82rem; color: #667; }
  .rw-val { font-size: 1rem; font-weight: 700; font-family: 'Share Tech Mono', monospace; }
  .rw-val.cash { color: #f1c40f; }
  .rw-val.secrets { color: #bd93f9; }
  .reward-divider { height: 1px; background: #1e3050; margin: 0.25rem 0; }

  .next-note { font-size: 0.82rem; color: #556; }
  .next-note.final { color: #bd93f9; }

  .continue-btn {
    align-self: flex-start;
    padding: 0.75rem 2rem;
    background: transparent; border: 2px solid #00f5ff;
    color: #00f5ff; font-family: 'Share Tech Mono', monospace;
    font-size: 0.85rem; letter-spacing: 0.1em;
    cursor: pointer; transition: background 0.12s;
  }
  .continue-btn:hover { background: rgba(0,245,255,0.1); }
</style>
