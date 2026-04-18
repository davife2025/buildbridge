import type { Metadata } from 'next';
import { MilestonesContent } from './milestones-content';
export const metadata: Metadata = { title: 'Milestones' };
export default function MilestonesPage() { return <MilestonesContent />; }
