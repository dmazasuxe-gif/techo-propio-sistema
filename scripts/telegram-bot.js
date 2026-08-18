const fs = require("fs");
const path = require("path");
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Load .env.local if present
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8697608273:AAGoS-9es3wcV7KNp2vxoBzlU2e6DHrPAt8";
const LOCAL_API = "http://localhost:3000/api/telegram";

let offset = 0;

console.log("🤖 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🤖 INICIANDO BOT DE TELEGRAM (Modo Polling en Vivo)");
console.log(`🔑 Token activo: ${TOKEN.slice(0, 15)}...`);
console.log(`🌐 Servidor local: ${LOCAL_API}`);
console.log("🤖 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

async function poll() {
  while (true) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=20`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message || update.edited_message;
          if (msg && msg.text) {
            console.log(`📩 Mensaje recibido de ${msg.from.first_name || "Usuario"} (@${msg.from.username || "sin_user"}): "${msg.text}"`);
          }
          // Forward update to local Next.js API route
          try {
            await fetch(LOCAL_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(update),
            });
          } catch (e) {
            console.error("❌ Error enviando a Next.js (Asegúrate de que http://localhost:3000 esté corriendo):", e.message);
          }
        }
      }
    } catch (err) {
      console.error("⚠️ Error de conexión en polling:", err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// Clear webhook first so long-polling receives messages
fetch(`https://api.telegram.org/bot${TOKEN}/deleteWebhook`)
  .then((r) => r.json())
  .then((data) => {
    console.log("✅ Webhook liberado para polling continuo:", data.description || "OK");
    console.log("🚀 El Bot ya está ESCUCHANDO tus mensajes en Telegram.\n");
    poll();
  })
  .catch((e) => {
    console.error("⚠️ Error limpiando webhook:", e.message);
    poll();
  });
