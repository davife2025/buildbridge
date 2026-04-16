// Pitch section — one block of the pitch deck
export interface PitchSection {
  title: string;
  content: string;
  score: number;       // 0–100 AI quality score
  suggestions: string[]; // improvement tips
}

// Full pitch data model
export interface PitchData {
  projectName: string;
  tagline: string;
  problem: PitchSection;
  solution: PitchSection;
  traction: PitchSection;
  team: PitchSection;
  market: PitchSection;
  ask: PitchSection;
  overallScore?: number;
}

// Keys of the section fields only
export type PitchSectionKey = keyof Omit<PitchData, 'projectName' | 'tagline' | 'overallScore'>;

export const PITCH_SECTIONS: PitchSectionKey[] = [
  'problem',
  'solution',
  'traction',
  'team',
  'market',
  'ask',
];

// Investor match result
export interface InvestorMatch {
  investorId: string;
  score: number;       // 0–100 match score
  reasons: string[];   // why this investor matches
}

// Pitch score response
export interface PitchScoreResult {
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}
