'use client';

import { useState } from 'react';

interface CreatePitchModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onSubmit: (projectName: string, tagline: string) => void;
  onClose: () => void;
}

export function CreatePitchModal({ isOpen, isLoading, onSubmit, onClose }: CreatePitchModalProps) {
  const [projectName, setProjectName] = useState('');
  const [tagline, setTagline] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!projectName.trim() || isLoading) return;
    onSubmit(projectName.trim(), tagline.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-navy-800 p-6">
        <h2 className="mb-1 text-lg font-bold text-white">New pitch</h2>
        <p className="mb-5 text-sm text-white/40">
          Give your project a name and tagline to get started.
        </p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/40">
              Project name <span className="text-brand-400">*</span>
            </label>
            <input
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. BuildBridge"
              maxLength={120}
              className="input"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/40">
              Tagline <span className="text-white/20">(optional)</span>
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Where builders meet capital"
              maxLength={200}
              className="input"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-white/50 transition hover:border-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!projectName.trim() || isLoading}
            className="flex-1 rounded-lg bg-brand-400 py-2.5 text-sm font-medium text-navy-900 transition hover:bg-brand-300 disabled:opacity-50"
          >
            {isLoading ? 'Creating…' : 'Create pitch →'}
          </button>
        </div>
      </div>
    </div>
  );
}
