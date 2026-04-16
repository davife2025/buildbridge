'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { authApi } from '@/lib/api';

type WalletStatus = 'idle' | 'connecting' | 'signing' | 'verifying' | 'error';

interface UseWalletReturn {
  status: WalletStatus;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

/**
 * useWallet — manages the full Freighter wallet connect + JWT auth flow.
 *
 * Flow:
 *   1. Check Freighter is installed
 *   2. Request public key from Freighter
 *   3. Fetch a sign challenge from the API
 *   4. Ask Freighter to sign the challenge message
 *   5. Send signature to API → receive JWT
 *   6. Store JWT in AuthContext
 */
export function useWallet(): UseWalletReturn {
  const { setSession, clearSession, token } = useAuth();
  const [status, setStatus] = useState<WalletStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      // 1. Check Freighter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const freighter = (window as any).freighter;
      if (!freighter) {
        throw new Error(
          'Freighter wallet not found. Install it at freighter.app',
        );
      }

      // 2. Get public key
      const publicKey = (await freighter.getPublicKey()) as string;
      const networkDetails = (await freighter.getNetworkDetails()) as { network: string };
      const network = networkDetails.network.toLowerCase().includes('test')
        ? 'testnet'
        : 'mainnet';

      // 3. Fetch challenge from API
      const { challenge, message } = await authApi.getChallenge(publicKey);

      // 4. Sign with Freighter
      setStatus('signing');
      const signedMessage = (await freighter.signMessage(message, {
        address: publicKey,
        networkPassphrase:
          network === 'testnet'
            ? 'Test SDF Network ; September 2015'
            : 'Public Global Stellar Network ; September 2015',
      })) as { signature: string };

      // 5. Verify with API → get JWT
      setStatus('verifying');
      const { token, founder } = await authApi.connect({
        publicKey,
        challenge,
        signature: signedMessage.signature,
        network,
      });

      // 6. Persist session
      setSession(token, founder, publicKey);
      setStatus('idle');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      setStatus('error');
    }
  }, [setSession]);

  const disconnect = useCallback(async () => {
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // Ignore — clear locally regardless
      }
    }
    clearSession();
    setStatus('idle');
    setError(null);
  }, [token, clearSession]);

  return { status, error, connect, disconnect };
}
