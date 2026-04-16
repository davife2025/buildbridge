interface CompletenessBarProps {
  score: number; // 0–100
}

const TIPS: { threshold: number; tip: string }[] = [
  { threshold: 15, tip: 'Add your name' },
  { threshold: 30, tip: 'Write a bio' },
  { threshold: 40, tip: 'Add your location' },
  { threshold: 50, tip: 'Upload a photo' },
  { threshold: 60, tip: 'Add social links' },
  { threshold: 70, tip: 'Add your website' },
  { threshold: 90, tip: 'Complete a pitch' },
  { threshold: 100, tip: 'Record a milestone on-chain' },
];

function getNextTip(score: number): string | null {
  const next = TIPS.find((t) => score < t.threshold);
  return next ? next.tip : null;
}

export function CompletenessBar({ score }: CompletenessBarProps) {
  const color =
    score >= 80 ? '#00C2A8' : score >= 50 ? '#F5A623' : '#8B5CF6';
  const nextTip = getNextTip(score);

  return (
    <div className="rounded-xl border border-white/10 bg-navy-800 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Profile completeness</h3>
        <span className="text-sm font-bold" style={{ color }}>
          {score}%
        </span>
      </div>

      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>

      {nextTip && (
        <p className="text-xs text-white/30">
          Next: <span className="text-white/50">{nextTip}</span>
        </p>
      )}

      {score === 100 && (
        <p className="text-xs text-brand-400">
          ✓ Profile complete — you're investor-ready!
        </p>
      )}
    </div>
  );
}
