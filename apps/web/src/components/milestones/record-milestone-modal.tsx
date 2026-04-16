'use client';

import { useState } from 'react';
import type { MilestoneCategory } from '@/lib/milestone-api';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/milestone-api';

type RecordStatus = 'idle' | 'creating' | 'building' | 'signing' | 'submitting' | 'done' | 'error';

interface RecordMilestoneModalProps {
  isOpen: boolean;
  status: RecordStatus;
  lastTxHash: string | null;
  error: string | null;
  onSubmit: (params: { title: string; category: MilestoneCategory; description?: string }) => void;
  onClose: () => void;
}

const CATEGORIES: MilestoneCategory[] = [
  'product', 'traction', 'funding', 'team', 'partnership', 'other',
];

const STATUS_STEPS: { key: RecordStatus; label: string }[] = [
  { key: 'creating',   label: 'Saving to database' },
  { key: 'building',   label: 'Building Soroban transaction' },
  { key: 'signing',    label: 'Sign in Freighter wallet' },
  { key: 'submitting', label: 'Submitting to Stellar' },
  { key: 'done',       label: 'Confirmed on-chain!' },
];

const ACTIVE_STATUSES: RecordStatus[] = ['creating', 'building', 'signing', 'submitting', 'done'];

export function RecordMilestoneModal({
  isOpen, status, lastTxHash, error, onSubmit, onClose,
}: RecordMilestoneModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MilestoneCategory>('product');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const isBusy = ACTIVE_STATUSES.slice(0, 4).includes(status);
  const isDone = status === 'done';

  const handleSubmit = () => {
    if (!title.trim() || isBusy) return;
    onSubmit({ title: title.trim(), category, description: description.trim() || undefined });
  };

  const handleClose = () => {
    if (isBusy) return;
    setTitle(''); setCategory('product'); setDescription('');
    onClose();
  };

  // ── In-progress / done view ───────────────────────────
  if (ACTIVE_STATUSES.includes(status)) {
    const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-navy-800 p-6">
          <h2 className="mb-6 text-center text-lg font-bold text-white">
            {isDone ? 'Milestone recorded on-chain! 🎉' : 'Recording on-chain…'}
          </h2>

          <div className="mb-6 space-y-3">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx < currentIdx || isDone;
              const active = step.key === status && !isDone;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    done ? 'bg-brand-400 text-navy-900'
                    : active ? 'border-2 border-brand-400 text-brand-400'
                    : 'bg-white/10 text-white/20',
                  ].join(' ')}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <span className={[
                    'text-sm',
                    done || active ? 'text-white' : 'text-white/30',
                  ].join(' ')}>
                    {step.label}
                    {active && !isDone && (
                      <span className="ml-1 inline-block animate-pulse">…</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {isDone && lastTxHash && (
            <div className="mb-4 rounded-lg border border-brand-400/20 bg-brand-400/5 p-3 text-center">
              <p className="mb-1 text-xs text-white/40">Transaction hash</p>
              <p className="break-all font-mono text-xs text-brand-400">{lastTxHash}</p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-white/40 hover:text-white/70"
              >
                View on Stellar Expert →
              </a>
            </div>
          )}

          {isDone && (
            <button onClick={handleClose} className="w-full rounded-lg bg-brand-400 py-2.5 text-sm font-medium text-navy-900 hover:bg-brand-300">
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Form view ─────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl border border-white/10 bg-navy-800 p-6 sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Record a milestone</h2>
            <p className="mt-0.5 text-xs text-white/30">
              Stored immutably on Stellar via Soroban
            </p>
          </div>
          <button onClick={handleClose} className="text-white/30 hover:text-white/60">✕</button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/40">
              Title <span className="text-brand-400">*</span>
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reached 500 beta users"
              maxLength={120}
              className="input"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/40">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={[
                    'flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs transition',
                    category === cat
                      ? 'border-brand-400/50 bg-brand-400/10 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/70',
                  ].join(' ')}
                >
                  <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/40">
              Description <span className="text-white/20">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context…"
              rows={2}
              maxLength={500}
              className="input resize-none"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={handleClose} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-white/50 hover:border-white/20">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 rounded-lg bg-brand-400 py-2.5 text-sm font-medium text-navy-900 hover:bg-brand-300 disabled:opacity-50"
          >
            Record on-chain →
          </button>
        </div>
      </div>
    </div>
  );
}
