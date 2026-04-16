import { prisma } from '../db/client';

/**
 * Fetches a full public founder profile by founder ID.
 * Aggregates: founder info, pitches, milestones (on-chain only for public view).
 * Returns null if founder not found.
 */
export async function getPublicProfile(founderId: string) {
  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: {
      pitches: {
        where: { status: 'complete' },
        orderBy: { overallScore: 'desc' },
        take: 1,
        select: {
          id: true,
          projectName: true,
          tagline: true,
          overallScore: true,
          problem: true,
          solution: true,
          traction: true,
          team: true,
          market: true,
          ask: true,
          status: true,
          updatedAt: true,
        },
      },
      milestones: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          txHash: true,
          onChainId: true,
          contractId: true,
          verifiedAt: true,
          createdAt: true,
        },
      },
      _count: {
        select: { pitches: true, milestones: true },
      },
    },
  });

  if (!founder) return null;

  // Compute profile completeness score (0-100)
  let completeness = 0;
  if (founder.name) completeness += 15;
  if (founder.bio) completeness += 15;
  if (founder.location) completeness += 10;
  if (founder.avatarUrl) completeness += 10;
  if (founder.twitterHandle || founder.linkedinUrl) completeness += 10;
  if (founder.websiteUrl) completeness += 10;
  if (founder.pitches.length > 0) completeness += 20;
  if (founder.milestones.some((m) => m.txHash)) completeness += 10;

  return {
    id: founder.id,
    publicKey: founder.stellarPublicKey,
    network: founder.network,
    name: founder.name,
    bio: founder.bio,
    location: founder.location,
    avatarUrl: founder.avatarUrl,
    twitterHandle: founder.twitterHandle,
    githubHandle: founder.githubHandle,
    linkedinUrl: founder.linkedinUrl,
    websiteUrl: founder.websiteUrl,
    completeness,
    pitchCount: founder._count.pitches,
    milestoneCount: founder._count.milestones,
    onChainMilestoneCount: founder.milestones.filter((m) => m.txHash).length,
    topPitch: founder.pitches[0] ?? null,
    milestones: founder.milestones,
    joinedAt: founder.createdAt,
  };
}

/**
 * Searches founders by name or public key (for discovery).
 */
export async function searchFounders(query: string, limit = 10) {
  return prisma.founder.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { stellarPublicKey: { contains: query } },
      ],
    },
    select: {
      id: true,
      name: true,
      stellarPublicKey: true,
      bio: true,
      location: true,
      avatarUrl: true,
      _count: { select: { milestones: true, pitches: true } },
    },
    take: limit,
  });
}
