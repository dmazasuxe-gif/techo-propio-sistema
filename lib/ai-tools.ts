import { supabase } from './supabase';
import { executeDbOperation, logAIAction } from './db';
import { resolverBeneficiario, resolverMaestro, getNombreBeneficiario, getNombreMaestro } from './entity-resolution';

// ============================================================
// TOOLS DE LA IA — Todas usan entity-resolution.ts centralizado
// ============================================================

export const buscarBeneficiarios = {
  name: "buscar_beneficiarios",
  description: 'Busca beneficiarios en la base de datos por nombre, DNI, departamento o estado. SIEMPRE usa esta herramienta antes de cualquier operación sobre un beneficiario.',
  parametersSchema: {
    type: "object",
    properties: {
      terminoBusqueda: { type: "string", description: "Nombre, DNI o texto a buscar" },
      estado: { type: "string", description: "Filtrar por estado (ej. Expediente Aprobado)" },
      departamento: { type: "string", description: "Filtrar por departamento (ej. San Martin)" }
    }
  },
  execute: async ({ terminoBusqueda, estado, departamento }: any) => {
    console.log(`[TOOL:buscar_beneficiarios] INPUT: terminoBusqueda="${terminoBusqueda}", estado="${estado}", departamento="${departamento}"`);
    let query = supabase.from('beneficiarios').select('id, postulante, dni_postulante, celular, departamento, estado, etapa_vivienda, avance_vivienda_pct, maestro_asignado_nombre');
    if (estado) query = query.eq('estado', estado);
    if (departamento) query = query.eq('departamento', departamento);
    if (terminoBusqueda && terminoBusqueda.trim() !== '') {
      query = query.or(`postulante.ilike.%${terminoBusqueda}%,dni_postulante.ilike.%${terminoBusqueda}%`);
    }
    const { data, error } = await query.limit(5);
    if (error) return { error: error.message };
    console.log(`[TOOL:buscar_beneficiarios] RESULTADO: ${data?.length || 0} beneficiario(s)`);
    if (!data || data.length === 0) return { mensaje: "No se encontraron beneficiarios.", resultados: 0 };
    return { beneficiarios: data, resultados: data.length };
  },
};

export const obtenerDetalleBeneficiario = {
  name: "obtener_detalle_beneficiario",
  description: 'Obtiene el expediente completo y detallado de un beneficiario específico.',
  parametersSchema: {
    type: "object",
    properties: { id: { type: "string", description: "El ID real del beneficiario" } },
    required: ["id"]
  },
  execute: async ({ id }: any) => {
    console.log(`[TOOL:detalle_beneficiario] INPUT: id="${id}"`);
    const { data, error } = await supabase.from('beneficiarios').select('*').eq('id', id).single();
    if (error) return { error: error.message };
    return { beneficiario: data };
  },
};

export const actualizarBeneficiario = {
  name: "actualizar_beneficiario",
  description: 'Actualiza campos de un beneficiario.',
  parametersSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "El nombre completo, DNI o ID del beneficiario" },
      campos: { type: "object", description: "Campos a actualizar en formato snake_case" }
    },
    required: ["query", "campos"]
  },
  execute: async ({ query, campos }: any) => {
    console.log(`[TOOL:actualizar_beneficiario] INPUT: query="${query}"`);
    const resBen = await resolverBeneficiario(query);
    if (resBen.code === 'ENTITY_NOT_FOUND') return { error: resBen.message };
    if (resBen.code === 'ENTITY_AMBIGUOUS') return { status: "ambiguous", mensaje: resBen.message, opciones: resBen.matches };
    if (!resBen.success) return { error: resBen.message };

    const beneficiarioId = resBen.entity.id;
    const result = await executeDbOperation('beneficiarios', 'actualizar', beneficiarioId, campos);
    await logAIAction('actualizar_beneficiario', 'beneficiarios', beneficiarioId, campos, result.success ? 'success' : 'error');
    return result;
  },
};

export const buscarMaestros = {
  name: "buscar_maestros",
  description: 'Busca maestros de obra por nombre o DNI.',
  parametersSchema: {
    type: "object",
    properties: { terminoBusqueda: { type: "string", description: "Nombre o DNI del maestro" } }
  },
  execute: async ({ terminoBusqueda }: any) => {
    console.log(`[TOOL:buscar_maestros] INPUT: terminoBusqueda="${terminoBusqueda}"`);
    let query = supabase.from('maestros').select('*');
    if (terminoBusqueda && terminoBusqueda.trim() !== '') {
      query = query.or(`nombre.ilike.%${terminoBusqueda}%,dni.ilike.%${terminoBusqueda}%`);
    }
    const { data, error } = await query.limit(5);
    if (error) return { error: error.message };
    console.log(`[TOOL:buscar_maestros] RESULTADO: ${data?.length || 0} maestro(s)`);
    if (!data || data.length === 0) return { mensaje: "No se encontraron maestros.", resultados: 0 };
    return { maestros: data, resultados: data.length };
  },
};

export const actualizarMaestro = {
  name: "actualizar_maestro",
  description: 'Actualiza campos de un maestro.',
  parametersSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "El nombre completo, DNI o ID del maestro" },
      campos: { type: "object", description: "Campos a actualizar en formato snake_case" }
    },
    required: ["query", "campos"]
  },
  execute: async ({ query, campos }: any) => {
    console.log(`[TOOL:actualizar_maestro] INPUT: query="${query}"`);
    const resMae = await resolverMaestro(query);
    if (resMae.code === 'ENTITY_NOT_FOUND') return { error: resMae.message };
    if (resMae.code === 'ENTITY_AMBIGUOUS') return { status: "ambiguous", mensaje: resMae.message, opciones: resMae.matches };
    if (!resMae.success) return { error: resMae.message };

    const maestroId = resMae.entity.id;
    const result = await executeDbOperation('maestros', 'actualizar', maestroId, campos);
    await logAIAction('actualizar_maestro', 'maestros', maestroId, campos, result.success ? 'success' : 'error');
    return result;
  },
};

export const asignarBeneficiarioAMaestro = {
  name: "asignar_beneficiario_a_maestro",
  description: 'Asigna un beneficiario a un maestro. Acepta nombres, DNIs o IDs.',
  parametersSchema: {
    type: "object",
    properties: {
      beneficiario: { type: "string", description: 'EL NOMBRE EXACTO ESCRITO POR EL USUARIO para el beneficiario (ej. "Yoar Daniel Maza Suxe")' },
      maestro: { type: "string", description: 'EL NOMBRE EXACTO ESCRITO POR EL USUARIO para el maestro (ej. "Daniel Maza Suxe")' }
    },
    required: ["beneficiario", "maestro"]
  },
  execute: async (args: any) => {
    const beneficiarioQuery = args?.beneficiario || args?.beneficiarioQuery || args?.beneficiario_id || "";
    const maestroQuery = args?.maestro || args?.maestroQuery || args?.maestro_id || "";
    
    if (!beneficiarioQuery || !maestroQuery) {
      return { status: "error", error: "Faltan datos. Parámetros recibidos por la IA: " + JSON.stringify(args) };
    }

    console.log(`[TOOL:asignar] INPUT: beneficiario="${beneficiarioQuery}", maestro="${maestroQuery}"`);
    const resBen = await resolverBeneficiario(beneficiarioQuery);
    if (resBen.code === 'ENTITY_NOT_FOUND') return { status: "error", error: resBen.message };
    if (resBen.code === 'ENTITY_AMBIGUOUS') return { status: "ambiguous", mensaje: resBen.message, opciones: resBen.matches };
    if (!resBen.success) return { status: "error", error: resBen.message };

    const resMae = await resolverMaestro(maestroQuery);
    if (resMae.code === 'ENTITY_NOT_FOUND') return { status: "error", error: resMae.message };
    if (resMae.code === 'ENTITY_AMBIGUOUS') return { status: "ambiguous", mensaje: resMae.message, opciones: resMae.matches };
    if (!resMae.success) return { status: "error", error: resMae.message };

    const ben = resBen.entity;
    const mae = resMae.entity;
    const beneficiarioId = ben.id;
    const beneficiarioNombre = getNombreBeneficiario(ben);
    const maestroId = mae.id;
    const maestroNombre = getNombreMaestro(mae);

    console.log(`[TOOL:asignar] RESUELTO: beneficiario=${beneficiarioId} (${beneficiarioNombre}), maestro=${maestroId} (${maestroNombre})`);
    if (ben.maestro_asignado_id === maestroId) {
      return { status: "info", mensaje: `${beneficiarioNombre} ya está asignado al maestro ${maestroNombre}. No se realizó ningún cambio.` };
    }
    
    let oldMaestroId: string | null = null;
    if (ben.maestro_asignado_id && ben.maestro_asignado_id !== maestroId) {
      oldMaestroId = ben.maestro_asignado_id;
    }

    try {
      const updateBen = await supabase.from('beneficiarios').update({
        maestro_asignado_id: maestroId,
        maestro_asignado_nombre: maestroNombre
      }).eq('id', beneficiarioId);
      if (updateBen.error) throw new Error("Error actualizando beneficiario: " + updateBen.error.message);

      const updateMae = await supabase.from('maestros').update({
        beneficiario_asignado_id: beneficiarioId,
        beneficiario_asignado_nombre: beneficiarioNombre
      }).eq('id', maestroId);

      if (oldMaestroId) {
        const { data: oldCm } = await supabase.from('cronograma_maestros').select('beneficiarios_asignados').eq('id', oldMaestroId).single();
        if (oldCm && oldCm.beneficiarios_asignados) {
          const updatedOld = (oldCm.beneficiarios_asignados as string[]).filter((id: string) => id !== beneficiarioId);
          await supabase.from('cronograma_maestros').update({ beneficiarios_asignados: updatedOld }).eq('id', oldMaestroId);
        }
      }
      
      const { data: newCm } = await supabase.from('cronograma_maestros').select('beneficiarios_asignados').eq('id', maestroId).single();
      if (newCm) {
        const asignados = Array.isArray(newCm.beneficiarios_asignados) ? newCm.beneficiarios_asignados : [];
        if (!asignados.includes(beneficiarioId)) {
          asignados.push(beneficiarioId);
          await supabase.from('cronograma_maestros').update({ beneficiarios_asignados: asignados }).eq('id', maestroId);
        }
      }

      await logAIAction('asignar_beneficiario_a_maestro', 'beneficiarios_y_maestros', beneficiarioId,
        { beneficiarioId, beneficiarioNombre, maestroId, maestroNombre }, 'success');

      return { status: "success", mensaje: `✅ Beneficiario "${beneficiarioNombre}" asignado exitosamente al maestro "${maestroNombre}".` };
    } catch (e: any) {
      await logAIAction('asignar_beneficiario_a_maestro', 'beneficiarios_y_maestros', beneficiarioId, { error: e.message }, 'error');
      return { status: "error", error: e.message };
    }
  },
};

export const consultarDesembolsos = {
  name: "consultar_desembolsos",
  description: 'Lista los desembolsos de las entidades financieras.',
  parametersSchema: {
    type: "object",
    properties: { financieraId: { type: "string", description: "El ID de la financiera si se conoce" } }
  },
  execute: async ({ financieraId }: any) => {
    let query = supabase.from('financieras').select('*');
    if (financieraId) query = query.eq('id', financieraId);
    const { data, error } = await query;
    if (error) return { error: error.message };
    return { financieras: data };
  },
};

export const registrarMaestro = {
  name: "registrar_maestro",
  description: 'Registra a un nuevo maestro de obra en el sistema.',
  parametersSchema: {
    type: "object",
    properties: {
      nombre: { type: "string", description: "Nombre completo del maestro" },
      dni: { type: "string", description: "DNI del maestro" },
      celular: { type: "string", description: "Número de celular/teléfono" },
      especialidad: { type: "string", description: "Especialidad del maestro (ej. Albañilería)" },
      tarifa_vivienda: { type: "string", description: "Costo por vivienda (ej. 15000)" }
    },
    required: ["nombre", "dni"]
  },
  execute: async ({ nombre, dni, celular, especialidad, tarifa_vivienda }: any) => {
    console.log(`[TOOL:registrar_maestro] INPUT: nombre="${nombre}", dni="${dni}"`);
    const id = `maestro_${Date.now()}`;
    const maestro = {
      id, nombre, dni,
      celular: celular || "",
      especialidad: especialidad || "General",
      tarifa_vivienda: tarifa_vivienda || "0"
    };
    const { addMaestro } = require('./db');
    const result = await addMaestro({
      id: maestro.id,
      nombre: maestro.nombre,
      dni: maestro.dni,
      celular: maestro.celular,
      especialidad: maestro.especialidad,
      tarifaVivienda: maestro.tarifa_vivienda,
    });
    if (!result) return { error: "Error al registrar en la base de datos." };
    await logAIAction('registrar_maestro', 'maestros', id, maestro, 'success');
    return { mensaje: `✅ Maestro "${nombre}" registrado correctamente con ID ${id}.`, maestro: result };
  }
};

export const registrarBeneficiario = {
  name: "registrar_beneficiario",
  description: 'Registra a un nuevo beneficiario en el sistema.',
  parametersSchema: {
    type: "object",
    properties: {
      postulante: { type: "string", description: "Nombre completo del postulante" },
      dni_postulante: { type: "string", description: "DNI del postulante" },
      celular: { type: "string", description: "Número de celular/teléfono" },
      departamento: { type: "string", description: "Departamento" },
      provincia: { type: "string", description: "Provincia" },
      distrito: { type: "string", description: "Distrito" },
      estado: { type: "string", description: "Estado inicial (ej. Expediente en Revisión)" }
    },
    required: ["postulante", "dni_postulante"]
  },
  execute: async ({ postulante, dni_postulante, celular, departamento, provincia, distrito, estado }: any) => {
    console.log(`[TOOL:registrar_beneficiario] INPUT: postulante="${postulante}", dni="${dni_postulante}"`);
    const id = `EXP-${Date.now().toString().slice(-6)}`;
    const beneficiario = {
      id, postulante, dni_postulante,
      celular: celular || "",
      departamento: departamento || "",
      provincia: provincia || "",
      distrito: distrito || "",
      estado: estado || "Expediente en Revisión",
      documentos: []
    };
    const { addBeneficiario } = require('./db');
    const result = await addBeneficiario({
      id: beneficiario.id,
      postulante: beneficiario.postulante,
      dniPostulante: beneficiario.dni_postulante,
      celular: beneficiario.celular,
      departamento: beneficiario.departamento,
      provincia: beneficiario.provincia,
      distrito: beneficiario.distrito,
      estado: beneficiario.estado,
    });
    if (!result) return { error: "Error al registrar en la base de datos." };
    await logAIAction('registrar_beneficiario', 'beneficiarios', id, beneficiario, 'success');
    return { mensaje: `✅ Beneficiario "${postulante}" registrado correctamente con expediente ${id}.`, beneficiario: result };
  }
};

export const procesarDocumentoVision = {
  name: "procesar_documento_vision",
  description: 'Lee una imagen o documento (URL) mediante Vision AI para extraer datos de una Ficha de Beneficiario o Documento Contable (Factura/Recibo).',
  parametersSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL de la imagen o documento proporcionada por el usuario" },
      tipo: { type: "string", description: "'ficha' o 'contable'" }
    },
    required: ["url", "tipo"]
  },
  execute: async ({ url, tipo }: any) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is missing");
      
      const promptText = tipo === 'ficha' 
        ? "Extrae los datos de esta ficha de beneficiario. Devuelve los campos: postulante, dni_postulante, celular, departamento, provincia, distrito. En formato JSON puro sin formato adicional."
        : "Extrae los datos de este documento contable (factura o recibo). Devuelve los campos: tipoDocumento (Factura o Recibo), fecha, monto (solo número), emisor, ruc, concepto. En formato JSON puro sin formato adicional.";

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                { type: "image_url", image_url: { url: url } }
              ]
            }
          ]
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const content = data.choices[0].message.content;
      return { status: "success", datos_extraidos: JSON.parse(content) };
    } catch (e: any) {
      return { status: "error", error: e.message };
    }
  }
};

export const registrarDocumentoContable = {
  name: "registrar_documento_contable",
  description: 'Registra una factura o recibo en la base de datos de documentos contables.',
  parametersSchema: {
    type: "object",
    properties: {
      tipoDocumento: { type: "string", description: "Factura, Recibo, etc." },
      fecha: { type: "string" },
      monto: { type: "number" },
      emisor: { type: "string" },
      ruc: { type: "string" },
      concepto: { type: "string" },
      urlArchivo: { type: "string" }
    },
    required: ["tipoDocumento", "monto", "emisor"]
  },
  execute: async (doc: any) => {
    const { addDocumentoContable } = require('./db');
    const result = await addDocumentoContable(doc);
    if (!result) return { error: "Error al registrar el documento contable en la BD." };
    return { mensaje: "✅ Documento contable registrado exitosamente.", documento: result };
  }
};

export const buscarDocumentosContables = {
  name: "buscar_documentos_contables",
  description: 'Busca documentos contables en la base de datos.',
  parametersSchema: {
    type: "object",
    properties: {
      emisor: { type: "string", description: "Opcional. Buscar por nombre o razón social del emisor" },
      tipoDocumento: { type: "string", description: "Opcional. Factura o Recibo" }
    }
  },
  execute: async ({ emisor, tipoDocumento }: any) => {
    const { supabase } = require('./supabase');
    let query = supabase.from('documentos_contables').select('*');
    if (emisor) query = query.ilike('emisor', `%${emisor}%`);
    if (tipoDocumento) query = query.eq('tipo_documento', tipoDocumento);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(10);
    if (error) return { error: error.message };
    if (!data || data.length === 0) return { mensaje: "No se encontraron documentos contables." };
    return { documentos: data };
  }
};
