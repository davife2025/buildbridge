# BuildBridge 🌉

> **Where builders meet capital**

An Agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain, and connect with the right investors.

[![CI](https://github.com/buildbridge/buildbridge/actions/workflows/ci.yml/badge.svg)](https://github.com/buildbridge/buildbridge/actions)

---

## The Problem

Most founders, especially in emerging markets like Africa, fail to raise not because their ideas lack merit — but because they can't communicate their value effectively to VCs and investors. BuildBridge closes the pitch gap.

## What We Build

| Feature | Description |
|---|---|
| 🤖 AI Pitch Builder | Agentic AI (Claude) guides founders section-by-section through their pitch |
| ⛓️ On-Chain Milestones | Key achievements recorded via Soroban smart contracts on Stellar |
| 🎯 Investor Matching | Smart matching based on sector, stage, geography, and thesis |
| 📊 Founder Profile | Public, investor-ready profile with verified on-chain traction |

---

## Monorepo Structure

```
buildbridge/
├── apps/
│   ├── web/                   # Next.js 14 frontend
│   └── api/                   # Node.js + Express backend
├── packages/
│   ├── ai/                    # Claude-powered PitchAgent
│   ├── stellar/               # Freighter + Soroban integration
│   ├── ui/                    # Shared React component library
│   └── config-typescript/     # Shared TS configs
├── contracts/
│   └── milestone-tracker/     # Soroban smart contract (Rust)
├── docs/                      # Architecture, contributing, sessions
├── .github/
│   ├── workflows/             # CI and deploy pipelines
│   └── PULL_REQUEST_TEMPLATE.md
├── turbo.json                 # Turborepo pipeline
├── .env.example               # Environment variable template
└── Cargo.toml                 # Rust workspace
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express, Prisma |
| AI | Claude API (Anthropic) — Agentic pitch builder |
| Blockchain | Stellar Network + Soroban smart contracts (Rust) |
| Database | PostgreSQL |
| Auth | Freighter wallet + JWT |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions → Vercel (web) + Railway (api) |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 15+
- Rust + Stellar CLI (for contract work)
- [Freighter browser extension](https://freighter.app)

### Setup

```bash
# Clone
git clone https://github.com/buildbridge/buildbridge.git
cd buildbridge

# Install all dependencies
npm install

# Set up environment
cp .env.example .env
# Fill in your values in .env

# Run database migrations
cd apps/api && npm run db:migrate && cd ../..

# Start all apps in dev mode
npm run dev
```

This starts:
- **Web** → http://localhost:3000
- **API** → http://localhost:4000
- **API health check** → http://localhost:4000/health

---

## Build Sessions

| # | Session | Status |
|---|---|---|
| 1 | Project setup & monorepo config | ✅ Complete |
| 2 | Database & auth layer | 🔜 Next |
| 3 | AI Pitch Builder (backend) | ⏳ Pending |
| 4 | AI Pitch Builder (frontend) | ⏳ Pending |
| 5 | Soroban MilestoneTracker contract | ⏳ Pending |
| 6 | Founder dashboard & public profile | ⏳ Pending |
| 7 | Investor matching & discovery | ⏳ Pending |
| 8 | Testing, polish & mainnet launch | ⏳ Pending |

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## License

MIT © BuildBridge 2025
