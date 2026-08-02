import fs from "fs";
import path from "path";
import { NextResponse, after } from "next/server";
import { processUserMessage } from "@/lib/nlu-engine";

export const maxDuration = 60;

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

async function sendTelegramMessage(chatId: number | string, text: string, parseMode: "HTML" | "Markdown" = "HTML") {
  if (!TELEGRAM_TOKEN) {
    console.log(`[Telegram Simulation] ChatId ${chatId}: ${text}`);
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Telegram API Error (${res.status}): ${errorText}`);
    } else {
      console.log(`[Telegram Sent] ChatId ${chatId}: ${text.substring(0, 50)}...`);
    }
  } catch (err) {
    console.error("Error enviando mensaje a Telegram:", err);
  }
}

async function downloadTelegramFile(fileId: string, preferredName: string): Promise<string | null> {
  if (!TELEGRAM_TOKEN || !fileId) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok && data.result && data.result.file_path) {
      const filePathOnTelegram = data.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePathOnTelegram}`;
      
      const fileRes = await fetch(downloadUrl);
      if (!fileRes.ok) return null;
      const arrayBuffer = await fileRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const ext = path.extname(filePathOnTelegram) || path.extname(preferredName) || ".pdf";
      const cleanName = `${Date.now()}_${preferredName.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
      const finalFileName = cleanName.endsWith(ext) ? cleanName : `${cleanName}${ext}`;
      const targetPath = `telegram/${finalFileName}`;

      const { supabase } = await import("@/lib/supabase");
      
      const { data: uploadData, error } = await supabase.storage
        .from('archivos')
        .upload(targetPath, buffer, {
          contentType: 'application/octet-stream',
          upsert: false
        });

      if (error) {
        console.error("Error uploading to Supabase:", error);
        return `https://placehold.co/600x400/1e293b/38bdf8?text=${encodeURIComponent(finalFileName)}`;
      }

      const { data: publicUrlData } = supabase.storage
        .from('archivos')
        .getPublicUrl(targetPath);

      return publicUrlData.publicUrl;
    }
  } catch (err) {
    console.error("Error descargando archivo de Telegram:", err);
  }
  return null;
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    botTokenConfigured: Boolean(TELEGRAM_TOKEN),
    info: "Telegram Bot NLU Engine — Techo Propio Maza Quiroz",
  });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let update;
    try {
      update = JSON.parse(rawBody);
    } catch (e) {
      console.error("RAW BODY ERROR:", rawBody);
      throw e;
    }
    const message = update.message || update.edited_message;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    let text: string = (message.text || message.caption || "").trim();
    let fileUrl: string | undefined = undefined;

    if (message.document) {
      const fileId = message.document.file_id;
      const fileName = message.document.file_name || "Documento.pdf";
      if (!text) text = `[DOCUMENT: ${fileName}]`;
      fileUrl = (await downloadTelegramFile(fileId, fileName)) || undefined;
    } else if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
      const largestPhoto = message.photo[message.photo.length - 1];
      const fileId = largestPhoto.file_id;
      if (!text) text = "[PHOTO: Imagen_Fotografía.jpg]";
      fileUrl = (await downloadTelegramFile(fileId, "Fotografia.jpg")) || undefined;
    }

    if (!text) {
      return NextResponse.json({ ok: true });
    }

    // Pass message through NLU Engine asynchronously to avoid Telegram timeouts
    after(async () => {
      try {
        const replyText = await processUserMessage(chatId, text, fileUrl);
        await sendTelegramMessage(chatId, replyText);
      } catch (e) {
        console.error("Error in background NLU execution:", e);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error procesando Webhook de Telegram NLU:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
