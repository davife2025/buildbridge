'use client';

import { useState } from 'react';
import type { Investor, InvestorMatch } from '@/lib/investor-api';
import { STAGE_LABELS, formatCheckSize } from '@/lib/investor-api';

interface InvestorCardProps {
  investor: Investor;
  match?: InvestorMatch;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: (investorId: string, message: string) => Promise<void>;
}

function getScoreColor(score: number) {
  if (score >= 75) return '#00C2A8';
  if (score >= 50) return '#F5A623';
  return '#8B5CF6';
}

function InvestorAvatar({ name, firm }: { name: string; firm: string | null }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/60">
      {initials}
    </div>
  );
}

export function InvestorCard({
  investor, match, isConnected, isConnecting, onConnect,
}: InvestorCardProps) {
  const [showConnect, setShowConnect] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleConnect = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await onConnect(investor.id, message.trim());
      setShowConnect(false);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <InvestorAvatar name={investor.name} firm={investor.firm} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{investor.name}</h3>
              {investor.websiteUrl && (
                <a href={investor.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-white/30 hover:text-white/60">↗</a>
              )}
            </div>
            {investor.firm && (
              <p className="text-sm text-white/40">{investor.firm}</p>
            )}
          </div>
        </div>

        {/* Match score */}
        {match && (
          <div className="shrink-0 text-right">
            <div
              className="text-lg font-bold"
              style={{ color: getScoreColor(match.score) }}
            >
              {match.score}%
            </div>
            <div className="text-xs text-white/20">match</div>
          </div>
        )}
      </div>

      {/* Bio */}
      {investor.bio && (
        <p className="mb-3 text-sm leading-relaxed text-white/50">{investor.bio}</p>
      )}

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {investor.stages.slice(0, 3).map((s) => (
          <span key={s} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/40">
            {STAGE_LABELS[s] ?? s}
          </span>
        ))}
        {investor.sectors.slice(0, 3).map((s) => (
          <span key={s} className="rounded-full bg-brand-400/10 px-2 py-0.5 text-xs text-brand-400/70">
            {s}
          </span>
        ))}
        {match?.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/30">
            {tag}
          </span>
        ))}
      </div>

      {/* Match reasons */}
      {match && match.reasons.length > 0 && (
        <div className="mb-3 space-y-1">
          {match.reasons.map((r, i) => (
            <p key={i} className="flex items-center gap-1.5 text-xs text-white/30">
              <span className="text-brand-400">✓</span>
              {r}
            </p>
          ))}
        </div>
      )}

      {/* Check size */}
      <div className="mb-4 text-xs text-white/20">
        Check: {formatCheckSize(investor.minCheck, investor.maxCheck)}
        {investor.geography.length > 0 && ` · ${investor.geography.slice(0, 2).join(', ')}`}
      </div>

      {/* Connect flow */}
      {isConnected ? (
        <div className="rounded-lg border border-brand-400/20 bg-brand-400/5 py-2 text-center text-xs text-brand-400">
          ✓ Connection requested
        </div>
      ) : showConnect ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${investor.name.split(' ')[0]}, I'd love to connect about my project…`}
            rows={3}
            maxLength={500}
            className="input resize-none text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowConnect(false)}
              className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-white/40 hover:border-white/20"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={!message.trim() || sending || message.length < 10}
              className="flex-1 rounded-lg bg-brand-400 py-2 text-xs font-medium text-navy-900 hover:bg-brand-300 disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send request →'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowConnect(true)}
          disabled={isConnecting}
          className="w-full rounded-lg border border-white/10 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Request connection
        </button>
      )}
    </div>
  );
}
