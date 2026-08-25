import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabase
    .from('presupuesto_master')
    .select('*')
    .eq('id', '1')
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || { id: '1', insumos: [], partidas: [] });
}

export async function POST(request: Request) {
  try {
    const { insumos, partidas } = await request.json();

    const { data, error } = await supabase
      .from('presupuesto_master')
      .upsert({ id: '1', insumos, partidas, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
