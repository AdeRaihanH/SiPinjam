export function createCategoryModel(db) {
  return {
    async list() {
      return db.query(
        'select id, nama, slug, icon from categories order by nama asc',
      );
    },

    async findById(id) {
      const rows = await db.query(
        'select id, nama, slug, icon from categories where id = $1',
        [id],
      );
      return rows[0] || null;
    },
  };
}
