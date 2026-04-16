import { SECTION_KEYS } from '../lib/pitch-service';

// Mock Anthropic SDK so tests never hit the real API
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                overallScore: 72,
                feedback: 'Strong problem, solution needs more differentiation.',
                strengths: ['Clear problem statement', 'Good market sizing'],
                improvements: ['Add traction metrics', 'Specify funding ask breakdown'],
              }),
            },
          ],
        }),
        stream: jest.fn().mockReturnValue({
          [Symbol.asyncIterator]: async function* () {
            const chunks = ['{"title":"The', ' Problem","content":"Founders struggle","score":75,"suggestions":["Be more specific"]}'];
            for (const chunk of chunks) {
              yield {
                type: 'content_block_delta',
                delta: { type: 'text_delta', text: chunk },
              };
            }
          },
        }),
      },
    })),
  };
});

// Mock Prisma
jest.mock('../db/client', () => ({
  prisma: {
    pitch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pitchVersion: {
      create: jest.fn(),
    },
  },
}));

describe('pitch-service constants', () => {
  it('exports all 6 section keys', () => {
    expect(SECTION_KEYS).toHaveLength(6);
    expect(SECTION_KEYS).toContain('problem');
    expect(SECTION_KEYS).toContain('solution');
    expect(SECTION_KEYS).toContain('traction');
    expect(SECTION_KEYS).toContain('team');
    expect(SECTION_KEYS).toContain('market');
    expect(SECTION_KEYS).toContain('ask');
  });
});

describe('scorePitch', () => {
  it('calls Claude and returns a structured score object', async () => {
    const { scorePitch } = await import('../lib/pitch-service');

    const result = await scorePitch({
      projectName: 'BuildBridge',
      problem: { content: 'Founders in Africa can not pitch effectively' },
    });

    expect(result.overallScore).toBe(72);
    expect(result.strengths).toHaveLength(2);
    expect(result.improvements).toHaveLength(2);
    expect(typeof result.feedback).toBe('string');
  });
});

describe('streamSectionRefinement', () => {
  it('accumulates chunks and returns parsed section data', async () => {
    const { streamSectionRefinement } = await import('../lib/pitch-service');

    const chunks: string[] = [];

    const result = await streamSectionRefinement({
      section: 'problem',
      founderInput: 'Founders in Africa struggle to pitch to investors',
      onChunk: (chunk) => chunks.push(chunk),
    });

    expect(chunks.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('suggestions');
    expect(Array.isArray(result.suggestions)).toBe(true);
  });
});
