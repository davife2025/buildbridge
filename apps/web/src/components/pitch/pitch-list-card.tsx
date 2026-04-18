'use client';
// pitch-list-card.tsx
import Link from 'next/link';
import type { PitchSummary } from '@/lib/pitch-api';

interface PitchListCardProps { pitch: PitchSummary; onDelete: (id: string) => void; }

const STATUS_STYLE: Record<PitchSummary['status'], string> = {
  draft:       'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  in_progress: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  complete:    'bg-[#ECFDF9] dark:bg-[#00C2A8]/10 text-[#00927C] dark:text-[#00C2A8]',
  archived:    'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600',
};

export function PitchListCard({ pitch, onDelete }: PitchListCardProps) {
  const scoreColor = pitch.overallScore === null ? undefined
    : pitch.overallScore >= 75 ? '#00C2A8'
    : pitch.overallScore >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-4 shadow-sm transition-all hover:border-gray-300 dark:hover:border-[#2A3F64] hover:shadow-md">
      <div className="shrink-0">
        {pitch.overallScore !== null ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold"
            style={{ borderColor: scoreColor, color: scoreColor }}>
            {pitch.overallScore}
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-300 dark:text-gray-600">—</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">{pitch.projectName}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[pitch.status]}`}>
            {pitch.status.replace('_', ' ')}
          </span>
        </div>
        {pitch.tagline && <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-gray-500">{pitch.tagline}</p>}
        <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">Updated {new Date(pitch.updatedAt).toLocaleDateString()}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <Link href={`/pitch-builder/${pitch.id}`}
          className="rounded-lg border border-gray-200 dark:border-[#1E3050] px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 transition hover:border-gray-300 dark:hover:border-[#2A3F64] hover:bg-gray-50 dark:hover:bg-[#1A2640]">
          Open
        </Link>
        <button onClick={() => onDelete(pitch.id)}
          className="rounded-lg border border-red-100 dark:border-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-400 dark:text-red-700 transition hover:border-red-200 dark:hover:border-red-700/50 hover:bg-red-50 dark:hover:bg-red-900/10">
          Delete
        </button>
      </div>
    </div>
  );
}
