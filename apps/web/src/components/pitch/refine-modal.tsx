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

export function RefineModal({ section, existingContent, isStreaming, onSubmit, onClose }: RefineModalProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (section) { setInput(existingContent ?? ''); setTimeout(() => textareaRef.current?.focus(), 50); }
  }, [section, existingContent]);

  if (!section) return null;

  const handleSubmit = () => { if (!input.trim() || isStreaming) return; onSubmit(section, input.trim()); };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-xl rounded-t-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">{SECTION_LABELS[section]}</h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{SECTION_HINTS[section]}</p>
          </div>
          <button onClick={onClose} disabled={isStreaming}
            className="rounded-lg p-1.5 text-gray-300 dark:text-gray-600 transition hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30">✕</button>
        </div>

        <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          placeholder="Describe this section in your own words — the AI will refine and polish it for investors…"
          rows={6} className="input resize-none disabled:opacity-50" />
        <p className="mt-1 text-right text-xs text-gray-300 dark:text-gray-600">{input.length} / 2000</p>

        <div className="mt-4 flex gap-3">
          <button onClick={onClose} disabled={isStreaming} className="btn-secondary flex-1 justify-center disabled:opacity-30">Cancel</button>
          <button onClick={handleSubmit} disabled={!input.trim() || isStreaming || input.length > 2000}
            className="btn-brand flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50">
            {isStreaming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>Refining…
              </span>
            ) : 'Refine with AI →'}
          </button>
        </div>
      </div>
    </div>
  );
}
