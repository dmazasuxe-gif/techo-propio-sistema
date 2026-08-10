import { config } from 'dotenv';
config({ path: '.env.local' });
import WebSocket from 'ws';
(global as any).WebSocket = WebSocket;

async function runTests() {
  const { processUserMessage } = await import('./lib/nlu-engine');
  
  const testCases = [
    {
      name: '1. Asignar Beneficiario',
      prompt: 'Asigna a Yoar Daniel Maza Suxe al maestro Daniel Maza Suxe'
    },
    {
      name: '2. Generar Ficha Beneficiario',
      prompt: 'Genera la ficha PDF de Yoar Daniel Maza Suxe'
    },
    {
      name: '3. Buscar Documentos',
      prompt: 'Busca los documentos de Yoar Daniel Maza Suxe'
    },
    {
      name: '4. Generar Ficha Maestro',
      prompt: 'Genera la ficha de Daniel Maza Suxe'
    }
  ];

  const chatId = 999999;
  console.log('=============================================');
  console.log('   INICIANDO TEST SUITE - SISTEMA IA TECHO   ');
  console.log('=============================================\n');

  for (const testCase of testCases) {
    console.log(`\n▶ EJECUTANDO PRUEBA: ${testCase.name}`);
    console.log(`💬 USUARIO: "${testCase.prompt}"`);
    try {
      const reply = await processUserMessage(chatId, testCase.prompt);
      console.log(`🤖 BOT:\n${reply}`);
    } catch (e: any) {
      console.error(`❌ ERROR EN PRUEBA: ${e.message}`);
    }
    console.log('---------------------------------------------');
    // Pequeña pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ PRUEBAS FINALIZADAS.');
}

runTests();
