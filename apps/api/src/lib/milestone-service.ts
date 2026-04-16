import { prisma } from '../db/client';
import { createMilestoneContract } from '@buildbridge/stellar';
import type { MilestoneCategory } from '@prisma/client';

const VALID_CATEGORIES: MilestoneCategory[] = [
  'product', 'traction', 'funding', 'team', 'partnership', 'other',
];

export { VALID_CATEGORIES };

// ─── DB operations ────────────────────────────────────────

export async function listMilestones(founderId: string) {
  return prisma.milestone.findMany({
    where: { founderId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMilestone(id: string, founderId: string) {
  return prisma.milestone.findFirst({ where: { id, founderId } });
}

export async function createMilestoneRecord(params: {
  founderId: string;
  title: string;
  description?: string;
  category: MilestoneCategory;
}) {
  return prisma.milestone.create({
    data: {
      founderId: params.founderId,
      title: params.title,
      description: params.description,
      category: params.category,
    },
  });
}

export async function confirmMilestoneOnChain(
  milestoneId: string,
  founderId: string,
  txHash: string,
  onChainId: number,
  contractId: string,
) {
  return prisma.milestone.update({
    where: { id: milestoneId, founderId },
    data: {
      txHash,
      onChainId,
      contractId,
      verifiedAt: new Date(),
    },
  });
}

export async function deleteMilestone(id: string, founderId: string) {
  return prisma.milestone.delete({ where: { id, founderId } });
}

// ─── Contract operations ──────────────────────────────────

/**
 * Builds the unsigned Soroban XDR for recording a milestone on-chain.
 * The frontend must sign this with Freighter and then call /submit.
 */
export async function buildMilestoneTx(params: {
  founderPublicKey: string;
  title: string;
  category: string;
  network: 'testnet' | 'mainnet';
}): Promise<string> {
  const contract = createMilestoneContract(params.network);
  return contract.buildRecordMilestoneTx({
    founderPublicKey: params.founderPublicKey,
    title: params.title,
    category: params.category,
  });
}

/**
 * Submits a signed XDR to Stellar and confirms on-chain.
 * Updates the DB record with txHash and onChainId.
 */
export async function submitMilestoneTx(params: {
  signedXdr: string;
  milestoneId: string;
  founderId: string;
  network: 'testnet' | 'mainnet';
}): Promise<{ txHash: string; onChainId: number }> {
  const contract = createMilestoneContract(params.network);
  const contractId = process.env['MILESTONE_CONTRACT_ID'] ?? '';

  const { txHash, onChainId } = await contract.submitRecordMilestone(params.signedXdr);

  await confirmMilestoneOnChain(
    params.milestoneId,
    params.founderId,
    txHash,
    onChainId,
    contractId,
  );

  return { txHash, onChainId };
}
