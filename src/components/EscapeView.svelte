<script>
  import {
    hand, deck, discardPile,
    dataPool, satisfiedSkills, pendingMultiplier,
    mustDiscardCount, escapeObstacles, escapeObstacleIndex,
    runCash, runSecrets, player,
    playCard, cancelMultiplier, discardCard,
    drawForFatigue, rerandomizeObstacle, passObstacle,
  } from '../lib/gameState.js';
  import { checkObstacleSatisfied } from '../lib/targets.js';
  import { SKILL_LABELS, CATEGORY_LABELS, SKILL_COLORS, CATEGORY_COLORS, SKILL_CATEGORY } from '../lib/constants.js';
  import CardDisplay from './CardDisplay.svelte';

  $: obs = $escapeObstacles[$escapeObstacleIndex] ?? null;
  $: satisfied = obs ? checkObstacleSatisfied(obs, $dataPool, $satisfiedSkills) : { satisfied: false, via: null };
  $: mult = $pendingMultiplier;
  $: discarding = $mustDiscardCount > 0;
  $: remaining = $escapeObstacles.length - $escapeObstacleIndex;

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
    return req ? Math.min(100, ($dataPool / req) * 100) : 0;
  }

  function cardIsDataCard(card) {
    if (card.isMultiplier) return false;
    if (card.effects?.some(e => e.type === 'data')) return true;
    if (card.options?.some(o => o.effects?.some(e => e.type === 'data'))) return true;
    return false;
  }

  function handleCardPlay(cardId, optionIndex) {
    if (discarding) discardCard(cardId);
    else playCard(cardId, optionIndex);
  }
</script>

<div class="escape-view">
  <div class="escape-header">
    <div class="escape-title">ESCAPE SEQUENCE</div>
    <div class="escape-sub">{remaining} obstacle{remaining !== 1 ? 's' : ''} remaining</div>
  </div>

  <div class="haul-summary">
    <span class="hs-label">Secured haul:</span>
    <span class="cash">{$runCash}¢</span>
    <span class="secrets">{$runSecrets}◆</span>
    <span class="hs-note">Clear all escape obstacles to keep it</span>
  </div>

  {#if obs}
    <div class="obs-card" class:satisfied={satisfied.satisfied}>
      <div class="obs-header">
        <div>
          <div class="obs-name">{obs.name}</div>
          <div class="obs-desc">{obs.desc}</div>
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
              {#if isSkilSat(obs.skillReq)} ✓{/if}
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
              {#if isSkilSat(obs.skillReq)} ✓{/if}
            </span>
          </div>
        {:else if obs.kind === 'choice'}
          <div class="choice-row">
            {#each [obs.optA, obs.optB] as opt, i}
              <div class="choice-opt" class:met={(() => {
                const dOk = opt?.dataReq != null ? $dataPool >= opt.dataReq : true;
                const sOk = opt?.skillReq ? isSkilSat(opt.skillReq) : true;
                return dOk && sOk;
              })()}>
                <span class="opt-tag">{i === 0 ? 'A' : 'B'}</span>
                <span>{opt?.label ?? ''}</span>
                {#if opt?.dataReq != null}<span class="opt-detail">{$dataPool}/{opt.dataReq}</span>{/if}
                {#if opt?.skillReq}
                  <span class="opt-detail" style="color:{skillReqColor(opt.skillReq)}">{skillReqDisplay(opt.skillReq)}</span>
                {/if}
              </div>
              {#if i === 0}<div class="choice-sep">OR</div>{/if}
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <div class="actions">
    {#if satisfied.satisfied && !discarding}
      <button class="btn primary" on:click={passObstacle}>CLEAR ESCAPE OBSTACLE</button>
    {/if}
    {#if !discarding}
      <button class="btn secondary" on:click={drawForFatigue}>Draw (+1 Fatigue)</button>
      <button class="btn faint" on:click={rerandomizeObstacle}>Re-roll (+1 Heat)</button>
    {/if}
  </div>

  {#if mult}
    <div class="mult-banner">
      <span>MULTIPLIER ×{mult.factor} — click a data card</span>
      <button class="tiny-btn" on:click={cancelMultiplier}>Cancel</button>
    </div>
  {/if}
  {#if discarding}
    <div class="discard-banner">Discard {$mustDiscardCount} card{$mustDiscardCount !== 1 ? 's' : ''}</div>
  {/if}

  <div class="hand-area">
    <div class="hand-label">HAND ({$hand.length}) · Deck: {$deck.length} · Discard: {$discardPile.length}</div>
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
        <div class="empty-hand">Hand empty</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .escape-view { display: flex; flex-direction: column; gap: 1rem; padding: 1rem 0; }

  .escape-header { display: flex; align-items: baseline; gap: 1rem; }
  .escape-title { font-family: 'Share Tech Mono', monospace; font-size: 1.1rem; color: #ff9580; letter-spacing: 0.1em; }
  .escape-sub { font-size: 0.8rem; color: #667; }

  .haul-summary {
    display: flex; gap: 1rem; align-items: center;
    font-size: 0.8rem; padding: 0.4rem 0.75rem;
    background: #140a08; border-radius: 4px; border: 1px solid #3a2010;
  }
  .hs-label { color: #667; }
  .cash { color: #f1c40f; font-family: 'Share Tech Mono', monospace; font-weight: 700; }
  .secrets { color: #bd93f9; font-family: 'Share Tech Mono', monospace; font-weight: 700; }
  .hs-note { color: #445; font-size: 0.72rem; margin-left: auto; font-style: italic; }

  .obs-card {
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 1rem 1.25rem;
    display: flex; flex-direction: column; gap: 0.75rem;
    transition: border-color 0.2s;
  }
  .obs-card.satisfied { border-color: #50fa7b; }
  .obs-header { display: flex; justify-content: space-between; align-items: flex-start; }
  .obs-name { font-size: 1rem; font-weight: 700; color: #c8d0e0; }
  .obs-desc { font-size: 0.8rem; color: #667; font-style: italic; margin-top: 0.2rem; }

  .obs-requirements { display: flex; flex-direction: column; gap: 0.5rem; }
  .req {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.5rem 0.75rem; background: #0a1018;
    border-radius: 4px; border: 1px solid #1a2535; transition: border-color 0.2s;
  }
  .req.met { border-color: #50fa7b44; background: #0a1810; }
  .req-label { font-size: 0.65rem; color: #445; letter-spacing: 0.1em; font-family: 'Share Tech Mono', monospace; min-width: 45px; }
  .req-value { font-size: 0.9rem; color: #00ff41; font-family: 'Share Tech Mono', monospace; font-weight: 700; flex: 1; }
  .req-bar { width: 80px; height: 6px; background: #1a2535; border-radius: 3px; overflow: hidden; }
  .req-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .data-fill { background: #00ff41; }

  .choice-row { display: flex; align-items: stretch; gap: 0.5rem; flex-wrap: wrap; }
  .choice-opt { flex: 1; min-width: 120px; background: #0a1018; border: 1px solid #1a2535; border-radius: 4px; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.15rem; }
  .choice-opt.met { border-color: #50fa7b44; }
  .choice-sep { display: flex; align-items: center; font-size: 0.7rem; color: #334; font-weight: 700; }
  .opt-tag { font-family: 'Share Tech Mono', monospace; font-size: 0.8rem; color: #00ff41; font-weight: 700; }
  .opt-detail { font-size: 0.72rem; font-family: 'Share Tech Mono', monospace; color: #556; }

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

  .mult-banner { background: #12061a; border: 1px solid #ff79c6; border-radius: 4px; padding: 0.5rem 0.75rem; display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: #ff79c6; font-family: 'Share Tech Mono', monospace; }
  .tiny-btn { background: none; border: 1px solid #556; border-radius: 3px; color: #556; font-size: 0.7rem; padding: 0.15rem 0.5rem; cursor: pointer; }
  .discard-banner { background: #1a1000; border: 1px solid #f1c40f; border-radius: 4px; padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #f1c40f; font-family: 'Share Tech Mono', monospace; }

  .hand-area { display: flex; flex-direction: column; gap: 0.5rem; }
  .hand-label { font-size: 0.7rem; color: #445; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'Share Tech Mono', monospace; }
  .hand { display: flex; flex-wrap: wrap; gap: 0.6rem; min-height: 60px; }
  .empty-hand { font-size: 0.8rem; color: #334; align-self: center; font-style: italic; }
</style>
