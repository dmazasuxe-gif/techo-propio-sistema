/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getBeneficiarios, addBeneficiario, updateBeneficiario, deleteBeneficiario } from "@/lib/db";
import { Beneficiario } from "@/app/types";

export const dynamic = 'force-dynamic';

// GET /api/beneficiarios -> Returns all beneficiaries
export async function GET() {
  const data = await getBeneficiarios();
  return NextResponse.json(data);
}

// POST /api/beneficiarios -> Creates a new beneficiary
export async function POST(req: Request) {
  try {
    const body: Beneficiario = await req.json();
    if (!body.postulante) {
      return NextResponse.json({ error: "El nombre del postulante es requerido" }, { status: 400 });
    }
    const created = await addBeneficiario(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Error procesando solicitud" }, { status: 500 });
  }
}

// PUT /api/beneficiarios -> Updates an existing beneficiary
export async function PUT(req: Request) {
  try {
    const body: Beneficiario = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "El ID es requerido" }, { status: 400 });
    }
    const updated = await updateBeneficiario(body);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Error actualizando beneficiario" }, { status: 500 });
  }
}

// DELETE /api/beneficiarios?id=... -> Deletes beneficiary
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }
  await deleteBeneficiario(id);
  return NextResponse.json({ success: true });
}
