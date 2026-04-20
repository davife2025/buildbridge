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
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Milestones</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Immutably verified on Stellar via Soroban smart contracts.</p>
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
              <div key={label} className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-4 text-center shadow-sm">
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Network badge */}
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-gray-100 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] px-4 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00C2A8' }} />
            Soroban MilestoneTracker · Stellar testnet
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          {isLoading ? (
            <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>
          ) : milestones.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] py-16 text-center">
              <p className="mb-2 text-4xl">⛓️</p>
              <p className="mb-1 font-bold text-gray-700 dark:text-gray-300">No milestones yet</p>
              <p className="mb-6 text-sm text-gray-400 dark:text-gray-500">Record your first achievement on-chain to build credibility with investors.</p>
              <button onClick={() => setShowModal(true)} className="btn-primary">Record first milestone →</button>
            </div>
          ) : (
            <div className="space-y-3">{milestones.map(m => <MilestoneCard key={m.id} milestone={m} onDelete={deleteMilestone} />)}</div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-10 text-center shadow-sm">
          <p className="mb-3 text-4xl"></p>
          <h2 className="mb-2 font-bold text-gray-900 dark:text-white">On-Chain Milestone Verification</h2>
          <p className="mx-auto mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Record your founder achievements on the Stellar blockchain — trustlessly verifiable by any investor.
          </p>
          <div className="mx-auto mb-6 max-w-xs space-y-2 text-left">
            {['Product launches', 'Revenue milestones', 'Funding rounds', 'Team hires', 'Partnerships'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span style={{ color: '#00C2A8' }}>⛓</span>{item}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Connect your wallet via the navbar to get started.</p>
        </div>
      )}

      <RecordMilestoneModal
        isOpen={showModal || ['creating', 'building', 'signing', 'submitting', 'done'].includes(recordStatus)}
        status={recordStatus} lastTxHash={lastTxHash} error={error}
        onSubmit={async p => { await recordMilestone(p as { title: string; category: MilestoneCategory; description?: string }); }}
        onClose={() => setShowModal(false)}
      />
    </main>
  );
}
