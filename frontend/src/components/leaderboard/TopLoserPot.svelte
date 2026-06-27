<script lang="ts">
  let { amount = 48250 }: { amount?: number } = $props();

  let displayStr = $derived('$' + amount.toLocaleString());
</script>

<div class="pot">
  <div class="pot-content">
    <span class="pot-label">Top Loser Prize Pool</span>
    <span class="pot-amount">{displayStr}</span>
    <span class="pot-sub">Next payout in 18 days</span>
  </div>
</div>

<style>
  .pot {
    background: linear-gradient(135deg, var(--purple-900), var(--purple-800));
    border: 2px solid var(--purple-600);
    border-radius: 16px;
    padding: 2.5rem 2rem;
    text-align: center;
  }

  .pot-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pot-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--purple-300);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .pot-amount {
    font-size: 3.5rem;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    background: linear-gradient(180deg, var(--purple-200), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }

  .pot-sub {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }
</style>
