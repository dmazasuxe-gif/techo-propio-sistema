/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { addDocumentoToBeneficiario, deleteDocumentoFromBeneficiario } from "@/lib/db";
import { DocumentoAdjunto } from "@/app/types";

export async function POST(req: Request) {
  try {
    const { beneficiarioId, documento } = await req.json();
    if (!beneficiarioId || !documento) {
      return NextResponse.json({ error: "beneficiarioId y documento son requeridos" }, { status: 400 });
    }
    const updated = await addDocumentoToBeneficiario(beneficiarioId, documento as DocumentoAdjunto);
    if (!updated) {
      return NextResponse.json({ error: "Beneficiario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Error guardando documento" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const beneficiarioId = searchParams.get("beneficiarioId");
    const docId = searchParams.get("docId");

    if (!beneficiarioId || !docId) {
      return NextResponse.json({ error: "beneficiarioId y docId son requeridos" }, { status: 400 });
    }

    const updated = await deleteDocumentoFromBeneficiario(beneficiarioId, docId);
    if (!updated) {
      return NextResponse.json({ error: "Beneficiario no encontrado" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Error eliminando documento" }, { status: 500 });
  }
}
