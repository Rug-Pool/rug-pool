<script lang="ts">
  import { navigate } from '$lib/router.svelte';
</script>

<div class="page">
  <div class="page-header">
    <div class="header-row">
      <button class="back-btn" onclick={() => navigate('/')}>
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1>FAQ</h1>
    </div>
    <p class="subtitle">Everything you need to know about Rug Pool.</p>
  </div>

  <div class="list">
    <details class="item">
      <summary class="question">What is Rug Pool?</summary>
      <p class="answer">Rug Pool is a provably fair memecoin game on Monad. You buy into a coin, get locked for 24 hours, and at T+24 onchain randomness decides if you auto-sell or stay locked another cycle. The rug is guaranteed. The question is whether it hits you.</p>
    </details>

    <details class="item">
      <summary class="question">Is this just another rug pull?</summary>
      <p class="answer">No. A normal rug pull is secret. Someone plans it, executes it, and disappears with your money. Rug Pool is the opposite — the rug is public, scheduled, equal for everyone, and provably fair. Even the dev can't sell early.</p>
    </details>

    <details class="item">
      <summary class="question">How does the flip work?</summary>
      <p class="answer">At exactly 24 hours, Monad's onchain VRF flips a coin for every holder simultaneously. Heads means your position auto-sells at market price plus a cut of the protocol pool. Tails means you stay locked for another 24 hour cycle. Nobody knows which side they're on until it happens. Not even us.</p>
    </details>

    <details class="item">
      <summary class="question">Can I get rugged?</summary>
      <p class="answer">Yes. If you survive multiple cycles while the price bleeds and finally flip heads at the bottom, the pool bonus might not cover your loss. That's the risk. That's the game.</p>
    </details>

    <details class="item">
      <summary class="question">Wait — the worst loser wins a prize?</summary>
      <p class="answer">Exactly. 10% of monthly protocol fees go to the wallet that lost the most that month. Losing big is a legitimate strategy. The worst outcome becomes a competition.</p>
    </details>

    <details class="item">
      <summary class="question">What is the pool bonus?</summary>
      <p class="answer">20% of every auto-sell profit stays in the protocol. When you flip heads and exit, you receive your market price plus a share of the accumulated pool. The pool can offset losses but doesn't guarantee profit — especially in later cycles on a declining coin.</p>
    </details>

    <details class="item">
      <summary class="question">Why do I need to pay $1 to join?</summary>
      <p class="answer">It's not a fee. It's proof of human. Bots can't economically justify $1 per wallet at scale. Every person on this platform paid to be here. That filters out the noise before the game starts.</p>
    </details>

    <details class="item">
      <summary class="question">What does the blue checkmark mean?</summary>
      <p class="answer">The wallet that launched this coin paid the $1 founding member fee. They're a verified human, not a bot deploy.</p>
    </details>

    <details class="item">
      <summary class="question">What does the yellow checkmark mean?</summary>
      <p class="answer">This project paid $10 for verified project status. It's been reviewed and listed as a legitimate launch. Yellow badges get priority placement on the feed.</p>
    </details>

    <details class="item">
      <summary class="question">Can I buy back in after being auto-sold?</summary>
      <p class="answer">Yes. Any time. Buying back in starts a fresh 24 hour lock from the moment of purchase. You're back in the game.</p>
    </details>

    <details class="item">
      <summary class="question">What happens if I flip Tails every single cycle?</summary>
      <p class="answer">You stay locked. Every cycle. Until you flip Heads. There is no manual exit. That's the point. You knew this when you bought in.</p>
    </details>

    <details class="item">
      <summary class="question">Who gets the 10% dev fee?</summary>
      <p class="answer">The dev. That's how Rug Pool sustains itself. It's onchain, automatic, and transparent. No hidden fees, no surprise extractions.</p>
    </details>

    <details class="item">
      <summary class="question">When does the top loser prize pay out?</summary>
      <p class="answer">Monthly. At the end of each calendar month, the wallet with the largest verified loss receives 10% of that month's protocol fees automatically onchain. No application needed. The contract tracks it.</p>
    </details>

    <details class="item">
      <summary class="question">Is this gambling?</summary>
      <p class="answer">It's a game with real money and real risk. Like every memecoin. The difference is the rules are written in code, visible to everyone, and enforced automatically. Nobody can change them mid-game.</p>
    </details>

    <details class="item">
      <summary class="question">What blockchain is this on?</summary>
      <p class="answer">Monad. 10,000 TPS, 0.8 second finality, EVM compatible. The simultaneous flip mechanic requires speed and finality that most chains can't deliver. Monad can.</p>
    </details>

    <details class="item danger">
      <summary class="question">Has this been audited?</summary>
      <p class="answer">[Audit status will be listed here before mainnet launch.]</p>
    </details>

    <details class="item">
      <summary class="question">Any tips for surviving?</summary>
      <p class="answer">If you're locked in and your coin is crashing, shill it and hope you escape. 💀</p>
    </details>
  </div>
</div>

<style>
  .page {
    padding-bottom: 4rem;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .header-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.375rem;
  }

  .back-btn {
    background: transparent;
    color: var(--text-secondary);
    padding: 0.25rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: color 0.15s, background 0.15s;
  }
  .back-btn:hover {
    color: var(--text-primary);
    background: var(--gray-700);
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    margin: 0;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 0.9375rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    overflow: hidden;
  }

  .item.danger {
    border-color: var(--red-500);
    background: rgba(239, 68, 68, 0.08);
  }

  .question {
    padding: 1rem 1.25rem;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background 0.15s;
  }
  .question::-webkit-details-marker {
    display: none;
  }
  .question::after {
    content: '+';
    font-size: 1.25rem;
    color: var(--accent);
    font-weight: 700;
    flex-shrink: 0;
    margin-left: 1rem;
    transition: transform 0.2s;
  }
  .item[open] .question::after {
    content: '−';
    transform: rotate(180deg);
  }
  .question:hover {
    background: var(--gray-700);
  }

  .answer {
    padding: 0 1.25rem 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .danger .answer {
    color: var(--red-300);
  }
</style>
