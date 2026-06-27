<script lang="ts">
  import CountdownTimer from '$components/shared/CountdownTimer.svelte';
  import Badge from '$components/shared/Badge.svelte';

  type Filter = 'all' | 'active' | 'pumped' | 'rugged';

  interface Entry {
    id: string;
    symbol: string;
    name: string;
    status: 'active' | 'pumped' | 'rugged';
    entryPrice: number;
    currentPrice?: number;
    exitPrice?: number;
    amount: number;
    cycleEnd?: number;
    round?: number;
    pnl?: number;
    pnlPercent?: number;
    image?: string;
    isFoundingMember?: boolean;
    isFoundingProject?: boolean;
  }

  let filter = $state<Filter>('all');
  let buyAmounts: Record<string, string> = {};

  let entries: Entry[] = [
    { id: 'mpepe', symbol: 'MPEPE', name: 'Monad Pepe', status: 'active', entryPrice: 0.000038, currentPrice: 0.000042, amount: 240, cycleEnd: Date.now() + 3600000 * 3 + 1200000, round: 2, image: 'https://placehold.co/40/7c3aed/ffffff?text=P', isFoundingProject: true },
    { id: 'rdoge', symbol: 'RDOGE', name: 'Rug Doge', status: 'rugged', entryPrice: 0.000050, exitPrice: 0.000031, amount: 240, pnl: -89, pnlPercent: -38, isFoundingMember: true },
    { id: 'crab', symbol: 'CRAB', name: 'Crab Coin', status: 'pumped', entryPrice: 0.000010, exitPrice: 0.000018, amount: 260, pnl: 210, pnlPercent: 80 },
    { id: 'mcat', symbol: 'MCAT', name: 'Monad Cat', status: 'active', entryPrice: 0.000004, currentPrice: 0.000005, amount: 180, cycleEnd: Date.now() + 1800000, round: 3, image: 'https://placehold.co/40/7c3aed/ffffff?text=C' },
    { id: 'pog', symbol: 'POG', name: 'Pog Coin', status: 'rugged', entryPrice: 0.000012, exitPrice: 0.000007, amount: 120, pnl: -46, pnlPercent: -39, isFoundingMember: true },
  ];

  let filtered = $derived(
    filter === 'all' ? entries : entries.filter(e => e.status === filter)
  );

  let activeValue = $derived(
    entries.filter(e => e.status === 'active').reduce((sum, e) => {
      const multiplier = (e.currentPrice ?? 0) / e.entryPrice;
      return sum + e.amount * multiplier;
    }, 0)
  );

  let totalProfit = $derived(
    entries.filter(e => e.status === 'pumped').reduce((sum, e) => sum + (e.pnl ?? 0), 0)
  );

  let totalLost = $derived(
    Math.abs(entries.filter(e => e.status === 'rugged').reduce((sum, e) => sum + (e.pnl ?? 0), 0))
  );

  let totalDeployed = $derived(
    entries.reduce((sum, e) => sum + e.amount, 0)
  );

  let ruggedExits = $derived(
    entries.filter(e => e.status === 'rugged').reduce((sum, e) => {
      const ratio = (e.exitPrice ?? 0) / e.entryPrice;
      return sum + e.amount * ratio;
    }, 0)
  );

  let pumpedExits = $derived(
    entries.filter(e => e.status === 'pumped').reduce((sum, e) => {
      const pnl = e.pnl ?? 0;
      return sum + e.amount + pnl;
    }, 0)
  );

  let totalBalance = $derived(activeValue + ruggedExits + pumpedExits);
  let netPnl = $derived(totalBalance - totalDeployed);
  let pnlPercent = $derived(totalDeployed > 0 ? (netPnl / totalDeployed) * 100 : 0);

  let positions = $derived(entries.filter(e => e.status === 'active').length);
</script>

<div class="page">
  <div class="portfolio-header">
    <h1>My Portfolio</h1>
    <div class="header-stats">
      <div class="header-main">
        <div class="stat-group">
          <span class="stat-value">${totalBalance.toFixed(2)}</span>
          <span class="stat-label">Total Balance</span>
        </div>
        <div class="stat-group">
          <span class="stat-value" class:positive={netPnl >= 0} class:negative={netPnl < 0}>
            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}% {pnlPercent >= 0 ? '\u2191' : '\u2193'}
          </span>
          <span class="stat-label">Overall P&L</span>
        </div>
      </div>
      <div class="header-sub">
        <span class="sub-item">${activeValue.toFixed(0)} Active</span>
        <span class="sub-divider">&bull;</span>
        <span class="sub-item positive">+${totalProfit.toFixed(0)} Profit</span>
        <span class="sub-divider">&bull;</span>
        <span class="sub-item negative">-${totalLost.toFixed(0)} Lost</span>
        <span class="sub-divider">&bull;</span>
        <span class="sub-item">{positions} Position{positions !== 1 ? 's' : ''}</span>
      </div>
    </div>
  </div>

  <div class="filters">
    {#each ['all', 'active', 'pumped', 'rugged'] as f}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <button
        class="filter-btn"
        class:active={filter === f}
        onclick={() => filter = f}
      >
        {#if f === 'all'}
          All
        {:else if f === 'active'}
          Active
        {:else if f === 'pumped'}
          Pumped
        {:else}
          Rugged
        {/if}
      </button>
    {/each}
  </div>

  <div class="entries">
    {#each filtered as entry (entry.id)}
      <div class="entry-card {entry.status}">
        {#if entry.status === 'active'}
          <div class="entry-header">
            <div class="entry-title">
              <span class="status-dot yellow"></span>
              {#if entry.image}
                <img src={entry.image} alt={entry.name} class="entry-icon" />
              {:else}
                <div class="entry-icon-placeholder">{entry.symbol[0]}</div>
              {/if}
              <span class="entry-symbol">{entry.symbol}</span>
              {#if entry.isFoundingProject}
                <Badge variant="project" />
              {:else if entry.isFoundingMember}
                <Badge />
              {/if}
            </div>
          </div>
          <div class="entry-body">
            <div class="entry-row">
              <span class="label">Entry:</span>
              <span class="mono">${entry.entryPrice.toFixed(6)}</span>
            </div>
            <div class="entry-row">
              <span class="label">Current:</span>
              <span class="mono">
                ${(entry.currentPrice ?? 0).toFixed(6)}
                <span class="change positive">+{(((entry.currentPrice ?? 0) - entry.entryPrice) / entry.entryPrice * 100).toFixed(1)}%</span>
              </span>
            </div>
            <div class="entry-row">
              <span class="label">Amount:</span>
              <span class="mono">${entry.amount}</span>
            </div>
            <div class="entry-row">
              <span class="label">Flip in:</span>
              <CountdownTimer target={entry.cycleEnd!} pulse={true} />
            </div>
            <div class="entry-row">
              <span class="label">Round:</span>
              <span class="mono">#{entry.round}</span>
            </div>
          </div>

        {:else if entry.status === 'rugged'}
          <div class="entry-header">
            <div class="entry-title">
              <span class="status-dot red"></span>
              {#if entry.image}
                <img src={entry.image} alt={entry.name} class="entry-icon" />
              {:else}
                <div class="entry-icon-placeholder">{entry.symbol[0]}</div>
              {/if}
              <span class="entry-symbol">{entry.symbol}</span>
              {#if entry.isFoundingProject}
                <Badge variant="project" />
              {:else if entry.isFoundingMember}
                <Badge />
              {/if}
            </div>
            <span class="status-badge rugged-badge">RUGGED</span>
          </div>
          <div class="entry-body">
            <div class="entry-row">
              <span class="label">Entry:</span>
              <span class="mono">${entry.entryPrice.toFixed(6)}</span>
            </div>
            <div class="entry-row">
              <span class="label">Exit:</span>
              <span class="mono">${(entry.exitPrice ?? 0).toFixed(6)} <span class="change negative">{entry.pnlPercent}%</span></span>
            </div>
            <div class="entry-row">
              <span class="label">Lost:</span>
              <span class="mono red">${Math.abs(entry.pnl ?? 0)}</span>
            </div>
          </div>
          <div class="entry-actions">
            <input
              type="number"
              placeholder="Amount"
              value={buyAmounts[entry.id] ?? ''}
              oninput={(e) => buyAmounts[entry.id] = (e.target as HTMLInputElement).value}
              class="buy-input"
            />
            <button class="buy-again-btn">Buy Again</button>
          </div>

        {:else if entry.status === 'pumped'}
          <div class="entry-header">
            <div class="entry-title">
              <span class="status-dot green"></span>
              {#if entry.image}
                <img src={entry.image} alt={entry.name} class="entry-icon" />
              {:else}
                <div class="entry-icon-placeholder">{entry.symbol[0]}</div>
              {/if}
              <span class="entry-symbol">{entry.symbol}</span>
              {#if entry.isFoundingProject}
                <Badge variant="project" />
              {:else if entry.isFoundingMember}
                <Badge />
              {/if}
            </div>
            <span class="status-badge pumped-badge">PUMPED</span>
          </div>
          <div class="entry-body">
            <div class="entry-row">
              <span class="label">Entry:</span>
              <span class="mono">${entry.entryPrice.toFixed(6)}</span>
            </div>
            <div class="entry-row">
              <span class="label">Exit:</span>
              <span class="mono">${(entry.exitPrice ?? 0).toFixed(6)} <span class="change positive">+{entry.pnlPercent}%</span></span>
            </div>
            <div class="entry-row">
              <span class="label">Profit:</span>
              <span class="mono green">${entry.pnl}</span>
            </div>
          </div>
          <div class="entry-actions">
            <input
              type="number"
              placeholder="Amount"
              value={buyAmounts[entry.id] ?? ''}
              oninput={(e) => buyAmounts[entry.id] = (e.target as HTMLInputElement).value}
              class="buy-input"
            />
            <button class="buy-again-btn">Buy Again</button>
          </div>
        {/if}
      </div>
    {/each}

    {#if filtered.length === 0}
      <p class="empty">No entries found.</p>
    {/if}
  </div>
</div>

<style>
  .page {
    padding-bottom: 3rem;
  }

  .portfolio-header {
    background: var(--bg-card);
    border: 1px solid var(--gray-600);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .portfolio-header h1 {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .header-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-main {
    display: flex;
    gap: 2.5rem;
  }

  .stat-group {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
  }
  .stat-value.positive { color: #22c55e; }
  .stat-value.negative { color: #ef4444; }

  .stat-label {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .header-sub {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    flex-wrap: wrap;
  }

  .sub-item {
    color: var(--text-secondary);
  }
  .sub-item.positive { color: #22c55e; }
  .sub-item.negative { color: #ef4444; }

  .sub-divider {
    color: var(--gray-500);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    background: var(--bg-card);
    border: 1px solid var(--gray-600);
    color: var(--text-secondary);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }
  .filter-btn.active {
    border-color: var(--accent);
    color: var(--text-primary);
  }
  .filter-btn:hover {
    border-color: var(--gray-500);
  }

  .entries {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
  }

  .entry-card {
    background: var(--bg-card);
    border: 1px solid var(--gray-600);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .entry-card.rugged {
    border-color: rgba(239, 68, 68, 0.3);
  }
  .entry-card.pumped {
    border-color: rgba(34, 197, 94, 0.3);
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .entry-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .entry-icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    flex-shrink: 0;
    object-fit: cover;
  }

  .entry-icon-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    flex-shrink: 0;
    background: var(--purple-800);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8125rem;
    color: var(--accent);
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .status-dot.yellow { background: #eab308; }
  .status-dot.green { background: #22c55e; }
  .status-dot.red { background: #ef4444; }

  .entry-symbol {
    font-weight: 700;
    font-size: 1.0625rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .status-badge {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
  .rugged-badge {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  .pumped-badge {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .entry-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .entry-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .label {
    color: var(--text-secondary);
  }

  .mono {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .change {
    font-size: 0.8125rem;
    font-weight: 600;
  }
  .positive { color: #22c55e; }
  .negative { color: #ef4444; }

  .green { color: #22c55e; }
  .red { color: #ef4444; }

  .entry-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--gray-700);
  }

  .buy-input {
    flex: 1;
    background: var(--bg-primary);
    border: 1px solid var(--gray-600);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    min-width: 0;
  }
  .buy-input::placeholder {
    color: var(--gray-500);
  }
  .buy-input:focus {
    border-color: var(--accent);
  }

  .buy-again-btn {
    background: var(--accent);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .buy-again-btn:hover {
    background: var(--accent-hover);
  }

  .empty {
    color: var(--text-secondary);
    font-size: 0.9375rem;
    text-align: center;
    padding: 3rem 0;
    grid-column: 1 / -1;
  }

  @media (max-width: 640px) {
    .portfolio-header {
      padding: 1rem;
    }

    .header-main {
      gap: 1.5rem;
    }

    .stat-value {
      font-size: 1.25rem;
    }

    .header-sub {
      font-size: 0.8125rem;
      gap: 0.375rem;
    }

    .entry-card {
      padding: 1rem;
    }

    .entry-row {
      font-size: 0.8125rem;
    }

    .mono {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .entry-actions {
      flex-wrap: wrap;
    }

    .buy-input {
      min-width: 0;
      width: 0;
    }

    .entries {
      grid-template-columns: 1fr;
    }
  }
</style>
