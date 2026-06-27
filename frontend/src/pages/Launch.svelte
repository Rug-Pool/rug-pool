<script lang="ts">
  import { navigate } from '$lib/router.svelte';
  import Badge from '$components/shared/Badge.svelte';
  import CountdownTimer from '$components/shared/CountdownTimer.svelte';

  let name = $state('');
  let symbol = $state('');
  let description = $state('');
  let imageUrl = $state('');
  let initialPrice = $state('');
  let initialLiquidity = $state('');
  let maxSupply = $state('');
  let twitter = $state('');
  let telegram = $state('');
  let website = $state('');
  let badgeVariant = $state<'project' | 'member'>('project');
  let isLaunching = $state(false);

  let previewPrice = $derived(initialPrice ? '$' + parseFloat(initialPrice || '0').toFixed(6) : '$0.000000');
  let previewPool = $derived(initialLiquidity ? '$' + parseFloat(initialLiquidity || '0').toLocaleString() : '$0');
  let previewHolders = $derived('0');
  let previewSupply = $derived(maxSupply || '—');

  function handleSymbolInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    symbol = input.value.toUpperCase().slice(0, 6);
  }

  function handleImageInput(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        imageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleLaunch() {
    isLaunching = true;
    setTimeout(() => {
      isLaunching = false;
      navigate('/');
    }, 2000);
  }

  let isFormValid = $derived(
    name.trim().length > 0 &&
    symbol.trim().length > 0 &&
    description.trim().length > 0 &&
    initialPrice.trim().length > 0 &&
    initialLiquidity.trim().length > 0 &&
    maxSupply.trim().length > 0
  );
</script>

<div class="page">
  <div class="header">
    <button class="back-btn" onclick={() => navigate(-1)}>
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <h1>Launch a Coin</h1>
  </div>

  <div class="warning">
    <span class="warning-icon">⚠️</span>
    <span>Once launched you are locked like everyone else. You cannot pull liquidity, edit the coin, or exit early. Not even you.</span>
  </div>

  <form class="form" onsubmit={(e) => { e.preventDefault(); handleLaunch(); }}>
    <section class="section">
      <h2 class="section-title">Section 1 — Coin Identity</h2>

      <div class="field">
        <label for="name">Coin Name <span class="required">*</span></label>
        <input id="name" type="text" bind:value={name} placeholder="Monad Pepe" />
      </div>

      <div class="field">
        <label for="symbol">Ticker Symbol <span class="required">*</span> <span class="hint">(max 6 chars, auto uppercase)</span></label>
        <input id="symbol" type="text" value={symbol} oninput={handleSymbolInput} placeholder="MPEPE" maxlength={6} />
      </div>

      <div class="field">
        <label for="description">Description <span class="required">*</span> <span class="hint">(what's the vibe, the lore, the joke)</span></label>
        <textarea id="description" bind:value={description} placeholder="The dankest memecoin on Monad..." rows={3}></textarea>
      </div>

      <div class="field">
        <label for="image">Coin Image <span class="required">*</span> <span class="hint">(upload or paste URL)</span></label>
        <div class="image-input-row">
          <input id="image-file" type="file" accept="image/*" onchange={handleImageInput} class="file-input" />
          <span class="or-divider">or</span>
          <input type="text" bind:value={imageUrl} placeholder="https://..." />
        </div>
        {#if imageUrl}
          <img src={imageUrl} alt="Preview" class="image-preview" />
        {/if}
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Section 2 — Launch Config</h2>

      <div class="field">
        <label for="price">Initial Price <span class="required">*</span> <span class="hint">(in MON)</span></label>
        <input id="price" type="number" step="any" min="0" bind:value={initialPrice} placeholder="0.000042" />
      </div>

      <div class="field">
        <label for="liquidity">Initial Liquidity <span class="required">*</span> <span class="hint">(how much you're seeding the pool with)</span></label>
        <input id="liquidity" type="number" step="any" min="0" bind:value={initialLiquidity} placeholder="1000" />
      </div>

      <div class="field">
        <label for="supply">Max Supply <span class="required">*</span> <span class="hint">(hard cap)</span></label>
        <input id="supply" type="number" step="any" min="0" bind:value={maxSupply} placeholder="1000000000" />
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Section 3 — Socials</h2>

      <div class="field">
        <label for="twitter">Twitter/X <span class="hint">(optional but strongly recommended)</span></label>
        <input id="twitter" type="text" bind:value={twitter} placeholder="https://x.com/..." />
      </div>

      <div class="field">
        <label for="telegram">Telegram <span class="hint">(optional)</span></label>
        <input id="telegram" type="text" bind:value={telegram} placeholder="https://t.me/..." />
      </div>

      <div class="field">
        <label for="website">Website <span class="hint">(optional)</span></label>
        <input id="website" type="text" bind:value={website} placeholder="https://..." />
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Section 4 — Badge Selection</h2>

      <div class="badge-options">
        <button
          type="button"
          class="badge-option"
          class:selected={badgeVariant === 'member'}
          onclick={() => badgeVariant = 'member'}
        >
          <div class="badge-option-left">
            <Badge variant="member" />
            <div>
              <div class="badge-option-name">Blue Badge</div>
              <div class="badge-option-desc">Founding member launch, verified human</div>
            </div>
          </div>
          <div class="badge-option-price">$1</div>
        </button>

        <button
          type="button"
          class="badge-option"
          class:selected={badgeVariant === 'project'}
          onclick={() => badgeVariant = 'project'}
        >
          <div class="badge-option-left">
            <Badge variant="project" />
            <div>
              <div class="badge-option-name">Yellow Badge</div>
              <div class="badge-option-desc">Verified project, priority feed placement</div>
            </div>
          </div>
          <div class="badge-option-price">$10</div>
        </button>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Section 5 — Launch Summary</h2>
      <p class="section-desc">This is how your coin appears on the feed. Once launched it cannot be edited.</p>

      <div class="preview-card">
        <div class="preview-header">
          <div class="preview-info">
            {#if imageUrl}
              <img src={imageUrl} alt="" class="preview-icon" />
            {:else}
              <div class="preview-icon placeholder-icon">{symbol ? symbol[0] || '?' : '?'}</div>
            {/if}
            <div>
              <div class="preview-name">
                {name || 'Coin Name'}
                <Badge variant={badgeVariant} />
              </div>
              <div class="preview-symbol">{symbol || 'TICKER'}</div>
            </div>
          </div>
          <div class="preview-price-info">
            <div class="preview-price">{previewPrice}</div>
          </div>
        </div>
        <div class="preview-body">
          <div class="preview-stat">
            <span class="preview-stat-label">Pool</span>
            <span class="preview-stat-value">{previewPool}</span>
          </div>
          <div class="preview-stat">
            <span class="preview-stat-label">Holders</span>
            <span class="preview-stat-value">{previewHolders}</span>
          </div>
          <div class="preview-stat">
            <span class="preview-stat-label">Next Flip</span>
            <CountdownTimer target={Date.now() + 86400000} pulse={false} />
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Section 6 — Launch</h2>

      <button
        type="submit"
        class="launch-btn"
        disabled={!isFormValid || isLaunching}
      >
        {isLaunching
          ? 'Launching...'
          : `Pay $${badgeVariant === 'project' ? '10' : '1'} + gas and Launch`}
      </button>
    </section>
  </form>

  <div class="spacer"></div>
</div>

<style>
  .page {
    max-width: 640px;
    margin: 0 auto;
    padding-bottom: 4rem;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .back-btn {
    background: var(--bg-card);
    border: 1px solid var(--gray-600);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-primary);
    transition: border-color 0.15s;
    flex-shrink: 0;
  }
  .back-btn:hover {
    border-color: var(--accent);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
  }

  .warning {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    font-size: 0.8125rem;
    color: var(--red-400);
    line-height: 1.5;
    margin-bottom: 2rem;
  }

  .warning-icon {
    flex-shrink: 0;
    font-size: 1rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
    padding-bottom: 0.375rem;
    border-bottom: 1px solid var(--gray-700);
  }

  .section-desc {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .field label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .required {
    color: var(--danger);
  }

  .hint {
    font-weight: 400;
    color: var(--gray-500);
  }

  .field input,
  .field textarea {
    background: var(--bg-primary);
    border: 1px solid var(--gray-600);
    border-radius: 8px;
    padding: 0.625rem 0.75rem;
    color: var(--text-primary);
    font-size: 0.9375rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }
  .field input:focus,
  .field textarea:focus {
    border-color: var(--accent);
  }

  .field textarea {
    resize: vertical;
    min-height: 60px;
  }

  .image-input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .image-input-row input[type="text"] {
    flex: 1;
    min-width: 150px;
  }

  .file-input {
    font-size: 0.8125rem;
    max-width: 200px;
  }

  .or-divider {
    color: var(--text-secondary);
    font-size: 0.8125rem;
  }

  .image-preview {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid var(--gray-600);
  }

  .badge-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .badge-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-primary);
    border: 1px solid var(--gray-600);
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    transition: border-color 0.15s;
    color: var(--text-primary);
    text-align: left;
  }
  .badge-option:hover {
    border-color: var(--gray-500);
  }
  .badge-option.selected {
    border-color: var(--accent);
  }

  .badge-option-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .badge-option-name {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .badge-option-desc {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .badge-option-price {
    font-size: 1.125rem;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    color: var(--accent);
  }

  .preview-card {
    background: var(--bg-card);
    border: 1px solid var(--gray-600);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .preview-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .preview-icon {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .placeholder-icon {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: var(--purple-800);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: var(--accent);
    flex-shrink: 0;
  }

  .preview-name {
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .preview-symbol {
    color: var(--text-secondary);
    font-size: 0.8125rem;
  }

  .preview-price-info {
    text-align: right;
  }

  .preview-price {
    font-weight: 700;
    font-size: 1.125rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .preview-body {
    display: flex;
    gap: 1.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--gray-600);
  }

  .preview-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .preview-stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  .preview-stat-value {
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
  }

  .launch-btn {
    width: 100%;
    background: var(--accent);
    color: white;
    padding: 1rem;
    border-radius: 10px;
    font-size: 1.0625rem;
    font-weight: 600;
    transition: background 0.15s;
    margin-top: 0.5rem;
  }
  .launch-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  .launch-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .spacer {
    height: 2rem;
  }
</style>
