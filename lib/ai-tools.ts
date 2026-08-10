import { tool } from 'ai';
import { z } from 'zod';
import { supabase } from './supabase';
import { executeDbOperation, logAIAction } from './db';

// Herramientas de Base de Datos dinámicas
export const buscarBeneficiarios = tool({
  description: 'Busca beneficiarios en la base de datos por nombre, DNI, departamento o estado.',
  parameters: z.object({
    terminoBusqueda: z.string().optional().describe('Nombre, DNI o texto a buscar'),
    estado: z.string().optional().describe('Filtrar por estado (ej. Expediente Aprobado)'),
    departamento: z.string().optional().describe('Filtrar por departamento (ej. San Martin)')
  }),
  // @ts-ignore
  execute: async ({ terminoBusqueda, estado, departamento }: any) => {
    let query = supabase.from('beneficiarios').select('id, postulante, dni_postulante, celular, departamento, estado, etapa_vivienda, avance_vivienda_pct');
    
    if (estado) query = query.eq('estado', estado);
    if (departamento) query = query.ilike('departamento', `%${departamento}%`);
    if (terminoBusqueda) {
      query = query.or(`postulante.ilike.%${terminoBusqueda}%,dni_postulante.ilike.%${terminoBusqueda}%`);
    }

    const { data, error } = await query.limit(10);
    if (error) return { error: error.message };
    
    if (!data || data.length === 0) return { mensaje: "No se encontraron beneficiarios con esos criterios." };
    return { beneficiarios: data };
  },
});

export const obtenerDetalleBeneficiario = tool({
  description: 'Obtiene el expediente completo y detallado de un beneficiario específico usando su ID.',
  parameters: z.object({
    id: z.string().describe('El ID único del beneficiario')
  }),
  // @ts-ignore
  execute: async ({ id }: any) => {
    const { data, error } = await supabase.from('beneficiarios').select('*').eq('id', id).single();
    if (error) return { error: error.message };
    return { beneficiario: data };
  },
});

export const actualizarBeneficiario = tool({
  description: 'Actualiza campos específicos de un beneficiario (estado, celular, etapa_vivienda, etc).',
  parameters: z.object({
    id: z.string().describe('El ID del beneficiario a actualizar'),
    campos: z.record(z.string(), z.any()).describe('Un objeto con los campos a actualizar en formato snake_case. Ej: {"celular": "999999999", "estado": "Expediente Aprobado"}')
  }),
  // @ts-ignore
  execute: async ({ id, campos }: any) => {
    const result = await executeDbOperation('beneficiarios', 'actualizar', id, campos);
    await logAIAction('actualizar_beneficiario', 'beneficiarios', id, campos, result.success ? 'success' : 'error');
    return result;
  },
});

export const buscarMaestros = tool({
  description: 'Busca maestros de obra por nombre, especialidad o DNI. Si no se provee un término de búsqueda, devuelve una lista general de maestros registrados.',
  parameters: z.object({
    terminoBusqueda: z.string().optional().describe('Nombre o DNI del maestro a buscar')
  }),
  // @ts-ignore
  execute: async ({ terminoBusqueda }: any) => {
    let query = supabase.from('maestros').select('*');
    
    if (terminoBusqueda && terminoBusqueda.trim() !== '') {
      query = query.or(`nombre.ilike.%${terminoBusqueda}%,dni.ilike.%${terminoBusqueda}%`);
    }
    
    const { data, error } = await query.limit(5);
    
    if (error) return { error: error.message };
    if (!data || data.length === 0) return { mensaje: "No se encontraron maestros." };
    return { maestros: data };
  },
});

export const actualizarMaestro = tool({
  description: 'Actualiza campos específicos de un maestro de obra.',
  parameters: z.object({
    id: z.string().describe('El ID del maestro a actualizar'),
    campos: z.record(z.string(), z.any()).describe('Un objeto con los campos a actualizar en formato snake_case.')
  }),
  // @ts-ignore
  execute: async ({ id, campos }: any) => {
    const result = await executeDbOperation('maestros', 'actualizar', id, campos);
    await logAIAction('actualizar_maestro', 'maestros', id, campos, result.success ? 'success' : 'error');
    return result;
  },
});

export const asignarBeneficiarioAMaestro = tool({
  description: 'Asigna un beneficiario a un maestro de obra. Actualiza ambas tablas automáticamente.',
  parameters: z.object({
    beneficiarioId: z.string().describe('El ID del beneficiario'),
    beneficiarioNombre: z.string().describe('El nombre del beneficiario'),
    maestroId: z.string().describe('El ID del maestro'),
    maestroNombre: z.string().describe('El nombre del maestro')
  }),
  // @ts-ignore
  execute: async ({ beneficiarioId, beneficiarioNombre, maestroId, maestroNombre }: any) => {
    try {
      // 1. Actualizar beneficiario
      const updateBen = await supabase.from('beneficiarios').update({
        maestro_asignado_id: maestroId,
        maestro_asignado_nombre: maestroNombre
      }).eq('id', beneficiarioId);

      if (updateBen.error) throw new Error("Error actualizando beneficiario: " + updateBen.error.message);

      // 2. Actualizar maestro
      const updateMae = await supabase.from('maestros').update({
        beneficiario_asignado_id: beneficiarioId,
        beneficiario_asignado_nombre: beneficiarioNombre
      }).eq('id', maestroId);

      if (updateMae.error) {
        // Rollback manual simple si falla el segundo paso
        await supabase.from('beneficiarios').update({ maestro_asignado_id: null, maestro_asignado_nombre: null }).eq('id', beneficiarioId);
        throw new Error("Error actualizando maestro: " + updateMae.error.message);
      }

      const logData = { beneficiarioId, beneficiarioNombre, maestroId, maestroNombre };
      await logAIAction('asignar_beneficiario_a_maestro', 'beneficiarios_y_maestros', beneficiarioId, logData, 'success');

      return { status: "success", mensaje: `Beneficiario ${beneficiarioNombre} asignado exitosamente al maestro ${maestroNombre}.` };
    } catch (e: any) {
      const logData = { beneficiarioId, maestroId, error: e.message };
      await logAIAction('asignar_beneficiario_a_maestro', 'beneficiarios_y_maestros', beneficiarioId, logData, 'error');
      return { status: "error", error: e.message };
    }
  },
});

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
