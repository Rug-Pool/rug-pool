<script lang="ts">
  import { getNotifications, dismiss } from '$store/notificationStore.svelte';

  let notifications = $derived(getNotifications());
</script>

{#if notifications.length > 0}
  <div class="container">
    {#each notifications as n (n.id)}
      <div class="toast {n.type}" role="alert">
        <span class="icon">
          {#if n.type === 'success'}✓
          {:else if n.type === 'error'}✕
          {:else}i
          {/if}
        </span>
        <span class="msg">{n.message}</span>
        <button class="close" onclick={() => dismiss(n.id)} aria-label="Dismiss">✕</button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 360px;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }

  .success {
    background: #065f46;
    border: 1px solid var(--green-500);
    color: #d1fae5;
  }
  .error {
    background: #7f1d1d;
    border: 1px solid var(--red-500);
    color: #fecaca;
  }
  .info {
    background: var(--purple-800);
    border: 1px solid var(--purple-600);
    color: var(--purple-100);
  }

  .icon {
    font-weight: 700;
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.75rem;
  }
  .success .icon { background: var(--green-500); color: white; }
  .error .icon { background: var(--red-500); color: white; }
  .info .icon { background: var(--accent); color: white; }

  .msg {
    flex: 1;
  }

  .close {
    background: transparent;
    color: inherit;
    opacity: 0.6;
    font-size: 0.875rem;
    padding: 0.125rem;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }
  .close:hover {
    opacity: 1;
  }
</style>
