import request from 'supertest';
import app from '../index';
import { signToken } from '../lib/jwt';

jest.mock('../db/client', () => ({
  prisma: {
    milestone: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    authChallenge: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    founder: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
    pitch: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), delete: jest.fn() },
    pitchVersion: { create: jest.fn() },
  },
}));

jest.mock('../lib/milestone-service', () => ({
  ...jest.requireActual('../lib/milestone-service'),
  listMilestones: jest.fn().mockResolvedValue([]),
  getMilestone: jest.fn().mockResolvedValue({
    id: 'ms-1',
    founderId: 'founder-1',
    title: 'Launched MVP',
    category: 'product',
    description: null,
    txHash: null,
    onChainId: null,
    contractId: null,
    verifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createMilestoneRecord: jest.fn().mockResolvedValue({
    id: 'ms-1',
    title: 'Launched MVP',
    category: 'product',
    createdAt: new Date(),
  }),
  buildMilestoneTx: jest.fn().mockResolvedValue('AAAAAQ...unsigned-xdr'),
  submitMilestoneTx: jest.fn().mockResolvedValue({ txHash: 'abc123hash', onChainId: 1 }),
  deleteMilestone: jest.fn().mockResolvedValue({}),
}));

const token = signToken({ founderId: 'founder-1', publicKey: 'G' + 'A'.repeat(55), network: 'testnet' });
const auth = { Authorization: `Bearer ${token}` };

describe('Milestone routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/milestones returns empty array', async () => {
    const res = await request(app).get('/api/milestones').set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/milestones creates a milestone', async () => {
    const res = await request(app)
      .post('/api/milestones')
      .set(auth)
      .send({ title: 'Launched MVP', category: 'product' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Launched MVP');
  });

  it('POST /api/milestones rejects invalid category', async () => {
    const res = await request(app)
      .post('/api/milestones')
      .set(auth)
      .send({ title: 'Test', category: 'notacategory' });
    expect(res.status).toBe(400);
  });

  it('POST /api/milestones/build-tx returns unsigned XDR', async () => {
    const res = await request(app)
      .post('/api/milestones/build-tx')
      .set(auth)
      .send({ milestoneId: 'ms-1' });
    expect(res.status).toBe(200);
    expect(res.body.unsignedXdr).toBeDefined();
  });

  it('POST /api/milestones/submit confirms on-chain', async () => {
    const res = await request(app)
      .post('/api/milestones/submit')
      .set(auth)
      .send({ milestoneId: 'ms-1', signedXdr: 'AAAAAQ...signed' });
    expect(res.status).toBe(200);
    expect(res.body.txHash).toBe('abc123hash');
    expect(res.body.explorerUrl).toContain('stellar.expert');
  });

  it('DELETE /api/milestones/:id deletes an off-chain milestone', async () => {
    const res = await request(app).delete('/api/milestones/ms-1').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });

  it('requires auth on all routes', async () => {
    const res = await request(app).get('/api/milestones');
    expect(res.status).toBe(401);
  });
});
