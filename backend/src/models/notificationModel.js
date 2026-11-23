const SHOW_AT_ISO = `to_char(show_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

export function createNotificationModel(db) {
  return {
    async list(memberId, { limit, offset }) {
      const [rows, countRows] = await Promise.all([
        db.query(
          `select id, tipe, judul, pesan, ref_type, ref_id,
                  ${SHOW_AT_ISO} as show_at, dibaca
           from notifications
           where member_id = $1 and show_at <= now()
           order by show_at desc
           limit $2 offset $3`,
          [memberId, limit, offset],
        ),
        db.query(
          `select count(*)::int as count
           from notifications
           where member_id = $1 and show_at <= now()`,
          [memberId],
        ),
      ]);

      return { rows, count: countRows[0]?.count || 0 };
    },

    async unreadCount(memberId) {
      const rows = await db.query(
        `select count(*)::int as count
         from notifications
         where member_id = $1 and dibaca = false and show_at <= now()`,
        [memberId],
      );
      return rows[0]?.count || 0;
    },

    async markRead(id, memberId) {
      const rows = await db.query(
        `update notifications
         set dibaca = true
         where id = $1 and member_id = $2
         returning id`,
        [id, memberId],
      );
      return rows.length > 0;
    },

    async markAll(memberId) {
      const rows = await db.query(
        `update notifications
         set dibaca = true
         where member_id = $1 and dibaca = false and show_at <= now()
         returning id`,
        [memberId],
      );
      return rows.length;
    },

    async insertMany(rows) {
      if (!rows.length) return;

      const columns = ['member_id', 'tipe', 'judul', 'pesan', 'ref_type', 'ref_id', 'show_at', 'dibaca'];
      const values = [];
      const tuples = rows.map((row) => {
        const cells = columns.map((column) => {
          values.push(row[column] ?? null);
          return `$${values.length}`;
        });
        return `(${cells.join(', ')})`;
      });

      await db.query(
        `insert into notifications (${columns.join(', ')}) values ${tuples.join(', ')}`,
        values,
      );
    },

    async markReadForLoan(memberId, loanId) {
      await db.query(
        `update notifications
         set dibaca = true
         where member_id = $1 and ref_type = 'loan' and ref_id = $2
           and tipe in ('jatuh_tempo', 'terlambat')`,
        [memberId, loanId],
      );
    },
  };
}
