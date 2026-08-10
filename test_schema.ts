import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

console.log("z.any:", JSON.stringify(zodToJsonSchema(z.any())));
console.log("z.string:", JSON.stringify(zodToJsonSchema(z.string())));
console.log("z.record:", JSON.stringify(zodToJsonSchema(z.record(z.string()))));
console.log("z.array:", JSON.stringify(zodToJsonSchema(z.array(z.string()))));
