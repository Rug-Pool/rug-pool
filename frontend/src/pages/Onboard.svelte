<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import Badge from '$components/shared/Badge.svelte';

  let step = $state(1);
  let isPaying = $state(false);
  let selectedTier = $state<'member' | 'project'>('member');

  function handlePay() {
    isPaying = true;
    setTimeout(() => {
      isPaying = false;
      step = 2;
    }, 2000);
  }
</script>

<div class="page">
  {#if step === 1}
    <div class="tiers">
      <button
        class="tier"
        class:active={selectedTier === 'member'}
        onclick={() => selectedTier = 'member'}
      >
        <div class="tier-badge">
          <Badge variant="member" />
          <span class="tier-name">Founding Member</span>
        </div>
        <div class="tier-price">$1</div>
        <div class="tier-perks">
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Access to all coin launches</span>
          </div>
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Top loser prize pool eligibility</span>
          </div>
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Founding Member badge</span>
          </div>
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Limited to first 1,000 wallets</span>
          </div>
        </div>
      </button>

      <button
        class="tier"
        class:active={selectedTier === 'project'}
        onclick={() => selectedTier = 'project'}
      >
        <div class="tier-badge">
          <Badge variant="project" />
          <span class="tier-name">Founding Project</span>
        </div>
        <div class="tier-price">$10</div>
        <div class="tier-perks">
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Everything in Founding Member</span>
          </div>
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Launch your own coin</span>
          </div>
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Green project badge on your coins</span>
          </div>
          <div class="perk">
            <span class="perk-icon">✓</span>
            <span>Priority listing in coin feed</span>
          </div>
        </div>
      </button>
    </div>

    <div class="actions">
      <button class="pay-btn" onclick={handlePay} disabled={isPaying}>
        {isPaying
          ? 'Processing...'
          : selectedTier === 'project'
            ? 'Pay $10 — Become a Founding Project'
            : 'Pay $1 — Become a Member'}
      </button>

      <button class="skip-btn" onclick={() => navigate('/feed')}>
        Skip for now
      </button>
    </div>
  {:else}
    <div class="success">
      <div class="icon success-icon">★</div>
      <h1>You're In!</h1>
      <p class="desc">
        Welcome to Rug Pool. You are now a verified
        {selectedTier === 'project' ? 'Founding Project' : 'founding member'}.
      </p>
      <Badge
        label={selectedTier === 'project' ? 'Founding Project' : 'Founding Member #847'}
        variant={selectedTier === 'project' ? 'project' : 'member'}
      />
      <button class="pay-btn" onclick={() => navigate('/')}>
        Launch Coin
      </button>
    </div>
  {/if}
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    gap: 2.5rem;
  }

  .icon {
    font-size: 3rem;
    color: var(--accent);
  }

  h1 {
    font-size: 2rem;
    font-weight: 800;
  }

  .tiers {
    width: 100%;
    max-width: 680px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .tier {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--gray-700);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.15s;
    color: var(--text-primary);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .tier:hover {
    border-color: var(--gray-500);
  }
  .tier.active {
    border-color: var(--accent);
  }

  .tier-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tier-name {
    font-size: 1rem;
    font-weight: 600;
  }

  .tier-price {
    font-size: 2.25rem;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
    line-height: 1;
  }

  .tier-perks {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .perk {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .perk-icon {
    color: var(--success);
    font-weight: 700;
    flex-shrink: 0;
  }

  .actions {
    width: 100%;
    max-width: 680px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pay-btn {
    width: 100%;
    background: var(--accent);
    color: white;
    padding: 1rem;
    border-radius: 10px;
    font-size: 1.0625rem;
    font-weight: 600;
    transition: background 0.15s;
  }
  .pay-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  .pay-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .skip-btn {
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.875rem;
    padding: 0.5rem;
    transition: color 0.15s;
  }
  .skip-btn:hover {
    color: var(--text-primary);
  }

  .success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    text-align: center;
    max-width: 400px;
  }

  .success .pay-btn {
    margin-top: 0.5rem;
  }

  @media (min-width: 600px) {
    .tiers {
      grid-template-columns: 1fr 1fr;
    }

    .page {
      padding: 3rem 2rem;
    }

    h1 {
      font-size: 2.5rem;
    }
  }
</style>
