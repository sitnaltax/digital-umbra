<script>
  import { availableTargetIds, runNumber, selectTarget } from '../lib/gameState.js';
  import { TARGET_TEMPLATES } from '../lib/targets.js';
  import { CONFIG } from '../lib/constants.js';

  $: targets = $availableTargetIds.map(id => TARGET_TEMPLATES.find(t => t.id === id)).filter(Boolean);

  const AESTHETIC_LABELS = {
    'drab-corporate':  'Drab Corporate',
    'slick-corporate': 'Slick Corporate',
    'authoritarian':   'Authoritarian',
  };

  const DIFFICULTY_LABELS = ['', 'Easy', 'Medium', 'Hard'];
  const DIFFICULTY_COLORS = ['', '#50fa7b', '#f1c40f', '#ff5555'];
</script>

<div class="page">
  <div class="header">
    <h1>SELECT TARGET</h1>
    <div class="run-note">
      Run {$runNumber} of {CONFIG.totalRuns}
      {#if $runNumber === CONFIG.totalRuns}
        — <span class="final">FINAL RUN</span>
      {/if}
    </div>
  </div>

  <p class="instruction">Choose one target for this run. You'll earn Cash and Secrets for each obstacle you clear before escaping.</p>

  <div class="targets">
    {#each targets as target}
      <button class="target-card" on:click={() => selectTarget(target.id)}>
        <div class="target-top">
          <div class="target-name">{target.name}</div>
          <div class="target-meta">
            <span class="aesthetic">{AESTHETIC_LABELS[target.aesthetic] ?? target.aesthetic}</span>
            <span
              class="difficulty"
              style="color: {DIFFICULTY_COLORS[target.difficulty]}"
            >
              {DIFFICULTY_LABELS[target.difficulty] ?? '?'}
            </span>
          </div>
        </div>
        <div class="target-tagline">"{target.tagline}"</div>
        <div class="target-desc">{target.description}</div>
        <div class="target-footer">
          <span class="focus">Focus: {target.skillFocus === 'mixed' ? 'All Skills' : target.skillFocus.charAt(0).toUpperCase() + target.skillFocus.slice(1)}</span>
          <span class="obstacles">{target.obstacleTemplates.length} obstacles</span>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem 0;
  }

  .header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }

  h1 {
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.2rem;
    color: #00f5ff;
    letter-spacing: 0.1em;
  }

  .run-note {
    font-size: 0.8rem;
    color: #556;
  }

  .final { color: #ff5555; font-weight: 700; }

  .instruction {
    font-size: 0.85rem;
    color: #667;
    line-height: 1.5;
  }

  .targets {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .target-card {
    background: #0c1520;
    border: 1px solid #1e2e40;
    border-radius: 6px;
    padding: 1.25rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    color: inherit;
    transition: border-color 0.15s, background 0.15s;
  }

  .target-card:hover {
    border-color: #00f5ff;
    background: #0d1e30;
  }

  .target-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .target-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #c8d0e0;
  }

  .target-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.2rem;
    flex-shrink: 0;
  }

  .aesthetic {
    font-size: 0.7rem;
    color: #445;
    letter-spacing: 0.05em;
  }

  .difficulty {
    font-size: 0.75rem;
    font-weight: 700;
    font-family: 'Share Tech Mono', monospace;
  }

  .target-tagline {
    font-size: 0.8rem;
    color: #556;
    font-style: italic;
  }

  .target-desc {
    font-size: 0.9rem;
    color: #889;
    line-height: 1.5;
  }

  .target-footer {
    display: flex;
    gap: 1.5rem;
    font-size: 0.75rem;
    color: #556;
    font-family: 'Share Tech Mono', monospace;
    padding-top: 0.25rem;
    border-top: 1px solid #1a2030;
  }

  .focus { color: #8899aa; }
  .obstacles { color: #445566; }
</style>
