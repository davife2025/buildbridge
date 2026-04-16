import { apiFetch } from './api';

export type MilestoneCategory = 'product' | 'traction' | 'funding' | 'team' | 'partnership' | 'other';

export const CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  product:     'Product',
  traction:    'Traction',
  funding:     'Funding',
  team:        'Team',
  partnership: 'Partnership',
  other:       'Other',
};

export const CATEGORY_ICONS: Record<MilestoneCategory, string> = {
  product:     '🚀',
  traction:    '📈',
  funding:     '💰',
  team:        '👥',
  partnership: '🤝',
  other:       '⭐',
};

export interface Milestone {
  id: string;
  founderId: string;
  title: string;
  description: string | null;
  category: MilestoneCategory;
  txHash: string | null;
  onChainId: number | null;
  contractId: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const milestoneApi = {
  list: (token: string) =>
    apiFetch<Milestone[]>('/api/milestones', { token }),

  get: (token: string, id: string) =>
    apiFetch<Milestone>(`/api/milestones/${id}`, { token }),

  create: (token: string, body: { title: string; category: MilestoneCategory; description?: string }) =>
    apiFetch<Milestone>('/api/milestones', { method: 'POST', token, body: JSON.stringify(body) }),

  buildTx: (token: string, milestoneId: string) =>
    apiFetch<{ unsignedXdr: string; milestoneId: string }>('/api/milestones/build-tx', {
      method: 'POST', token, body: JSON.stringify({ milestoneId }),
    }),

  submit: (token: string, milestoneId: string, signedXdr: string) =>
    apiFetch<{ txHash: string; onChainId: number; explorerUrl: string }>('/api/milestones/submit', {
      method: 'POST', token, body: JSON.stringify({ milestoneId, signedXdr }),
    }),

  delete: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/api/milestones/${id}`, { method: 'DELETE', token }),
};
