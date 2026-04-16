import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { createError } from '../middleware/error-handler';
import {
  listMilestones,
  getMilestone,
  createMilestoneRecord,
  buildMilestoneTx,
  submitMilestoneTx,
  deleteMilestone,
  VALID_CATEGORIES,
} from '../lib/milestone-service';

export const milestoneRouter = Router();

milestoneRouter.use(requireAuth);

// ── Validation ────────────────────────────────────────────

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  category: z.enum(['product', 'traction', 'funding', 'team', 'partnership', 'other']),
});

const buildTxSchema = z.object({
  milestoneId: z.string().min(1),
});

const submitSchema = z.object({
  milestoneId: z.string().min(1),
  signedXdr: z.string().min(1),
});

// ── GET /api/milestones ───────────────────────────────────
/** List all milestones for the authenticated founder */
milestoneRouter.get('/', async (req, res, next) => {
  try {
    const milestones = await listMilestones(req.founder!.founderId);
    res.json(milestones);
  } catch (err) { next(err); }
});

// ── GET /api/milestones/:id ───────────────────────────────
/** Get a single milestone */
milestoneRouter.get('/:id', async (req, res, next) => {
  try {
    const milestone = await getMilestone(req.params['id']!, req.founder!.founderId);
    if (!milestone) throw createError('Milestone not found', 404);
    res.json(milestone);
  } catch (err) { next(err); }
});

// ── POST /api/milestones ──────────────────────────────────
/**
 * Step 1: Create a milestone record in the DB.
 * Returns the milestone with a DB id.
 * On-chain recording happens separately via /build-tx + /submit.
 */
milestoneRouter.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const milestone = await createMilestoneRecord({
      founderId: req.founder!.founderId,
      ...body,
    });
    res.status(201).json(milestone);
  } catch (err) { next(err); }
});

// ── POST /api/milestones/build-tx ─────────────────────────
/**
 * Step 2: Build an unsigned Soroban transaction XDR.
 * Returns XDR string for the frontend to sign with Freighter.
 */
milestoneRouter.post('/build-tx', async (req, res, next) => {
  try {
    const { milestoneId } = buildTxSchema.parse(req.body);

    const milestone = await getMilestone(milestoneId, req.founder!.founderId);
    if (!milestone) throw createError('Milestone not found', 404);
    if (milestone.txHash) throw createError('Milestone already recorded on-chain', 400);

    const network = (req.founder!.network ?? 'testnet') as 'testnet' | 'mainnet';
    const unsignedXdr = await buildMilestoneTx({
      founderPublicKey: req.founder!.publicKey,
      title: milestone.title,
      category: milestone.category,
      network,
    });

    res.json({ unsignedXdr, milestoneId });
  } catch (err) { next(err); }
});

// ── POST /api/milestones/submit ───────────────────────────
/**
 * Step 3: Submit the Freighter-signed XDR to Stellar.
 * Confirms on-chain and updates the DB record.
 */
milestoneRouter.post('/submit', async (req, res, next) => {
  try {
    const { milestoneId, signedXdr } = submitSchema.parse(req.body);

    const milestone = await getMilestone(milestoneId, req.founder!.founderId);
    if (!milestone) throw createError('Milestone not found', 404);
    if (milestone.txHash) throw createError('Milestone already submitted', 400);

    const network = (req.founder!.network ?? 'testnet') as 'testnet' | 'mainnet';
    const { txHash, onChainId } = await submitMilestoneTx({
      signedXdr,
      milestoneId,
      founderId: req.founder!.founderId,
      network,
    });

    res.json({
      txHash,
      onChainId,
      explorerUrl: `https://stellar.expert/explorer/${network}/tx/${txHash}`,
    });
  } catch (err) { next(err); }
});

// ── DELETE /api/milestones/:id ────────────────────────────
/** Delete a milestone (only if not yet on-chain) */
milestoneRouter.delete('/:id', async (req, res, next) => {
  try {
    const milestone = await getMilestone(req.params['id']!, req.founder!.founderId);
    if (!milestone) throw createError('Milestone not found', 404);
    if (milestone.txHash) throw createError('Cannot delete an on-chain milestone', 400);

    await deleteMilestone(req.params['id']!, req.founder!.founderId);
    res.json({ deleted: true });
  } catch (err) { next(err); }
});
