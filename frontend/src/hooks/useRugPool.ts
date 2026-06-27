export function useRugPool() {
  return {
    buy(coinId: string, amount: bigint) {},
    sell(coinId: string, amount: bigint) {},
    getCoin(coinId: string) {},
    getHolders(coinId: string) {},
  };
}
