'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { authApi } from '@/lib/api';

type WalletStatus = 'idle' | 'detecting' | 'connecting' | 'signing' | 'verifying' | 'error';

const STATUS_LABELS: Record<WalletStatus, string> = {
  idle:       'Connect Wallet',
  detecting:  'Detecting wallet…',
  connecting: 'Connecting…',
  signing:    'Sign in Freighter…',
  verifying:  'Verifying…',
  error:      'Try again',
};

interface UseWalletReturn {
  status: WalletStatus;
  statusLabel: string;
  error: string | null;
  isBusy: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const { setSession, clearSession, token } = useAuth();
  const [status, setStatus] = useState<WalletStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const isBusy = ['detecting', 'connecting', 'signing', 'verifying'].includes(status);

  const connect = useCallback(async () => {
    setError(null);
    setStatus('detecting');

    try {
      // 1. Dynamic import — SSR safe
      const { isConnected, requestAccess, getNetworkDetails, signMessage } =
        await import('@stellar/freighter-api');

      // 2. Check Freighter is installed
      const { isConnected: connected } = await isConnected();
      if (!connected) {
        throw new Error(
          'Freighter not detected. Please install the Freighter extension from freighter.app, then reload the page.',
        );
      }

      // 3. Request wallet access
      setStatus('connecting');
      const access = await requestAccess();
      if (access.error) throw new Error(access.error);
      const publicKey = access.address;
      if (!publicKey) throw new Error('Freighter returned no public key.');

      // 4. Determine network
      const netDetails = await getNetworkDetails();
      const network: 'testnet' | 'mainnet' = netDetails.networkPassphrase?.includes('Test')
        ? 'testnet'
        : 'mainnet';

     // 5. Get auth challenge from API
const { challenge, message } = await authApi.getChallenge(publicKey);

// 6. Sign using signTransaction instead of signMessage
setStatus('signing');
const { signTransaction } = await import('@stellar/freighter-api');

const sigResult = await signTransaction(message, {
  address: publicKey,
  networkPassphrase: netDetails.networkPassphrase,
});

if (sigResult.error) throw new Error(sigResult.error);

const raw = (sigResult as any).signedMessage ?? (sigResult as any).signature;

console.log('[wallet] signedMessage type:', typeof raw);
console.log('[wallet] signedMessage constructor:', raw?.constructor?.name);
console.log('[wallet] signedMessage value:', raw);

let signature: string;

if (!raw) {
  throw new Error('Freighter returned empty signature.');
} else if (typeof raw === 'string') {
  // Could be base64 or hex — try to detect
  const isHex = /^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0;
  if (isHex) {
    signature = raw;
  } else {
    // base64 → hex
    signature = Array.from(Uint8Array.from(atob(raw), c => c.charCodeAt(0)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
} else if (raw instanceof Uint8Array || ArrayBuffer.isView(raw)) {
  // Uint8Array, Int8Array, etc.
  signature = Array.from(raw as Uint8Array)
    .map((b: number) => b.toString(16).padStart(2, '0'))
    .join('');
} else if (Buffer.isBuffer(raw)) {
  signature = raw.toString('hex');
} else if (typeof raw === 'object' && raw?.type === 'Buffer' && Array.isArray(raw?.data)) {
  signature = Buffer.from(raw.data).toString('hex');
} else {
  throw new Error(`Unknown signature format: ${typeof raw} / ${raw?.constructor?.name}`);
}

console.log('[wallet] final signature:', signature);
console.log('[wallet] final signature length:', signature.length);
      // 7. Verify with API → receive JWT + founder
      setStatus('verifying');
      const { token: newToken, founder } = await authApi.connect({
        publicKey,
        challenge,
        signature,
        network,
      });

      setSession(newToken, founder, publicKey);
      setStatus('idle');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Wallet connection failed';
      setError(msg);
      setStatus('error');
    }
  }, [setSession]);

  const disconnect = useCallback(async () => {
    if (token) {
      try { await authApi.logout(token); } catch { /* ignore */ }
    }
    clearSession();
    setStatus('idle');
    setError(null);
  }, [token, clearSession]);

  return {
    status,
    statusLabel: STATUS_LABELS[status],
    error,
    isBusy,
    connect,
    disconnect,
  };
}