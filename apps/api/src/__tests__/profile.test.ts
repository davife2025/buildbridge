import request from 'supertest';
import app from '../index';

jest.mock('../lib/profile-service', () => ({
  getPublicProfile: jest.fn().mockResolvedValue({
    id: 'founder-1',
    publicKey: 'G' + 'A'.repeat(55),
    name: 'Ada Okonkwo',
    bio: 'Building the future of fintech in Africa.',
    location: 'Lagos, Nigeria',
    completeness: 80,
    pitchCount: 2,
    milestoneCount: 3,
    onChainMilestoneCount: 2,
    topPitch: { id: 'pitch-1', projectName: 'BuildBridge', overallScore: 78 },
    milestones: [
      { id: 'ms-1', title: 'Launched MVP', category: 'product', txHash: 'abc123', onChainId: 1 },
    ],
    joinedAt: new Date().toISOString(),
  }),
  searchFounders: jest.fn().mockResolvedValue([]),
}));

jest.mock('../db/client', () => ({
  prisma: {
    founder: { findUnique: jest.fn().mockResolvedValue({ id: 'founder-1' }) },
    authChallenge: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    pitch: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), delete: jest.fn() },
    pitchVersion: { create: jest.fn() },
    milestone: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}));

describe('Profile routes', () => {
  describe('GET /api/profiles/:id', () => {
    it('returns a public profile', async () => {
      const res = await request(app).get('/api/profiles/founder-1');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Ada Okonkwo');
      expect(res.body.completeness).toBe(80);
      expect(res.body.onChainMilestoneCount).toBe(2);
    });

    it('includes milestones in the response', async () => {
      const res = await request(app).get('/api/profiles/founder-1');
      expect(Array.isArray(res.body.milestones)).toBe(true);
      expect(res.body.milestones[0].txHash).toBe('abc123');
    });
  });

  describe('GET /api/profiles/search?q=', () => {
    it('returns search results', async () => {
      const res = await request(app).get('/api/profiles?q=Ada');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('rejects short queries', async () => {
      const res = await request(app).get('/api/profiles?q=A');
      expect(res.status).toBe(400);
    });
  });
});
