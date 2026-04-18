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

export function PitchEditor({ pitchId }: { pitchId: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const { pitch, isLoading, error, activeSection, streamingText, refinementStatus, loadPitch, refineSection, savePitch, scorePitch } = usePitch();
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [scoreResult, setScoreResult] = useState<PitchScore | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => { void loadPitch(pitchId); }, [pitchId, loadPitch]);

  const handleRefineSubmit = useCallback(async (section: SectionKey, input: string) => {
    setEditingSection(null); await refineSection(section, input);
  }, [refineSection]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try { await savePitch(); setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000); }
    finally { setIsSaving(false); }
  }, [savePitch]);

  const handleScore = useCallback(async () => {
    if (!token || !pitch) return;
    setIsScoring(true);
    try { const result = await pitchApi.score(token, pitch.id); setScoreResult(result); }
    finally { setIsScoring(false); }
  }, [token, pitch]);

  if (isLoading && !pitch) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="mb-8 h-10 w-64 skeleton rounded-xl" />
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="h-96 skeleton rounded-2xl" />
            <div className="space-y-3">{SECTION_KEYS.map(k => <div key={k} className="h-32 skeleton rounded-2xl" />)}</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !pitch) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-gray-400 dark:text-gray-500">{error ?? 'Pitch not found'}</p>
          <button onClick={() => router.push('/pitch-builder')} className="btn-secondary">← Back to pitches</button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <button onClick={() => router.push('/pitch-builder')} className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-400 dark:text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-200">← All pitches</button>
        <PitchHeader pitch={pitch} isSaving={isSaving} isScoring={isScoring} onSave={handleSave} onScore={handleScore} />
        {saveMsg && (
          <div className="mb-4 rounded-xl border px-4 py-2 text-sm font-medium" style={{ borderColor: '#99E9DC', background: '#ECFDF9', color: '#00927C' }}>✓ {saveMsg}</div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <PitchStepper pitch={pitch} activeSection={activeSection} onSelectSection={section => setEditingSection(section)} />
          </div>
          <div className="space-y-4">
            {SECTION_KEYS.map(key => (
              <SectionCard key={key} sectionKey={key} data={pitch[key]} isActive={activeSection === key} streamingText={activeSection === key ? streamingText : undefined} onEdit={() => setEditingSection(key)} />
            ))}
            {SECTION_KEYS.every(k => pitch[k] !== null) && pitch.overallScore === null && (
              <div className="rounded-2xl border p-5 text-center" style={{ borderColor: '#99E9DC', background: '#ECFDF9' }}>
                <p className="mb-1 font-bold text-gray-900">All sections complete! 🎉</p>
                <p className="mb-4 text-sm text-gray-500">Get your overall pitch score and improvement tips from the AI.</p>
                <button onClick={handleScore} disabled={isScoring} className="btn-brand">{isScoring ? 'Scoring…' : 'Score my pitch →'}</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <RefineModal section={editingSection} existingContent={editingSection && pitch[editingSection] ? (pitch[editingSection] as { content: string }).content : undefined} isStreaming={refinementStatus === 'streaming'} onSubmit={handleRefineSubmit} onClose={() => setEditingSection(null)} />
      {scoreResult && <PitchScorePanel score={scoreResult} onClose={() => setScoreResult(null)} />}
    </ProtectedRoute>
  );
}
