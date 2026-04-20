'use client';

import { useState, useCallback } from 'react';
import type { Transaction as StellarTransaction } from '@stellar/stellar-sdk';
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
      const freighter = await import('@stellar/freighter-api');

      // 2. Check Freighter is installed
      const { isConnected: connected } = await freighter.isConnected();
      if (!connected) {
        throw new Error(
          'Freighter not detected. Please install the Freighter extension from freighter.app, then reload the page.',
        );
      }

      // 3. Request wallet access
      setStatus('connecting');
      const access = await freighter.requestAccess();
      if (access.error) throw new Error(access.error);
      const publicKey = access.address;
      if (!publicKey) throw new Error('Freighter returned no public key.');

      // 4. Determine network
      const netDetails = await freighter.getNetworkDetails();
      const network: 'testnet' | 'mainnet' = netDetails.networkPassphrase?.includes('Test')
        ? 'testnet'
        : 'mainnet';

      const rpcUrl = network === 'testnet'
        ? 'https://soroban-testnet.stellar.org'
        : 'https://soroban.stellar.org';

      // 5. Get auth challenge from API
      const { challenge } = await authApi.getChallenge(publicKey);

      // 6. Build a Stellar transaction encoding the challenge
      setStatus('signing');

      const sdk    = await import('@stellar/stellar-sdk');
      const server = new sdk.SorobanRpc.Server(rpcUrl);
      const accountData = await server.getAccount(publicKey);

      // Challenge value must be ≤ 64 bytes for ManageData
      const challengeValue = challenge.replace('buildbridge:', '').slice(0, 32);

      const tx = new sdk.TransactionBuilder(
        new sdk.Account(accountData.accountId(), accountData.sequenceNumber()),
        {
          fee:               '100',
          networkPassphrase: netDetails.networkPassphrase,
        },
      )
        .addOperation(
          sdk.Operation.manageData({
            name:  'buildbridge_auth',
            value: Buffer.from(challengeValue, 'utf-8'),
          }),
        )
        .setTimeout(60)
        .build();

      // 7. Sign with Freighter
      const signResult = await freighter.signTransaction(
        tx.toEnvelope().toXDR('base64'),
        {
          networkPassphrase: netDetails.networkPassphrase,
          address:           publicKey,
        },
      );

      if (signResult.error) throw new Error(signResult.error);
      const signedXdr = signResult.signedTxXdr;
      if (!signedXdr) throw new Error('Freighter returned no signed transaction.');

      // 8. Extract signature and tx hash from signed envelope
      const signedTx   = sdk.TransactionBuilder.fromXDR(signedXdr, netDetails.networkPassphrase);
      const asTx       = signedTx as StellarTransaction;
      const signatures = asTx.signatures;

      if (!signatures || signatures.length === 0) {
        throw new Error('No signatures found in signed transaction.');
      }

      const signature = signatures[0]!.signature().toString('hex');
      const txHash    = asTx.hash().toString('hex');

      console.log('[wallet] txHash:', txHash);
      console.log('[wallet] signature:', signature);
      console.log('[wallet] signature length:', signature.length);

      // 9. Verify with API — send txHash:signature so backend can verify
      setStatus('verifying');
      const { token: newToken, founder } = await authApi.connect({
        publicKey,
        challenge,
        signature: `${txHash}:${signature}`,
        network,
      });

      setSession(newToken, founder, publicKey);
      setStatus('idle');

    } catch (err) {
  // Log full error details regardless of type
  console.error('[wallet] full error:', JSON.stringify(err, null, 2));
  console.error('[wallet] error type:', typeof err);
  console.error('[wallet] error keys:', err && typeof err === 'object' ? Object.keys(err) : 'n/a');

  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as any).message)
        : typeof err === 'object' && err !== null && 'error' in err
          ? String((err as any).error)
          : 'Wallet connection failed';

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