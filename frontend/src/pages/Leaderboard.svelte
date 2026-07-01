<script lang="ts">
  import TopLoserPot from '$components/leaderboard/TopLoserPot.svelte';
  import LeaderboardTable from '$components/leaderboard/LeaderboardTable.svelte';
  import { getLeaderboard } from '$lib/api';
  import { onMount } from 'svelte';

  let entries: any[] = $state([]);
  let potAmount = $state(0);
  let pendingFees = $state('0');
  let loading = $state(true);

  onMount(async () => {
    try {
      const data = await getLeaderboard();
      potAmount = Number(data.amount) / 1e18;
      pendingFees = (Number(data.pendingFees) / 1e18).toFixed(4);
      if (data.topLoser) {
        entries = [{
          rank: 1,
          address: data.topLoser,
          lossAmount: potAmount,
          roundsSurvived: 1,
        }];
      }
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1>Leaderboard</h1>
      <p class="subtitle">The biggest losers win. Monthly reset.</p>
    </div>
  </div>

  <TopLoserPot amount={potAmount} />

  <div class="info-bar">
    <div class="info-item">
      <span class="info-value">10%</span>
      <span class="info-label">of monthly fees</span>
    </div>
    <div class="info-item">
      <span class="info-value">—</span>
      <span class="info-label">eligible wallets</span>
    </div>
    <div class="info-item">
      <span class="info-value">{pendingFees} MON</span>
      <span class="info-label">pending fees</span>
    </div>
  </div>

  {#if loading}
    <p class="subtitle">Loading...</p>
  {:else}
    <LeaderboardTable entries={entries} />
  {/if}
</div>

<style>
  .page {
    padding-bottom: 3rem;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.375rem;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 0.9375rem;
  }

  .info-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .info-item {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-value {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
  }

  .info-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .info-bar {
      grid-template-columns: 1fr;
    }
  }
</style>
