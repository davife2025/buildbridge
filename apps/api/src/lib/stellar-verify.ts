import { StrKey, hash } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
// tweetnacl is already installed as a dependency of @stellar/stellar-sdk
import nacl from 'tweetnacl';

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string;
}): boolean {
  try {
    const { publicKey, message, signature } = params;

    const sigBytes    = Buffer.from(signature, 'hex');
    const msgBytes    = Buffer.from(message, 'utf-8');
    const pubKeyBytes = StrKey.decodeEd25519PublicKey(publicKey);

    // Try 1: Freighter signs raw bytes directly (no hash)
    try {
      if (nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes)) {
        console.log('verified with: raw bytes');
        return true;
      }
    } catch { /* next */ }

    // Try 2: Freighter hashes with Stellar hash() then signs raw
    try {
      const hashed = hash(msgBytes);
      if (nacl.sign.detached.verify(hashed, sigBytes, pubKeyBytes)) {
        console.log('verified with: stellar hash');
        return true;
      }
    } catch { /* next */ }

    // Try 3: Double hash (Keypair.sign path)
    try {
      const hashed = hash(msgBytes);
      if (nacl.sign.detached.verify(hash(hashed), sigBytes, pubKeyBytes)) {
        console.log('verified with: double hash');
        return true;
      }
    } catch { /* failed */ }

    console.log('all verification methods failed');
    return false;
  } catch (e) {
    console.error('verify error:', e);
    return false;
  }
}

export function generateChallenge(): string {
  return `buildbridge:${randomBytes(32).toString('hex')}`;
}

export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}