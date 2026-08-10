import { supabase } from "./supabase";
import fs from "fs";
import fetch from "node-fetch";

export async function uploadToStorage(buffer: Buffer, fileName: string, contentType: string, subfolder: string = "", bucketName: string = "pdfs_generados"): Promise<string | null> {
  const filePath = subfolder ? `${subfolder}/${fileName}` : fileName;

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Error subiendo a Supabase Storage (${bucketName}):`, error);
      return null;
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Excepción en uploadToStorage:", error);
    return null;
  }
}

export async function getBufferFromUrl(url: string): Promise<{ buffer: Buffer; contentType: string; extension: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.buffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    
    let extension = "bin";
    if (contentType.includes("pdf")) extension = "pdf";
    else if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = "jpg";
    else if (contentType.includes("png")) extension = "png";
    
    return { buffer, contentType, extension };
  } catch (error) {
    console.error("Error obteniendo buffer de URL:", error);
    return null;
  }
}

export async function saveLocalFileToStorage(localPath: string, subfolder: string = "", bucketName: string = "pdfs_generados"): Promise<string | null> {
  if (!fs.existsSync(localPath)) return null;
  
  const buffer = fs.readFileSync(localPath);
  const fileName = localPath.split(/[/\\]/).pop() || `archivo_${Date.now()}.pdf`;
  let contentType = "application/pdf";
  if (fileName.endsWith(".jpg")) contentType = "image/jpeg";
  if (fileName.endsWith(".png")) contentType = "image/png";

  return await uploadToStorage(buffer, fileName, contentType, subfolder, bucketName);
}
