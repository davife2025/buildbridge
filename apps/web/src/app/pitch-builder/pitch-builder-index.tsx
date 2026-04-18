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
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Pitch Builder</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">AI-guided, investor-ready pitches built section by section.</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">+ New pitch</button>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-10 text-center shadow-sm">
          <p className="mb-2 text-3xl">🤖</p>
          <p className="mb-1 font-bold text-gray-900 dark:text-white">AI Pitch Builder</p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Connect your wallet via the navbar to start building your investor-ready pitch with Kimi K2.</p>
          <div className="mx-auto max-w-xs space-y-3 text-left">
            {['Problem statement', 'Solution', 'Traction', 'Team', 'Market sizing', 'The ask'].map((s, i) => (
              <div key={s} className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A2640] text-xs font-bold text-gray-600 dark:text-gray-400">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
      ) : pitches.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] py-16 text-center">
          <p className="mb-1 font-bold text-gray-500 dark:text-gray-400">No pitches yet</p>
          <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">Create your first pitch and let AI help you craft it.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create first pitch →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {pitches.map(pitch => <PitchListCard key={pitch.id} pitch={pitch} onDelete={deletePitch} />)}
        </div>
      )}

      <CreatePitchModal isOpen={showCreate} isLoading={isCreating} onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
    </main>
  );
}
