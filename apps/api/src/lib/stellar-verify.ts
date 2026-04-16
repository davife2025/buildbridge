import { Keypair, hash } from '@stellar/stellar-sdk';

/**
 * Verifies that a given signature was produced by the owner of `publicKey`
 * signing `message` with their Stellar secret key via Freighter.
 *
 * Freighter signs the SHA-256 hash of the raw message bytes.
 */
export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string; // hex-encoded signature from Freighter
}): boolean {
  try {
    const { publicKey, message, signature } = params;

    const keypair = Keypair.fromPublicKey(publicKey);
    const messageBytes = Buffer.from(message, 'utf-8');
    const messageHash = hash(messageBytes);
    const sigBytes = Buffer.from(signature, 'hex');

    return keypair.verify(messageHash, sigBytes);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically random challenge string.
 * Prefixed with "buildbridge:" so it's clearly scoped.
 */
export function generateChallenge(): string {
  const random = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(random)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `buildbridge:${hex}`;
}

/**
 * Returns the expiry timestamp for a challenge (5 minutes from now).
 */
export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}
