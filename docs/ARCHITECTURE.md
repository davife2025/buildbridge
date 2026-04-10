# BuildBridge Architecture

## Stack
- Frontend: Next.js 14 + TailwindCSS
- Backend: Node.js + Express + Prisma
- AI: Claude API (Agentic pitch builder)
- Blockchain: Stellar + Soroban smart contracts
- Auth: Freighter wallet + JWT
- DB: PostgreSQL

## Data Flow
1. Founder connects Freighter wallet → API authenticates
2. AI Pitch Agent (Claude) guides founder through pitch sections
3. Pitch saved to PostgreSQL
4. Milestones recorded on Stellar via Soroban
5. Investors view verified on-chain founder profile

## MVP Deliverables (30 Days)
- [ ] Freighter wallet auth
- [ ] AI Pitch Builder
- [ ] Soroban MilestoneTracker (Testnet)
- [ ] Founder dashboard + public profile
- [ ] Basic investor matching
