<script lang="ts">
  import CoinCard from '$components/CoinCard/CoinCard.svelte';

  let activeTooltip = $state<string | null>(null);
  let tooltipY = $state(0);

  const STAT_TOOLTIPS: Record<string, { desc: string; hint: string }> = {
    pool: {
      desc: 'The combined value of all protocol treasury across every active coin. This is the money the platform is sitting on right now. High number = platform has real skin in the game. Makes new visitors trust there\'s real money moving.',
      hint: 'Total value locked in active coins',
    },
    coins: {
      desc: 'How many coins are currently live with holders locked in. Shows the platform is active. Grows as more projects launch and pay the $10 yellow badge or $1 blue badge fee.',
      hint: 'Live coins with active locks',
    },
    holders: {
      desc: 'Every unique wallet currently locked across all coins. Not historical — live right now. This is your proof of activity number. The one you screenshot when pitching to investors or KOLs.',
      hint: 'Unique wallets locked right now',
    },
    volume: {
      desc: 'Total buy volume in the last 24 hours across all coins. Standard trading metric. Tells serious players whether there\'s liquidity worth entering.',
      hint: 'Buy volume past 24 hours',
    },
    rugged: {
      desc: 'The cumulative value auto-sold by the protocol since launch. Every flip that landed heads contributed to this number. It only goes up. This is the platform\'s body count displayed proudly. The higher it gets the more legendary the platform feels.',
      hint: 'Total value rugged since launch',
    },
    survivors: {
      desc: 'Wallets currently holding Tails — still locked, still in the game, haven\'t been rugged yet. These are the people sweating right now. Everyone else is watching them. Creates live tension just by existing as a number.',
      hint: 'Wallets still holding strong',
    },
  };

  function toggleTooltip(id: string, e: MouseEvent) {
    if (activeTooltip === id) {
      activeTooltip = null;
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipY = rect.bottom + 6;
    activeTooltip = id;
  }

  function handleWindowClick() {
    activeTooltip = null;
  }

  import { getCoins } from '$lib/api';
  import { onMount } from 'svelte';

  let allCoins = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const data = await getCoins();
      allCoins = data.map((c: any) => {
        const cs = c.rugPool || {};
        const poolVal = Number(cs.poolValue || '0') / 1e18;
        const totalSupply = Number(cs.totalSupply || '1') / 1e18;
        const price = totalSupply > 0 ? poolVal / totalSupply : 0;
        const cycleEnd = cs.cycleDuration > 0 ? (cs.cycleStartTime + cs.cycleDuration) * 1000 : Date.now() + 86400000;
        return {
          id: c.address,
          name: c.name,
          symbol: c.ticker,
          price,
          priceChange24h: 0,
          holders: cs.totalHolders || 0,
          poolSize: poolVal,
          cycleEnd,
          round: (cs.cycle || 0) + 1,
          image: c.imageUrl || '',
          isFoundingMember: c.badge === 'member',
          isFoundingProject: c.badge === 'project',
        };
      });
    } catch (e) {
      console.error('Failed to load coins', e);
    } finally {
      loading = false;
    }
  });

  const ITEMS_PER_PAGE = 10;
  let displayedCount = $state(ITEMS_PER_PAGE);

  const paginatedCoins = $derived(allCoins.slice(0, displayedCount));
  const hasMore = $derived(displayedCount < allCoins.length);

  function loadMore() {
    const next = displayedCount + ITEMS_PER_PAGE;
    displayedCount = Math.min(next, allCoins.length);
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="page">
  <div class="stats-bar">
    <div class="stat pool-chart" onclick={(e) => { e.stopPropagation(); toggleTooltip('pool', e); }}>
          <span class="stat-value">${(allCoins.reduce((s, c) => s + c.poolSize, 0)).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          <span class="stat-label">Total Pool</span>
      <svg class="stat-bg-chart" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path d="M0 28 C10 30 12 18 20 16 S30 22 36 12 S46 8 50 6 S58 16 66 10 S74 14 80 4 S88 12 100 2" fill="none" stroke="#22c55e" stroke-width="1.5" opacity="1" />
      </svg>
      {#if activeTooltip === 'pool'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.pool.desc}</div>
      {/if}
    </div>
    <div class="stat" onclick={(e) => { e.stopPropagation(); toggleTooltip('coins', e); }}>
      <span class="stat-value">{allCoins.filter(c => c.holders > 0).length}</span>
      <span class="stat-label">Active Coins</span>
      {#if activeTooltip === 'coins'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.coins.desc}</div>
      {/if}
    </div>
    <div class="stat holders" style="padding-bottom: 0" onclick={(e) => { e.stopPropagation(); toggleTooltip('holders', e); }}>
      <span class="stat-value">{allCoins.reduce((s, c) => s + c.holders, 0).toLocaleString()}</span>
      <span class="stat-label">Total Holders</span>
      <img src="/bg3.gif" alt="" class="stat-bg-img" />
      {#if activeTooltip === 'holders'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.holders.desc}</div>
      {/if}
    </div>
    <div class="stat" onclick={(e) => { e.stopPropagation(); toggleTooltip('volume', e); }}>
      <span class="stat-value">$48K</span>
      <span class="stat-label">24h Volume</span>
      {#if activeTooltip === 'volume'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.volume.desc}</div>
      {/if}
    </div>
    <div class="stat rugged" style="background-image: url(/bg1.gif);" onclick={(e) => { e.stopPropagation(); toggleTooltip('rugged', e); }}>
      <span class="stat-value">$892K</span>
      <span class="stat-label">Total Rugged</span>
      {#if activeTooltip === 'rugged'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.rugged.desc}</div>
      {/if}
    </div>
    <div class="stat survivors" style="background-image: url(/bg2.gif);" onclick={(e) => { e.stopPropagation(); toggleTooltip('survivors', e); }}>
      <span class="stat-value">147</span>
      <span class="stat-label">Survivors</span>
      {#if activeTooltip === 'survivors'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.survivors.desc}</div>
      {/if}
    </div>
  </div>

  <div class="page-header">
    <div>
      <p class="subtitle">Buy, shill, pray, holds, dumps — all inevitable.</p>
      <h1>$memelords</h1>
    </div>
  </div>

  <div class="coin-grid">
    {#each paginatedCoins as coin (coin.id)}
      <CoinCard {coin} />
    {/each}
  </div>

  {#if hasMore}
    <div class="load-more-wrapper">
      <button class="load-more-btn" onclick={loadMore} disabled={loading}>
        {loading ? 'Loading...' : `Load More (${ALL_COINS.length - displayedCount} left)`}
      </button>
    </div>
  {/if}
</div>

<style>
  .page {
    padding-bottom: 3rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
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

  .emoji-white {
    filter: brightness(0) saturate(100%) invert(1);
  }

  .stats-bar {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .stats-bar .stat {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    background-size: cover;
    background-position: center;
  }

  .stats-bar .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-primary);
  }

  .stats-bar .survivors {
    border-color: #a3e635;
  }
  .stats-bar .survivors .stat-value,
  .stats-bar .survivors .stat-label {
    color: white;
  }

  .stats-bar .rugged {
    border-color: var(--red-500);
  }
  .stats-bar .rugged .stat-value,
  .stats-bar .rugged .stat-label {
    color: white;
  }

  .stats-bar .stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  .stat-bg-img {
    position: absolute;
    bottom: 0px;
    right: 4px;
    width: 40px;
    height: 40px;
    border-radius: 4px;
    pointer-events: none;
    opacity: 0.6;
  }

  .stat-bg-chart {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.35;
    border-radius: 10px;
  }

  .tooltip {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    max-width: min(90vw, 320px);
    background: #2563eb;
    border: 1px solid #60a5fa;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.8125rem;
    color: white;
    line-height: 1.5;
    z-index: 50;
    pointer-events: auto;
  }

  .coin-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 640px) {
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }

    .stats-bar {
      grid-template-columns: repeat(2, 1fr);
    }

    .stats-bar .stat:nth-child(5),
    .stats-bar .stat:nth-child(6) {
      grid-column: 1 / -1;
    }

    .coin-grid {
      grid-template-columns: 1fr;
    }
  }

  .load-more-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    margin-bottom: 3rem;
  }

  .load-more-btn {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 999px;
    padding: 0.75rem 1.5rem;
    color: var(--text-primary);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .load-more-btn:hover:not(:disabled) {
    border-color: #2563eb;
    background: #1e3a5f;
  }

  .load-more-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
