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

      // 6. Sign the challenge message with Freighter
      setStatus('signing');
      const sigResult = await signMessage(message, {
        address: publicKey,
        networkPassphrase: netDetails.networkPassphrase,
      });
      if (sigResult.error) throw new Error(sigResult.error);

      // Freighter can return a Buffer object, Buffer instance, or string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawSig = (sigResult as any).signedMessage ?? (sigResult as any).signature ?? '';

      let signature: string;
      if (Buffer.isBuffer(rawSig)) {
        // Native Buffer instance
        signature = rawSig.toString('hex').padStart(128, '0');
      } else if (
        typeof rawSig === 'object' &&
        rawSig?.type === 'Buffer' &&
        Array.isArray(rawSig?.data)
      ) {
        // Serialised Buffer object { type: 'Buffer', data: [...] }
        signature = Buffer.from(rawSig.data).toString('hex').padStart(128, '0');
      } else {
        // Plain string (base64 or hex)
        const str = String(rawSig);
        // If it looks like base64, decode it first
        const isHex = /^[0-9a-fA-F]+$/.test(str);
        signature = isHex
          ? str.padStart(128, '0')
          : Buffer.from(str, 'base64').toString('hex').padStart(128, '0');
      }

      if (!signature || signature.replace(/^0+/, '') === '') {
        throw new Error('Freighter returned an empty signature — please try again.');
      }

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