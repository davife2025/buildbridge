import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Investors' };

export default function InvestorsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 inline-block rounded-full bg-brand-400/10 px-3 py-1 text-xs text-brand-400">
          Session 7
        </div>
        <h1 className="mb-2 text-3xl font-bold">Investor Discovery</h1>
        <p className="text-white/40">
          Investor matching and discovery coming in Session 7.
        </p>
      </div>
    </main>
  );
}
