import { apiFetch } from './api';

export interface Investor {
  id: string;
  name: string;
  firm: string | null;
  bio: string | null;
  email: string | null;
  avatarUrl: string | null;
  twitterHandle: string | null;
  websiteUrl: string | null;
  sectors: string[];
  stages: string[];
  geography: string[];
  minCheck: number | null;
  maxCheck: number | null;
}

export interface InvestorMatch {
  investor: Investor;
  score: number;
  reasons: string[];
  tags: string[];
}

export interface InvestorListResult {
  investors: Investor[];
  total: number;
  limit: number;
  offset: number;
}

export interface Connection {
  id: string;
  founderId: string;
  investorId: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  createdAt: string;
  investor: Investor;
}

export const STAGE_LABELS: Record<string, string> = {
  pre_seed: 'Pre-seed',
  seed:     'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  growth:   'Growth',
  any:      'Any stage',
};

export const formatCheckSize = (min: number | null, max: number | null): string => {
  if (!min && !max) return 'Undisclosed';
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;
  if (!min) return `Up to ${fmt(max!)}`;
  if (!max) return `${fmt(min)}+`;
  return `${fmt(min)} – ${fmt(max)}`;
};

export const investorApi = {
  list: (params?: { sector?: string; stage?: string; geography?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.sector) q.set('sector', params.sector);
    if (params?.stage) q.set('stage', params.stage);
    if (params?.geography) q.set('geography', params.geography);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));
    return apiFetch<InvestorListResult>(`/api/investors?${q}`);
  },

  match: (token: string, limit = 10) =>
    apiFetch<InvestorMatch[]>(`/api/investors/match?limit=${limit}`, { token }),

  get: (id: string) =>
    apiFetch<Investor>(`/api/investors/${id}`),

  connect: (token: string, investorId: string, message?: string) =>
    apiFetch<Connection>(`/api/investors/${investorId}/connect`, {
      method: 'POST', token, body: JSON.stringify({ message }),
    }),

  connections: (token: string) =>
    apiFetch<Connection[]>('/api/investors/connections', { token }),
};
