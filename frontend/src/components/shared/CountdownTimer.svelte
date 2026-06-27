<script lang="ts">
  let { target, pulse = false }: { target: number; pulse?: boolean } = $props();

  let now = $state(Date.now());
  let interval: ReturnType<typeof setInterval>;

  $effect(() => {
    interval = setInterval(() => {
      now = Date.now();
    }, 1000);
    return () => clearInterval(interval);
  });

  let remaining = $derived(Math.max(0, target - now));
  let hours = $derived(Math.floor(remaining / 3600000));
  let minutes = $derived(Math.floor((remaining % 3600000) / 60000));
  let seconds = $derived(Math.floor((remaining % 60000) / 1000));
  let isExpired = $derived(remaining <= 0);
  let isLastHour = $derived(!isExpired && remaining <= 3600000);

  let pulseClass = $derived(isLastHour && pulse ? 'pulse' : '');
</script>

<span class="countdown {pulseClass}">
  {#if isExpired}
    Flipping...
  {:else}
    <span class="mono">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
  {/if}
</span>

<style>
  .countdown {
    font-family: 'JetBrains Mono', monospace;
    font-size: inherit;
  }

  .pulse {
    color: var(--danger);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
