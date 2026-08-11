import { resolverBeneficiario, resolverMaestro } from './lib/entity-resolution';

async function run() {
  console.log("Buscando beneficiario 40122354...");
  const res1 = await resolverBeneficiario("40122354");
  console.log("Res 1:", res1);
  
  console.log("Buscando beneficiario Vilma Milian Huaman...");
  const res2 = await resolverBeneficiario("Vilma Milian Huaman");
  console.log("Res 2:", res2);
  
  console.log("Buscando maestro tomy...");
  const res3 = await resolverMaestro("tomy");
  console.log("Res 3:", res3);
}

run().catch(console.error);
