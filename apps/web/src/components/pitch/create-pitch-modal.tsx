'use client';

import { useState } from 'react';

interface CreatePitchModalProps { isOpen: boolean; isLoading: boolean; onSubmit: (n: string, t: string) => void; onClose: () => void; }

export function CreatePitchModal({ isOpen, isLoading, onSubmit, onClose }: CreatePitchModalProps) {
  const [projectName, setProjectName] = useState('');
  const [tagline, setTagline] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => { if (!projectName.trim() || isLoading) return; onSubmit(projectName.trim(), tagline.trim()); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-extrabold text-gray-900 dark:text-white">New pitch</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Give your project a name and tagline to get started.</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Project name <span style={{ color: '#00C2A8' }}>*</span>
            </label>
            <input autoFocus value={projectName} onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. BuildBridge" maxLength={120} className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Tagline <span className="font-normal normal-case text-gray-300 dark:text-gray-600">(optional)</span>
            </label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Where builders meet capital" maxLength={200} className="input" />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} disabled={isLoading} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} disabled={!projectName.trim() || isLoading} className="btn-primary flex-1 justify-center disabled:opacity-50">
            {isLoading ? 'Creating…' : 'Create pitch →'}
          </button>
        </div>
      </div>
    </div>
  );
}
