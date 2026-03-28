<script>
  import { player, gameResult, resetGame } from '../lib/gameState.js';

  const OUTCOMES = {
    complete: {
      title: 'MISSION COMPLETE',
      color: '#50fa7b',
      text: "You did it. The secrets are yours, and you're out clean. Whatever comes next, you earned it.",
    },
    marginal: {
      title: 'PARTIAL SUCCESS',
      color: '#f1c40f',
      text: "You got out with something. Not everything you came for, but enough to move on. For now.",
    },
    failure: {
      title: 'MISSION FAILED',
      color: '#ff7043',
      text: "Twelve runs and not enough to show for it. The system won this time.",
    },
    captured: {
      title: 'CAPTURED',
      color: '#ff5555',
      text: "They got you. No burner ID, nowhere to run. Whatever you knew, they know now.",
    },
  };

  $: outcome = OUTCOMES[$gameResult] ?? OUTCOMES.failure;
  $: thresh = $player.difficulty;
</script>

<div class="game-over">
  <div class="outcome-title" style="color: {outcome.color}">
    {outcome.title}
  </div>

  <div class="outcome-text">{outcome.text}</div>

  <div class="final-stats">
    <div class="stat">
      <span class="stat-label">Final Secrets</span>
      <span class="stat-value secrets">{$player.secrets}◆</span>
    </div>
    {#if thresh}
      <div class="stat">
        <span class="stat-label">Target (complete)</span>
        <span class="stat-value">{thresh.secretsToWinComplete}◆</span>
      </div>
      <div class="stat">
        <span class="stat-label">Target (marginal)</span>
        <span class="stat-value">{thresh.secretsToWinMarginal}◆</span>
      </div>
    {/if}
    <div class="stat">
      <span class="stat-label">Final Cash</span>
      <span class="stat-value cash">{$player.cash}¢</span>
    </div>
    {#if $player.upgrades?.length > 0}
      <div class="stat">
        <span class="stat-label">Upgrades installed</span>
        <span class="stat-value">{$player.upgrades.map(u => u.name).join(', ')}</span>
      </div>
    {/if}
  </div>

  <button class="new-game-btn" on:click={resetGame}>
    NEW GAME
  </button>
</div>

<style>
  .game-over {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 2rem; padding: 2rem; text-align: center;
  }

  .outcome-title {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(1.5rem, 6vw, 2.5rem);
    letter-spacing: 0.15em;
    text-shadow: 0 0 20px currentColor;
  }

  .outcome-text {
    max-width: 480px;
    font-size: 0.95rem; color: #778; line-height: 1.7;
  }

  .final-stats {
    background: #0c1520; border: 1px solid #1e3050;
    border-radius: 6px; padding: 1.25rem 1.75rem;
    display: flex; flex-direction: column; gap: 0.6rem;
    min-width: 260px; text-align: left;
  }

  .stat { display: flex; justify-content: space-between; gap: 1.5rem; }
  .stat-label { font-size: 0.82rem; color: #556; }
  .stat-value { font-size: 0.9rem; font-family: 'Share Tech Mono', monospace; color: #c8d0e0; }
  .stat-value.secrets { color: #bd93f9; font-size: 1.1rem; font-weight: 700; }
  .stat-value.cash { color: #f1c40f; }

  .new-game-btn {
    padding: 0.85rem 2.5rem; background: transparent;
    border: 2px solid #00f5ff; color: #00f5ff;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.9rem; letter-spacing: 0.15em;
    cursor: pointer; transition: background 0.15s;
  }
  .new-game-btn:hover { background: rgba(0, 245, 255, 0.1); }
</style>
