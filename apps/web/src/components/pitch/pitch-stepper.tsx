'use client';

import type { SectionKey, PitchDetail } from '@/lib/pitch-api';
import { SECTION_KEYS, SECTION_LABELS } from '@/lib/pitch-api';

interface PitchStepperProps {
  pitch: PitchDetail;
  activeSection: SectionKey | null;
  onSelectSection: (section: SectionKey) => void;
}

export function PitchStepper({ pitch, activeSection, onSelectSection }: PitchStepperProps) {
  const completedCount = SECTION_KEYS.filter((k) => pitch[k] !== null).length;
  const progressPct = Math.round((completedCount / SECTION_KEYS.length) * 100);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm">
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-500 dark:text-gray-400">Pitch progress</span>
          <span className="font-bold" style={{ color: '#00C2A8' }}>{progressPct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%`, background: '#00C2A8' }} />
        </div>
      </div>

      <div className="space-y-1">
        {SECTION_KEYS.map((key, idx) => {
          const done = pitch[key] !== null;
          const isActive = activeSection === key;
          const score = done ? (pitch[key] as { score: number } | null)?.score : null;

          return (
            <button key={key} onClick={() => onSelectSection(key)}
              className={[
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                isActive
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A2640] hover:text-gray-900 dark:hover:text-white',
              ].join(' ')}
            >
              <div className={[
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                isActive ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                : done   ? 'text-white'
                         : 'bg-gray-100 dark:bg-[#1A2640] text-gray-400 dark:text-gray-500',
              ].join(' ')}
                style={done && !isActive ? { background: '#00C2A8' } : {}}
              >
                {done && !isActive ? '✓' : idx + 1}
              </div>
              <span className="flex-1 text-sm font-semibold">{SECTION_LABELS[key]}</span>
              {score !== null && score !== undefined && (
            <span
              className="text-xs font-bold"
              style={{
                color: isActive
                  ? undefined
                  : score >= 75 ? '#00C2A8'
                  : score >= 50 ? '#F59E0B'
                  : '#EF4444',
              }}
            >
              {score}
            </span>
            )}
                      </button>
          );
        })}
      </div>

      {pitch.overallScore !== null && (
        <div className="mt-5 rounded-xl border p-3 text-center" style={{ borderColor: '#99E9DC', background: '#ECFDF9' }}>
          <p className="text-xs text-gray-400">Overall pitch score</p>
          <p className="text-2xl font-extrabold" style={{ color: '#00C2A8' }}>{pitch.overallScore}</p>
          <p className="text-xs text-gray-400">/ 100</p>
        </div>
      )}
    </div>
  );
}
