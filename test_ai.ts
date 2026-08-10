const { getDb } = require('./lib/db.ts');
const { asignarBeneficiarioAMaestro } = require('./lib/ai-tools.ts');

async function test() {
  try {
    const res = await asignarBeneficiarioAMaestro.execute({
      beneficiarioQuery: 'Yoar Daniel Maza Suxe',
      maestroQuery: 'Daniel Maza Suxe'
    });
    console.log(JSON.stringify(res, null, 2));
  } catch(e) {
    console.error('ERROR:', e);
  }
}
test();
