import { NextResponse } from 'next/server';
import { getModelosVivienda, addModeloVivienda, updateModeloVivienda, deleteModeloVivienda } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activosOnly = searchParams.get('activosOnly') === 'true';
  
  try {
    const data = await getModelosVivienda(activosOnly);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await addModeloVivienda(data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...modelo } = data;
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    const result = await updateModeloVivienda(id, modelo);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }
  
  try {
    const success = await deleteModeloVivienda(id);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
