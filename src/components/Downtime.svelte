<script>
  import { player, runNumber, downtimeActionsLeft, downtimeRest, downtimeOpenShop } from '../lib/gameState.js';
  import { CONFIG } from '../lib/constants.js';

  $: actionsLeft = $downtimeActionsLeft;
  $: runDone = $runNumber;
</script>

<div class="downtime">
  <div class="dt-header">
    <h2>DOWNTIME</h2>
    <div class="dt-sub">Between runs. Catch your breath.</div>
  </div>

  <div class="status-summary">
    <div class="stat-row">
      <span class="stat-label">Heat</span>
      <span class="stat-val heat">{$player.heat} / {$player.runner?.maxHeat}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Fatigue</span>
      <span class="stat-val fat">{$player.fatigue} / {$player.runner?.maxFatigue}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Cash</span>
      <span class="stat-val cash">{$player.cash}¢</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Secrets</span>
      <span class="stat-val secrets">{$player.secrets}◆</span>
    </div>
  </div>

  <div class="actions-left">
    <span>{actionsLeft} action{actionsLeft !== 1 ? 's' : ''} remaining</span>
  </div>

  {#if actionsLeft > 0}
    <div class="choices">
      <button class="choice-btn rest" on:click={downtimeRest}>
        <div class="choice-title">Rest</div>
        <div class="choice-desc">Lose {CONFIG.restHeatReduction} additional Heat and {CONFIG.restFatigueReduction} additional Fatigue.</div>
        <div class="choice-detail">
          Heat: {$player.heat} → {Math.max(0, $player.heat - CONFIG.restHeatReduction)}
          &nbsp;&nbsp;
          Fatigue: {$player.fatigue} → {Math.max(0, $player.fatigue - CONFIG.restFatigueReduction)}
        </div>
      </button>

      <button class="choice-btn shop" on:click={downtimeOpenShop}>
        <div class="choice-title">Shop</div>
        <div class="choice-desc">Browse 3 options: new cards, upgrades, or card removal. Spend Cash.</div>
        <div class="choice-detail">You have {$player.cash}¢ to spend.</div>
      </button>
    </div>
  {:else}
    <div class="done-note">Actions complete. Proceeding to next run...</div>
  {/if}

  <div class="upgrades-summary">
    {#if $player.upgrades?.length > 0}
      <div class="upg-header">Installed upgrades:</div>
      {#each $player.upgrades as upg}
        <div class="upg-row">
          <span class="upg-name">{upg.name}</span>
          <span class="upg-desc">{upg.description}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .downtime { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.5rem 0; }

  .dt-header { display: flex; flex-direction: column; gap: 0.25rem; }
  h2 { font-family: 'Share Tech Mono', monospace; font-size: 1.2rem; color: #00f5ff; letter-spacing: 0.1em; }
  .dt-sub { font-size: 0.82rem; color: #445; }

  .status-summary {
    display: flex; flex-wrap: wrap; gap: 1rem;
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 0.85rem 1rem;
  }
  .stat-row { display: flex; flex-direction: column; gap: 0.15rem; }
  .stat-label { font-size: 0.65rem; color: #445; letter-spacing: 0.08em; text-transform: uppercase; }
  .stat-val { font-family: 'Share Tech Mono', monospace; font-size: 0.95rem; font-weight: 700; }
  .heat { color: #ff7043; }
  .fat { color: #7b8ec8; }
  .cash { color: #f1c40f; }
  .secrets { color: #bd93f9; }

  .actions-left { font-size: 0.8rem; color: #556; }

  .choices { display: flex; flex-direction: column; gap: 0.75rem; }

  .choice-btn {
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 1rem 1.25rem;
    text-align: left; cursor: pointer; color: inherit;
    display: flex; flex-direction: column; gap: 0.35rem;
    transition: border-color 0.15s, background 0.15s;
  }

  .choice-btn:hover { border-color: #335; background: #0d1a28; }
  .choice-btn.rest:hover { border-color: #7b8ec8; }
  .choice-btn.shop:hover { border-color: #f1c40f; }

  .choice-title { font-size: 1rem; font-weight: 700; color: #c8d0e0; }
  .choice-desc { font-size: 0.85rem; color: #778; line-height: 1.4; }
  .choice-detail { font-size: 0.75rem; font-family: 'Share Tech Mono', monospace; color: #445; margin-top: 0.15rem; }

  .done-note { font-size: 0.85rem; color: #445; font-style: italic; }

  .upgrades-summary { display: flex; flex-direction: column; gap: 0.4rem; }
  .upg-header { font-size: 0.7rem; color: #445; letter-spacing: 0.08em; text-transform: uppercase; }
  .upg-row { display: flex; gap: 0.75rem; align-items: baseline; }
  .upg-name { font-size: 0.82rem; color: #8899bb; font-weight: 600; }
  .upg-desc { font-size: 0.78rem; color: #445; }
</style>
