<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import WalletButton from './WalletButton.svelte';
</script>

<nav>
  <div class="nav-inner">
    <a href="#/" class="logo" onclick={(e) => { e.preventDefault(); navigate('/'); }}>
      <img src="/logo.png" alt="Rug Pool" class="logo-img" />
    </a>
    <div class="spacer"></div>
    <div class="links">
      <a href="#/leaderboard" class="link" onclick={(e) => { e.preventDefault(); navigate('/leaderboard'); }}>Leaderboard</a>
      <a href="#/faq" class="link" onclick={(e) => { e.preventDefault(); navigate('/faq'); }}>FAQ</a>
    </div>
    <WalletButton />
  </div>
</nav>

<style>
  nav {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--gray-700);
    position: sticky;
    top: 0;
    z-index: 100;
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
</style>
