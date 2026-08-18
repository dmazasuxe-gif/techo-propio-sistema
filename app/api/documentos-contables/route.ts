import { NextResponse } from 'next/server';
import { getDocumentosContables, addDocumentoContable, deleteDocumentoContable } from '@/lib/db';
import { DocumentoContable } from '@/app/types';

export async function GET() {
  try {
    const docs = await getDocumentosContables();
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching documentos contables:", error);
    return NextResponse.json({ error: "Failed to fetch documentos contables" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const docData: any = await req.json();
    const newDoc = await addDocumentoContable(docData);
    if (newDoc) {
      return NextResponse.json(newDoc, { status: 201 });
    } else {
      return NextResponse.json({ error: "Failed to insert" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error adding documento contable:", error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const success = await deleteDocumentoContable(id);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error en DELETE documento contable:", error);
    return NextResponse.json({ error: "Error en servidor" }, { status: 500 });
  }
}
