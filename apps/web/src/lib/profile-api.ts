import { apiFetch } from './api';
import type { PitchSectionData } from './pitch-api';
import type { MilestoneCategory } from './milestone-api';

export interface PublicMilestone {
  id: string;
  title: string;
  description: string | null;
  category: MilestoneCategory;
  txHash: string | null;
  onChainId: number | null;
  contractId: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface TopPitch {
  id: string;
  projectName: string;
  tagline: string | null;
  overallScore: number | null;
  problem: PitchSectionData | null;
  solution: PitchSectionData | null;
  traction: PitchSectionData | null;
  team: PitchSectionData | null;
  market: PitchSectionData | null;
  ask: PitchSectionData | null;
  status: string;
  updatedAt: string;
}

export interface PublicProfile {
  id: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
  name: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  twitterHandle: string | null;
  githubHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  completeness: number;
  pitchCount: number;
  milestoneCount: number;
  onChainMilestoneCount: number;
  topPitch: TopPitch | null;
  milestones: PublicMilestone[];
  joinedAt: string;
}

export const profileApi = {
  get: (id: string) =>
    apiFetch<PublicProfile>(`/api/profiles/${id}`),

  getByKey: (publicKey: string) =>
    apiFetch<PublicProfile>(`/api/profiles/key/${publicKey}`),

  search: (q: string) =>
    apiFetch<{ id: string; name: string | null; stellarPublicKey: string; bio: string | null; location: string | null }[]>(
      `/api/profiles?q=${encodeURIComponent(q)}`,
    ),
};
