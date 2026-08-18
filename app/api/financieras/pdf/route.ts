import { NextResponse } from "next/server";
import fs from "fs";
import { generarFinancieraPDFFromData } from "@/lib/pdf-generator";
import { Financiera, Beneficiario } from "@/app/types";

export async function POST(req: Request) {
  try {
    const body: { financiera: Financiera; beneficiarios: Beneficiario[] } = await req.json();

    if (!body.financiera) {
      return NextResponse.json({ error: "No se envió la financiera." }, { status: 400 });
    }

    const pdfRelativePath = await generarFinancieraPDFFromData(body.financiera, body.beneficiarios);

    if (!pdfRelativePath) {
      return NextResponse.json({ error: "Error generando el PDF." }, { status: 500 });
    }

    const absolutePath = pdfRelativePath;
    let pdfBuffer: Buffer;

    if (absolutePath.startsWith("http://") || absolutePath.startsWith("https://")) {
      // It's a public URL returned by Supabase Storage
      const response = await fetch(absolutePath);
      if (!response.ok) {
        return NextResponse.json({ error: "Error descargando el PDF remoto." }, { status: 500 });
      }
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else {
      // It's a local file path
      if (!fs.existsSync(absolutePath)) {
        return NextResponse.json({ error: "Archivo PDF no encontrado." }, { status: 404 });
      }
      pdfBuffer = fs.readFileSync(absolutePath);
    }

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Financiera_${body.financiera.nombre.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error in financiera PDF route:", error);
    return NextResponse.json({ error: "Error interno generando PDF de financiera." }, { status: 500 });
  }
}
