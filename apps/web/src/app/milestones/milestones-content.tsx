'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { MilestoneCard } from '@/components/milestones/milestone-card';
import { RecordMilestoneModal } from '@/components/milestones/record-milestone-modal';
import { useMilestones } from '@/hooks/use-milestones';
import type { MilestoneCategory } from '@/lib/milestone-api';

export function MilestonesContent() {
  const { isAuthenticated } = useAuth();
  const { milestones, isLoading, error, recordStatus, lastTxHash, recordMilestone, deleteMilestone } = useMilestones();
  const [showModal, setShowModal] = useState(false);
  const onChainCount = milestones.filter(m => m.txHash).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Milestones</h1>
          <p className="mt-1 text-sm text-white/40">Immutably verified on Stellar via Soroban smart contracts.</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Record milestone</button>
        )}
      </div>

      {isAuthenticated ? (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[{ label: 'Total', value: milestones.length }, { label: 'On-chain', value: onChainCount }, { label: 'Off-chain', value: milestones.length - onChainCount }].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-navy-800 p-4 text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/30">{label}</p>
              </div>
            ))}
          </div>

          {/* Stellar badge */}
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-white/5 px-4 py-3 text-xs text-white/30">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            Soroban MilestoneTracker · Stellar testnet
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

          {isLoading ? (
            <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-white/5" />)}</div>
          ) : milestones.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
              <p className="mb-2 text-4xl">⛓️</p>
              <p className="mb-1 font-medium text-white/40">No milestones yet</p>
              <p className="mb-6 text-sm text-white/20">Record your first achievement on-chain to build credibility with investors.</p>
              <button onClick={() => setShowModal(true)} className="btn-primary">Record first milestone →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map(m => <MilestoneCard key={m.id} milestone={m} onDelete={deleteMilestone} />)}
            </div>
          )}
        </>
      ) : (
        /* Logged-out: show what milestones are, invite to connect */
        <div className="rounded-xl border border-white/10 bg-navy-800 p-10 text-center">
          <p className="mb-3 text-4xl">⛓️</p>
          <h2 className="mb-2 font-bold text-white">On-Chain Milestone Verification</h2>
          <p className="mb-6 mx-auto max-w-sm text-sm text-white/40">
            Record your founder achievements on the Stellar blockchain. Each milestone is immutably
            stored via Soroban smart contracts — trustlessly verifiable by any investor.
          </p>
          <div className="mb-6 space-y-2 text-left mx-auto max-w-xs">
            {['Product launches', 'Revenue milestones', 'Funding rounds', 'Team hires', 'Partnerships'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/30">
                <span className="text-brand-400">⛓</span>{item}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/20">Connect your wallet via the navbar to get started.</p>
        </div>
      )}

      <RecordMilestoneModal
        isOpen={showModal || ['creating', 'building', 'signing', 'submitting', 'done'].includes(recordStatus)}
        status={recordStatus}
        lastTxHash={lastTxHash}
        error={error}
        onSubmit={async (p) => { await recordMilestone(p as { title: string; category: MilestoneCategory; description?: string }); }}
        onClose={() => setShowModal(false)}
      />
    </main>
  );
}
