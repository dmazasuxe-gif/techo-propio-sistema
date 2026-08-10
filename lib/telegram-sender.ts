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
    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    if (caption) {
      formData.append("caption", caption);
    }

    if (fileUrlOrPath.startsWith("http://") || fileUrlOrPath.startsWith("https://")) {
      // Si es una URL remota, la descargamos a buffer para evitar problemas de nombres y descargas de Telegram
      const fileRes = await fetch(fileUrlOrPath);
      if (!fileRes.ok) {
        console.error("Error descargando archivo remoto:", fileUrlOrPath);
        return false;
      }
      
      const buffer = await fileRes.buffer();
      
      // Intentar extraer el nombre original de la URL o Content-Disposition
      let filename = "Documento";
      const cd = fileRes.headers.get('content-disposition');
      if (cd && cd.includes('filename=')) {
        const match = cd.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      } else {
        const urlObj = new URL(fileUrlOrPath);
        const pathParts = urlObj.pathname.split('/');
        filename = pathParts[pathParts.length - 1] || "Documento";
      }

      // Evitar nombres de archivo vacíos o inválidos
      if (!filename.includes('.')) {
        const contentType = fileRes.headers.get('content-type') || '';
        if (contentType.includes('pdf')) filename += '.pdf';
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) filename += '.jpg';
        else if (contentType.includes('png')) filename += '.png';
      }

      formData.append("document", buffer, { filename });
    } else {
      // Archivo local
      let actualPath = fileUrlOrPath;
      if (fs.existsSync(actualPath)) {
        // path is already correct and exists
      } else if (fileUrlOrPath.startsWith("/uploads/")) {
        actualPath = path.join(process.cwd(), "public", fileUrlOrPath);
      } else if (!path.isAbsolute(actualPath)) {
        actualPath = path.join(process.cwd(), "public", fileUrlOrPath);
      }

      if (!fs.existsSync(actualPath)) {
        console.error(`Archivo local no encontrado: ${actualPath}`);
        return false;
      }
      
      const filename = path.basename(actualPath);
      formData.append("document", fs.createReadStream(actualPath), { filename });
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
