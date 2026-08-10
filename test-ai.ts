import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const { processUserMessage } = await import('./lib/nlu-engine');
  console.log('Enviando mensaje...');
  const res = await processUserMessage('99999', 'Hola, ¿puedes buscar a un beneficiario llamado Juan?');
  console.log('Respuesta:', res);
}
test();
