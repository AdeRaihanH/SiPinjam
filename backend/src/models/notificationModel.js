import { throwIfSupabaseError } from '../lib/supabaseError.js';

export function createNotificationModel(db) {
  return {
    async list(memberId, { limit, offset }) {
      const now = new Date().toISOString();
      const { data, count, error } = await db
        .from('notifications')
        .select('id,tipe,judul,pesan,ref_type,ref_id,show_at,dibaca', { count: 'exact' })
        .eq('member_id', memberId)
        .lte('show_at', now)
        .order('show_at', { ascending: false })
        .range(offset, offset + limit - 1);
      throwIfSupabaseError(error);
      return { rows: data || [], count: count || 0 };
    },

    async unreadCount(memberId) {
      const now = new Date().toISOString();
      const { count, error } = await db
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .eq('dibaca', false)
        .lte('show_at', now);
      throwIfSupabaseError(error);
      return count || 0;
    },

    async markRead(id, memberId) {
      const { data, error } = await db
        .from('notifications')
        .update({ dibaca: true })
        .eq('id', id)
        .eq('member_id', memberId)
        .select('id')
        .maybeSingle();
      throwIfSupabaseError(error);
      return Boolean(data);
    },

    async markAll(memberId) {
      const now = new Date().toISOString();
      const { data, error } = await db
        .from('notifications')
        .update({ dibaca: true })
        .eq('member_id', memberId)
        .eq('dibaca', false)
        .lte('show_at', now)
        .select('id');
      throwIfSupabaseError(error);
      return (data || []).length;
    },

    async insertMany(rows) {
      const { error } = await db.from('notifications').insert(rows);
      throwIfSupabaseError(error);
    },

    async markReadForLoan(memberId, loanId) {
      const { error } = await db
        .from('notifications')
        .update({ dibaca: true })
        .eq('member_id', memberId)
        .eq('ref_type', 'loan')
        .eq('ref_id', loanId)
        .in('tipe', ['jatuh_tempo', 'terlambat']);
      throwIfSupabaseError(error);
    },
  };
}
