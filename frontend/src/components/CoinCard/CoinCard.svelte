<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import CountdownTimer from '$components/shared/CountdownTimer.svelte';
  import Badge from '$components/shared/Badge.svelte';

  interface Coin {
    id: string;
    name: string;
    symbol: string;
    price: number;
    priceChange24h: number;
    holders: number;
    poolSize: number;
    cycleEnd: number;
    round?: number;
    image?: string;
    isFoundingMember?: boolean;
    isFoundingProject?: boolean;
  }

  let { coin }: { coin: Coin } = $props();

  let priceStr = $derived('$' + coin.price.toFixed(6));
  let poolStr = $derived('$' + coin.poolSize.toLocaleString());
  let changeClass = $derived(coin.priceChange24h >= 0 ? 'positive' : 'negative');
  let changeStr = $derived((coin.priceChange24h >= 0 ? '+' : '') + coin.priceChange24h.toFixed(2) + '%');
</script>

<a href="#/coin/{coin.id}" class="card" onclick={(e) => { e.preventDefault(); navigate('/coin/' + coin.id); }}>
  <div class="card-header">
    <div class="coin-info">
      {#if coin.image}
        <img src={coin.image} alt={coin.name} class="coin-icon" />
      {:else}
        <div class="coin-icon-placeholder">{coin.symbol[0]}</div>
      {/if}
      <div>
        <div class="coin-name">
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
    <div class="price-info">
      <div class="price">{priceStr}</div>
      <div class="change {changeClass}">{changeStr}</div>
    </div>
  </div>

  <div class="card-body">
    <div class="stat">
      <span class="stat-label">Pool</span>
      <span class="stat-value">{poolStr}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Holders</span>
      <span class="stat-value">{coin.holders}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Cycle</span>
      <span class="stat-value">#{coin.round || 1}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Next Flip</span>
      <CountdownTimer target={coin.cycleEnd} pulse={true} />
    </div>
  </div>
</a>

<style>
  .card {
    display: block;
    background: var(--bg-card);
    border: 1px solid var(--gray-600);
    border-radius: 12px;
    padding: 1.25rem;
    transition: border-color 0.2s;
    color: var(--text-primary);
  }
  .card:hover {
    border-color: var(--accent);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .coin-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .coin-icon {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    flex-shrink: 0;
    object-fit: cover;
  }

  .coin-icon-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    flex-shrink: 0;
    background: var(--purple-800);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: var(--accent);
  }

  .coin-name {
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .coin-symbol {
    color: var(--text-secondary);
    font-size: 0.8125rem;
  }

  .price-info {
    text-align: right;
  }

  .price {
    font-weight: 700;
    font-size: 1.125rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .change {
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 0.125rem;
  }

  .positive {
    color: var(--success);
  }

  .negative {
    color: var(--danger);
  }

  .card-body {
    display: flex;
    gap: 1.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--gray-600);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  .stat-value {
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
  }

  @media (max-width: 480px) {
    .card {
      padding: 0.875rem;
    }

    .card-body {
      gap: 0.75rem;
    }

    .coin-name {
      font-size: 0.875rem;
    }

    .price {
      font-size: 0.9375rem;
    }

    .stat-value {
      font-size: 0.8125rem;
    }
  }
</style>
