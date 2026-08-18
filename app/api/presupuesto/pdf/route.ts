import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generarPresupuestoPDFFromData, PresupuestoData } from "@/lib/pdf-generator";

export async function POST(req: Request) {
  try {
    const body: PresupuestoData = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: "No se enviaron items del presupuesto." }, { status: 400 });
    }

    const pdfRelativePath = await generarPresupuestoPDFFromData(body);

    if (!pdfRelativePath) {
      return NextResponse.json({ error: "Error generando el PDF." }, { status: 500 });
    }

    // Read the generated PDF and return as binary
    const absolutePath = pdfRelativePath;
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
        "Content-Disposition": `attachment; filename="Presupuesto_TechoPropio.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error in presupuesto PDF route:", error);
    return NextResponse.json({ error: "Error interno generando presupuesto PDF." }, { status: 500 });
  }
}
