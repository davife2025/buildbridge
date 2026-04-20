import { StrKey } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import * as nacl from 'tweetnacl';

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string; // format: "txHash:signatureHex"
}): boolean {
  try {
    const { publicKey, signature } = params;

    // Split "txHash:sigHex"
    const colonIdx = signature.indexOf(':');
    if (colonIdx === -1) {
      console.error('[verify] invalid format — expected txHash:sigHex');
      return false;
    }

    const txHash = signature.slice(0, colonIdx);
    const sigHex = signature.slice(colonIdx + 1);

    console.log('[verify] txHash:', txHash);
    console.log('[verify] sigHex length:', sigHex.length);

    const txHashBytes = new Uint8Array(Buffer.from(txHash, 'hex'));
    const sigBytes    = new Uint8Array(Buffer.from(sigHex, 'hex'));
    const pubKeyBytes = new Uint8Array(StrKey.decodeEd25519PublicKey(publicKey));

    // Stellar signs txHash directly with Ed25519 — no additional hashing
    // nacl.sign.detached.verify verifies raw Ed25519 without any digest
    const result = nacl.sign.detached.verify(txHashBytes, sigBytes, pubKeyBytes);

    console.log('[verify] result:', result);
    return result;
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