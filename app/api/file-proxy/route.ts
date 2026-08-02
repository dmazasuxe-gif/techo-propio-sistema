import { NextResponse } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";

// This proxy endpoint fetches files from Telegram's servers using the bot token
// and forwards them to the browser, so the browser can display them without needing the token.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing file path" }, { status: 400 });
  }

  if (!TELEGRAM_TOKEN) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }

  try {
    const telegramUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
    const res = await fetch(telegramUrl);

    if (!res.ok) {
      return NextResponse.json({ error: "File not found on Telegram" }, { status: 404 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/octet-stream";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Error fetching file" }, { status: 500 });
  }
}
