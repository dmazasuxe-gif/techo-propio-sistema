import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { supabase } from "../../../lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDb();
  return NextResponse.json(db.financieras || []);
}

export async function POST(request: Request) {
  try {
    const data = await request.json(); // Array of financieras
    
    // First, delete all existing records in financieras
    await supabase.from('financieras').delete().neq('id', '0'); // Delete all (using a condition that matches all)
    
    // Convert keys to snake case
    const toSnake = (obj: any) => {
      const newObj: any = {};
      Object.keys(obj).forEach(k => {
        newObj[k.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)] = obj[k];
      });
      return newObj;
    };
    
    const insertData = data.map(toSnake);
    
    // Insert new data
    const { error } = await supabase.from('financieras').insert(insertData);
    if (error) throw error;
    
    const db = await getDb();
    return NextResponse.json({ success: true, financieras: db.financieras });
  } catch (error) {
    console.error("Error saving financieras:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
