import { prisma } from '../db/client';
import type { Investor, Pitch, Founder } from '@prisma/client';

export interface InvestorMatch {
  investor: Investor;
  score: number;        // 0–100 match score
  reasons: string[];    // human-readable match explanations
  tags: string[];       // highlight tags shown on the card
}

interface FounderContext {
  founder: Founder;
  pitch: Pitch | null;
}

// ─── Scoring helpers ──────────────────────────────────────

function scoreStage(
  investorStages: string[],
  pitchStatus: string | undefined,
  pitchScore: number | null | undefined,
): { score: number; reason: string | null } {
  // Infer founder stage from pitch completion
  let founderStage: string;
  if (!pitchStatus || pitchStatus === 'draft') founderStage = 'pre_seed';
  else if (pitchScore !== null && pitchScore !== undefined && pitchScore >= 70) founderStage = 'seed';
  else founderStage = 'pre_seed';

  if (investorStages.includes(founderStage) || investorStages.includes('any')) {
    return { score: 30, reason: `Invests at ${founderStage.replace('_', '-')} stage` };
  }
  if (
    founderStage === 'pre_seed' &&
    (investorStages.includes('seed') || investorStages.includes('series_a'))
  ) {
    return { score: 10, reason: null }; // not ideal but not ruled out
  }
  return { score: 0, reason: null };
}

function scoreSectors(
  investorSectors: string[],
  pitchContent: Record<string, unknown> | null,
): { score: number; reasons: string[] } {
  if (!pitchContent) return { score: 0, reasons: [] };

  // Extract keywords from pitch content
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
    if (sector === 'any') {
      score += 10;
      continue;
    }
    const keywords = sectorKeywords[sector];
    if (!keywords) continue;

    const matches = keywords.filter((kw) => pitchText.includes(kw));
    if (matches.length >= 2) {
      score += 25;
      reasons.push(`Matches ${sector} thesis`);
    } else if (matches.length === 1) {
      score += 10;
    }
  }

  return { score: Math.min(score, 40), reasons };
}

function scoreGeography(
  investorGeo: string[],
  founderLocation: string | null,
): { score: number; reason: string | null } {
  if (investorGeo.includes('Global')) {
    return { score: 15, reason: 'Invests globally' };
  }
  if (!founderLocation) return { score: 5, reason: null };

  const loc = founderLocation.toLowerCase();
  for (const geo of investorGeo) {
    const geoLower = geo.toLowerCase();
    if (
      loc.includes(geoLower) ||
      geoLower.includes('africa') && loc.includes('afric') ||
      geoLower.includes('nigeria') && loc.includes('nigeria') ||
      geoLower.includes('west africa') && (loc.includes('nigeria') || loc.includes('ghana'))
    ) {
      return { score: 15, reason: `Invests in ${geo}` };
    }
  }
  return { score: 3, reason: null };
}

// ─── Main matching function ───────────────────────────────

export async function matchInvestors(
  founderId: string,
  limit = 10,
): Promise<InvestorMatch[]> {
  // Load founder context
  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
  });
  if (!founder) return [];

  const topPitch = await prisma.pitch.findFirst({
    where: { founderId, status: { in: ['in_progress', 'complete'] } },
    orderBy: [{ overallScore: 'desc' }, { updatedAt: 'desc' }],
  });

  const allInvestors = await prisma.investor.findMany();

  const pitchData: Record<string, unknown> = {};
  if (topPitch) {
    for (const key of ['problem', 'solution', 'traction', 'team', 'market', 'ask']) {
      if (topPitch[key as keyof typeof topPitch]) {
        pitchData[key] = topPitch[key as keyof typeof topPitch];
      }
    }
  }

  const matches: InvestorMatch[] = allInvestors.map((investor) => {
    const reasons: string[] = [];
    let totalScore = 0;

    // Stage fit (30 pts)
    const stageFit = scoreStage(
      investor.stages,
      topPitch?.status,
      topPitch?.overallScore,
    );
    totalScore += stageFit.score;
    if (stageFit.reason) reasons.push(stageFit.reason);

    // Sector fit (40 pts)
    const sectorFit = scoreSectors(investor.sectors, pitchData);
    totalScore += sectorFit.score;
    reasons.push(...sectorFit.reasons);

    // Geography fit (15 pts)
    const geoFit = scoreGeography(investor.geography, founder.location);
    totalScore += geoFit.score;
    if (geoFit.reason) reasons.push(geoFit.reason);

    // Check size fit (15 pts) — skip if no pitch yet
    if (topPitch?.overallScore !== null && topPitch?.overallScore !== undefined) {
      const estimatedRaise = 150000; // Default MVP ask
      if (
        investor.minCheck !== null &&
        investor.maxCheck !== null &&
        estimatedRaise >= investor.minCheck &&
        estimatedRaise <= investor.maxCheck
      ) {
        totalScore += 15;
        reasons.push('Check size aligns');
      } else if (investor.minCheck === null || investor.maxCheck === null) {
        totalScore += 8;
      }
    }

    // Build highlight tags
    const tags: string[] = [];
    if (investor.stages.includes('pre_seed') || investor.stages.includes('seed')) {
      tags.push('Early stage');
    }
    if (investor.sectors.some((s) => ['africa', 'nigeria', 'kenya'].includes(s))) {
      tags.push('Africa focus');
    }
    if (investor.sectors.some((s) => ['web3', 'blockchain', 'stellar', 'defi'].includes(s))) {
      tags.push('Web3 native');
    }
    if (investor.geography.includes('Global')) tags.push('Global');

    return {
      investor,
      score: Math.min(Math.round(totalScore), 100),
      reasons: reasons.slice(0, 3),
      tags,
    };
  });

  // Sort by score descending
  return matches
    .filter((m) => m.score > 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Connection management ────────────────────────────────

export async function getConnections(founderId: string) {
  return prisma.investorConnection.findMany({
    where: { founderId },
    include: { investor: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function requestConnection(
  founderId: string,
  investorId: string,
  message?: string,
) {
  // Check if investor exists
  const investor = await prisma.investor.findUnique({ where: { id: investorId } });
  if (!investor) throw new Error('Investor not found');

  // Upsert — prevent duplicate requests
  return prisma.investorConnection.upsert({
    where: { founderId_investorId: { founderId, investorId } },
    create: { founderId, investorId, message, status: 'pending' },
    update: { message, status: 'pending' },
    include: { investor: true },
  });
}

export async function listAllInvestors(params: {
  sector?: string;
  stage?: string;
  geography?: string;
  limit?: number;
  offset?: number;
}) {
  const { sector, stage, geography, limit = 20, offset = 0 } = params;

  const where: Record<string, unknown> = {};
  if (sector) where['sectors'] = { has: sector };
  if (stage) where['stages'] = { has: stage };
  if (geography) where['geography'] = { has: geography };

  const [investors, total] = await Promise.all([
    prisma.investor.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.investor.count({ where }),
  ]);

  return { investors, total, limit, offset };
}
