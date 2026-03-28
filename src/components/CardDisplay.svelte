<script>
  import { SKILL_COLORS, CATEGORY_COLORS, SKILL_LABELS } from '../lib/constants.js';
  import { describeEffects } from '../lib/cards.js';

  export let card;
  export let selected = false;   // multiplier selection mode — this card is the active multiplier
  export let targeted = false;   // multiplier mode — this card is a valid target
  export let dimmed = false;     // not a valid target in multiplier mode
  export let onPlay = null;      // (cardId, optionIndex) => void
  export let compact = false;

  let showOptions = false;
  let chosenOption = null;

  function handleClick() {
    if (dimmed) return;
    if (card.isMultiplier) {
      if (selected) {
        // Cancel multiplier
        onPlay?.(card.id, null);
      } else {
        onPlay?.(card.id, null);
      }
      return;
    }
    if (targeted) {
      onPlay?.(card.id, null);
      return;
    }
    if (card.options) {
      showOptions = !showOptions;
    } else {
      onPlay?.(card.id, null);
    }
  }

  function pickOption(idx) {
    showOptions = false;
    onPlay?.(card.id, idx);
  }

  function effectColor(eff) {
    if (eff.type === 'skill') return SKILL_COLORS[eff.skill] ?? '#aaa';
    if (eff.type === 'skill_category') return CATEGORY_COLORS[eff.category] ?? '#aaa';
    if (eff.type === 'data') return '#00f5ff';
    if (eff.type === 'expertise') return '#ff79c6';
    if (eff.type === 'draw') return '#50fa7b';
    if (eff.type === 'heat') return eff.amount > 0 ? '#ff5555' : '#44aa88';
    if (eff.type === 'fatigue') return eff.amount > 0 ? '#7b8ec8' : '#44aa88';
    return '#aaa';
  }

  function effectLabel(eff) {
    switch (eff.type) {
      case 'data': return `${eff.amount} DATA`;
      case 'skill': return SKILL_LABELS[eff.skill]?.toUpperCase() ?? eff.skill.toUpperCase();
      case 'skill_category': return `ANY ${eff.category.toUpperCase()}`;
      case 'expertise': return `${eff.amount} EXP`;
      case 'draw': return `DRAW ${eff.amount}`;
      case 'heat': return eff.amount > 0 ? `+${eff.amount} HEAT` : `${eff.amount} HEAT`;
      case 'fatigue': return eff.amount > 0 ? `+${eff.amount} FAT` : `${eff.amount} FAT`;
      default: return eff.type.toUpperCase();
    }
  }
</script>

<div
  class="card"
  class:selected
  class:targeted
  class:dimmed
  class:compact
  class:immediate={card.mustPlayImmediately}
  class:multiplier={card.isMultiplier}
  on:click={handleClick}
  role="button"
  tabindex={dimmed ? -1 : 0}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
  <div class="card-name">
    {card.name}
    {#if !card.canRemove}
      <span class="locked" title="Cannot be removed">🔒</span>
    {/if}
    {#if card.mustPlayImmediately}
      <span class="imm-badge">AUTO</span>
    {/if}
  </div>

  {#if card.isMultiplier}
    <div class="mult-display">×{card.multiplierFactor}</div>
    <div class="mult-label">Multiplier</div>
    {#if selected}
      <div class="mult-hint">Select a data card to multiply</div>
    {/if}
  {:else if card.options}
    <div class="options-preview">
      {#each card.options as opt, i}
        <div class="opt-row">
          <span class="opt-letter">{i === 0 ? 'A' : 'B'}</span>
          <span>{opt.label}</span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="effects">
      {#each card.effects as eff}
        <span class="eff-pill" style="color: {effectColor(eff)}; border-color: {effectColor(eff)}33">
          {effectLabel(eff)}
        </span>
      {/each}
    </div>
  {/if}

  {#if !compact}
    <div class="flavor">{card.flavor}</div>
  {/if}
</div>

{#if showOptions && card.options}
  <div class="option-picker">
    <div class="opt-header">Choose effect:</div>
    {#each card.options as opt, i}
      <button class="opt-btn" on:click={() => pickOption(i)}>
        <span class="opt-label">{opt.label}</span>
        <div class="opt-effects">
          {#each opt.effects as eff}
            <span class="eff-pill small" style="color: {effectColor(eff)}; border-color: {effectColor(eff)}33">
              {effectLabel(eff)}
            </span>
          {/each}
        </div>
      </button>
    {/each}
    <button class="opt-cancel" on:click={() => showOptions = false}>Cancel</button>
  </div>
{/if}

<style>
  .card {
    background: #0f1824;
    border: 1px solid #1e3050;
    border-radius: 6px;
    padding: 0.75rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    transition: border-color 0.12s, background 0.12s, transform 0.1s;
    min-width: 120px;
    max-width: 160px;
    flex-shrink: 0;
    position: relative;
    user-select: none;
  }

  .card.compact { min-width: 100px; max-width: 130px; padding: 0.5rem; }
  .card:hover:not(.dimmed) { border-color: #00f5ff44; background: #131f30; }
  .card.targeted { border-color: #00f5ff; box-shadow: 0 0 10px rgba(0,245,255,0.25); }
  .card.selected { border-color: #ff79c6; box-shadow: 0 0 10px rgba(255,121,198,0.25); }
  .card.dimmed { opacity: 0.35; cursor: default; }
  .card.immediate { border-color: #ff555544; }
  .card.multiplier { border-color: #ff79c644; }

  .card-name {
    font-size: 0.78rem;
    font-weight: 700;
    color: #c8d0e0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .locked { font-size: 0.65rem; }

  .imm-badge {
    font-size: 0.6rem;
    background: #ff555522;
    border: 1px solid #ff5555;
    color: #ff5555;
    padding: 0 0.3rem;
    border-radius: 3px;
  }

  .mult-display {
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.5rem;
    color: #ff79c6;
    text-align: center;
    font-weight: 700;
  }

  .mult-label {
    font-size: 0.65rem;
    color: #667;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .mult-hint {
    font-size: 0.65rem;
    color: #00f5ff;
    text-align: center;
    font-style: italic;
  }

  .effects {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .eff-pill {
    font-size: 0.65rem;
    font-family: 'Share Tech Mono', monospace;
    border: 1px solid;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    letter-spacing: 0.04em;
  }

  .eff-pill.small { font-size: 0.6rem; }

  .options-preview {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .opt-row {
    display: flex;
    gap: 0.35rem;
    font-size: 0.7rem;
    color: #889;
  }

  .opt-letter {
    color: #00f5ff;
    font-family: 'Share Tech Mono', monospace;
    font-weight: 700;
  }

  .flavor {
    font-size: 0.65rem;
    color: #445;
    font-style: italic;
    line-height: 1.3;
  }

  /* Option picker overlay */
  .option-picker {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #0f1824;
    border: 1px solid #00f5ff;
    border-radius: 6px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 20;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .opt-header {
    font-size: 0.7rem;
    color: #556;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .opt-btn {
    background: #131f30;
    border: 1px solid #1e3050;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
    text-align: left;
    color: inherit;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: border-color 0.1s;
  }

  .opt-btn:hover { border-color: #00f5ff; }

  .opt-label {
    font-size: 0.8rem;
    color: #c8d0e0;
    font-weight: 600;
  }

  .opt-effects { display: flex; flex-wrap: wrap; gap: 0.2rem; }

  .opt-cancel {
    background: none;
    border: none;
    color: #445;
    font-size: 0.7rem;
    cursor: pointer;
    text-align: center;
    padding: 0.2rem;
  }

  .opt-cancel:hover { color: #778; }
</style>
