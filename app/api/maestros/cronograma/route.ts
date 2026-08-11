import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { supabase } from "../../../../lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.cronogramaMaestros || []);
}

export async function POST(request: Request) {
  try {
    const data = await request.json(); // Array of cronogramaMaestros
    
    // Delete all existing records
    await supabase.from('cronograma_maestros').delete().neq('id', '0');
    
    const toSnake = (obj: any) => {
      const newObj: any = {};
      Object.keys(obj).forEach(k => {
        if (k === 'expandido') return; // Ignore UI-only property
        newObj[k.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] = obj[k];
      });
      return newObj;
    };
    
    const insertData = data.map(toSnake);
    
    const { error } = await supabase.from('cronograma_maestros').insert(insertData);
    if (error) throw error;
    
    // Sync the beneficiaries table to match the UI state
    for (const m of insertData) {
      const assignedIds = m.beneficiarios_asignados || [];
      
      // Find current beneficiaries for this maestro
      const { data: currentBens } = await supabase.from('beneficiarios').select('id').eq('maestro_asignado_id', m.id);
      if (currentBens) {
        const currentIds = currentBens.map((b: any) => b.id);
        const toRemove = currentIds.filter(id => !assignedIds.includes(id));
        if (toRemove.length > 0) {
           await supabase.from('beneficiarios').update({ maestro_asignado_id: null, maestro_asignado_nombre: null }).in('id', toRemove);
        }
      }
      
      if (assignedIds.length > 0) {
         await supabase.from('beneficiarios').update({ maestro_asignado_id: m.id, maestro_asignado_nombre: m.nombre }).in('id', assignedIds);
      }
    }
    
    const db = await getDb();
    return NextResponse.json({ success: true, cronogramaMaestros: db.cronogramaMaestros });
  } catch (error) {
    console.error("Error saving cronogramaMaestros:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
