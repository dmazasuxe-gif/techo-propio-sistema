import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Faltan variables de entorno para el cliente de Supabase Admin (Service Role)");
}

// Este cliente TIENE TODOS LOS PRIVILEGIOS. IGNORA CUALQUIER RLS (Row Level Security).
// SOLO DEBE SER USADO EN EL BACKEND (API Routes, Server Components) Y NUNCA EN EL FRONTEND.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
