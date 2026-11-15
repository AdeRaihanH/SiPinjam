import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

if (!env.supabaseUrl || !env.supabaseKey) {
  throw new Error('SUPABASE_URL dan SUPABASE_KEY wajib diisi di backend/.env');
}

// Hanya anon/public key yang dipakai. Service role key tidak boleh ada di repo.
export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
