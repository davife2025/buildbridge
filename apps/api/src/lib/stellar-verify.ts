import { StrKey } from '@stellar/stellar-sdk';
import { randomBytes, createVerify, createPublicKey } from 'crypto';

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

    // Convert raw Ed25519 public key bytes to SubjectPublicKeyInfo DER format
    // that Node.js crypto expects
    const derPrefix   = Buffer.from('302a300506032b6570032100', 'hex');
    const pubKeyDer   = Buffer.concat([derPrefix, pubKeyBytes]);
    const pubKey      = createPublicKey({ key: pubKeyDer, format: 'der', type: 'spki' });

    // Node's Ed25519 verify does NOT hash — it verifies raw bytes
    // This matches how Freighter's signMessage signs
    const verifier = createVerify('Ed25519');
    verifier.update(msgBytes);
    const result = verifier.verify(pubKey, sigBytes);

    console.log('[verify] Node Ed25519 result:', result);
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