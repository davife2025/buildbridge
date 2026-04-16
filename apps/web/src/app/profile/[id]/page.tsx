import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Founder Profile' };

export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 inline-block rounded-full bg-brand-400/10 px-3 py-1 text-xs text-brand-400">
          Session 6
        </div>
        <h1 className="mb-2 text-3xl font-bold">Founder Profile</h1>
        <p className="text-white/40">
          Public founder profile for <code className="text-white/60">{params.id}</code> — coming in Session 6.
        </p>
      </div>
    </main>
  );
}
