'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { investorApi, type InvestorMatch, type Investor, type Connection } from '@/lib/investor-api';

interface UseInvestorsReturn {
  matches: InvestorMatch[];
  allInvestors: Investor[];
  connections: Connection[];
  isLoadingMatches: boolean;
  isLoadingAll: boolean;
  isConnecting: boolean;
  connectedIds: Set<string>;
  error: string | null;
  connectToInvestor: (investorId: string, message?: string) => Promise<void>;
  refreshMatches: () => Promise<void>;
}

export function useInvestors(): UseInvestorsReturn {
  const { token } = useAuth();
  const [matches, setMatches] = useState<InvestorMatch[]>([]);
  const [allInvestors, setAllInvestors] = useState<Investor[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectedIds = new Set(connections.map((c) => c.investorId));

  const refreshMatches = useCallback(async () => {
    if (!token) return;
    setIsLoadingMatches(true);
    try {
      const data = await investorApi.match(token);
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setIsLoadingMatches(false);
    }
  }, [token]);

  const loadAll = useCallback(async () => {
    setIsLoadingAll(true);
    try {
      const result = await investorApi.list({ limit: 50 });
      setAllInvestors(result.investors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load investors');
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  const loadConnections = useCallback(async () => {
    if (!token) return;
    try {
      const data = await investorApi.connections(token);
      setConnections(data);
    } catch {
      // non-critical
    }
  }, [token]);

  useEffect(() => {
    void loadAll();
    if (token) {
      void refreshMatches();
      void loadConnections();
    }
  }, [token, loadAll, refreshMatches, loadConnections]);

  const connectToInvestor = useCallback(async (investorId: string, message?: string) => {
    if (!token) return;
    setIsConnecting(true);
    setError(null);
    try {
      const conn = await investorApi.connect(token, investorId, message);
      setConnections((prev) => [...prev.filter((c) => c.investorId !== investorId), conn]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send connection');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [token]);

  return {
    matches, allInvestors, connections,
    isLoadingMatches, isLoadingAll, isConnecting,
    connectedIds, error,
    connectToInvestor, refreshMatches,
  };
}
