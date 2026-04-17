-- BuildBridge — Supabase Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Or: supabase db push (if using Supabase CLI)

-- ─── Enable pgcrypto for gen_random_uuid ─────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "StellarNetwork"    AS ENUM ('testnet', 'mainnet');
  CREATE TYPE "MilestoneCategory" AS ENUM ('product', 'traction', 'funding', 'team', 'partnership', 'other');
  CREATE TYPE "PitchStatus"       AS ENUM ('draft', 'in_progress', 'complete', 'archived');
  CREATE TYPE "InvestorStage"     AS ENUM ('pre_seed', 'seed', 'series_a', 'series_b', 'growth', 'any');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── AuthChallenge ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AuthChallenge" (
  "id"        TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "publicKey" TEXT      NOT NULL,
  "challenge" TEXT      NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "used"      BOOLEAN   NOT NULL DEFAULT false,
  CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuthChallenge_publicKey_idx" ON "AuthChallenge"("publicKey");

-- ─── Founder ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Founder" (
  "id"               TEXT                NOT NULL DEFAULT gen_random_uuid()::text,
  "createdAt"        TIMESTAMP           NOT NULL DEFAULT now(),
  "updatedAt"        TIMESTAMP           NOT NULL DEFAULT now(),
  "stellarPublicKey" TEXT                NOT NULL UNIQUE,
  "network"          "StellarNetwork"    NOT NULL DEFAULT 'testnet',
  "name"             TEXT,
  "email"            TEXT UNIQUE,
  "bio"              TEXT,
  "location"         TEXT,
  "avatarUrl"        TEXT,
  "twitterHandle"    TEXT,
  "githubHandle"     TEXT,
  "linkedinUrl"      TEXT,
  "websiteUrl"       TEXT,
  CONSTRAINT "Founder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Founder_stellarPublicKey_idx" ON "Founder"("stellarPublicKey");

-- ─── Pitch ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Pitch" (
  "id"           TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
  "createdAt"    TIMESTAMP      NOT NULL DEFAULT now(),
  "updatedAt"    TIMESTAMP      NOT NULL DEFAULT now(),
  "founderId"    TEXT           NOT NULL REFERENCES "Founder"("id") ON DELETE CASCADE,
  "status"       "PitchStatus"  NOT NULL DEFAULT 'draft',
  "projectName"  TEXT           NOT NULL,
  "tagline"      TEXT,
  "overallScore" INTEGER,
  "problem"      JSONB,
  "solution"     JSONB,
  "traction"     JSONB,
  "team"         JSONB,
  "market"       JSONB,
  "ask"          JSONB,
  CONSTRAINT "Pitch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Pitch_founderId_idx" ON "Pitch"("founderId");

-- ─── PitchVersion ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "PitchVersion" (
  "id"        TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "pitchId"   TEXT      NOT NULL REFERENCES "Pitch"("id") ON DELETE CASCADE,
  "snapshot"  JSONB     NOT NULL,
  "note"      TEXT,
  CONSTRAINT "PitchVersion_pkey" PRIMARY KEY ("id")
);

-- ─── Milestone ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Milestone" (
  "id"          TEXT                NOT NULL DEFAULT gen_random_uuid()::text,
  "createdAt"   TIMESTAMP           NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMP           NOT NULL DEFAULT now(),
  "founderId"   TEXT                NOT NULL REFERENCES "Founder"("id") ON DELETE CASCADE,
  "title"       TEXT                NOT NULL,
  "description" TEXT,
  "category"    "MilestoneCategory" NOT NULL,
  "txHash"      TEXT,
  "contractId"  TEXT,
  "onChainId"   INTEGER,
  "verifiedAt"  TIMESTAMP,
  CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Milestone_founderId_idx" ON "Milestone"("founderId");

-- ─── Investor ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Investor" (
  "id"            TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
  "createdAt"     TIMESTAMP      NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMP      NOT NULL DEFAULT now(),
  "name"          TEXT           NOT NULL,
  "firm"          TEXT,
  "email"         TEXT UNIQUE,
  "bio"           TEXT,
  "avatarUrl"     TEXT,
  "websiteUrl"    TEXT,
  "twitterHandle" TEXT,
  "sectors"       TEXT[]         NOT NULL DEFAULT '{}',
  "stages"        "InvestorStage"[] NOT NULL DEFAULT '{}',
  "geography"     TEXT[]         NOT NULL DEFAULT '{}',
  "minCheck"      INTEGER,
  "maxCheck"      INTEGER,
  CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Investor_sectors_idx" ON "Investor" USING GIN ("sectors");

-- ─── InvestorConnection ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "InvestorConnection" (
  "id"         TEXT      NOT NULL DEFAULT gen_random_uuid()::text,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
  "founderId"  TEXT      NOT NULL REFERENCES "Founder"("id"),
  "investorId" TEXT      NOT NULL REFERENCES "Investor"("id"),
  "status"     TEXT      NOT NULL DEFAULT 'pending',
  "message"    TEXT,
  CONSTRAINT "InvestorConnection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InvestorConnection_founderId_investorId_key" UNIQUE ("founderId", "investorId")
);

-- ─── Updated-at trigger ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER "Founder_updatedAt"
    BEFORE UPDATE ON "Founder"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "Pitch_updatedAt"
    BEFORE UPDATE ON "Pitch"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "Milestone_updatedAt"
    BEFORE UPDATE ON "Milestone"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER "Investor_updatedAt"
    BEFORE UPDATE ON "Investor"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Row Level Security ───────────────────────────────────
-- Note: Our app uses the service-role key on the server, which bypasses RLS.
-- RLS is enabled here as a defence-in-depth safety net for direct DB access.

ALTER TABLE "Founder"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pitch"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PitchVersion"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Milestone"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvestorConnection"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuthChallenge"       ENABLE ROW LEVEL SECURITY;

-- Public tables (read-only for anon)
ALTER TABLE "Investor" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors are publicly readable"
  ON "Investor" FOR SELECT USING (true);

-- Founder public profiles are readable
CREATE POLICY "Founder profiles are public"
  ON "Founder" FOR SELECT USING (true);

-- Pitches with status=complete are public
CREATE POLICY "Complete pitches are public"
  ON "Pitch" FOR SELECT USING (status = 'complete');

-- Milestones are public
CREATE POLICY "Milestones are public"
  ON "Milestone" FOR SELECT USING (true);

-- ─── Supabase Storage Bucket ─────────────────────────────
-- Create an 'avatars' bucket for founder profile photos.
-- Run this separately in the Supabase Dashboard → Storage.
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
--
-- CREATE POLICY "Anyone can view avatars"
--   ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
--
-- CREATE POLICY "Authenticated users can upload avatars"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
