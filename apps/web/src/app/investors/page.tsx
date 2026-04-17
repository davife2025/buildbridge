import type { Metadata } from 'next';
import { InvestorsContent } from './investors-content';
export const metadata: Metadata = { title: 'Investors' };
export default function InvestorsPage() { return <InvestorsContent />; }
