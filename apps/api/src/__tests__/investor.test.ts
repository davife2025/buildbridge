import request from 'supertest';
import app from '../index';
import { signToken } from '../lib/jwt';

jest.mock('../db/client', () => ({
  prisma: {
    investor: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'inv-1', name: 'Kola Adeola', firm: 'Lagos Ventures',
          bio: 'Pre-seed African fintech investor',
          sectors: ['fintech', 'africa', 'web3'],
          stages: ['pre_seed', 'seed'],
          geography: ['Africa', 'Nigeria'],
          minCheck: 25000, maxCheck: 150000,
          twitterHandle: null, websiteUrl: null, email: 'kola@lv.vc', avatarUrl: null,
          createdAt: new Date(), updatedAt: new Date(),
        },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: 'inv-1', name: 'Kola Adeola', stages: ['pre_seed'],
        sectors: ['fintech', 'africa'], geography: ['Nigeria'],
        minCheck: 25000, maxCheck: 150000,
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    founder: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'founder-1', stellarPublicKey: 'G' + 'A'.repeat(55),
        location: 'Lagos, Nigeria', name: 'Ada', network: 'testnet',
        createdAt: new Date(), updatedAt: new Date(),
      }),
    },
    pitch: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'pitch-1', status: 'complete', overallScore: 74,
        problem: { content: 'African founders struggle with fintech infrastructure' },
        solution: { content: 'We build stellar blockchain payments' },
        traction: { content: '500 users in Lagos' },
      }),
    },
    investorConnection: {
      findMany: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue({
        id: 'conn-1', founderId: 'founder-1', investorId: 'inv-1',
        status: 'pending', message: 'Hello!', createdAt: new Date(),
        investor: { name: 'Kola Adeola' },
      }),
    },
    authChallenge: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    pitchVersion: { create: jest.fn() },
    milestone: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}));

const token = signToken({ founderId: 'founder-1', publicKey: 'G' + 'A'.repeat(55), network: 'testnet' });
const auth = { Authorization: `Bearer ${token}` };

describe('Investor routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/investors', () => {
    it('returns investor list without auth', async () => {
      const res = await request(app).get('/api/investors');
      expect(res.status).toBe(200);
      expect(res.body.investors).toBeDefined();
      expect(Array.isArray(res.body.investors)).toBe(true);
    });

    it('accepts filter params', async () => {
      const res = await request(app).get('/api/investors?sector=fintech&stage=seed');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/investors/match', () => {
    it('returns matched investors for authenticated founder', async () => {
      const res = await request(app).get('/api/investors/match').set(auth);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('requires auth', async () => {
      const res = await request(app).get('/api/investors/match');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/investors/connections', () => {
    it('returns connection list', async () => {
      const res = await request(app).get('/api/investors/connections').set(auth);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/investors/:id', () => {
    it('returns investor by id', async () => {
      const res = await request(app).get('/api/investors/inv-1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Kola Adeola');
    });
  });

  describe('POST /api/investors/:id/connect', () => {
    it('creates a connection request', async () => {
      const res = await request(app)
        .post('/api/investors/inv-1/connect')
        .set(auth)
        .send({ message: 'Hi Kola, I would love to connect about my fintech project.' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });

    it('rejects too-short messages', async () => {
      const res = await request(app)
        .post('/api/investors/inv-1/connect')
        .set(auth)
        .send({ message: 'Hi' });
      expect(res.status).toBe(400);
    });
  });
});

describe('Matching algorithm', () => {
  it('scores an investor based on sector, stage, and geography', async () => {
    const { matchInvestors } = await import('../lib/investor-service');
    const matches = await matchInvestors('founder-1', 10);
    expect(Array.isArray(matches)).toBe(true);
    if (matches.length > 0) {
      const first = matches[0]!;
      expect(first.score).toBeGreaterThan(0);
      expect(first.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(first.reasons)).toBe(true);
      expect(Array.isArray(first.tags)).toBe(true);
    }
  });
});
