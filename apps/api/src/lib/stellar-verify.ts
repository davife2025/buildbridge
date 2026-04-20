import { Keypair } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string;
}): boolean {
  const { publicKey, message, signature } = params;

  console.log('[verify] publicKey:', publicKey);
  console.log('[verify] signature length:', signature.length);
  console.log('[verify] message:', message);

  // Freighter signatures are sometimes 63 bytes with a missing leading zero
  // Pad to 128 hex chars (64 bytes) to be safe
  const paddedSig = signature.padStart(128, '0');
  const sigBytes  = Buffer.from(paddedSig, 'hex');
  const msgBytes  = Buffer.from(message, 'utf-8');

  console.log('[verify] sigBytes length:', sigBytes.length);

  // Attempt 1 — Keypair.verify with raw message bytes
  // In stellar-sdk v12, Keypair.verify does NOT hash internally
  try {
    const keypair = Keypair.fromPublicKey(publicKey);
    const result  = keypair.verify(msgBytes, sigBytes);
    console.log('[verify] attempt 1 (raw):', result);
    if (result) return true;
  } catch (e) {
    console.log('[verify] attempt 1 error:', e);
  }

  // Attempt 2 — Keypair.verify with SHA-256 hash of message
  try {
    const { createHash } = require('crypto') as typeof import('crypto');
    const hashed  = createHash('sha256').update(msgBytes).digest();
    const keypair = Keypair.fromPublicKey(publicKey);
    const result  = keypair.verify(hashed, sigBytes);
    console.log('[verify] attempt 2 (sha256):', result);
    if (result) return true;
  } catch (e) {
    console.log('[verify] attempt 2 error:', e);
  }

  // Attempt 3 — Keypair.sign test (verify our own signing works)
  try {
    const keypair = Keypair.fromPublicKey(publicKey);
    const testSig = Buffer.from(paddedSig, 'hex');
    // Try with the hash() function from stellar-sdk
    const { hash } = require('@stellar/stellar-sdk') as typeof import('@stellar/stellar-sdk');
    const hashed  = hash(msgBytes);
    const result  = keypair.verify(hashed, testSig);
    console.log('[verify] attempt 3 (stellar hash):', result);
    if (result) return true;
  } catch (e) {
    console.log('[verify] attempt 3 error:', e);
  }

  console.log('[verify] all attempts failed');
  return false;
}

export function generateChallenge(): string {
  return `buildbridge:${randomBytes(32).toString('hex')}`;
}

export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}