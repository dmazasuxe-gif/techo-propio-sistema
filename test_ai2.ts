import { asignarBeneficiarioAMaestro } from './lib/ai-tools';

async function test() {
  try {
    const res = await asignarBeneficiarioAMaestro.execute({
      beneficiario: 'Yoar Daniel Maza Suxe',
      maestro: 'Daniel Maza Suxe'
    });
    console.log('RESULTADO_EXITO:', JSON.stringify(res, null, 2));
  } catch(e: any) {
    console.error('ERROR CATCH:', e.message);
  }
}
test();
