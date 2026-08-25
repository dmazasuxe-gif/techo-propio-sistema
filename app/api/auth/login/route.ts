import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Faltan credenciales' }, { status: 400 });
    }

    // Buscar el usuario en Supabase (solo por username)
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    // Verificar la contraseña hasheada
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err: any) {
    console.error("Auth login error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
