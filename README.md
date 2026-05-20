# Liqdex

Liquid Protocol DEX Scanner + Sniper Auction Monitor

## Overview

One-stop platform untuk monitoring ekosistem Liquid Protocol di Base chain:

- **DEX Scanner** — Monitor semua token: harga, volume, market cap, pool info
- **Sniper Auction Monitor** — Track auction real-time: fee descending, status, countdown

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS (dark theme)
- viem + liquid-sdk
- GeckoTerminal API (price data)
- Base chain (8453)

## Features

### Dashboard
- Stats overview (total tokens, volume, liquidity, active auctions)
- Recent tokens list
- Quick links to all sections

### Token Scanner
- Paginated token list with search
- Token detail page with full info
- Deploy timestamp and creator info

### Sniper Auction Monitor
- Real-time auction status (active/ended/upcoming)
- Descending fee visualization
- Fee configuration details
- Decay timing info

### Pools
- All Uniswap V4 pools from Liquid Protocol
- Pool ID and hook info

### Contracts
- All 19 Liquid Protocol contracts
- Categorized by type (Core, Hooks, Extensions, MEV Modules)
- BaseScan links

## Project Structure

```
/app
  /                    → Dashboard
  /tokens              → Token list
  /tokens/[address]    → Token detail
  /top-volume          → Top volume tokens
  /pools               → Uniswap V4 pools
  /auctions            → Sniper auction monitor
  /auctions/[addr]     → Auction detail
  /contracts           → All contracts

/lib
  /liquid.ts           → SDK singleton (server-side)
  /geckoterminal.ts    → GeckoTerminal price API
  /cache.ts            → File-based cache
  /auction.ts          → Auction data fetcher
  /hooks.ts            → SWR hooks
  /types.ts            → TypeScript types

/components
  /Navbar.tsx          → Navigation sidebar
  /StatsCard.tsx       → Dashboard stats card
  /TokenTable.tsx      → Token list table
  /AuctionCard.tsx     → Auction status card
  /Loading.tsx         → Loading spinner
  /ErrorBoundary.tsx   → Error handling

/app/api
  /tokens/route.ts     → GET: paginated token list
  /tokens/[addr]       → GET: single token detail
  /auctions/route.ts   → GET: active auctions
  /auctions/[addr]     → GET: auction detail
  /stats/route.ts      → GET: dashboard stats
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
BASE_RPC_URL=https://mainnet.base.org  # Optional, defaults to public RPC
```

## Status

🚧 Under development
