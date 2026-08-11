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
    let pdfBuffer: Buffer;

    if (absolutePath.startsWith("http://") || absolutePath.startsWith("https://")) {
      const response = await fetch(absolutePath);
      if (!response.ok) {
        return NextResponse.json({ error: "Error descargando el PDF remoto." }, { status: 500 });
      }
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else {
      if (!fs.existsSync(absolutePath)) {
        return NextResponse.json({ error: "Archivo PDF no encontrado." }, { status: 404 });
      }
      pdfBuffer = fs.readFileSync(absolutePath);
    }

    return new NextResponse(pdfBuffer as any, {
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
