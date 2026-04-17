# BuildBridge 🌉

> **Where builders meet capital**

An Agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain via Soroban, and connect with the right investors.

## AI Model

BuildBridge uses **Kimi K2** (`moonshotai/Kimi-K2-Instruct`) via HuggingFace Inference for all AI pitch coaching. Kimi K2 is a state-of-the-art reasoning model from Moonshot AI with strong performance on structured output tasks.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TailwindCSS → **Vercel** |
| Backend | Node.js + Express + Prisma → **Render** |
| Database | **Supabase** (PostgreSQL + RLS + Storage) |
| AI | **Kimi K2** via HuggingFace Inference |
| Blockchain | Stellar Network + Soroban (Rust) |
| Auth | Freighter wallet (@stellar/freighter-api) + JWT |
| Monorepo | Turborepo |
| Testing | Jest + Playwright |

## Quick Start

```bash
git clone https://github.com/your-username/buildbridge.git
cd buildbridge
cp .env.example .env   # fill in all values

npm install
npm run dev            # web on :3000, api on :4000
```

## Environment Variables

```env
HF_API_KEY=hf_...                    # HuggingFace — Kimi K2
SUPABASE_URL=https://xxx.supabase.co  # Supabase
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
JWT_SECRET=your-secret
MILESTONE_CONTRACT_ID=C...            # Soroban contract
```

See `.env.example` for all variables.

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full step-by-step guide covering:
- Supabase setup + migration + storage bucket
- Stellar contract build, deploy, and initialise
- Render (API) configuration
- Vercel (web) deployment
- Custom domain setup
- Troubleshooting

## Known Issues Fixed

- ✅ "Launch app" no longer redirects — shows inline wallet connect prompt
- ✅ Freighter detection uses `@stellar/freighter-api` (not deprecated `window.freighter`)
- ✅ AI switched from Claude to Kimi K2 via HuggingFace

## License

MIT © BuildBridge 2025
