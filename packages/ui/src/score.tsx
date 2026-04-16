interface ScoreProps {
  score: number; // 0–100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getColor(score: number): string {
  if (score >= 75) return '#00C2A8'; // brand teal
  if (score >= 50) return '#F5A623'; // amber
  return '#EF4444';                  // red
}

function getLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Weak';
  return 'Poor';
}

const sizes = { sm: 48, md: 64, lg: 80 };

export function ScoreRing({ score, size = 'md', showLabel = true }: ScoreProps) {
  const px = sizes[size];
  const r = (px - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-label={`Score: ${score}/100`}>
        {/* Track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
        />
        {/* Progress */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${px / 2} ${px / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Label */}
        <text
          x={px / 2}
          y={px / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size === 'lg' ? 20 : size === 'md' ? 16 : 13}
          fontWeight="600"
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>
          {getLabel(score)}
        </span>
      )}
    </div>
  );
}

export function ScoreBar({ score, label }: { score: number; label?: string }) {
  const color = getColor(score);
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-white/50">{label}</span>
          <span className="text-xs font-medium" style={{ color }}>
            {score}/100
          </span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
