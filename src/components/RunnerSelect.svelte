<script>
  import { selectRunnerAndDifficulty } from '../lib/gameState.js';
  import { RUNNERS, DIFFICULTIES } from '../lib/runners.js';

  const runners = Object.values(RUNNERS);
  const difficulties = Object.values(DIFFICULTIES);

  let selectedRunner = runners[0]?.id ?? null;
  let selectedDifficulty = difficulties[0]?.id ?? null;

  function start() {
    if (!selectedRunner || !selectedDifficulty) return;
    selectRunnerAndDifficulty(selectedRunner, selectedDifficulty);
  }
</script>

<div class="page">
  <h1>Choose Your Runner</h1>

  <div class="runners">
    {#each runners as runner}
      <button
        class="runner-card"
        class:selected={selectedRunner === runner.id}
        on:click={() => selectedRunner = runner.id}
      >
        <div class="runner-name">{runner.name}</div>
        <div class="runner-tagline">{runner.tagline}</div>
        <div class="runner-desc">{runner.description}</div>
        <div class="runner-stats">
          <span>Hand: {runner.startingHandLimit}</span>
          <span>Heat cap: {runner.maxHeat}</span>
          <span>Fatigue cap: {runner.maxFatigue}</span>
          <span>Starting cash: {runner.startingCash}¢</span>
        </div>
        {#if runner.abilities.length > 0}
          <div class="abilities">
            {#each runner.abilities as ab}
              <div class="ability">
                <span class="ab-name">{ab.name}</span>
                <span class="ab-desc">{ab.description}</span>
              </div>
            {/each}
          </div>
        {/if}
      </button>
    {/each}
  </div>

  <div class="section-label">Difficulty</div>

  <div class="difficulties">
    {#each difficulties as diff}
      <button
        class="diff-card"
        class:selected={selectedDifficulty === diff.id}
        on:click={() => selectedDifficulty = diff.id}
      >
        <div class="diff-name">{diff.name}</div>
        <div class="diff-desc">{diff.description}</div>
        <div class="diff-thresh">
          Win: {diff.secretsToWinComplete} Secrets (marginal: {diff.secretsToWinMarginal})
        </div>
      </button>
    {/each}
  </div>

  <button class="confirm-btn" on:click={start}>
    BEGIN RUN SEQUENCE
  </button>
</div>

<style>
  .page {
    padding: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  h1 {
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.4rem;
    color: #00f5ff;
    letter-spacing: 0.1em;
    border-bottom: 1px solid #1a2a3a;
    padding-bottom: 0.5rem;
  }

  .section-label {
    font-size: 0.75rem;
    color: #556;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .runners, .difficulties {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .runner-card, .diff-card {
    background: #0f1620;
    border: 1px solid #1e2e40;
    border-radius: 6px;
    padding: 1.25rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: border-color 0.15s;
    color: inherit;
  }

  .runner-card.selected, .diff-card.selected {
    border-color: #00f5ff;
    background: #0d1e2e;
  }

  .runner-card:hover, .diff-card:hover {
    border-color: #335;
  }

  .runner-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: #00f5ff;
  }

  .runner-tagline {
    font-size: 0.8rem;
    color: #556;
    font-style: italic;
  }

  .runner-desc {
    font-size: 0.9rem;
    color: #889;
    line-height: 1.5;
  }

  .runner-stats {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: #66a;
    font-family: 'Share Tech Mono', monospace;
  }

  .abilities {
    border-top: 1px solid #1a2a3a;
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .ability {
    display: flex;
    flex-direction: column;
  }

  .ab-name {
    font-size: 0.8rem;
    color: #ff79c6;
    font-weight: 600;
  }

  .ab-desc {
    font-size: 0.8rem;
    color: #778;
  }

  .diff-name {
    font-size: 1rem;
    font-weight: 700;
    color: #c8d0e0;
  }

  .diff-desc {
    font-size: 0.85rem;
    color: #778;
  }

  .diff-thresh {
    font-size: 0.75rem;
    color: #556;
    font-family: 'Share Tech Mono', monospace;
  }

  .confirm-btn {
    align-self: flex-start;
    padding: 0.85rem 2.5rem;
    background: transparent;
    border: 2px solid #00f5ff;
    color: #00f5ff;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.9rem;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: background 0.15s;
  }

  .confirm-btn:hover {
    background: rgba(0, 245, 255, 0.1);
  }
</style>
