# Rug Pool 🟣
### A Provably Fair Memecoin Game on Monad

> *The rug is guaranteed. The question is whether it hits you.*

---

## What is Rug Pool?

Rug Pool is a memecoin launch and trading game built on Monad. Every coin launched on the platform locks all holders for 24 hours — no early exits, no whale dumps, no insider sells. At the 24-hour mark, Monad's onchain verifiable random function (VRF) flips a coin for every single holder simultaneously.

- **Heads** — your position auto-sells at market price
- **Tails** — you stay locked for another cycle

You never know which side you're on until the flip happens. Nobody does. Not even the dev.

---

## The Problems Rug Pool Solves

### 1. Memecoin launches are rigged
In every standard memecoin launch, insiders buy early, dump on retail at the peak, and retail holders are left holding bags with no recourse. Everyone knows it. Nobody can stop it.

Rug Pool removes this entirely. The 24-hour lock applies to everyone equally — no whitelist exits, no dev sells, no early liquidity pulls. The playing field is flat from the moment a coin launches.

### 2. Losing in crypto has no upside
You hold. You get rugged. You leave with nothing but a loss and a lesson. There is no mechanism in any existing memecoin platform that rewards the downside.

Rug Pool flips this. 10% of monthly protocol fees go directly to the top loser — the wallet that lost the most that month walks away with a prize. Losing big is a legitimate strategy. The worst outcome becomes a competition.

### 3. Bots and sybils destroy fair launches
Free-to-join platforms are immediately flooded with bots, sybil wallets, and fake volume. This distorts price discovery and kills the experience for real users.

Rug Pool requires a one-time $1 non-refundable founding member fee to access the platform. This is not a revenue mechanism — it is proof of human. No bot farm can economically justify mass registration at $1 per wallet. Real players only.

### 4. Monad's meme community has no native game
Monad has 10,000 TPS and 0.8s finality — performance that makes real-time game economies possible onchain. No existing memecoin platform is built specifically to take advantage of this or serve the Monad community natively.

Rug Pool is built from the ground up on Monad, for the Monad meme community.

---

## How It Works

```
1. Pay $1 once → become a founding member
2. Launch or buy into a coin → locked for 24 hours
3. At T+24 → onchain VRF flips for every holder simultaneously
4. Heads → auto-sell at market price
5. Tails → locked for another 24-hour cycle
6. 20% of every auto-sell profit stays in the protocol
7. 10% goes to dev monthly
8. 10% goes to the top loser monthly
9. Re-enter anytime → resets your 24-hour clock
```

---

## Token Economics

| Flow | Allocation |
|------|-----------|
| Auto-sell profit | 80% to holder, 20% to protocol |
| Protocol split (monthly) | 10% dev, 10% top loser prize |
| Founding member fee | $500 seeds prize pool, $500 to dev |

---

## Tech Stack

- **Blockchain** — Monad (EVM-compatible, 10,000 TPS, 0.8s finality)
- **Randomness** — Onchain VRF (provably fair, manipulation-proof)
- **Smart Contracts** — Solidity
- **Frontend** — React
- **Wallet Auth** — Privy embedded wallets
- **Real-time** — WebSocket for live coin feed and chat

---

## Core Features

- Live coin feed with per-coin countdown timers
- Per-coin chat and community
- Cycle tracker — current round, time left, holders locked
- Top loser leaderboard (monthly reset)
- Founding member badge (onchain, first 1000 wallets)
- $1 one-time platform entry fee

---

## Why Monad

Monad's speed and finality make the simultaneous 24-hour flip mechanic viable onchain at scale. A 20-player flip resolving in under a second with verifiable randomness is only possible on infrastructure built for performance. Everything else is too slow or too expensive.

---

## Roadmap

- [x] Concept and architecture
- [ ] Smart contract — coin launch + 24hr lock logic
- [ ] VRF integration — provably fair flip
- [ ] Auto-sell and pool split logic
- [ ] React frontend — coin feed, chat, leaderboard
- [ ] $1 founding member onboarding
- [ ] Testnet deploy — 1000 user target
- [ ] Mainnet launch

---

## Building in Public

This project is being built live as a 72-hour public challenge on X (Twitter).

Follow the build: [@tobiawolaju](https://x.com/tobiawolaju)

Built on: [@monad_xyz](https://x.com/monad) 🟣

building guides from: [@DeltaV_xyz](https://x.com/DeltaV_xyz)

---

## License

MIT
