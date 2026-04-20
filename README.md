# BuildBridge

**Where builders meet capital.**

An Agentic AI platform built on Stellar that helps founders from Africa and emerging markets craft investor-ready pitches, verify traction on-chain, and connect with the right investors.

> Built for the Stellar Community Fund (SCF) — Agentic AI Track

---

## Live Demo

| Service | URL |
|---------|-----|
| Web App | [buildbridge-web3.vercel.app](https://buildbridge-web3.vercel.app) |
| API | [buildbridge-46wj.onrender.com](https://buildbridge-46wj.onrender.com/api/health) |

---

## What it does

### 🤖 AI Pitch Builder
Kimi K2 coaches founders section by section — problem, solution, traction, team, market size, and the ask. Each section is scored, and the full pitch gets an overall investor-readiness rating with actionable feedback.

### ⛓️ On-Chain Milestones
Founders record achievements (product launches, revenue milestones, funding rounds, partnerships) via Soroban smart contracts on Stellar. Each milestone is immutably stored and trustlessly verifiable by any investor.

### 🎯 Investor Matching
Founders get matched with VCs and angels based on sector, stage, geography, and check size. 20+ curated investors across Africa, Europe, and globally.

### 📊 Founder Profile
A public, investor-facing profile with verified on-chain traction as proof. Shareable link for investor due diligence.

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + Plus Jakarta Sans
- **Freighter** (Stellar wallet)
- **Vercel** (hosting)

### Backend
- **Node.js** + **Express**
- **TypeScript** + **tsup**
- **Supabase** (PostgreSQL + Auth)
- **Render** (hosting)

### Blockchain
- **Stellar** (testnet + mainnet)
- **Soroban** smart contracts (Rust)
- **@stellar/stellar-sdk**
- **Freighter API**

### AI
- **Kimi K2** via Hugging Face Inference API (`moonshotai/Kimi-K2-Instruct`)
- Streaming responses via SSE

### Monorepo
- **Turborepo**
- **npm workspaces**

---

## Project Structure

```
buildbridge/
├── apps/
│   ├── web/              # Next.js frontend (Vercel)
│   └── api/              # Express backend (Render)
├── packages/
│   ├── stellar/          # Stellar SDK helpers + Soroban contract client
│   └── config-typescript/# Shared TypeScript config
├── contracts/
│   └── milestone-tracker/ # Soroban smart contract (Rust)
├── turbo.json
└── package.json
```

---

## Smart Contract

The `MilestoneTracker` contract is deployed on Stellar testnet:

```
Contract ID: CAZSAM77UTS6FKH2X45RBHGULO36O2QCD5KLCGE43AUGZSQQZYPAHU76
Network: Stellar Testnet
```

### Contract functions

| Function | Description |
|----------|-------------|
| `init` | Initialise contract with admin address |
| `record_milestone` | Record a new milestone on-chain |
| `get_milestone` | Fetch a milestone by on-chain ID |
| `get_founder_milestone_ids` | Get all milestone IDs for a founder |
| `verify_milestone` | Admin-only: mark milestone as verified |
| `total_milestones` | Total milestones recorded |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Rust + `wasm32v1-none` target
- Stellar CLI
- Freighter browser extension

### 1. Clone and install

```bash
git clone https://github.com/your-username/buildbridge.git
cd buildbridge
npm install
```

### 2. Environment variables

**`apps/api/.env`**
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your_64_char_random_secret
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
MILESTONE_CONTRACT_ID=CAZSAM77UTS6FKH2X45RBHGULO36O2QCD5KLCGE43AUGZSQQZYPAHU76
STELLAR_NETWORK=testnet
PORT=4000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_MILESTONE_CONTRACT_ID=CAZSAM77UTS6FKH2X45RBHGULO36O2QCD5KLCGE43AUGZSQQZYPAHU76
```

### 3. Run locally

```bash
# Run both API and web in parallel
npm run dev

# Or individually
cd apps/api && npm run dev
cd apps/web && npm run dev
```

### 4. Seed investors

```bash
cd apps/api
npx ts-node src/db/seed.ts
```

---

## Deploying the Smart Contract

```bash
# Install Stellar CLI
cargo install --locked stellar-cli

# Fund deployer account on testnet
stellar keys generate buildbridge-deployer --network testnet
stellar keys fund buildbridge-deployer --network testnet

# Add to .cargo/config.toml (required for Soroban compatibility)
# [target.wasm32v1-none]
# rustflags = ["-C", "target-feature=-reference-types"]

# Build
stellar contract build

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/milestone_tracker.wasm \
  --network testnet \
  --source buildbridge-deployer

# Initialise
stellar contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  --source buildbridge-deployer \
  -- init \
  --admin $(stellar keys address buildbridge-deployer)
```

---

## Authentication Flow

BuildBridge uses a **Stellar wallet challenge-response** authentication:

1. Frontend requests a challenge from the API (`GET /api/auth/challenge`)
2. API generates a unique challenge string and stores it in Supabase
3. Frontend builds a Stellar transaction encoding the challenge
4. User signs the transaction with Freighter
5. Frontend sends the signed transaction hash + signature to the API (`POST /api/auth/connect`)
6. API verifies the Ed25519 signature against the founder's public key
7. API issues a JWT token for subsequent requests

No passwords. No email. Just your Stellar wallet.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/challenge` | Get signing challenge |
| POST | `/api/auth/connect` | Connect wallet + get JWT |
| GET | `/api/auth/me` | Get current founder |
| PATCH | `/api/auth/me` | Update profile |
| POST | `/api/auth/logout` | Logout |

### Pitches
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pitch` | Create pitch |
| GET | `/api/pitch` | List pitches |
| GET | `/api/pitch/:id` | Get pitch |
| POST | `/api/pitch/:id/refine` | AI refine section (SSE) |
| POST | `/api/pitch/:id/score` | Score full pitch |
| POST | `/api/pitch/:id/save` | Save version |
| DELETE | `/api/pitch/:id` | Delete pitch |

### Milestones
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/milestones` | List milestones |
| POST | `/api/milestones` | Create milestone |
| POST | `/api/milestones/build-tx` | Build Soroban transaction |
| POST | `/api/milestones/submit` | Submit signed transaction |
| DELETE | `/api/milestones/:id` | Delete milestone |

### Investors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investors` | List investors |
| GET | `/api/investors/match` | AI-matched investors |
| POST | `/api/investors/:id/connect` | Request connection |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/:id` | Public founder profile |
| GET | `/api/profiles?q=` | Search founders |

---

## Roadmap

- [x] AI pitch builder with streaming
- [x] On-chain milestone verification via Soroban
- [x] Investor matching and connection requests
- [x] Public founder profiles
- [x] Stellar wallet authentication
- [ ] Investor accounts (invite-only)
- [ ] Async messaging between founders and investors
- [ ] Email notifications (Resend)
- [ ] Founder Pro subscription ($19/month)
- [ ] Mobile app

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## Built By

Built for founders in Africa and emerging markets — democratising access to global capital.

---

## License

MIT