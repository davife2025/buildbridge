'use client';

import { STAGE_LABELS } from '@/lib/investor-api';

interface InvestorFiltersProps {
  sector: string;
  stage: string;
  geography: string;
  onSectorChange: (v: string) => void;
  onStageChange: (v: string) => void;
  onGeographyChange: (v: string) => void;
  onClear: () => void;
}

const SECTORS = ['fintech', 'web3', 'africa', 'saas', 'defi', 'blockchain', 'healthtech', 'edtech', 'payments', 'infrastructure'];
const STAGES = ['pre_seed', 'seed', 'series_a', 'series_b'];
const GEOS = ['Africa', 'Nigeria', 'Kenya', 'Ghana', 'Global', 'Europe', 'US', 'Asia'];

export function InvestorFilters({
  sector, stage, geography,
  onSectorChange, onStageChange, onGeographyChange, onClear,
}: InvestorFiltersProps) {
  const hasFilters = Boolean(sector || stage || geography);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sector */}
      <select
        value={sector}
        onChange={(e) => onSectorChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-navy-800 px-3 py-1.5 text-sm text-white/60 outline-none transition focus:border-brand-400/50"
      >
        <option value="">All sectors</option>
        {SECTORS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Stage */}
      <select
        value={stage}
        onChange={(e) => onStageChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-navy-800 px-3 py-1.5 text-sm text-white/60 outline-none transition focus:border-brand-400/50"
      >
        <option value="">All stages</option>
        {STAGES.map((s) => (
          <option key={s} value={s}>{STAGE_LABELS[s]}</option>
        ))}
      </select>

      {/* Geography */}
      <select
        value={geography}
        onChange={(e) => onGeographyChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-navy-800 px-3 py-1.5 text-sm text-white/60 outline-none transition focus:border-brand-400/50"
      >
        <option value="">All geographies</option>
        {GEOS.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs text-white/30 hover:text-white/60"
        >
          Clear filters ✕
        </button>
      )}
    </div>
  );
}
