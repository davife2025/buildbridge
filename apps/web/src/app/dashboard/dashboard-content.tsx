'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { usePitchList } from '@/hooks/use-pitch-list';
import { SECTION_KEYS } from '@/lib/pitch-api';

const FEATURES = [
  { icon: '🤖', title: 'AI Pitch Builder', href: '/pitch-builder', desc: 'Claude guides you section by section through your pitch.' },
  { icon: '⛓️', title: 'On-Chain Milestones', href: '/milestones', desc: 'Record achievements via Soroban smart contracts on Stellar.' },
  { icon: '🎯', title: 'Investor Matching', href: '/investors', desc: 'Get matched with VCs and angels that fit your stage.' },
];

export function DashboardContent() {
  const { founder, isAuthenticated } = useAuth();
  const { pitches } = usePitchList();

  // ── Logged-in view ────────────────────────────────────────
  if (isAuthenticated && founder) {
    const displayName =
      founder.name ??
      `${founder.publicKey.slice(0, 6)}…${founder.publicKey.slice(-4)}`;

    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="mb-1 text-sm text-white/40">Welcome back</p>
          <h1 className="text-3xl font-bold">{displayName}</h1>
          {founder.location && <p className="mt-1 text-sm text-white/40">📍 {founder.location}</p>}
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: 'Pitches',      value: founder.pitchCount ?? 0,     href: '/pitch-builder' },
            { label: 'Milestones',   value: founder.milestoneCount ?? 0,  href: '/milestones'    },
            { label: 'Connections',  value: 0,                            href: '/investors'     },
          ].map(({ label, value, href }) => (
            <Link key={label} href={href}
              className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
              <p className="mb-1 text-sm text-white/40">{label}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
            </Link>
          ))}
        </div>

        {/* Recent pitches */}
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
                    <span className="text-sm font-bold"
                      style={{ color: p.overallScore >= 75 ? '#00C2A8' : p.overallScore >= 50 ? '#F5A623' : '#EF4444' }}>
                      {p.overallScore}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-white/30">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/pitch-builder"
            className="rounded-xl border border-brand-400/30 bg-brand-400/10 p-5 transition hover:bg-brand-400/15">
            <p className="mb-1 font-medium text-brand-400">
              {pitches.length === 0 ? 'Build your first pitch' : 'Open pitch builder'} →
            </p>
            <p className="text-sm text-white/40">Let AI guide you through crafting an investor-ready pitch</p>
          </Link>
          <Link href="/milestones"
            className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
            <p className="mb-1 font-medium text-white">Record a milestone →</p>
            <p className="text-sm text-white/40">Verify your traction on-chain with Soroban</p>
          </Link>
          <Link href="/investors"
            className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
            <p className="mb-1 font-medium text-white">Find investors →</p>
            <p className="text-sm text-white/40">Get matched with VCs and angels that fit your stage</p>
          </Link>
          <Link href={`/profile/${founder.id}`}
            className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
            <p className="mb-1 font-medium text-white">View your profile →</p>
            <p className="text-sm text-white/40">Your public investor-facing founder profile</p>
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-2 text-xs text-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Connected on Stellar {founder.network ?? 'testnet'}
        </div>
      </main>
    );
  }

  // ── Logged-out view — show the product, not a gate ───────
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">
          Build<span className="text-brand-400">Bridge</span>
        </h1>
        <p className="mb-2 text-lg text-white/60">Where builders meet capital</p>
        <p className="mx-auto max-w-lg text-sm text-white/30">
          Craft investor-ready pitches with Kimi K2 AI, verify traction on-chain via Soroban,
          and connect with the right investors — all in one place.
        </p>
      </div>

      {/* Feature cards — always visible */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon, title, href, desc }) => (
          <Link key={title} href={href}
            className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-brand-400/30 hover:bg-brand-400/5">
            <span className="mb-3 block text-2xl">{icon}</span>
            <h3 className="mb-1 font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/40">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Subtle connect prompt — not a gate */}
      <div className="rounded-xl border border-brand-400/20 bg-brand-400/5 px-6 py-8 text-center">
        <p className="mb-1 font-semibold text-white">Ready to get started?</p>
        <p className="mb-4 text-sm text-white/40">
          Connect your Stellar wallet using the button in the top-right corner.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400/60" />
          Install Freighter from
          <a href="https://freighter.app" target="_blank" rel="noopener noreferrer"
            className="text-brand-400/60 hover:text-brand-400">freighter.app</a>
          if you don't have it yet
        </div>
      </div>
    </main>
  );
}
