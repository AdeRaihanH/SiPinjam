const CATEGORY_JSON = `case when c.id is null then null else json_build_object(
  'id', c.id, 'nama', c.nama, 'slug', c.slug, 'icon', c.icon
) end as categories`;

const TOOL_SELECT = `
  select t.*, ${CATEGORY_JSON}
  from tool_stok t
  left join categories c on c.id = t.category_id
`;

export function createToolModel(db) {
  return {
    async list({ search, categoryId, tersedia, limit, offset }) {
      const filters = [];
      const params = [];

      if (search) {
        const term = search.replace(/[,()"']/g, ' ').trim();
        if (term) {
          params.push(`%${term}%`);
          filters.push(`(t.nama ilike $${params.length} or t.kode ilike $${params.length})`);
        }
      }
      if (categoryId) {
        params.push(categoryId);
        filters.push(`t.category_id = $${params.length}`);
      }
      if (tersedia === '1' || tersedia === 'true') {
        filters.push('t.stok_tersedia > 0');
      }

      const where = filters.length ? `where ${filters.join(' and ')}` : '';
      const [rows, countRows] = await Promise.all([
        db.query(
          `${TOOL_SELECT} ${where}
           order by t.nama asc
           limit $${params.length + 1} offset $${params.length + 2}`,
          [...params, limit, offset],
        ),
        db.query(
          `select count(*)::int as count from tool_stok t ${where}`,
          params,
        ),
      ]);

      return { rows, count: countRows[0]?.count || 0 };
    },

    async findById(id) {
      const rows = await db.query(`${TOOL_SELECT} where t.id = $1 limit 1`, [id]);
      return rows[0] || null;
    },

    async findByKode(kode) {
      const rows = await db.query(`${TOOL_SELECT} where t.kode = $1 limit 1`, [kode]);
      return rows[0] || null;
    },

    async nextKode(prefix) {
      const rows = await db.query(
        `select kode from tools where kode like $1 order by kode desc limit 1`,
        [`${prefix}-%`],
      );
      const last = rows[0]?.kode;
      const next = last ? Number(last.split('-')[1]) + 1 : 1;
      return `${prefix}-${String(next).padStart(3, '0')}`;
    },

    async create(payload) {
      const rows = await db.query(
        `insert into tools
           (kode, nama, category_id, deskripsi, stok_total, kondisi, foto_url)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning id`,
        [
          payload.kode,
          payload.nama,
          payload.category_id,
          payload.deskripsi || null,
          payload.stok_total,
          payload.kondisi,
          payload.foto_url || null,
        ],
      );
      return rows[0]?.id || null;
    },

    async update(id, payload) {
      const rows = await db.query(
        `update tools
         set kode = $2, nama = $3, category_id = $4, deskripsi = $5,
             stok_total = $6, kondisi = $7, foto_url = $8
         where id = $1
         returning id`,
        [
          id,
          payload.kode,
          payload.nama,
          payload.category_id,
          payload.deskripsi || null,
          payload.stok_total,
          payload.kondisi,
          payload.foto_url || null,
        ],
      );
      return rows[0]?.id || null;
    },

    async remove(id) {
      const rows = await db.query('delete from tools where id = $1 returning id', [id]);
      return rows[0]?.id || null;
    },

    async countLoanItems(toolId) {
      const rows = await db.query(
        'select count(*)::int as count from loan_items where tool_id = $1',
        [toolId],
      );
      return rows[0]?.count || 0;
    },

    async findByIds(ids) {
      if (!ids.length) return [];
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
      return db.query(`${TOOL_SELECT} where t.id in (${placeholders})`, ids);
    },

    async recentLoans(toolId, limit = 5) {
      return db.query(
        `select l.id, l.kode, l.tanggal_pinjam, l.tanggal_kembali_rencana,
                l.tanggal_kembali_aktual, l.status,
                json_build_object('nama', m.nama) as members,
                json_agg(json_build_object('tool_id', li.tool_id, 'jumlah', li.jumlah)) as loan_items
         from loans l
         join members m on m.id = l.member_id
         join loan_items li on li.loan_id = l.id
         where li.tool_id = $1
         group by l.id, m.nama
         order by l.tanggal_pinjam desc, l.kode desc
         limit $2`,
        [toolId, limit],
      );
    },
  };
}
