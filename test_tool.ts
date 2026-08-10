import { tool } from 'ai';
import { z } from 'zod';
const t = tool({
  description: 'test',
  parameters: z.object({}),
  execute: async () => "ok"
});
console.log(Object.keys(t));
