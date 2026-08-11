import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as OTPAuth from 'otpauth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password, verificationCode } = body;

    if (!email || !username || !password || !verificationCode) {
      return NextResponse.json({ success: false, message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_TOTP_SECRET;

    if (!adminSecret) {
      console.error("ADMIN_TOTP_SECRET no está configurado en las variables de entorno.");
      return NextResponse.json({ success: false, message: 'Error de configuración del sistema (Falta clave de seguridad)' }, { status: 500 });
    }

    // Verificar el código usando otpauth
    let totp = new OTPAuth.TOTP({
      issuer: "TechoPropioSistema",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: adminSecret, // Acepta la string base32 directamente
    });

    const delta = totp.validate({ token: verificationCode, window: 1 });
    const isValid = delta !== null;

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Código de autorización inválido o expirado. Consulta al administrador.' }, { status: 401 });
    }

    // Comprobar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, message: 'El nombre de usuario ya está en uso' }, { status: 400 });
    }

    // Insertar el nuevo usuario en Supabase
    // Nota: en producción, la contraseña debería ser hasheada usando bcrypt.
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        username,
        email,
        password
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting user:", error);
      return NextResponse.json({ success: false, message: 'Error al registrar el usuario en la base de datos' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error("Auth register error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
