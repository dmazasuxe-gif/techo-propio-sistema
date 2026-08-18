import { NextResponse } from 'next/server';
import { getDocumentosContables, addDocumentoContable } from '@/lib/db';
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
