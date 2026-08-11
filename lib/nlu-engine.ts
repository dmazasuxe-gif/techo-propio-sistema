/* eslint-disable @typescript-eslint/no-explicit-any */
import { getChatHistory, saveChatHistory, CoreMessage } from "./session-store";
import { 
  buscarBeneficiarios, 
  obtenerDetalleBeneficiario, 
  actualizarBeneficiario, 
  buscarMaestros,
  actualizarMaestro,
  asignarBeneficiarioAMaestro,
  consultarDesembolsos,
  registrarMaestro,
  registrarBeneficiario
} from "./ai-tools";
import { executeDbOperation } from "./db";
import { supabase } from "./supabase";
import { customGenerateText } from "./custom-llm";

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
      return "❌ <b>Configuración Requerida:</b> El sistema necesita una clave de OpenAI configurada.";
    }

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
7. PARA REGISTRAR BENEFICIARIOS: Eres un asistente de inscripción riguroso. El formulario oficial requiere muchos datos. NO registres a medias. Cuando el usuario quiera registrar un beneficiario, PÍDELE LOS SIGUIENTES DATOS (puedes pedirlos por partes):
   - Postulante: Nombres, Apellidos, DNI, Nacimiento, Celular, Estado Civil.
   - Carga Familiar / Cónyuge: Nombres, DNI, Parentesco, Nacimiento.
   - Ubicación: Departamento, Provincia, Distrito, Centro Poblado, Barrio, Calle, Mz, Lote, Partida Electrónica.
   - Linderos: Área Total, Frente, Derecha, Izquierda, Fondo.
   - Documentos: PREGUNTA EXPLÍCITAMENTE si va a subir documentos (DNI, Contrato, Planos, Voucher, Acta) y pídele que envíe el archivo si es así.
   Solo registra cuando tengas esta información.

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
- Generación y envío de PDF por Entidad Financiera (Cajas, Bancos).

Usa emojis y mantén un tono profesional pero amigable.`;

    const customTools = [
      buscarBeneficiarios,
      obtenerDetalleBeneficiario,
      actualizarBeneficiario,
      buscarMaestros,
      actualizarMaestro,
      asignarBeneficiarioAMaestro,
      consultarDesembolsos,
      registrarMaestro,
      registrarBeneficiario,
      {
        name: "agregar_documento_beneficiario",
        description: 'Agrega un documento o imagen a un beneficiario. Requiere el ID real del beneficiario.',
        parametersSchema: {
          type: "object",
          properties: {
            beneficiarioId: { type: "string" },
            tipoDocumento: { type: "string", description: "DNI, Titulo de Propiedad, Fotografia, etc." },
            url: { type: "string" }
          },
          required: ["beneficiarioId", "tipoDocumento", "url"]
        },
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
      },
      {
        name: "generar_y_enviar_ficha",
        description: "Genera una ficha PDF de un beneficiario o maestro y la envía por Telegram.",
        parametersSchema: {
          type: "object",
          properties: {
            nombre_o_id: { type: "string", description: "Ej: 'Yoar', 'Daniel', 'beneficiario_1'. ES OBLIGATORIO ESCRIBIRLO AQUÍ." }
          },
          required: ["nombre_o_id"]
        },
        execute: async (args: any) => {
          let { nombre_o_id } = args || {};
          console.log(`[TOOL:generar_y_enviar_ficha] ARGS:`, args);
          if (!nombre_o_id) {
            const idMatch = text.match(/(beneficiario_[0-9]+|maestro_[0-9]+)/i);
            if (idMatch) nombre_o_id = idMatch[1];
            else {
              const words = text.split(' ').filter(w => !['este','es','el','id','del','que','quiero','su','ficha','pdf','envíame','enviame','de','la','para','si','por','favor'].includes(w.toLowerCase()) && w.length > 2);
              if (words.length > 0) nombre_o_id = words[0];
            }
          }
          if (!nombre_o_id) return { error: "No se proporcionó un nombre o ID para generar la ficha." };
          try {
            const { generarFichaBeneficiarioPDF, generarFichaMaestroPDF } = await import('./pdf-generator');
            const { resolverBeneficiario, resolverMaestro } = require('./entity-resolution');
            let entidad = null;
            let esMaestro = false;
            let resBen = await resolverBeneficiario(nombre_o_id);
            if (resBen.success) { entidad = resBen.entity; }
            else {
              let resMae = await resolverMaestro(nombre_o_id);
              if (resMae.success) { entidad = resMae.entity; esMaestro = true; }
            }
            if (!entidad) return { error: "No se encontró ningún beneficiario o maestro con ese nombre." };
            
            const pdfPath = esMaestro 
              ? await generarFichaMaestroPDF(entidad.id) 
              : await generarFichaBeneficiarioPDF(entidad.id);

            if (!pdfPath) return { error: "Falló la generación del PDF." };
            const { sendDocumentToTelegram } = require('./telegram-sender');
            const nombreEntidad = esMaestro ? entidad.nombre : entidad.postulante;
            const sent = await sendDocumentToTelegram(chatId, pdfPath, "📄 Ficha Técnica - " + nombreEntidad);
            return sent ? { mensaje: `PDF de ${nombreEntidad} generado y enviado correctamente.` } : { error: `Telegram rechazó el envío` };
          } catch (e: any) {
            return { error: e.message };
          }
        }
      },
      {
        name: "enviar_documento_guardado",
        description: "Envía un documento o imagen previamente guardado en el sistema al chat de Telegram.",
        parametersSchema: {
          type: "object",
          properties: {
            url_o_ruta: { type: "string" },
            mensaje: { type: "string" }
          },
          required: ["url_o_ruta"]
        },
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
      },
      {
        name: "generar_y_enviar_cronograma",
        description: "Genera un PDF del Cronograma de Obra General y lo envía al chat.",
        parametersSchema: { type: "object", properties: {} },
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
      },
      {
        name: "generar_y_enviar_reporte_financiera",
        description: "Genera un PDF de la financiera solicitada y lo envía al chat de Telegram.",
        parametersSchema: {
          type: "object",
          properties: {
            financiera_nombre: { type: "string", description: "Nombre de la financiera (ej. Caja Piura, BanBif)" }
          },
          required: ["financiera_nombre"]
        },
        execute: async ({ financiera_nombre }: any) => {
          console.log(`[TOOL:generar_y_enviar_reporte_financiera] INPUT: financiera_nombre="${financiera_nombre}"`);
          try {
            const { data: financieras } = await supabase.from('financieras').select('*');
            if (!financieras || financieras.length === 0) return { error: "No hay financieras registradas en la base de datos." };
            
            // Búsqueda simple insensible a mayúsculas
            const term = (financiera_nombre || "").toLowerCase().trim();
            let fin = financieras.find(f => (f.nombre || "").toLowerCase().includes(term));
            
            if (!fin) return { error: `No se encontró la financiera "${financiera_nombre}".` };
            
            const { data: beneficiariosData } = await supabase.from('beneficiarios').select('*');
            const beneficiarios = beneficiariosData || [];
            
            const { generarFinancieraPDFFromData } = await import('./pdf-generator');
            const absolutePath = await generarFinancieraPDFFromData(fin, beneficiarios);
            if (!absolutePath) return { error: "Falló la generación del PDF de la financiera." };
            
            const { sendDocumentToTelegram } = require('./telegram-sender');
            const sent = await sendDocumentToTelegram(chatId, absolutePath, `🏦 Reporte de Entidad Financiera — ${fin.nombre}`);
            return sent ? { mensaje: `Reporte de ${fin.nombre} enviado con éxito.` } : { error: "Error enviando reporte a Telegram." };
          } catch (e: any) {
            return { error: `Error generando reporte financiera: ${e.message}` };
          }
        }
      },
      {
        name: "generar_y_enviar_presupuesto",
        description: "Genera un PDF del presupuesto de obra detallado y lo envía al chat de Telegram.",
        parametersSchema: {
          type: "object",
          properties: {
            beneficiario_query: { type: "string", description: "Nombre, DNI o ID del beneficiario (opcional)" }
          }
        },
        execute: async ({ beneficiario_query }: any) => {
          console.log(`[TOOL:generar_presupuesto] INPUT: beneficiario_query="${beneficiario_query}"`);
          try {
            const { generarPresupuestoPDFFromData } = await import('./pdf-generator');
            const { PARTIDAS_APU_INICIALES, INSUMOS_INICIALES } = require('../app/constants/initialData');
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
              const sent = await sendDocumentToTelegram(chatId, pdfPath, "💰 Presupuesto Detallado de Obra — Techo Propio");
              return sent ? { mensaje: "Presupuesto enviado exitosamente." } : { error: "Error enviando presupuesto a Telegram." };
            }
            return { error: "No se generó el PDF del presupuesto." };
          } catch (e: any) {
            return { error: `Error generando presupuesto: ${e.message}` };
          }
        }
      }
    ];

    const result = await customGenerateText({
      system: systemPrompt,
      messages: messages as any,
      tools: customTools,
      maxSteps: 7
    });

    const trimmedHistory = result.messages.slice(-20);
    await saveChatHistory(strChatId, trimmedHistory);

    console.log(`[NLU] RESPUESTA FINAL: "${(result.text || "").substring(0, 100)}..."`);
    return result.text || "✅ Ejecutado correctamente.";
    
  } catch (error) {
    console.error("[NLU] CRITICAL ERROR:", error);
    return "❌ <b>Error Interno:</b> Ocurrió un problema procesando tu solicitud.";
  }
}
