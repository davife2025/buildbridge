import type { Metadata } from 'next';
import { PitchBuilderIndex } from './pitch-builder-index';

export const metadata: Metadata = { title: 'Pitch Builder' };

export default function PitchBuilderPage() {
  return <PitchBuilderIndex />;
}
