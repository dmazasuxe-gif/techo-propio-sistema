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
  actualizarMaestro,
  asignarBeneficiarioAMaestro,
  consultarDesembolsos 
} from "./ai-tools";
import { executeDbOperation } from "./db";
import { supabase } from "./supabase";
import { resolverBeneficiario, resolverMaestro, getNombreBeneficiario, getNombreMaestro } from "./entity-resolution";

export async function processUserMessage(chatId: number | string, text: string, fileUrl?: string): Promise<string> {
  const strChatId = String(chatId);
  const history = await getChatHistory(strChatId);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`[NLU] NUEVO MENSAJE — chatId: ${strChatId}`);
  console.log(`[NLU] TEXTO: "${text}"`);
  console.log(`[NLU] ARCHIVO: ${fileUrl || "ninguno"}`);
  console.log(`${"=".repeat(60)}`);

  try {
    if (!process.env.OPENAI_API_KEY) {
      return "⚠️ <b>Configuración Requerida:</b> El sistema necesita una clave de OpenAI configurada.";
    }

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Limpiar el historial para evitar errores de OpenAI 400 (huérfanos de tool_calls)
    // Conservamos solo los mensajes de usuario y las respuestas de texto del asistente
    const cleanHistory = history.map(msg => {
      if (msg.role === 'user') return msg;
      if (msg.role === 'assistant') {
         let textContent = "";
         if (typeof msg.content === 'string') {
           textContent = msg.content;
         } else if (Array.isArray(msg.content)) {
           const textParts = msg.content.filter((part: any) => part.type === 'text');
           textContent = textParts.map((p: any) => p.text).join('\n');
         }
         return textContent ? { role: 'assistant', content: textContent } : null;
      }
      return null;
    }).filter(Boolean) as CoreMessage[];

    const messages: CoreMessage[] = [...cleanHistory];

    // Agregar el mensaje actual
    messages.push({
      role: "user",
      content: text + (fileUrl ? `\n\n[Archivo adjunto URL: ${fileUrl}]` : "")
    });

    const systemPrompt = `Eres el Agente de IA Oficial del Sistema Techo Propio — Constructora Maza Quiroz. Tu labor es administrar la base de datos, asignar maestros, consultar datos, gestionar documentos y generar fichas PDF.

1. NUNCA inventes IDs. Los IDs internos son cadenas como "beneficiario_1" o "maestro_1".

2. Para BÚSQUEDAS de información: Si el usuario te pregunta por datos de alguien, SIEMPRE llama a buscar_beneficiarios o buscar_maestros ANTES de responder.

3. Para generar fichas PDF: Usa la herramienta generar_y_enviar_ficha pasándole el nombre. El sistema buscará automáticamente.

4. Para ASIGNAR beneficiarios a maestros: Usa la herramienta asignar_beneficiario_a_maestro INMEDIATAMENTE con los nombres que te dio el usuario. ESTA HERRAMIENTA BUSCA AUTOMÁTICAMENTE. Por lo tanto, NO uses buscar_beneficiarios ni buscar_maestros antes. NO pidas confirmación, simplemente asígnalos de un solo golpe.

5. Si una herramienta devuelve "ambiguous", MUESTRA las opciones al usuario.

6. Informa errores EXACTAMENTE como los devuelve la herramienta.

METODOLOGÍA DE TRABAJO:
1. PENSAR: ¿Qué herramienta es la más directa para lo que pide el usuario?
2. EJECUTAR INMEDIATAMENTE: Usa la herramienta correspondiente. Si la herramienta pide nombres, pásale los nombres que el usuario te dio. NO asumas que necesitas IDs internos a menos que la herramienta lo requiera estrictamente.
3. VERIFICAR: Lee el resultado que devuelve la herramienta (ya sea éxito, error o ambiguo).
4. RESPONDER: Informa al usuario el resultado real basado en la respuesta de la herramienta.

HABILIDADES:
- Búsqueda de beneficiarios y maestros por nombre, DNI o ID.
- Consulta de expedientes completos.
- Asignación de beneficiarios a maestros (pasar los NOMBRES directamente a la herramienta).
- Generación y envío de fichas PDF (beneficiario o maestro).
- Generación de cronogramas y presupuestos PDF.
- Gestión de documentos (agregar, enviar).
- Consulta de desembolsos financieros.

Usa emojis y mantén un tono profesional pero amigable.`;

    // @ts-ignore
    const result = await (generateText as any)({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: messages as any,
      maxSteps: 7, // Permite encadenamiento de herramientas (Agentic Loop)
      tools: {
        buscar_beneficiarios: buscarBeneficiarios,
        obtener_detalle_beneficiario: obtenerDetalleBeneficiario,
        actualizar_beneficiario: actualizarBeneficiario,
        buscar_maestros: buscarMaestros,
        actualizar_maestro: actualizarMaestro,
        asignar_beneficiario_a_maestro: asignarBeneficiarioAMaestro,
        consultar_desembolsos: consultarDesembolsos,

        agregar_documento_beneficiario: tool({
          description: 'Agrega un documento o imagen a un beneficiario. Requiere el ID real del beneficiario (obtenido previamente con buscar_beneficiarios).',
          parameters: z.object({
            beneficiarioId: z.string(),
            tipoDocumento: z.string().describe("DNI, Titulo de Propiedad, Fotografia, etc."),
            url: z.string()
          }),
          // @ts-ignore
          execute: async ({ beneficiarioId, tipoDocumento, url }: any) => {
            console.log(`[TOOL:agregar_documento] INPUT: beneficiarioId="${beneficiarioId}", tipo="${tipoDocumento}"`);
            const doc = {
              id: `DOC-${Date.now()}`,
              tipo: tipoDocumento,
              nombre: url.split("/").pop() || "archivo.jpg",
              url: url,
              fecha: new Date().toLocaleDateString("es-PE")
            };
            const { data } = await supabase.from('beneficiarios').select('documentos').eq('id', beneficiarioId).single();
            const docs = data?.documentos || [];
            docs.push(doc);
            const res = await executeDbOperation('beneficiarios', 'actualizar', beneficiarioId, { documentos: docs });
            return res.success ? { mensaje: "Documento agregado exitosamente", documento: doc } : { error: res.message };
          }
        }),

        generar_y_enviar_ficha: tool({
          description: "Genera una ficha PDF de un beneficiario o maestro y la envía por Telegram. SOLO REQUIERE EL NOMBRE O ID DE LA PERSONA.",
          parameters: z.object({
            nombre_o_id: z.string().describe("Ej: 'Yoar', 'Daniel', 'beneficiario_1'. ES OBLIGATORIO ESCRIBIRLO AQUÍ.")
          }),
          // @ts-ignore
          execute: async (args: any) => {
            let { nombre_o_id } = args || {};
            console.log(`[TOOL:generar_y_enviar_ficha] ARGS:`, args);
            
            // FALLBACK 1: Si la IA falla en extraer el nombre, intentamos sacarlo del mensaje actual
            if (!nombre_o_id) {
              const idMatch = text.match(/(beneficiario_[0-9]+|maestro_[0-9]+)/i);
              if (idMatch) {
                nombre_o_id = idMatch[1];
              } else {
                const words = text.split(' ').filter(w => !['este','es','el','id','del','que','quiero','su','ficha','pdf','envíame','enviame','de','la','para','si','por','favor'].includes(w.toLowerCase()) && w.length > 2);
                if (words.length > 0) nombre_o_id = words[0];
              }
            }

            // FALLBACK 2: Si el mensaje era solo "si", sacamos el ID del historial
            if (!nombre_o_id && text.toLowerCase().trim() === 'si') {
              // Buscar en los ultimos mensajes del historial alguna referencia
              const lastMsgs = history.slice(-3).map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content)).join(' ');
              const pastMatch = lastMsgs.match(/(beneficiario_[0-9]+|maestro_[0-9]+)/i);
              if (pastMatch) nombre_o_id = pastMatch[1];
              else return { error: "No pude identificar de quién quieres la ficha. Por favor, dime el nombre exacto." };
            }

            if (!nombre_o_id) return { error: "Parámetros inválidos. Debes especificar un nombre o ID." };

            try {
              // DUAL ENTITY RESOLUTION: Buscamos en ambas tablas porque no sabemos si es maestro o beneficiario
              let tipoDeFicha = 'beneficiario';
              let resolucion = await resolverBeneficiario(nombre_o_id);

              if (!resolucion.success || resolucion.code === 'ENTITY_NOT_FOUND') {
                const resMaestro = await resolverMaestro(nombre_o_id);
                if (resMaestro.success) {
                  resolucion = resMaestro;
                  tipoDeFicha = 'maestro';
                }
              }

              if (!resolucion.success) return { error: resolucion.message };
              if (resolucion.code === 'ENTITY_AMBIGUOUS') return { error: resolucion.message, opciones: resolucion.matches };

              const registro = resolucion.entity;
              const nombreEntidad = tipoDeFicha === 'beneficiario' ? getNombreBeneficiario(registro) : getNombreMaestro(registro);
              
              let pdfPath: string | null = null;
              if (tipoDeFicha === 'beneficiario') {
                const { generarFichaBeneficiarioPDF } = await import('./pdf-generator');
                pdfPath = await generarFichaBeneficiarioPDF(registro.id);
              } else {
                const { generarFichaMaestroPDF } = await import('./pdf-generator');
                pdfPath = await generarFichaMaestroPDF(registro.id);
              }
              
              if (!pdfPath) return { error: `Generador de PDF falló para ${nombreEntidad}. Verifica Browserless.` };

              const { sendDocumentToTelegram } = await import('./telegram-sender');
              const sent = await sendDocumentToTelegram(chatId, pdfPath, `📋 Ficha de ${tipoDeFicha}: ${nombreEntidad}`);
              return sent ? { mensaje: `PDF de ${nombreEntidad} generado y enviado correctamente.` } : { error: `Telegram rechazó el envío de ${pdfPath}` };
            } catch (e: any) {
              return { error: e.message };
            }
          }
        }),

        enviar_documento_guardado: tool({
          description: "Envía un documento o imagen previamente guardado en el sistema al chat de Telegram. Requiere la URL o ruta del archivo.",
          parameters: z.object({
            url_o_ruta: z.string(),
            mensaje: z.string().optional()
          }),
          // @ts-ignore
          execute: async ({ url_o_ruta, mensaje }: any) => {
            console.log(`[TOOL:enviar_documento] INPUT: url="${url_o_ruta}"`);
            try {
              const { sendDocumentToTelegram } = require('./telegram-sender');
              const sent = await sendDocumentToTelegram(chatId, url_o_ruta, mensaje || "Aquí está el documento solicitado.");
              return sent ? { mensaje: "Documento enviado con éxito." } : { error: "Error al enviar el archivo a Telegram." };
            } catch (e) {
              return { error: "Error interno al enviar archivo." };
            }
          }
        }),

        generar_y_enviar_cronograma: tool({
          description: "Genera un PDF del Cronograma de Obra General y lo envía al chat.",
          parameters: z.object({}),
          // @ts-ignore
          execute: async () => {
            console.log(`[TOOL:generar_cronograma] Iniciando...`);
            try {
              const { generarCronogramaObraPDF } = await import('./pdf-generator');
              const absolutePath = await generarCronogramaObraPDF();
              if (!absolutePath) return { error: "Falló la generación del PDF de cronograma." };
              const { sendDocumentToTelegram } = require('./telegram-sender');
              const sent = await sendDocumentToTelegram(chatId, absolutePath, "📅 Cronograma de Ejecución de Obra — Techo Propio");
              return sent ? { mensaje: "Cronograma enviado con éxito." } : { error: "Error enviando cronograma a Telegram." };
            } catch (e: any) {
              return { error: `Error generando cronograma: ${e.message}` };
            }
          }
        }),

        generar_y_enviar_presupuesto: tool({
          description: "Genera un PDF del presupuesto de obra detallado y lo envía al chat de Telegram. Opcionalmente acepta un nombre o ID de beneficiario.",
          parameters: z.object({
            beneficiario_query: z.string().optional().describe("Nombre, DNI o ID del beneficiario (opcional)")
          }),
          // @ts-ignore
          execute: async ({ beneficiario_query }: any) => {
            console.log(`[TOOL:generar_presupuesto] INPUT: beneficiario_query="${beneficiario_query}"`);
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
              let beneficiarioId = "";
              if (beneficiario_query) {
                // Resolver beneficiario por nombre/DNI/ID
                let { data } = await supabase.from('beneficiarios').select('id, postulante').eq('id', beneficiario_query);
                if (!data || data.length === 0) {
                  const r2 = await supabase.from('beneficiarios').select('id, postulante')
                    .or(`postulante.ilike.%${beneficiario_query}%,dni_postulante.ilike.%${beneficiario_query}%`);
                  data = r2.data;
                }
                if (data && data.length > 0) {
                  beneficiarioNombre = data[0].postulante;
                  beneficiarioId = data[0].id;
                }
              }

              const pdfPath = await generarPresupuestoPDFFromData({
                beneficiarioNombre, beneficiarioId,
                items, costoDirecto, gastosPct, utilidadPct, gastosGenerales, utilidad,
                subTotalSinIgv, igvPct, igvMonto, presupuestoTotal, isSelvaExempt: true,
              });

              if (pdfPath) {
                const { sendDocumentToTelegram } = await import('./telegram-sender');
                const sent = await sendDocumentToTelegram(chatId, pdfPath, "📊 Presupuesto Detallado de Obra — Techo Propio");
                return sent ? { mensaje: "Presupuesto enviado exitosamente." } : { error: "Error enviando presupuesto a Telegram." };
              }
              return { error: "No se generó el PDF del presupuesto." };
            } catch (e: any) {
              return { error: `Error generando presupuesto: ${e.message}` };
            }
          }
        })
      }
    });

    // Añadir mensajes nuevos a la historia
    const updatedHistory = [...messages, ...result.response.messages];

    let finalResponse = result.text;
    if (!finalResponse && result.toolResults && result.toolResults.length > 0) {
      // Si la IA usó una herramienta pero no generó texto de respuesta final, forzamos un resumen
      const summaryResult = await (generateText as any)({
        model: openai("gpt-4o-mini"),
        messages: [
          ...updatedHistory,
          { role: "user", content: "Por favor, dile al usuario en lenguaje natural y breve qué acción acabas de realizar basándote en la herramienta que ejecutaste." }
        ]
      });
      finalResponse = summaryResult.text;
      updatedHistory.push(...summaryResult.response.messages);
    }

    // Limitar a los últimos 20 mensajes para no saturar memoria
    const trimmedHistory = updatedHistory.slice(-20);
    await saveChatHistory(strChatId, trimmedHistory as CoreMessage[]);

    console.log(`[NLU] RESPUESTA FINAL: "${(finalResponse || "").substring(0, 100)}..."`);
    return finalResponse || "✅ Ejecutado correctamente.";
    
  } catch (error) {
    console.error("[NLU] CRITICAL ERROR:", error);
    return "⚠️ <b>Error Interno:</b> Ocurrió un problema procesando tu solicitud.";
  }
}
