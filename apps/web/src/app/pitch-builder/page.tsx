import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pitch Builder' };

export default function PitchBuilderPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 inline-block rounded-full bg-brand-400/10 px-3 py-1 text-xs text-brand-400">
          Session 3 & 4
        </div>
        <h1 className="mb-2 text-3xl font-bold">AI Pitch Builder</h1>
        <p className="text-white/40">
          Claude-powered pitch builder coming in Sessions 3 &amp; 4.
        </p>
      </div>
    </main>
  );
}
