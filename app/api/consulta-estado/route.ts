import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dni = searchParams.get('dni');

  if (!dni) {
    return NextResponse.json({ error: 'Falta el número de DNI' }, { status: 400 });
  }

  try {
    // Only fetch fields that are safe to show publicly
    const { data, error } = await supabase
      .from('beneficiarios')
      .select('postulante, dni_postulante, estado, departamento, provincia, distrito, created_at')
      .eq('dni_postulante', dni);

    if (error) {
      console.error('Error fetching beneficiario status:', error);
      return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      // Not found, we can return empty array or a specific message
      return NextResponse.json({ results: [] });
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}
