'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PitchListCard } from '@/components/pitch/pitch-list-card';
import { CreatePitchModal } from '@/components/pitch/create-pitch-modal';
import { usePitchList } from '@/hooks/use-pitch-list';
import { usePitch } from '@/hooks/use-pitch';

export function PitchBuilderIndex() {
  const router = useRouter();
  const { pitches, isLoading, deletePitch } = usePitchList();
  const { createPitch, isLoading: isCreating } = usePitch();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = async (projectName: string, tagline: string) => {
    const pitch = await createPitch(projectName, tagline || undefined);
    if (pitch) {
      setShowCreate(false);
      router.push(`/pitch-builder/${pitch.id}`);
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Pitch Builder</h1>
            <p className="mt-1 text-sm text-white/40">
              AI-guided, investor-ready pitches built section by section.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary"
          >
            + New pitch
          </button>
        </div>

        {/* Pitch list */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : pitches.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
            <p className="mb-2 text-white/30">No pitches yet</p>
            <p className="mb-6 text-sm text-white/20">
              Create your first pitch and let AI help you craft it.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create first pitch →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pitches.map((pitch) => (
              <PitchListCard
                key={pitch.id}
                pitch={pitch}
                onDelete={deletePitch}
              />
            ))}
          </div>
        )}
      </main>

      <CreatePitchModal
        isOpen={showCreate}
        isLoading={isCreating}
        onSubmit={handleCreate}
        onClose={() => setShowCreate(false)}
      />
    </ProtectedRoute>
  );
}
