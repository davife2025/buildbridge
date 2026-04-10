# BuildBridge 🌉

> **Where builders meet capital** — An agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain, and connect with the right investors.

## Overview

BuildBridge solves the "pitch gap" — the disconnect between great builders and the capital they need. Most founders, especially in emerging markets, lack access to structured guidance, investor networks, and tools to present their projects compellingly.

We combine **Agentic AI** with the **Stellar blockchain** to:
- 🤖 Guide founders through building a compelling investor pitch
- ⛓️ Record and verify milestones on-chain via Soroban smart contracts
- 🤝 Match founders with the right investors based on stage, sector & geography
- 📊 Provide a transparent, verifiable founder profile for investor due diligence

## Monorepo Structure

```
buildbridge/
├── apps/
│   ├── web/          # Next.js frontend (founder dashboard + pitch builder)
│   └── api/          # Node.js backend API
├── packages/
│   ├── ui/           # Shared UI component library
│   ├── stellar/      # Stellar & Soroban integration SDK
│   └── ai/           # Agentic AI pitch builder logic
├── contracts/        # Soroban smart contracts (Rust)
└── docs/             # Documentation & architecture
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express, Prisma |
| AI | Claude API (Anthropic) — Agentic pitch builder |
| Blockchain | Stellar Network + Soroban smart contracts |
| Database | PostgreSQL |
| Auth | Stellar Wallet (Freighter) + JWT |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/buildbridge.git
cd buildbridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development servers
npm run dev
```

## Key Features (MVP — 30 Days)

1. **AI Pitch Builder** — Agentic flow that guides founders through structuring their pitch narrative, problem statement, traction metrics, and funding ask
2. **On-Chain Milestone Tracker** — Soroban smart contract to record and verify key project milestones on Stellar
3. **Founder Profile Dashboard** — Clean web interface to manage pitch, milestones, and investor-facing profile

## Stellar & Soroban

BuildBridge uses Stellar for:
- **Milestone verification** — Immutable on-chain record of founder achievements
- **Credibility layer** — Investors can verify traction without trusting a centralized database
- **Future: Tokenized funding agreements** — Smart contract-based milestone-gated funding

## Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) first.

## License

MIT © BuildBridge 2025
