import { config } from 'dotenv';
config({ path: '.env.local' });
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function test() {
  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'Eres un asistente. Asigna beneficiarios a maestros INMEDIATAMENTE con los nombres proporcionados.',
    messages: [
      { role: 'user', content: 'Asigna a Yoar Daniel Maza Suxe al maestro Daniel Maza Suxe' }
    ],
    tools: {
      asignar_beneficiario_a_maestro: tool({
        description: 'Asigna un beneficiario a un maestro.',
        parameters: z.object({
          beneficiario: z.string().describe('Nombre del beneficiario'),
          maestro: z.string().describe('Nombre del maestro')
        }),
        execute: async (args) => {
          console.log("TOOL EXECUTED WITH:", args);
          return "Éxito";
        }
      })
    },
    maxSteps: 2
  });

  console.log("FINAL TEXT:", result.text);
}
test();
