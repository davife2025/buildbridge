import { Keypair } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;
  signature: string;
}): boolean {
  try {
    const { publicKey, message, signature } = params;

    const keypair = Keypair.fromPublicKey(publicKey);
    const messageBytes = Buffer.from(message, 'utf-8');
    const sigBytes = Buffer.from(signature, 'hex');

    return keypair.verify(messageBytes, sigBytes);
  } catch {
    return false;
  }
}

export function generateChallenge(): string {
  return `buildbridge:${randomBytes(32).toString('hex')}`;
}

export function challengeExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}