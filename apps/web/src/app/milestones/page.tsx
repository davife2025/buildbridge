import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Milestones' };

export default function MilestonesPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 inline-block rounded-full bg-brand-400/10 px-3 py-1 text-xs text-brand-400">
          Session 5 & 6
        </div>
        <h1 className="mb-2 text-3xl font-bold">Milestones</h1>
        <p className="text-white/40">
          On-chain milestone tracker coming in Sessions 5 &amp; 6.
        </p>
      </div>
    </main>
  );
}
