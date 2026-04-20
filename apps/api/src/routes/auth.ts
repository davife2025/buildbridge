import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabase';
import { signToken } from '../lib/jwt';
import { verifyWalletSignature, generateChallenge, challengeExpiresAt } from '../lib/stellar-verify';
import { requireAuth } from '../middleware/auth';
import { createError } from '../middleware/error-handler';

export const authRouter = Router();

// ── Validation schemas ────────────────────────────────────

const challengeSchema = z.object({
  publicKey: z.string().min(56).max(56),
});

const connectSchema = z.object({
  publicKey: z.string().min(56).max(56),
  challenge: z.string().startsWith('buildbridge:'),
  signature: z.string().min(1),
  network: z.enum(['testnet', 'mainnet']).default('testnet'),
});

// ── GET /api/auth/challenge ───────────────────────────────
authRouter.get('/challenge', async (req, res, next) => {
  try {
    const { publicKey } = challengeSchema.parse(req.query);

    const challenge  = generateChallenge();
    const expiresAt  = challengeExpiresAt();

    // Store in Supabase only — no Stellar transaction needed here
    const { error } = await supabaseAdmin
      .from('auth_challenges')
      .insert({
        public_key: publicKey,
        challenge,
        expires_at: expiresAt.toISOString(),
      });

    if (error) throw createError(error.message, 500);

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

authRouter.post('/connect', async (req, res, next) => {
  try {
    const { publicKey, challenge, signature: signedXdr, network } = connectSchema.parse(req.body);

    // Look up challenge
    const { data: stored } = await supabaseAdmin
      .from('auth_challenges')
      .select('*')
      .eq('challenge', challenge)
      .single();

    if (!stored) throw createError('Challenge not found.', 401);
    if (stored.used) throw createError('Challenge already used.', 401);
    if (new Date() > new Date(stored.expires_at)) throw createError('Challenge expired.', 401);

    // Verify the signed transaction
    const valid = verifyWalletSignature({
      publicKey,
      message: signedXdr,  // the signed XDR
      signature: '',         // embedded in XDR
    });

    if (!valid) throw createError('Invalid wallet signature.', 401);


    // 3. Mark challenge as used
    const { error: updateError } = await supabaseAdmin
      .from('auth_challenges')
      .update({ used: true })
      .eq('id', stored.id);

    if (updateError) throw createError(updateError.message, 500);

    // 4. Upsert founder record
    const { data: founder, error: upsertError } = await supabaseAdmin
      .from('founders')
      .upsert(
        { stellar_public_key: publicKey, network },
        { onConflict: 'stellar_public_key' }
      )
      .select()
      .single();

    if (upsertError || !founder) throw createError('Failed to upsert founder.', 500);

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
        publicKey: founder.stellar_public_key,
        network: founder.network,
        name: founder.name,
        email: founder.email,
        avatarUrl: founder.avatar_url,
        createdAt: founder.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data: founder, error } = await supabaseAdmin
      .from('founders')
      .select(`
        *,
        pitches(count),
        milestones(count)
      `)
      .eq('id', req.founder!.founderId)
      .single();

    if (error || !founder) throw createError('Founder not found.', 404);

    res.json({
      id: founder.id,
      publicKey: founder.stellar_public_key,
      network: founder.network,
      name: founder.name,
      email: founder.email,
      bio: founder.bio,
      location: founder.location,
      avatarUrl: founder.avatar_url,
      twitterHandle: founder.twitter_handle,
      githubHandle: founder.github_handle,
      linkedinUrl: founder.linkedin_url,
      websiteUrl: founder.website_url,
      pitchCount: founder.pitches[0]?.count ?? 0,
      milestoneCount: founder.milestones[0]?.count ?? 0,
      createdAt: founder.created_at,
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

authRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    // Map camelCase fields to snake_case for Supabase
    const { data: founder, error } = await supabaseAdmin
      .from('founders')
      .update({
        name: data.name,
        email: data.email,
        bio: data.bio,
        location: data.location,
        twitter_handle: data.twitterHandle,
        github_handle: data.githubHandle,
        linkedin_url: data.linkedinUrl,
        website_url: data.websiteUrl,
      })
      .eq('id', req.founder!.founderId)
      .select()
      .single();

    if (error || !founder) throw createError('Failed to update profile.', 500);

    res.json({
      id: founder.id,
      publicKey: founder.stellar_public_key,
      name: founder.name,
      email: founder.email,
      bio: founder.bio,
      location: founder.location,
      updatedAt: founder.updated_at,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────

authRouter.post('/logout', requireAuth, async (_req, res, next) => {
  try {
    // Purge expired challenges for hygiene
    const { error } = await supabaseAdmin
      .from('auth_challenges')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw createError(error.message, 500);

    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});