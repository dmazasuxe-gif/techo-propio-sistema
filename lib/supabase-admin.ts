import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-service-key';

// Este cliente TIENE TODOS LOS PRIVILEGIOS. IGNORA CUALQUIER RLS (Row Level Security).
// SOLO DEBE SER USADO EN EL BACKEND (API Routes, Server Components) Y NUNCA EN EL FRONTEND.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
