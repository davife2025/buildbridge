'use client';

import type { PitchSectionData, SectionKey } from '@/lib/pitch-api';
import { SECTION_LABELS } from '@/lib/pitch-api';

interface SectionCardProps {
  sectionKey: SectionKey;
  data: PitchSectionData | null;
  isActive: boolean;       // currently streaming
  streamingText?: string;  // raw text being streamed
  onEdit: () => void;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? '#00C2A8' : score >= 50 ? '#F5A623' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="min-w-[2.5rem] text-right text-xs font-medium" style={{ color }}>
        {score}/100
      </span>
    </div>
  );
}

export function SectionCard({ sectionKey, data, isActive, streamingText, onEdit }: SectionCardProps) {
  const label = SECTION_LABELS[sectionKey];

  return (
    <div
      className={[
        'rounded-xl border p-5 transition-all',
        isActive
          ? 'border-brand-400/50 bg-brand-400/5'
          : data
            ? 'border-white/10 bg-navy-800'
            : 'border-white/5 bg-navy-800/50',
      ].join(' ')}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={[
              'h-2 w-2 rounded-full',
              isActive ? 'animate-pulse bg-brand-400' : data ? 'bg-brand-400' : 'bg-white/20',
            ].join(' ')}
          />
          <h3 className="text-sm font-semibold text-white">{label}</h3>
        </div>

        <button
          onClick={onEdit}
          disabled={isActive}
          className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/40 transition hover:border-white/20 hover:text-white/70 disabled:opacity-30"
        >
          {data ? 'Refine' : 'Write'}
        </button>
      </div>

      {/* Content */}
      {isActive && streamingText ? (
        <div className="min-h-[60px]">
          <p className="text-sm leading-relaxed text-white/60">
            {streamingText}
            <span className="inline-block h-3.5 w-0.5 animate-pulse bg-brand-400 align-middle" />
          </p>
        </div>
      ) : data ? (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-white/70">{data.content}</p>
          <ScoreBar score={data.score} />
          {data.suggestions.length > 0 && (
            <div className="space-y-1">
              {data.suggestions.map((s, i) => (
                <p key={i} className="flex items-start gap-2 text-xs text-white/30">
                  <span className="mt-0.5 text-brand-400">→</span>
                  {s}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-white/20">
          Not written yet — click Write to get AI coaching.
        </p>
      )}
    </div>
  );
}
