import { TransactionBuilder, Keypair } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';

const NETWORK_PASSPHRASE = {
  testnet: 'Test SDF Network ; September 2015',
  mainnet: 'Public Global Stellar Network ; September 2015',
};

export function verifyWalletSignature(params: {
  publicKey: string;
  message:   string;
  signature: string; // full signed XDR
  network?:  'testnet' | 'mainnet';
}): boolean {
  try {
    const { publicKey, signature: signedXdr, network = 'testnet' } = params;

    const passphrase = NETWORK_PASSPHRASE[network];

    // Decode the signed transaction from XDR
    const tx = TransactionBuilder.fromXDR(signedXdr, passphrase);

    // Compute the transaction hash — this is what was signed
    const txHash = (tx as any).hash();
    console.log('[verify] txHash:', txHash.toString('hex'));

    // Get the signatures from the envelope
    const signatures = (tx as any).signatures;
    console.log('[verify] signatures count:', signatures?.length);

    if (!signatures || signatures.length === 0) {
      console.error('[verify] no signatures in XDR');
      return false;
    }

    const keypair = Keypair.fromPublicKey(publicKey);

    // Try each signature — find the one that matches this public key
    for (const decoratedSig of signatures) {
      try {
        const sigBytes = decoratedSig.signature();
        console.log('[verify] trying sig:', sigBytes.toString('hex').slice(0, 20) + '...');
        const result = keypair.verify(txHash, sigBytes);
        console.log('[verify] result:', result);
        if (result) return true;
      } catch (e) {
        console.log('[verify] sig attempt error:', e);
      }
    }

    console.log('[verify] no matching signature found');
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