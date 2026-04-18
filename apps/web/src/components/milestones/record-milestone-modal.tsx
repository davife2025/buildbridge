'use client';

import { useState } from 'react';
import type { MilestoneCategory } from '@/lib/milestone-api';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/milestone-api';

type RecordStatus = 'idle' | 'creating' | 'building' | 'signing' | 'submitting' | 'done' | 'error';
interface RecordMilestoneModalProps { isOpen: boolean; status: RecordStatus; lastTxHash: string | null; error: string | null; onSubmit: (p: { title: string; category: MilestoneCategory; description?: string }) => void; onClose: () => void; }

const CATEGORIES: MilestoneCategory[] = ['product', 'traction', 'funding', 'team', 'partnership', 'other'];
const STATUS_STEPS: { key: RecordStatus; label: string }[] = [
  { key: 'creating',   label: 'Saving to database'           },
  { key: 'building',   label: 'Building Soroban transaction'  },
  { key: 'signing',    label: 'Sign in Freighter wallet'      },
  { key: 'submitting', label: 'Submitting to Stellar'         },
  { key: 'done',       label: 'Confirmed on-chain!'           },
];
const ACTIVE_STATUSES: RecordStatus[] = ['creating', 'building', 'signing', 'submitting', 'done'];

export function RecordMilestoneModal({ isOpen, status, lastTxHash, error, onSubmit, onClose }: RecordMilestoneModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MilestoneCategory>('product');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;
  const isBusy = ACTIVE_STATUSES.slice(0, 4).includes(status);
  const isDone = status === 'done';

  const handleSubmit = () => { if (!title.trim() || isBusy) return; onSubmit({ title: title.trim(), category, description: description.trim() || undefined }); };
  const handleClose = () => { if (isBusy) return; setTitle(''); setCategory('product'); setDescription(''); onClose(); };

  if (ACTIVE_STATUSES.includes(status)) {
    const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-6 shadow-lg">
          <h2 className="mb-6 text-center text-lg font-bold text-gray-900 dark:text-white">
            {isDone ? 'Milestone recorded on-chain! 🎉' : 'Recording on-chain…'}
          </h2>
          <div className="mb-6 space-y-3">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx < currentIdx || isDone;
              const active = step.key === status && !isDone;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={['flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    !done && !active ? 'bg-gray-100 dark:bg-[#1A2640] text-gray-400 dark:text-gray-500' : '',
                    active ? 'border-2 border-[#00C2A8] text-[#00C2A8]' : '',
                  ].join(' ')}
                    style={done ? { background: '#00C2A8', color: 'white' } : {}}>
                    {done ? '✓' : idx + 1}
                  </div>
                  <span className={['text-sm', done || active ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'].join(' ')}>
                    {step.label}{active && !isDone && <span className="ml-1 animate-pulse">…</span>}
                  </span>
                </div>
              );
            })}
          </div>
          {isDone && lastTxHash && (
            <div className="mb-4 rounded-xl border p-3 text-center" style={{ borderColor: '#99E9DC', background: '#ECFDF9' }}>
              <p className="mb-1 text-xs text-gray-400">Transaction hash</p>
              <p className="break-all font-mono text-xs" style={{ color: '#00927C' }}>{lastTxHash}</p>
              <a href={`https://stellar.expert/explorer/testnet/tx/${lastTxHash}`} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-gray-400 hover:text-gray-700">View on Stellar Expert →</a>
            </div>
          )}
          {isDone && <button onClick={handleClose} className="btn-brand w-full justify-center">Done</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-6 shadow-lg sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Record a milestone</h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Stored immutably on Stellar via Soroban</p>
          </div>
          <button onClick={handleClose} className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400">✕</button>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3 text-xs text-red-600 dark:text-red-400">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Title <span style={{ color: '#00C2A8' }}>*</span>
            </label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Reached 500 beta users" maxLength={120} className="input" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={['flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition',
                    category === cat
                      ? 'border-[#00C2A8] bg-[#ECFDF9] dark:bg-[#00C2A8]/10 text-[#00927C] dark:text-[#00C2A8]'
                      : 'border-gray-200 dark:border-[#1E3050] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-[#2A3F64] hover:bg-gray-50 dark:hover:bg-[#1A2640]',
                  ].join(' ')}>
                  <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Description <span className="font-normal normal-case text-gray-300 dark:text-gray-600">(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add more context…" rows={2} maxLength={500} className="input resize-none" />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={handleClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()} className="btn-brand flex-1 justify-center disabled:opacity-50">Record on-chain →</button>
        </div>
      </div>
    </div>
  );
}
