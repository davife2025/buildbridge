import Anthropic from '@anthropic-ai/sdk';
import type { PitchData, PitchSection } from './types';

/**
 * BuildBridge Pitch Agent
 * Agentic AI that guides founders through building an investor-ready pitch
 */
export class PitchAgent {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Start a guided pitch building session
   * Returns a streamed AI response for a given pitch section
   */
  async refineSection(
    section: keyof PitchData,
    founderInput: string,
    existingPitch?: Partial<PitchData>
  ): Promise<PitchSection> {
    const systemPrompt = `You are BuildBridge's pitch coach — an expert in startup fundraising who helps founders from emerging markets communicate their vision to VCs and investors. 
    
    You are direct, specific, and investor-minded. You understand what early-stage investors look for: clear problem definition, unique solution, evidence of traction, and a credible team.
    
    Always respond with structured JSON matching the PitchSection interface: { title, content, score, suggestions }`;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Help me refine the "${section}" section of my pitch deck.
          
My input: ${founderInput}

${existingPitch ? `Context from other sections: ${JSON.stringify(existingPitch, null, 2)}` : ''}

Return a JSON object with: title, content (polished investor-ready text), score (0-100), suggestions (array of improvement tips).`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  }

  /**
   * Score and provide overall pitch feedback
   */
  async scorePitch(pitch: PitchData): Promise<{ overallScore: number; feedback: string }> {
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Score this startup pitch from an investor's perspective (0-100) and give concise feedback:
          
${JSON.stringify(pitch, null, 2)}

Return JSON: { overallScore: number, feedback: string }`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  }
}
