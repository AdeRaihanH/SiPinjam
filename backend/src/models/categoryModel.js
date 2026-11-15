import { throwIfSupabaseError } from '../lib/supabaseError.js';

export function createCategoryModel(db) {
  return {
    async list() {
      const { data, error } = await db
        .from('categories')
        .select('id,nama,slug,icon')
        .order('nama', { ascending: true });
      throwIfSupabaseError(error);
      return data || [];
    },
  };
}
