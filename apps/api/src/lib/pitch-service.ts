import { HfInference } from '@huggingface/inference';
import { prisma } from '../db/client';
import type { PitchStatus } from '@prisma/client';

const HF_MODEL = 'moonshotai/Kimi-K2-Instruct';

function getClient() {
  return new HfInference(process.env['HF_API_KEY']);
}

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

const SYSTEM_PROMPT = `You are BuildBridge's pitch coach — an expert in startup fundraising helping founders from emerging markets communicate their vision to investors. Be direct, specific, and investor-minded. Always respond ONLY with valid JSON — no markdown fences, no preamble.`;

const SECTION_GUIDANCE: Record<SectionKey, string> = {
  problem:  `Refine the PROBLEM section. Be specific, quantify the pain, and show why existing solutions fail.`,
  solution: `Refine the SOLUTION section. Address the problem directly, explain the differentiator, and say why NOW.`,
  traction: `Refine the TRACTION section. Show momentum with specific numbers — users, revenue, pilots, partnerships.`,
  team:     `Refine the TEAM section. Highlight domain expertise and why this team uniquely wins this problem.`,
  market:   `Refine the MARKET section. Include TAM/SAM/SOM with bottom-up estimates and a clear go-to-market wedge.`,
  ask:      `Refine the ASK section. Be specific: amount, use-of-funds breakdown, milestones unlocked, 18-month success metrics.`,
};

// ─── Streaming refinement ─────────────────────────────────

/**
 * Streams Kimi K2's refinement of a pitch section via HuggingFace.
 * Calls onChunk with each text delta for SSE streaming to the frontend.
 */
export async function streamSectionRefinement(params: {
  section: SectionKey;
  founderInput: string;
  existingPitch?: Record<string, unknown>;
  onChunk: (chunk: string) => void;
}): Promise<PitchSectionData> {
  const { section, founderInput, existingPitch, onChunk } = params;
  const client = getClient();

  const contextBlock = existingPitch
    ? `\n\nContext from completed sections:\n${JSON.stringify(existingPitch, null, 2)}`
    : '';

  const userMessage = `${SECTION_GUIDANCE[section]}

Founder's input: "${founderInput}"${contextBlock}

Respond ONLY with this JSON (no markdown):
{"title":"<title>","content":"<2-4 sentence investor-ready text>","score":<0-100>,"suggestions":["<tip1>","<tip2>","<tip3>"]}`;

  let accumulated = '';

  const stream = await client.chatCompletionStream({
    model: HF_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? '';
    if (delta) {
      accumulated += delta;
      onChunk(delta);
    }
  }

  const cleaned = accumulated.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as PitchSectionData;
}

// ─── Full pitch scoring ───────────────────────────────────

export async function scorePitch(pitch: Record<string, unknown>): Promise<{
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}> {
  const client = getClient();

  const response = await client.chatCompletion({
    model: HF_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Score this pitch from an investor's perspective.

Pitch:
${JSON.stringify(pitch, null, 2)}

Respond ONLY with JSON:
{"overallScore":<0-100>,"feedback":"<2-3 sentences>","strengths":["<s1>","<s2>"],"improvements":["<i1>","<i2>"]}`,
      },
    ],
    max_tokens: 800,
    temperature: 0.2,
  });

  const raw = response.choices[0]?.message?.content ?? '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned) as {
    overallScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

// ─── DB helpers (unchanged) ───────────────────────────────

export async function createPitch(founderId: string, projectName: string, tagline?: string) {
  return prisma.pitch.create({ data: { founderId, projectName, tagline, status: 'draft' } });
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
      id: true, projectName: true, tagline: true,
      status: true, overallScore: true, createdAt: true, updatedAt: true,
    },
  });
}

export async function updatePitchSection(
  pitchId: string, founderId: string,
  section: SectionKey, data: PitchSectionData,
) {
  return prisma.pitch.update({
    where: { id: pitchId, founderId },
    data: { [section]: data, status: 'in_progress' },
  });
}

export async function savePitchVersion(pitchId: string, note?: string) {
  const pitch = await prisma.pitch.findUnique({ where: { id: pitchId } });
  if (!pitch) throw new Error('Pitch not found');
  return prisma.pitchVersion.create({ data: { pitchId, snapshot: pitch as object, note } });
}

export async function updatePitchScore(pitchId: string, overallScore: number) {
  return prisma.pitch.update({
    where: { id: pitchId },
    data: { overallScore, status: 'complete' },
  });
}

export async function updatePitchStatus(pitchId: string, founderId: string, status: PitchStatus) {
  return prisma.pitch.update({ where: { id: pitchId, founderId }, data: { status } });
}

export async function deletePitch(pitchId: string, founderId: string) {
  return prisma.pitch.delete({ where: { id: pitchId, founderId } });
}
