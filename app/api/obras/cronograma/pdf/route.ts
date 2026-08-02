import { NextResponse } from "next/server";
import fs from "fs";
import { generarCronogramaObraPDF } from "@/lib/pdf-generator";

export async function GET() {
  try {
    const pdfRelativePath = await generarCronogramaObraPDF();

    if (!pdfRelativePath) {
      return NextResponse.json({ error: "Error generando el PDF." }, { status: 500 });
    }

    const absolutePath = pdfRelativePath; // already absolute path

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "Archivo PDF no encontrado." }, { status: 404 });
    }

    const pdfBuffer = fs.readFileSync(absolutePath);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Cronograma_General_TechoPropio.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error in cronograma PDF route:", error);
    return NextResponse.json({ error: "Error interno generando cronograma PDF." }, { status: 500 });
  }
}
