import { throwIfSupabaseError } from '../lib/supabaseError.js';

const LOAN_COLUMNS = `
  *,
  members(id,nama,nim),
  loan_items(
    id,tool_id,jumlah,
    tools(
      id,kode,nama,foto_url,kondisi,
      categories(id,nama,slug,icon)
    )
  )
`;

export function createLoanModel(db) {
  return {
    async listByMember(memberId, { status, limit, offset }) {
      let query = db
        .from('loans')
        .select(LOAN_COLUMNS, { count: 'exact' })
        .eq('member_id', memberId);

      if (status === 'aktif') query = query.eq('status', 'dipinjam');
      if (status === 'selesai') query = query.eq('status', 'dikembalikan');

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      throwIfSupabaseError(error);
      return { rows: data || [], count: count || 0 };
    },

    async findById(id) {
      const { data, error } = await db
        .from('loans')
        .select(LOAN_COLUMNS)
        .eq('id', id)
        .maybeSingle();
      throwIfSupabaseError(error);
      return data;
    },

    async findByKode(kode) {
      const { data, error } = await db
        .from('loans')
        .select(LOAN_COLUMNS)
        .eq('kode', kode)
        .maybeSingle();
      throwIfSupabaseError(error);
      return data;
    },

    async countOverdue(memberId, today) {
      const { count, error } = await db
        .from('loans')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .eq('status', 'dipinjam')
        .lt('tanggal_kembali_rencana', today);
      throwIfSupabaseError(error);
      return count || 0;
    },

    async activeToolIds(memberId, toolIds) {
      if (!toolIds.length) return [];
      const { data, error } = await db
        .from('loans')
        .select('loan_items!inner(tool_id)')
        .eq('member_id', memberId)
        .eq('status', 'dipinjam')
        .in('loan_items.tool_id', toolIds);
      throwIfSupabaseError(error);
      return [...new Set((data || []).flatMap((row) => (
        (row.loan_items || []).map((item) => item.tool_id)
      )))];
    },

    async lastCode(prefix) {
      const { data, error } = await db
        .from('loans')
        .select('kode')
        .like('kode', `${prefix}%`)
        .order('kode', { ascending: false })
        .limit(1)
        .maybeSingle();
      throwIfSupabaseError(error);
      return data?.kode || null;
    },

    async createHeader(payload) {
      const { data, error } = await db
        .from('loans')
        .insert({
          kode: payload.kode,
          member_id: payload.memberId,
          tanggal_pinjam: payload.tanggalPinjam,
          tanggal_kembali_rencana: payload.tanggalKembaliRencana,
          status: 'dipinjam',
          denda: 0,
          catatan: payload.catatan || null,
        })
        .select('id,kode,status,denda')
        .single();
      throwIfSupabaseError(error);
      return data;
    },

    async insertItems(rows) {
      const { error } = await db.from('loan_items').insert(rows);
      throwIfSupabaseError(error);
    },

    async deleteHeader(id) {
      const { error } = await db.from('loans').delete().eq('id', id);
      throwIfSupabaseError(error);
    },

    async updateReturn(id, { actualDate, denda }) {
      const { data, error } = await db
        .from('loans')
        .update({
          status: 'dikembalikan',
          tanggal_kembali_aktual: actualDate,
          denda,
        })
        .eq('id', id)
        .eq('status', 'dipinjam')
        .select('id')
        .maybeSingle();
      throwIfSupabaseError(error);
      return data;
    },
  };
}
