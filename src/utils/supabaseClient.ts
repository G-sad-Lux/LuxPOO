import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase: Las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas en tu archivo .env.local.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
