# BuildBridge — Build Sessions

## Overview

| # | Session | Days | Status |
|---|---|---|---|
| 1 | Project setup & monorepo config | 1–2 | ✅ Complete |
| 2 | Database & auth layer | 3–4 | ✅ Complete |
| 3 | AI Pitch Builder — backend | 5–8 | ✅ Complete |
| 4 | AI Pitch Builder — frontend | 9–11 | ✅ Complete |
| 5 | Soroban MilestoneTracker contract | 12–15 | 🔜 Next |
| 6 | Founder dashboard & public profile | 16–19 | ⏳ Pending |
| 7 | Investor matching & discovery | 20–24 | ⏳ Pending |
| 8 | Testing, polish & mainnet launch | 25–30 | ⏳ Pending |

---

## Session 1 — Project Setup & Monorepo Config ✅
**Days 1–2**

### What was built
- Turborepo monorepo with npm workspaces
- Shared TypeScript configs (`base`, `nextjs`, `node`)
- ESLint + Prettier setup
- Commitlint + Husky (conventional commits enforced)
- GitHub Actions CI (lint, type-check, test, build)
- GitHub Actions Deploy (Vercel + Railway on push to main)
- PR template
- Next.js 14 web app scaffold with Tailwind
- Express API scaffold with helmet, cors, rate limiting, morgan
- Prisma schema — full data model (Founder, Pitch, Milestone, Investor, Connection)
- Prisma client singleton
- Health check endpoint (`GET /health`)
- `@buildbridge/ai` package — PitchAgent with Claude API
- `@buildbridge/stellar` package — Freighter wallet, Horizon helpers, MilestoneContract stub
- `@buildbridge/ui` package — Button, Card, Badge, ScoreRing, ScoreBar components
- `@buildbridge/config-typescript` — shared TS configs
- Soroban MilestoneTracker contract scaffold (Rust) with full tests
- `.env.example` with all required variables documented
- Architecture + Contributing docs

### Key files
```
turbo.json
.github/workflows/ci.yml
.github/workflows/deploy.yml
apps/web/src/app/layout.tsx
apps/web/src/app/page.tsx
apps/api/src/index.ts
apps/api/src/db/schema.prisma
packages/ai/src/pitch-agent.ts
packages/stellar/src/wallet.ts
packages/stellar/src/contracts/milestone.ts
contracts/milestone-tracker/src/lib.rs
```

---

## Session 2 — Database & Auth Layer 🔜
**Days 3–4**

### What to build
- [ ] Run `prisma migrate dev` — create initial migration
- [ ] Auth challenge endpoint: `GET /api/auth/challenge`
- [ ] Wallet connect endpoint: `POST /api/auth/connect` (verify Stellar signature + issue JWT)
- [ ] JWT middleware to protect routes
- [ ] Frontend wallet connect button component
- [ ] Frontend auth context + `useWallet` hook
- [ ] Wallet state persistence (localStorage)
- [ ] Protected route wrapper for dashboard

### Stack
`Prisma` `JWT` `Freighter` `Next.js` `Express`

---

## Session 3 — AI Pitch Builder (Backend) ⏳
**Days 5–8**

### What to build
- [ ] `POST /api/pitch` — create new pitch
- [ ] `POST /api/pitch/:id/refine` — stream AI suggestions for a section
- [ ] `GET /api/pitch/:id` — fetch pitch with all sections
- [ ] `PUT /api/pitch/:id` — save section edits
- [ ] `POST /api/pitch/:id/score` — get overall pitch score
- [ ] SSE streaming from Claude API to client
- [ ] Pitch version snapshots on save

### Stack
`Claude API` `SSE` `Prisma` `Zod` `Express`

---

## Session 4 — AI Pitch Builder (Frontend) ⏳
**Days 9–11**

### What to build
- [ ] Multi-step pitch wizard (`/pitch-builder`)
- [ ] Real-time streaming AI suggestions
- [ ] Section score display with ScoreBar
- [ ] Overall pitch score with ScoreRing
- [ ] Save + version history UI
- [ ] Mobile-responsive layout

### Stack
`Next.js` `TailwindCSS` `React` `SSE client`

---

## Session 5 — Soroban MilestoneTracker Contract ⏳
**Days 12–15**

### What to build
- [ ] Complete `lib.rs` implementation (already scaffolded in Session 1)
- [ ] `cargo test` — all tests passing
- [ ] Deploy to Stellar testnet via Stellar CLI
- [ ] Record `MILESTONE_CONTRACT_ID` in `.env`
- [ ] Update `MilestoneContract` TypeScript client with real Soroban invocations
- [ ] `POST /api/milestones` — build unsigned XDR, return to frontend
- [ ] `POST /api/milestones/submit` — submit signed XDR, store `txHash`
- [ ] `GET /api/milestones/:founderId` — fetch on-chain milestones

### Stack
`Rust` `Soroban SDK` `Stellar CLI` `@stellar/stellar-sdk`

---

## Session 6 — Founder Dashboard & Public Profile ⏳
**Days 16–19**

### What to build
- [ ] Founder dashboard (`/dashboard`) — pitch status, milestones, profile %
- [ ] Milestone timeline UI with on-chain verification badges
- [ ] Profile editor (`/settings/profile`)
- [ ] Public founder profile (`/profile/[id]`) — investor-facing
- [ ] Shareable link + OG meta tags
- [ ] Pitch deck preview embed on profile

### Stack
`Next.js` `TailwindCSS` `React` `@buildbridge/ui`

---

## Session 7 — Investor Matching & Discovery ⏳
**Days 20–24**

### What to build
- [ ] Investor data model seed (10–20 initial investors)
- [ ] Matching algorithm: sector + stage + geography + thesis scoring
- [ ] `GET /api/investors/match` — ranked investor list for logged-in founder
- [ ] Investor directory page (`/investors`) with filters
- [ ] `POST /api/investors/:id/connect` — request connection
- [ ] Email notification on connection request (Nodemailer)
- [ ] Investor-side profile view

### Stack
`Node.js` `PostgreSQL` `Nodemailer` `Next.js`

---

## Session 8 — Testing, Polish & Mainnet Launch ⏳
**Days 25–30**

### What to build
- [ ] Playwright E2E tests — full user journey
- [ ] Unit tests for PitchAgent and matching algorithm
- [ ] UI polish pass — loading, empty, error states on every page
- [ ] Deploy MilestoneTracker to Stellar **mainnet**
- [ ] Switch env to `STELLAR_NETWORK=mainnet`
- [ ] Sentry error tracking setup
- [ ] Demo video recording
- [ ] SCF submission — GitHub link, live URL, pitch deck
- [ ] Public launch 🚀

### Stack
`Playwright` `Jest` `Sentry` `Stellar mainnet`

---

## Session 2 — Database & Auth Layer ✅
**Days 3–4**

### What was built

**API**
- `AuthChallenge` model added to Prisma schema (single-use, 5-min expiry)
- `001_init.sql` — full migration SQL for all tables
- `src/lib/jwt.ts` — sign + verify JWT tokens
- `src/lib/stellar-verify.ts` — Stellar signature verification + challenge generation
- `src/middleware/auth.ts` — `requireAuth` and `optionalAuth` middleware
- `src/routes/auth.ts` — full auth router:
  - `GET /api/auth/challenge` — issue one-time sign challenge
  - `POST /api/auth/connect` — verify signature + issue JWT
  - `GET /api/auth/me` — get authenticated founder profile
  - `PATCH /api/auth/me` — update founder profile
  - `POST /api/auth/logout` — clear session

**Web**
- `src/lib/api.ts` — typed API fetch client with all auth methods
- `src/context/auth-context.tsx` — global AuthProvider + `useAuth` hook
- `src/hooks/use-wallet.ts` — full Freighter connect + sign + auth flow
- `src/hooks/use-founder.ts` — profile fetch + update hook
- `src/components/auth/connect-wallet-button.tsx` — wallet connect UI with status states
- `src/components/auth/protected-route.tsx` — redirect wrapper for auth-gated pages
- `src/components/auth/navbar.tsx` — nav with wallet connect + active links
- `src/app/layout.tsx` — updated with AuthProvider + Navbar
- `src/app/dashboard/dashboard-content.tsx` — dashboard with real founder data + stats
- Stub pages for pitch-builder, milestones, investors, profile/:id

**Tests**
- `auth.test.ts` — challenge flow, connect, /me, invalid token
- `jwt.test.ts` — sign/verify/tamper
- `stellar-verify.test.ts` — challenge generation + expiry

### Key files
```
apps/api/src/lib/jwt.ts
apps/api/src/lib/stellar-verify.ts
apps/api/src/middleware/auth.ts
apps/api/src/routes/auth.ts
apps/api/src/db/migrations/001_init.sql
apps/web/src/context/auth-context.tsx
apps/web/src/hooks/use-wallet.ts
apps/web/src/components/auth/connect-wallet-button.tsx
apps/web/src/components/auth/protected-route.tsx
apps/web/src/components/auth/navbar.tsx
```

---

## Session 3 — AI Pitch Builder (Backend) ✅
**Days 5–8**

### What was built

**API**
- `src/lib/pitch-service.ts` — all Claude AI + DB logic:
  - `streamSectionRefinement()` — streams Claude's refinement via SSE
  - `scorePitch()` — full pitch scoring with strengths + improvements
  - CRUD: `createPitch`, `getPitch`, `listPitches`, `updatePitchSection`, `savePitchVersion`, `deletePitch`
- `src/lib/sse.ts` — SSE helpers: `initSSE`, `sendSSEChunk`, `sendSSEEvent`, `sendSSEDone`, `sendSSEError`
- `src/routes/pitch.ts` — full pitch router:
  - `POST /api/pitch` — create pitch
  - `GET /api/pitch` — list pitches
  - `GET /api/pitch/:id` — get pitch with sections
  - `POST /api/pitch/:id/refine` — **SSE stream** Claude refinement
  - `POST /api/pitch/:id/score` — full pitch score
  - `POST /api/pitch/:id/save` — version snapshot
  - `PATCH /api/pitch/:id/status` — update status
  - `DELETE /api/pitch/:id` — delete pitch
- `src/index.ts` — updated: pitch router wired

**Web**
- `src/lib/pitch-api.ts` — typed pitch API client + SSE `streamRefine()` helper
- `src/hooks/use-pitch.ts` — pitch state + streaming management hook
- `src/hooks/use-pitch-list.ts` — pitch list + delete hook
- `src/components/pitch/section-card.tsx` — section display with score bar + suggestions
- `src/components/pitch/refine-modal.tsx` — AI refinement input modal

**Tests**
- `pitch-service.test.ts` — mocked Claude calls, scoring, streaming
- `pitch.test.ts` — all 7 route integration tests

### Key SSE event types
```
event: chunk   → { chunk: string }           raw Claude text delta
event: section → { section, data }           full parsed section JSON
event: done    → { score: number }           stream complete
event: error   → { error: string }           on failure
```

---

## Session 4 — AI Pitch Builder (Frontend) ✅
**Days 9–11**

### What was built

**Components** (`apps/web/src/components/pitch/`)
- `pitch-stepper.tsx` — section progress sidebar with scores + completion indicators
- `pitch-header.tsx` — project name, status badge, save + score action buttons
- `pitch-score-panel.tsx` — modal with score ring, strengths, and top improvements
- `create-pitch-modal.tsx` — new pitch name + tagline entry form
- `pitch-list-card.tsx` — compact card for pitch list view with score ring
- `section-card.tsx` — (from S3) updated: streaming cursor animation, suggestions
- `refine-modal.tsx` — (from S3) textarea input for AI refinement

**Pages** (`apps/web/src/app/pitch-builder/`)
- `page.tsx` + `pitch-builder-index.tsx` — pitch list + create flow
- `[id]/page.tsx` + `[id]/pitch-editor.tsx` — full pitch editor:
  - Sticky stepper sidebar (desktop)
  - All 6 section cards with live streaming AI text
  - Refine modal → streams response → card updates in real time
  - Save version button
  - Score pitch CTA when all sections done
  - Score panel modal with Claude feedback

**Dashboard**
- `dashboard-content.tsx` — updated with recent pitches list + score badges

### User flow
```
/pitch-builder
  → Click "+ New pitch"
  → CreatePitchModal (name + tagline)
  → Redirect to /pitch-builder/:id

/pitch-builder/:id
  → See 6 empty section cards
  → Click "Write" on any card
  → RefineModal: type in your own words
  → Click "Refine with AI →"
  → Modal closes, card shows streaming cursor
  → Claude streams response token by token
  → Section card fills with polished content + score bar
  → Repeat for all 6 sections
  → "Score my pitch →" button appears
  → Click → PitchScorePanel shows overall score + feedback
```
