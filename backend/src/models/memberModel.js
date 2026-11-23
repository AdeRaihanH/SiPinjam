export function createMemberModel(db) {
  return {
    async findByNim(nim) {
      const rows = await db.query(
        `select id, nama, nim, email, password_hash, role, avatar_url
         from members
         where nim = $1
         limit 1`,
        [nim],
      );
      return rows[0] || null;
    },

    async create({ nama, nim, passwordHash }) {
      const rows = await db.query(
        `insert into members (nama, nim, password_hash, role)
         values ($1, $2, $3, 'praktikan')
         returning id, nama, nim, email, role, avatar_url`,
        [nama, nim, passwordHash],
      );
      return rows[0];
    },

    async findById(id) {
      const rows = await db.query(
        `select id, nama, nim, email, role, avatar_url
         from members
         where id = $1
         limit 1`,
        [id],
      );
      return rows[0] || null;
    },
  };
}
