'use client';

import type { Milestone } from '@/lib/milestone-api';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/milestone-api';

interface MilestoneCardProps {
  milestone: Milestone;
  onDelete?: (id: string) => void;
}

export function MilestoneCard({ milestone, onDelete }: MilestoneCardProps) {
  const isOnChain = Boolean(milestone.txHash);
  const explorerUrl = milestone.txHash
    ? `https://stellar.expert/explorer/testnet/tx/${milestone.txHash}`
    : null;

  return (
    <div className="group flex gap-4 rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-5 shadow-sm transition-all hover:border-gray-300 dark:hover:border-[#2A3F64] hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-[#1A2640] text-xl">
        {CATEGORY_ICONS[milestone.category]}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{milestone.title}</h3>
          {isOnChain ? (
            <a href={explorerUrl!} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition hover:opacity-80"
              style={{ background: '#ECFDF9', color: '#00927C' }}>
               On-chain
            </a>
          ) : (
            <span className="rounded-full bg-gray-100 dark:bg-[#1A2640] px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">Off-chain</span>
          )}
          <span className="rounded-full bg-gray-100 dark:bg-[#1A2640] px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            {CATEGORY_LABELS[milestone.category]}
          </span>
        </div>
        {milestone.description && (
          <p className="mb-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{milestone.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span>{new Date(milestone.createdAt).toLocaleDateString()}</span>
          {milestone.onChainId !== null && <span>ID #{milestone.onChainId}</span>}
          {milestone.txHash && <span className="font-mono">{milestone.txHash.slice(0, 8)}…{milestone.txHash.slice(-6)}</span>}
        </div>
      </div>

      {!isOnChain && onDelete && (
        <button onClick={() => onDelete(milestone.id)}
          className="shrink-0 self-start rounded-lg border border-red-100 dark:border-red-900/30 p-1.5 text-red-300 dark:text-red-700 opacity-0 transition hover:border-red-200 dark:hover:border-red-700 hover:text-red-500 dark:hover:text-red-400 group-hover:opacity-100"
          title="Delete milestone">✕</button>
      )}
    </div>
  );
}
