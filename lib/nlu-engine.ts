/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { getChatHistory, saveChatHistory, CoreMessage } from "./session-store";
import { 
  buscarBeneficiarios, 
  obtenerDetalleBeneficiario, 
  actualizarBeneficiario, 
  buscarMaestros, 
  consultarDesembolsos 
} from "./ai-tools";
import { executeDbOperation } from "./db";

export async function processUserMessage(chatId: number | string, text: string, fileUrl?: string): Promise<string> {
  const strChatId = String(chatId);
  const history = await getChatHistory(strChatId);

  try {
    if (!process.env.OPENAI_API_KEY) {
      return "⚠️ <b>Configuración Requerida:</b> El sistema necesita una clave de OpenAI configurada.";
    }

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Preparar el historial de Vercel AI SDK
    const messages: CoreMessage[] = history;

    // Agregar el mensaje actual
    messages.push({
      role: "user",
      content: text + (fileUrl ? `\n\n[Archivo adjunto URL: ${fileUrl}]` : "")
    });

    const systemPrompt = `Eres el asistente oficial del Sistema Techo Propio en Telegram. Tu labor es administrar la base de datos y proveer información precisa. Eres 100% AUTÓNOMO, respondes natural y usas emojis (máximo 2 a 3 párrafos cortos).

HABILIDADES PRINCIPALES (Skills):
1. [Agente Inteligente]: Ahora eres capaz de ejecutar procesos multi-paso. Si te piden "busca a Juan, cámbiale el teléfono y confirma", usarás la herramienta de buscar, luego la de actualizar, y confirmarás al usuario.
2. [Gestión de Archivos]: Si recibes un [Archivo adjunto URL: ...], deduce a qué expediente pertenece y guárdalo usando 'agregar_documento_beneficiario'. El formato es { "id": "DOC-TIMESTAMP", "tipo": "TIPO_DOCUMENTO", "nombre": "archivo.jpg", "url": "URL_RECIBIDA", "fecha": "DD/MM/YYYY" }.
3. [Generación de PDFs]: Usa las herramientas generar_y_enviar_ficha, generar_y_enviar_presupuesto, etc., para enviar documentos al chat.

REGLAS CRÍTICAS:
- NUNCA respondas que no sabes algo sin antes usar la herramienta de búsqueda de la base de datos.
- Eres capaz de reintentar si te equivocas.
- Responde siempre verificando que la acción se realizó.`;

    const result = await (generateText as any)({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: messages as any,
      maxSteps: 7, // Permite encadenamiento de herramientas! (Agentic Loop)
      tools: {
        buscar_beneficiarios: buscarBeneficiarios,
        obtener_detalle_beneficiario: obtenerDetalleBeneficiario,
        actualizar_beneficiario: actualizarBeneficiario,
        buscar_maestros: buscarMaestros,
        consultar_desembolsos: consultarDesembolsos,

        agregar_documento_beneficiario: tool({
          description: 'Agrega un documento o imagen a un beneficiario.',
          parameters: z.object({
            beneficiarioId: z.string(),
            tipoDocumento: z.string().describe("DNI, Titulo de Propiedad, Fotografia, etc."),
            url: z.string()
          }),
          execute: async ({ beneficiarioId, tipoDocumento, url }: any) => {
            const doc = {
              id: `DOC-${Date.now()}`,
              tipo: tipoDocumento,
              nombre: url.split("/").pop() || "archivo.jpg",
              url: url,
              fecha: new Date().toLocaleDateString("es-PE")
            };
            // Para simplificar, leemos el actual y lo actualizamos (esto lo maneja executeDbOperation)
            // Primero obtenemos el array actual
            const { data } = await (await import('./supabase')).supabase.from('beneficiarios').select('documentos').eq('id', beneficiarioId).single();
            const docs = data?.documentos || [];
            docs.push(doc);
            const res = await executeDbOperation('beneficiarios', 'actualizar', beneficiarioId, { documentos: docs });
            return res.success ? { mensaje: "Documento agregado exitosamente", documento: doc } : { error: res.message };
          }
        }),

        generar_y_enviar_ficha: tool({
          description: "Genera una ficha en PDF de un beneficiario o maestro y la envía al chat.",
          parameters: z.object({
            id: z.string().describe("El ID del beneficiario o maestro"),
            tipo: z.enum(['beneficiario', 'maestro'])
          }),
          execute: async ({ id, tipo }: any) => {
            try {
              let pdfPath: string | null = null;
              if (tipo === 'beneficiario') {
                const { generarFichaBeneficiarioPDF } = await import('./pdf-generator');
                pdfPath = await generarFichaBeneficiarioPDF(id);
              } else {
                const { generarFichaMaestroPDF } = await import('./pdf-generator');
                pdfPath = await generarFichaMaestroPDF(id);
              }
              if (pdfPath) {
                const { sendDocumentToTelegram } = await import('./telegram-sender');
                const sent = await sendDocumentToTelegram(chatId, pdfPath, `Aquí tienes la ficha de ${tipo} solicitada.`);
                return sent ? { mensaje: "Ficha generada y enviada al usuario con éxito." } : { error: "Error enviando PDF a Telegram" };
              }
              return { error: "No se encontró el registro para generar ficha" };
            } catch (e) {
              return { error: "Error interno generando PDF" };
            }
          }
        }),

        enviar_documento_guardado: tool({
          description: "Envía un documento o imagen previamente guardado en el sistema al chat.",
          parameters: z.object({
            url_o_ruta: z.string(),
            mensaje: z.string().optional()
          }),
          execute: async ({ url_o_ruta, mensaje }: any) => {
            try {
              const { sendDocumentToTelegram } = require('./telegram-sender');
              const sent = await sendDocumentToTelegram(chatId, url_o_ruta, mensaje || "Aquí está el documento solicitado.");
              return sent ? { mensaje: "Documento enviado con éxito." } : { error: "Error al enviar el archivo." };
            } catch (e) {
              return { error: "Error interno al enviar archivo." };
            }
          }
        }),

        generar_y_enviar_cronograma: tool({
          description: "Genera un PDF del Cronograma de Obra General (Gantt Interactivo) y lo envía al chat.",
          parameters: z.object({}),
          execute: async () => {
            try {
              const { generarCronogramaObraPDF } = await import('./pdf-generator');
              const absolutePath = await generarCronogramaObraPDF();
              if (!absolutePath) return { error: "Falló la generación del PDF" };
              const { sendDocumentToTelegram } = require('./telegram-sender');
              const sent = await sendDocumentToTelegram(chatId, absolutePath, "Aquí tienes el Cronograma de Ejecución de Obra.");
              return sent ? { mensaje: "Enviado con éxito" } : { error: "Error enviando a Telegram" };
            } catch (e) {
              return { error: "Error interno" };
            }
          }
        }),

        generar_y_enviar_presupuesto: tool({
          description: "Genera un PDF del presupuesto de obra detallado y lo envía al chat de Telegram.",
          parameters: z.object({
            beneficiario_id: z.string().optional()
          }),
          execute: async ({ beneficiario_id }: any) => {
            try {
              const { generarPresupuestoPDFFromData } = await import('./pdf-generator');
              const { PARTIDAS_APU_INICIALES, INSUMOS_INICIALES } = require('../app/constants/initialData');
              
              // Build presupuesto data
              const largo = 6.5, ancho = 5.5, altura = 2.80;
              const areaPlanta = largo * ancho;
              const longTotalMuros = (2 * (largo + ancho)) + ancho + (largo * 0.5) + (ancho * 0.6) + (largo * 0.25);
              const getMetrado = (item: string) => {
                switch (item) {
                  case "01.01": case "01.02": case "06.01": return areaPlanta;
                  case "02.01": return longTotalMuros * 0.40 * 1.00;
                  case "03.01": return longTotalMuros * 0.40 * 0.80;
                  case "04.01": return Math.max(0, (longTotalMuros * altura) - 6.50);
                  case "05.01": return 12 * 0.15 * 0.25 * altura;
                  case "07.01": case "07.02": return Math.max(0, (longTotalMuros * altura) - 6.50) * 2;
                  case "08.01": return 1.00;
                  default: return 0;
                }
              };

              const getCostoUnitario = (p: any): number => {
                let total = 0;
                const calcSection = (details: any[]) => {
                  details.forEach((d: any) => {
                    const ins = INSUMOS_INICIALES.find((i: any) => i.id === d.insumoId);
                    if (ins) total += d.coeficiente * ins.precioUnitario;
                  });
                };
                calcSection(p.manoDeObra);
                calcSection(p.materiales);
                calcSection(p.equipos);
                return total;
              };

              const items = PARTIDAS_APU_INICIALES.map((p: any) => {
                const metrado = getMetrado(p.item);
                const unitario = getCostoUnitario(p);
                return { item: p.item, descripcion: p.descripcion, unidad: p.unidad, metrado, unitario, parcial: metrado * unitario };
              });

              const costoDirecto = items.reduce((acc: number, curr: any) => acc + curr.parcial, 0);
              const gastosPct = 10, utilidadPct = 5, igvPct = 0;
              const gastosGenerales = costoDirecto * (gastosPct / 100);
              const utilidad = costoDirecto * (utilidadPct / 100);
              const subTotalSinIgv = costoDirecto + gastosGenerales + utilidad;
              const igvMonto = 0;
              const presupuestoTotal = subTotalSinIgv + igvMonto;

              let beneficiarioNombre = "";
              if (beneficiario_id) {
                const { data } = await (await import('./supabase')).supabase.from('beneficiarios').select('postulante').eq('id', beneficiario_id).single();
                if (data) beneficiarioNombre = data.postulante;
              }

              const pdfPath = await generarPresupuestoPDFFromData({
                beneficiarioNombre, beneficiarioId: beneficiario_id || "",
                items, costoDirecto, gastosPct, utilidadPct, gastosGenerales, utilidad,
                subTotalSinIgv, igvPct, igvMonto, presupuestoTotal, isSelvaExempt: true,
              });

              if (pdfPath) {
                const { sendDocumentToTelegram } = await import('./telegram-sender');
                const sent = await sendDocumentToTelegram(chatId, pdfPath, "📊 Presupuesto Detallado de Obra — Techo Propio");
                return sent ? { mensaje: "Presupuesto enviado exitosamente" } : { error: "Error enviando a Telegram" };
              }
              return { error: "No se generó el PDF" };
            } catch (e) {
              return { error: "Error interno" };
            }
          }
        })
      }
    });

    // Añadir mensajes nuevos a la historia (usuario y respuesta)
    // Extraemos todos los pasos del agente para guardarlos en la historia y mantener contexto de qué herramientas usó
    const updatedHistory = [...messages, ...result.response.messages];

    // Limitar a los últimos 20 mensajes para no saturar memoria
    const trimmedHistory = updatedHistory.slice(-20);
    await saveChatHistory(strChatId, trimmedHistory as CoreMessage[]);

    return result.text || "✅ Ejecutado.";
    
  } catch (error) {
    console.error("OpenAI/AI SDK Error:", error);
    return "⚠️ <b>Error Interno:</b> Ocurrió un problema procesando tu solicitud de forma autónoma.";
  }
}
