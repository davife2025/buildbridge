-- BuildBridge — Initial Migration
-- Session 2: creates all tables defined in schema.prisma

-- Enums
CREATE TYPE "StellarNetwork" AS ENUM ('testnet', 'mainnet');
CREATE TYPE "MilestoneCategory" AS ENUM ('product', 'traction', 'funding', 'team', 'partnership', 'other');
CREATE TYPE "PitchStatus" AS ENUM ('draft', 'in_progress', 'complete', 'archived');
CREATE TYPE "InvestorStage" AS ENUM ('pre_seed', 'seed', 'series_a', 'series_b', 'growth', 'any');

-- Founder
CREATE TABLE "Founder" (
    "id"               TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    "stellarPublicKey" TEXT NOT NULL,
    "network"          "StellarNetwork" NOT NULL DEFAULT 'testnet',
    "name"             TEXT,
    "email"            TEXT,
    "bio"              TEXT,
    "location"         TEXT,
    "avatarUrl"        TEXT,
    "twitterHandle"    TEXT,
    "githubHandle"     TEXT,
    "linkedinUrl"      TEXT,
    "websiteUrl"       TEXT,
    CONSTRAINT "Founder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Founder_stellarPublicKey_key" ON "Founder"("stellarPublicKey");
CREATE UNIQUE INDEX "Founder_email_key" ON "Founder"("email");
CREATE INDEX "Founder_stellarPublicKey_idx" ON "Founder"("stellarPublicKey");

-- Pitch
CREATE TABLE "Pitch" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    "founderId"    TEXT NOT NULL,
    "status"       "PitchStatus" NOT NULL DEFAULT 'draft',
    "projectName"  TEXT NOT NULL,
    "tagline"      TEXT,
    "overallScore" INTEGER,
    "problem"      JSONB,
    "solution"     JSONB,
    "traction"     JSONB,
    "team"         JSONB,
    "market"       JSONB,
    "ask"          JSONB,
    CONSTRAINT "Pitch_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Pitch_founderId_fkey" FOREIGN KEY ("founderId")
        REFERENCES "Founder"("id") ON DELETE CASCADE
);

CREATE INDEX "Pitch_founderId_idx" ON "Pitch"("founderId");

-- PitchVersion
CREATE TABLE "PitchVersion" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pitchId"   TEXT NOT NULL,
    "snapshot"  JSONB NOT NULL,
    "note"      TEXT,
    CONSTRAINT "PitchVersion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PitchVersion_pitchId_fkey" FOREIGN KEY ("pitchId")
        REFERENCES "Pitch"("id") ON DELETE CASCADE
);

-- Milestone
CREATE TABLE "Milestone" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    "founderId"   TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "category"    "MilestoneCategory" NOT NULL,
    "txHash"      TEXT,
    "contractId"  TEXT,
    "onChainId"   INTEGER,
    "verifiedAt"  TIMESTAMP(3),
    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Milestone_founderId_fkey" FOREIGN KEY ("founderId")
        REFERENCES "Founder"("id") ON DELETE CASCADE
);

CREATE INDEX "Milestone_founderId_idx" ON "Milestone"("founderId");

-- Investor
CREATE TABLE "Investor" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    "name"          TEXT NOT NULL,
    "firm"          TEXT,
    "email"         TEXT,
    "bio"           TEXT,
    "avatarUrl"     TEXT,
    "websiteUrl"    TEXT,
    "twitterHandle" TEXT,
    "sectors"       TEXT[] NOT NULL DEFAULT '{}',
    "stages"        "InvestorStage"[] NOT NULL DEFAULT '{}',
    "geography"     TEXT[] NOT NULL DEFAULT '{}',
    "minCheck"      INTEGER,
    "maxCheck"      INTEGER,
    CONSTRAINT "Investor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Investor_email_key" ON "Investor"("email");
CREATE INDEX "Investor_sectors_idx" ON "Investor" USING GIN ("sectors");

-- InvestorConnection
CREATE TABLE "InvestorConnection" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "founderId"  TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "status"     TEXT NOT NULL DEFAULT 'pending',
    "message"    TEXT,
    CONSTRAINT "InvestorConnection_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InvestorConnection_founderId_fkey" FOREIGN KEY ("founderId")
        REFERENCES "Founder"("id"),
    CONSTRAINT "InvestorConnection_investorId_fkey" FOREIGN KEY ("investorId")
        REFERENCES "Investor"("id")
);

CREATE UNIQUE INDEX "InvestorConnection_founderId_investorId_key"
    ON "InvestorConnection"("founderId", "investorId");

-- Auth challenge store (ephemeral — in-memory is fine for MVP but here for reference)
CREATE TABLE "AuthChallenge" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "publicKey"   TEXT NOT NULL,
    "challenge"   TEXT NOT NULL,
    "expiresAt"   TIMESTAMP(3) NOT NULL,
    "used"        BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuthChallenge_publicKey_idx" ON "AuthChallenge"("publicKey");
