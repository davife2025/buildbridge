export interface PitchSection {
  title: string;
  content: string;
  score?: number; // AI quality score 0-100
  suggestions?: string[];
}

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
