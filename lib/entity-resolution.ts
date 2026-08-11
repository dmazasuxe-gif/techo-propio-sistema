/**
 * ENTITY RESOLUTION SERVICE
 * =========================
 * Capa centralizada para resolver entidades del sistema (beneficiarios, maestros)
 * a partir de lenguaje natural (nombre, DNI, ID).
 * 
 * Todas las tools de la IA deben usar este servicio en lugar de implementar
 * su propia lógica de búsqueda.
 */
import { supabase } from './supabase';

// ============================================================
// TIPOS DE RESPUESTA ESTRUCTURADOS
// ============================================================

export type EntityResolutionCode = 
  | 'ENTITY_FOUND'
  | 'ENTITY_NOT_FOUND'
  | 'ENTITY_AMBIGUOUS'
  | 'INVALID_QUERY'
  | 'DATABASE_ERROR';

export interface EntityResolutionResult {
  success: boolean;
  code: EntityResolutionCode;
  entityType: 'beneficiario' | 'maestro';
  count: number;
  entity: any | null;       // El registro completo si count === 1
  matches: any[];           // Todos los resultados (para ambigüedad)
  message: string;          // Mensaje legible para el usuario
}

// ============================================================
// RESOLVER BENEFICIARIO
// ============================================================

export async function resolverBeneficiario(query: string): Promise<EntityResolutionResult> {
  const q = (query || '').trim();
  
  if (!q) {
    return {
      success: false,
      code: 'INVALID_QUERY',
      entityType: 'beneficiario',
      count: 0,
      entity: null,
      matches: [],
      message: 'No se proporcionó un término de búsqueda para el beneficiario.'
    };
  }

  console.log(`[ENTITY_RESOLUTION] Resolviendo beneficiario: "${q}"`);

  try {
    // PASO 1: Intentar por ID exacto
    const { data: byId, error: errId } = await supabase
      .from('beneficiarios').select('*').eq('id', q);
    if (errId) throw errId;
    if (byId && byId.length === 1) {
      console.log(`[ENTITY_RESOLUTION] ✅ Encontrado por ID exacto: ${byId[0].id}`);
      return buildResult('beneficiario', byId);
    }

    // PASO 2: Intentar por DNI exacto
    const { data: byDni, error: errDni } = await supabase
      .from('beneficiarios').select('*').eq('dni_postulante', q);
    if (errDni) throw errDni;
    if (byDni && byDni.length > 0) {
      console.log(`[ENTITY_RESOLUTION] ✅ Encontrado por DNI: ${byDni.length} resultado(s)`);
      return buildResult('beneficiario', byDni);
    }

    // PASO 3: Búsqueda parcial por nombre (postulante, nombres, apellidos)
    const { data: byName, error: errName } = await supabase
      .from('beneficiarios').select('*')
      .or(`postulante.ilike.%${q}%,nombres.ilike.%${q}%,apellido_paterno.ilike.%${q}%,apellido_materno.ilike.%${q}%`);
    if (errName) throw errName;
    if (byName && byName.length > 0) {
      console.log(`[ENTITY_RESOLUTION] ✅ Encontrado por nombre parcial: ${byName.length} resultado(s)`);
      return buildResult('beneficiario', byName);
    }

    // PASO 4: Fallback de búsqueda difusa por palabras clave (OR)
    const words = q.split(' ').filter(w => w.length > 2);
    if (words.length > 0) {
      const orConditions = words.map(w => `postulante.ilike.%${w}%`).join(',');
      const { data: byWords } = await supabase.from('beneficiarios').select('*').or(orConditions);
      if (byWords && byWords.length > 0) {
        console.log(`[ENTITY_RESOLUTION] ✅ Encontrado por búsqueda de palabras (OR): ${byWords.length} resultado(s)`);
        return buildResult('beneficiario', byWords);
      }
    }

    // PASO 5: No encontrado
    console.log(`[ENTITY_RESOLUTION] ❌ Beneficiario no encontrado para "${q}"`);
    return {
      success: false,
      code: 'ENTITY_NOT_FOUND',
      entityType: 'beneficiario',
      count: 0,
      entity: null,
      matches: [],
      message: `No se encontró ningún beneficiario que coincida con "${q}". Verifica el nombre o DNI.`
    };

  } catch (err: any) {
    console.error(`[ENTITY_RESOLUTION] ERROR de base de datos:`, err);
    return {
      success: false,
      code: 'DATABASE_ERROR',
      entityType: 'beneficiario',
      count: 0,
      entity: null,
      matches: [],
      message: `Error consultando la base de datos: ${err.message || err}`
    };
  }
}

// ============================================================
// RESOLVER MAESTRO
// ============================================================

export async function resolverMaestro(query: string): Promise<EntityResolutionResult> {
  const q = (query || '').trim();
  
  if (!q) {
    return {
      success: false,
      code: 'INVALID_QUERY',
      entityType: 'maestro',
      count: 0,
      entity: null,
      matches: [],
      message: 'No se proporcionó un término de búsqueda para el maestro.'
    };
  }

  console.log(`[ENTITY_RESOLUTION] Resolviendo maestro: "${q}"`);

  try {
    // PASO 1: Intentar por ID exacto
    const { data: byId, error: errId } = await supabase
      .from('maestros').select('*').eq('id', q);
    if (errId) throw errId;
    if (byId && byId.length === 1) {
      console.log(`[ENTITY_RESOLUTION] ✅ Maestro encontrado por ID: ${byId[0].id}`);
      return buildResult('maestro', byId);
    }

    // PASO 2: Intentar por DNI exacto
    const { data: byDni, error: errDni } = await supabase
      .from('maestros').select('*').eq('dni', q);
    if (errDni) throw errDni;
    if (byDni && byDni.length > 0) {
      console.log(`[ENTITY_RESOLUTION] ✅ Maestro encontrado por DNI: ${byDni.length} resultado(s)`);
      return buildResult('maestro', byDni);
    }

    // PASO 3: Búsqueda parcial por nombre
    const { data: byName, error: errName } = await supabase
      .from('maestros').select('*')
      .or(`nombre.ilike.%${q}%`);
    if (errName) throw errName;
    if (byName && byName.length > 0) {
      console.log(`[ENTITY_RESOLUTION] ✅ Maestro encontrado por nombre: ${byName.length} resultado(s)`);
      return buildResult('maestro', byName);
    }

    // PASO 4: Fallback de búsqueda difusa por palabras clave (OR)
    const words = q.split(' ').filter(w => w.length > 2);
    if (words.length > 0) {
      const orConditions = words.map(w => `nombre.ilike.%${w}%`).join(',');
      const { data: byWords } = await supabase.from('maestros').select('*').or(orConditions);
      if (byWords && byWords.length > 0) {
        console.log(`[ENTITY_RESOLUTION] ✅ Maestro encontrado por palabras (OR): ${byWords.length} resultado(s)`);
        return buildResult('maestro', byWords);
      }
    }

    // PASO 5: No encontrado
    console.log(`[ENTITY_RESOLUTION] ❌ Maestro no encontrado para "${q}"`);
    return {
      success: false,
      code: 'ENTITY_NOT_FOUND',
      entityType: 'maestro',
      count: 0,
      entity: null,
      matches: [],
      message: `No se encontró ningún maestro que coincida con "${q}". Verifica el nombre o DNI.`
    };

  } catch (err: any) {
    console.error(`[ENTITY_RESOLUTION] ERROR de base de datos:`, err);
    return {
      success: false,
      code: 'DATABASE_ERROR',
      entityType: 'maestro',
      count: 0,
      entity: null,
      matches: [],
      message: `Error consultando la base de datos: ${err.message || err}`
    };
  }
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Construye una respuesta estructurada a partir de un array de resultados de Supabase.
 */
function buildResult(entityType: 'beneficiario' | 'maestro', data: any[]): EntityResolutionResult {
  if (data.length === 1) {
    const entity = data[0];
    const nombre = entityType === 'beneficiario'
      ? (entity.postulante || `${entity.nombres || ''} ${entity.apellido_paterno || ''}`.trim())
      : entity.nombre;
    return {
      success: true,
      code: 'ENTITY_FOUND',
      entityType,
      count: 1,
      entity,
      matches: data,
      message: `${entityType === 'beneficiario' ? 'Beneficiario' : 'Maestro'} encontrado: ${nombre} (ID: ${entity.id})`
    };
  }

  // Múltiples resultados → ambigüedad
  const resumen = data.map((d: any) => ({
    id: d.id,
    nombre: entityType === 'beneficiario' ? d.postulante : d.nombre,
    dni: entityType === 'beneficiario' ? d.dni_postulante : d.dni
  }));

  return {
    success: false,
    code: 'ENTITY_AMBIGUOUS',
    entityType,
    count: data.length,
    entity: null,
    matches: resumen,
    message: `Se encontraron ${data.length} ${entityType === 'beneficiario' ? 'beneficiarios' : 'maestros'} que coinciden. Se requiere que el usuario especifique cuál desea.`
  };
}

/**
 * Obtiene el nombre legible de un beneficiario a partir de su registro.
 */
export function getNombreBeneficiario(registro: any): string {
  return registro.postulante || `${registro.nombres || ''} ${registro.apellido_paterno || ''}`.trim() || registro.id;
}

/**
 * Obtiene el nombre legible de un maestro a partir de su registro.
 */
export function getNombreMaestro(registro: any): string {
  return registro.nombre || registro.id;
}
