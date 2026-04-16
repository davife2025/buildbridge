# @buildbridge/ai

Claude-powered agentic pitch builder for BuildBridge.

## Usage

### Refine a pitch section
```ts
import { PitchAgent } from '@buildbridge/ai';

const agent = new PitchAgent(process.env.ANTHROPIC_API_KEY);

const refined = await agent.refineSection('problem', `
  Most African founders can't raise money because they don't know
  how to pitch properly and don't have access to investors.
`);

console.log(refined.content);   // polished investor-ready text
console.log(refined.score);     // 0–100 quality score
console.log(refined.suggestions); // ["Be more specific about market size", ...]
```

### Score a full pitch
```ts
const result = await agent.scorePitch(pitch);
console.log(result.overallScore);   // 72
console.log(result.strengths);      // ["Clear problem", "Strong team"]
console.log(result.improvements);   // ["Quantify market size", "Add traction metrics"]
```

## Pitch sections

| Key | Description |
|---|---|
| `problem` | The pain point being solved |
| `solution` | How BuildBridge solves it |
| `traction` | Evidence of demand/progress |
| `team` | Why this team can win |
| `market` | TAM/SAM/SOM + go-to-market |
| `ask` | Funding amount + use of funds |

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
```
