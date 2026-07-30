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
        newObj[k.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] = obj[k];
      });
      return newObj;
    };
    
    const insertData = data.map(toSnake);
    
    const { error } = await supabase.from('cronograma_maestros').insert(insertData);
    if (error) throw error;
    
    const db = await getDb();
    return NextResponse.json({ success: true, cronogramaMaestros: db.cronogramaMaestros });
  } catch (error) {
    console.error("Error saving cronogramaMaestros:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
