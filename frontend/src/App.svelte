<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$components/shared/Navbar.svelte';
  import Notification from '$components/shared/Notification.svelte';
  import { initRouter, getRoute, navigate } from '$lib/router.svelte';
  import Index from './pages/Index.svelte';
  import CoinDetail from './pages/CoinDetail.svelte';
  import Leaderboard from './pages/Leaderboard.svelte';
  import Onboard from './pages/Onboard.svelte';
  import Launch from './pages/Launch.svelte';
  import FAQ from './pages/FAQ.svelte';
  import Portfolio from './pages/Portfolio.svelte';

  let route = $state(getRoute());

  onMount(() => {
    initRouter();
    route = getRoute();
    window.addEventListener('hashchange', () => {
      route = getRoute();
    });
  });
</script>

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
  {/if}
</main>

{#if route.page !== 'launch'}
  <button class="fab" onclick={() => navigate('/launch')}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
    Launch Coin
  </button>
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
</style>
