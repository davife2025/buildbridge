'use client';

import { useState, useEffect, useRef } from 'react';
import type { SectionKey } from '@/lib/pitch-api';
import { SECTION_LABELS, SECTION_HINTS } from '@/lib/pitch-api';

interface RefineModalProps {
  section: SectionKey | null;
  existingContent?: string;
  isStreaming: boolean;
  onSubmit: (section: SectionKey, input: string) => void;
  onClose: () => void;
}

export function RefineModal({
  section,
  existingContent,
  isStreaming,
  onSubmit,
  onClose,
}: RefineModalProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pre-fill with existing content when editing
  useEffect(() => {
    if (section) {
      setInput(existingContent ?? '');
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [section, existingContent]);

  if (!section) return null;

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return;
    onSubmit(section, input.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl rounded-t-2xl border border-white/10 bg-navy-800 p-6 sm:rounded-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">
              {SECTION_LABELS[section]}
            </h2>
            <p className="mt-0.5 text-xs text-white/30">
              {SECTION_HINTS[section]}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isStreaming}
            className="rounded-lg p-1.5 text-white/30 transition hover:text-white/60 disabled:opacity-30"
          >
            ✕
          </button>
        </div>

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          placeholder="Describe this section in your own words — the AI will refine and polish it for investors…"
          rows={6}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 disabled:opacity-50"
        />

        <p className="mt-1 text-right text-xs text-white/20">{input.length} / 2000</p>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isStreaming}
            className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming || input.length > 2000}
            className="flex-1 rounded-lg bg-brand-400 py-2.5 text-sm font-medium text-navy-900 transition hover:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStreaming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Refining…
              </span>
            ) : (
              'Refine with AI →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
