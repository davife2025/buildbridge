import type { TopPitch } from '@/lib/profile-api';
import { SECTION_KEYS, SECTION_LABELS } from '@/lib/pitch-api';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? '#00C2A8' : score >= 50 ? '#F59E0B' : '#EF4444';
  return <span className="text-sm font-extrabold" style={{ color }}>{score}/100</span>;
}

export function PitchPreviewCard({ pitch }: { pitch: TopPitch }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] shadow-sm">
      <div className="flex items-start justify-between border-b border-gray-100 dark:border-[#1E3050] p-5">
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-white">{pitch.projectName}</h3>
          {pitch.tagline && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{pitch.tagline}</p>}
        </div>
        {pitch.overallScore !== null && (
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Pitch score</p>
            <ScoreBadge score={pitch.overallScore} />
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-50 dark:divide-[#1E3050]">
        {SECTION_KEYS.map((key) => {
          const section = pitch[key as keyof TopPitch] as { title: string; content: string; score: number } | null;
          if (!section) return null;
          const color = section.score >= 75 ? '#00C2A8' : section.score >= 50 ? '#F59E0B' : '#EF4444';
          return (
            <div key={key} className="px-5 py-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="section-label">{SECTION_LABELS[key]}</span>
                <span className="text-xs font-bold" style={{ color }}>{section.score}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{section.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
