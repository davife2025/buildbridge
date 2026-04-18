import { supabaseAdmin } from '../db/supabase';

export async function getPublicProfile(founderId: string) {
  const { data: founder, error } = await supabaseAdmin
    .from('founders')
    .select(`
      *,
      pitches:pitches(
        id, project_name, tagline, overall_score,
        problem, solution, traction, team, market, ask,
        status, updated_at
      ),
      milestones:milestones(
        id, title, description, category,
        tx_hash, on_chain_id, contract_id, verified_at, created_at
      )
    `)
    .eq('id', founderId)
    .eq('pitches.status', 'complete')
    .order('overall_score', { referencedTable: 'pitches', ascending: false })
    .order('created_at', { referencedTable: 'milestones', ascending: false })
    .single();

  if (error || !founder) return null;

  let completeness = 0;
  if (founder.name) completeness += 15;
  if (founder.bio) completeness += 15;
  if (founder.location) completeness += 10;
  if (founder.avatar_url) completeness += 10;
  if (founder.twitter_handle || founder.linkedin_url) completeness += 10;
  if (founder.website_url) completeness += 10;
  if (founder.pitches?.length > 0) completeness += 20;
  if (founder.milestones?.some((m: { tx_hash: string | null }) => m.tx_hash)) completeness += 10;

  return {
    id: founder.id,
    publicKey: founder.stellar_public_key,
    network: founder.network,
    name: founder.name,
    bio: founder.bio,
    location: founder.location,
    avatarUrl: founder.avatar_url,
    twitterHandle: founder.twitter_handle,
    githubHandle: founder.github_handle,
    linkedinUrl: founder.linkedin_url,
    websiteUrl: founder.website_url,
    completeness,
    pitchCount: founder.pitches?.length ?? 0,
    milestoneCount: founder.milestones?.length ?? 0,
    onChainMilestoneCount: founder.milestones?.filter((m: { tx_hash: string | null }) => m.tx_hash).length ?? 0,
    topPitch: founder.pitches?.[0] ?? null,
    milestones: founder.milestones ?? [],
    joinedAt: founder.created_at,
  };
}

export async function searchFounders(query: string, limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('founders')
    .select(`
      id, name, stellar_public_key, bio, location, avatar_url,
      pitches(count),
      milestones(count)
    `)
    .or(`name.ilike.%${query}%,stellar_public_key.ilike.%${query}%`)
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}