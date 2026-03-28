<script>
  import {
    hand, deck, discardPile,
    dataPool, satisfiedSkills, pendingMultiplier,
    mustDiscardCount, runObstacles, obstacleIndex,
    runCash, runSecrets, player,
    playCard, cancelMultiplier, discardCard,
    drawForFatigue, rerandomizeObstacle,
    passObstacle, beginEscape,
  } from '../lib/gameState.js';
  import { checkObstacleSatisfied } from '../lib/targets.js';
  import { SKILL_LABELS, CATEGORY_LABELS, SKILL_COLORS, CATEGORY_COLORS, SKILL_CATEGORY } from '../lib/constants.js';
  import CardDisplay from './CardDisplay.svelte';

  $: obs = $runObstacles[$obstacleIndex] ?? null;
  $: satisfied = obs ? checkObstacleSatisfied(obs, $dataPool, $satisfiedSkills) : { satisfied: false, via: null };
  $: mult = $pendingMultiplier;
  $: discarding = $mustDiscardCount > 0;

  function skillReqDisplay(req) {
    if (!req) return '';
    if (req.skill) return SKILL_LABELS[req.skill] ?? req.skill;
    if (req.category) return `Any ${CATEGORY_LABELS[req.category]} Skill`;
    return '';
  }

  function skillReqColor(req) {
    if (!req) return '#aaa';
    if (req.skill) return SKILL_COLORS[req.skill] ?? '#aaa';
    if (req.category) return CATEGORY_COLORS[req.category] ?? '#aaa';
    return '#aaa';
  }

  function isSkilSat(req) {
    if (!req) return false;
    const s = $satisfiedSkills;
    if (req.skill) return s.includes(req.skill);
    if (req.category) return s.some(sk => {
      if (sk.startsWith('__cat__')) return sk === `__cat__${req.category}`;
      return SKILL_CATEGORY[sk] === req.category;
    });
    return false;
  }

  function dataPct(req) {
    if (!req) return 0;
    return Math.min(100, ($dataPool / req) * 100);
  }

  function choiceOptMet(opt) {
    if (!opt) return false;
    const dataOk = opt.dataReq != null ? $dataPool >= opt.dataReq : true;
    const skillOk = opt.skillReq ? isSkilSat(opt.skillReq) : true;
    return dataOk && skillOk;
  }

  function cardIsDataCard(card) {
    if (card.isMultiplier) return false;
    if (card.effects?.some(e => e.type === 'data')) return true;
    if (card.options?.some(o => o.effects?.some(e => e.type === 'data'))) return true;
    return false;
  }

  function handleCardPlay(cardId, optionIndex) {
    if (discarding) {
      discardCard(cardId);
    } else {
      playCard(cardId, optionIndex);
    }
  }
</script>

<div class="obstacle-view">
  <div class="deck-info">
    <span>Deck: {$deck.length}</span>
    <span>Discard: {$discardPile.length}</span>
    <span>Hand limit: {$player.handLimit}</span>
  </div>

  {#if obs}
    <div class="obs-card" class:satisfied={satisfied.satisfied}>
      <div class="obs-header">
        <div>
          <div class="obs-name">{obs.name}</div>
          <div class="obs-desc">{obs.desc}</div>
        </div>
        <div class="obs-rewards">
          {#if obs.rewards?.cash > 0}<span class="reward cash">+{obs.rewards.cash}¢</span>{/if}
          {#if obs.rewards?.secrets > 0}<span class="reward secrets">+{obs.rewards.secrets}◆</span>{/if}
        </div>
      </div>

      <div class="obs-requirements">
        {#if obs.kind === 'data'}
          <div class="req" class:met={$dataPool >= obs.dataReq}>
            <span class="req-label">DATA</span>
            <span class="req-value">{$dataPool} / {obs.dataReq}</span>
            <div class="req-bar"><div class="req-fill data-fill" style="width:{dataPct(obs.dataReq)}%"/></div>
          </div>

        {:else if obs.kind === 'skill'}
          <div class="req" class:met={isSkilSat(obs.skillReq)}>
            <span class="req-label">SKILL</span>
            <span class="req-value" style="color:{skillReqColor(obs.skillReq)}">
              {skillReqDisplay(obs.skillReq)}
              {#if isSkilSat(obs.skillReq)}<span class="checkmark"> ✓</span>{/if}
            </span>
          </div>

        {:else if obs.kind === 'data_and_skill'}
          <div class="req" class:met={$dataPool >= obs.dataReq}>
            <span class="req-label">DATA</span>
            <span class="req-value">{$dataPool} / {obs.dataReq}</span>
            <div class="req-bar"><div class="req-fill data-fill" style="width:{dataPct(obs.dataReq)}%"/></div>
          </div>
          <div class="req" class:met={isSkilSat(obs.skillReq)}>
            <span class="req-label">SKILL</span>
            <span class="req-value" style="color:{skillReqColor(obs.skillReq)}">
              {skillReqDisplay(obs.skillReq)}
              {#if isSkilSat(obs.skillReq)}<span class="checkmark"> ✓</span>{/if}
            </span>
          </div>

        {:else if obs.kind === 'choice'}
          <div class="choice-row">
            <div class="choice-opt" class:met={choiceOptMet(obs.optA)}>
              <span class="opt-tag">A</span>
              <span class="opt-text">{obs.optA?.label ?? ''}</span>
              {#if obs.optA?.dataReq != null}
                <span class="opt-detail">{$dataPool}/{obs.optA.dataReq}</span>
              {/if}
              {#if obs.optA?.skillReq}
                <span class="opt-detail" style="color:{skillReqColor(obs.optA.skillReq)}">
                  {skillReqDisplay(obs.optA.skillReq)}
                </span>
              {/if}
            </div>
            <div class="choice-sep">OR</div>
            <div class="choice-opt" class:met={choiceOptMet(obs.optB)}>
              <span class="opt-tag">B</span>
              <span class="opt-text">{obs.optB?.label ?? ''}</span>
              {#if obs.optB?.dataReq != null}
                <span class="opt-detail">{$dataPool}/{obs.optB.dataReq}</span>
              {/if}
              {#if obs.optB?.skillReq}
                <span class="opt-detail" style="color:{skillReqColor(obs.optB.skillReq)}">
                  {skillReqDisplay(obs.optB.skillReq)}
                </span>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="no-obs">No obstacle data.</div>
  {/if}

  <div class="run-progress">
    <span class="prog-label">This run:</span>
    <span class="cash-earned">+{$runCash}¢</span>
    <span class="sec-earned">+{$runSecrets}◆</span>
    <span class="depth">Obstacle {$obstacleIndex + 1} / {$runObstacles.length}</span>
  </div>

  <div class="actions">
    {#if satisfied.satisfied && !discarding}
      <button class="btn primary" on:click={passObstacle}>CLEAR OBSTACLE</button>
    {/if}
    {#if !discarding}
      <button class="btn secondary" on:click={drawForFatigue}>Draw (+1 Fatigue)</button>
      <button class="btn faint" on:click={rerandomizeObstacle}>Re-roll (+1 Heat)</button>
      <button class="btn faint" on:click={beginEscape}>Begin Escape</button>
    {/if}
  </div>

  {#if mult}
    <div class="mult-banner">
      <span>MULTIPLIER ×{mult.factor} — click a data card</span>
      <button class="tiny-btn" on:click={cancelMultiplier}>Cancel</button>
    </div>
  {/if}

  {#if discarding}
    <div class="discard-banner">
      Discard {$mustDiscardCount} card{$mustDiscardCount !== 1 ? 's' : ''} (over hand limit)
    </div>
  {/if}

  <div class="hand-area">
    <div class="hand-label">HAND ({$hand.length})</div>
    <div class="hand">
      {#each $hand as card (card.id)}
        <div style="position:relative">
          <CardDisplay
            {card}
            selected={mult?.card?.id === card.id}
            targeted={!!mult && cardIsDataCard(card)}
            dimmed={discarding ? false : (!!mult && !cardIsDataCard(card))}
            onPlay={handleCardPlay}
          />
        </div>
      {/each}
      {#if $hand.length === 0}
        <div class="empty-hand">
          {#if $deck.length === 0 && $discardPile.length === 0}
            No cards remaining
          {:else}
            Hand empty — draw more or clear the obstacle
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .obstacle-view { display: flex; flex-direction: column; gap: 1rem; padding: 1rem 0; }

  .deck-info {
    display: flex; gap: 1.5rem;
    font-size: 0.72rem; color: #445;
    font-family: 'Share Tech Mono', monospace;
  }

  .obs-card {
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 1rem 1.25rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    transition: border-color 0.2s;
  }
  .obs-card.satisfied { border-color: #50fa7b; }

  .obs-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
  .obs-name { font-size: 1rem; font-weight: 700; color: #c8d0e0; }
  .obs-desc { font-size: 0.8rem; color: #667; font-style: italic; margin-top: 0.2rem; }
  .obs-rewards { display: flex; gap: 0.5rem; flex-shrink: 0; }
  .reward { font-size: 0.85rem; font-weight: 700; font-family: 'Share Tech Mono', monospace; }
  .reward.cash { color: #f1c40f; }
  .reward.secrets { color: #bd93f9; }

  .obs-requirements { display: flex; flex-direction: column; gap: 0.5rem; }

  .req {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: #0a1018; border-radius: 4px;
    border: 1px solid #1a2535; transition: border-color 0.2s;
  }
  .req.met { border-color: #50fa7b44; background: #0a1810; }
  .req-label { font-size: 0.65rem; color: #445; letter-spacing: 0.1em; font-family: 'Share Tech Mono', monospace; min-width: 45px; }
  .req-value { font-size: 0.9rem; color: #00f5ff; font-family: 'Share Tech Mono', monospace; font-weight: 700; flex: 1; }
  .checkmark { color: #50fa7b; }
  .req-bar { width: 80px; height: 6px; background: #1a2535; border-radius: 3px; overflow: hidden; flex-shrink: 0; }
  .req-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .data-fill { background: #00f5ff; }

  .choice-row { display: flex; align-items: stretch; gap: 0.5rem; flex-wrap: wrap; }
  .choice-opt {
    flex: 1; min-width: 130px;
    background: #0a1018; border: 1px solid #1a2535; border-radius: 4px;
    padding: 0.5rem 0.75rem;
    display: flex; flex-direction: column; gap: 0.2rem;
    transition: border-color 0.2s;
  }
  .choice-opt.met { border-color: #50fa7b44; }
  .choice-sep { display: flex; align-items: center; font-size: 0.7rem; color: #334; font-weight: 700; }
  .opt-tag { font-family: 'Share Tech Mono', monospace; font-size: 0.8rem; color: #00f5ff; font-weight: 700; }
  .opt-text { font-size: 0.85rem; color: #889; }
  .opt-detail { font-size: 0.72rem; font-family: 'Share Tech Mono', monospace; color: #556; }

  .run-progress {
    display: flex; gap: 1rem; align-items: center;
    font-size: 0.78rem; padding: 0.4rem 0.75rem;
    background: #090e14; border-radius: 4px; border: 1px solid #1a2535;
  }
  .prog-label { color: #445; }
  .cash-earned { color: #f1c40f; font-family: 'Share Tech Mono', monospace; font-weight: 700; }
  .sec-earned { color: #bd93f9; font-family: 'Share Tech Mono', monospace; font-weight: 700; }
  .depth { color: #445; margin-left: auto; font-family: 'Share Tech Mono', monospace; font-size: 0.72rem; }

  .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

  .btn {
    padding: 0.55rem 1.1rem; border-radius: 4px;
    font-size: 0.8rem; font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.07em; cursor: pointer; border: 1px solid;
    transition: background 0.12s;
  }
  .btn.primary { background: #50fa7b22; border-color: #50fa7b; color: #50fa7b; }
  .btn.primary:hover { background: #50fa7b44; }
  .btn.secondary { background: transparent; border-color: #334; color: #556; }
  .btn.secondary:hover { border-color: #557; color: #778; }
  .btn.faint { background: transparent; border-color: #252525; color: #445; }
  .btn.faint:hover { border-color: #334; color: #556; }

  .mult-banner {
    background: #12061a; border: 1px solid #ff79c6;
    border-radius: 4px; padding: 0.5rem 0.75rem;
    display: flex; align-items: center; gap: 1rem;
    font-size: 0.8rem; color: #ff79c6;
    font-family: 'Share Tech Mono', monospace;
  }
  .tiny-btn {
    background: none; border: 1px solid #556; border-radius: 3px;
    color: #556; font-size: 0.7rem; padding: 0.15rem 0.5rem; cursor: pointer;
  }
  .tiny-btn:hover { color: #889; border-color: #889; }

  .discard-banner {
    background: #1a1000; border: 1px solid #f1c40f;
    border-radius: 4px; padding: 0.5rem 0.75rem;
    font-size: 0.8rem; color: #f1c40f; font-family: 'Share Tech Mono', monospace;
  }

  .hand-area { display: flex; flex-direction: column; gap: 0.5rem; }
  .hand-label { font-size: 0.7rem; color: #445; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'Share Tech Mono', monospace; }
  .hand { display: flex; flex-wrap: wrap; gap: 0.6rem; min-height: 60px; }
  .empty-hand { font-size: 0.8rem; color: #334; align-self: center; font-style: italic; }
  .no-obs { color: #445; font-size: 0.85rem; font-style: italic; }
</style>
