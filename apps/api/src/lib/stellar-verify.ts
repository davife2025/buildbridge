import { TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';

export function verifyWalletSignature(params: {
  publicKey: string;
  message: string;   // now the signed XDR
  signature: string; // not used — signature is in the XDR
}): boolean {
  try {
    const { publicKey, message: signedXdr } = params;

    const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);

    // Check the transaction is signed by the expected public key
    const signatures = (tx as any).signatures ?? [];
    if (signatures.length === 0) return false;

    // Verify using Stellar SDK's built-in transaction verification
    const keypairClass = require('@stellar/stellar-sdk').Keypair;
    const keypair = keypairClass.fromPublicKey(publicKey);
    const txHash = (tx as any).hash();

    for (const sig of signatures) {
      try {
        if (keypair.verify(txHash, sig.signature())) {
          console.log('[verify] transaction signature valid');
          return true;
        }
      } catch { /* try next */ }
    }

    console.log('[verify] no valid signature found');
    return false;
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