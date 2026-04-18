'use client';

import Link from 'next/link';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/context/auth-context';
import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { PitchPreviewCard } from '@/components/profile/pitch-preview-card';
import { MilestoneTimeline } from '@/components/profile/milestone-timeline';
import { ShareButton } from '@/components/profile/share-button';

function SocialLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-sm font-medium text-gray-400 dark:text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-200">
      <span>{icon}</span>{label}
    </a>
  );
}

export function ProfileContent({ founderId }: { founderId: string }) {
  const { profile, isLoading, error } = useProfile(founderId);
  const { founder: authedFounder } = useAuth();
  const isOwnProfile = authedFounder?.id === founderId;

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-24 w-24 skeleton rounded-full" />
          <div className="space-y-2"><div className="h-7 w-48 skeleton rounded-lg" /><div className="h-4 w-32 skeleton rounded-lg" /></div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4"><div className="h-64 skeleton rounded-2xl" /><div className="h-48 skeleton rounded-2xl" /></div>
          <div className="h-48 skeleton rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg text-gray-400 dark:text-gray-500">{error ?? 'Founder not found'}</p>
        <Link href="/" className="btn-secondary">← Go home</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {isOwnProfile && (
        <div className="mb-6 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ borderColor: '#99E9DC', background: '#ECFDF9' }}>
          <p className="text-sm text-gray-600">This is your public profile — as investors see it.</p>
          <Link href="/settings/profile" className="text-sm font-bold hover:underline" style={{ color: '#00927C' }}>Edit profile →</Link>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          <ProfileAvatar name={profile.name} publicKey={profile.publicKey} avatarUrl={profile.avatarUrl} size="xl" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.name ?? `${profile.publicKey.slice(0, 8)}…`}</h1>
            {profile.location && <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">📍 {profile.location}</p>}
            {profile.bio && <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-300">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-4">
              {profile.twitterHandle && <SocialLink href={`https://twitter.com/${profile.twitterHandle}`} label={`@${profile.twitterHandle}`} icon="𝕏" />}
              {profile.githubHandle && <SocialLink href={`https://github.com/${profile.githubHandle}`} label={profile.githubHandle} icon="⌥" />}
              {profile.linkedinUrl && <SocialLink href={profile.linkedinUrl} label="LinkedIn" icon="in" />}
              {profile.websiteUrl && <SocialLink href={profile.websiteUrl} label={new URL(profile.websiteUrl).hostname} icon="🌐" />}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <ShareButton founderId={profile.id} founderName={profile.name} />
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00C2A8' }} />
            Stellar {profile.network}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {[
          { label: 'Pitches',    value: profile.pitchCount              },
          { label: 'Milestones', value: profile.milestoneCount           },
          { label: 'On-chain',   value: profile.onChainMilestoneCount    },
          { label: 'Profile',    value: `${profile.completeness}%`       },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-4 text-center shadow-sm">
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {profile.topPitch ? (
            <section><h2 className="mb-3 section-label">Top pitch</h2><PitchPreviewCard pitch={profile.topPitch} /></section>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1E3050] py-10 text-center">
              <p className="text-gray-300 dark:text-gray-600">No completed pitch yet</p>
            </div>
          )}
          <section><h2 className="mb-4 section-label">Milestones</h2><MilestoneTimeline milestones={profile.milestones} /></section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">About</h3>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Joined {new Date(profile.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-xs text-gray-400 dark:text-gray-500">{profile.publicKey.slice(0, 8)}…{profile.publicKey.slice(-6)}</p>
            </div>
          </div>
          {!isOwnProfile && (
            <div className="rounded-2xl border p-5" style={{ borderColor: '#99E9DC', background: '#ECFDF9' }}>
              <h3 className="mb-1 font-bold text-gray-900">Interested?</h3>
              <p className="mb-3 text-xs text-gray-500">Connect with this founder to explore investment opportunities.</p>
              <Link href={`/investors/connect/${founderId}`} className="btn-brand w-full justify-center text-sm">Request connection →</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
