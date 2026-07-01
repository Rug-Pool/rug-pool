# Rug Pool — Summary

## Architecture
- **Backend**: Express + SQLite (`backend/`)
- **Frontend**: Svelte 5 + Vite (`frontend/`)
  - Uses Privy for wallet auth
  - Token Launch, Feed, Token detail page
- **Smart contracts**: Forge (Solidity)
- **Package manager**: pnpm

## What's built so far

### Backend
- Express API server with SQLite
- Token launch endpoint with on-chain integration
- Registration system with founding member check
- Token feed/listing endpoints

### Frontend Pages
- **Feed** (`src/pages/Feed.svelte`) — coin listing with search/filter
- **Launch** (`src/pages/Launch.svelte`) — coin creation form
- **Token** (`src/pages/Token.svelte`) — detail view for a coin
- **Profile** (`src/pages/Profiles.svelte`) — user profiles
- **About** (`src/pages/About.svelte`) — static info page

### Launch Page Features
- Coin Identity fields (name, ticker, description, image upload via file picker or URL)
- Launch Config (initial price, initial liquidity, max supply)
- Socials (Twitter, Telegram, Website)
- Launch summary preview card with live price/pool/holders display
- Founding Member Registration ($1 for Blue Badge, $10 for Yellow Badge)
- Launch button with register-or-launch flow controlled by `isRegistered` state
- Wallet integration via Privy (login required to submit)
- Form validation on submit (not relying solely on disabled state)

### Feed Page Features
- Token cards with name, symbol, badges, price, pool, holders, timer
- Search by name/ticker with debounced input
- Filter by badge type (All, Blue, Yellow)
- Timer countdown to next flip

### Shared Components
- `Badge.svelte` — blue/yellow badge display
- `CountdownTimer.svelte` — pulsing countdown display

### State Management
- `privy.svelte.ts` — reactive wallet state using Svelte 5 `$state`
- `notificationStore.svelte.ts` — toast notification system

### Known issues / TODO
- Svelte 5 `$derived` reactivity may not track `$state` bindings correctly across module boundaries; workaround: validate fields explicitly in `handleSubmit()` instead of relying on disabled attribute
- Need to add `initialLiquidity` to `isFormValid` derived (currently not checked)
- Badge selection disabled after registration (intentional — one-time choice)
- `initialLiquidity` is collected in the frontend form but not passed to the contract (the pool value is derived from `initialPrice * maxSupply / 1e18`)

### Gas / On-chain notes
- `launchCoinFor` deploys a new `RugToken` ERC-20 per coin via `new` — inherently gas-heavy (~500k+ gas)
- Metadata (imageUrl, description) is stored **off-chain** in SQLite (`backend/src/db.js`) to avoid oversized calldata from base64 images
- Images uploaded via the file picker are stored on disk (`backend/public/uploads/`) and served via the `/uploads` path; only the short URL path is stored in the DB
- The Vite dev server proxies `/api/*` → backend (`:3001`) and `/uploads/*` → backend (`:3001`)
