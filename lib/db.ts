import { supabase } from './supabase';
import { Beneficiario, MaestroObra, DocumentoAdjunto, Financiera } from '../app/types';

// Utility functions for converting between camelCase and snake_case
function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function convertKeysToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key) => {
      result[toSnakeCase(key)] = obj[key];
      return result;
    }, {});
  }
  return obj;
}

function convertKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result: any, key) => {
      result[toCamelCase(key)] = obj[key];
      return result;
    }, {});
  }
  return obj;
}

export interface DatabaseSchema {
  beneficiarios: Beneficiario[];
  maestros: MaestroObra[];
  financieras?: Financiera[];
  cronogramaMaestros?: any[];
  cronogramaObra?: any[];
  budget?: { productos: any[] };
  planosIngenieria?: any[];
}

export async function getDb(): Promise<DatabaseSchema> {
  const [
    { data: beneficiarios },
    { data: maestros },
    { data: financieras },
    { data: cronogramaMaestros },
    { data: cronogramaObra },
    { data: planosIngenieria }
  ] = await Promise.all([
    supabase.from('beneficiarios').select('*'),
    supabase.from('maestros').select('*'),
    supabase.from('financieras').select('*'),
    supabase.from('cronograma_maestros').select('*'),
    supabase.from('cronograma_obra').select('*').order('id', { ascending: true }),
    supabase.from('planos_ingenieria').select('*')
  ]);

  return {
    beneficiarios: (beneficiarios || []).map(convertKeysToCamelCase),
    maestros: (maestros || []).map(convertKeysToCamelCase),
    financieras: (financieras || []).map(convertKeysToCamelCase),
    cronogramaMaestros: (cronogramaMaestros || []).map(convertKeysToCamelCase),
    cronogramaObra: (cronogramaObra || []).map(convertKeysToCamelCase),
    planosIngenieria: (planosIngenieria || []).map(convertKeysToCamelCase)
  };
}

// Deprecated function, kept to prevent compilation errors until API routes are updated
export async function saveDb(data: DatabaseSchema): Promise<void> {
  console.warn("saveDb is deprecated with Supabase. Use specific insert/update functions instead.");
}

export async function getBeneficiarios(): Promise<Beneficiario[]> {
  const { data, error } = await supabase.from('beneficiarios').select('*');
  if (error) {
    console.error("Error fetching beneficiarios:", error);
    return [];
  }
  return data.map(convertKeysToCamelCase);
}

export async function addBeneficiario(b: Beneficiario): Promise<Beneficiario | null> {
  const { data, error } = await supabase.from('beneficiarios').insert(convertKeysToSnakeCase(b)).select().single();
  if (error) {
    console.error("Error adding beneficiario:", error);
    return null;
  }
  return convertKeysToCamelCase(data);
}

export async function updateBeneficiario(b: Beneficiario): Promise<Beneficiario | null> {
  const { data, error } = await supabase
    .from('beneficiarios')
    .update(convertKeysToSnakeCase(b))
    .eq('id', b.id)
    .select()
    .single();
  if (error) {
    console.error("Error updating beneficiario:", error);
    return null;
  }
  return convertKeysToCamelCase(data);
}

export async function deleteBeneficiario(id: string): Promise<void> {
  const { error } = await supabase.from('beneficiarios').delete().eq('id', id);
  if (error) console.error("Error deleting beneficiario:", error);
}

export async function updateBeneficiarioField(id: string, field: string, value: any): Promise<Beneficiario | null> {
  const updateData: any = {};
  updateData[toSnakeCase(field)] = value;
  const { data, error } = await supabase
    .from('beneficiarios')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error("Error updating beneficiario field:", error);
    return null;
  }
  return convertKeysToCamelCase(data);
}

export async function addDocumentoToBeneficiario(beneficiarioId: string, doc: DocumentoAdjunto): Promise<Beneficiario | null> {
  const { data: ben, error: fetchError } = await supabase.from('beneficiarios').select('documentos').eq('id', beneficiarioId).single();
  if (fetchError || !ben) return null;

  const currentDocs = ben.documentos || [];
  const updatedDocs = [...currentDocs, doc];

  const { data, error } = await supabase
    .from('beneficiarios')
    .update({ documentos: updatedDocs })
    .eq('id', beneficiarioId)
    .select()
    .single();
    
  if (error) return null;
  return convertKeysToCamelCase(data);
}

export async function deleteDocumentoFromBeneficiario(beneficiarioId: string, docId: string): Promise<Beneficiario | null> {
  const { data: ben, error: fetchError } = await supabase.from('beneficiarios').select('documentos').eq('id', beneficiarioId).single();
  if (fetchError || !ben) return null;

  const currentDocs = ben.documentos || [];
  const updatedDocs = currentDocs.filter((d: any) => d.id !== docId && d.url !== docId && d.tipo !== docId);

  const { data, error } = await supabase
    .from('beneficiarios')
    .update({ documentos: updatedDocs })
    .eq('id', beneficiarioId)
    .select()
    .single();
    
  if (error) return null;
  return convertKeysToCamelCase(data);
}

export async function getMaestros(): Promise<MaestroObra[]> {
  const { data, error } = await supabase.from('maestros').select('*');
  if (error) return [];
  return data.map(convertKeysToCamelCase);
}

export async function addMaestro(m: MaestroObra): Promise<MaestroObra | null> {
  const { data, error } = await supabase.from('maestros').insert(convertKeysToSnakeCase(m)).select().single();
  if (error) return null;

  await supabase.from('cronograma_maestros').insert({
    id: m.id,
    nombre: m.nombre,
    dni: m.dni,
    celular: m.celular,
    especialidad: m.especialidad,
    monto_por_vivienda: parseFloat(m.tarifaVivienda) || 0,
    beneficiarios_asignados: m.beneficiarioAsignadoId ? [m.beneficiarioAsignadoId] : [],
    pagos: []
  });

  if (m.beneficiarioAsignadoId) {
    await supabase.from('beneficiarios').update({
      maestro_asignado_id: m.id,
      maestro_asignado_nombre: m.nombre
    }).eq('id', m.beneficiarioAsignadoId);
  }

  return convertKeysToCamelCase(data);
}

export async function deleteMaestro(id: string): Promise<boolean> {
  const { error: err1 } = await supabase.from('maestros').delete().eq('id', id);
  const { error: err2 } = await supabase.from('cronograma_maestros').delete().eq('id', id);
  return !err1 && !err2;
}

export async function updateBeneficiarioEtapa(id: string, etapa: string, pct: number): Promise<Beneficiario | null> {
  const { data, error } = await supabase
    .from('beneficiarios')
    .update({ etapa_vivienda: etapa, avance_vivienda_pct: pct })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return convertKeysToCamelCase(data);
}

export async function updateBeneficiarioEstado(id: string, nuevoEstado: string): Promise<Beneficiario | null> {
  const { data, error } = await supabase
    .from('beneficiarios')
    .update({ estado: nuevoEstado })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return convertKeysToCamelCase(data);
}

export async function updateGlobalCronogramaObra(stageIndex: number, pct: number, stageName: string): Promise<void> {
  const id = `t${stageIndex + 1}`;
  await supabase.from('cronograma_obra').update({ avance_pct: pct }).eq('id', id);
}

export async function assignMaestroToBeneficiarios(maestroId: string, maestroNombre: string, beneficiarioIds: string[]): Promise<number> {
  let count = 0;
  for (const id of beneficiarioIds) {
    const { error } = await supabase.from('beneficiarios').update({
      maestro_asignado_id: maestroId,
      maestro_asignado_nombre: maestroNombre
    }).eq('id', id);
    if (!error) count++;
  }
  return count;
}

export async function executeDbOperation(collection: string, action: string, id?: string, data?: any): Promise<{ success: boolean, message: string }> {
  let table = collection;
  if (collection === 'cronogramaMaestros') table = 'cronograma_maestros';
  if (collection === 'cronogramaObra') table = 'cronograma_obra';
  if (collection === 'planosIngenieria') table = 'planos_ingenieria';

  if (action === "crear") {
    if (!data) return { success: false, message: "No se enviaron datos para crear." };
    if (!data.id) data.id = `${collection.substring(0,3).toUpperCase()}-${Date.now()}`;
    
    if (table === 'maestros') {
      const added = await addMaestro(data as MaestroObra);
      if (!added) return { success: false, message: `Error al crear el maestro y su cronograma.` };
      return { success: true, message: `Registro creado exitosamente en ${collection} con ID: ${data.id}` };
    }

    if (table === 'beneficiarios') {
      const normalizeStr = (s?: string) => s ? s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
      
      data.departamento = normalizeStr(data.departamento);
      data.provincia = normalizeStr(data.provincia);
      data.distrito = normalizeStr(data.distrito);

      if (!data.expediente) {
        data.expediente = data.departamento || "GENERAL";
      }
      
      if (!data.postulante) {
        data.postulante = `${data.nombres || ""} ${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}`.trim();
      }
      if (!data.direccion) {
        const fullDir = `${data.calle || ""} Mz ${data.manzana || ""} Lt ${data.lote || ""}`.trim();
        data.direccion = fullDir || `Distrito de ${data.distrito || ""}`;
      }
      
      // Default initial construction progress for newly registered beneficiaries
      data.etapaVivienda = "Sin Iniciar";
      data.avanceViviendaPct = 0;
    }

    const { error } = await supabase.from(table).insert(convertKeysToSnakeCase(data));
    if (error) return { success: false, message: `Error: ${error.message}` };
    return { success: true, message: `Registro creado exitosamente en ${collection} con ID: ${data.id}` };
  }
  
  if (action === "actualizar") {
    if (!id) return { success: false, message: "No se envió ID para actualizar." };

    // Sanitize documentos array: ensure all items are proper DocumentoAdjunto objects
    if (data && Array.isArray(data.documentos)) {
      data.documentos = data.documentos.map((doc: any, i: number) => {
        if (typeof doc === "string") {
          return {
            id: `DOC-PATCH-${Date.now()}-${i}`,
            tipo: "Archivo Recuperado",
            nombre: doc.split("/").pop()?.split("?")[0] || "Archivo.jpg",
            url: doc,
            fecha: new Date().toLocaleDateString("es-PE"),
          };
        }
        // Ensure the doc has an id
        if (!doc.id) doc.id = `DOC-${Date.now()}-${i}`;
        return doc;
      });
    }

    const { error } = await supabase.from(table).update(convertKeysToSnakeCase(data)).eq("id", id);
    if (error) return { success: false, message: `Error: ${error.message}` };
    return { success: true, message: `Registro ${id} actualizado en ${collection}.` };
  }

  if (action === "eliminar") {
    if (!id) return { success: false, message: "No se envió ID para eliminar." };
    
    // Mantenimiento de integridad: si borramos de maestros, borramos su cronograma
    if (table === 'maestros') {
      await supabase.from('cronograma_maestros').delete().eq('id', id);
    }
    
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return { success: false, message: `Error: ${error.message}` };
    return { success: true, message: `Registro ${id} eliminado de ${collection}.` };
  }

  return { success: false, message: `Acción '${action}' no reconocida.` };
}

export async function addPlano(plano: any): Promise<any> {
  const { data, error } = await supabase.from('planos_ingenieria').insert(convertKeysToSnakeCase(plano)).select().single();
  if (error) return null;
  return convertKeysToCamelCase(data);
}

export async function deletePlano(id: string): Promise<boolean> {
  const { error } = await supabase.from('planos_ingenieria').delete().eq('id', id);
  return !error;
}
