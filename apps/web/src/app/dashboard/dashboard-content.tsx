'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { usePitchList } from '@/hooks/use-pitch-list';

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, href,
}: { label: string; value: number | string; sub?: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm transition-all hover:border-gray-300 dark:hover:border-[#2A3F64] hover:shadow-md"
    >
      <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </Link>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────
function ActionCard({
  icon, title, desc, href, accent,
}: { icon: string; title: string; desc: string; href: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className={[
        'group rounded-2xl border p-5 transition-all hover:shadow-md block',
        accent
          ? 'border-[#99E9DC] bg-[#ECFDF9]'
          : 'border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] hover:border-gray-300 dark:hover:border-[#2A3F64] shadow-sm',
      ].join(' ')}
    >
      <span className="mb-3 block text-2xl">{icon}</span>
      <p className={['mb-1 font-bold text-sm', accent ? 'text-[#00927C]' : 'text-gray-900 dark:text-white'].join(' ')}>
        {title}
      </p>
      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
    </Link>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[0,1,2,3].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
    </div>
  );
}

// ── Score colour ──────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  return s >= 75 ? '#00C2A8' : s >= 50 ? '#F59E0B' : '#EF4444';
}

// ── Main component ────────────────────────────────────────────────────────────
export function DashboardContent() {
  const { founder, isAuthenticated, isLoading } = useAuth();
  const { pitches } = usePitchList();

  if (isLoading) return <Skeleton />;

  /* ── Authenticated ── */
  if (isAuthenticated && founder) {
    const displayName = founder.name ?? `${founder.publicKey.slice(0, 6)}…${founder.publicKey.slice(-4)}`;

    return (
      <div className="max-w-4xl space-y-8">

        {/* Welcome */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Welcome back</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {displayName}
          </h2>
          {founder.location && (
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">📍 {founder.location}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Pitches"     value={founder.pitchCount ?? 0}    sub="AI-crafted"         href="/pitch-builder" />
          <StatCard label="Milestones"  value={founder.milestoneCount ?? 0} sub="On Stellar"         href="/milestones"    />
          <StatCard label="Connections" value={0}                           sub="Investor requests"  href="/investors"     />
        </div>

        {/* Recent pitches */}
        {pitches.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="section-label">Recent pitches</h3>
              <Link href="/pitch-builder" className="text-xs font-semibold hover:underline" style={{ color: '#00C2A8' }}>
                View all →
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] shadow-sm divide-y divide-gray-100 dark:divide-[#1E3050]">
              {pitches.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/pitch-builder/${p.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition hover:bg-gray-50 dark:hover:bg-[#1A2640]"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.projectName}</p>
                    {p.tagline && <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">{p.tagline}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={[
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      p.status === 'complete'    ? 'bg-[#ECFDF9] text-[#00927C]'
                      : p.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-[#1A2640] text-gray-500 dark:text-gray-400',
                    ].join(' ')}>
                      {p.status.replace('_', ' ')}
                    </span>
                    {p.overallScore !== null && (
                      <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(p.overallScore) }}>
                        {p.overallScore}
                      </span>
                    )}
                    <svg className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 16 16">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h3 className="mb-3 section-label">Quick actions</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ActionCard
              icon="" accent
              title={pitches.length === 0 ? 'Build first pitch →' : 'Open pitch builder →'}
              desc="Let Kimi K2 AI guide you through your investor pitch"
              href="/pitch-builder"
            />
            <ActionCard
              icon="⛓️"
              title="Record milestone →"
              desc="Verify your traction on-chain with Soroban"
              href="/milestones"
            />
            <ActionCard
              icon=""
              title="Find investors →"
              desc="Get matched with VCs that fit your stage"
              href="/investors"
            />
            <ActionCard
              icon=""
              title="View profile →"
              desc="Your public investor-facing founder profile"
              href={`/profile/${founder.id}`}
            />
          </div>
        </div>

      </div>
    );
  }

  /* ── Not authenticated — prompt to connect ── */
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Build<span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#00C2A8,#00927C)' }}>Bridge</span>
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Connect your Stellar wallet to unlock all features.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ActionCard icon="" accent title="AI Pitch Builder →" desc="Craft investor-ready pitches section by section" href="/pitch-builder" />
        <ActionCard icon="" title="On-Chain Milestones →" desc="Record achievements immutably on Stellar" href="/milestones" />
        <ActionCard icon="" title="Investor Matching →" desc="Get matched with VCs by sector and stage" href="/investors" />
        <ActionCard icon="" title="Founder Profile →" desc="A public profile with verified on-chain proof" href="/settings/profile" />
      </div>

      <div className="mt-8 rounded-2xl border border-[#99E9DC] bg-[#ECFDF9] px-6 py-6">
        <p className="mb-1 font-bold text-gray-900">Ready to get started?</p>
        <p className="text-sm text-gray-500">
          Click <strong>Connect Wallet</strong> in the sidebar to authenticate with your Freighter wallet and unlock the full platform.
        </p>
      </div>
    </div>
  );
}
