'use client';

import type { PitchDetail } from '@/lib/pitch-api';
import { SECTION_KEYS } from '@/lib/pitch-api';

interface PitchHeaderProps { pitch: PitchDetail; isSaving: boolean; isScoring: boolean; onSave: () => void; onScore: () => void; }

const STATUS_STYLES: Record<PitchDetail['status'], string> = {
  draft:       'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  in_progress: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  complete:    'bg-[#ECFDF9] dark:bg-[#00C2A8]/10 text-[#00927C] dark:text-[#00C2A8]',
  archived:    'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600',
};
const STATUS_LABELS: Record<PitchDetail['status'], string> = {
  draft: 'Draft', in_progress: 'In progress', complete: 'Complete', archived: 'Archived',
};

export function PitchHeader({ pitch, isSaving, isScoring, onSave, onScore }: PitchHeaderProps) {
  const completedSections = SECTION_KEYS.filter((k) => pitch[k] !== null).length;
  const allDone = completedSections === SECTION_KEYS.length;

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[pitch.status]}`}>
            {STATUS_LABELS[pitch.status]}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{completedSections}/{SECTION_KEYS.length} sections</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{pitch.projectName}</h1>
        {pitch.tagline && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{pitch.tagline}</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={onSave} disabled={isSaving} className="btn-secondary disabled:opacity-40">{isSaving ? 'Saving…' : 'Save version'}</button>
        {allDone && (
          <button onClick={onScore} disabled={isScoring} className="btn-brand disabled:opacity-50">
            {isScoring ? (
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>Scoring…
              </span>
            ) : 'Score my pitch →'}
          </button>
        )}
      </div>
    </div>
  );
}
