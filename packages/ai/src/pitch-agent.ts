import Anthropic from '@anthropic-ai/sdk';
import type { PitchData, PitchSection, PitchSectionKey, PitchScoreResult } from './types';

const SYSTEM_PROMPT = `You are BuildBridge's pitch coach — an expert in startup fundraising who helps founders from emerging markets communicate their vision clearly to VCs and investors.

You are direct, specific, and investor-minded. You know what early-stage investors look for:
- A crisp problem statement with real market evidence
- A clearly differentiated solution
- Evidence of traction (even early signals count)
- A credible, committed team
- A realistic market size
- A clear and reasonable funding ask

When refining a pitch section, always respond with a JSON object — no markdown, no preamble. The object must match:
{
  "title": string,         // short section title
  "content": string,       // polished investor-ready text (2–4 sentences)
  "score": number,         // 0–100 quality score
  "suggestions": string[]  // 2–3 specific improvement tips
}`;

const SECTION_PROMPTS: Record<PitchSectionKey, string> = {
  problem: `Help refine the PROBLEM section. A great problem section: (1) is specific and evidence-backed, (2) shows market pain not just a feature gap, (3) quantifies the cost or impact of the problem.`,
  solution: `Help refine the SOLUTION section. A great solution: (1) directly addresses the stated problem, (2) is clearly differentiated from alternatives, (3) explains WHY now and WHY this team.`,
  traction: `Help refine the TRACTION section. Show momentum: users, revenue, partnerships, pilots, waitlist, or technical milestones. Investors want proof of early demand — even small signals matter.`,
  team: `Help refine the TEAM section. Investors back people as much as ideas. Highlight relevant experience, domain expertise, and what makes this team uniquely suited to solve this problem.`,
  market: `Help refine the MARKET section. Include TAM, SAM, SOM with realistic bottom-up estimates. Explain the go-to-market wedge — how you win your first 100 customers.`,
  ask: `Help refine the ASK section. Be specific: how much, what's the use of funds (breakdown by category), what milestones will it unlock, and what does success look like in 18 months.`,
};

export class PitchAgent {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey ?? process.env['ANTHROPIC_API_KEY'],
    });
  }

  /**
   * Refine a single pitch section with AI coaching.
   * Session 3 will add streaming support.
   */
  async refineSection(
    section: PitchSectionKey,
    founderInput: string,
    existingPitch?: Partial<PitchData>,
  ): Promise<PitchSection> {
    const contextBlock = existingPitch
      ? `\n\nContext from other completed sections:\n${JSON.stringify(existingPitch, null, 2)}`
      : '';

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `${SECTION_PROMPTS[section]}

Founder's input:
"${founderInput}"
${contextBlock}

Respond ONLY with a valid JSON object. No markdown, no extra text.`,
        },
      ],
    });

    const raw = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as PitchSection;
  }

  /**
   * Score an entire pitch and provide overall feedback.
   */
  async scorePitch(pitch: Partial<PitchData>): Promise<PitchScoreResult> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Score this startup pitch from an early-stage investor's perspective.

Pitch:
${JSON.stringify(pitch, null, 2)}

Respond ONLY with a valid JSON object:
{
  "overallScore": number,    // 0–100
  "feedback": string,        // 2–3 sentence overall assessment
  "strengths": string[],     // top 2–3 things working well
  "improvements": string[]   // top 2–3 most important things to fix
}`,
        },
      ],
    });

    const raw = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned) as PitchScoreResult;
  }
}
