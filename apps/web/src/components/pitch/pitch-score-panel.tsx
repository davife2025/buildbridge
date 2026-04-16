'use client';

import type { PitchScore } from '@/lib/pitch-api';

interface PitchScorePanelProps {
  score: PitchScore;
  onClose: () => void;
}

function getScoreColor(score: number) {
  if (score >= 75) return '#00C2A8';
  if (score >= 50) return '#F5A623';
  return '#EF4444';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Investor-ready';
  if (score >= 65) return 'Strong';
  if (score >= 50) return 'Good start';
  if (score >= 35) return 'Needs work';
  return 'Early draft';
}

export function PitchScorePanel({ score, onClose }: PitchScorePanelProps) {
  const color = getScoreColor(score.overallScore);
  const label = getScoreLabel(score.overallScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-navy-800 p-6">
        {/* Score ring */}
        <div className="mb-6 flex flex-col items-center">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - score.overallScore / 100)}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="50" y="46" textAnchor="middle" dominantBaseline="central"
              fill={color} fontSize="22" fontWeight="700">{score.overallScore}</text>
            <text x="50" y="64" textAnchor="middle" dominantBaseline="central"
              fill="rgba(255,255,255,0.3)" fontSize="10">/ 100</text>
          </svg>
          <p className="mt-2 text-lg font-bold text-white">{label}</p>
          <p className="mt-1 text-center text-sm text-white/50">{score.feedback}</p>
        </div>

        {/* Strengths */}
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
            Strengths
          </h4>
          <div className="space-y-1.5">
            {score.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-0.5 text-brand-400">✓</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/30">
            Top improvements
          </h4>
          <div className="space-y-1.5">
            {score.improvements.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-0.5 text-amber-400">→</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-brand-400 py-2.5 text-sm font-medium text-navy-900 transition hover:bg-brand-300"
        >
          Keep refining
        </button>
      </div>
    </div>
  );
}
