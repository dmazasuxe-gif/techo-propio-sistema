import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const normalizeStr = (s?: string) => s ? s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

export async function GET() {
  let report = {
    maestrosSynced: 0,
    beneficiariosFixed: 0,
    maestrosNames: [] as string[],
    beneficiariosNames: [] as string[]
  };

  try {
    // 1. Sync Maestros
    const { data: m } = await supabase.from('maestros').select('*');
    const { data: c } = await supabase.from('cronograma_maestros').select('*');
    
    const cIds = c ? c.map((x: any) => x.id) : [];
    const missing = m ? m.filter((x: any) => !cIds.includes(x.id)) : [];
    
    for (const maestro of missing) {
      await supabase.from('cronograma_maestros').insert({
        id: maestro.id,
        nombre: maestro.nombre,
        dni: maestro.dni,
        celular: maestro.celular,
        especialidad: maestro.especialidad,
        monto_por_vivienda: parseFloat(maestro.tarifa_vivienda) || 0,
        beneficiarios_asignados: maestro.beneficiario_asignado_id ? [maestro.beneficiario_asignado_id] : [],
        pagos: []
      });
      report.maestrosSynced++;
      report.maestrosNames.push(maestro.nombre);
    }

    // 2. Fix Beneficiarios
    const { data: b } = await supabase.from('beneficiarios').select('*');
    if (b) {
      for (const ben of b) {
        let needsUpdate = false;
        const normDep = normalizeStr(ben.departamento);
        const normProv = normalizeStr(ben.provincia);
        const normDist = normalizeStr(ben.distrito);
        let exp = ben.expediente;

        if (ben.departamento !== normDep || ben.provincia !== normProv || ben.distrito !== normDist) {
          needsUpdate = true;
        }
        if (!exp) {
          exp = normDep || "GENERAL";
          needsUpdate = true;
        }

        if (needsUpdate) {
          await supabase.from('beneficiarios').update({
            departamento: normDep,
            provincia: normProv,
            distrito: normDist,
            expediente: exp
          }).eq('id', ben.id);
          report.beneficiariosFixed++;
          report.beneficiariosNames.push(ben.postulante || ben.nombres);
        }
      }
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message, report });
  }

  return NextResponse.json(report);
}
