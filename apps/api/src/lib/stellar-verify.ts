import { StrKey, hash } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import * as nacl from 'tweetnacl';

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

    console.log('[verify] msgBytes hex:', msgBytes.toString('hex'));
    console.log('[verify] sigBytes length:', sigBytes.length);
    console.log('[verify] pubKeyBytes length:', pubKeyBytes.length);

    // Stellar SDK's Keypair.sign() does: nacl.sign.detached(hash(data), secretKey)
    // So verify must use: nacl.sign.detached.verify(hash(data), sig, pubKey)
    const hashed = hash(msgBytes);
    const result = nacl.sign.detached.verify(hashed, sigBytes, pubKeyBytes);
    console.log('[verify] nacl with stellar hash:', result);

    if (result) return true;

    // Fallback: nacl with raw bytes (no hash)
    const result2 = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);
    console.log('[verify] nacl raw bytes:', result2);

    return result2;
  } catch (e) {
    console.error('[verify] error:', e);
    return false;
  }
}

export function generateChallenge(): string {
  return `buildbridge:${randomBytes(32).toString('hex')}`;
}

export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}