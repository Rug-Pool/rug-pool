<script lang="ts">
  import { notify } from '$store/notificationStore.svelte';
  import { navigate } from '$lib/router.svelte';
  import { loginWithX, logout, privyState } from '$lib/privy.svelte';

  let showPopup = $state(false);

  let connected = $derived(privyState.isLoggedIn);
  let shortAddr = $derived(privyState.address ? privyState.address.slice(0, 6) + '...' + privyState.address.slice(-4) : '');

  function togglePopup(e: MouseEvent) {
    e.stopPropagation();
    showPopup = !showPopup;
  }

  function handleDisconnect() {
    logout();
    showPopup = false;
  }

  function handleClickOutside() {
    showPopup = false;
  }

  async function copyAddress() {
    if (!privyState.address) { notify('No wallet available', 'error'); return; }
    try {
      await navigator.clipboard.writeText(privyState.address);
      notify('Address copied', 'success');
    } catch {
      notify('Failed to copy', 'error');
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

{#if !privyState.isReady}
  <button class="wallet-btn icon-only" disabled>
    <span class="material-symbols-outlined">sync</span>
  </button>
{:else if connected}
  <div class="wallet-wrapper">
    <button class="wallet-btn connected" aria-label="Wallet menu" onclick={togglePopup}>
      <span class="material-symbols-outlined">menu</span>
    </button>
    {#if showPopup}
      <div class="popup" role="dialog" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Escape') showPopup = false; }}>
        <button class="popup-address mono" onclick={copyAddress} title="Click to copy">
          {shortAddr}
          <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <div class="popup-balance">
          <span class="popup-balance-label">Balance</span>
          <span class="popup-balance-value mono">{privyState.balance ?? '0.0000'} MON</span>
        </div>
        <button class="popup-nav lnk" onclick={() => { showPopup = false; navigate('/leaderboard'); }}>Leaderboard</button>
        <button class="popup-nav lnk" onclick={() => { showPopup = false; navigate('/faq'); }}>FAQ</button>
        <button class="popup-nav lnk" onclick={() => { showPopup = false; navigate('/portfolio'); }}>Portfolio</button>
        <button class="popup-logout" onclick={handleDisconnect}>Disconnect</button>
      </div>
    {/if}
  </div>
{:else}
  <button class="wallet-btn icon-only" aria-label="Login with X" onclick={loginWithX}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  </button>
{/if}

<style>
  .wallet-wrapper { position: relative; }

  .wallet-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    color: white; padding: 0.5rem 1.25rem; border-radius: 8px;
    font-size: 0.875rem; font-weight: 600;
    transition: background 0.15s; white-space: nowrap; cursor: pointer;
  }
  .icon-only {
    background: transparent; border: none; padding: 0.25rem; color: var(--text-secondary);
  }
  .icon-only svg { width: 1.5rem; height: 1.5rem; display: block; }
  .connected {
    background: transparent; border: none; padding: 0.25rem; color: var(--text-primary); gap: 0.375rem;
  }
  @media (min-width: 480px) { .connected { padding: 0.25rem 0.375rem; } }

  .popup {
    position: absolute; top: calc(100% + 6px); right: 0; min-width: 240px;
    background: var(--accent); border: 1px solid var(--accent-hover);
    border-radius: 10px; padding: 0.5rem; z-index: 300;
    display: flex; flex-direction: column; gap: 0.25rem;
  }
  .popup-address {
    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%;
    font-size: 0.8125rem; color: black; word-break: break-all; padding: 0.5rem;
    background: rgba(0,0,0,0.1); border-radius: 6px; border: none; cursor: pointer; text-align: left;
  }
  .popup-address:hover { background: rgba(0,0,0,0.15); }
  .copy-icon { flex-shrink: 0; color: black; }
  .popup-balance { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; }
  .popup-balance-label { font-size: 0.8125rem; color: black; opacity: 0.7; }
  .popup-balance-value { font-size: 0.875rem; color: black; font-weight: 600; }
  .popup-logout {
    background: transparent; color: black; font-size: 0.875rem; font-weight: 600;
    padding: 0.5rem; border-radius: 6px; width: 100%; text-align: center;
  }
  .popup-logout:hover { background: rgba(0,0,0,0.1); }
  .popup-nav {
    background: transparent; color: black; font-size: 0.875rem; font-weight: 600;
    padding: 0.5rem; border-radius: 6px; width: 100%; text-align: left;
  }
  .popup-nav:hover { background: rgba(0,0,0,0.1); }
  .lnk { display: none; }
  @media (max-width: 640px) { .lnk { display: block; } }
</style>
