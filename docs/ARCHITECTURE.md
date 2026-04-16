# BuildBridge — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILDBRIDGE PLATFORM                      │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐    ┌───────────┐  │
│  │   Next.js 14     │    │  Express API     │    │  Claude   │  │
│  │   (Vercel)       │◄──►│  (Railway)       │◄──►│  Sonnet   │  │
│  │                  │    │                  │    │  (AI)     │  │
│  │  /               │    │  /health         │    └───────────┘  │
│  │  /dashboard      │    │  /api/auth       │                   │
│  │  /pitch-builder  │    │  /api/pitch      │    ┌───────────┐  │
│  │  /milestones     │    │  /api/milestones │    │ PostgreSQL│  │
│  │  /profile/:id    │    │  /api/investors  │◄──►│(Railway)  │  │
│  │  /investors      │    │                  │    └───────────┘  │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│  ┌────────▼─────────┐    ┌────────▼──────────────────────────┐  │
│  │ Freighter Wallet │    │        Stellar Network             │  │
│  │ (browser ext)    │    │  Horizon API + Soroban RPC         │  │
│  └──────────────────┘    │  MilestoneTracker Contract         │  │
│                           └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Package Dependency Graph

```
apps/web ──────────────────► @buildbridge/ui
    │                         @buildbridge/stellar
    │                         @buildbridge/ai
    │
apps/api ──────────────────► @buildbridge/ai
    │                         @buildbridge/stellar
    │                         @prisma/client
    │
packages/ai ───────────────► @anthropic-ai/sdk
packages/stellar ──────────► @stellar/stellar-sdk
packages/ui ───────────────► react, tailwindcss
```

## Request Lifecycle

### Auth flow (Session 2)
1. User clicks "Connect Wallet" in web app
2. Freighter popup asks user to approve
3. Frontend gets `publicKey` from Freighter
4. Frontend sends `{ publicKey, signedChallenge }` to `POST /api/auth/connect`
5. API verifies the Stellar signature
6. API creates/upserts `Founder` record in PostgreSQL
7. API returns signed JWT
8. Frontend stores JWT in httpOnly cookie

### Pitch flow (Session 3–4)
1. Founder fills in one pitch section
2. Frontend sends text to `POST /api/pitch/refine` with section name
3. API streams Claude response back via SSE
4. Frontend renders AI suggestions in real time
5. Founder accepts → saved to `Pitch` table in PostgreSQL

### Milestone flow (Session 5)
1. Founder clicks "Record Milestone"
2. API builds a Soroban contract invocation transaction
3. API returns unsigned XDR to frontend
4. Frontend asks Freighter to sign the XDR
5. Frontend sends signed XDR to `POST /api/milestones/submit`
6. API submits to Stellar network via Horizon
7. API stores `txHash` and `onChainId` in PostgreSQL

## Database Schema (Prisma)

See `apps/api/src/db/schema.prisma` for the full schema.

Key tables:
- `Founder` — wallet-authenticated users
- `Pitch` — AI-built pitch decks (with versioning)
- `PitchVersion` — point-in-time snapshots
- `Milestone` — founder achievements (on-chain verified)
- `Investor` — investor profiles for matching
- `InvestorConnection` — connection requests

## Environment Variables

See `.env.example` at the root. Each app also accepts its own `.env.local`.

## Deployment

| Service | Provider | Triggered by |
|---|---|---|
| Web (Next.js) | Vercel | Push to `main` |
| API (Express) | Railway | Push to `main` |
| Database | Railway (PostgreSQL) | Manual provision |
| Smart Contract | Stellar testnet/mainnet | Manual CLI deploy |
