import { StrKey } from '@stellar/stellar-sdk';
import { randomBytes, verify as cryptoVerify, createPublicKey } from 'crypto';

function makePublicKey(pubKeyBytes: Buffer) {
  const derPrefix = Buffer.from('302a300506032b6570032100', 'hex');
  const pubKeyDer = Buffer.concat([derPrefix, pubKeyBytes]);
  return createPublicKey({ key: pubKeyDer, format: 'der', type: 'spki' });
}

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string;
}): boolean {
  try {
    const { publicKey, message, signature } = params;
    const msgBytes    = Buffer.from(message, 'utf-8');
    const pubKeyBytes = StrKey.decodeEd25519PublicKey(publicKey);
    const pubKey      = makePublicKey(pubKeyBytes);

    // Interpretations of the signature to try
    const sigCandidates: Buffer[] = [];

    // 1. As hex
    if (/^[0-9a-fA-F]+$/.test(signature) && signature.length % 2 === 0) {
      sigCandidates.push(Buffer.from(signature, 'hex'));
    }

    // 2. As base64
    try {
      sigCandidates.push(Buffer.from(signature, 'base64'));
    } catch { /* skip */ }

    for (const sigBuf of sigCandidates) {
      console.log(`[verify] trying sig (${sigBuf.length} bytes, first bytes: ${sigBuf.slice(0,4).toString('hex')})`);

      // Try A: raw message bytes
      try {
        if (cryptoVerify(null, msgBytes, pubKey, sigBuf)) {
          console.log('[verify] ✅ passed: raw bytes');
          return true;
        }
      } catch { /* next */ }

      // Try B: sha256 of message
      try {
        const { createHash } = require('crypto');
        const hashed = createHash('sha256').update(msgBytes).digest();
        if (cryptoVerify(null, hashed, pubKey, sigBuf)) {
          console.log('[verify] ✅ passed: sha256 hash');
          return true;
        }
      } catch { /* next */ }
    }

    console.log('[verify] ❌ all attempts failed');
    return false;
  } catch (e) {
    console.error('[verify] error:', e);
    return false;
  }
}

export function generateChallenge(): string {
  return `buildbridge:${randomBytes(16).toString('hex')}`;
}

export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}