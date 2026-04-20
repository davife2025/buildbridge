import { StrKey } from '@stellar/stellar-sdk';
import { randomBytes, verify as cryptoVerify, createPublicKey } from 'crypto';

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string; // format: "txHash:signatureHex"
}): boolean {
  try {
    const { publicKey, signature } = params;

    // Signature is "txHash:sigHex"
    const colonIdx = signature.indexOf(':');
    if (colonIdx === -1) {
      console.error('[verify] invalid signature format — expected txHash:sigHex');
      return false;
    }

    const txHash   = signature.slice(0, colonIdx);
    const sigHex   = signature.slice(colonIdx + 1);

    console.log('[verify] txHash:', txHash);
    console.log('[verify] sigHex length:', sigHex.length);

    const txHashBytes = Buffer.from(txHash, 'hex');
    const sigBytes    = Buffer.from(sigHex, 'hex');
    const pubKeyBytes = StrKey.decodeEd25519PublicKey(publicKey);

    // Wrap Ed25519 public key in DER/SPKI format for Node.js crypto
    const derPrefix = Buffer.from('302a300506032b6570032100', 'hex');
    const pubKeyDer = Buffer.concat([derPrefix, pubKeyBytes]);
    const pubKey    = createPublicKey({ key: pubKeyDer, format: 'der', type: 'spki' });

    // Stellar signs the transaction hash directly (no extra hashing)
    const result = cryptoVerify(null, txHashBytes, pubKey, sigBytes);
    console.log('[verify] result:', result);
    return result;
  } catch (e) {
    console.error('[verify] error:', e);
    return false;
  }
}

export function generateChallenge(): string {
  // 16 bytes = 32 hex chars — safe for ManageData (≤ 64 bytes with prefix)
  return `buildbridge:${randomBytes(16).toString('hex')}`;
}

export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}