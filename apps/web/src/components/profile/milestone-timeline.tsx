import type { PublicMilestone } from '@/lib/profile-api';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/milestone-api';

interface MilestoneTimelineProps {
  milestones: PublicMilestone[];
}

export function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
        <p className="text-white/20">No milestones recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {milestones.map((m, idx) => {
        const isOnChain = Boolean(m.txHash);
        const isLast = idx === milestones.length - 1;

        return (
          <div key={m.id} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-base',
                  isOnChain
                    ? 'border-brand-400 bg-brand-400/10'
                    : 'border-white/10 bg-navy-900',
                ].join(' ')}
              >
                {CATEGORY_ICONS[m.category]}
              </div>
              {!isLast && (
                <div className="mt-1 w-0.5 flex-1 bg-white/5" style={{ minHeight: '1.5rem' }} />
              )}
            </div>

            {/* Content */}
            <div className={['pb-6', isLast ? '' : ''].join(' ')}>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{m.title}</h4>

                {isOnChain ? (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${m.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-brand-400/15 px-2 py-0.5 text-xs font-medium text-brand-400 hover:bg-brand-400/25"
                  >
                    ⛓ Verified on-chain
                  </a>
                ) : (
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/20">
                    Off-chain
                  </span>
                )}

                <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/30">
                  {CATEGORY_LABELS[m.category]}
                </span>
              </div>

              {m.description && (
                <p className="mt-1 text-xs text-white/40">{m.description}</p>
              )}

              <p className="mt-1 text-xs text-white/20">
                {new Date(m.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                {m.onChainId !== null && ` · #${m.onChainId} on-chain`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
