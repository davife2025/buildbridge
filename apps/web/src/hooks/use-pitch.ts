'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import {
  pitchApi,
  streamRefine,
  type PitchDetail,
  type PitchSectionData,
  type SectionKey,
} from '@/lib/pitch-api';

type RefinementStatus = 'idle' | 'streaming' | 'done' | 'error';

interface UsePitchReturn {
  pitch: PitchDetail | null;
  isLoading: boolean;
  error: string | null;

  // Section streaming
  activeSection: SectionKey | null;
  streamingText: string;
  refinementStatus: RefinementStatus;

  // Actions
  loadPitch: (id: string) => Promise<void>;
  createPitch: (projectName: string, tagline?: string) => Promise<PitchDetail | null>;
  refineSection: (section: SectionKey, input: string) => Promise<void>;
  scorePitch: () => Promise<void>;
  savePitch: (note?: string) => Promise<void>;
}

export function usePitch(): UsePitchReturn {
  const { token } = useAuth();
  const [pitch, setPitch] = useState<PitchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Streaming state
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [refinementStatus, setRefinementStatus] = useState<RefinementStatus>('idle');

  const loadPitch = useCallback(async (id: string) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await pitchApi.get(token, id);
      setPitch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pitch');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createPitch = useCallback(async (projectName: string, tagline?: string) => {
    if (!token) return null;
    setIsLoading(true);
    setError(null);
    try {
      const created = await pitchApi.create(token, { projectName, tagline });
      setPitch(created);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pitch');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const refineSection = useCallback(async (section: SectionKey, input: string) => {
    if (!token || !pitch) return;

    setActiveSection(section);
    setStreamingText('');
    setRefinementStatus('streaming');
    setError(null);

    await streamRefine(token, pitch.id, section, input, {
      onChunk: (chunk) => {
        setStreamingText((prev) => prev + chunk);
      },
      onSection: (_section, data: PitchSectionData) => {
        setPitch((prev) =>
          prev ? { ...prev, [_section]: data } : prev,
        );
      },
      onDone: () => {
        setRefinementStatus('done');
        setActiveSection(null);
        setStreamingText('');
      },
      onError: (errMsg) => {
        setError(errMsg);
        setRefinementStatus('error');
        setActiveSection(null);
      },
    });
  }, [token, pitch]);

  const scorePitch = useCallback(async () => {
    if (!token || !pitch) return;
    setIsLoading(true);
    try {
      const result = await pitchApi.score(token, pitch.id);
      setPitch((prev) =>
        prev ? { ...prev, overallScore: result.overallScore } : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score pitch');
    } finally {
      setIsLoading(false);
    }
  }, [token, pitch]);

  const savePitch = useCallback(async (note?: string) => {
    if (!token || !pitch) return;
    try {
      await pitchApi.save(token, pitch.id, note);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pitch');
    }
  }, [token, pitch]);

  return {
    pitch,
    isLoading,
    error,
    activeSection,
    streamingText,
    refinementStatus,
    loadPitch,
    createPitch,
    refineSection,
    scorePitch,
    savePitch,
  };
}
