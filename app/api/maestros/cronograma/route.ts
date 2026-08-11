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

/**
 * DELETE /api/maestros/cronograma?id=MAESTRO_ID
 * Elimina el maestro de TODAS las tablas:
 *   1. maestros            (tabla principal)
 *   2. cronograma_maestros (tabla de cronograma)
 *   3. beneficiarios       (limpia la referencia maestro_asignado_id)
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID del maestro es requerido" }, { status: 400 });
    }

    // 1. Liberar beneficiarios asignados a este maestro
    const { error: errBen } = await supabase
      .from('beneficiarios')
      .update({ maestro_asignado_id: null, maestro_asignado_nombre: null })
      .eq('maestro_asignado_id', id);

    if (errBen) {
      console.error("Error liberando beneficiarios del maestro:", errBen);
      // No abortamos — intentamos continuar con el borrado
    }

    // 2. Eliminar de cronograma_maestros
    const { error: errCronograma } = await supabase
      .from('cronograma_maestros')
      .delete()
      .eq('id', id);

    if (errCronograma) {
      console.error("Error eliminando de cronograma_maestros:", errCronograma);
    }

    // 3. Eliminar de la tabla principal maestros
    const { error: errMaestro } = await supabase
      .from('maestros')
      .delete()
      .eq('id', id);

    if (errMaestro) {
      console.error("Error eliminando de maestros:", errMaestro);
      return NextResponse.json({ error: errMaestro.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Maestro ${id} eliminado de todas las tablas.` });
  } catch (error: any) {
    console.error("Error en DELETE maestro:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}
