import WebSocket from 'ws';
(global as any).WebSocket = WebSocket;

async function test() {
  try {
    const { processUserMessage } = await import('./lib/nlu-engine');
    console.log('--- TEST: ASIGNACION ---');
    const r1 = await processUserMessage(1234567, 'Asigna a Yoar Daniel Maza Suxe al maestro Daniel Maza Suxe');
    console.log('BOT RESPONDIO:\n', r1);
  } catch(e) {
    console.error('ERROR:', e);
  }
}
test();
