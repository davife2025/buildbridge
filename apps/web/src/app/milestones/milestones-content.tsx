'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MilestoneCard } from '@/components/milestones/milestone-card';
import { RecordMilestoneModal } from '@/components/milestones/record-milestone-modal';
import { useMilestones } from '@/hooks/use-milestones';
import type { MilestoneCategory } from '@/lib/milestone-api';

const STATS_LABELS = [
  { key: 'all',         label: 'Total' },
  { key: 'on-chain',    label: 'On-chain' },
  { key: 'off-chain',   label: 'Off-chain' },
];

export function MilestonesContent() {
  const {
    milestones, isLoading, error,
    recordStatus, lastTxHash,
    recordMilestone, deleteMilestone,
  } = useMilestones();

  const [showModal, setShowModal] = useState(false);

  const onChainCount = milestones.filter((m) => m.txHash).length;

  const handleRecord = async (params: {
    title: string;
    category: MilestoneCategory;
    description?: string;
  }) => {
    await recordMilestone(params);
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Milestones</h1>
            <p className="mt-1 text-sm text-white/40">
              Immutably verified on Stellar via Soroban smart contracts.
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Record milestone
          </button>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: milestones.length },
            { label: 'On-chain', value: onChainCount },
            { label: 'Off-chain', value: milestones.length - onChainCount },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-navy-800 p-4 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/30">{label}</p>
            </div>
          ))}
        </div>

        {/* Contract info */}
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-white/5 bg-white/2 px-4 py-3 text-xs text-white/30">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Soroban MilestoneTracker contract · Stellar testnet
          {process.env['NEXT_PUBLIC_CONTRACT_ID'] && (
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${process.env['NEXT_PUBLIC_CONTRACT_ID']}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-brand-400/60 hover:text-brand-400"
            >
              View contract →
            </a>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Milestone list */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : milestones.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
            <p className="mb-2 text-4xl">⛓️</p>
            <p className="mb-1 font-medium text-white/40">No milestones yet</p>
            <p className="mb-6 text-sm text-white/20">
              Record your first achievement on-chain to build credibility with investors.
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Record first milestone →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                onDelete={deleteMilestone}
              />
            ))}
          </div>
        )}
      </main>

      <RecordMilestoneModal
        isOpen={showModal || ['creating', 'building', 'signing', 'submitting', 'done'].includes(recordStatus)}
        status={recordStatus}
        lastTxHash={lastTxHash}
        error={error}
        onSubmit={handleRecord}
        onClose={() => setShowModal(false)}
      />
    </ProtectedRoute>
  );
}
