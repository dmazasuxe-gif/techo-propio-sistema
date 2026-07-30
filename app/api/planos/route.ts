import { NextResponse } from "next/server";
import { getDb, addPlano, deletePlano } from "@/lib/db";
import { supabase } from "@/lib/supabase";

// GET — return all planos
export async function GET() {
  const db = await getDb();
  const planos = db.planosIngenieria || [];
  return NextResponse.json(planos);
}

// POST — add or update planos
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "add") {
      const newPlano = {
        id: `PLN-${Date.now()}`,
        title: body.title || "Nuevo Plano",
        type: body.type || "DWG (AutoCAD)",
        fileName: body.fileName || "",
        fileUrl: body.fileUrl || "",
        fileSize: body.fileSize || "",
        createdAt: new Date().toISOString(),
      };
      const added = await addPlano(newPlano);
      return NextResponse.json({ ok: true, plano: added });
    }

    if (body.action === "update") {
      // Convert keys to snake case for update
      const toSnake = (obj: any) => {
        const newObj: any = {};
        Object.keys(obj).forEach(k => {
          newObj[k.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] = obj[k];
        });
        return newObj;
      };
      
      const updateData = toSnake(body.data);
      const { data, error } = await supabase
        .from('planos_ingenieria')
        .update(updateData)
        .eq('id', body.id)
        .select()
        .single();
        
      if (error) {
        return NextResponse.json({ error: "Error actualizando plano" }, { status: 500 });
      }
      
      // We should ideally convert back to camelCase but for simplicity we return ok
      return NextResponse.json({ ok: true, plano: data });
    }

    if (body.action === "delete") {
      const success = await deletePlano(body.id);
      if (!success) {
        return NextResponse.json({ error: "Error eliminando plano" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "set_all") {
      // Delete all existing
      await supabase.from('planos_ingenieria').delete().neq('id', '0');
      
      const toSnake = (obj: any) => {
        const newObj: any = {};
        Object.keys(obj).forEach(k => {
          newObj[k.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] = obj[k];
        });
        return newObj;
      };
      
      const insertData = (body.planos || []).map(toSnake);
      if (insertData.length > 0) {
        await supabase.from('planos_ingenieria').insert(insertData);
      }
      
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error in planos API:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
