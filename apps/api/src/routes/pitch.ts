import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { createError } from '../middleware/error-handler';
import { initSSE, sendSSEChunk, sendSSEEvent, sendSSEDone, sendSSEError } from '../lib/sse';
import {
  createPitch,
  getPitch,
  listPitches,
  updatePitchSection,
  savePitchVersion,
  scorePitch,
  updatePitchScore,
  updatePitchStatus,
  deletePitch,
  streamSectionRefinement,
  SECTION_KEYS,
  type SectionKey,
} from '../lib/pitch-service';

export const pitchRouter = Router();

// All pitch routes require auth
pitchRouter.use(requireAuth);

// ─── Validation schemas ───────────────────────────────────

const createPitchSchema = z.object({
  projectName: z.string().min(1).max(120),
  tagline: z.string().max(200).optional(),
});

const refineSchema = z.object({
  section: z.enum(['problem', 'solution', 'traction', 'team', 'market', 'ask']),
  input: z.string().min(10).max(2000),
  saveAfter: z.boolean().default(true),
});

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'in_progress', 'complete', 'archived']),
});

// ── POST /api/pitch ───────────────────────────────────────
/**
 * Create a new pitch for the authenticated founder.
 */
pitchRouter.post('/', async (req, res, next) => {
  try {
    const { projectName, tagline } = createPitchSchema.parse(req.body);
    const pitch = await createPitch(req.founder!.founderId, projectName, tagline);
    res.status(201).json(pitch);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/pitch ────────────────────────────────────────
/**
 * List all pitches for the authenticated founder.
 */
pitchRouter.get('/', async (req, res, next) => {
  try {
    const pitches = await listPitches(req.founder!.founderId);
    res.json(pitches);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/pitch/:id ────────────────────────────────────
/**
 * Get a single pitch with all sections and recent versions.
 */
pitchRouter.get('/:id', async (req, res, next) => {
  try {
    const pitch = await getPitch(req.params['id']!, req.founder!.founderId);
    if (!pitch) throw createError('Pitch not found', 404);
    res.json(pitch);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/pitch/:id/refine  (SSE streaming) ───────────
/**
 * Stream Claude's refinement of a single pitch section.
 *
 * SSE events emitted:
 *   chunk   → { chunk: string }          raw text delta from Claude
 *   section → { section, data }          final parsed section object
 *   done    → { ok: true }               stream complete
 *   error   → { error: string }          on failure
 */
pitchRouter.post('/:id/refine', async (req, res, next) => {
  try {
    const pitchId = req.params['id']!;
    const founderId = req.founder!.founderId;

    const { section, input, saveAfter } = refineSchema.parse(req.body);

    // Verify pitch ownership
    const pitch = await getPitch(pitchId, founderId);
    if (!pitch) throw createError('Pitch not found', 404);

    // Pull existing completed sections for context
    const existingPitch: Record<string, unknown> = {};
    for (const key of SECTION_KEYS) {
      if (key !== section && pitch[key as keyof typeof pitch]) {
        existingPitch[key] = pitch[key as keyof typeof pitch];
      }
    }

    // Start SSE stream
    initSSE(res);

    try {
      const refined = await streamSectionRefinement({
        section: section as SectionKey,
        founderInput: input,
        existingPitch: Object.keys(existingPitch).length ? existingPitch : undefined,
        onChunk: (chunk) => sendSSEChunk(res, chunk),
      });

      // Optionally persist the refined section
      if (saveAfter) {
        await updatePitchSection(pitchId, founderId, section as SectionKey, refined);
      }

      // Send full parsed section result
      sendSSEEvent(res, 'section', { section, data: refined });
      sendSSEDone(res, { section, score: refined.score });
    } catch (streamErr) {
      const msg = streamErr instanceof Error ? streamErr.message : 'AI refinement failed';
      sendSSEError(res, msg);
    }
  } catch (err) {
    next(err);
  }
});

// ── POST /api/pitch/:id/score ─────────────────────────────
/**
 * Score the full pitch using Claude.
 * Returns overallScore, feedback, strengths, improvements.
 */
pitchRouter.post('/:id/score', async (req, res, next) => {
  try {
    const pitchId = req.params['id']!;
    const founderId = req.founder!.founderId;

    const pitch = await getPitch(pitchId, founderId);
    if (!pitch) throw createError('Pitch not found', 404);

    // Build the pitch object for Claude
    const pitchForScoring: Record<string, unknown> = {
      projectName: pitch.projectName,
      tagline: pitch.tagline,
    };
    for (const key of SECTION_KEYS) {
      if (pitch[key as keyof typeof pitch]) {
        pitchForScoring[key] = pitch[key as keyof typeof pitch];
      }
    }

    const result = await scorePitch(pitchForScoring);

    // Persist the score
    await updatePitchScore(pitchId, result.overallScore);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/pitch/:id/save ──────────────────────────────
/**
 * Save a version snapshot of the current pitch state.
 */
pitchRouter.post('/:id/save', async (req, res, next) => {
  try {
    const pitchId = req.params['id']!;
    const founderId = req.founder!.founderId;

    const pitch = await getPitch(pitchId, founderId);
    if (!pitch) throw createError('Pitch not found', 404);

    const { note } = z.object({ note: z.string().max(200).optional() }).parse(req.body);
    const version = await savePitchVersion(pitchId, note);

    res.status(201).json({ versionId: version.id, createdAt: version.createdAt });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/pitch/:id/status ───────────────────────────
/**
 * Update pitch status (draft | in_progress | complete | archived).
 */
pitchRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const pitchId = req.params['id']!;
    const founderId = req.founder!.founderId;
    const { status } = updateStatusSchema.parse(req.body);

    const pitch = await updatePitchStatus(pitchId, founderId, status);
    res.json({ id: pitch.id, status: pitch.status });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/pitch/:id ─────────────────────────────────
/**
 * Permanently delete a pitch and all its versions.
 */
pitchRouter.delete('/:id', async (req, res, next) => {
  try {
    const pitchId = req.params['id']!;
    const founderId = req.founder!.founderId;

    const pitch = await getPitch(pitchId, founderId);
    if (!pitch) throw createError('Pitch not found', 404);

    await deletePitch(pitchId, founderId);
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});
