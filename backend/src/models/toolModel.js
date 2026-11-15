import { throwIfSupabaseError } from '../lib/supabaseError.js';

export function createToolModel(db) {
  async function attachCategories(rows) {
    if (!rows.length) return rows;
    const ids = [...new Set(rows.map((row) => row.category_id).filter(Boolean))];
    if (!ids.length) return rows;

    const { data, error } = await db
      .from('categories')
      .select('id,nama,slug,icon')
      .in('id', ids);
    throwIfSupabaseError(error);

    const map = new Map((data || []).map((category) => [category.id, category]));
    return rows.map((row) => ({
      ...row,
      categories: map.get(row.category_id) || null,
    }));
  }

  return {
    async list({ search, categoryId, tersedia, limit, offset }) {
      let query = db
        .from('tool_stok')
        .select('*', { count: 'exact' });

      if (search) {
        const term = search.replace(/[,()"']/g, ' ').trim();
        if (term) query = query.or(`nama.ilike.%${term}%,kode.ilike.%${term}%`);
      }
      if (categoryId) query = query.eq('category_id', categoryId);
      if (tersedia === '1' || tersedia === 'true') query = query.gt('stok_tersedia', 0);

      const { data, count, error } = await query
        .order('nama', { ascending: true })
        .range(offset, offset + limit - 1);
      throwIfSupabaseError(error);

      return { rows: await attachCategories(data || []), count: count || 0 };
    },

    async findById(id) {
      const { data, error } = await db
        .from('tool_stok')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      throwIfSupabaseError(error);
      if (!data) return null;
      const [row] = await attachCategories([data]);
      return row;
    },

    async findByKode(kode) {
      const { data, error } = await db
        .from('tool_stok')
        .select('*')
        .eq('kode', kode)
        .maybeSingle();
      throwIfSupabaseError(error);
      if (!data) return null;
      const [row] = await attachCategories([data]);
      return row;
    },

    async findByIds(ids) {
      if (!ids.length) return [];
      const { data, error } = await db
        .from('tool_stok')
        .select('*')
        .in('id', ids);
      throwIfSupabaseError(error);
      return attachCategories(data || []);
    },

    async recentLoans(toolId, limit = 5) {
      const { data, error } = await db
        .from('loans')
        .select(`
          id,kode,tanggal_pinjam,tanggal_kembali_rencana,tanggal_kembali_aktual,status,
          members(nama),
          loan_items!inner(tool_id,jumlah)
        `)
        .eq('loan_items.tool_id', toolId)
        .order('tanggal_pinjam', { ascending: false })
        .limit(limit);
      throwIfSupabaseError(error);
      return data || [];
    },
  };
}
