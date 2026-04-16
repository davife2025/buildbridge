'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { usePitchList } from '@/hooks/use-pitch-list';
import { SECTION_KEYS } from '@/lib/pitch-api';

export function DashboardContent() {
  const { founder } = useAuth();
  const { pitches, isLoading: pitchesLoading } = usePitchList();

  const displayName =
    founder?.name ??
    (founder?.publicKey
      ? `${founder.publicKey.slice(0, 6)}…${founder.publicKey.slice(-4)}`
      : 'Founder');

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <p className="mb-1 text-sm text-white/40">Welcome back</p>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          {founder?.location && <p className="mt-1 text-sm text-white/40">📍 {founder.location}</p>}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Pitches', value: founder?.pitchCount ?? 0, href: '/pitch-builder' },
            { label: 'Milestones', value: founder?.milestoneCount ?? 0, href: '/milestones' },
            { label: 'Connections', value: 0, href: '/investors' },
          ].map(({ label, value, href }) => (
            <Link key={label} href={href} className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
              <p className="mb-1 text-sm text-white/40">{label}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
            </Link>
          ))}
        </div>

        {pitches.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wider text-white/30">Recent pitches</h2>
              <Link href="/pitch-builder" className="text-xs text-brand-400 hover:underline">View all →</Link>
            </div>
            <div className="space-y-2">
              {pitches.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/pitch-builder/${p.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-navy-800 p-4 transition hover:border-white/20">
                  <div>
                    <p className="text-sm font-medium text-white">{p.projectName}</p>
                    <p className="text-xs text-white/30">{p.status.replace('_', ' ')}</p>
                  </div>
                  {p.overallScore !== null && (
                    <span className="text-sm font-bold" style={{ color: p.overallScore >= 75 ? '#00C2A8' : p.overallScore >= 50 ? '#F5A623' : '#EF4444' }}>
                      {p.overallScore}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/30">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/pitch-builder" className="rounded-xl border border-brand-400/30 bg-brand-400/10 p-5 transition hover:bg-brand-400/15">
            <p className="mb-1 font-medium text-brand-400">Build your pitch →</p>
            <p className="text-sm text-white/40">Let AI guide you through crafting an investor-ready pitch</p>
          </Link>
          <Link href="/milestones" className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
            <p className="mb-1 font-medium text-white">Record a milestone →</p>
            <p className="text-sm text-white/40">Verify your traction on-chain with Soroban smart contracts</p>
          </Link>
          <Link href="/investors" className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
            <p className="mb-1 font-medium text-white">Find investors →</p>
            <p className="text-sm text-white/40">Get matched with VCs and angels that fit your stage</p>
          </Link>
          <Link href={`/profile/${founder?.id ?? ''}`} className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
            <p className="mb-1 font-medium text-white">View your profile →</p>
            <p className="text-sm text-white/40">Your public investor-facing founder profile</p>
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-2 text-xs text-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Connected on Stellar {founder?.network ?? 'testnet'}
        </div>
      </main>
    </ProtectedRoute>
  );
}
