<script lang="ts">
  interface Holder {
    address: string;
    amount: number;
    value: number;
  }

  let { holders = [] }: { holders?: Holder[] } = $props();

  function shorten(addr: string) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  let totalValue = $derived(holders.reduce((s, h) => s + h.value, 0));
</script>

<div class="holder-list">
  <div class="header">
    <h3 class="title">Holders ({holders.length})</h3>
    <span class="total mono">${totalValue.toLocaleString()}</span>
  </div>

  {#if holders.length === 0}
    <p class="empty">No holders yet</p>
  {:else}
    <div class="list">
      {#each holders as holder, i}
        <div class="holder-row">
          <div class="rank">#{i + 1}</div>
          <div class="addr mono">{shorten(holder.address)}</div>
          <div class="stats">
            <span class="amt mono">{holder.amount.toFixed(2)}</span>
            <span class="val mono">${holder.value.toLocaleString()}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .holder-list {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1.25rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .title {
    font-size: 1rem;
    font-weight: 600;
  }

  .total {
    font-size: 0.875rem;
    color: var(--accent);
    font-weight: 700;
  }

  .empty {
    color: var(--text-secondary);
    font-size: 0.875rem;
    text-align: center;
    padding: 1rem 0;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .holder-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background 0.15s;
  }
  .holder-row:hover {
    background: var(--gray-600);
  }

  .rank {
    width: 1.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .addr {
    flex: 1;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .stats {
    display: flex;
    gap: 0.5rem;
    text-align: right;
    flex-shrink: 0;
  }

  .amt {
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .val {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    text-align: right;
  }
</style>
