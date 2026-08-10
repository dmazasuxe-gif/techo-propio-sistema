import { processUserMessage } from './lib/nlu-engine.js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  console.log('Enviando mensaje...');
  const res = await processUserMessage('99999', 'Hola, ¿puedes buscar a un beneficiario llamado Juan?');
  console.log('Respuesta:', res);
}
test();
