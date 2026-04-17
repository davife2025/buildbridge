import { HfInference } from '@huggingface/inference';
import type { PitchData, PitchSection, PitchSectionKey, PitchScoreResult } from './types';

// Kimi K2 model ID on HuggingFace
const MODEL_ID = 'moonshotai/Kimi-K2-Instruct';

const SYSTEM_PROMPT = `You are BuildBridge's pitch coach — an expert in startup fundraising who helps founders from emerging markets communicate their vision to VCs and investors.

You are direct, specific, and investor-minded. You know what early-stage investors look for:
- Clear, evidence-backed problem with real market pain
- Differentiated solution with a clear "why now" and "why this team"
- Traction evidence — even small signals count
- Credible, committed team with domain expertise
- Realistic market sizing with a credible go-to-market wedge
- Specific funding ask with clear use of funds and milestones

Always respond ONLY with valid JSON — no markdown fences, no preamble, no explanation.`;

const SECTION_GUIDANCE: Record<PitchSectionKey, string> = {
  problem: `Refine the PROBLEM section. Great problem statements: (1) name a specific painful problem with evidence, (2) quantify the cost or frequency, (3) show why existing solutions fail.`,
  solution: `Refine the SOLUTION section. Great solutions: (1) directly address the stated problem, (2) explain the mechanism, (3) articulate the key differentiator, (4) explain why NOW is the right time.`,
  traction: `Refine the TRACTION section. Show momentum: MAU/DAU, revenue, paying customers, pilots, waitlist, partnerships, or on-chain activity. Be specific with numbers.`,
  team: `Refine the TEAM section. Highlight domain expertise, prior startup experience, technical depth, and why this team is uniquely suited to win this specific problem.`,
  market: `Refine the MARKET section. Include TAM, SAM, SOM with bottom-up estimates. Name the beachhead segment and explain the go-to-market wedge for the first 100 customers.`,
  ask: `Refine the ASK section. Be specific: exact amount, breakdown by category (engineering X%, marketing Y%, ops Z%), what milestones this unlocks, and success metrics in 18 months.`,
};

export class PitchAgent {
  private client: HfInference;

  constructor(apiKey?: string) {
    this.client = new HfInference(apiKey ?? process.env['HF_API_KEY']);
  }

  /**
   * Calls Kimi K2 via HuggingFace Inference API.
   * Returns the response text.
   */
  private async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.chatCompletion({
      model: MODEL_ID,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content ?? '{}';
  }

  /**
   * Refine a single pitch section with Kimi K2 coaching.
   */
  async refineSection(
    section: PitchSectionKey,
    founderInput: string,
    existingPitch?: Partial<PitchData>,
  ): Promise<PitchSection> {
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

    const raw = await this.chat(SYSTEM_PROMPT, userMessage);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as PitchSection;
  }

  /**
   * Score an entire pitch deck using Kimi K2.
   */
  async scorePitch(pitch: Partial<PitchData>): Promise<PitchScoreResult> {
    const userMessage = `Score this startup pitch from an early-stage investor's perspective.

Pitch:
${JSON.stringify(pitch, null, 2)}

Respond ONLY with this JSON (no markdown):
{
  "overallScore": <integer 0-100>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<most important fix>", "<second most important fix>"]
}`;

    const raw = await this.chat(SYSTEM_PROMPT, userMessage);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as PitchScoreResult;
  }
}
