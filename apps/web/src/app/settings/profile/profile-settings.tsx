'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { CompletenessBar } from '@/components/profile/completeness-bar';
import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { useAuth } from '@/context/auth-context';
import { useFounder } from '@/hooks/use-founder';

export function ProfileSettings() {
  const { founder: authedFounder } = useAuth();
  const { founder, isLoading, error, update } = useFounder();

  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    twitterHandle: '',
    githubHandle: '',
    linkedinUrl: '',
    websiteUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  // Populate form when founder loads
  useEffect(() => {
    if (founder) {
      setForm({
        name: founder.name ?? '',
        bio: founder.bio ?? '',
        location: founder.location ?? '',
        twitterHandle: founder.twitterHandle ?? '',
        githubHandle: founder.githubHandle ?? '',
        linkedinUrl: founder.linkedinUrl ?? '',
        websiteUrl: founder.websiteUrl ?? '',
      });
    }
  }, [founder]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMsg('');
    setSaveError('');
    try {
      await update({
        name: form.name || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        twitterHandle: form.twitterHandle || undefined,
        githubHandle: form.githubHandle || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        websiteUrl: form.websiteUrl || undefined,
      });
      setSaveMsg('Profile saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Compute approximate completeness for preview
  const approxCompleteness = (() => {
    let s = 0;
    if (form.name) s += 15;
    if (form.bio) s += 15;
    if (form.location) s += 10;
    if (form.twitterHandle || form.linkedinUrl) s += 10;
    if (form.websiteUrl) s += 10;
    if (founder?.pitchCount && founder.pitchCount > 0) s += 20;
    if (founder?.milestoneCount && founder.milestoneCount > 0) s += 10;
    return Math.min(s, 100);
  })();

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit profile</h1>
            <p className="mt-1 text-sm text-white/40">
              This is what investors see on your public profile.
            </p>
          </div>
          {authedFounder && (
            <Link
              href={`/profile/${authedFounder.id}`}
              className="text-sm text-brand-400 hover:underline"
            >
              View public profile →
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Form */}
          <div className="space-y-5">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-navy-800 p-5">
              {authedFounder && (
                <ProfileAvatar
                  name={form.name || null}
                  publicKey={authedFounder.publicKey}
                  size="lg"
                />
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {form.name || 'Your name'}
                </p>
                <p className="text-xs text-white/30">
                  Avatar generated from your public key initials
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-white/40">
                Full name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ada Okonkwo"
                maxLength={100}
                className="input"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1 block text-xs font-medium text-white/40">
                Bio <span className="text-white/20">({form.bio.length}/500)</span>
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Building the future of fintech in Africa. 2× founder, ex-Paystack."
                rows={3}
                maxLength={500}
                className="input resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="mb-1 block text-xs font-medium text-white/40">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Lagos, Nigeria"
                maxLength={100}
                className="input"
              />
            </div>

            {/* Social */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: 'twitterHandle', label: 'X / Twitter handle', placeholder: 'username' },
                { key: 'githubHandle', label: 'GitHub handle', placeholder: 'username' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-white/40">{label}</label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-white/10 bg-white/5 px-3 text-xs text-white/20">
                      @
                    </span>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="input rounded-l-none"
                    />
                  </div>
                </div>
              ))}
              {[
                { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                { key: 'websiteUrl', label: 'Website', placeholder: 'https://yoursite.com' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-white/40">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    type="url"
                    className="input"
                  />
                </div>
              ))}
            </div>

            {/* Save */}
            {saveError && (
              <p className="text-sm text-red-400">{saveError}</p>
            )}
            {saveMsg && (
              <p className="text-sm text-brand-400">✓ {saveMsg}</p>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary w-full justify-center"
            >
              {isSaving ? 'Saving…' : 'Save profile'}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <CompletenessBar score={approxCompleteness} />

            <div className="rounded-xl border border-white/10 bg-navy-800 p-5">
              <h3 className="mb-2 text-sm font-semibold text-white">Tips</h3>
              <ul className="space-y-2 text-xs text-white/40">
                <li>→ Add a bio that explains your expertise and why you&apos;re building this</li>
                <li>→ Include your location — investors often look for regional matches</li>
                <li>→ A strong pitch + on-chain milestones boosts your credibility score</li>
                <li>→ Social links let investors do quick due diligence</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
