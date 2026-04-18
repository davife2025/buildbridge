import type { Metadata } from 'next';
import { PitchEditor } from './pitch-editor';
export const metadata: Metadata = { title: 'Edit Pitch' };
export default function PitchEditorPage({ params }: { params: { id: string } }) {
  return <PitchEditor pitchId={params.id} />;
}
