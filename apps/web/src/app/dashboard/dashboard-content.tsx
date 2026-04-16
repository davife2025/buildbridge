'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20"
    >
      <p className="mb-1 text-sm text-white/40">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </Link>
  );
}

function QuickAction({
  href,
  label,
  description,
  accent = false,
}: {
  href: string;
  label: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-xl border p-5 transition',
        accent
          ? 'border-brand-400/30 bg-brand-400/10 hover:bg-brand-400/15'
          : 'border-white/10 bg-navy-800 hover:border-white/20',
      ].join(' ')}
    >
      <p className={['mb-1 font-medium', accent ? 'text-brand-400' : 'text-white'].join(' ')}>
        {label} →
      </p>
      <p className="text-sm text-white/40">{description}</p>
    </Link>
  );
}

export function DashboardContent() {
  const { founder } = useAuth();

  const displayName =
    founder?.name ??
    (founder?.publicKey
      ? `${founder.publicKey.slice(0, 6)}…${founder.publicKey.slice(-4)}`
      : 'Founder');

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-1 text-sm text-white/40">Welcome back</p>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          {founder?.location && (
            <p className="mt-1 text-sm text-white/40">📍 {founder.location}</p>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Pitches" value={founder?.pitchCount ?? 0} href="/pitch-builder" />
          <StatCard label="Milestones" value={founder?.milestoneCount ?? 0} href="/milestones" />
          <StatCard label="Connections" value={0} href="/investors" />
        </div>

        {/* Quick actions */}
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/30">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <QuickAction
            href="/pitch-builder"
            label="Build your pitch"
            description="Let AI guide you through crafting an investor-ready pitch deck"
            accent
          />
          <QuickAction
            href="/milestones"
            label="Record a milestone"
            description="Verify your traction on-chain with Soroban smart contracts"
          />
          <QuickAction
            href="/investors"
            label="Find investors"
            description="Get matched with VCs and angels that fit your stage and sector"
          />
          <QuickAction
            href={`/profile/${founder?.id ?? ''}`}
            label="View your profile"
            description="See your public investor-facing founder profile"
          />
        </div>

        {/* Network badge */}
        <div className="mt-10 flex items-center gap-2 text-xs text-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Connected on Stellar {founder?.network ?? 'testnet'}
        </div>
      </main>
    </ProtectedRoute>
  );
}
