import { z } from 'zod';
const obj = z.object({ a: z.string() });
console.log(obj._def.typeName);
console.log(z.string()._def.typeName);
