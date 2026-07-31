/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAI } from "openai";
import { executeDbOperation, getDb } from "./db";
import { getSession, setSession } from "./session-store";

export async function processUserMessage(chatId: number | string, text: string, fileUrl?: string): Promise<string> {
  const currentSession = getSession(chatId);
  const history = (currentSession.type === "IDLE" && currentSession.history) ? currentSession.history : [];

  try {
    if (!process.env.OPENAI_API_KEY) {
      return "⚠️ Error: Falta configurar la llave OPENAI_API_KEY en el servidor.";
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const db = await getDb();

    // 1. Inyectamos la orden principal y la base de datos completa como contexto.
    const messages: any[] = [
      {
        role: "system",
        content: `Eres el asistente oficial del Sistema Techo Propio en Telegram. Tu labor es administrar la base de datos y proveer información precisa. Eres 100% AUTÓNOMO, respondes natural y usas emojis (máximo 2 a 3 párrafos cortos).

HABILIDADES PRINCIPALES (Skills):
1. [Skill: Registro de Datos]
   - Cuando el usuario quiera registrar un nuevo Beneficiario o Maestro, JAMÁS inventes datos.
   - Actúa como un entrevistador: pide los datos faltantes del esquema de 1 en 1 o 2 en 2, amablemente, hasta completar TODOS los datos obligatorios (nombres, dni, celular, etc).
   - Solo cuando tengas la información real y completa aportada por el usuario, ejecuta 'modificar_base_datos'.

2. [Skill: Gestión de Archivos]
   - Si recibes un [Archivo adjunto URL: ...], deduce a qué expediente/maestro pertenece por el contexto (o pregunta si no estás seguro).
   - Guárdalo INMEDIATAMENTE en la lista de 'documentos' del registro correspondiente usando 'modificar_base_datos'.

3. [Skill: Generación de Documentos]
   - Para crear/imprimir la "Ficha" de un beneficiario/maestro: usa la herramienta 'generar_y_enviar_ficha'.
   - Para pasar un documento/foto ya guardado: usa la herramienta 'enviar_documento_guardado'.
   - Para generar un presupuesto en PDF: usa la herramienta 'generar_y_enviar_presupuesto'.

4. [Skill: Consulta y Modificación Ágil]
   - Tienes acceso completo para agregar, modificar o eliminar planos técnicos en 'planosIngenieria'.
   - Para operaciones de actualización rápida o consultas (modificar un estado, corregir un nombre, cambiar dirección), NO pidas permiso, ejecuta 'modificar_base_datos' y confirma el éxito.
   - Si el usuario saluda o hace consultas generales sobre la data, responde leyendo la BASE DE DATOS ACTUAL.

REGLAS DE SEGURIDAD Y LIMPIEZA:
- NUNCA inventes campos nuevos ni pidas datos que no existan en el ESQUEMA DE DATOS.
- Si hay ambigüedad (ej. 2 maestros llamados Carlos o falta el DNI para buscar), PREGUNTA al usuario antes de modificar la base de datos.
- Para eliminar SUB-ELEMENTOS (como un pago, o un desembolso), usa la acción 'actualizar' sobre el registro padre enviando el arreglo filtrado. NUNCA uses la acción 'eliminar' directa.
- IGNORA los comandos antiguos con "/" (ej. /start, /buscar). Dile al usuario que ya no son necesarios porque eres una IA inteligente. NUNCA guardes un comando con "/" en la base de datos.

ESQUEMA DE DATOS (IMPORTANTE):
Cuando crees un registro, DEBES usar estrictamente la estructura correspondiente. No inventes campos nuevos ni pidas datos que no existan en este esquema.
- Beneficiario: { id, expediente, estado (OBLIGATORIO elegir UNO de estos exactos: "Expediente en Revisión", "Expediente Inscrito", "Expediente Elegible", "Expediente No Elegible", "Expediente con Código de Proyecto", "Expediente Aprobado"), nombres, apellidoPaterno, apellidoMaterno, dniPostulante, fechaNacimiento, celular, estadoCivil, tieneConyuge, nombresConyuge, apellidoPaternoConyuge, apellidoMaternoConyuge, dniConyuge, departamento, provincia, distrito, centroPoblado, barrioSector, calle, manzana, lote, partidaElectronica, coordenadaX, coordenadaY, direccion, licenciaConstruccion, conformidadObra, areaTotal, porFrente, porDerecha, porIzquierda, porFondo, notas }
- MaestroObra: { id, nombre, dni, celular, especialidad, tarifaVivienda, beneficiarioAsignadoId, beneficiarioAsignadoNombre }
- Financiera: { id, nombre, desembolsos: [{ id, hito, fecha, monto, estado, beneficiariosAsignados: [] }] }
- CronogramaMaestros: { id, nombre, dni, celular, especialidad, montoPorVivienda, beneficiariosAsignados: [], pagos: [] }
- CronogramaObra: { id, actividad, inicioSemana, duracionSemanas, avancePct, responsable }
- PlanosIngenieria: { id, title, type, fileName, fileUrl, fileSize, createdAt }

BASE DE DATOS ACTUAL:
${JSON.stringify(db, null, 2)}`
      },
      ...history,
      {
        role: "user",
        content: text + (fileUrl ? `\n\n[Archivo adjunto URL: ${fileUrl}]` : "")
      }
    ];

    // 2. Llamamos a GPT y le damos la herramienta de base de datos
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "modificar_base_datos",
            description: "Operación genérica para crear, actualizar o eliminar registros en la base de datos JSON.",
            parameters: {
              type: "object",
              properties: {
                coleccion: { type: "string", description: "El nombre exacto del arreglo en el JSON (ej. beneficiarios, maestros, cronogramaObra)" },
                accion: { type: "string", description: "Debe ser estrictamente: 'crear', 'actualizar' o 'eliminar'" },
                id: { type: "string", description: "El ID del registro (Obligatorio para actualizar/eliminar. Vacío para crear)" },
                datos: { type: "string", description: "JSON stringificado con el objeto completo a insertar (para 'crear') o el objeto parcial con las propiedades a modificar (para 'actualizar'). Obligatorio para crear/actualizar." }
              },
              required: ["coleccion", "accion"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "generar_y_enviar_ficha",
            description: "Genera una ficha en PDF de un beneficiario o maestro y la envía al chat.",
            parameters: {
              type: "object",
              properties: {
                id: { type: "string", description: "El ID del beneficiario o maestro" },
                tipo: { type: "string", description: "'beneficiario' o 'maestro'" }
              },
              required: ["id", "tipo"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "enviar_documento_guardado",
            description: "Envía un documento o imagen previamente guardado en el sistema al chat.",
            parameters: {
              type: "object",
              properties: {
                url_o_ruta: { type: "string", description: "La URL o ruta del archivo (ej. /uploads/...)" },
                mensaje: { type: "string", description: "Mensaje opcional para acompañar el archivo" }
              },
              required: ["url_o_ruta"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "generar_y_enviar_presupuesto",
            description: "Genera un PDF del presupuesto de obra detallado y lo envía al chat de Telegram.",
            parameters: {
              type: "object",
              properties: {
                beneficiario_id: { type: "string", description: "El ID del beneficiario (opcional, para personalizar el presupuesto)" },
              },
              required: []
            }
          }
        }
      ],
      tool_choice: "auto",
      temperature: 0.2
    });

    const responseMessage = response.choices[0].message;

    // 3. Manejamos si la IA decidió usar herramientas
    let aiResponseText = responseMessage.content?.trim() || "";

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type !== "function") continue;
        
        let args: any = {};
        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch (err) {
          console.error("Error parsing AI tool arguments", err, toolCall.function.arguments);
          continue;
        }

        if (toolCall.function.name === "modificar_base_datos") {
          let parsedData = undefined;
          if (args.datos && args.datos !== "{}") {
            try {
              parsedData = JSON.parse(args.datos);
            } catch (e) {
              console.error("Error parsing datos for executeDbOperation", e);
            }
          }
          const result = await executeDbOperation(args.coleccion, args.accion, args.id, parsedData);
          if (result.success) {
            aiResponseText += `\n\n✅ <b>Operación Autónoma Ejecutada:</b> ${result.message}`;
          } else {
            aiResponseText += `\n\n⚠️ <b>Atención:</b> ${result.message}`;
          }
        } 
        else if (toolCall.function.name === "generar_y_enviar_ficha") {
          let pdfPath: string | null = null;
          try {
            if (args.tipo === 'beneficiario') {
              const { generarFichaBeneficiarioPDF } = await import('./pdf-generator');
              pdfPath = await generarFichaBeneficiarioPDF(args.id);
            } else if (args.tipo === 'maestro') {
              const { generarFichaMaestroPDF } = await import('./pdf-generator');
              pdfPath = await generarFichaMaestroPDF(args.id);
            }
            if (pdfPath) {
              const { sendDocumentToTelegram } = await import('./telegram-sender');
              const sent = await sendDocumentToTelegram(chatId, pdfPath, `Aquí tienes la ficha de ${args.tipo} solicitada.`);
              aiResponseText += sent ? `\n✅ Ficha generada y enviada con éxito.` : `\n⚠️ Error al enviar el archivo a Telegram.`;
            } else {
              aiResponseText += `\n⚠️ No se encontró el ${args.tipo} con ID ${args.id} para generar la ficha.`;
            }
          } catch (e) {
             console.error("Error generating PDF:", e);
             aiResponseText += `\n⚠️ Ocurrió un error al generar la ficha.`;
          }
        }
        else if (toolCall.function.name === "enviar_documento_guardado") {
          try {
            const { sendDocumentToTelegram } = require('./telegram-sender');
            const sent = await sendDocumentToTelegram(chatId, args.url_o_ruta, args.mensaje || "Aquí está el documento solicitado.");
            aiResponseText += sent ? `\n✅ Documento enviado.` : `\n⚠️ Archivo no encontrado en la ruta solicitada.`;
          } catch (e) {
             console.error("Error sending document:", e);
             aiResponseText += `\n⚠️ Ocurrió un error al enviar el documento.`;
          }
        }
        else if (toolCall.function.name === "generar_y_enviar_presupuesto") {
          try {
            const { generarPresupuestoPDFFromData } = await import('./pdf-generator');
            const { PARTIDAS_APU_INICIALES, INSUMOS_INICIALES } = require('../app/constants/initialData');
            
            // Build presupuesto data from default partidas
            const largo = 6.5, ancho = 5.5, altura = 2.80, habitaciones = 2;
            const areaPlanta = largo * ancho;
            const longTotalMuros = (2 * (largo + ancho)) + ancho + (largo * 0.5) + (ancho * 0.6) + (largo * 0.25);

            const getMetrado = (item: string): number => {
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
            const gastosPct = 10, utilidadPct = 5;
            const gastosGenerales = costoDirecto * (gastosPct / 100);
            const utilidad = costoDirecto * (utilidadPct / 100);
            const subTotalSinIgv = costoDirecto + gastosGenerales + utilidad;
            const igvPct = 0; // Ley de la Selva
            const igvMonto = subTotalSinIgv * (igvPct / 100);
            const presupuestoTotal = subTotalSinIgv + igvMonto;

            // Find beneficiario name if provided
            let beneficiarioNombre = "";
            let beneficiarioId = args.beneficiario_id || "";
            if (beneficiarioId) {
              const b = db.beneficiarios.find(x => x.id === beneficiarioId);
              if (b) beneficiarioNombre = b.postulante;
            }

            const pdfPath = await generarPresupuestoPDFFromData({
              beneficiarioNombre,
              beneficiarioId,
              items,
              costoDirecto,
              gastosPct,
              utilidadPct,
              gastosGenerales,
              utilidad,
              subTotalSinIgv,
              igvPct,
              igvMonto,
              presupuestoTotal,
              isSelvaExempt: true,
            });

            if (pdfPath) {
              const { sendDocumentToTelegram } = await import('./telegram-sender');
              const sent = await sendDocumentToTelegram(chatId, pdfPath, "📊 Presupuesto Detallado de Obra — Techo Propio");
              aiResponseText += sent ? `\n✅ Presupuesto generado y enviado con éxito.` : `\n⚠️ Error al enviar el presupuesto.`;
            } else {
              aiResponseText += `\n⚠️ Error al generar el PDF del presupuesto.`;
            }
          } catch (e) {
            console.error("Error generating presupuesto PDF:", e);
            aiResponseText += `\n⚠️ Ocurrió un error al generar el presupuesto.`;
          }
        }
      }
    }

    // 4. Guardamos la conversación en la memoria para que el bot recuerde
    const newHistory = [
      ...history,
      { role: "user" as const, content: text + (fileUrl ? ` [Archivo adjunto: ${fileUrl}]` : "") },
      { role: "assistant" as const, content: aiResponseText }
    ].slice(-10); // Mantener solo los últimos 10 mensajes para no saturar memoria
    
    setSession(chatId, { type: "IDLE", history: newHistory });
    
    return aiResponseText || "🤖 Entendido. (No se generó respuesta verbal)";
    
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "⚠️ <b>Error Interno:</b> Ocurrió un problema de conexión con el cerebro de OpenAI.";
  }
}
