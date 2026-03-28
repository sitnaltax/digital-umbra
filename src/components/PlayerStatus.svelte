<script>
  import { player, runNumber, runCash, runSecrets } from '../lib/gameState.js';
  import { CONFIG } from '../lib/constants.js';

  $: heat = $player.heat ?? 0;
  $: fatigue = $player.fatigue ?? 0;
  $: maxHeat = $player.runner?.maxHeat ?? 10;
  $: maxFatigue = $player.runner?.maxFatigue ?? 10;
  $: heatPct = (heat / maxHeat) * 100;
  $: fatiguePct = (fatigue / maxFatigue) * 100;
  $: heatThreshold = CONFIG.heatBonusThreshold(maxHeat);
  $: heatDanger = heat >= heatThreshold;
</script>

<header>
  <div class="run-info">
    <span class="label">RUN</span>
    <span class="run-num">{$runNumber}/{CONFIG.totalRuns}</span>
    {#if $runNumber === CONFIG.totalRuns}
      <span class="final-badge">FINAL</span>
    {/if}
  </div>

  <div class="resources">
    <div class="res">
      <span class="label">CASH</span>
      <span class="val cash">{$player.cash}¢</span>
    </div>
    <div class="res">
      <span class="label">SECRETS</span>
      <span class="val secrets">{$player.secrets}</span>
    </div>
    {#if $player.burnerIds > 0}
      <div class="res">
        <span class="label">IDs</span>
        <span class="val ids">{$player.burnerIds}</span>
      </div>
    {:else}
      <div class="res danger">
        <span class="label">IDs</span>
        <span class="val ids-empty">NONE</span>
      </div>
    {/if}
  </div>

  <div class="bars">
    <div class="bar-group">
      <span class="bar-label" class:danger={heatDanger}>
        HEAT {heat}/{maxHeat}
        {#if heatDanger}<span class="bonus-note">+hand</span>{/if}
      </span>
      <div class="bar heat-bar">
        <div
          class="fill heat-fill"
          style="width: {heatPct}%"
          class:danger={heatDanger}
          class:critical={heat >= maxHeat - 1}
        />
        <div
          class="threshold-marker"
          style="left: {(heatThreshold / maxHeat) * 100}%"
        />
      </div>
    </div>

    <div class="bar-group">
      <span class="bar-label">FATIGUE {fatigue}/{maxFatigue}</span>
      <div class="bar fatigue-bar">
        <div
          class="fill fatigue-fill"
          style="width: {fatiguePct}%"
          class:critical={fatigue >= maxFatigue - 1}
        />
      </div>
    </div>
  </div>

  {#if $player.upgrades?.length > 0}
    <div class="upgrades">
      {#each $player.upgrades as upg}
        <span class="upg-badge" title={upg.description}>{upg.name}</span>
      {/each}
    </div>
  {/if}
</header>

<style>
  header {
    background: #080d14;
    border-bottom: 1px solid #1a2a3a;
    padding: 0.6rem 0;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    font-size: 0.8rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .label {
    font-size: 0.65rem;
    color: #445;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: block;
  }

  .run-info {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  .run-num {
    font-family: 'Share Tech Mono', monospace;
    font-size: 1rem;
    color: #c8d0e0;
    font-weight: 700;
  }

  .final-badge {
    font-size: 0.65rem;
    background: #ff5555;
    color: #000;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .resources {
    display: flex;
    gap: 1rem;
  }

  .res {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .res.danger .val { color: #ff5555; }

  .val {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.95rem;
    font-weight: 700;
  }

  .cash    { color: #f1c40f; }
  .secrets { color: #bd93f9; }
  .ids     { color: #50fa7b; }
  .ids-empty { color: #ff5555; }

  .bars {
    display: flex;
    gap: 1rem;
    flex: 1;
    min-width: 200px;
  }

  .bar-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .bar-label {
    font-size: 0.65rem;
    color: #556;
    letter-spacing: 0.06em;
    font-family: 'Share Tech Mono', monospace;
  }

  .bar-label.danger { color: #ff9980; }

  .bar {
    height: 8px;
    background: #1a2030;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .heat-fill { background: #ff7043; }
  .heat-fill.danger { background: #ff5555; }
  .heat-fill.critical { background: #ff0000; box-shadow: 0 0 6px #ff0000; }

  .fatigue-fill { background: #7b8ec8; }
  .fatigue-fill.critical { background: #4455ff; box-shadow: 0 0 6px #4455ff; }

  .threshold-marker {
    position: absolute;
    top: 0;
    width: 2px;
    height: 100%;
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-50%);
  }

  .bonus-note {
    font-size: 0.6rem;
    color: #00f5ff;
    margin-left: 0.25rem;
  }

  .upgrades {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .upg-badge {
    font-size: 0.65rem;
    background: #1a1a3a;
    border: 1px solid #334466;
    color: #8899bb;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    cursor: default;
  }
</style>
