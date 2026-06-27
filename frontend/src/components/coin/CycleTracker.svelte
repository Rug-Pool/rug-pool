<script lang="ts">
  import CountdownTimer from '$components/shared/CountdownTimer.svelte';

  let {
    round = 1,
    cycleEnd = Date.now() + 86400000,
    totalRounds = 0,
    flipsPending = 0,
  }: {
    round?: number;
    cycleEnd?: number;
    totalRounds?: number;
    flipsPending?: number;
  } = $props();
</script>

<div class="tracker">
  <div class="row">
    <div class="item">
      <span class="label">Round</span>
      <span class="value mono">#{round}</span>
    </div>
    <div class="item">
      <span class="label">Time Left</span>
      <CountdownTimer target={cycleEnd} pulse={true} />
    </div>
    <div class="item">
      <span class="label">Total Rounds</span>
      <span class="value mono">{totalRounds}</span>
    </div>
    <div class="item">
      <span class="label">Flips Pending</span>
      <span class="value mono">{flipsPending}</span>
    </div>
  </div>
</div>

<style>
  .tracker {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1rem;
  }

  .row {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  .value {
    font-size: 0.9375rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }
</style>
