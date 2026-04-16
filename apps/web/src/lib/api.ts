const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Typed fetch wrapper for the BuildBridge API.
 * Automatically attaches Bearer token and handles errors.
 */
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, (body as { error: string }).error ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

// ── Auth API ──────────────────────────────────────────────

export interface ChallengeResponse {
  challenge: string;
  expiresAt: string;
  message: string;
}

export interface ConnectResponse {
  token: string;
  founder: FounderProfile;
}

export interface FounderProfile {
  id: string;
  publicKey: string;
  network: 'testnet' | 'mainnet';
  name: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  twitterHandle: string | null;
  githubHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  pitchCount: number;
  milestoneCount: number;
  createdAt: string;
}

export const authApi = {
  getChallenge: (publicKey: string) =>
    apiFetch<ChallengeResponse>(`/api/auth/challenge?publicKey=${encodeURIComponent(publicKey)}`),

  connect: (body: { publicKey: string; challenge: string; signature: string; network: string }) =>
    apiFetch<ConnectResponse>('/api/auth/connect', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: (token: string) =>
    apiFetch<FounderProfile>('/api/auth/me', { token }),

  updateProfile: (token: string, data: Partial<FounderProfile>) =>
    apiFetch<FounderProfile>('/api/auth/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    }),

  logout: (token: string) =>
    apiFetch<{ message: string }>('/api/auth/logout', { method: 'POST', token }),
};
