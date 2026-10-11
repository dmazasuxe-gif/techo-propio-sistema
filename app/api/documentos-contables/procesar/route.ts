import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { addDocumentoContable } from "@/lib/db";
import OpenAI from "openai";

export const maxDuration = 60;

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

    // 1. Guardar archivo en Supabase Storage (o fallback Data URL)
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
        console.warn("Supabase upload warning, using base64 fallback:", uploadError.message);
      }
    }

    if (!publicUrl) {
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "application/octet-stream";
      publicUrl = `data:${mimeType};base64,${base64}`;
    }

    // 2. Extraer datos con Inteligencia Artificial
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "OPENAI_API_KEY no está configurada en las variables de entorno.",
      }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    let messagesContent: any[] = [];
    const promptInstructions = `Eres un sistema de inteligencia artificial experto en lectura, análisis y extracción de comprobantes de pago peruanos (Facturas electrónicas, Boletas de Venta, Recibos por Honorarios, Notas de Crédito, Tickets).
Tu objetivo es examinar este documento contable y extraer con total precisión los datos requeridos.

Devuelve estrictamente un objeto JSON con la siguiente estructura:
{
  "tipoDocumento": "Factura" | "Boleta de Venta" | "Recibo por Honorarios" | "Nota de Crédito" | "Comprobante",
  "numeroDocumento": "Serie y correlativo si aparece (ej. F001-0004521, E001-85, etc.), o cadena vacía",
  "fecha": "Fecha de emisión en formato YYYY-MM-DD (ej: 2026-05-18)",
  "emisor": "Razón social o nombre comercial de la empresa/proveedor emisor",
  "ruc": "Número de RUC del emisor (11 dígitos numéricos de Perú)",
  "concepto": "Descripción concisa y clara de los bienes, productos o servicios adquiridos",
  "monto": 1450.50, // Monto TOTAL a pagar en número decimal (sin letras ni signos de moneda)
  "subtotal": 1229.24, // Monto subtotal o base imponible (opcional, número)
  "igv": 221.26, // Monto de IGV 18% si aplica (opcional, número)
  "moneda": "PEN" | "USD" // Por defecto "PEN" para Soles
}

Reglas obligatorias:
- "monto" debe ser estrictamente un valor numérico decimal válido (ej. 150.00).
- "emisor" debe ser el proveedor o empresa que emite la factura (no el cliente).
- "ruc" debe ser de 11 dígitos si es una empresa peruana.
- Si no logras leer algún campo opcional, déjalo como null o cadena vacía, pero proporciona valores confiables para tipoDocumento, emisor, fecha y monto.`;

    if (isPdf) {
      let extractedText = "";
      let screenshotDataUrl: string | null = null;

      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        await parser.load();

        const textResult = await parser.getText();
        extractedText = (textResult?.text || "").trim();

        if (typeof parser.getScreenshot === "function") {
          try {
            const shot = await parser.getScreenshot({ pageNumber: 1 });
            if (shot?.pages?.[0]?.dataUrl) {
              screenshotDataUrl = shot.pages[0].dataUrl;
            }
          } catch (shotErr) {
            console.warn("No se pudo obtener captura del PDF:", shotErr);
          }
        }

        await parser.destroy();
      } catch (pdfErr) {
        console.warn("Error parseando PDF con PDFParse:", pdfErr);
      }

      if (screenshotDataUrl) {
        messagesContent = [
          {
            type: "text",
            text: `${promptInstructions}\n\nTexto adicional extraído del documento PDF (si aplica):\n${extractedText || "Documento escaneado / con poco texto"}`,
          },
          {
            type: "image_url",
            image_url: { url: screenshotDataUrl },
          },
        ];
      } else {
        messagesContent = [
          {
            type: "text",
            text: `${promptInstructions}\n\nTexto íntegro extraído del documento PDF:\n${extractedText || "No se detectó texto en el PDF. Infiere lo que puedas."}`,
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

    const datosFinales = {
      tipoDocumento: parsedData.tipoDocumento || "Factura",
      numeroDocumento: parsedData.numeroDocumento || "",
      fecha: parsedData.fecha || new Date().toISOString().split("T")[0],
      emisor: parsedData.emisor || "Proveedor General",
      ruc: parsedData.ruc ? String(parsedData.ruc).replace(/\D/g, "") : "",
      concepto: parsedData.concepto || "Gasto o servicio facturado",
      monto: montoNormalizado,
      subtotal: typeof parsedData.subtotal === "number" ? parsedData.subtotal : null,
      igv: typeof parsedData.igv === "number" ? parsedData.igv : null,
      moneda: parsedData.moneda || "PEN",
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
        concepto: datosFinales.concepto,
        urlArchivo: publicUrl,
        estado: "Registrado",
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
