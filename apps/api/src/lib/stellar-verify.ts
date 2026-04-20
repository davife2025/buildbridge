import { StrKey } from '@stellar/stellar-sdk';
import { randomBytes, verify as cryptoVerify, createPublicKey } from 'crypto';

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

    // Wrap raw Ed25519 key bytes in DER/SPKI format for Node.js
    const derPrefix = Buffer.from('302a300506032b6570032100', 'hex');
    const pubKeyDer = Buffer.concat([derPrefix, pubKeyBytes]);
    const pubKey    = createPublicKey({ key: pubKeyDer, format: 'der', type: 'spki' });

    // crypto.verify(algorithm, data, key, signature)
    // algorithm = null means Ed25519 (no digest — signs raw bytes)
    const result = cryptoVerify(null, msgBytes, pubKey, sigBytes);
    console.log('[verify] result:', result);
    return result;
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