import request from 'supertest';
import app from '../index';
import { signToken } from '../lib/jwt';
import { prisma } from '../db/client';

// Mock Prisma
jest.mock('../db/client', () => ({
  prisma: {
    pitch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pitchVersion: { create: jest.fn() },
    authChallenge: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    founder: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
  },
}));

// Mock pitch-service to avoid real Claude calls
jest.mock('../lib/pitch-service', () => ({
  ...jest.requireActual('../lib/pitch-service'),
  streamSectionRefinement: jest.fn().mockResolvedValue({
    title: 'The Problem',
    content: 'Founders in Africa struggle to communicate their value to investors.',
    score: 74,
    suggestions: ['Add market size data', 'Quantify the pain'],
  }),
  scorePitch: jest.fn().mockResolvedValue({
    overallScore: 70,
    feedback: 'Solid start. Traction section needs real metrics.',
    strengths: ['Clear problem'],
    improvements: ['Add traction data'],
  }),
  createPitch: jest.fn().mockResolvedValue({ id: 'pitch-1', projectName: 'BuildBridge', status: 'draft', createdAt: new Date() }),
  listPitches: jest.fn().mockResolvedValue([]),
  getPitch: jest.fn().mockResolvedValue({ id: 'pitch-1', founderId: 'founder-1', projectName: 'BuildBridge', problem: null, solution: null, traction: null, team: null, market: null, ask: null, versions: [] }),
  updatePitchSection: jest.fn().mockResolvedValue({}),
  updatePitchScore: jest.fn().mockResolvedValue({}),
  savePitchVersion: jest.fn().mockResolvedValue({ id: 'v1', createdAt: new Date() }),
  updatePitchStatus: jest.fn().mockResolvedValue({ id: 'pitch-1', status: 'archived' }),
  deletePitch: jest.fn().mockResolvedValue({}),
}));

const token = signToken({ founderId: 'founder-1', publicKey: 'G' + 'A'.repeat(55), network: 'testnet' });
const authHeader = { Authorization: `Bearer ${token}` };

describe('Pitch routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/pitch', () => {
    it('creates a pitch and returns 201', async () => {
      const res = await request(app)
        .post('/api/pitch')
        .set(authHeader)
        .send({ projectName: 'BuildBridge', tagline: 'Where builders meet capital' });

      expect(res.status).toBe(201);
      expect(res.body.projectName).toBe('BuildBridge');
    });

    it('rejects missing projectName', async () => {
      const res = await request(app)
        .post('/api/pitch')
        .set(authHeader)
        .send({});

      expect(res.status).toBe(400);
    });

    it('requires auth', async () => {
      const res = await request(app).post('/api/pitch').send({ projectName: 'X' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/pitch', () => {
    it('returns an array of pitches', async () => {
      const res = await request(app).get('/api/pitch').set(authHeader);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/pitch/:id', () => {
    it('returns a pitch by ID', async () => {
      const res = await request(app).get('/api/pitch/pitch-1').set(authHeader);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('pitch-1');
    });
  });

  describe('POST /api/pitch/:id/score', () => {
    it('returns a score object', async () => {
      const res = await request(app)
        .post('/api/pitch/pitch-1/score')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.overallScore).toBe(70);
      expect(res.body.strengths).toBeDefined();
      expect(res.body.improvements).toBeDefined();
    });
  });

  describe('POST /api/pitch/:id/save', () => {
    it('saves a version and returns versionId', async () => {
      const res = await request(app)
        .post('/api/pitch/pitch-1/save')
        .set(authHeader)
        .send({ note: 'After investor feedback' });

      expect(res.status).toBe(201);
      expect(res.body.versionId).toBeDefined();
    });
  });

  describe('PATCH /api/pitch/:id/status', () => {
    it('updates pitch status', async () => {
      const res = await request(app)
        .patch('/api/pitch/pitch-1/status')
        .set(authHeader)
        .send({ status: 'archived' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('archived');
    });

    it('rejects invalid status values', async () => {
      const res = await request(app)
        .patch('/api/pitch/pitch-1/status')
        .set(authHeader)
        .send({ status: 'invalid_status' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/pitch/:id', () => {
    it('deletes a pitch and returns { deleted: true }', async () => {
      const res = await request(app)
        .delete('/api/pitch/pitch-1')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(true);
    });
  });
});
