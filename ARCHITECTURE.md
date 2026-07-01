# Rug Pool — Architecture

## Project Structure

```
rug-pool/
├── frontend/          Svelte 5 + Vite web app
├── backend/           Express + SQLite API server
├── contracts/         Solidity smart contracts (Foundry)
│   ├── src/           .sol source files
│   ├── scripts/       JS deploy/test scripts (Node)
│   ├── test/          Foundry tests (.t.sol)
│   ├── out/           Compiled artifacts (ABIs)
│   └── deployments.json  Live contract addresses
├── AGENTS.md          Project summary & progress
└── ARCHITECTURE.md    This file
```

---

## System Overview

```
Browser (Svelte 5)
  │
  ├── Router (hash-based) ──► 8 pages
  ├── Privy (X OAuth)  ──► Embedded EVM wallet
  ├── lightweight-charts ──► Price chart
  │
  └── API Client ──► /api/* ──(Vite proxy)──► Backend Express (:3001)
                                                  │
                                                  ├── SQLite ── coins, purchases
                                                  │
                                                  └── viem RPC ──► Monad Testnet
                                                                   │
                                                                   ├── MemberRegistry
                                                                   ├── CoinFactory ──► RugToken
                                                                   ├── RugPool (game core)
                                                                   ├── Treasury (fees)
                                                                   └── VRFConsumer (Pyth entropy)
```

All blockchain writes go through the **backend's deployer wallet** (relayer/gas station pattern). Users never sign transactions directly — the server submits on their behalf using the deployer's private key.

---

## Frontend (`frontend/`)

### Stack
- **Svelte 5** with runes: `$state`, `$derived`, `$effect`, `$props`
- **Vite 6** with `@sveltejs/vite-plugin-svelte`
- **lightweight-charts** (TradingView) for price chart
- **@privy-io/js-sdk-core** for X/Twitter OAuth + embedded EVM wallet

### Pages
| Route | Page | Purpose |
|-------|------|---------|
| `#/` | `Index.svelte` | Feed — coin cards grid with stats bar, search, filter |
| `#/coin/:id` | `CoinDetail.svelte` | Coin detail — chart, buy panel, stats, creator, tweet actions |
| `#/launch` | `Launch.svelte` | Launch form — identity, config, socials, badge, preview |
| `#/onboard` | `Onboard.svelte` | Registration — badge tier selection |
| `#/portfolio` | `Portfolio.svelte` | User portfolio — positions, P&L, filters |
| `#/leaderboard` | `Leaderboard.svelte` | Top loser leaderboard, prize pool |
| `#/faq` | `FAQ.svelte` | FAQ accordion |
| `#/terms` | `Terms.svelte` | Terms & conditions |

### Key Components
| Component | Purpose |
|-----------|---------|
| `CoinCard.svelte` | Feed card — name, symbol, badge, price, pool, holders, countdown |
| `BuyPanel.svelte` | Buy form — MON amount input, balance, buy button |
| `PriceChart.svelte` | Price chart using lightweight-charts (reactively initialized) |
| `CycleTracker.svelte` | Round #, time left, total rounds, flips pending |
| `WalletButton.svelte` | Privy login (X OAuth) / connected menu |
| `CountdownTimer.svelte` | Live HH:MM:SS countdown, pulses in last hour |
| `Badge.svelte` | Blue (member) or Yellow (project) badge icon |
| `Navbar.svelte` | Sticky nav — links, search, wallet button, auto-hide on scroll |

### State Management
All reactive state uses Svelte 5 runes (no traditional stores):
- `privy.svelte.ts` — `privyState`: `isReady`, `isLoggedIn`, `address`, `balance`
- `notificationStore.svelte.ts` — toast notifications with auto-dismiss
- `coinStore.svelte.ts` — coin list state
- `userStore.svelte.ts` — user profile state

### Auth Flow (Privy)
1. `initPrivy()` — create Privy instance, restore session from stored token
2. `loginWithX()` — generate Twitter OAuth URL, redirect browser
3. `handleOAuthRedirect()` — extract code from URL params, exchange for auth, get embedded wallet address, fetch MON balance
4. `logout()` — clear state and localStorage

### API Client (`api.ts`)
All calls go to `/api/*` (proxied by Vite to `http://localhost:3001` with `/api` prefix stripped).

| Function | Method | Backend Path |
|----------|--------|-------------|
| `register()` | POST | `/register` |
| `checkMember(addr)` | GET | `/member/:addr` |
| `registerUser(addr, badge)` | POST | `/register-user` |
| `launch(body)` | POST | `/launch` |
| `buy(addr, value, min, user)` | POST | `/buy` |
| `getCoins()` | GET | `/coins` |
| `getCoin(id)` | GET | `/coin/:id` |
| `getLeaderboard()` | GET | `/leaderboard` |
| `getPortfolio(wallet)` | GET | `/portfolio/:wallet` |
| `triggerFlip(addr)` | POST | `/flip` |

### Vite Proxy Config
```ts
proxy: {
  '/api':    { target: 'http://localhost:3001', rewrite: p => p.replace('/api', '') },
  '/uploads': { target: 'http://localhost:3001' }
}
```

---

## Backend (`backend/`)

### Stack
- **Express** on port 3001
- **viem** for blockchain RPC (Monad Testnet, chain ID 10143)
- **SQLite** via `bun:sqlite` for off-chain metadata
- **dotenv** for env vars

### Database (`db.js`)

**`coins` table** — off-chain metadata for launched tokens:
| Column | Type | Notes |
|--------|------|-------|
| `address` | TEXT PK | Token contract address |
| `name` | TEXT | Coin name |
| `ticker` | TEXT | Symbol |
| `description` | TEXT | Off-chain description |
| `imageUrl` | TEXT | Image URL path |
| `creator` | TEXT | Creator wallet address |
| `created_at` | TEXT | Auto timestamp |

**`purchases` table** — tracks user buys (since tokens go to the relayer on-chain):
| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | Auto-increment |
| `wallet` | TEXT | User wallet address |
| `coin_address` | TEXT | Token contract address |
| `value` | TEXT | MON value sent (wei) |
| `tokens_out` | TEXT | Tokens received (wei) |
| `tx_hash` | TEXT | Transaction hash |
| `created_at` | TEXT | Auto timestamp |

### API Endpoints

| Method | Path | What it does |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/register` | Register deployer as founding member |
| `GET` | `/member/:address` | Check if wallet is registered |
| `POST` | `/register-user` | Register a user (owner function) |
| `POST` | `/launch` | Launch coin via CoinFactory, save metadata to SQLite |
| `POST` | `/buy` | Buy tokens via RugPool, record purchase in SQLite |
| `GET` | `/coins` | List all coins (chain + SQLite metadata) |
| `GET` | `/coin/:id` | Single coin detail |
| `GET` | `/leaderboard` | Top loser + pending fees |
| `POST` | `/flip` | Trigger flip with VRF fee |
| `GET` | `/portfolio/:wallet` | Positions (on-chain + SQLite purchases) |

### Startup
On boot, the server checks if the deployer wallet is registered in MemberRegistry and auto-registers if not (required because `buy()` checks `isRegistered(msg.sender)` and `msg.sender` is always the deployer in relay mode).

---

## Smart Contracts (`contracts/src/`)

| Contract | Solidity | Purpose |
|----------|----------|---------|
| `MemberRegistry.sol` | 0.8.28 | Founding member registration (max 1000, one-time fee) |
| `CoinFactory.sol` | 0.8.28 | Deploys RugToken ERC-20, registers with RugPool |
| `RugToken.sol` | 0.8.28 | Simple capped-supply ERC-20 |
| `RugPool.sol` | 0.8.28 | Core game: buy, cycles, flips, holders, exits |
| `Treasury.sol` | 0.8.28 | Fee accumulation, top loser tracking, monthly settlement |
| `VRFConsumer.sol` | 0.8.28 | Pyth entropy for verifiable random flip outcomes |

### Contract Wiring
```
MemberRegistry ←──── CoinFactory (checks registration on launch)
     ↑                  │
     │                  ├── deploys ──► RugToken
     │                  │
     └── RugPool ───────┘ (checks registration on buy, reads coin data)
           │
           ├── Treasury (sends protocol fees, records losses)
           │
           └── VRFConsumer (requests randomness for flips)
```

### Game Mechanics
- **Bonding curve**: `tokensOut = (msg.value * totalSupply) / poolValue`
- **Flip**: Random outcome (HEADS = exit at moon price, TAILS = continue)
- **Exit queue**: Sorted by `cycleJoined ASC` then `joinTimestamp ASC` (older holders exit first)
- **Allowed flipConfig**: 33, 50, 70, 80 (TAILS probability if HEADS means exit)
- **Protocol fee**: 20% of heads-exit payouts (2000 bps)
- **Treasury split**: 10% dev, 10% top loser, 80% rollover
- **Cycle**: 86400 seconds (24h) default, owner-adjustable per coin
- **manualFulfill(coin, cycle, seed)**: Owner-only bypass for testnet VRF

### Deployed Addresses (Monad Testnet)
| Contract | Address |
|----------|---------|
| MemberRegistry | `0x4491a42c7ec1c4b79b393d1693ea9ca0b6d574c6` |
| Treasury | `0xeb1ad588ccadca76564e2e387f71e48ec13244bd` |
| VRFConsumer | `0x2e221582f32c5f5c773ae5c3947abd8a06ae8482` |
| CoinFactory | `0x0ca6bdf6c87d44d2e8319ff7815b339789591a6d` |
| RugPool | `0x1b68e000bb7788477d7a9a3f0315beea71501652` |

### Scripts (`contracts/scripts/`)
| Script | Purpose |
|--------|---------|
| `deploy.js` | Full deploy: all 5 contracts, wiring, save deployments.json + ABIs |
| `chain.js` | Runs all 5 test scripts sequentially |
| `test-registry.js` | Tests MemberRegistry |
| `test-factory.js` | Tests CoinFactory |
| `test-vrf.js` | Tests VRFConsumer |
| `test-treasury.js` | Tests Treasury |
| `test-rugpool.js` | Tests RugPool |
| `simulate.js` | Full simulation: register, launch, buy, flip, fulfill |
| `simulate-cycle2.js` | Cycle 2 continuation with mixed outcomes |
| `manual-fulfill.js` | CLI: `node manual-fulfill.js <coin> <cycle> [seed]` |

---

## Data Flow

### Launch a Coin
```
User submits form ──► POST /api/launch
  │
  ├── Backend checks isRegistered(creator)
  ├── Backend calls CoinFactory.launchCoinFor(creator, ...) via deployer wallet
  │     ├── Deploys new RugToken ERC-20
  │     ├── Registers token with RugPool
  │     └── Emits CoinLaunched(tokenAddress)
  ├── Backend extracts tokenAddress from event log
  └── Backend saves metadata (name, desc, imageUrl) to SQLite coins table
```

### Buy Tokens
```
User enters amount ──► POST /api/buy
  │
  ├── Backend calls RugPool.buy(coinAddress, minTokensOut) with msg.value via deployer
  │     ├── Checks isRegistered(msg.sender) → deployer must be registered
  │     ├── Calculates tokensOut via bonding curve
  │     ├── Transfers ERC-20 tokens to deployer (msg.sender)
  │     └── Updates deployer's holder state in RugPool
  ├── Backend calculates tokensOut locally from RugPool.getCoinState()
  └── Backend saves purchase (user, coin, value, tokensOut) to SQLite purchases table
```

### View Portfolio
```
User navigates to Portfolio ──► GET /api/portfolio/:wallet
  │
  ├── Backend reads all coins from CoinFactory.getAllCoins()
  ├── For each coin:
  │     ├── Reads on-chain RugPool.getHolderInfo(wallet)
  │     └── Reads SQLite purchases for wallet
  ├── Merges on-chain balance + SQLite purchase balance
  └── Returns combined positions
```

### Feed / Coin List
```
Feed loads ──► GET /api/coins
  │
  ├── Backend reads all coin addresses from CoinFactory.getAllCoins()
  ├── For each coin:
  │     ├── Reads CoinFactory.getCoin() — name, ticker, creator, verified
  │     ├── Reads RugPool.getCoinState() — poolValue, totalSupply, holders, cycle
  │     └── Enriches with SQLite metadata (imageUrl, description)
  └── Returns enriched coin list
```

### Registration
```
User selects badge tier ──► POST /api/register-user
  │
  ├── Backend checks isRegistered(user) — skip if already registered
  ├── Backend calls MemberRegistry.registerFor(user) via deployer wallet (owner fn)
  └── Returns status
```

### Flip Cycle
```
Anyone calls ──► POST /api/flip
  │
  ├── Backend calls RugPool.triggerFlip(coinAddress) with VRF fee
  │     ├── Checks cycle is expired
  │     ├── Builds exit queue (oldest holders first)
  │     ├── Requests randomness from VRFConsumer (Pyth entropy)
  │     ├── On fulfillment: derives outcome per holder (HEADS=exit/TAILS=continue)
  │     ├── HEADS: exits at moon price, pays deployer minus 20% protocol fee
  │     ├── Sends protocol fee to Treasury
  │     └── Advances to next cycle
  └── Returns tx hash
```

---

## Key Architecture Decisions

1. **Admin-relayed transactions** — Users don't need MON for gas, but trust the server. All writes go through the deployer wallet. This means:
   - `buy()` sends tokens to `msg.sender` (deployer), so the backend tracks user ownership via SQLite `purchases` table
   - Portfolio merges on-chain deployer holdings with SQLite purchases
   - The deployer must be registered as a member for `buy()` to work

2. **Off-chain metadata** — Images and descriptions stored in SQLite to avoid oversized calldata from base64 images. On-chain data is minimal (name, ticker).

3. **Svelte 5 runes** — Full adoption of `$state`, `$derived`, `$effect`. No legacy stores. Props via `$props()`.

4. **Vite proxy** — Dev server proxies `/api` → `:3001` with path rewrite (strips `/api`). Production would use a similar reverse proxy.

5. **Testnet-first** — `VRFConsumer.manualFulfill()` bypasses Pyth oracle for testing. All scripts assume live testnet with persistent state (idempotent).

6. **Bun backend** — The backend runs with Bun, using `bun:sqlite` for the database. `viem` is symlinked from `contracts/node_modules/viem` to save disk space.
