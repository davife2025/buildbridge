import { Keypair } from '@stellar/stellar-sdk';
import { randomBytes, createHash } from 'crypto';

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string;
}): boolean {
  try {
    const { publicKey, message, signature } = params;
    const keypair = Keypair.fromPublicKey(publicKey);
    const sigBytes = Buffer.from(signature.padStart(128, '0'), 'hex');

    // Try 1: raw bytes
    try {
      if (keypair.verify(Buffer.from(message, 'utf-8'), sigBytes)) return true;
    } catch { /* try next */ }

    // Try 2: SHA-256 hash of message
    try {
      const hashed = createHash('sha256').update(message).digest();
      if (keypair.verify(hashed, sigBytes)) return true;
    } catch { /* try next */ }

    // Try 3: hash of utf-8 bytes
    try {
      const hashed = createHash('sha256').update(Buffer.from(message, 'utf-8')).digest();
      if (keypair.verify(hashed, sigBytes)) return true;
    } catch { /* failed */ }

    return false;
  } catch {
    return false;
  }
}

export function generateChallenge(): string {
  return `buildbridge:${randomBytes(32).toString('hex')}`;
}

export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}