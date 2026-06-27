<script lang="ts">
  import { notify } from '$store/notificationStore.svelte';
  import { navigate } from '$lib/router.svelte';

  let connected = $state(false);
  let fullAddress = $state('0x742d35Cc6634C0532925a3b844Bc9e7595f3bDc9');
  let balance = $state(15.432);
  let showPopup = $state(false);

  function handleConnect() {
    connected = true;
  }

  function togglePopup(e: MouseEvent) {
    e.stopPropagation();
    showPopup = !showPopup;
  }

  function handleDisconnect() {
    connected = false;
    showPopup = false;
  }

  function handleClickOutside() {
    showPopup = false;
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(fullAddress);
      notify('Address copied', 'success');
    } catch {
      notify('Failed to copy', 'error');
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

{#if connected}
  <div class="wallet-wrapper">
    <button class="wallet-btn connected" aria-label="Wallet menu" onclick={togglePopup}>
      <span class="material-symbols-outlined">menu</span>
    </button>
    {#if showPopup}
      <div class="popup" role="dialog" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Escape') showPopup = false; }}>
        <button class="popup-address mono" onclick={copyAddress} title="Click to copy">
          {fullAddress}
          <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <div class="popup-balance">
          <span class="popup-balance-label">Balance</span>
          <span class="popup-balance-value mono">{balance.toFixed(4)} MON</span>
        </div>
        <button class="popup-nav" onclick={() => { showPopup = false; navigate('/portfolio'); }}>Portfolio</button>
        <button class="popup-logout" onclick={handleDisconnect}>Disconnect</button>
      </div>
    {/if}
  </div>
{:else}
  <button class="wallet-btn icon-only" aria-label="Connect wallet" onclick={handleConnect}>
    <span class="material-symbols-outlined">account_balance_wallet</span>
  </button>
{/if}

<style>
  .wallet-wrapper {
    position: relative;
  }

  .wallet-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background 0.15s;
    white-space: nowrap;
    cursor: pointer;
  }
  .wallet-btn:hover {
  }

  .icon-only {
    background: transparent;
    border: none;
    padding: 0.25rem;
    color: var(--text-secondary);
  }
  .icon-only:hover {
    background: transparent;
  }
  .icon-only .material-symbols-outlined {
    font-size: 1.5rem;
  }

  .connected {
    background: transparent;
    border: none;
    padding: 0.25rem;
    color: var(--text-primary);
    gap: 0.375rem;
  }
  .connected:hover {
    background: transparent;
  }
  .connected .material-symbols-outlined {
    font-size: 1.5rem;
  }

  @media (min-width: 480px) {
    .connected {
      padding: 0.25rem 0.375rem;
    }
    .label {
      display: inline;
    }
  }

  .popup {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 240px;
    background: var(--gray-800);
    border: 1px solid var(--gray-600);
    border-radius: 10px;
    padding: 0.5rem;
    z-index: 300;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .popup-address {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    font-size: 0.8125rem;
    color: var(--text-primary);
    word-break: break-all;
    padding: 0.5rem;
    background: var(--bg-primary);
    border-radius: 6px;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  .popup-address:hover {
    background: var(--gray-700);
  }

  .copy-icon {
    flex-shrink: 0;
    color: var(--text-secondary);
  }

  .popup-balance {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
  }

  .popup-balance-label {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .popup-balance-value {
    font-size: 0.875rem;
    color: var(--text-primary);
    font-weight: 600;
  }

  .popup-logout {
    background: transparent;
    color: var(--danger);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background 0.15s;
    width: 100%;
    text-align: center;
  }
  .popup-logout:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  .popup-nav {
    background: transparent;
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background 0.15s;
    width: 100%;
    text-align: left;
  }
  .popup-nav:hover {
    background: var(--gray-700);
  }
</style>
