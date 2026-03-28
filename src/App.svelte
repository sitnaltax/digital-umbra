<script>
  import { onMount } from 'svelte';
  import * as gs from './lib/gameState.js';
  import { loadSavedGame, initAutoSave, clearSave } from './lib/persistence.js';

  const { gamePhase, PHASES } = gs;

  let crashed = false;

  function handleCrash() {
    try { clearSave(); } catch {}
    crashed = true;
  }

  onMount(() => {
    if (new URLSearchParams(window.location.search).has('reset')) {
      clearSave();
      window.history.replaceState({}, '', window.location.pathname);
    }

    try {
      loadSavedGame(gs);
    } catch {
      clearSave();
    }

    window.addEventListener('error', handleCrash);
    window.addEventListener('unhandledrejection', handleCrash);

    const cleanup = initAutoSave(gs);
    return () => {
      cleanup();
      window.removeEventListener('error', handleCrash);
      window.removeEventListener('unhandledrejection', handleCrash);
    };
  });

  import StartScreen     from './components/StartScreen.svelte';
  import RunnerSelect    from './components/RunnerSelect.svelte';
  import TargetSelect    from './components/TargetSelect.svelte';
  import PlayerStatus    from './components/PlayerStatus.svelte';
  import ObstacleView    from './components/ObstacleView.svelte';
  import ObstacleResult  from './components/ObstacleResult.svelte';
  import EscapeView      from './components/EscapeView.svelte';
  import RunResult       from './components/RunResult.svelte';
  import Downtime        from './components/Downtime.svelte';
  import DowntimeShop    from './components/DowntimeShop.svelte';
  import GameOver        from './components/GameOver.svelte';
</script>

{#if crashed}
  <div class="crash-screen">
    <h2>SYSTEM FAILURE</h2>
    <p>An unexpected error terminated the run. Your cover may be blown.</p>
    <button on:click={() => window.location.reload()}>Reconnect</button>
  </div>
{:else}

<main>
  {#if $gamePhase === PHASES.START}
    <StartScreen />
  {:else if $gamePhase === PHASES.RUNNER_SELECT}
    <RunnerSelect />
  {:else if $gamePhase === PHASES.GAME_OVER}
    <GameOver />
  {:else}
    <PlayerStatus />
    <div class="content">
      {#if $gamePhase === PHASES.TARGET_SELECT}
        <TargetSelect />
      {:else if $gamePhase === PHASES.OBSTACLE}
        <ObstacleView />
      {:else if $gamePhase === PHASES.OBSTACLE_RESULT}
        <ObstacleResult />
      {:else if $gamePhase === PHASES.ESCAPE}
        <EscapeView />
      {:else if $gamePhase === PHASES.RUN_RESULT}
        <RunResult />
      {:else if $gamePhase === PHASES.DOWNTIME}
        <Downtime />
      {:else if $gamePhase === PHASES.DOWNTIME_SHOP}
        <DowntimeShop />
      {/if}
    </div>
  {/if}
</main>

{/if}

<style>
  .crash-screen {
    max-width: 480px;
    margin: 6rem auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .crash-screen h2 {
    color: #ff5555;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.75rem;
    letter-spacing: 0.1em;
  }

  .crash-screen p { color: #888; }

  .crash-screen button {
    padding: 0.75rem 2rem;
    background: #ff5555;
    color: #000;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.05em;
  }

  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem 3rem;
  }

  .content {
    margin-top: 1rem;
  }
</style>
