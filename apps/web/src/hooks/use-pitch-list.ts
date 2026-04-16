'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { pitchApi, type PitchSummary } from '@/lib/pitch-api';

interface UsePitchListReturn {
  pitches: PitchSummary[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deletePitch: (id: string) => Promise<void>;
}

export function usePitchList(): UsePitchListReturn {
  const { token } = useAuth();
  const [pitches, setPitches] = useState<PitchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await pitchApi.list(token);
      setPitches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pitches');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const deletePitch = useCallback(async (id: string) => {
    if (!token) return;
    try {
      await pitchApi.delete(token, id);
      setPitches((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pitch');
    }
  }, [token]);

  useEffect(() => {
    if (token) void refresh();
  }, [token, refresh]);

  return { pitches, isLoading, error, refresh, deletePitch };
}
