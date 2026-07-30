import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Faltan credenciales' }, { status: 400 });
    }

    // Login maestro hardcodeado
    if (username === "admin" && password === "admin123") {
      return NextResponse.json({ success: true, user: { username: "admin", role: "admin" } });
    }

    // Buscar el usuario en Supabase
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err: any) {
    console.error("Auth login error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
