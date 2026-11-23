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
