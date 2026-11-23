export function createCategoryModel(db) {
  return {
    async list() {
      return db.query(
        'select id, nama, slug, icon from categories order by nama asc',
      );
    },
  };
}
