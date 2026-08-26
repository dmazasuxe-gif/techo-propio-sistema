import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('key') || request.headers.get('x-api-key');
    const expectedKey = process.env.EXCEL_API_KEY || 'excel_secret_key_2026';
    
    if (apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: beneficiarios, error } = await supabase
      .from('beneficiarios')
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert to pipe-delimited CSV
    // ID|DNI|Nombres|ApPaterno|ApMaterno|FecNac|EstadoC|Celular|Dep|Prov|Dist|CenPob|Barrio|Calle|Mz|Lote|Partida|CoordX|CoordY|AreaT|PorF|PorD|PorI|PorFnd|Expediente
    const csvLines = beneficiarios.map(b => {
      return [
        b.id || '',
        b.dni_postulante || '',
        b.nombres || '',
        b.apellido_paterno || '',
        b.apellido_materno || '',
        b.fecha_nacimiento || '',
        b.estado_civil || '',
        b.celular || '',
        b.departamento || '',
        b.provincia || '',
        b.distrito || '',
        b.centro_poblado || '',
        b.barrio_sector || '',
        b.calle || '',
        b.manzana || '',
        b.lote || '',
        b.partida_electronica || '',
        b.coordenada_x || '',
        b.coordenada_y || '',
        b.area_total || '',
        b.por_frente || '',
        b.por_derecha || '',
        b.por_izquierda || '',
        b.por_fondo || '',
        b.expediente || ''
      ].map(val => String(val).replace(/\|/g, '').replace(/\n/g, ' ')).join('|');
    });

    const csvTextBeneficiarios = csvLines.join('\n');
    
    // Convert carga_familiar to pipe-delimited CSV
    const csvCarga: string[] = [];
    beneficiarios.forEach(b => {
      if (b.carga_familiar) {
        let cargaArr: any[] = [];
        if (typeof b.carga_familiar === 'string') {
          try {
            cargaArr = JSON.parse(b.carga_familiar);
          } catch(e) {}
        } else if (Array.isArray(b.carga_familiar)) {
          cargaArr = b.carga_familiar;
        }
        
        cargaArr.forEach((fam: any) => {
          const row = [
            b.id || '',
            fam.Parentesco || fam.parentesco || '',
            fam.DNI || fam.dni || '',
            fam.Nombres || fam.nombres || '',
            fam.Apellidos || fam.apellidos || '',
            fam.Fecha_Nacimiento || fam.fecha_nacimiento || fam.fechaNacimiento || ''
          ].map(val => String(val).replace(/\|/g, '').replace(/\n/g, ' ')).join('|');
          csvCarga.push(row);
        });
      }
    });
    
    const csvTextCarga = csvCarga.join('\n');
    
    // Combine both with a separator
    const finalOutput = csvTextBeneficiarios + '\n===CARGA_FAMILIAR===\n' + csvTextCarga;

    return new NextResponse(finalOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
