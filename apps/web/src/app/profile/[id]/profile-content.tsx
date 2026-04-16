'use client';

import Link from 'next/link';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/context/auth-context';
import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { PitchPreviewCard } from '@/components/profile/pitch-preview-card';
import { MilestoneTimeline } from '@/components/profile/milestone-timeline';
import { ShareButton } from '@/components/profile/share-button';

interface ProfileContentProps {
  founderId: string;
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-sm text-white/40 transition hover:text-white/80"
    >
      <span>{icon}</span>
      {label}
    </a>
  );
}

export function ProfileContent({ founderId }: ProfileContentProps) {
  const { profile, isLoading, error } = useProfile(founderId);
  const { founder: authedFounder } = useAuth();
  const isOwnProfile = authedFounder?.id === founderId;

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-24 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-white/10" />
            <div className="h-4 w-32 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-xl bg-white/5" />
            <div className="h-48 animate-pulse rounded-xl bg-white/5" />
          </div>
          <div className="h-48 animate-pulse rounded-xl bg-white/5" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg text-white/40">{error ?? 'Founder not found'}</p>
        <Link href="/" className="btn-secondary">← Go home</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">

      {/* Own profile edit banner */}
      {isOwnProfile && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-brand-400/20 bg-brand-400/5 px-4 py-3">
          <p className="text-sm text-white/60">This is your public profile — as investors see it.</p>
          <Link href="/settings/profile" className="text-sm font-medium text-brand-400 hover:underline">
            Edit profile →
          </Link>
        </div>
      )}

      {/* Profile header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          <ProfileAvatar
            name={profile.name}
            publicKey={profile.publicKey}
            avatarUrl={profile.avatarUrl}
            size="xl"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile.name ?? `${profile.publicKey.slice(0, 8)}…`}
            </h1>
            {profile.location && (
              <p className="mt-1 text-sm text-white/40">📍 {profile.location}</p>
            )}
            {profile.bio && (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">
                {profile.bio}
              </p>
            )}

            {/* Social links */}
            <div className="mt-3 flex flex-wrap gap-4">
              {profile.twitterHandle && (
                <SocialLink
                  href={`https://twitter.com/${profile.twitterHandle}`}
                  label={`@${profile.twitterHandle}`}
                  icon="𝕏"
                />
              )}
              {profile.githubHandle && (
                <SocialLink
                  href={`https://github.com/${profile.githubHandle}`}
                  label={profile.githubHandle}
                  icon="⌥"
                />
              )}
              {profile.linkedinUrl && (
                <SocialLink href={profile.linkedinUrl} label="LinkedIn" icon="in" />
              )}
              {profile.websiteUrl && (
                <SocialLink
                  href={profile.websiteUrl}
                  label={new URL(profile.websiteUrl).hostname}
                  icon="🌐"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <ShareButton founderId={profile.id} founderName={profile.name} />

          {/* Stellar badge */}
          <div className="flex items-center gap-1.5 text-xs text-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Stellar {profile.network}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {[
          { label: 'Pitches', value: profile.pitchCount },
          { label: 'Milestones', value: profile.milestoneCount },
          { label: 'On-chain', value: profile.onChainMilestoneCount },
          { label: 'Profile', value: `${profile.completeness}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-navy-800 p-4 text-center">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-white/30">{label}</p>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left: pitch + milestones */}
        <div className="space-y-6">
          {/* Top pitch */}
          {profile.topPitch ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/30">
                Top pitch
              </h2>
              <PitchPreviewCard pitch={profile.topPitch} />
            </section>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
              <p className="text-white/20">No completed pitch yet</p>
            </div>
          )}

          {/* Milestones */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/30">
              Milestones
            </h2>
            <MilestoneTimeline milestones={profile.milestones} />
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* About card */}
          <div className="rounded-xl border border-white/10 bg-navy-800 p-5">
            <h3 className="mb-3 text-sm font-semibold text-white">About</h3>
            <div className="space-y-2 text-sm text-white/40">
              <p>Joined {new Date(profile.joinedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
              <p className="font-mono text-xs">
                {profile.publicKey.slice(0, 8)}…{profile.publicKey.slice(-6)}
              </p>
            </div>
          </div>

          {/* Connect CTA (for investors) */}
          {!isOwnProfile && (
            <div className="rounded-xl border border-brand-400/20 bg-brand-400/5 p-5">
              <h3 className="mb-1 font-semibold text-white">Interested?</h3>
              <p className="mb-3 text-xs text-white/40">
                Connect with this founder to explore investment opportunities.
              </p>
              <Link
                href={`/investors/connect/${founderId}`}
                className="btn-primary w-full justify-center text-sm"
              >
                Request connection →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
