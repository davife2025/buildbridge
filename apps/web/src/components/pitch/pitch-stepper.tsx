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
    <div className="rounded-xl border border-white/10 bg-navy-800 p-5">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-white/40">Pitch progress</span>
          <span className="font-medium text-brand-400">{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Section steps */}
      <div className="space-y-1">
        {SECTION_KEYS.map((key, idx) => {
          const done = pitch[key] !== null;
          const isActive = activeSection === key;
          const score = done ? (pitch[key] as { score: number } | null)?.score : null;

          return (
            <button
              key={key}
              onClick={() => onSelectSection(key)}
              className={[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                isActive
                  ? 'bg-brand-400/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              ].join(' ')}
            >
              {/* Step indicator */}
              <div
                className={[
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-brand-400 text-navy-900'
                    : done
                      ? 'bg-brand-400/20 text-brand-400'
                      : 'bg-white/10 text-white/30',
                ].join(' ')}
              >
                {done && !isActive ? '✓' : idx + 1}
              </div>

              {/* Label */}
              <span className="flex-1 text-sm font-medium">{SECTION_LABELS[key]}</span>

              {/* Score badge */}
              {score !== null && (
                <span
                  className="text-xs font-medium"
                  style={{
                    color: score >= 75 ? '#00C2A8' : score >= 50 ? '#F5A623' : '#EF4444',
                  }}
                >
                  {score}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overall score */}
      {pitch.overallScore !== null && (
        <div className="mt-5 rounded-lg border border-brand-400/20 bg-brand-400/5 p-3 text-center">
          <p className="text-xs text-white/40">Overall pitch score</p>
          <p className="text-2xl font-bold text-brand-400">{pitch.overallScore}</p>
          <p className="text-xs text-white/30">/ 100</p>
        </div>
      )}
    </div>
  );
}
