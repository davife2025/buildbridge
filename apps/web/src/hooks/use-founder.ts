'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { authApi, type FounderProfile } from '@/lib/api';

interface UseFounderReturn {
  founder: FounderProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (data: Partial<FounderProfile>) => Promise<void>;
}

/**
 * useFounder — fetches and manages the authenticated founder's full profile.
 * Useful for settings/profile pages where you need the latest data.
 */
export function useFounder(): UseFounderReturn {
  const { token, founder: cachedFounder, refreshFounder } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      await refreshFounder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshFounder]);

  const update = useCallback(
    async (data: Partial<FounderProfile>) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        await authApi.updateProfile(token, data);
        await refreshFounder();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token, refreshFounder],
  );

  // Refresh on mount if we have a token but no fresh data
  useEffect(() => {
    if (token && !cachedFounder) {
      void refresh();
    }
  }, [token, cachedFounder, refresh]);

  return { founder: cachedFounder, isLoading, error, refresh, update };
}
