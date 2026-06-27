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

  const MOCK_COINS = [
    {
      id: 'monad-pepe',
      name: 'Monad Pepe',
      symbol: 'MPEPE',
      price: 0.000042,
      priceChange24h: 12.5,
      holders: 342,
      poolSize: 128500,
      cycleEnd: Date.now() + 3600000 * 3 + 1200000,
      round: 2,
      image: 'https://placehold.co/40/7c3aed/ffffff?text=P',
      description: 'The dankest pepe on Monad. Absolute unit.',
      maxSupply: 1000000000,
      initialPrice: 0.000042,
      initialLiquidity: 50000,
      twitter: 'https://x.com/monadpepe',
      website: 'https://monadpepe.mon',
    },
    {
      id: 'rug-doge',
      name: 'Rug Doge',
      symbol: 'RDOGE',
      price: 0.000128,
      priceChange24h: -8.3,
      holders: 189,
      poolSize: 94200,
      cycleEnd: Date.now() + 3600000 * 22 + 300000,
      round: 1,
      description: 'Much wow. Very rug. Such doge.',
      maxSupply: 500000000,
      initialPrice: 0.000128,
      initialLiquidity: 25000,
      twitter: 'https://x.com/rugdoge',
      telegram: 'https://t.me/rugdoge',
    },
    {
      id: 'monad-cat',
      name: 'Monad Cat',
      symbol: 'MCAT',
      price: 0.000005,
      priceChange24h: 45.2,
      holders: 521,
      poolSize: 215000,
      cycleEnd: Date.now() + 1800000,
      round: 3,
      isFoundingMember: true,
      description: 'Cat coin on Monad. Meow.',
      maxSupply: 10000000000,
      initialPrice: 0.000005,
      initialLiquidity: 10000,
      telegram: 'https://t.me/monadcat',
    },
    {
      id: 'pog-coin',
      name: 'Pog Coin',
      symbol: 'POG',
      price: 0.000009,
      priceChange24h: -2.1,
      holders: 76,
      poolSize: 32100,
      cycleEnd: Date.now() + 3600000 * 8 + 450000,
      round: 4,
      isFoundingProject: true,
      description: 'Poggers only. Certified banger.',
      maxSupply: 2000000000,
      initialPrice: 0.000009,
      initialLiquidity: 15000,
      twitter: 'https://x.com/pogcoin',
      website: 'https://pogcoin.xyz',
    },
    {
      id: 'wagmi-token',
      name: 'WAGMI Token',
      symbol: 'WAGMI',
      price: 0.000321,
      priceChange24h: 3.7,
      holders: 1054,
      poolSize: 567000,
      cycleEnd: Date.now() + 3600000 * 5 + 600000,
      round: 2,
      isFoundingMember: true,
      description: 'We are all gonna make it.',
      maxSupply: 500000000,
      initialPrice: 0.000321,
      initialLiquidity: 100000,
      twitter: 'https://x.com/wagmitoken',
      telegram: 'https://t.me/wagmitoken',
      website: 'https://wagmi.mon',
    },
    {
      id: 'based-mon',
      name: 'Based Mon',
      symbol: 'BMON',
      price: 0.000067,
      priceChange24h: -15.8,
      holders: 215,
      poolSize: 78900,
      cycleEnd: Date.now() + 600000,
      round: 1,
      description: 'Based and Mon-pilled.',
      maxSupply: 800000000,
      initialPrice: 0.000067,
      initialLiquidity: 30000,
    },
  ];
</script>

<svelte:window onclick={handleWindowClick} />

<div class="page">
  <div class="stats-bar">
    <div class="stat" onclick={(e) => { e.stopPropagation(); toggleTooltip('pool', e); }}>
      <span class="stat-value">$2.4M</span>
      <span class="stat-label">Total Pool</span>
      {#if activeTooltip === 'pool'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.pool.desc}</div>
      {/if}
    </div>
    <div class="stat" onclick={(e) => { e.stopPropagation(); toggleTooltip('coins', e); }}>
      <span class="stat-value">6</span>
      <span class="stat-label">Active Coins</span>
      {#if activeTooltip === 'coins'}
        <div class="tooltip" style="top: {tooltipY}px" onclick={(e) => e.stopPropagation()}>{STAT_TOOLTIPS.coins.desc}</div>
      {/if}
    </div>
    <div class="stat holders" style="padding-bottom: 0" onclick={(e) => { e.stopPropagation(); toggleTooltip('holders', e); }}>
      <span class="stat-value">2,397</span>
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
      <h1>Memes on Monad</h1>
      <p class="subtitle">The rug is scheduled. The dev is locked in too.</p>
    </div>
  </div>

  <div class="coin-grid">
    {#each MOCK_COINS as coin (coin.id)}
      <CoinCard {coin} />
    {/each}
  </div>
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
    color: var(--accent);
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
</style>
