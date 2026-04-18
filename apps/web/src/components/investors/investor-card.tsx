'use client';

import { useState } from 'react';
import type { Investor, InvestorMatch } from '@/lib/investor-api';
import { STAGE_LABELS, formatCheckSize } from '@/lib/investor-api';

interface InvestorCardProps { investor: Investor; match?: InvestorMatch; isConnected: boolean; isConnecting: boolean; onConnect: (id: string, msg: string) => Promise<void>; }

function getScoreColor(s: number) { return s >= 75 ? '#00C2A8' : s >= 50 ? '#F59E0B' : '#8B5CF6'; }

function InvestorAvatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-[#1A2640] text-sm font-bold text-gray-500 dark:text-gray-400">
      {initials}
    </div>
  );
}

export function InvestorCard({ investor, match, isConnected, isConnecting, onConnect }: InvestorCardProps) {
  const [showConnect, setShowConnect] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleConnect = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try { await onConnect(investor.id, message.trim()); setShowConnect(false); setMessage(''); }
    finally { setSending(false); }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm transition-all hover:border-gray-300 dark:hover:border-[#2A3F64] hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <InvestorAvatar name={investor.name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-white">{investor.name}</h3>
              {investor.websiteUrl && <a href={investor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400">↗</a>}
            </div>
            {investor.firm && <p className="text-sm text-gray-500 dark:text-gray-400">{investor.firm}</p>}
          </div>
        </div>
        {match && (
          <div className="shrink-0 text-right">
            <div className="text-lg font-extrabold" style={{ color: getScoreColor(match.score) }}>{match.score}%</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">match</div>
          </div>
        )}
      </div>

      {investor.bio && <p className="mb-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{investor.bio}</p>}

      <div className="mb-3 flex flex-wrap gap-1.5">
        {investor.stages.slice(0,3).map(s => <span key={s} className="rounded-full bg-gray-100 dark:bg-[#1A2640] px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{STAGE_LABELS[s]??s}</span>)}
        {investor.sectors.slice(0,3).map(s => <span key={s} className="rounded-full px-2 py-0.5 text-xs font-medium" style={{background:'#ECFDF9',color:'#00927C'}}>{s}</span>)}
        {match?.tags.map(t => <span key={t} className="rounded-full bg-gray-50 dark:bg-[#1A2640] px-2 py-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">{t}</span>)}
      </div>

      {match && match.reasons.length > 0 && (
        <div className="mb-3 space-y-1">
          {match.reasons.map((r,i) => <p key={i} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500"><span className="font-bold" style={{color:'#00C2A8'}}>✓</span>{r}</p>)}
        </div>
      )}

      <div className="mb-4 text-xs text-gray-400 dark:text-gray-500">
        Check: {formatCheckSize(investor.minCheck, investor.maxCheck)}
        {investor.geography.length>0 && ` · ${investor.geography.slice(0,2).join(', ')}`}
      </div>

      {isConnected ? (
        <div className="rounded-xl border py-2 text-center text-xs font-semibold" style={{borderColor:'#99E9DC',background:'#ECFDF9',color:'#00927C'}}>✓ Connection requested</div>
      ) : showConnect ? (
        <div className="space-y-2">
          <textarea autoFocus value={message} onChange={e=>setMessage(e.target.value)}
            placeholder={`Hi ${investor.name.split(' ')[0]}, I'd love to connect…`}
            rows={3} maxLength={500} className="input resize-none text-sm" />
          <div className="flex gap-2">
            <button onClick={()=>setShowConnect(false)} className="btn-secondary flex-1 justify-center py-2 text-xs">Cancel</button>
            <button onClick={handleConnect} disabled={!message.trim()||sending||message.length<10}
              className="btn-brand flex-1 justify-center py-2 text-xs disabled:opacity-50">
              {sending?'Sending…':'Send request →'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowConnect(true)} disabled={isConnecting} className="btn-secondary w-full justify-center text-sm">Request connection</button>
      )}
    </div>
  );
}
