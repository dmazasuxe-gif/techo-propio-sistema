import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { addDocumentoContable } from "@/lib/db";
import OpenAI from "openai";
import zlib from "zlib";

export const maxDuration = 60;

// Extractor nativo en memoria de streams de texto para PDF (sin dependencias externas ni workers)
function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const rawStr = buffer.toString("latin1");
    const extracted: string[] = [];
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(rawStr)) !== null) {
      try {
        const streamData = Buffer.from(match[1], "latin1");
        const uncompressed = zlib.inflateSync(streamData).toString("latin1");

        // Operador (string) Tj
        const tjRegex = /\(([\s\S]*?)\)\s*Tj/g;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(uncompressed)) !== null) {
          extracted.push(tjMatch[1]);
        }

        // Operador [(part1) 120 (part2)] TJ
        const arrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
        let arrMatch: RegExpExecArray | null;
        while ((arrMatch = arrayRegex.exec(uncompressed)) !== null) {
          const parts = arrMatch[1].match(/\(([\s\S]*?)\)/g) || [];
          extracted.push(parts.map((p) => p.slice(1, -1)).join(""));
        }
      } catch {
        // Stream no comprimido con zlib o binario, se ignora
      }
    }

    if (extracted.length > 0) {
      return extracted
        .map((t) => t.replace(/\\([()\\])/g, "$1"))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
  } catch (err) {
    console.warn("Aviso: error en parser nativo de PDF:", err);
  }
  return "";
}

// Extractor de imágenes JPEG incrustadas en un PDF escaneado
function extractFirstJpegFromPdf(buffer: Buffer): string | null {
  try {
    const start = buffer.indexOf(Buffer.from([0xff, 0xd8, 0xff]));
    if (start !== -1) {
      const end = buffer.indexOf(Buffer.from([0xff, 0xd9]), start);
      if (end !== -1 && end > start + 500) {
        const jpgBuf = buffer.subarray(start, end + 2);
        return `data:image/jpeg;base64,${jpgBuf.toString("base64")}`;
      }
    }
  } catch (e) {
    console.warn("Aviso: no se pudo extraer JPEG del PDF:", e);
  }
  return null;
}

async function ensureBucketExists(bucketName: string) {
  try {
    const { error } = await supabase.storage.from(bucketName).list("", { limit: 1 });
    if (!error) return true;

    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    });

    if (createError) {
      console.warn("Could not create bucket:", createError.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Error checking/creating bucket:", e);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const autoSave = formData.get("autoSave") === "true";

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo." }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.\-()áéíóúñÁÉÍÓÚÑ ]/g, "_");
    const uniqueName = `${Date.now()}_${sanitizedName}`;
    const filePath = `facturas/${uniqueName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Guardar archivo en Supabase Storage (permanente) o fallback Data URL
    let publicUrl = "";
    const bucketReady = await ensureBucketExists("documentos_beneficiarios");

    if (bucketReady) {
      const { error: uploadError } = await supabase.storage
        .from("documentos_beneficiarios")
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("documentos_beneficiarios")
          .getPublicUrl(filePath);
        publicUrl = publicUrlData.publicUrl;
      } else {
        console.warn("Supabase upload warning, usando fallback dataUrl:", uploadError.message);
      }
    }

    if (!publicUrl) {
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "application/octet-stream";
      publicUrl = `data:${mimeType};base64,${base64}`;
    }

    // 2. Extraer datos con Inteligencia Artificial (OpenAI)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY no está configurada en las variables de entorno." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    const promptInstructions = `Eres un sistema de inteligencia artificial especializado en lectura, análisis y extracción de comprobantes de pago peruanos (Facturas electrónicas, Boletas de Venta, Recibos por Honorarios, Notas de Crédito, Tickets).
Tu labor es examinar este comprobante y extraer con total exactitud todos los datos fiscales y la descripción de los productos o servicios adquiridos.

REGLAS CRÍTICAS DE EXTRACCIÓN (PERÚ / SUNAT):
1. "emisor": Razón Social o Nombre completo del PROVEEDOR o empresa que VENDE y emite la factura (el vendedor).
   - ATENCIÓN: Si en el comprobante figura "CLIENTE: CONSTRUCTORA MAZA QUIROZ E.I.R.L.", esa es la empresa compradora/cliente, NO es el emisor. El emisor es la otra empresa o persona que emitió el comprobante.
2. "ruc": Número de RUC del PROVEEDOR/EMISOR (11 dígitos numéricos peruanos, ej: 10472490228 o 20608453866). Si hay dos RUCs, toma el del emisor que vende.
3. "tipoDocumento": "Factura", "Boleta de Venta", "Recibo por Honorarios", "Nota de Crédito" o "Comprobante".
4. "numeroDocumento": Serie y número del comprobante (ej: F001-00000168, B002-45, etc.).
5. "fecha": Fecha de emisión en formato YYYY-MM-DD (ej: 2026-10-10).
6. "monto": Monto TOTAL a pagar en número decimal (ej. 71.00, 1540.50), sin símbolos de moneda.
7. "concepto": Descripción detallada y completa de TODOS los productos, materiales o servicios adquiridos (ej: "CHICHA DE JORA 1 LT (Cant: 1), ARROZ NORTEÑO CON PANCETA CROCANTE (Cant: 1), TRIO DE MINI CAUSAS (Cant: 1)"). No omitas los nombres de los productos.
8. "subtotal": Subtotal o base imponible si figura (número decimal, opcional).
9. "igv": Monto del IGV si figura (número decimal, opcional).
10. "moneda": "PEN" para Soles o "USD" para Dólares.

Responde únicamente con un objeto json válido con esta estructura exacta.`;

    let messagesContent: any[] = [];

    if (isPdf) {
      // Estrategia 1: Extractor nativo de texto de streams zlib (100% confiable y sin fallos en Vercel)
      let extractedText = extractTextFromPdfBuffer(buffer);

      // Estrategia 2: Intentar pdf-parse v2 complementario
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        await parser.load();
        const textResult = await parser.getText();
        const pdfParseText = (textResult?.text || "").trim();
        if (pdfParseText.length > extractedText.length) {
          extractedText = pdfParseText;
        }
        await parser.destroy();
      } catch (err) {
        console.warn("Aviso al ejecutar pdf-parse:", err);
      }

      // Estrategia 3: Buscar si hay una imagen escaneada incrustada en el PDF
      const embeddedJpeg = extractFirstJpegFromPdf(buffer);

      if (embeddedJpeg) {
        messagesContent = [
          {
            type: "text",
            text: `${promptInstructions}\n\nTexto extraído del documento PDF:\n${extractedText || "Documento escaneado."}`,
          },
          {
            type: "image_url",
            image_url: { url: embeddedJpeg },
          },
        ];
      } else {
        messagesContent = [
          {
            type: "text",
            text: `${promptInstructions}\n\nTexto íntegro extraído del documento PDF:\n${extractedText || "No se detectó texto directo."}`,
          },
        ];
      }
    } else {
      // Imagen (JPG, PNG, WebP)
      const base64Image = buffer.toString("base64");
      const mime = file.type || "image/jpeg";
      const dataUri = `data:${mime};base64,${base64Image}`;

      messagesContent = [
        { type: "text", text: promptInstructions },
        {
          type: "image_url",
          image_url: { url: dataUri },
        },
      ];
    }

    // Consulta al modelo OpenAI GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: messagesContent,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error("Error al parsear respuesta JSON de OpenAI:", parseErr, rawContent);
      return NextResponse.json({ error: "No se pudo interpretar la respuesta de la IA." }, { status: 500 });
    }

    // Normalización de datos extraídos
    const montoNormalizado =
      typeof parsedData.monto === "number"
        ? parsedData.monto
        : parseFloat(String(parsedData.monto || "0").replace(/[^0-9.]/g, "")) || 0;

    // Normalizar concepto si viene como Array
    let conceptoTexto = "";
    if (Array.isArray(parsedData.concepto)) {
      conceptoTexto = parsedData.concepto.join(", ");
    } else if (typeof parsedData.concepto === "string") {
      conceptoTexto = parsedData.concepto.trim();
    } else {
      conceptoTexto = "Gasto o servicio facturado";
    }

    const fechaDoc = parsedData.fecha || new Date().toISOString().split("T")[0];

    // Cálculo automático del plazo de entrega al contador (25 días por defecto)
    let fechaAlertaSugerida = "";
    try {
      const d = new Date(fechaDoc);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 25);
        fechaAlertaSugerida = d.toISOString().split("T")[0];
      }
    } catch {
      fechaAlertaSugerida = "";
    }

    const datosFinales = {
      tipoDocumento: parsedData.tipoDocumento || "Factura",
      numeroDocumento: parsedData.numeroDocumento || "",
      fecha: fechaDoc,
      emisor: parsedData.emisor || "Proveedor General",
      ruc: parsedData.ruc ? String(parsedData.ruc).replace(/\D/g, "") : "",
      concepto: conceptoTexto,
      monto: montoNormalizado,
      subtotal: typeof parsedData.subtotal === "number" ? parsedData.subtotal : null,
      igv: typeof parsedData.igv === "number" ? parsedData.igv : null,
      moneda: parsedData.moneda || "PEN",
      fechaAlerta: fechaAlertaSugerida,
      urlArchivo: publicUrl,
    };

    let savedDoc = null;
    if (autoSave) {
      savedDoc = await addDocumentoContable({
        id: `DOC-CONT-${Date.now()}`,
        tipoDocumento: datosFinales.tipoDocumento,
        fecha: datosFinales.fecha,
        monto: datosFinales.monto,
        emisor: datosFinales.emisor,
        ruc: datosFinales.ruc,
        concepto: `${datosFinales.concepto}${fechaAlertaSugerida ? ` [ENTREGA_CONTADOR:${fechaAlertaSugerida}]` : ""}`,
        urlArchivo: publicUrl,
        estado: "Pendiente Contador",
      });
    }

    return NextResponse.json({
      ok: true,
      datos: datosFinales,
      urlArchivo: publicUrl,
      fileName: sanitizedName,
      savedDoc,
    });
  } catch (error: any) {
    console.error("Error al procesar documento contable con IA:", error);
    return NextResponse.json(
      { error: error?.message || "Ocurrió un error inesperado al procesar la factura." },
      { status: 500 }
    );
  }
}
