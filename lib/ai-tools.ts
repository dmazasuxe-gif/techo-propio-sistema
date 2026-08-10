import { tool } from 'ai';
import { z } from 'zod';
import { supabase } from './supabase';
import { executeDbOperation, logAIAction } from './db';
import { resolverBeneficiario, resolverMaestro, getNombreBeneficiario, getNombreMaestro } from './entity-resolution';

// ============================================================
// TOOLS DE LA IA — Todas usan entity-resolution.ts centralizado
// ============================================================

// TOOL 1: Buscar beneficiarios
export const buscarBeneficiarios = tool({
  description: 'Busca beneficiarios en la base de datos por nombre, DNI, departamento o estado. SIEMPRE usa esta herramienta antes de cualquier operación sobre un beneficiario.',
  parameters: z.object({
    terminoBusqueda: z.string().optional().describe('Nombre, DNI o texto a buscar'),
    estado: z.string().optional().describe('Filtrar por estado (ej. Expediente Aprobado)'),
    departamento: z.string().optional().describe('Filtrar por departamento (ej. San Martin)')
  }),
  // @ts-ignore
  execute: async ({ terminoBusqueda, estado, departamento }: any) => {
    console.log(`[TOOL:buscar_beneficiarios] INPUT: terminoBusqueda="${terminoBusqueda}", estado="${estado}", departamento="${departamento}"`);

    let query = supabase.from('beneficiarios').select('id, postulante, dni_postulante, celular, departamento, estado, etapa_vivienda, avance_vivienda_pct, maestro_asignado_nombre');
    
    if (estado) query = query.eq('estado', estado);
    if (departamento) query = query.ilike('departamento', `%${departamento}%`);
    if (terminoBusqueda) {
      query = query.or(`postulante.ilike.%${terminoBusqueda}%,dni_postulante.ilike.%${terminoBusqueda}%,nombres.ilike.%${terminoBusqueda}%,apellido_paterno.ilike.%${terminoBusqueda}%`);
    }

    const { data, error } = await query.limit(10);
    if (error) {
      console.log(`[TOOL:buscar_beneficiarios] ERROR: ${error.message}`);
      return { error: error.message };
    }
    
    console.log(`[TOOL:buscar_beneficiarios] RESULTADO: ${data?.length || 0} beneficiario(s)`);
    if (!data || data.length === 0) return { mensaje: "No se encontraron beneficiarios con esos criterios.", resultados: 0 };
    return { beneficiarios: data, resultados: data.length };
  },
});

// TOOL 2: Obtener detalle completo de un beneficiario (con entity resolution)
export const obtenerDetalleBeneficiario = tool({
  description: 'Obtiene el expediente completo de un beneficiario. Acepta nombre, DNI o ID.',
  parameters: z.object({
    identificador: z.string().describe('Nombre, DNI o ID del beneficiario')
  }),
  // @ts-ignore
  execute: async ({ identificador }: any) => {
    console.log(`[TOOL:obtener_detalle] INPUT: identificador="${identificador}"`);
    const res = await resolverBeneficiario(identificador);

    if (res.code === 'ENTITY_NOT_FOUND') return { error: res.message };
    if (res.code === 'ENTITY_AMBIGUOUS') return { mensaje: res.message, opciones: res.matches };
    if (res.code === 'DATABASE_ERROR') return { error: res.message };
    if (res.code === 'INVALID_QUERY') return { error: res.message };

    console.log(`[TOOL:obtener_detalle] RESUELTO: id=${res.entity.id}`);
    return { beneficiario: res.entity };
  },
});

// TOOL 3: Actualizar beneficiario
export const actualizarBeneficiario = tool({
  description: 'Actualiza campos de un beneficiario. Requiere el ID real (obténlo primero con buscar_beneficiarios).',
  parameters: z.object({
    id: z.string().describe('El ID real del beneficiario (ej: beneficiario_1)'),
    campos: z.record(z.string(), z.any()).describe('Campos a actualizar en formato snake_case')
  }),
  // @ts-ignore
  execute: async ({ id, campos }: any) => {
    console.log(`[TOOL:actualizar_beneficiario] INPUT: id="${id}", campos=${JSON.stringify(campos)}`);
    const result = await executeDbOperation('beneficiarios', 'actualizar', id, campos);
    await logAIAction('actualizar_beneficiario', 'beneficiarios', id, campos, result.success ? 'success' : 'error');
    console.log(`[TOOL:actualizar_beneficiario] RESULTADO: ${result.success ? 'SUCCESS' : 'ERROR'}`);
    return result;
  },
});

// TOOL 4: Buscar maestros
export const buscarMaestros = tool({
  description: 'Busca maestros de obra por nombre, especialidad o DNI.',
  parameters: z.object({
    terminoBusqueda: z.string().optional().describe('Nombre o DNI del maestro')
  }),
  // @ts-ignore
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
});

// TOOL 5: Actualizar maestro
export const actualizarMaestro = tool({
  description: 'Actualiza campos de un maestro. Requiere el ID real.',
  parameters: z.object({
    id: z.string().describe('El ID real del maestro'),
    campos: z.record(z.string(), z.any()).describe('Campos a actualizar en formato snake_case')
  }),
  // @ts-ignore
  execute: async ({ id, campos }: any) => {
    console.log(`[TOOL:actualizar_maestro] INPUT: id="${id}"`);
    const result = await executeDbOperation('maestros', 'actualizar', id, campos);
    await logAIAction('actualizar_maestro', 'maestros', id, campos, result.success ? 'success' : 'error');
    return result;
  },
});

// TOOL 6: Asignar beneficiario a maestro — CON ENTITY RESOLUTION CENTRALIZADA
export const asignarBeneficiarioAMaestro = tool({
  description: 'Asigna un beneficiario a un maestro. Acepta nombres, DNIs o IDs — la herramienta resuelve las entidades automáticamente. IMPORTANTE: Ejecuta esta herramienta DIRECTAMENTE y DE INMEDIATO cuando el usuario pida asignar algo. NUNCA pidas permiso o confirmación. NUNCA respondas que no están asignados; simplemente haz la asignación. Solo pregunta si falta el nombre de una de las dos partes.',
  parameters: z.any(),
  // @ts-ignore
  execute: async (args: any) => {
    try {
      const { supabase } = await import("./supabase");
      await supabase.from("ai_logs").insert({
        action: "DEBUG_ASSIGN_TOOL",
        table_name: "DEBUG",
        details: { raw_args: args },
        status: "info"
      });
    } catch(e) {}

    const beneficiarioQuery = args?.beneficiario || args?.beneficiarioQuery || args?.beneficiario_id || "";
    const maestroQuery = args?.maestro || args?.maestroQuery || args?.maestro_id || "";
    
    if (!beneficiarioQuery || !maestroQuery) {
      return { status: "error", error: "Faltan datos. Parámetros recibidos por la IA: " + JSON.stringify(args) };
    }

    console.log(`[TOOL:asignar] INPUT: beneficiario="${beneficiarioQuery}", maestro="${maestroQuery}"`);

    // PASO 1: Resolver beneficiario usando capa centralizada
    const resBen = await resolverBeneficiario(beneficiarioQuery);
    if (resBen.code === 'ENTITY_NOT_FOUND') return { status: "error", error: resBen.message };
    if (resBen.code === 'ENTITY_AMBIGUOUS') return { status: "ambiguous", mensaje: resBen.message, opciones: resBen.matches };
    if (!resBen.success) return { status: "error", error: resBen.message };

    // PASO 2: Resolver maestro usando capa centralizada
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

    // PASO 3: Verificar si ya está asignado
    if (ben.maestro_asignado_id === maestroId) {
      return { status: "info", mensaje: `${beneficiarioNombre} ya está asignado al maestro ${maestroNombre}. No se realizó ningún cambio.` };
    }
    
    let oldMaestroId: string | null = null;
    if (ben.maestro_asignado_id && ben.maestro_asignado_id !== maestroId) {
      const maestroAnterior = ben.maestro_asignado_nombre || ben.maestro_asignado_id;
      oldMaestroId = ben.maestro_asignado_id;
      console.log(`[TOOL:asignar] ADVERTENCIA: Beneficiario ya asignado a otro maestro (${maestroAnterior}). Reasignando.`);
    }

    try {
      // PASO 4: Actualizar beneficiario
      const updateBen = await supabase.from('beneficiarios').update({
        maestro_asignado_id: maestroId,
        maestro_asignado_nombre: maestroNombre
      }).eq('id', beneficiarioId);

      if (updateBen.error) throw new Error("Error actualizando beneficiario: " + updateBen.error.message);

      // PASO 5: Actualizar maestro
      const updateMae = await supabase.from('maestros').update({
        beneficiario_asignado_id: beneficiarioId,
        beneficiario_asignado_nombre: beneficiarioNombre
      }).eq('id', maestroId);

      if (updateMae.error) {
        await supabase.from('beneficiarios').update({ maestro_asignado_id: null, maestro_asignado_nombre: null }).eq('id', beneficiarioId);
        throw new Error("Error actualizando maestro: " + updateMae.error.message);
      }

      // PASO 6: Actualizar Interfaz Web (cronograma_maestros)
      // Primero, desmarcamos del maestro anterior (si existía)
      if (oldMaestroId) {
        const { data: oldCm } = await supabase.from('cronograma_maestros').select('beneficiarios_asignados').eq('id', oldMaestroId).single();
        if (oldCm && oldCm.beneficiarios_asignados) {
          const updatedOld = (oldCm.beneficiarios_asignados as string[]).filter((id: string) => id !== beneficiarioId);
          await supabase.from('cronograma_maestros').update({ beneficiarios_asignados: updatedOld }).eq('id', oldMaestroId);
        }
      }
      
      // Luego, marcamos la casilla para el nuevo maestro
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

      console.log(`[TOOL:asignar] ✅ SUCCESS`);
      return { status: "success", mensaje: `✅ Beneficiario "${beneficiarioNombre}" asignado exitosamente al maestro "${maestroNombre}".` };
    } catch (e: any) {
      await logAIAction('asignar_beneficiario_a_maestro', 'beneficiarios_y_maestros', beneficiarioId,
        { beneficiarioId, maestroId, error: e.message }, 'error');
      console.log(`[TOOL:asignar] ❌ ERROR: ${e.message}`);
      return { status: "error", error: e.message };
    }
  },
});

// TOOL 7: Consultar desembolsos
export const consultarDesembolsos = tool({
  description: 'Lista los desembolsos de las entidades financieras.',
  parameters: z.object({
    financieraId: z.string().optional().describe('El ID de la financiera si se conoce')
  }),
  // @ts-ignore
  execute: async ({ financieraId }: any) => {
    let query = supabase.from('financieras').select('*');
    if (financieraId) query = query.eq('id', financieraId);
    const { data, error } = await query;
    if (error) return { error: error.message };
    return { financieras: data };
  },
});
