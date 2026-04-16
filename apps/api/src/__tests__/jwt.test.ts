import { signToken, verifyToken } from '../lib/jwt';

describe('JWT utils', () => {
  const payload = {
    founderId: 'founder-abc',
    publicKey: 'G' + 'A'.repeat(55),
    network: 'testnet' as const,
  };

  it('signs and verifies a token', () => {
    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature

    const decoded = verifyToken(token);
    expect(decoded.founderId).toBe(payload.founderId);
    expect(decoded.publicKey).toBe(payload.publicKey);
    expect(decoded.network).toBe(payload.network);
  });

  it('throws on an invalid token', () => {
    expect(() => verifyToken('bad.token.here')).toThrow();
  });

  it('throws on a tampered token', () => {
    const token = signToken(payload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => verifyToken(tampered)).toThrow();
  });
});
