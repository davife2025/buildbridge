'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PitchHeader } from '@/components/pitch/pitch-header';
import { PitchStepper } from '@/components/pitch/pitch-stepper';
import { SectionCard } from '@/components/pitch/section-card';
import { RefineModal } from '@/components/pitch/refine-modal';
import { PitchScorePanel } from '@/components/pitch/pitch-score-panel';
import { usePitch } from '@/hooks/use-pitch';
import { pitchApi, type SectionKey, type PitchScore, SECTION_KEYS } from '@/lib/pitch-api';
import { useAuth } from '@/context/auth-context';

interface PitchEditorProps {
  pitchId: string;
}

export function PitchEditor({ pitchId }: PitchEditorProps) {
  const router = useRouter();
  const { token } = useAuth();

  const {
    pitch,
    isLoading,
    error,
    activeSection,
    streamingText,
    refinementStatus,
    loadPitch,
    refineSection,
    savePitch,
    scorePitch,
  } = usePitch();

  // Modal state
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [scoreResult, setScoreResult] = useState<PitchScore | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Load pitch on mount
  useEffect(() => {
    void loadPitch(pitchId);
  }, [pitchId, loadPitch]);

  // Handle section refine submit
  const handleRefineSubmit = useCallback(
    async (section: SectionKey, input: string) => {
      setEditingSection(null); // close modal immediately — streaming shows in card
      await refineSection(section, input);
    },
    [refineSection],
  );

  // Save version
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await savePitch();
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
    } finally {
      setIsSaving(false);
    }
  }, [savePitch]);

  // Score pitch
  const handleScore = useCallback(async () => {
    if (!token || !pitch) return;
    setIsScoring(true);
    try {
      const result = await pitchApi.score(token, pitch.id);
      setScoreResult(result);
    } finally {
      setIsScoring(false);
    }
  }, [token, pitch]);

  // Loading state
  if (isLoading && !pitch) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-lg bg-white/10" />
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="h-96 animate-pulse rounded-xl bg-white/5" />
            <div className="space-y-3">
              {SECTION_KEYS.map((k) => (
                <div key={k} className="h-32 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !pitch) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-white/40">{error ?? 'Pitch not found'}</p>
          <button onClick={() => router.push('/pitch-builder')} className="btn-secondary">
            ← Back to pitches
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Back link */}
        <button
          onClick={() => router.push('/pitch-builder')}
          className="mb-6 flex items-center gap-1 text-sm text-white/30 transition hover:text-white/60"
        >
          ← All pitches
        </button>

        {/* Header */}
        <PitchHeader
          pitch={pitch}
          isSaving={isSaving}
          isScoring={isScoring}
          onSave={handleSave}
          onScore={handleScore}
        />

        {/* Save confirmation */}
        {saveMsg && (
          <div className="mb-4 rounded-lg border border-brand-400/30 bg-brand-400/10 px-4 py-2 text-sm text-brand-400">
            ✓ {saveMsg}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Main layout: stepper + sections grid */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left: stepper */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <PitchStepper
              pitch={pitch}
              activeSection={activeSection}
              onSelectSection={(section) => setEditingSection(section)}
            />
          </div>

          {/* Right: section cards */}
          <div className="space-y-4">
            {SECTION_KEYS.map((key) => (
              <SectionCard
                key={key}
                sectionKey={key}
                data={pitch[key]}
                isActive={activeSection === key}
                streamingText={activeSection === key ? streamingText : undefined}
                onEdit={() => setEditingSection(key)}
              />
            ))}

            {/* Score CTA if all done but not scored */}
            {SECTION_KEYS.every((k) => pitch[k] !== null) && pitch.overallScore === null && (
              <div className="rounded-xl border border-brand-400/20 bg-brand-400/5 p-5 text-center">
                <p className="mb-1 font-semibold text-white">All sections complete! 🎉</p>
                <p className="mb-4 text-sm text-white/40">
                  Get your overall pitch score and improvement tips from Claude.
                </p>
                <button
                  onClick={handleScore}
                  disabled={isScoring}
                  className="btn-primary"
                >
                  {isScoring ? 'Scoring…' : 'Score my pitch →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Refine modal */}
      <RefineModal
        section={editingSection}
        existingContent={
          editingSection && pitch[editingSection]
            ? (pitch[editingSection] as { content: string }).content
            : undefined
        }
        isStreaming={refinementStatus === 'streaming'}
        onSubmit={handleRefineSubmit}
        onClose={() => setEditingSection(null)}
      />

      {/* Score panel */}
      {scoreResult && (
        <PitchScorePanel
          score={scoreResult}
          onClose={() => setScoreResult(null)}
        />
      )}
    </ProtectedRoute>
  );
}
