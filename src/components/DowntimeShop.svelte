<script>
  import {
    player, shopOptions, shopBuying,
    buyShopOption, returnFromShop,
    confirmCardRemoval, cancelCardRemoval,
  } from '../lib/gameState.js';
  import { STARTING_DECK_IDS } from '../lib/cards.js';
  import { CONFIG } from '../lib/constants.js';

  $: buying = $shopBuying;
  $: canAfford = (cost) => $player.cash >= cost;

  // Build card list for removal selection
  $: removalCards = (() => {
    if (!buying) return [];
    const p = $player;
    const removed = new Set(p.removedStartingCards ?? []);
    const starting = STARTING_DECK_IDS.filter(id => !removed.has(id));

    if (buying.type === 'remove') {
      // Non-starting cards only
      return (p.extraCards ?? []).map(defId => ({ defId, isStarting: false }));
    } else if (buying.type === 'purge') {
      // All cards except ghost_protocol
      const startingCards = starting
        .filter(id => id !== 'ghost_protocol')
        .map(defId => ({ defId, isStarting: true }));
      const extraCards = (p.extraCards ?? []).map(defId => ({ defId, isStarting: false }));
      return [...startingCards, ...extraCards];
    }
    return [];
  })();

  import { CARD_DEFS, describeEffects } from '../lib/cards.js';

  function cardLabel(defId) {
    const def = CARD_DEFS[defId];
    if (!def) return defId;
    if (def.isMultiplier) return `${def.name} (×${def.multiplierFactor})`;
    if (def.options) return `${def.name} (${def.options.map(o => o.label).join(' / ')})`;
    return `${def.name} (${describeEffects(def.effects)})`;
  }
</script>

<div class="shop">
  <div class="shop-header">
    <h2>SHOP</h2>
    <div class="budget">Budget: <span class="cash">{$player.cash}¢</span></div>
  </div>

  {#if buying}
    <!-- Card removal selection UI -->
    <div class="removal-ui">
      <div class="removal-title">{buying.name}</div>
      <div class="removal-desc">{buying.description}</div>
      <div class="removal-cost">Cost: {buying.cost}¢</div>

      {#if removalCards.length === 0}
        <div class="no-cards">No eligible cards in your deck.</div>
      {:else}
        <div class="card-list">
          {#each removalCards as { defId, isStarting }}
            <button
              class="card-remove-btn"
              class:starting={isStarting}
              on:click={() => confirmCardRemoval(defId, buying)}
            >
              {cardLabel(defId)}
              {#if isStarting}<span class="starting-tag">Starting</span>{/if}
            </button>
          {/each}
        </div>
      {/if}

      <button class="cancel-btn" on:click={cancelCardRemoval}>Cancel</button>
    </div>
  {:else}
    <!-- Main shop options -->
    <div class="options">
      {#each $shopOptions as opt}
        <div class="option-card" class:cant-afford={!canAfford(opt.cost)}>
          <div class="opt-top">
            <div class="opt-type-badge" class:card={opt.type==='card'} class:upgrade={opt.type==='upgrade'} class:remove={opt.type==='remove'||opt.type==='purge'}>
              {opt.type === 'card' ? 'CARD' : opt.type === 'upgrade' ? 'UPGRADE' : 'SERVICE'}
            </div>
            <div class="opt-cost" class:unaffordable={!canAfford(opt.cost)}>{opt.cost}¢</div>
          </div>
          <div class="opt-name">{opt.name}</div>
          <div class="opt-desc">{opt.description}</div>
          {#if opt.flavor}
            <div class="opt-flavor">"{opt.flavor}"</div>
          {/if}
          <button
            class="buy-btn"
            disabled={!canAfford(opt.cost)}
            on:click={() => buyShopOption(opt)}
          >
            {canAfford(opt.cost) ? 'BUY' : 'INSUFFICIENT FUNDS'}
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <button class="leave-btn" on:click={returnFromShop}>
    LEAVE SHOP
  </button>
</div>

<style>
  .shop { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.5rem 0; }

  .shop-header { display: flex; align-items: baseline; gap: 1rem; }
  h2 { font-family: 'Share Tech Mono', monospace; font-size: 1.2rem; color: #f1c40f; letter-spacing: 0.1em; }
  .budget { font-size: 0.85rem; color: #667; }
  .cash { color: #f1c40f; font-weight: 700; }

  .options { display: flex; flex-direction: column; gap: 0.85rem; }

  .option-card {
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 1rem 1.25rem;
    display: flex; flex-direction: column; gap: 0.5rem;
    transition: border-color 0.15s;
  }
  .option-card:not(.cant-afford):hover { border-color: #f1c40f44; }
  .option-card.cant-afford { opacity: 0.55; }

  .opt-top { display: flex; justify-content: space-between; align-items: center; }

  .opt-type-badge {
    font-size: 0.62rem; font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.1em; padding: 0.1rem 0.5rem; border-radius: 3px;
    border: 1px solid;
  }
  .opt-type-badge.card    { color: #00f5ff; border-color: #00f5ff44; background: #00f5ff11; }
  .opt-type-badge.upgrade { color: #ff79c6; border-color: #ff79c644; background: #ff79c611; }
  .opt-type-badge.remove  { color: #ff9580; border-color: #ff958044; background: #ff958011; }

  .opt-cost { font-family: 'Share Tech Mono', monospace; font-size: 0.9rem; color: #f1c40f; font-weight: 700; }
  .opt-cost.unaffordable { color: #555; }

  .opt-name { font-size: 0.95rem; font-weight: 700; color: #c8d0e0; }
  .opt-desc { font-size: 0.82rem; color: #778; line-height: 1.4; }
  .opt-flavor { font-size: 0.72rem; color: #445; font-style: italic; }

  .buy-btn {
    align-self: flex-start;
    padding: 0.4rem 1.2rem;
    background: transparent; border: 1px solid #f1c40f;
    color: #f1c40f; font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem; letter-spacing: 0.08em;
    cursor: pointer; transition: background 0.12s;
    border-radius: 3px;
  }
  .buy-btn:hover:not(:disabled) { background: #f1c40f22; }
  .buy-btn:disabled { border-color: #333; color: #445; cursor: default; }

  /* Card removal UI */
  .removal-ui {
    background: #0c1520; border: 1px solid #ff9580;
    border-radius: 6px; padding: 1rem 1.25rem;
    display: flex; flex-direction: column; gap: 0.75rem;
  }
  .removal-title { font-size: 0.95rem; font-weight: 700; color: #ff9580; }
  .removal-desc { font-size: 0.82rem; color: #778; }
  .removal-cost { font-size: 0.78rem; font-family: 'Share Tech Mono', monospace; color: #f1c40f; }
  .no-cards { font-size: 0.82rem; color: #445; font-style: italic; }

  .card-list { display: flex; flex-direction: column; gap: 0.4rem; max-height: 300px; overflow-y: auto; }

  .card-remove-btn {
    background: #0a1018; border: 1px solid #1e3050;
    border-radius: 4px; padding: 0.5rem 0.75rem;
    text-align: left; cursor: pointer; color: #889;
    font-size: 0.82rem; transition: border-color 0.12s;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .card-remove-btn:hover { border-color: #ff9580; color: #c8d0e0; }
  .card-remove-btn.starting { color: #778; }

  .starting-tag {
    font-size: 0.65rem; font-family: 'Share Tech Mono', monospace;
    color: #556; border: 1px solid #334; padding: 0.05rem 0.3rem; border-radius: 3px;
    margin-left: auto;
  }

  .cancel-btn {
    align-self: flex-start; background: none; border: 1px solid #334;
    border-radius: 3px; color: #556; font-size: 0.78rem; padding: 0.3rem 0.75rem;
    cursor: pointer;
  }
  .cancel-btn:hover { color: #778; border-color: #556; }

  .leave-btn {
    align-self: flex-start;
    padding: 0.65rem 1.75rem; background: transparent;
    border: 1px solid #334; color: #556;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem; letter-spacing: 0.08em;
    cursor: pointer; transition: border-color 0.12s;
    border-radius: 4px;
  }
  .leave-btn:hover { border-color: #557; color: #778; }
</style>
