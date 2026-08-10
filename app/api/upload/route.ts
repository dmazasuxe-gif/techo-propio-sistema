import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function ensureBucketExists(bucketName: string) {
  // Try to list objects to verify bucket exists
  const { error } = await supabase.storage.from(bucketName).list("", { limit: 1 });
  if (!error) return true;

  // Try to create the bucket
  const { error: createError } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 52428800, // 50MB
  });

  if (createError) {
    console.error("Could not create bucket:", createError.message);
    return false;
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "documentos";

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo." }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.\-()áéíóúñÁÉÍÓÚÑ ]/g, "_");
    const uniqueName = `${Date.now()}_${sanitizedName}`;
    const filePath = `${subfolder}/${uniqueName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure bucket exists, create if necessary
    const bucketReady = await ensureBucketExists("documentos_beneficiarios");

    if (bucketReady) {
      const { error } = await supabase.storage
        .from("documentos_beneficiarios")
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from("documentos_beneficiarios")
          .getPublicUrl(filePath);

        return NextResponse.json({
          ok: true,
          url: publicUrlData.publicUrl,
          fileName: sanitizedName,
          size: file.size,
        });
      }
      console.error("Supabase storage upload error, using base64 fallback");
    }

    // Fallback: encode file as data URL (works without storage bucket)
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "application/octet-stream";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      ok: true,
      url: dataUrl,
      fileName: sanitizedName,
      size: file.size,
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error interno al subir el archivo." }, { status: 500 });
  }
}
