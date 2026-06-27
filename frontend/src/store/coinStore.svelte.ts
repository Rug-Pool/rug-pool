export interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  holders: number;
  poolSize: number;
  cycleEnd: number;
  image?: string;
  isFoundingMember?: boolean;
}

let coins = $state<Coin[]>([]);

export function getCoins() {
  return coins;
}

export function setCoins(newCoins: Coin[]) {
  coins = newCoins;
}

export function updateCoin(id: string, update: Partial<Coin>) {
  const idx = coins.findIndex((c) => c.id === id);
  if (idx !== -1) {
    coins[idx] = { ...coins[idx], ...update };
  }
}
