import { supabaseAdmin } from '../db/supabase';

export interface InvestorMatch {
  investor: Record<string, unknown>;
  score: number;
  reasons: string[];
  tags: string[];
}

// ─── Scoring helpers (unchanged) ─────────────────────────

function scoreStage(
  investorStages: string[],
  pitchStatus: string | undefined,
  pitchScore: number | null | undefined,
): { score: number; reason: string | null } {
  let founderStage: string;
  if (!pitchStatus || pitchStatus === 'draft') founderStage = 'pre_seed';
  else if (pitchScore != null && pitchScore >= 70) founderStage = 'seed';
  else founderStage = 'pre_seed';

  if (investorStages.includes(founderStage) || investorStages.includes('any')) {
    return { score: 30, reason: `Invests at ${founderStage.replace('_', '-')} stage` };
  }
  if (founderStage === 'pre_seed' && (investorStages.includes('seed') || investorStages.includes('series_a'))) {
    return { score: 10, reason: null };
  }
  return { score: 0, reason: null };
}

function scoreSectors(
  investorSectors: string[],
  pitchContent: Record<string, unknown> | null,
): { score: number; reasons: string[] } {
  if (!pitchContent) return { score: 0, reasons: [] };

  const pitchText = JSON.stringify(pitchContent).toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  const sectorKeywords: Record<string, string[]> = {
    fintech: ['fintech', 'payment', 'finance', 'banking', 'money', 'wallet', 'remittance'],
    web3: ['blockchain', 'web3', 'defi', 'stellar', 'soroban', 'crypto', 'token', 'smart contract'],
    africa: ['africa', 'african', 'nigeria', 'kenya', 'ghana', 'lagos', 'nairobi', 'emerging market'],
    saas: ['saas', 'software', 'platform', 'subscription', 'b2b', 'enterprise'],
    healthtech: ['health', 'medical', 'patient', 'hospital', 'clinic', 'telemedicine'],
    edtech: ['education', 'learning', 'student', 'school', 'university', 'training'],
    infrastructure: ['infrastructure', 'developer', 'api', 'sdk', 'tooling', 'protocol'],
    payments: ['payment', 'transfer', 'remittance', 'cross-border', 'transaction'],
    defi: ['defi', 'decentralised', 'lending', 'borrowing', 'yield', 'liquidity'],
    logistics: ['logistics', 'supply chain', 'delivery', 'shipping', 'transport'],
    marketplace: ['marketplace', 'platform', 'two-sided', 'buyer', 'seller'],
    stellar: ['stellar', 'soroban', 'xlm', 'lumens', 'horizon'],
  };

  for (const sector of investorSectors) {
    if (sector === 'any') { score += 10; continue; }
    const keywords = sectorKeywords[sector];
    if (!keywords) continue;
    const matches = keywords.filter((kw) => pitchText.includes(kw));
    if (matches.length >= 2) { score += 25; reasons.push(`Matches ${sector} thesis`); }
    else if (matches.length === 1) { score += 10; }
  }

  return { score: Math.min(score, 40), reasons };
}

function scoreGeography(
  investorGeo: string[],
  founderLocation: string | null,
): { score: number; reason: string | null } {
  if (investorGeo.includes('Global')) return { score: 15, reason: 'Invests globally' };
  if (!founderLocation) return { score: 5, reason: null };

  const loc = founderLocation.toLowerCase();
  for (const geo of investorGeo) {
    const g = geo.toLowerCase();
    if (loc.includes(g) || (g.includes('africa') && loc.includes('afric')) ||
        (g.includes('nigeria') && loc.includes('nigeria')) ||
        (g.includes('west africa') && (loc.includes('nigeria') || loc.includes('ghana')))) {
      return { score: 15, reason: `Invests in ${geo}` };
    }
  }
  return { score: 3, reason: null };
}

// ─── Main matching function ───────────────────────────────

export async function matchInvestors(founderId: string, limit = 10): Promise<InvestorMatch[]> {
  const { data: founder } = await supabaseAdmin
    .from('founders')
    .select('*')
    .eq('id', founderId)
    .single();

  if (!founder) return [];

  const { data: topPitch } = await supabaseAdmin
    .from('pitches')
    .select('*')
    .eq('founder_id', founderId)
    .in('status', ['in_progress', 'complete'])
    .order('overall_score', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: allInvestors } = await supabaseAdmin
    .from('investors')
    .select('*');

  if (!allInvestors) return [];

  const pitchData: Record<string, unknown> = {};
  if (topPitch) {
    for (const key of ['problem', 'solution', 'traction', 'team', 'market', 'ask']) {
      if (topPitch[key]) pitchData[key] = topPitch[key];
    }
  }

  const matches: InvestorMatch[] = allInvestors.map((investor) => {
    const reasons: string[] = [];
    let totalScore = 0;

    const stageFit = scoreStage(investor.stages, topPitch?.status, topPitch?.overall_score);
    totalScore += stageFit.score;
    if (stageFit.reason) reasons.push(stageFit.reason);

    const sectorFit = scoreSectors(investor.sectors, pitchData);
    totalScore += sectorFit.score;
    reasons.push(...sectorFit.reasons);

    const geoFit = scoreGeography(investor.geography, founder.location);
    totalScore += geoFit.score;
    if (geoFit.reason) reasons.push(geoFit.reason);

    if (topPitch?.overall_score != null) {
      const estimatedRaise = 150000;
      if (investor.min_check != null && investor.max_check != null &&
          estimatedRaise >= investor.min_check && estimatedRaise <= investor.max_check) {
        totalScore += 15;
        reasons.push('Check size aligns');
      } else if (investor.min_check == null || investor.max_check == null) {
        totalScore += 8;
      }
    }

    const tags: string[] = [];
    if (investor.stages.includes('pre_seed') || investor.stages.includes('seed')) tags.push('Early stage');
    if (investor.sectors.some((s: string) => ['africa', 'nigeria', 'kenya'].includes(s))) tags.push('Africa focus');
    if (investor.sectors.some((s: string) => ['web3', 'blockchain', 'stellar', 'defi'].includes(s))) tags.push('Web3 native');
    if (investor.geography.includes('Global')) tags.push('Global');

    return { investor, score: Math.min(Math.round(totalScore), 100), reasons: reasons.slice(0, 3), tags };
  });

  return matches.filter((m) => m.score > 10).sort((a, b) => b.score - a.score).slice(0, limit);
}

// ─── Connection management ────────────────────────────────

export async function getConnections(founderId: string) {
  const { data, error } = await supabaseAdmin
    .from('investor_connections')
    .select('*, investor:investors(*)')
    .eq('founder_id', founderId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function requestConnection(founderId: string, investorId: string, message?: string) {
  const { data: investor } = await supabaseAdmin
    .from('investors')
    .select('id')
    .eq('id', investorId)
    .single();

  if (!investor) throw new Error('Investor not found');

  const { data, error } = await supabaseAdmin
    .from('investor_connections')
    .upsert(
      { founder_id: founderId, investor_id: investorId, message, status: 'pending' },
      { onConflict: 'founder_id,investor_id' }
    )
    .select('*, investor:investors(*)')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function listAllInvestors(params: {
  sector?: string;
  stage?: string;
  geography?: string;
  limit?: number;
  offset?: number;
}) {
  const { sector, stage, geography, limit = 20, offset = 0 } = params;

  let query = supabaseAdmin.from('investors').select('*', { count: 'exact' });

  if (sector) query = query.contains('sectors', [sector]);
  if (stage) query = query.contains('stages', [stage]);
  if (geography) query = query.contains('geography', [geography]);

  const { data: investors, count, error } = await query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return { investors, total: count ?? 0, limit, offset };
}