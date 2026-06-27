<script lang="ts">
  let { coinId, balance = 0 }: { coinId: string; balance?: number } = $props();

  let amount = $state('');
  let isBuying = $state(false);

  function handleBuy() {
    if (!amount || isBuying) return;
    isBuying = true;
    setTimeout(() => {
      isBuying = false;
      amount = '';
    }, 2000);
  }

  let isValid = $derived(amount.length > 0 && !isNaN(Number(amount)) && Number(amount) > 0);
</script>

<div class="panel">
  <h3 class="panel-title">Buy {coinId}</h3>
  <div class="input-group">
    <input
      type="number"
      bind:value={amount}
      placeholder="0.0"
      min="0"
      step="any"
      class="amount-input"
    />
    <span class="token-label">MON</span>
  </div>
  <div class="balance-row">
    <span class="label">Balance</span>
    <span class="mono">{balance.toFixed(4)} MON</span>
  </div>
  <button
    class="buy-btn"
    disabled={!isValid || isBuying}
    onclick={handleBuy}
  >
    {isBuying ? 'Buying...' : isValid ? `Buy for ${Number(amount).toFixed(4)} MON` : 'Enter Amount'}
  </button>
</div>

<style>
  .panel {
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 10px;
    padding: 1.25rem;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .input-group {
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    border: 1px solid var(--gray-600);
    border-radius: 8px;
    padding: 0 1rem;
    margin-bottom: 0.5rem;
  }
  .input-group:focus-within {
    border-color: var(--accent);
  }

  .amount-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    padding: 0.75rem 0;
  }
  .amount-input::placeholder {
    color: var(--gray-500);
  }
  .amount-input::-webkit-inner-spin-button,
  .amount-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  .token-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--accent);
    white-space: nowrap;
  }

  .balance-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8125rem;
    margin-bottom: 1rem;
    gap: 0.5rem;
  }
  .balance-row .label {
    color: var(--text-secondary);
    flex-shrink: 0;
  }
  .balance-row .mono {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .buy-btn {
    width: 100%;
    background: var(--accent);
    color: white;
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .buy-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  .buy-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
