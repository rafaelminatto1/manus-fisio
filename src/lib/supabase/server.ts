import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// ATENÇÃO: Este cliente usa a SERVICE_ROLE_KEY e NUNCA deve ser usado
// ou exposto no lado do cliente (navegador).

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase server environment variables are not set!');
  }
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}; 