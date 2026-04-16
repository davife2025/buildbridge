import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { signToken } from '../lib/jwt';
import { verifyWalletSignature, generateChallenge, challengeExpiresAt } from '../lib/stellar-verify';
import { requireAuth } from '../middleware/auth';
import { createError } from '../middleware/error-handler';

export const authRouter = Router();

// ── Validation schemas ────────────────────────────────────

const challengeSchema = z.object({
  publicKey: z.string().min(56).max(56), // Stellar public keys are always 56 chars
});

const connectSchema = z.object({
  publicKey: z.string().min(56).max(56),
  challenge: z.string().startsWith('buildbridge:'),
  signature: z.string().min(1), // hex-encoded signature from Freighter
  network: z.enum(['testnet', 'mainnet']).default('testnet'),
});

// ── GET /api/auth/challenge ───────────────────────────────

/**
 * Step 1 of wallet auth:
 * Client sends their public key → server returns a one-time challenge to sign.
 */
authRouter.get('/challenge', async (req, res, next) => {
  try {
    const { publicKey } = challengeSchema.parse(req.query);

    const challenge = generateChallenge();
    const expiresAt = challengeExpiresAt();

    // Persist challenge in DB (expires in 5 min, single-use)
    await prisma.authChallenge.create({
      data: { publicKey, challenge, expiresAt },
    });

    res.json({
      challenge,
      expiresAt: expiresAt.toISOString(),
      message: `Sign this challenge with your Stellar wallet to authenticate with BuildBridge.\n\nChallenge: ${challenge}`,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/connect ────────────────────────────────

/**
 * Step 2 of wallet auth:
 * Client sends publicKey + challenge + Freighter signature.
 * Server verifies the signature, creates/upserts the Founder, issues JWT.
 */
authRouter.post('/connect', async (req, res, next) => {
  try {
    const { publicKey, challenge, signature, network } = connectSchema.parse(req.body);

    // 1. Look up the challenge
    const stored = await prisma.authChallenge.findUnique({
      where: { challenge },
    });

    if (!stored) {
      throw createError('Challenge not found. Request a new one.', 401);
    }
    if (stored.publicKey !== publicKey) {
      throw createError('Challenge does not match this public key.', 401);
    }
    if (stored.used) {
      throw createError('Challenge has already been used.', 401);
    }
    if (new Date() > stored.expiresAt) {
      throw createError('Challenge has expired. Request a new one.', 401);
    }

    // 2. Verify the Stellar wallet signature
    const messageToSign = `Sign this challenge with your Stellar wallet to authenticate with BuildBridge.\n\nChallenge: ${challenge}`;
    const valid = verifyWalletSignature({ publicKey, message: messageToSign, signature });

    if (!valid) {
      throw createError('Invalid wallet signature.', 401);
    }

    // 3. Mark challenge as used (prevent replay attacks)
    await prisma.authChallenge.update({
      where: { id: stored.id },
      data: { used: true },
    });

    // 4. Upsert founder record
    const founder = await prisma.founder.upsert({
      where: { stellarPublicKey: publicKey },
      create: { stellarPublicKey: publicKey, network },
      update: { network },
    });

    // 5. Issue JWT
    const token = signToken({
      founderId: founder.id,
      publicKey,
      network,
    });

    res.json({
      token,
      founder: {
        id: founder.id,
        publicKey: founder.stellarPublicKey,
        network: founder.network,
        name: founder.name,
        email: founder.email,
        avatarUrl: founder.avatarUrl,
        createdAt: founder.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────

/**
 * Returns the currently authenticated founder's profile.
 */
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const founder = await prisma.founder.findUnique({
      where: { id: req.founder!.founderId },
      include: {
        _count: {
          select: { pitches: true, milestones: true },
        },
      },
    });

    if (!founder) {
      throw createError('Founder not found.', 404);
    }

    res.json({
      id: founder.id,
      publicKey: founder.stellarPublicKey,
      network: founder.network,
      name: founder.name,
      email: founder.email,
      bio: founder.bio,
      location: founder.location,
      avatarUrl: founder.avatarUrl,
      twitterHandle: founder.twitterHandle,
      githubHandle: founder.githubHandle,
      linkedinUrl: founder.linkedinUrl,
      websiteUrl: founder.websiteUrl,
      pitchCount: founder._count.pitches,
      milestoneCount: founder._count.milestones,
      createdAt: founder.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/auth/me ────────────────────────────────────

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  twitterHandle: z.string().max(50).optional(),
  githubHandle: z.string().max(50).optional(),
  linkedinUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
});

/**
 * Updates the authenticated founder's profile.
 */
authRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const founder = await prisma.founder.update({
      where: { id: req.founder!.founderId },
      data,
    });

    res.json({
      id: founder.id,
      publicKey: founder.stellarPublicKey,
      name: founder.name,
      email: founder.email,
      bio: founder.bio,
      location: founder.location,
      updatedAt: founder.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────

/**
 * Logout — client should discard the JWT.
 * Server-side we just clean up expired challenges.
 */
authRouter.post('/logout', requireAuth, async (_req, res, next) => {
  try {
    // Purge expired challenges for hygiene
    await prisma.authChallenge.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});
