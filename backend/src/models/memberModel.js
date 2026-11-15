import { throwIfSupabaseError } from '../lib/supabaseError.js';

export function createMemberModel(db) {
  return {
    async findByNim(nim) {
      const { data, error } = await db
        .from('members')
        .select('id,nama,nim,email,password_hash,role,avatar_url')
        .eq('nim', nim)
        .maybeSingle();
      throwIfSupabaseError(error);
      return data;
    },

    async findById(id) {
      const { data, error } = await db
        .from('members')
        .select('id,nama,nim,email,role,avatar_url')
        .eq('id', id)
        .maybeSingle();
      throwIfSupabaseError(error);
      return data;
    },
  };
}
