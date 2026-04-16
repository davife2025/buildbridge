import { generateChallenge, challengeExpiresAt } from '../lib/stellar-verify';

describe('stellar-verify utils', () => {
  describe('generateChallenge', () => {
    it('returns a string prefixed with buildbridge:', () => {
      const ch = generateChallenge();
      expect(ch).toMatch(/^buildbridge:/);
    });

    it('generates unique challenges each time', () => {
      const a = generateChallenge();
      const b = generateChallenge();
      expect(a).not.toBe(b);
    });

    it('has sufficient entropy (64 hex chars after prefix)', () => {
      const ch = generateChallenge();
      const hex = ch.replace('buildbridge:', '');
      expect(hex).toHaveLength(64);
      expect(hex).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('challengeExpiresAt', () => {
    it('returns a date ~5 minutes in the future', () => {
      const now = Date.now();
      const exp = challengeExpiresAt();
      const diff = exp.getTime() - now;

      // Between 4m 55s and 5m 5s
      expect(diff).toBeGreaterThan(4 * 60 * 1000 + 55_000);
      expect(diff).toBeLessThan(5 * 60 * 1000 + 5_000);
    });
  });
});
