# BuildBridge — Complete Deployment Guide

Deploying all four services:
1. **Supabase** — Database + Storage
2. **Render** — Node.js API
3. **Vercel** — Next.js frontend
4. **Stellar** — Soroban smart contract

---

## Prerequisites

Install these tools before starting:

```bash
# Node.js 18+
node --version

# Rust + Stellar CLI (for contract deploy)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked stellar-cli

# Vercel CLI
npm install -g vercel

# (Optional) Render CLI — or use dashboard
```

---

## Step 1 — Supabase (Database)

### 1.1 Create project
1. Go to [app.supabase.com](https://app.supabase.com) → **New project**
2. Name: `buildbridge`, pick your region, set a strong password
3. Wait ~2 minutes for provisioning

### 1.2 Run the migration
1. Open **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Paste the full contents of `apps/api/src/db/migrations/002_supabase.sql`
4. Click **Run** — you should see "Success"

### 1.3 Collect your credentials
Go to **Settings → Database**:

| Variable | Where |
|---|---|
| `DATABASE_URL` | Connection string → **Transaction** mode (port **6543**) → append `?pgbouncer=true` |
| `DIRECT_URL` | Connection string → **Session** mode (port **5432**) |

Go to **Settings → API**:

| Variable | Where |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret) |

### 1.4 Create Storage bucket (for avatars)
1. Go to **Storage** → **New bucket**
2. Name: `avatars`, toggle **Public** ON
3. Click **Create bucket**

---

## Step 2 — Stellar Contract (Soroban)

### 2.1 Set up a Stellar account
If you don't have a funded Stellar account:

```bash
# Generate a new keypair
stellar keys generate buildbridge-deployer --network testnet

# Fund on testnet (Friendbot)
stellar keys fund buildbridge-deployer --network testnet

# For mainnet: fund via an exchange (Coinbase, Binance, etc.)
```

### 2.2 Build the contract

```bash
cd contracts/milestone-tracker

# Install Rust wasm target
rustup target add wasm32-unknown-unknown

# Build optimised WASM
cargo build --target wasm32-unknown-unknown --release

# Verify
ls target/wasm32-unknown-unknown/release/milestone_tracker.wasm
```

### 2.3 Deploy to testnet first

```bash
# Store your secret key
export STELLAR_SECRET_KEY=your-secret-key

# Deploy
./contracts/deploy.sh testnet
```

Copy the **Contract ID** printed at the end.

### 2.4 Initialise the contract

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source $STELLAR_SECRET_KEY \
  -- init \
  --admin <YOUR_PUBLIC_KEY>
```

### 2.5 Deploy to mainnet (when ready)

```bash
# Fund the mainnet account first, then:
./contracts/deploy.sh mainnet
```

Initialise on mainnet the same way with `--network mainnet`.

---

## Step 3 — Render (API)

Render is simpler than Railway and has a good free tier.

### 3.1 Create a Web Service
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `buildbridge-api`
   - **Root directory**: `apps/api`
   - **Runtime**: Node
   - **Build command**: `npm install && npm run db:generate && npm run build`
   - **Start command**: `npm run start`
   - **Instance type**: Free (or Starter for production)

### 3.2 Set environment variables
In Render dashboard → **Environment** → add all variables:

```
HF_API_KEY=hf_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
STELLAR_NETWORK=mainnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
SOROBAN_RPC_URL=https://soroban.stellar.org
MILESTONE_CONTRACT_ID=your-contract-id
WEB_URL=https://buildbridge.vercel.app
NODE_ENV=production
```

### 3.3 Run database seed after deploy

In Render dashboard → **Shell** (or via SSH):

```bash
npm run db:seed
```

This inserts the 20 investor profiles.

### 3.4 Note your API URL

Render gives you a URL like: `https://buildbridge-api.onrender.com`

---

## Step 4 — Vercel (Frontend)

### 4.1 Deploy via CLI

```bash
cd apps/web
vercel login
vercel --prod
```

Or via GitHub integration:
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. **Root directory**: `apps/web`
4. **Framework**: Next.js (auto-detected)

### 4.2 Set environment variables

In Vercel dashboard → **Settings → Environment Variables** (set for Production):

```
NEXT_PUBLIC_API_URL=https://buildbridge-api.onrender.com
NEXT_PUBLIC_STELLAR_NETWORK=mainnet
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4.3 Redeploy
After adding env vars, trigger a redeploy:
```bash
vercel --prod
```

---

## Step 5 — Verify everything works

### 5.1 API health check
```bash
curl https://buildbridge-api.onrender.com/health
# → { "status": "ok", "service": "buildbridge-api" }
```

### 5.2 Investor list (public)
```bash
curl https://buildbridge-api.onrender.com/api/investors
# → { "investors": [...20 investors...], "total": 20 }
```

### 5.3 Web app
Open your Vercel URL — you should see the BuildBridge landing page.

### 5.4 Full user journey
1. Install [Freighter](https://freighter.app) in Chrome
2. Create/import a Stellar wallet in Freighter
3. Set Freighter to **Mainnet** (or testnet for testing)
4. Click **Connect Wallet** on BuildBridge
5. Approve in Freighter
6. You should land on the dashboard

---

## Step 6 — Update CORS

Make sure your API allows requests from your Vercel domain.

In `apps/api/src/index.ts`, `WEB_URL` env var controls CORS. Set it to your exact Vercel URL:

```
WEB_URL=https://buildbridge.vercel.app
```

If you use a custom domain on Vercel, update this accordingly.

---

## Step 7 — Custom domain (optional)

### Vercel
1. Vercel dashboard → **Settings → Domains**
2. Add `buildbridge.xyz`
3. Update DNS records as instructed

### Render
1. Render dashboard → **Settings → Custom Domains**
2. Add `api.buildbridge.xyz`
3. Update DNS records

### Update env vars
After custom domains are live:
```
# In Render
WEB_URL=https://buildbridge.xyz

# In Vercel
NEXT_PUBLIC_API_URL=https://api.buildbridge.xyz
```

---

## Quick reference

| Service | URL | Purpose |
|---|---|---|
| Supabase | app.supabase.com | PostgreSQL database |
| Render | buildbridge-api.onrender.com | Express API |
| Vercel | buildbridge.vercel.app | Next.js frontend |
| Stellar Explorer | stellar.expert | Contract explorer |

---

## Troubleshooting

### "Freighter not detected" after install
→ Reload the page. Chrome extensions require a full page reload to inject into the window.

### CORS error in browser
→ Check `WEB_URL` in Render matches your exact Vercel URL (including https://)

### `DATABASE_URL` connection timeout on Render
→ Make sure you're using the **Transaction** mode URL (port 6543) with `?pgbouncer=true`

### Prisma migration fails
→ Use `DIRECT_URL` (port 5432) for migrations — not the pooled URL

### Contract invoke fails
→ Make sure you called `init` after deploy with your admin public key

### HuggingFace API 503 / model loading
→ Kimi K2 is a large model. The first request may take 30–60s to load on the free tier.
→ For production: use a dedicated HuggingFace endpoint (HF Pro or Inference Endpoints)

### Render cold start (free tier)
→ Render free tier spins down after 15 minutes of inactivity.
→ First request after sleep takes ~30s. Upgrade to Starter ($7/mo) to avoid this.
