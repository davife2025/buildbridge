import { StrKey, Keypair } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';

export function verifyWalletSignature(params: {
  publicKey: string;
  message:   string;
  signature: string; // format: "txHash:signatureHex"
}): boolean {
  try {
    const { publicKey, signature } = params;

    const colonIdx = signature.indexOf(':');
    if (colonIdx === -1) {
      console.error('[verify] invalid format — expected txHash:sigHex');
      return false;
    }

    const txHash = signature.slice(0, colonIdx);
    const sigHex = signature.slice(colonIdx + 1);

    console.log('[verify] txHash:', txHash);
    console.log('[verify] sigHex:', sigHex);
    console.log('[verify] sigHex length:', sigHex.length);

    const txHashBytes = Buffer.from(txHash, 'hex');
    const sigBytes    = Buffer.from(sigHex, 'hex');

    // Keypair.verify internally uses nacl.sign.detached.verify
    // It verifies raw bytes — no additional hashing
    const keypair = Keypair.fromPublicKey(publicKey);
    const result  = keypair.verify(txHashBytes, sigBytes);

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