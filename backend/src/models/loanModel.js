const LOAN_SELECT = `
  select l.*,
         json_build_object('id', m.id, 'nama', m.nama, 'nim', m.nim) as members,
         coalesce((
           select json_agg(json_build_object(
             'id', li.id,
             'tool_id', li.tool_id,
             'jumlah', li.jumlah,
             'tools', case when t.id is null then null else json_build_object(
               'id', t.id,
               'kode', t.kode,
               'nama', t.nama,
               'foto_url', t.foto_url,
               'kondisi', t.kondisi,
               'categories', case when c.id is null then null else json_build_object(
                 'id', c.id, 'nama', c.nama, 'slug', c.slug, 'icon', c.icon
               ) end
             ) end
           ) order by li.id)
           from loan_items li
           left join tools t on t.id = li.tool_id
           left join categories c on c.id = t.category_id
           where li.loan_id = l.id
         ), '[]'::json) as loan_items
  from loans l
  join members m on m.id = l.member_id
`;

export function createLoanModel(db) {
  return {
    async listByMember(memberId, { status, limit, offset }) {
      const filters = ['l.member_id = $1'];
      const params = [memberId];

      if (status === 'aktif') filters.push("l.status = 'dipinjam'");
      if (status === 'selesai') filters.push("l.status = 'dikembalikan'");

      const where = `where ${filters.join(' and ')}`;
      const [rows, countRows] = await Promise.all([
        db.query(
          `${LOAN_SELECT} ${where}
           order by l.created_at desc
           limit $${params.length + 1} offset $${params.length + 2}`,
          [...params, limit, offset],
        ),
        db.query(
          `select count(*)::int as count from loans l ${where}`,
          params,
        ),
      ]);

      return { rows, count: countRows[0]?.count || 0 };
    },

    async findById(id) {
      const rows = await db.query(`${LOAN_SELECT} where l.id = $1 limit 1`, [id]);
      return rows[0] || null;
    },

    async findByKode(kode) {
      const rows = await db.query(`${LOAN_SELECT} where l.kode = $1 limit 1`, [kode]);
      return rows[0] || null;
    },

    async countOverdue(memberId, today) {
      const rows = await db.query(
        `select count(*)::int as count
         from loans
         where member_id = $1 and status = 'dipinjam' and tanggal_kembali_rencana < $2`,
        [memberId, today],
      );
      return rows[0]?.count || 0;
    },

    async activeToolIds(memberId, toolIds) {
      if (!toolIds.length) return [];
      const placeholders = toolIds.map((_, index) => `$${index + 2}`).join(', ');
      const rows = await db.query(
        `select distinct li.tool_id
         from loans l
         join loan_items li on li.loan_id = l.id
         where l.member_id = $1 and l.status = 'dipinjam'
           and li.tool_id in (${placeholders})`,
        [memberId, ...toolIds],
      );
      return rows.map((row) => row.tool_id);
    },

    async lastCode(prefix) {
      const rows = await db.query(
        `select kode
         from loans
         where kode like $1
         order by kode desc
         limit 1`,
        [`${prefix}%`],
      );
      return rows[0]?.kode || null;
    },

    async createHeader(payload) {
      const rows = await db.query(
        `insert into loans
           (kode, member_id, tanggal_pinjam, tanggal_kembali_rencana, status, denda, catatan)
         values ($1, $2, $3, $4, 'dipinjam', 0, $5)
         returning id, kode, status, denda`,
        [
          payload.kode,
          payload.memberId,
          payload.tanggalPinjam,
          payload.tanggalKembaliRencana,
          payload.catatan || null,
        ],
      );
      return rows[0];
    },

    async insertItems(rows) {
      if (!rows.length) return;

      const values = [];
      const tuples = rows.map((row) => {
        values.push(row.loan_id, row.tool_id, row.jumlah);
        return `($${values.length - 2}, $${values.length - 1}, $${values.length})`;
      });

      await db.query(
        `insert into loan_items (loan_id, tool_id, jumlah) values ${tuples.join(', ')}`,
        values,
      );
    },

    async deleteHeader(id) {
      await db.query('delete from loans where id = $1', [id]);
    },

    async updateReturn(id, { actualDate, denda }) {
      const rows = await db.query(
        `update loans
         set status = 'dikembalikan', tanggal_kembali_aktual = $2, denda = $3
         where id = $1 and status = 'dipinjam'
         returning id`,
        [id, actualDate, denda],
      );
      return rows[0] || null;
    },
  };
}
