import { apiFetch, type ApiError } from './api';

// ─── Types ────────────────────────────────────────────────

export interface PitchSectionData {
  title: string;
  content: string;
  score: number;
  suggestions: string[];
}

export type SectionKey = 'problem' | 'solution' | 'traction' | 'team' | 'market' | 'ask';

export const SECTION_KEYS: SectionKey[] = [
  'problem', 'solution', 'traction', 'team', 'market', 'ask',
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  problem:  'The Problem',
  solution: 'Our Solution',
  traction: 'Traction',
  team:     'The Team',
  market:   'Market Opportunity',
  ask:      'The Ask',
};

export const SECTION_HINTS: Record<SectionKey, string> = {
  problem:  'What specific pain are you solving? Who feels it most? How big is the cost?',
  solution: 'How does BuildBridge solve it? What makes you different from alternatives?',
  traction: 'Share any evidence of demand — users, revenue, pilots, waitlist, on-chain activity.',
  team:     'Why is your team uniquely suited to win this? Highlight relevant experience.',
  market:   'How big is the opportunity? What is your go-to-market wedge?',
  ask:      'How much are you raising, how will you spend it, and what will it unlock?',
};

export interface PitchSummary {
  id: string;
  projectName: string;
  tagline: string | null;
  status: 'draft' | 'in_progress' | 'complete' | 'archived';
  overallScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PitchDetail extends PitchSummary {
  problem: PitchSectionData | null;
  solution: PitchSectionData | null;
  traction: PitchSectionData | null;
  team: PitchSectionData | null;
  market: PitchSectionData | null;
  ask: PitchSectionData | null;
  versions: { id: string; createdAt: string; note: string | null }[];
}

export interface PitchScore {
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// ─── API methods ──────────────────────────────────────────

export const pitchApi = {
  create: (token: string, body: { projectName: string; tagline?: string }) =>
    apiFetch<PitchDetail>('/api/pitch', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),

  list: (token: string) =>
    apiFetch<PitchSummary[]>('/api/pitch', { token }),

  get: (token: string, id: string) =>
    apiFetch<PitchDetail>(`/api/pitch/${id}`, { token }),

  score: (token: string, id: string) =>
    apiFetch<PitchScore>(`/api/pitch/${id}/score`, {
      method: 'POST',
      token,
    }),

  save: (token: string, id: string, note?: string) =>
    apiFetch<{ versionId: string; createdAt: string }>(`/api/pitch/${id}/save`, {
      method: 'POST',
      token,
      body: JSON.stringify({ note }),
    }),

  updateStatus: (token: string, id: string, status: PitchSummary['status']) =>
    apiFetch<{ id: string; status: string }>(`/api/pitch/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),

  delete: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/api/pitch/${id}`, {
      method: 'DELETE',
      token,
    }),
};

// ─── SSE streaming helper ─────────────────────────────────

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export interface RefineCallbacks {
  onChunk?: (chunk: string) => void;
  onSection?: (section: SectionKey, data: PitchSectionData) => void;
  onDone?: (score: number) => void;
  onError?: (error: string) => void;
}

/**
 * Streams Claude's refinement of a pitch section using SSE.
 * Calls the appropriate callback for each event type.
 */
export async function streamRefine(
  token: string,
  pitchId: string,
  section: SectionKey,
  input: string,
  callbacks: RefineCallbacks,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/pitch/${pitchId}/refine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ section, input, saveAfter: true }),
  });

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    callbacks.onError?.((body as { error: string }).error);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        const raw = line.slice(6).trim();
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          if (currentEvent === 'chunk') {
            callbacks.onChunk?.(parsed['chunk'] as string);
          } else if (currentEvent === 'section') {
            callbacks.onSection?.(
              parsed['section'] as SectionKey,
              parsed['data'] as PitchSectionData,
            );
          } else if (currentEvent === 'done') {
            callbacks.onDone?.((parsed['score'] as number) ?? 0);
          } else if (currentEvent === 'error') {
            callbacks.onError?.(parsed['error'] as string);
          }
        } catch {
          // ignore parse errors on partial chunks
        }
      }
    }
  }
}
