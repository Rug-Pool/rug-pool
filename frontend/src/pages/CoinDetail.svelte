<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import PriceChart from '$components/coin/PriceChart.svelte';
  import CycleTracker from '$components/coin/CycleTracker.svelte';
  import BuyPanel from '$components/coin/BuyPanel.svelte';
  import CountdownTimer from '$components/shared/CountdownTimer.svelte';
  import Badge from '$components/shared/Badge.svelte';
  import { getCoin } from '$lib/api';
  import { privyState } from '$lib/privy.svelte';
  import { onMount } from 'svelte';

  let { id }: { id: string } = $props();

  let coin: any = $state(null);
  let loading = $state(true);
  let prices: any[] = $state([]);

  onMount(async () => {
    try {
      const data = await getCoin(id);
      const cs = data.rugPool || {};
      const poolVal = Number(cs.poolValue || '0') / 1e18;
      const totalSupply = Number(cs.totalSupply || '1') / 1e18;
      const price = totalSupply > 0 ? poolVal / totalSupply : 0;
      const cycleEnd = cs.cycleDuration > 0 ? (cs.cycleStartTime + cs.cycleDuration) * 1000 : Date.now() + 86400000;
      const mcap = price * totalSupply;
      coin = {
        address: data.address,
        name: data.name,
        symbol: data.ticker,
        description: data.description,
        imageUrl: data.imageUrl,
        creator: data.creator,
        price,
        priceChange24h: 0,
        maxSupply: totalSupply,
        poolSize: poolVal,
        holders: cs.totalHolders || 0,
        cycleEnd,
        cycle: cs.cycle || 0,
        cycleDuration: cs.cycleDuration || 0,
        marketCap: mcap,
        totalRounds: 5,
        flipsPending: Math.floor((cs.totalHolders || 0) * 0.25),
        balance: +(price * ((cs.totalHolders || 0) * 0.1)).toFixed(3),
        isFoundingMember: data.badge === 'member',
        isFoundingProject: data.badge === 'project',
      };
      prices = Array.from({ length: 50 }, (_, i) => ({
        time: Date.now() - (50 - i) * 1800000,
        price: price * (0.85 + Math.random() * 0.3),
      }));
    } catch (e) {
      console.error('Failed to load coin', e);
    } finally {
      loading = false;
    }
  });

  let priceStr = $derived(coin ? '$' + coin.price.toFixed(6) : '—');
  let changeClass = $derived(coin ? (coin.priceChange24h >= 0 ? 'positive' : 'negative') : '');
  let changeStr = $derived(coin ? (coin.priceChange24h >= 0 ? '+' : '') + coin.priceChange24h.toFixed(2) + '%' : '');
  let poolStr = $derived(coin ? '$' + coin.poolSize.toLocaleString() : '—');
  let mcapStr = $derived(coin ? '$' + coin.marketCap.toLocaleString() : '—');
  let supplyStr = $derived(coin && coin.maxSupply ? coin.maxSupply.toLocaleString() : '—');
</script>

{#if loading}
  <div class="detail-page">
    <div class="not-found"><p>Loading...</p></div>
  </div>
{:else if coin}
<div class="detail-page">
  <div class="coin-hero">
    <div class="hero-left">
      <div class="coin-id">
        {#if coin.imageUrl}
          <img src={coin.imageUrl} alt={coin.name} class="coin-icon" />
        {:else}
          <div class="icon-placeholder">{coin.symbol[0]}</div>
        {/if}
        <div>
          <div class="coin-title">
            {coin.name}
            {#if coin.isFoundingProject}
              <Badge variant="project" />
            {:else if coin.isFoundingMember}
              <Badge />
            {/if}
          </div>
          <span class="coin-symbol">{coin.symbol}</span>
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
      {#if coin.description}
        <div class="desc-card">
          <p class="desc-text">{coin.description}</p>
        </div>
      {/if}
      <div class="chart-section">
        <PriceChart data={prices} pair="{coin.symbol}/MON" />
      </div>
      <div class="tracker-section">
        <CycleTracker
          round={(coin.cycle || 0) + 1}
          cycleEnd={coin.cycleEnd}
          totalRounds={coin.totalRounds}
          flipsPending={coin.flipsPending}
        />
      </div>
      <div class="tweet-actions">
        <a href="https://x.com/search?q=%24{coin.symbol}" target="_blank" rel="noopener noreferrer" class="tweet-btn secondary">Pump ${coin.symbol} on 𝕏</a>
        <a href="https://x.com/intent/tweet?text=just+bought+%24{coin.symbol}+on+%40rugpool%2C+locked+for+24hrs%2C+pray+for+me+%F0%9F%92%80+rug-pool.vercel.app" target="_blank" rel="noopener noreferrer" class="tweet-btn primary">Shill ${coin.symbol} 𝕏</a>
      </div>
    </div>
    <div class="right-col">
      <BuyPanel coinAddress={coin.address} userAddress={privyState.address} balance={coin.balance} />
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
          <span class="label">Holders</span>
          <span class="mono">{coin.holders}</span>
        </div>
        <div class="stat-row">
          <span class="label">Next Flip</span>
          <CountdownTimer target={coin.cycleEnd} pulse={true} />
        </div>
      </div>
      <div class="creator-card">
        <h3 class="creator-title">Coin Creator</h3>
        <div class="creator-addr mono">{coin.creator?.slice(0, 6)}...{coin.creator?.slice(-4) || '—'}</div>
      </div>
    </div>
  </div>
</div>
{:else}
<div class="detail-page">
  <div class="not-found">
    <h2>Coin not found</h2>
    <p>No coin with id "{id}" exists.</p>
    <button class="back-btn" onclick={() => navigate('/')}>Back to feed</button>
  </div>
</div>
{/if}

<style>
  .detail-page {
    padding-bottom: 3rem;
    max-width: 100%;
    overflow-x: hidden;
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

  .tweet-actions {
    display: flex;
    gap: 0.75rem;
  }

  .tweet-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
  }

  .tweet-btn.primary {
    background: var(--accent);
    color: white;
  }
  .tweet-btn.primary:hover {
    background: var(--accent-hover);
  }

  .tweet-btn.secondary {
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--gray-600);
  }
  .tweet-btn.secondary:hover {
    border-color: var(--gray-500);
  }

  .right-col {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .creator-card {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .creator-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .creator-addr {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--accent);
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

    .left-col,
    .right-col {
      min-width: 0;
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
