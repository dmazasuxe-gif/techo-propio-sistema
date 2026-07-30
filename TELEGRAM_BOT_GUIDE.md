# 🤖 GUÍA DE CONFIGURACIÓN DEL BOT DE TELEGRAM

El bot de Telegram ya está **100% integrado** en tu proyecto mediante la API `/api/telegram`.
Tanto la página Web como el Bot de Telegram leen y escriben en la misma base de datos en tiempo real.

---

## ⚡ Pasos para Activar tu Bot en Telegram (en 2 Minutos)

### Paso 1: Obtener el Token en Telegram
1. En tu celular o Telegram PC, busca el usuario oficial **`@BotFather`**.
2. Presiona **Iniciar** o envía el comando `/newbot`.
3. Escribe el nombre para tu bot (ejemplo: `Techo Propio Maza Quiroz Bot`).
4. Escribe el nombre de usuario terminado en `bot` (ejemplo: `TechoPropioMazaBot`).
5. Copia el **TOKEN DE API** que te dará `@BotFather` (se ve algo como `7123456789:AAFx...`).

---

## 🔑 Paso 2: Agregar el Token al Proyecto
Crea o abre el archivo `.env.local` en la raíz de tu proyecto `D:\Sistema-TechoPropio\.env.local` y agrega la siguiente línea:

```env
TELEGRAM_BOT_TOKEN="AQUÍ_PEGA_TU_TOKEN_DE_BOT"
```

---

## 🌐 Paso 3: Conectar Telegram con tu Servidor (Webhook)

### Opción A (Para uso local en Desarrollo con ngrok):
1. Instala o ejecuta `ngrok` apuntando a tu puerto 3000:
   ```bash
   npx ngrok http 3000
   ```
2. Copia la URL HTTPS que te da ngrok (ejemplo: `https://abcd-123.ngrok-free.app`).
3. Abre tu navegador y ejecuta esta URL (reemplazando tu token y tu URL de ngrok):
   ```
   https://api.telegram.org/botTU_TOKEN/setWebhook?url=HTTPS_DE_NGROK/api/telegram
   ```

### Opción B (Cuando subas el proyecto a Vercel / Servidor Cloud):
Solo ejecutas en el navegador:
```
https://api.telegram.org/botTU_TOKEN/setWebhook?url=https://tu-dominio-vercel.app/api/telegram
```

---

## 💬 Comandos que puedes usar desde Telegram

| Comando | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `/start` o `/menu` | Muestra el menú de bienvenida y los comandos disponibles. | `/start` |
| `/buscar [DNI o Nombre]` | Muestra la Ficha Familiar completa del beneficiario, DNI, Celular, Ubicación, Coordenadas y Estado. | `/buscar 45689123` |
| `/registrar [Datos]` | Registra un nuevo beneficiario al instante. ¡Aparece en la Web y en el Mapa del Perú de inmediato! | `/registrar Juan Pérez, 45678912, 987654321, SAN MARTIN, SAN MARTIN, TARAPOTO` |
| `/resumen` | Estadísticas en tiempo real de cantidad de expedientes por departamento. | `/resumen` |
| `/lista` | Muestra la lista de los últimos 5 beneficiarios registrados. | `/lista` |
| *Texto directo* | Si solo escribes un DNI de 8 dígitos en el chat, el bot lo busca automáticamente. | `45689123` |
