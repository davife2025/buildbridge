'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { PitchListCard } from '@/components/pitch/pitch-list-card';
import { CreatePitchModal } from '@/components/pitch/create-pitch-modal';
import { usePitchList } from '@/hooks/use-pitch-list';
import { usePitch } from '@/hooks/use-pitch';

export function PitchBuilderIndex() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { pitches, isLoading, deletePitch } = usePitchList();
  const { createPitch, isLoading: isCreating } = usePitch();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = async (projectName: string, tagline: string) => {
    const pitch = await createPitch(projectName, tagline || undefined);
    if (pitch) { setShowCreate(false); router.push(`/pitch-builder/${pitch.id}`); }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pitch Builder</h1>
          <p className="mt-1 text-sm text-white/40">AI-guided, investor-ready pitches built section by section.</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ New pitch</button>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="rounded-xl border border-white/10 bg-navy-800 p-10 text-center">
          <p className="mb-2 text-3xl">🤖</p>
          <p className="mb-1 font-semibold text-white">AI Pitch Builder</p>
          <p className="mb-4 text-sm text-white/40">
            Connect your wallet via the navbar to start building your investor-ready pitch with Kimi K2.
          </p>
          <div className="space-y-3 text-left mx-auto max-w-xs">
            {['Problem statement', 'Solution', 'Traction', 'Team', 'Market sizing', 'The ask'].map((s, i) => (
              <div key={s} className="flex items-center gap-3 text-sm text-white/30">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />)}</div>
      ) : pitches.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
          <p className="mb-2 text-white/30">No pitches yet</p>
          <p className="mb-6 text-sm text-white/20">Create your first pitch and let AI help you craft it.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create first pitch →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {pitches.map(pitch => (
            <PitchListCard key={pitch.id} pitch={pitch} onDelete={deletePitch} />
          ))}
        </div>
      )}

      <CreatePitchModal isOpen={showCreate} isLoading={isCreating} onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
    </main>
  );
}
