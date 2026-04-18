'use client';

import type { PitchSectionData, SectionKey } from '@/lib/pitch-api';
import { SECTION_LABELS } from '@/lib/pitch-api';

interface SectionCardProps {
  sectionKey: SectionKey;
  data: PitchSectionData | null;
  isActive: boolean;
  streamingText?: string;
  onEdit: () => void;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? '#00C2A8' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="progress-track flex-1">
        <div className="progress-fill" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="min-w-[2.5rem] text-right text-xs font-bold" style={{ color }}>{score}/100</span>
    </div>
  );
}

export function SectionCard({ sectionKey, data, isActive, streamingText, onEdit }: SectionCardProps) {
  return (
    <div className={[
      'rounded-2xl border p-5 transition-all',
      isActive
        ? 'border-[#00C2A8]/40 bg-[#ECFDF9] dark:bg-[#00C2A8]/5 dark:border-[#00C2A8]/20 shadow-md'
        : data
          ? 'border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] shadow-sm'
          : 'border-dashed border-gray-200 dark:border-[#1A2640] bg-gray-50/50 dark:bg-[#0F1A2E]',
    ].join(' ')}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={['h-2 w-2 rounded-full', isActive ? 'animate-pulse' : ''].join(' ')}
            style={{ background: isActive ? '#00C2A8' : data ? '#00C2A8' : '#CBD5E1' }} />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{SECTION_LABELS[sectionKey]}</h3>
        </div>
        <button onClick={onEdit} disabled={isActive}
          className="rounded-lg border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#1A2640] px-2.5 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 shadow-sm transition hover:border-gray-300 dark:hover:border-[#2A3F64] hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30">
          {data ? 'Refine' : 'Write'}
        </button>
      </div>

      {isActive && streamingText ? (
        <div className="min-h-[60px]">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {streamingText}
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse align-middle" style={{ background: '#00C2A8' }} />
          </p>
        </div>
      ) : data ? (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{data.content}</p>
          <ScoreBar score={data.score} />
          {data.suggestions.length > 0 && (
            <div className="space-y-1">
              {data.suggestions.map((s, i) => (
                <p key={i} className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="mt-0.5" style={{ color: '#00C2A8' }}>→</span>
                  {s}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">Not written yet — click Write to get AI coaching.</p>
      )}
    </div>
  );
}
