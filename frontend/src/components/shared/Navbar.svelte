<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { navigate } from '$lib/router.svelte';
  import WalletButton from './WalletButton.svelte';

  let hidden = $state(false);
  let lastScrollY = $state(0);
  let searchOpen = $state(false);
  let searchQuery = $state('');
  let searchInput: HTMLInputElement | undefined = $state();

  let isFeed = $derived(!window.location.hash || window.location.hash === '#/' || window.location.hash === '#');

  function handleScroll() {
    const y = window.scrollY;
    if (y > 60 && y > lastScrollY) {
      hidden = true;
    } else if (y < lastScrollY) {
      hidden = false;
    }
    lastScrollY = y;
  }

  function openSearch() {
    searchOpen = true;
    requestAnimationFrame(() => searchInput?.focus());
  }

  function closeSearch() {
    searchOpen = false;
    searchQuery = '';
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Search:', searchQuery.trim());
    }
    if (e.key === 'Escape') {
      closeSearch();
    }
  }

  onMount(() => {
    lastScrollY = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
  });

  onDestroy(() => {
    window.removeEventListener('scroll', handleScroll);
  });
</script>

<nav class:hidden>
  <div class="nav-inner">
    <a href="#/" class="logo" onclick={(e) => { e.preventDefault(); navigate('/'); }}>
      {#if isFeed}
        <img src="/logo.png" alt="Rug Pool" class="logo-img" />
      {:else}
        <span class="material-symbols-outlined back-icon">arrow_back</span>
      {/if}
    </a>
    <div class="spacer"></div>
    {#if searchOpen}
      <input
        type="text"
        class="search-input"
        placeholder="Search coins..."
        bind:value={searchQuery}
        bind:this={searchInput}
        onkeydown={handleSearchKeydown}
      />
      <button class="close-btn" aria-label="Close search" onclick={closeSearch}>
        <span class="material-symbols-outlined">close</span>
      </button>
    {:else}
      <div class="links">
        <a href="#/leaderboard" class="link" onclick={(e) => { e.preventDefault(); navigate('/leaderboard'); }}>Leaderboard</a>
        <a href="#/faq" class="link" onclick={(e) => { e.preventDefault(); navigate('/faq'); }}>FAQ</a>
      </div>
      <button class="search-btn" aria-label="Search" onclick={openSearch}>
        <span class="material-symbols-outlined">search</span>
      </button>
      <WalletButton />
    {/if}
  </div>
</nav>

<style>
  nav {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--gray-700);
    position: sticky;
    top: 0;
    z-index: 100;
    transition: transform 0.3s ease;
  }
  nav.hidden {
    transform: translateY(-100%);
  }

  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 56px;
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
  }
  .logo:hover {
    color: var(--text-primary);
  }

  .logo-img {
    height: 45px;
    width: auto;
    display: block;
  }

  .back-icon {
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  .spacer {
    flex: 1;
  }

  .links {
    display: flex;
    gap: 1.25rem;
  }

  .link {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.15s;
  }
  .link:hover {
    color: var(--text-primary);
  }

  .search-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    padding: 0.25rem;
    transition: color 0.15s;
    cursor: pointer;
  }
  .search-btn:hover {
    color: var(--text-primary);
  }
  .search-btn .material-symbols-outlined {
    font-size: 1.5rem;
  }

  .search-input {
    background: var(--gray-700);
    border: 1px solid var(--gray-600);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: var(--text-primary);
    width: 30vw;
    max-width: 400px;
    transition: border-color 0.15s;
    font-family: inherit;
  }
  .search-input::placeholder {
    color: var(--gray-500);
  }
  .search-input:focus {
    border-color: var(--accent);
    outline: none;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    padding: 0.25rem;
    transition: color 0.15s;
    cursor: pointer;
  }
  .close-btn:hover {
    color: var(--text-primary);
  }
  .close-btn .material-symbols-outlined {
    font-size: 1.5rem;
  }

  @media (max-width: 640px) {
    .search-input {
      width: 45vw;
      max-width: none;
    }
  }
</style>
