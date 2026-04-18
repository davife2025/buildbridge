import { supabaseAdmin } from '../db/supabase';
import { createMilestoneContract } from '@buildbridge/stellar';

export type MilestoneCategory = 'product' | 'traction' | 'funding' | 'team' | 'partnership' | 'other';

export const VALID_CATEGORIES: MilestoneCategory[] = [
  'product', 'traction', 'funding', 'team', 'partnership', 'other',
];

// ─── DB operations ────────────────────────────────────────

export async function listMilestones(founderId: string) {
  const { data, error } = await supabaseAdmin
    .from('milestones')
    .select('*')
    .eq('founder_id', founderId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getMilestone(id: string, founderId: string) {
  const { data } = await supabaseAdmin
    .from('milestones')
    .select('*')
    .eq('id', id)
    .eq('founder_id', founderId)
    .maybeSingle();

  return data;
}

export async function createMilestoneRecord(params: {
  founderId: string;
  title: string;
  description?: string;
  category: MilestoneCategory;
}) {
  const { data, error } = await supabaseAdmin
    .from('milestones')
    .insert({
      founder_id: params.founderId,
      title: params.title,
      description: params.description,
      category: params.category,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function confirmMilestoneOnChain(
  milestoneId: string,
  founderId: string,
  txHash: string,
  onChainId: number,
  contractId: string,
) {
  const { data, error } = await supabaseAdmin
    .from('milestones')
    .update({ tx_hash: txHash, on_chain_id: onChainId, contract_id: contractId, verified_at: new Date().toISOString() })
    .eq('id', milestoneId)
    .eq('founder_id', founderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMilestone(id: string, founderId: string) {
  const { error } = await supabaseAdmin
    .from('milestones')
    .delete()
    .eq('id', id)
    .eq('founder_id', founderId);

  if (error) throw new Error(error.message);
}

// ─── Contract operations (unchanged) ─────────────────────

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

export async function submitMilestoneTx(params: {
  signedXdr: string;
  milestoneId: string;
  founderId: string;
  network: 'testnet' | 'mainnet';
}): Promise<{ txHash: string; onChainId: number }> {
  const contract = createMilestoneContract(params.network);
  const contractId = process.env['MILESTONE_CONTRACT_ID'] ?? '';

  const { txHash, onChainId } = await contract.submitRecordMilestone(params.signedXdr);

  await confirmMilestoneOnChain(params.milestoneId, params.founderId, txHash, onChainId, contractId);

  return { txHash, onChainId };
}