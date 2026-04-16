import type { TopPitch } from '@/lib/profile-api';
import { SECTION_KEYS, SECTION_LABELS } from '@/lib/pitch-api';

interface PitchPreviewCardProps {
  pitch: TopPitch;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? '#00C2A8' : score >= 50 ? '#F5A623' : '#EF4444';
  return (
    <span className="text-sm font-bold" style={{ color }}>
      {score}/100
    </span>
  );
}

export function PitchPreviewCard({ pitch }: PitchPreviewCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-800">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/5 p-5">
        <div>
          <h3 className="font-bold text-white">{pitch.projectName}</h3>
          {pitch.tagline && (
            <p className="mt-0.5 text-sm text-white/40">{pitch.tagline}</p>
          )}
        </div>
        {pitch.overallScore !== null && (
          <div className="text-right">
            <p className="text-xs text-white/30">Pitch score</p>
            <ScoreBadge score={pitch.overallScore} />
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="divide-y divide-white/5">
        {SECTION_KEYS.map((key) => {
          const section = pitch[key as keyof TopPitch] as {
            title: string;
            content: string;
            score: number;
          } | null;
          if (!section) return null;

          return (
            <div key={key} className="px-5 py-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
                  {SECTION_LABELS[key]}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color:
                      section.score >= 75
                        ? '#00C2A8'
                        : section.score >= 50
                          ? '#F5A623'
                          : '#EF4444',
                  }}
                >
                  {section.score}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/60">
                {section.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
