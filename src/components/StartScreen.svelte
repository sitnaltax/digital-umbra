<script>
  import { beginGame } from '../lib/gameState.js';
</script>

<div class="start">
  <div class="logo-area">
    <div class="logo-top">DIGITAL</div>
    <div class="logo-bot">UMBRA</div>
    <div class="tagline">infiltrate. extract. vanish.</div>
  </div>

  <div class="blurb">
    <p>
      You are a runner. Hackers and ghosts and con artists, working the margins
      of a world that belongs to corporations and governments.
    </p>
    <p>
      They have secrets. You have skills. Twelve runs to take what you came for.
    </p>
  </div>

  <button class="start-btn" on:click={beginGame}>
    JACK IN
  </button>

  <div class="footer">Client-side only. No server. No tracking.</div>
</div>

<style>
  .start {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    padding: 2rem;
    text-align: center;
  }

  .logo-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  .logo-top {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(2.5rem, 10vw, 5rem);
    color: #00ff41;
    letter-spacing: 0.3em;
    text-shadow: 0 0 20px rgba(0, 255, 65, 0.6),
                 0 0 40px rgba(0, 255, 65, 0.3);
    line-height: 1;
  }

  .logo-bot {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(2.5rem, 10vw, 5rem);
    color: #c8d0e0;
    letter-spacing: 0.3em;
    line-height: 1;
    margin-top: -0.1em;
  }

  .tagline {
    font-size: 0.8rem;
    color: #556;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-top: 0.75rem;
  }

  .blurb {
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    color: #889;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .start-btn {
    padding: 1rem 3.5rem;
    background: transparent;
    border: 2px solid #00ff41;
    color: #00ff41;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1.1rem;
    letter-spacing: 0.2em;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
  }

  .start-btn:hover {
    background: rgba(0, 255, 65, 0.1);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  }

  .footer {
    font-size: 0.7rem;
    color: #334;
    letter-spacing: 0.05em;
  }
</style>
