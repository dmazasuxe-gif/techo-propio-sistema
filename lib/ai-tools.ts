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
      id: { type: "string", description: "El ID real del beneficiario" },
      campos: { type: "object", description: "Campos a actualizar en formato snake_case" }
    },
    required: ["id", "campos"]
  },
  execute: async ({ id, campos }: any) => {
    console.log(`[TOOL:actualizar_beneficiario] INPUT: id="${id}"`);
    const result = await executeDbOperation('beneficiarios', 'actualizar', id, campos);
    await logAIAction('actualizar_beneficiario', 'beneficiarios', id, campos, result.success ? 'success' : 'error');
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
  description: 'Actualiza campos de un maestro. Requiere el ID real.',
  parametersSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "El ID real del maestro" },
      campos: { type: "object", description: "Campos a actualizar en formato snake_case" }
    },
    required: ["id", "campos"]
  },
  execute: async ({ id, campos }: any) => {
    console.log(`[TOOL:actualizar_maestro] INPUT: id="${id}"`);
    const result = await executeDbOperation('maestros', 'actualizar', id, campos);
    await logAIAction('actualizar_maestro', 'maestros', id, campos, result.success ? 'success' : 'error');
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
        let asignados = Array.isArray(newCm.beneficiarios_asignados) ? newCm.beneficiarios_asignados : [];
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
