import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { createError } from '../middleware/error-handler';
import {
  matchInvestors,
  listAllInvestors,
  requestConnection,
  getConnections,
} from '../lib/investor-service';

export const investorRouter = Router();

// ── GET /api/investors ────────────────────────────────────
/**
 * List all investors with optional filters.
 * Public route — no auth needed.
 */
investorRouter.get('/', optionalAuth, async (req, res, next) => {
  try {
    const params = z.object({
      sector:    z.string().optional(),
      stage:     z.string().optional(),
      geography: z.string().optional(),
      limit:     z.coerce.number().min(1).max(50).default(20),
      offset:    z.coerce.number().min(0).default(0),
    }).parse(req.query);

    const result = await listAllInvestors(params);
    res.json(result);
  } catch (err) { next(err); }
});

// ── GET /api/investors/match ──────────────────────────────
/**
 * Get AI-matched investors for the authenticated founder.
 * Scores based on sector, stage, geography, and check size.
 */
investorRouter.get('/match', requireAuth, async (req, res, next) => {
  try {
    const { limit } = z.object({
      limit: z.coerce.number().min(1).max(20).default(10),
    }).parse(req.query);

    const matches = await matchInvestors(req.founder!.founderId, limit);
    res.json(matches);
  } catch (err) { next(err); }
});

// ── GET /api/investors/connections ───────────────────────
/**
 * Get all connection requests made by the authenticated founder.
 */
investorRouter.get('/connections', requireAuth, async (req, res, next) => {
  try {
    const connections = await getConnections(req.founder!.founderId);
    res.json(connections);
  } catch (err) { next(err); }
});

// ── GET /api/investors/:id ────────────────────────────────
/**
 * Get a single investor profile.
 */
investorRouter.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { prisma } = await import('../db/client');
    const investor = await prisma.investor.findUnique({
      where: { id: req.params['id']! },
    });
    if (!investor) throw createError('Investor not found', 404);
    res.json(investor);
  } catch (err) { next(err); }
});

// ── POST /api/investors/:id/connect ──────────────────────
/**
 * Request a connection with an investor.
 */
investorRouter.post('/:id/connect', requireAuth, async (req, res, next) => {
  try {
    const { message } = z.object({
      message: z.string().min(10).max(500).optional(),
    }).parse(req.body);

    const connection = await requestConnection(
      req.founder!.founderId,
      req.params['id']!,
      message,
    );

    res.status(201).json(connection);
  } catch (err) { next(err); }
});
