import type { Metadata } from 'next';
import { ProfileContent } from './profile-content';

interface Props { params: { id: string } }

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/api/profiles/${params.id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: 'Founder Profile | BuildBridge' };
    const profile = await res.json() as { name: string | null; bio: string | null; onChainMilestoneCount: number; topPitch: { projectName: string } | null };
    const name = profile.name ?? 'A founder';
    const title = profile.topPitch ? `${name} — ${profile.topPitch.projectName} | BuildBridge` : `${name} | BuildBridge`;
    const description = profile.bio ?? `${name} is building on Stellar with ${profile.onChainMilestoneCount} on-chain milestones.`;
    return {
      title, description,
      openGraph: { title, description, type: 'profile', url: `https://buildbridge.xyz/profile/${params.id}`, siteName: 'BuildBridge' },
      twitter: { card: 'summary', title, description },
    };
  } catch {
    return { title: 'Founder Profile | BuildBridge' };
  }
}

export default function ProfilePage({ params }: Props) {
  return <ProfileContent founderId={params.id} />;
}
