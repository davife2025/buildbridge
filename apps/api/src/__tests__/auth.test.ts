import request from 'supertest';
import app from '../index';
import { prisma } from '../db/client';
import { generateChallenge, challengeExpiresAt } from '../lib/stellar-verify';
import { signToken } from '../lib/jwt';

// Mock Prisma so tests don't need a real DB
jest.mock('../db/client', () => ({
  prisma: {
    authChallenge: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    founder: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Mock Stellar signature verification
jest.mock('../lib/stellar-verify', () => ({
  ...jest.requireActual('../lib/stellar-verify'),
  verifyWalletSignature: jest.fn().mockReturnValue(true),
}));

describe('Auth routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/auth/challenge', () => {
    it('returns a challenge for a valid public key', async () => {
      const publicKey = 'G' + 'A'.repeat(55);
      (mockPrisma.authChallenge.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .get('/api/auth/challenge')
        .query({ publicKey });

      expect(res.status).toBe(200);
      expect(res.body.challenge).toMatch(/^buildbridge:/);
      expect(res.body.expiresAt).toBeDefined();
    });

    it('rejects an invalid public key', async () => {
      const res = await request(app)
        .get('/api/auth/challenge')
        .query({ publicKey: 'short' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/connect', () => {
    const publicKey = 'G' + 'A'.repeat(55);
    const challenge = generateChallenge();

    it('issues a JWT for a valid signed challenge', async () => {
      (mockPrisma.authChallenge.findUnique as jest.Mock).mockResolvedValue({
        id: 'ch1',
        publicKey,
        challenge,
        expiresAt: challengeExpiresAt(),
        used: false,
      });
      (mockPrisma.authChallenge.update as jest.Mock).mockResolvedValue({});
      (mockPrisma.founder.upsert as jest.Mock).mockResolvedValue({
        id: 'founder1',
        stellarPublicKey: publicKey,
        network: 'testnet',
        name: null,
        email: null,
        avatarUrl: null,
        createdAt: new Date(),
      });

      const res = await request(app).post('/api/auth/connect').send({
        publicKey,
        challenge,
        signature: 'abc123',
        network: 'testnet',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.founder.publicKey).toBe(publicKey);
    });

    it('rejects a used challenge', async () => {
      (mockPrisma.authChallenge.findUnique as jest.Mock).mockResolvedValue({
        id: 'ch1',
        publicKey,
        challenge,
        expiresAt: challengeExpiresAt(),
        used: true,
      });

      const res = await request(app).post('/api/auth/connect').send({
        publicKey,
        challenge,
        signature: 'abc123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/already been used/);
    });

    it('rejects an expired challenge', async () => {
      (mockPrisma.authChallenge.findUnique as jest.Mock).mockResolvedValue({
        id: 'ch1',
        publicKey,
        challenge,
        expiresAt: new Date(Date.now() - 1000), // expired
        used: false,
      });

      const res = await request(app).post('/api/auth/connect').send({
        publicKey,
        challenge,
        signature: 'abc123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/expired/);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns founder profile for a valid JWT', async () => {
      const token = signToken({
        founderId: 'founder1',
        publicKey: 'G' + 'A'.repeat(55),
        network: 'testnet',
      });

      (mockPrisma.founder.findUnique as jest.Mock).mockResolvedValue({
        id: 'founder1',
        stellarPublicKey: 'G' + 'A'.repeat(55),
        network: 'testnet',
        name: 'Ada Okonkwo',
        email: 'ada@example.com',
        bio: null,
        location: 'Lagos, Nigeria',
        avatarUrl: null,
        twitterHandle: null,
        githubHandle: null,
        linkedinUrl: null,
        websiteUrl: null,
        createdAt: new Date(),
        _count: { pitches: 2, milestones: 3 },
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Ada Okonkwo');
      expect(res.body.pitchCount).toBe(2);
    });

    it('rejects requests without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
