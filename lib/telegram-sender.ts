import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

export async function sendDocumentToTelegram(chatId: number | string, fileUrlOrPath: string, caption: string = ""): Promise<boolean> {
  if (!TELEGRAM_TOKEN) {
    console.log(`[Telegram Simulation] Send Document to ${chatId}: ${fileUrlOrPath}`);
    return true;
  }

  try {
    let actualPath = fileUrlOrPath;
    if (fileUrlOrPath.startsWith("/uploads/")) {
      actualPath = path.join(process.cwd(), "public", fileUrlOrPath);
    } else if (!path.isAbsolute(actualPath)) {
      actualPath = path.join(process.cwd(), "public", fileUrlOrPath);
    }

    if (!fs.existsSync(actualPath)) {
      console.error(`Archivo no encontrado: ${actualPath}`);
      return false;
    }

    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    formData.append("document", fs.createReadStream(actualPath));
    if (caption) {
      formData.append("caption", caption);
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error enviando documento a Telegram:", text);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error en sendDocumentToTelegram:", error);
    return false;
  }
}
