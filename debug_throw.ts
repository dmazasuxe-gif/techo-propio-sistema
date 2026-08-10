import { config } from 'dotenv';
config({ path: '.env.local' });
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';

async function test() {
  const result = await generateText({
    model: openai('gpt-4o'),
    system: 'Asigna a Yoar Daniel al maestro Daniel Maza.',
    messages: [ { role: 'user', content: 'hazlo' } ],
    tools: {
      asignar: tool({
        description: 'Asigna un beneficiario a un maestro.',
        parameters: {
          type: "object",
          properties: {
            beneficiario: { type: "string" },
            maestro: { type: "string" }
          },
          required: ["beneficiario", "maestro"]
        } as any
      })
    }
  });
  console.log("TOOL CALLS:", JSON.stringify(result.toolCalls, null, 2));
}
test();
