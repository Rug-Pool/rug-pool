import { setCoins } from '$store/coinStore.svelte';

export function useCoinFeed() {
  function connect() {}
  function disconnect() {}

  return { connect, disconnect };
}
