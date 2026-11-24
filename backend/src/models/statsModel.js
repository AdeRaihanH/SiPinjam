import { env } from '../config/env.js';
import { hariTerlambat } from '../lib/dates.js';

export function createStatsModel(db) {
  return {
    async summary(memberId, today, semua = false) {
      const loansQuery = semua
        ? db.query(
          `select status, tanggal_kembali_rencana, denda
           from loans`,
        )
        : db.query(
          `select status, tanggal_kembali_rencana, denda
           from loans
           where member_id = $1`,
          [memberId],
        );

      const [tools, loans, unread] = await Promise.all([
        db.query('select stok_total, stok_tersedia from tool_stok'),
        loansQuery,
        db.query(
          `select count(*)::int as count
           from notifications
           where member_id = $1 and dibaca = false and show_at <= now()`,
          [memberId],
        ),
      ]);

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
        const hari = hariTerlambat(loan.tanggal_kembali_rencana, today);
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
        notifikasi_belum_dibaca: unread[0]?.count || 0,
        denda_per_hari: env.dendaPerHari,
      };
    },

    async populer(limit = 5) {
      return db.query(
        `select t.id, t.kode, t.nama, t.foto_url, t.kondisi,
                case when c.id is null then null else json_build_object(
                  'id', c.id, 'nama', c.nama, 'slug', c.slug, 'icon', c.icon
                ) end as categories,
                sum(li.jumlah)::int as total_dipinjam
         from loan_items li
         join tools t on t.id = li.tool_id
         left join categories c on c.id = t.category_id
         group by t.id, t.kode, t.nama, t.foto_url, t.kondisi,
                  c.id, c.nama, c.slug, c.icon
         order by total_dipinjam desc, t.nama asc
         limit $1`,
        [limit],
      );
    },
  };
}
