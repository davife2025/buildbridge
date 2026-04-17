# BuildBridge — Architecture

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TailwindCSS |
| Backend | Node.js, Express, Prisma |
| Database | **Supabase** (PostgreSQL + PgBouncer + RLS + Storage) |
| AI | Claude API — `claude-sonnet-4-20250514` |
| Blockchain | Stellar Network + Soroban smart contracts (Rust) |
| Auth | Freighter wallet + JWT |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions → Vercel (web) + Railway (api) |
| Monitoring | Sentry |

## System Overview

```
┌────────────────────────────────────────────────────────────┐
│                    BUILDBRIDGE PLATFORM                     │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────┐    │
│  │  Next.js 14 │   │ Express API │   │  Claude AI    │    │
│  │  (Vercel)   │◄─►│  (Railway)  │◄─►│  Sonnet       │    │
│  └──────┬──────┘   └──────┬──────┘   └───────────────┘    │
│         │                 │                                 │
│  ┌──────▼──────┐   ┌──────▼────────────────────────────┐   │
│  │  Freighter  │   │           Supabase                 │   │
│  │  Wallet     │   │  PostgreSQL + PgBouncer + RLS       │   │
│  └─────────────┘   │  Storage (avatars)                  │   │
│                    └───────────────────────────────────┘   │
│                                                             │
│              ┌──────────────────────────────────┐          │
│              │      Stellar Network              │          │
│              │  Horizon API + Soroban RPC        │          │
│              │  MilestoneTracker Contract        │          │
│              └──────────────────────────────────┘          │
└────────────────────────────────────────────────────────────┘
```

## Database: Supabase

BuildBridge uses Supabase (hosted PostgreSQL) with:

- **PgBouncer** (port 6543) for runtime connection pooling
- **Direct connection** (port 5432) for Prisma migrations
- **Row Level Security** on all tables as defence-in-depth
- **Supabase Storage** for founder avatar uploads

See [docs/SUPABASE.md](SUPABASE.md) for full setup guide.

## Auth Flow

```
1. Browser → GET /api/auth/challenge?publicKey=G...
2. API → stores challenge in AuthChallenge table → returns challenge string
3. Browser → Freighter.signMessage(challenge)
4. Browser → POST /api/auth/connect { publicKey, challenge, signature }
5. API → verifies Stellar signature → upserts Founder in Supabase → issues JWT
6. JWT stored client-side → attached to all subsequent API requests
```

## On-chain Milestone Flow

```
1. POST /api/milestones          → create DB record in Supabase
2. POST /api/milestones/build-tx → build unsigned Soroban XDR
3. Freighter.signTransaction()   → user signs in browser
4. POST /api/milestones/submit   → submit to Stellar → poll for confirmation
5. Supabase updated: txHash + onChainId
```

## Deployment

| Service | Provider | Trigger |
|---|---|---|
| Web (Next.js) | Vercel | Push to `main` |
| API (Express) | Railway | Push to `main` |
| Database | Supabase | Always on |
| Smart Contract | Stellar mainnet | Manual deploy |
