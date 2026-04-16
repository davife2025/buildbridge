'use client';

import Link from 'next/link';
import type { PitchSummary } from '@/lib/pitch-api';
import { SECTION_KEYS } from '@/lib/pitch-api';

interface PitchListCardProps {
  pitch: PitchSummary;
  onDelete: (id: string) => void;
}

const STATUS_COLOR: Record<PitchSummary['status'], string> = {
  draft:       'bg-white/10 text-white/40',
  in_progress: 'bg-amber-400/15 text-amber-400',
  complete:    'bg-brand-400/15 text-brand-400',
  archived:    'bg-white/5 text-white/20',
};

export function PitchListCard({ pitch, onDelete }: PitchListCardProps) {
  const scoreColor =
    pitch.overallScore === null ? undefined
    : pitch.overallScore >= 75 ? '#00C2A8'
    : pitch.overallScore >= 50 ? '#F5A623'
    : '#EF4444';

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-navy-800 p-4 transition hover:border-white/20">
      {/* Score ring (mini) */}
      <div className="shrink-0">
        {pitch.overallScore !== null ? (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold"
            style={{ borderColor: scoreColor, color: scoreColor }}
          >
            {pitch.overallScore}
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 text-xs text-white/20">
            —
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-white">{pitch.projectName}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[pitch.status]}`}>
            {pitch.status.replace('_', ' ')}
          </span>
        </div>
        {pitch.tagline && (
          <p className="mt-0.5 truncate text-xs text-white/30">{pitch.tagline}</p>
        )}
        <p className="mt-1 text-xs text-white/20">
          Updated {new Date(pitch.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <Link
          href={`/pitch-builder/${pitch.id}`}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Open
        </Link>
        <button
          onClick={() => onDelete(pitch.id)}
          className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400/60 transition hover:border-red-500/40 hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
