import { createClient } from '@supabase/supabase-js';
import type { DatabaseSchema } from './db'; // We'll redefine types later or use generic for now

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gefywdkkovidrkzihmzb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZnl3ZGtrb3ZpZHJremlobXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNjMyMDQsImV4cCI6MjEwMDkzOTIwNH0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
