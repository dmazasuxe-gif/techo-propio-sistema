import { createClient } from '@supabase/supabase-js';
import type { DatabaseSchema } from './db'; // We'll redefine types later or use generic for now

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
