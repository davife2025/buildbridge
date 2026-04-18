import type { Metadata } from 'next';
import { ProfileContent } from './profile-content';
interface Props { params: { id: string } }
export const metadata: Metadata = { title: 'Founder Profile' };
export default function ProfilePage({ params }: Props) { return <ProfileContent founderId={params.id} />; }
