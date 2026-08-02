import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: m } = await supabase.from('maestros').select('*');
  const { data: c } = await supabase.from('cronograma_maestros').select('*');
  
  const cIds = c ? c.map((x: any) => x.id) : [];
  const missing = m ? m.filter((x: any) => !cIds.includes(x.id)) : [];
  
  for (const m of missing) {
    await supabase.from('cronograma_maestros').insert({
      id: m.id,
      nombre: m.nombre,
      dni: m.dni,
      celular: m.celular,
      especialidad: m.especialidad,
      monto_por_vivienda: parseFloat(m.tarifa_vivienda) || 0,
      beneficiarios_asignados: m.beneficiario_asignado_id ? [m.beneficiario_asignado_id] : [],
      pagos: []
    });
  }
  
  return NextResponse.json({ synced: missing.length, missing });
}
