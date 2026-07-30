import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "planos";

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo." }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.\-()áéíóúñÁÉÍÓÚÑ ]/g, "_");
    const uniqueName = `${Date.now()}_${sanitizedName}`;
    const filePath = `${subfolder}/${uniqueName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('archivos')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      });

    if (error) {
      console.error("Supabase storage error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('archivos')
      .getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      url: publicUrlData.publicUrl,
      fileName: sanitizedName,
      size: file.size,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error interno al subir el archivo." }, { status: 500 });
  }
}
