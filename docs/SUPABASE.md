# Supabase Setup Guide

BuildBridge uses Supabase as its hosted PostgreSQL database.

## Why Supabase?

| Feature | Benefit |
|---|---|
| Hosted PostgreSQL | No Railway config needed |
| Built-in Studio | Visual DB browser + SQL editor |
| Connection pooling | PgBouncer included — perfect for serverless |
| Row Level Security | Defence-in-depth data protection |
| Storage | Avatar uploads without S3 |
| Realtime | Future: live connection status updates |

---

## Step 1 — Create a Supabase project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New project**
3. Choose your organisation, name it `buildbridge`, pick a region close to your users
4. Set a strong database password — save it somewhere safe

---

## Step 2 — Get your connection strings

In your project: **Settings → Database → Connection string**

You need **two** strings:

### Transaction mode (runtime — port 6543, PgBouncer)
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```
→ Set as `DATABASE_URL` in `.env`

### Session mode (migrations — port 5432)
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```
→ Set as `DIRECT_URL` in `.env`

> **Why two?** PgBouncer (port 6543) pools connections efficiently for your API server. But Prisma migrations need a direct session-mode connection (port 5432) to run DDL statements correctly.

---

## Step 3 — Get your API keys

In your project: **Settings → API**

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Project URL (e.g. `https://abc123.supabase.co`) |
| `SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **never expose this to the browser** |

Copy these into `.env`:
```env
SUPABASE_URL=https://abc123.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Step 4 — Run migrations

### Option A: Supabase SQL Editor (recommended for first setup)

1. Open **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Paste the contents of `apps/api/src/db/migrations/002_supabase.sql`
4. Click **Run**

### Option B: Prisma migrate (for ongoing schema changes)

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Push schema (uses DIRECT_URL for migrations)
npx prisma db push

# Or create a named migration
npx prisma migrate dev --name init
```

---

## Step 5 — Seed investor data

```bash
cd apps/api
npm run db:seed
```

This inserts 20 investor profiles into the `Investor` table.

---

## Step 6 — Verify in Supabase Studio

1. Open **Table Editor** in your Supabase dashboard
2. You should see: `Founder`, `Pitch`, `Milestone`, `Investor`, `InvestorConnection`, `AuthChallenge`
3. After seeding: check the `Investor` table has 20 rows

---

## Step 7 — Set up Storage (optional, for avatar uploads)

1. Open **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it `avatars`, toggle **Public bucket** ON
4. Click **Create bucket**

Or run the commented SQL at the bottom of `002_supabase.sql`.

---

## Connection architecture

```
BuildBridge API (Node.js)
    │
    ├── Prisma ORM
    │     ├── DATABASE_URL → PgBouncer (port 6543) → Supabase PostgreSQL
    │     └── DIRECT_URL  → Direct (port 5432) → Supabase PostgreSQL [migrations only]
    │
    └── Supabase Admin Client
          └── SUPABASE_SERVICE_ROLE_KEY → Supabase REST API → Storage

BuildBridge Web (Next.js)
    └── Supabase Browser Client
          └── NEXT_PUBLIC_SUPABASE_ANON_KEY → Supabase REST API [RLS enforced]
```

---

## Troubleshooting

**`P1001: Can't reach database server`**
→ Check your `DATABASE_URL` has `?pgbouncer=true` on port 6543

**`prepared statement already exists`**
→ Add `?pgbouncer=true&connection_limit=1` to `DATABASE_URL`

**`P3009: migrate found failed migration`**
→ Use `DIRECT_URL` (port 5432) for migrations, not PgBouncer

**`invalid api key`**
→ You may have swapped anon key and service role key
