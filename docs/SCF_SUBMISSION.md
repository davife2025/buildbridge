# BuildBridge — SCF Submission Checklist

## Stellar Community Fund (SCF) — Agentic AI Track

---

## Pre-submission checklist

### ✅ Technical
- [ ] All 8 sessions complete
- [ ] Soroban MilestoneTracker deployed to **Stellar mainnet**
  ```bash
  STELLAR_NETWORK=mainnet ./contracts/deploy.sh mainnet
  ```
- [ ] `MILESTONE_CONTRACT_ID` updated in production env vars
- [ ] Web app deployed to Vercel (live URL)
- [ ] API deployed to Railway (live URL)
- [ ] Database migrated on Supabase production project
- [ ] 20 investors seeded: `npm run db:seed`
- [ ] All E2E tests passing: `npm run test:e2e`
- [ ] Sentry error tracking configured

### ✅ Repository
- [ ] GitHub repo is **public**: `github.com/[username]/buildbridge`
- [ ] `README.md` is up to date with live URLs
- [ ] `docs/SESSIONS.md` shows all 8 sessions complete
- [ ] Latest code pushed to `main`
- [ ] No secrets or API keys in the repo (check with `git log`)

### ✅ Demo
- [ ] Demo video recorded (2–4 minutes)
  - Show wallet connect flow
  - Build a pitch section with AI streaming
  - Record a milestone (testnet is fine for demo)
  - Show the public profile
  - Show the investor matches
- [ ] Video uploaded to YouTube (unlisted is fine)
- [ ] Video thumbnail looks professional

### ✅ SCF Application
- [ ] Project name: **BuildBridge**
- [ ] Track: **Agentic AI**
- [ ] One-line description ready
- [ ] Problem statement polished (max 200 words)
- [ ] Solution + technical approach explained
- [ ] Team section complete
- [ ] Requested amount: **$150,000 in XLM**
- [ ] 30-day deliverable clearly stated

---

## Application text (copy-paste ready)

### Project name
BuildBridge

### Track
Agentic AI

### One-line description
An Agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain via Soroban, and connect with the right investors.

### Problem
Most founders, especially in emerging markets like Africa, fail to raise funding not because their ideas lack merit — but because they cannot communicate their value effectively to VCs and investors. The "pitch gap" is real: founders lack access to structured coaching, investor networks, and credibility tools. Billions in potential investment goes unmade every year.

### Solution
BuildBridge closes the pitch gap with three core innovations:
1. **Agentic AI Pitch Builder** — Claude guides founders section by section through their pitch, streaming real-time suggestions, scoring each section, and providing investor-framed feedback
2. **On-Chain Milestone Verification** — Key founder achievements are recorded via the MilestoneTracker Soroban smart contract on Stellar, making them immutably verifiable by investors without trusting a centralised database
3. **Intelligent Investor Matching** — A scoring algorithm matches founders with VCs and angels based on sector, stage, geography, and check size

### Technical approach
- **Stellar + Soroban**: MilestoneTracker smart contract records founder milestones on-chain. Each milestone is authenticated via `require_auth()`, categorised, and indexed per founder. Deployed on Stellar testnet, mainnet on launch.
- **Freighter wallet auth**: Founders authenticate via a challenge-response signature flow using their Stellar wallet — no email/password required.
- **Claude API (Agentic AI)**: `claude-sonnet-4-20250514` generates pitch sections via streaming SSE, enabling real-time token-by-token feedback in the UI.
- **Stack**: Next.js 14, Node.js + Express, Prisma + Supabase (PostgreSQL), Turborepo monorepo.

### 30-day deliverable
A live, testable web app at buildbridge.xyz with:
- Freighter wallet authentication
- AI Pitch Builder with Claude streaming (6 sections + overall score)
- Soroban MilestoneTracker deployed on Stellar mainnet
- Founder dashboard + public investor-facing profile with OG meta tags
- Investor matching with 20+ investor profiles
- E2E test suite

### Team
[Your name and background here]

### Links
- Live app: https://buildbridge.xyz
- GitHub: https://github.com/[username]/buildbridge
- Demo video: [YouTube link]
- Contract (testnet): https://stellar.expert/explorer/testnet/contract/[CONTRACT_ID]

---

## Deploy commands

```bash
# 1. Deploy Soroban contract to mainnet
STELLAR_SECRET_KEY=your-key ./contracts/deploy.sh mainnet

# 2. Set MILESTONE_CONTRACT_ID in production env

# 3. Deploy web to Vercel
vercel --prod

# 4. Deploy API to Railway
railway up --service buildbridge-api

# 5. Run E2E tests against live URL
E2E_BASE_URL=https://buildbridge.xyz npm run test:e2e
```
