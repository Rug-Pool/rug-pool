<script lang="ts">
  interface Entry {
    rank: number;
    address: string;
    lossAmount: number;
    roundsSurvived: number;
    isYou?: boolean;
  }

  let { entries = [] }: { entries?: Entry[] } = $props();

  function shorten(addr: string) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
</script>

<div class="table-wrapper">
  <table>
    <thead>
      <tr>
        <th class="rank-col">#</th>
        <th>Wallet</th>
        <th class="num-col">Loss Amount</th>
        <th class="num-col">Rounds Survived</th>
      </tr>
    </thead>
    <tbody>
      {#each entries as entry (entry.rank)}
        <tr class:highlight={entry.isYou}>
          <td class="rank-col">
            {#if entry.rank === 1}
              <span class="medal gold">🥇</span>
            {:else if entry.rank === 2}
              <span class="medal silver">🥈</span>
            {:else if entry.rank === 3}
              <span class="medal bronze">🥉</span>
            {:else}
              {entry.rank}
            {/if}
          </td>
          <td class="mono addr">
            {shorten(entry.address)}
            {#if entry.isYou}
              <span class="you-badge">You</span>
            {/if}
          </td>
          <td class="num-col mono loss">-${entry.lossAmount.toLocaleString()}</td>
          <td class="num-col mono">{entry.roundsSurvived}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrapper {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--gray-700);
  }

  td {
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
    border-bottom: 1px solid var(--gray-700);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--gray-600);
  }

  .highlight td {
    background: rgba(139, 92, 246, 0.08);
  }

  .rank-col {
    width: 3rem;
    text-align: center;
  }

  .num-col {
    text-align: right;
  }

  .mono {
    font-family: 'JetBrains Mono', monospace;
  }

  .addr {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .you-badge {
    background: var(--accent);
    color: white;
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
  }

  .loss {
    color: var(--danger);
    font-weight: 600;
  }

  .medal {
    font-size: 1.25rem;
  }
</style>
