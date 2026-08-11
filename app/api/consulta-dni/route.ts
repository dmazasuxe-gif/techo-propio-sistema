import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dni = searchParams.get('dni');

  if (!dni) {
    return NextResponse.json({ error: "DNI es requerido" }, { status: 400 });
  }

  if (!/^\d{8}$/.test(dni)) {
    return NextResponse.json({ error: "El DNI debe contener exactamente 8 dígitos numéricos" }, { status: 400 });
  }

  try {
    const token = process.env.DNI_API_TOKEN || "22777|XS67OpKKVWMkyhG6Ssv80ikuHCUSKTpcd5rZFxQS38614e56";
    const apiUrl = process.env.DNI_API_URL || "https://api.apis.net.pe/v2/reniec/dni?numero=";
    
    const response = await fetch(`${apiUrl}${dni}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "DNI no encontrado" }, { status: 404 });
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: "El servicio de consulta DNI presenta un problema de configuración (No autorizado)." }, { status: response.status });
      }
      if (response.status === 422) {
        return NextResponse.json({ error: "Parámetros de consulta inválidos." }, { status: 422 });
      }
      return NextResponse.json({ error: "Error de conexión con el servicio de DNI." }, { status: response.status });
    }

    const apiData = await response.json();

    // Map the response to our standardized format
    // apis.net.pe v2 returns: nombres, apellidoPaterno, apellidoMaterno, numeroDocumento
    const data = {
      dni: apiData.numeroDocumento || dni,
      nombres: apiData.nombres,
      apellidoPaterno: apiData.apellidoPaterno,
      apellidoMaterno: apiData.apellidoMaterno,
      // The API might not return fechaNacimiento, but we map it if it exists
      fechaNacimiento: apiData.fechaNacimiento || ""
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en consulta DNI:", error);
    return NextResponse.json({ error: "No fue posible realizar la consulta. Intente nuevamente." }, { status: 500 });
  }
}
