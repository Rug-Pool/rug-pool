<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import PriceChart from '$components/coin/PriceChart.svelte';
  import CycleTracker from '$components/coin/CycleTracker.svelte';
  import BuyPanel from '$components/coin/BuyPanel.svelte';
  import HolderList from '$components/coin/HolderList.svelte';
  import CoinChat from '$components/coin/CoinChat.svelte';
  import CountdownTimer from '$components/shared/CountdownTimer.svelte';
  import Badge from '$components/shared/Badge.svelte';

  let { id }: { id: string } = $props();

  const MOCK_COIN = {
    id: 'monad-pepe',
    name: 'Monad Pepe',
    symbol: 'MPEPE',
    price: 0.000042,
    priceChange24h: 12.5,
    marketCap: 425000,
    poolSize: 128500,
    holders: 342,
    cycleEnd: Date.now() + 3600000 * 3 + 1200000,
    round: 2,
    round: 2,
    totalRounds: 5,
    flipsPending: 87,
    isFoundingMember: true,
    balance: 15.432,
    image: 'https://placehold.co/48/7c3aed/ffffff?text=P',
    description: 'The dankest pepe on Monad. Absolute unit.',
    maxSupply: 1000000000,
    initialPrice: 0.000042,
    initialLiquidity: 50000,
    twitter: 'https://x.com/monadpepe',
    website: 'https://monadpepe.mon',
  };

  const MOCK_PRICES = Array.from({ length: 50 }, (_, i) => ({
    time: Date.now() - (50 - i) * 1800000,
    price: 0.000035 + Math.random() * 0.00002,
  }));

  const MOCK_HOLDERS = [
    { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f3bDc9', amount: 12500, value: 52500 },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', amount: 8400, value: 35280 },
    { address: '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', amount: 6200, value: 26040 },
    { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', amount: 4100, value: 17220 },
    { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', amount: 2800, value: 11760 },
    { address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', amount: 1900, value: 7980 },
  ];

  const MOCK_CHAT = [
    { id: '1', sender: '0x742d...3bDc9', text: 'Let\'s go MPEPE 🚀', timestamp: Date.now() - 300000 },
    { id: '2', sender: '0x8f3C...A063', text: 'when flip', timestamp: Date.now() - 240000 },
    { id: '3', sender: '0x1CBd...3C9Ec', text: 'holding strong', timestamp: Date.now() - 120000 },
    { id: '4', sender: '0xd8dA...6045', text: 'next round gonna be huge', timestamp: Date.now() - 60000 },
  ];

  let priceStr = $derived('$' + MOCK_COIN.price.toFixed(6));
  let changeClass = $derived(MOCK_COIN.priceChange24h >= 0 ? 'positive' : 'negative');
  let changeStr = $derived((MOCK_COIN.priceChange24h >= 0 ? '+' : '') + MOCK_COIN.priceChange24h.toFixed(2) + '%');
  let poolStr = $derived('$' + MOCK_COIN.poolSize.toLocaleString());
  let mcapStr = $derived('$' + MOCK_COIN.marketCap.toLocaleString());
  let supplyStr = $derived(MOCK_COIN.maxSupply ? MOCK_COIN.maxSupply.toLocaleString() : '—');
</script>

<div class="detail-page">
  <div class="back-row">
    <button class="back-btn" onclick={() => navigate('/')}>
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
  </div>

  <div class="coin-hero">
    <div class="hero-left">
      <div class="coin-id">
        {#if MOCK_COIN.image}
          <img src={MOCK_COIN.image} alt={MOCK_COIN.name} class="coin-icon" />
        {:else}
          <div class="icon-placeholder">{MOCK_COIN.symbol[0]}</div>
        {/if}
        <div>
          <div class="coin-title">
            {MOCK_COIN.name}
            {#if MOCK_COIN.isFoundingProject}
              <Badge variant="project" />
            {:else if MOCK_COIN.isFoundingMember}
              <Badge />
            {/if}
          </div>
          <span class="coin-symbol">{MOCK_COIN.symbol}</span>
        </div>
      </div>
    </div>
    <div class="hero-right">
      <div class="big-price">{priceStr}</div>
      <div class="change {changeClass}">{changeStr}</div>
    </div>
  </div>

  <div class="main-grid">
    <div class="left-col">
      {#if MOCK_COIN.description}
        <div class="desc-card">
          <p class="desc-text">{MOCK_COIN.description}</p>
          <div class="social-links">
            {#if MOCK_COIN.twitter}
              <a href={MOCK_COIN.twitter} target="_blank" rel="noopener noreferrer" class="social-link">X</a>
            {/if}
            {#if MOCK_COIN.telegram}
              <a href={MOCK_COIN.telegram} target="_blank" rel="noopener noreferrer" class="social-link">Telegram</a>
            {/if}
            {#if MOCK_COIN.website}
              <a href={MOCK_COIN.website} target="_blank" rel="noopener noreferrer" class="social-link">Website</a>
            {/if}
          </div>
        </div>
      {/if}
      <div class="chart-section">
        <PriceChart data={MOCK_PRICES} pair="{MOCK_COIN.symbol}/MON" />
      </div>
      <div class="tracker-section">
        <CycleTracker
          round={MOCK_COIN.round}
          cycleEnd={MOCK_COIN.cycleEnd}
          totalRounds={MOCK_COIN.totalRounds}
          flipsPending={MOCK_COIN.flipsPending}
        />
      </div>
      <div class="chat-section">
        <CoinChat coinId={MOCK_COIN.id} messages={MOCK_CHAT} />
      </div>
    </div>
    <div class="right-col">
      <BuyPanel coinId={MOCK_COIN.symbol} balance={MOCK_COIN.balance} />
      <div class="stats-card">
        <div class="stat-row">
          <span class="label">Market Cap</span>
          <span class="mono">{mcapStr}</span>
        </div>
        <div class="stat-row">
          <span class="label">Pool Size</span>
          <span class="mono">{poolStr}</span>
        </div>
        <div class="stat-row">
          <span class="label">Max Supply</span>
          <span class="mono">{supplyStr}</span>
        </div>
        <div class="stat-row">
          <span class="label">Next Flip</span>
          <CountdownTimer target={MOCK_COIN.cycleEnd} pulse={true} />
        </div>
      </div>
      <HolderList holders={MOCK_HOLDERS} />
    </div>
  </div>
</div>

<style>
  .detail-page {
    padding-bottom: 3rem;
  }

  .back-row {
    margin-bottom: 1.5rem;
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

  .coin-hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .hero-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .coin-id {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .icon-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    flex-shrink: 0;
    background: var(--purple-800);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--accent);
  }

  .coin-icon {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .coin-title {
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .coin-symbol {
    color: var(--text-secondary);
    font-size: 0.9375rem;
  }

  .hero-right {
    text-align: right;
  }

  .big-price {
    font-size: 1.75rem;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
  }

  .change {
    font-size: 1rem;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 0.25rem;
  }

  .positive { color: var(--success); }
  .negative { color: var(--danger); }

  .desc-card {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .desc-text {
    color: var(--text-secondary);
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .social-links {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .social-link {
    font-size: 0.8125rem;
    color: var(--accent);
    text-decoration: none;
    padding: 0.25rem 0.625rem;
    border: 1px solid var(--purple-700);
    border-radius: 6px;
    transition: background 0.15s;
  }
  .social-link:hover {
    background: var(--purple-800);
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 1.25rem;
    align-items: start;
  }

  .left-col {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .chart-section {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1rem;
  }

  .tracker-section {
  }

  .chat-section {
    min-height: 300px;
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .stats-card {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }
  .stat-row .label {
    color: var(--text-secondary);
  }
  .stat-row .mono {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .main-grid {
      grid-template-columns: 1fr;
    }

    .coin-hero {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .hero-right {
      text-align: left;
      width: 100%;
    }

    .big-price {
      font-size: 1.375rem;
    }

    .coin-title {
      font-size: 1.25rem;
    }

    .stat-row {
      font-size: 0.8125rem;
    }

    .stat-row .mono {
      max-width: 50%;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
