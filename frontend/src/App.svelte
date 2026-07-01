<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$components/shared/Navbar.svelte';
  import Footer from '$components/shared/Footer.svelte';
  import Notification from '$components/shared/Notification.svelte';
  import { initRouter, getRoute, navigate } from '$lib/router.svelte';
  import { initPrivy, handleOAuthRedirect } from '$lib/privy.svelte';
  import Index from './pages/Index.svelte';
  import CoinDetail from './pages/CoinDetail.svelte';
  import Leaderboard from './pages/Leaderboard.svelte';
  import Onboard from './pages/Onboard.svelte';
  import Launch from './pages/Launch.svelte';
  import FAQ from './pages/FAQ.svelte';
  import Portfolio from './pages/Portfolio.svelte';
  import Terms from './pages/Terms.svelte';

  let route = $state(getRoute());
  let splash = $state(true);

  onMount(async () => {
    await initPrivy();
    await handleOAuthRedirect();
    initRouter();
    route = getRoute();
    window.addEventListener('hashchange', () => {
      route = getRoute();
    });
    setTimeout(() => { splash = false; }, 2500);
  });
</script>

{#if splash}
  <div class="splash">
    <div class="splash-inner">
      <img src="/logo.png" alt="" class="splash-logo" />
    </div>
  </div>
{:else}
  <Navbar />
  <Notification />
  <main>
    {#if route.page === 'feed'}
      <Index />
    {:else if route.page === 'coin'}
      <CoinDetail id={route.params.id} />
    {:else if route.page === 'leaderboard'}
      <Leaderboard />
    {:else if route.page === 'onboard'}
      <Onboard />
    {:else if route.page === 'faq'}
      <FAQ />
    {:else if route.page === 'launch'}
      <Launch />
    {:else if route.page === 'portfolio'}
      <Portfolio />
    {:else if route.page === 'terms'}
      <Terms />
    {/if}
  </main>

  <Footer />

  {#if route.page === 'feed'}
    <button class="fab" onclick={() => navigate('/launch')}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="2" x2="12" y2="7" />
        <line x1="12" y1="17" x2="12" y2="22" />
        <line x1="2" y1="12" x2="7" y2="12" />
        <line x1="17" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="8.46" y2="8.46" />
        <line x1="15.54" y1="15.54" x2="19.07" y2="19.07" />
        <line x1="4.93" y1="19.07" x2="8.46" y2="15.54" />
        <line x1="15.54" y1="8.46" x2="19.07" y2="4.93" />
      </svg>
      Launch Coin
    </button>
  {/if}
{/if}

<style>
  main {
    flex: 1;
    padding: 2rem 1.5rem;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  .fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--accent);
    color: white;
    padding: 1.125rem 2.25rem;
    border-radius: 9999px;
    font-size: 1.375rem;
    font-weight: 600;
    border: none;
    transition: background 0.15s, transform 0.15s;
    z-index: 200;
    cursor: pointer;
  }
  .fab:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }
  .fab:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    main {
      padding: 1.5rem 1rem;
    }

    .fab {
      bottom: 1rem;
      right: 1rem;
      padding: 0.9375rem 1.875rem;
      font-size: 1.25rem;
    }
  }

  .splash {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .splash-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .splash-logo {
    width: 100px;
    height: 100px;
    border-radius: 8px;
  }
</style>
