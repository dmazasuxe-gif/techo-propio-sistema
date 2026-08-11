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
    // TODO: Connect to real API when credentials are provided
    // const response = await fetch(`https://api.example.com/dni/${dni}`, { headers: { 'Authorization': `Bearer ${process.env.DNI_API_KEY}` } });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // DUMMY DATA FOR TESTING
    if (dni === '00000000') {
      return NextResponse.json({ error: "DNI no encontrado" }, { status: 404 });
    }

    if (dni === '99999999') {
      return NextResponse.json({ error: "Servicio no disponible" }, { status: 503 });
    }

    // Default successful response
    const data = {
      dni: dni,
      nombres: "JUAN CARLOS",
      apellidoPaterno: "PÉREZ",
      apellidoMaterno: "GÓMEZ",
      fechaNacimiento: "15/03/1985"
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en consulta DNI:", error);
    return NextResponse.json({ error: "No fue posible realizar la consulta. Intente nuevamente." }, { status: 500 });
  }
}
