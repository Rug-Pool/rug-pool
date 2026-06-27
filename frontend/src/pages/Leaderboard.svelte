<script lang="ts">
  import TopLoserPot from '$components/leaderboard/TopLoserPot.svelte';
  import LeaderboardTable from '$components/leaderboard/LeaderboardTable.svelte';

  const MOCK_ENTRIES = [
    { rank: 1, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f3bDc9', lossAmount: 48250, roundsSurvived: 12 },
    { rank: 2, address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', lossAmount: 32100, roundsSurvived: 9 },
    { rank: 3, address: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', lossAmount: 28400, roundsSurvived: 11 },
    { rank: 4, address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', lossAmount: 19350, roundsSurvived: 7 },
    { rank: 5, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', lossAmount: 15700, roundsSurvived: 8 },
    { rank: 6, address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', lossAmount: 12400, roundsSurvived: 6 },
    { rank: 7, address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97', lossAmount: 9800, roundsSurvived: 5 },
    { rank: 8, address: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', lossAmount: 7200, roundsSurvived: 4, isYou: true },
    { rank: 9, address: '0x617F2E2fD72FD9D5503197092aC168c91465E7f2', lossAmount: 5100, roundsSurvived: 3 },
    { rank: 10, address: '0x17F6AD8Ef982297579C203069C1Db6e30cF74e52', lossAmount: 2900, roundsSurvived: 2 },
  ];
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1>Leaderboard</h1>
      <p class="subtitle">The biggest losers win. Monthly reset.</p>
    </div>
  </div>

  <TopLoserPot amount={48250} />

  <div class="info-bar">
    <div class="info-item">
      <span class="info-value">10%</span>
      <span class="info-label">of monthly fees</span>
    </div>
    <div class="info-item">
      <span class="info-value">1,247</span>
      <span class="info-label">eligible wallets</span>
    </div>
    <div class="info-item">
      <span class="info-value">18 days</span>
      <span class="info-label">until payout</span>
    </div>
  </div>

  <LeaderboardTable entries={MOCK_ENTRIES} />
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
