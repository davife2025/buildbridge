import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../db/client';
import type { PitchStatus } from '@prisma/client';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

// ─── Types ────────────────────────────────────────────────

export interface PitchSectionData {
  title: string;
  content: string;
  score: number;
  suggestions: string[];
}

export type SectionKey = 'problem' | 'solution' | 'traction' | 'team' | 'market' | 'ask';

export const SECTION_KEYS: SectionKey[] = [
  'problem', 'solution', 'traction', 'team', 'market', 'ask',
];

// ─── Prompts ──────────────────────────────────────────────

const SYSTEM_PROMPT = `You are BuildBridge's pitch coach — an expert in startup fundraising who helps founders from emerging markets communicate their vision to VCs and investors.

You are direct, specific, and investor-minded. You know what early-stage investors look for:
- Clear, evidence-backed problem with real market pain
- Differentiated solution with a clear "why now" and "why this team"
- Traction evidence — even small signals count
- Credible, committed team with domain expertise
- Realistic market sizing with a credible go-to-market wedge
- Specific funding ask with clear use of funds and milestones

Always respond ONLY with valid JSON — no markdown fences, no preamble.`;

const SECTION_GUIDANCE: Record<SectionKey, string> = {
  problem: `Refine the PROBLEM section. Great problem statements: (1) name a specific, painful problem with evidence, (2) quantify the cost or frequency, (3) show why existing solutions fail. Avoid generic statements like "X is hard". Be specific.`,
  solution: `Refine the SOLUTION section. Great solutions: (1) directly address the stated problem, (2) explain the mechanism clearly, (3) articulate the key differentiator vs alternatives, (4) explain why NOW is the right time.`,
  traction: `Refine the TRACTION section. Show momentum investors can believe in: MAU/DAU, revenue, paying customers, pilots, partnerships, waitlist size, on-chain activity, or notable technical milestones. Even early signals matter — be specific with numbers.`,
  team: `Refine the TEAM section. Investors back people as much as ideas. Highlight: relevant domain expertise, prior startup experience, technical depth, and what makes this team uniquely suited to win this specific problem.`,
  market: `Refine the MARKET section. Include TAM, SAM, SOM with realistic bottom-up estimates. Explain the go-to-market wedge — exactly how you win your first 100 customers. Name the beachhead segment.`,
  ask: `Refine the ASK section. Be specific: exact amount, breakdown by category (engineering X%, marketing Y%, ops Z%), what milestones this unlocks, and what success looks like in 18 months. Investors want to see capital efficiency.`,
};

// ─── Core Functions ───────────────────────────────────────

/**
 * Streams Claude's refinement of a pitch section.
 * Calls onChunk with each text delta for SSE streaming.
 * Returns the full accumulated JSON on completion.
 */
export async function streamSectionRefinement(params: {
  section: SectionKey;
  founderInput: string;
  existingPitch?: Record<string, unknown>;
  onChunk: (chunk: string) => void;
}): Promise<PitchSectionData> {
  const { section, founderInput, existingPitch, onChunk } = params;

  const contextBlock = existingPitch
    ? `\n\nContext from already-completed sections:\n${JSON.stringify(existingPitch, null, 2)}`
    : '';

  const userMessage = `${SECTION_GUIDANCE[section]}

Founder's input:
"${founderInput}"
${contextBlock}

Respond ONLY with this JSON object (no markdown, no preamble):
{
  "title": "<short section title>",
  "content": "<polished 2-4 sentence investor-ready text>",
  "score": <integer 0-100>,
  "suggestions": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

  let accumulated = '';

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      accumulated += event.delta.text;
      onChunk(event.delta.text);
    }
  }

  const cleaned = accumulated.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as PitchSectionData;
}

/**
 * Scores a complete pitch using Claude.
 * Returns overall score, feedback, strengths, and top improvements.
 */
export async function scorePitch(pitch: Record<string, unknown>): Promise<{
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Score this startup pitch from an early-stage investor's perspective.

Pitch data:
${JSON.stringify(pitch, null, 2)}

Respond ONLY with this JSON (no markdown):
{
  "overallScore": <integer 0-100>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<most important fix>", "<second most important fix>"]
}`,
      },
    ],
  });

  const raw = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as {
    overallScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

// ─── DB Helpers ───────────────────────────────────────────

export async function createPitch(founderId: string, projectName: string, tagline?: string) {
  return prisma.pitch.create({
    data: { founderId, projectName, tagline, status: 'draft' },
  });
}

export async function getPitch(pitchId: string, founderId: string) {
  return prisma.pitch.findFirst({
    where: { id: pitchId, founderId },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });
}

export async function listPitches(founderId: string) {
  return prisma.pitch.findMany({
    where: { founderId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      projectName: true,
      tagline: true,
      status: true,
      overallScore: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updatePitchSection(
  pitchId: string,
  founderId: string,
  section: SectionKey,
  data: PitchSectionData,
) {
  return prisma.pitch.update({
    where: { id: pitchId, founderId },
    data: { [section]: data, status: 'in_progress' },
  });
}

export async function savePitchVersion(pitchId: string, note?: string) {
  const pitch = await prisma.pitch.findUnique({ where: { id: pitchId } });
  if (!pitch) throw new Error('Pitch not found');

  return prisma.pitchVersion.create({
    data: { pitchId, snapshot: pitch as object, note },
  });
}

export async function updatePitchScore(pitchId: string, overallScore: number) {
  return prisma.pitch.update({
    where: { id: pitchId },
    data: { overallScore, status: 'complete' },
  });
}

export async function updatePitchStatus(
  pitchId: string,
  founderId: string,
  status: PitchStatus,
) {
  return prisma.pitch.update({
    where: { id: pitchId, founderId },
    data: { status },
  });
}

export async function deletePitch(pitchId: string, founderId: string) {
  return prisma.pitch.delete({ where: { id: pitchId, founderId } });
}
