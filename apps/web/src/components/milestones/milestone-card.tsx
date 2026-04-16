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
    <div className="group flex gap-4 rounded-xl border border-white/10 bg-navy-800 p-5 transition hover:border-white/20">
      {/* Category icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xl">
        {CATEGORY_ICONS[milestone.category]}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{milestone.title}</h3>

          {/* On-chain badge */}
          {isOnChain ? (
            <a
              href={explorerUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-brand-400/15 px-2 py-0.5 text-xs font-medium text-brand-400 transition hover:bg-brand-400/25"
              title="View on Stellar Explorer"
            >
              ⛓ On-chain
            </a>
          ) : (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/30">
              Off-chain
            </span>
          )}

          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/30">
            {CATEGORY_LABELS[milestone.category]}
          </span>
        </div>

        {milestone.description && (
          <p className="mb-2 text-xs text-white/40">{milestone.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-white/20">
          <span>{new Date(milestone.createdAt).toLocaleDateString()}</span>
          {milestone.onChainId !== null && (
            <span>ID #{milestone.onChainId}</span>
          )}
          {milestone.txHash && (
            <span className="font-mono">
              {milestone.txHash.slice(0, 8)}…{milestone.txHash.slice(-6)}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      {!isOnChain && onDelete && (
        <button
          onClick={() => onDelete(milestone.id)}
          className="shrink-0 self-start rounded-lg border border-red-500/10 p-1.5 text-red-400/40 opacity-0 transition hover:border-red-500/30 hover:text-red-400 group-hover:opacity-100"
          title="Delete milestone"
        >
          ✕
        </button>
      )}
    </div>
  );
}
