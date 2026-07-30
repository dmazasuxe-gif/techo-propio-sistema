import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ success: false, message: 'Faltan campos obligatorios' }, { status: 400 });
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
