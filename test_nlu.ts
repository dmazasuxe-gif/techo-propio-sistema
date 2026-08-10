import { config } from 'dotenv';
config({ path: '.env.local' });
import { processUserMessage } from './lib/nlu-engine';

async function test() {
  try {
    console.log('Iniciando simulacion de NLU...');
    const reply = await processUserMessage(999999, 'Asigna a Yoar Daniel Maza Suxe al maestro Daniel Maza Suxe');
    console.log('RESPUESTA DEL BOT:', reply);
  } catch(e: any) {
    console.error('ERROR CATCH:', e);
  }
}
test();
