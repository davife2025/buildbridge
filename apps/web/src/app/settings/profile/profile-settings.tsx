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
  const [form, setForm] = useState({ name:'', bio:'', location:'', twitterHandle:'', githubHandle:'', linkedinUrl:'', websiteUrl:'' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (founder) setForm({ name:founder.name??'', bio:founder.bio??'', location:founder.location??'', twitterHandle:founder.twitterHandle??'', githubHandle:founder.githubHandle??'', linkedinUrl:founder.linkedinUrl??'', websiteUrl:founder.websiteUrl??'' });
  }, [founder]);

  const handleSave = async () => {
    setIsSaving(true); setSaveMsg(''); setSaveError('');
    try {
      await update({ name:form.name||undefined, bio:form.bio||undefined, location:form.location||undefined, twitterHandle:form.twitterHandle||undefined, githubHandle:form.githubHandle||undefined, linkedinUrl:form.linkedinUrl||undefined, websiteUrl:form.websiteUrl||undefined });
      setSaveMsg('Profile saved!'); setTimeout(() => setSaveMsg(''), 3000);
    } catch(err) { setSaveError(err instanceof Error ? err.message : 'Failed to save'); }
    finally { setIsSaving(false); }
  };

  const approxCompleteness = (() => {
    let s=0;
    if(form.name) s+=15; if(form.bio) s+=15; if(form.location) s+=10;
    if(form.twitterHandle||form.linkedinUrl) s+=10; if(form.websiteUrl) s+=10;
    if(founder?.pitchCount&&founder.pitchCount>0) s+=20;
    if(founder?.milestoneCount&&founder.milestoneCount>0) s+=10;
    return Math.min(s,100);
  })();

  const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500';

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Edit profile</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This is what investors see on your public profile.</p>
          </div>
          {authedFounder && (
            <Link href={`/profile/${authedFounder.id}`} className="text-sm font-bold hover:underline" style={{color:'#00927C'}}>View public profile →</Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            {/* Avatar preview */}
            <div className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm">
              {authedFounder && <ProfileAvatar name={form.name||null} publicKey={authedFounder.publicKey} size="lg" />}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{form.name||'Your name'}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Avatar generated from your public key initials</p>
              </div>
            </div>

            <div><label className={labelClass}>Full name</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ada Okonkwo" maxLength={100} className="input" /></div>

            <div><label className={labelClass}>Bio <span className="font-normal normal-case text-gray-300 dark:text-gray-600">({form.bio.length}/500)</span></label>
              <textarea value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} placeholder="Building the future of fintech in Africa. 2× founder, ex-Paystack." rows={3} maxLength={500} className="input resize-none" /></div>

            <div><label className={labelClass}>Location</label>
              <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Lagos, Nigeria" maxLength={100} className="input" /></div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[{key:'twitterHandle',label:'X / Twitter handle',placeholder:'username'},{key:'githubHandle',label:'GitHub handle',placeholder:'username'}].map(({key,label,placeholder})=>(
                <div key={key}><label className={labelClass}>{label}</label>
                  <div className="flex">
                    <span className="flex items-center rounded-l-lg border border-r-0 border-gray-200 dark:border-[#1E3050] bg-gray-50 dark:bg-[#1A2640] px-3 text-xs font-semibold text-gray-400 dark:text-gray-500">@</span>
                    <input value={form[key as keyof typeof form]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} className="input rounded-l-none" />
                  </div>
                </div>
              ))}
              {[{key:'linkedinUrl',label:'LinkedIn URL',placeholder:'https://linkedin.com/in/...'},{key:'websiteUrl',label:'Website',placeholder:'https://yoursite.com'}].map(({key,label,placeholder})=>(
                <div key={key}><label className={labelClass}>{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder} type="url" className="input" /></div>
              ))}
            </div>

            {saveError && <p className="text-sm text-red-500 dark:text-red-400">{saveError}</p>}
            {saveMsg && <p className="text-sm font-semibold" style={{color:'#00927C'}}>✓ {saveMsg}</p>}
            <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full justify-center">{isSaving?'Saving…':'Save profile'}</button>
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <CompletenessBar score={approxCompleteness} />
            <div className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Tips</h3>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
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
