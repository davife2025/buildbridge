'use client';

import { useState, useEffect } from 'react';
import { profileApi, type PublicProfile } from '@/lib/profile-api';

interface UseProfileReturn {
  profile: PublicProfile | null;
  isLoading: boolean;
  error: string | null;
}

export function useProfile(founderId: string): UseProfileReturn {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!founderId) return;
    setIsLoading(true);
    setError(null);

    profileApi
      .get(founderId)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, [founderId]);

  return { profile, isLoading, error };
}
