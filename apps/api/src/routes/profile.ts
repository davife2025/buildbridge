import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../middleware/auth';
import { createError } from '../middleware/error-handler';
import { getPublicProfile, searchFounders } from '../lib/profile-service';
import { supabaseAdmin } from '../db/supabase';

export const profileRouter = Router();

// ── GET /api/profiles/:id ─────────────────────────────────
/**
 * Public founder profile — no auth required.
 * Returns full profile with top pitch + milestones.
 */
profileRouter.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const profile = await getPublicProfile(req.params['id']!);
    if (!profile) throw createError('Founder not found', 404);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/profiles/key/:publicKey ─────────────────────
/**
 * Look up a founder profile by Stellar public key.
 * Useful for post-wallet-connect redirects.
 */
profileRouter.get('/key/:publicKey', optionalAuth, async (req, res, next) => {
  try {
    const { data: founder, error } = await supabaseAdmin
      .from('founders')
      .select('id')
      .eq('stellar_public_key', req.params['publicKey']!)
      .maybeSingle();

    if (!founder) throw createError('Founder not found', 404);
    const profile = await getPublicProfile(founder.id);
    res.json(profile);
  } catch (err) { next(err); }
});

// ── GET /api/profiles/search?q= ───────────────────────────
/**
 * Search founders by name or public key.
 */
profileRouter.get('/', async (req, res, next) => {
  try {
    const { q } = z.object({ q: z.string().min(2).max(100) }).parse(req.query);
    const results = await searchFounders(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
});
