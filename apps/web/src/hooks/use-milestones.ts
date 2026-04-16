'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { milestoneApi, type Milestone, type MilestoneCategory } from '@/lib/milestone-api';

type RecordStatus = 'idle' | 'creating' | 'building' | 'signing' | 'submitting' | 'done' | 'error';

interface UseMilestonesReturn {
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
  recordStatus: RecordStatus;
  lastTxHash: string | null;
  refresh: () => Promise<void>;
  recordMilestone: (params: {
    title: string;
    category: MilestoneCategory;
    description?: string;
  }) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
}

/**
 * useMilestones — manages the full on-chain milestone recording flow:
 * 1. Create DB record
 * 2. Build unsigned Soroban XDR
 * 3. Sign with Freighter
 * 4. Submit to Stellar
 * 5. Update DB with txHash + onChainId
 */
export function useMilestones(): UseMilestonesReturn {
  const { token, founder } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordStatus, setRecordStatus] = useState<RecordStatus>('idle');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await milestoneApi.list(token);
      setMilestones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) void refresh();
  }, [token, refresh]);

  const recordMilestone = useCallback(
    async (params: { title: string; category: MilestoneCategory; description?: string }) => {
      if (!token || !founder) return;
      setError(null);
      setLastTxHash(null);

      try {
        // Step 1: Create DB record
        setRecordStatus('creating');
        const milestone = await milestoneApi.create(token, params);

        // Step 2: Build unsigned Soroban XDR
        setRecordStatus('building');
        const { unsignedXdr } = await milestoneApi.buildTx(token, milestone.id);

        // Step 3: Sign with Freighter
        setRecordStatus('signing');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const freighter = (window as any).freighter;
        if (!freighter) throw new Error('Freighter not installed');

        const network = founder.network ?? 'testnet';
        const networkPassphrase =
          network === 'testnet'
            ? 'Test SDF Network ; September 2015'
            : 'Public Global Stellar Network ; September 2015';

        const { signedXDR } = (await freighter.signTransaction(unsignedXdr, {
          network: network === 'testnet' ? 'TESTNET' : 'PUBLIC',
          networkPassphrase,
        })) as { signedXDR: string };

        // Step 4: Submit + confirm on-chain
        setRecordStatus('submitting');
        const result = await milestoneApi.submit(token, milestone.id, signedXDR);

        setLastTxHash(result.txHash);
        setRecordStatus('done');

        // Refresh list
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to record milestone');
        setRecordStatus('error');
      }
    },
    [token, founder, refresh],
  );

  const deleteMilestone = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await milestoneApi.delete(token, id);
        setMilestones((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete milestone');
      }
    },
    [token],
  );

  return {
    milestones,
    isLoading,
    error,
    recordStatus,
    lastTxHash,
    refresh,
    recordMilestone,
    deleteMilestone,
  };
}
