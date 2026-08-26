import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    // 1. Verificación de Seguridad (API_KEY)
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.EXCEL_API_KEY || 'excel_secret_key_2026';
    
    if (apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parsear el Body JSON enviado por el Excel
    const body = await request.json();
    const beneficiarios = body.beneficiarios || [];

    if (!Array.isArray(beneficiarios) || beneficiarios.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    // 3. Mapear los campos del Excel a la estructura de la base de datos Supabase
    // El Excel manda: ID_Beneficiario, DNI, Nombres, Apellido_Paterno, etc.
    const recordsToUpsert = beneficiarios.map((b: any) => ({
      id: b.ID_Beneficiario,
      postulante: `${b.Nombres || ''} ${b.Apellido_Paterno || ''} ${b.Apellido_Materno || ''}`.trim(),
      expediente: b.Expediente || 'EXCEL',
      dni_postulante: b.DNI,
      nombres: b.Nombres,
      apellido_paterno: b.Apellido_Paterno,
      apellido_materno: b.Apellido_Materno,
      fecha_nacimiento: b.Fecha_Nacimiento,
      estado_civil: b.Estado_Civil,
      celular: b.Celular,
      departamento: b.Departamento,
      provincia: b.Provincia,
      distrito: b.Distrito,
      centro_poblado: b.Centro_Poblado,
      barrio_sector: b.Barrio_Sector,
      partida_electronica: b.Partida_Registral || null,
      calle: b.Calle,
      manzana: b.Manzana,
      lote: b.Lote,
      coordenada_x: b.Coordenada_X || null,
      coordenada_y: b.Coordenada_Y || null,
      area_total: b.Area_Total || null,
      por_frente: b.Por_Frente || null,
      por_derecha: b.Por_Derecha || null,
      por_izquierda: b.Por_Izquierda || null,
      por_fondo: b.Por_Fondo || null,
      carga_familiar: b.Carga_Familiar ? JSON.parse(b.Carga_Familiar) : [],
      estado: 'Activo', // Valor por defecto
    }));

    // 4. Hacer Upsert a Supabase
    const { data, error } = await supabase
      .from('beneficiarios')
      .upsert(recordsToUpsert, { onConflict: 'id' });

    if (error) {
      console.error("Error upserting to supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. Responder al Excel con Éxito
    return NextResponse.json({ 
      success: true, 
      message: `${recordsToUpsert.length} registros sincronizados exitosamente.`
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error en /api/sync-excel:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
