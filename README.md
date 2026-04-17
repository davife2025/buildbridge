# BuildBridge 🌉

> **Where builders meet capital**

An Agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain via Soroban, and connect with the right investors.

[![CI](https://github.com/buildbridge/buildbridge/actions/workflows/ci.yml/badge.svg)](https://github.com/buildbridge/buildbridge/actions)

---

## The Problem

Most founders, especially in Africa and emerging markets, fail to raise not because their ideas lack merit — but because they can't communicate their value effectively. BuildBridge closes the pitch gap.

## What We Built

| Feature | Description |
|---|---|
| 🤖 AI Pitch Builder | Claude streams section-by-section pitch coaching in real time |
| ⛓️ On-Chain Milestones | Soroban smart contract records achievements immutably on Stellar |
| 🎯 Investor Matching | Algorithm scores investors on sector, stage, geography, check size |
| 📊 Founder Profile | Public investor-ready profile with verified on-chain traction |

---

## Quick Start

```bash
git clone https://github.com/your-username/buildbridge.git
cd buildbridge
cp .env.example .env        # fill in your values

npm install
npm run dev                 # starts web on :3000, api on :4000
```

See [docs/SUPABASE.md](docs/SUPABASE.md) for database setup.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TailwindCSS |
| Backend | Node.js + Express + Prisma |
| Database | **Supabase** (PostgreSQL + RLS + Storage) |
| AI | Claude API — `claude-sonnet-4-20250514` |
| Blockchain | Stellar + Soroban smart contracts (Rust) |
| Auth | Freighter wallet + JWT |
| Monorepo | Turborepo |
| Testing | Jest + Playwright E2E |

## Build Sessions

| # | Session | Status |
|---|---|---|
| 1 | Project setup & monorepo config | ✅ |
| 2 | Database & auth layer | ✅ |
| 3 | AI Pitch Builder (backend) | ✅ |
| 4 | AI Pitch Builder (frontend) | ✅ |
| 5 | Soroban MilestoneTracker contract | ✅ |
| 6 | Founder dashboard & public profile | ✅ |
| 7 | Investor matching & discovery | ✅ |
| 8 | Testing, polish & Supabase migration | ✅ |

## Deployment

```bash
# Deploy contract to Stellar mainnet
./contracts/deploy.sh mainnet

# Deploy web (Vercel)
vercel --prod

# Deploy API (Railway)
railway up

# Run E2E tests
npm run test:e2e
```

## SCF Submission

See [docs/SCF_SUBMISSION.md](docs/SCF_SUBMISSION.md) for the complete checklist and application copy.

## License

MIT © BuildBridge 2025
