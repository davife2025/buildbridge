'use client';

import type { PitchScore } from '@/lib/pitch-api';

function getScoreColor(s: number) { return s >= 75 ? '#00C2A8' : s >= 50 ? '#F59E0B' : '#EF4444'; }
function getScoreLabel(s: number) {
  if (s >= 80) return 'Investor-ready';
  if (s >= 65) return 'Strong';
  if (s >= 50) return 'Good start';
  if (s >= 35) return 'Needs work';
  return 'Early draft';
}

export function PitchScorePanel({ score, onClose }: { score: PitchScore; onClose: () => void }) {
  const color = getScoreColor(score.overallScore);
  const label = getScoreLabel(score.overallScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-6 shadow-xl">
        {/* Score ring */}
        <div className="mb-6 flex flex-col items-center">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
              className="text-gray-100 dark:text-[#1A2640]" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={color} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - score.overallScore / 100)}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="50" y="46" textAnchor="middle" dominantBaseline="central"
              fill={color} fontSize="22" fontWeight="800">{score.overallScore}</text>
            <text x="50" y="64" textAnchor="middle" dominantBaseline="central"
              fill="#94A3B8" fontSize="10">/ 100</text>
          </svg>
          <p className="mt-2 text-lg font-extrabold text-gray-900 dark:text-white">{label}</p>
          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">{score.feedback}</p>
        </div>

        {/* Strengths */}
        <div className="mb-4">
          <h4 className="mb-2 section-label">Strengths</h4>
          <div className="space-y-1.5">
            {score.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-0.5 font-bold" style={{ color: '#00C2A8' }}>✓</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="mb-6">
          <h4 className="mb-2 section-label">Top improvements</h4>
          <div className="space-y-1.5">
            {score.improvements.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-0.5 font-bold text-amber-500 dark:text-amber-400">→</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="btn-brand w-full justify-center">Keep refining</button>
      </div>
    </div>
  );
}
