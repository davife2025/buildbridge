// investor-filters.tsx
'use client';
import { STAGE_LABELS } from '@/lib/investor-api';
interface InvestorFiltersProps { sector:string; stage:string; geography:string; onSectorChange:(v:string)=>void; onStageChange:(v:string)=>void; onGeographyChange:(v:string)=>void; onClear:()=>void; }
const SECTORS=['fintech','web3','africa','saas','defi','blockchain','healthtech','edtech','payments','infrastructure'];
const STAGES=['pre_seed','seed','series_a','series_b'];
const GEOS=['Africa','Nigeria','Kenya','Ghana','Global','Europe','US','Asia'];
export function InvestorFilters({sector,stage,geography,onSectorChange,onStageChange,onGeographyChange,onClear}:InvestorFiltersProps) {
  const hasFilters=Boolean(sector||stage||geography);
  const sel='rounded-xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 shadow-sm outline-none transition focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/20 cursor-pointer';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={sector} onChange={e=>onSectorChange(e.target.value)} className={sel}><option value="">All sectors</option>{SECTORS.map(s=><option key={s} value={s}>{s}</option>)}</select>
      <select value={stage} onChange={e=>onStageChange(e.target.value)} className={sel}><option value="">All stages</option>{STAGES.map(s=><option key={s} value={s}>{STAGE_LABELS[s]}</option>)}</select>
      <select value={geography} onChange={e=>onGeographyChange(e.target.value)} className={sel}><option value="">All geographies</option>{GEOS.map(g=><option key={g} value={g}>{g}</option>)}</select>
      {hasFilters&&<button onClick={onClear} className="rounded-xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 shadow-sm transition hover:border-gray-300 dark:hover:border-[#2A3F64] hover:text-gray-700 dark:hover:text-gray-300">Clear ✕</button>}
    </div>
  );
}
