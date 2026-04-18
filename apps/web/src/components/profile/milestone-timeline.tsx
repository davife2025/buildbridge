import type { PublicMilestone } from '@/lib/profile-api';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/milestone-api';

export function MilestoneTimeline({ milestones }: { milestones: PublicMilestone[] }) {
  if (milestones.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1E3050] py-10 text-center">
        <p className="text-gray-300 dark:text-gray-600">No milestones recorded yet</p>
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
            <div className="flex flex-col items-center">
              <div
                className={['flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-base',
                  isOnChain ? '' : 'border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E]'].join(' ')}
                style={isOnChain ? { borderColor: '#00C2A8', background: '#ECFDF9' } : {}}
              >
                {CATEGORY_ICONS[m.category]}
              </div>
              {!isLast && <div className="mt-1 w-0.5 flex-1 bg-gray-100 dark:bg-[#1E3050]" style={{ minHeight: '1.5rem' }} />}
            </div>

            <div className="pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{m.title}</h4>
                {isOnChain ? (
                  <a href={`https://stellar.expert/explorer/testnet/tx/${m.txHash}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition hover:opacity-80"
                    style={{ background: '#ECFDF9', color: '#00927C' }}>
                    ⛓ Verified on-chain
                  </a>
                ) : (
                  <span className="rounded-full bg-gray-100 dark:bg-[#1A2640] px-2 py-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">Off-chain</span>
                )}
                <span className="rounded-full bg-gray-100 dark:bg-[#1A2640] px-2 py-0.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                  {CATEGORY_LABELS[m.category]}
                </span>
              </div>
              {m.description && <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{m.description}</p>}
              <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
                {new Date(m.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {m.onChainId !== null && ` · #${m.onChainId} on-chain`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
