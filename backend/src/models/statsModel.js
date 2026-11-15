import { env } from '../config/env.js';
import { diffDaysISO } from '../lib/dates.js';
import { throwIfSupabaseError } from '../lib/supabaseError.js';

export function createStatsModel(db) {
  return {
    async summary(memberId, today) {
      const [toolsResult, loansResult, unreadResult] = await Promise.all([
        db.from('tool_stok').select('stok_total,stok_tersedia'),
        db
          .from('loans')
          .select('status,tanggal_kembali_rencana,denda')
          .eq('member_id', memberId),
        db
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('member_id', memberId)
          .eq('dibaca', false)
          .lte('show_at', new Date().toISOString()),
      ]);

      throwIfSupabaseError(toolsResult.error);
      throwIfSupabaseError(loansResult.error);
      throwIfSupabaseError(unreadResult.error);

      const tools = toolsResult.data || [];
      const loans = loansResult.data || [];
      const totalUnit = tools.reduce((total, tool) => total + Number(tool.stok_total), 0);
      const tersediaUnit = tools.reduce((total, tool) => total + Number(tool.stok_tersedia), 0);

      let aktif = 0;
      let selesai = 0;
      let terlambat = 0;
      let dendaBerjalan = 0;
      let dendaSelesai = 0;

      for (const loan of loans) {
        if (loan.status === 'dikembalikan') {
          selesai += 1;
          dendaSelesai += Number(loan.denda || 0);
          continue;
        }
        aktif += 1;
        const hari = Math.max(0, diffDaysISO(loan.tanggal_kembali_rencana, today));
        if (hari > 0) {
          terlambat += 1;
          dendaBerjalan += hari * env.dendaPerHari;
        }
      }

      return {
        total_alat: tools.length,
        total_unit: totalUnit,
        tersedia_unit: tersediaUnit,
        dipinjam_unit: Math.max(0, totalUnit - tersediaUnit),
        total_pinjaman: loans.length,
        aktif,
        selesai,
        terlambat,
        denda_berjalan: dendaBerjalan,
        denda_selesai: dendaSelesai,
        notifikasi_belum_dibaca: unreadResult.count || 0,
        denda_per_hari: env.dendaPerHari,
      };
    },

    async populer(limit = 5) {
      const { data, error } = await db
        .from('loan_items')
        .select(`
          jumlah,
          tools(
            id,kode,nama,foto_url,kondisi,
            categories(id,nama,slug,icon)
          )
        `);
      throwIfSupabaseError(error);

      const map = new Map();
      for (const row of data || []) {
        const tool = row.tools;
        if (!tool) continue;
        const current = map.get(tool.id) || { tool, total_dipinjam: 0 };
        current.total_dipinjam += Number(row.jumlah);
        map.set(tool.id, current);
      }

      return [...map.values()]
        .sort((a, b) => b.total_dipinjam - a.total_dipinjam)
        .slice(0, limit)
        .map((item) => ({
          ...item.tool,
          total_dipinjam: item.total_dipinjam,
        }));
    },
  };
}
