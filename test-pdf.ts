import { resolverBeneficiario } from './lib/entity-resolution';
import { generarFichaBeneficiarioPDF } from './lib/pdf-generator';

async function main() {
  console.log("Probando entity resolution para 'beneficiario_1'...");
  const resolucion = await resolverBeneficiario("beneficiario_1");
  console.log("Resultado de resolución:", resolucion);

  if (resolucion.success) {
    console.log("Probando generador de PDF con ID:", resolucion.entity.id);
    try {
      const pdfPath = await generarFichaBeneficiarioPDF(resolucion.entity.id);
      console.log("Ruta del PDF:", pdfPath);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  }
}

main().catch(console.error);
