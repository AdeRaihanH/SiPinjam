import { asyncHandler } from '../lib/errors.js';
import { sendData } from '../lib/response.js';

const URUTAN = ['elektronika', 'jaringan', 'alat-ukur', 'komponen'];

export function createCategoryController({ categories }) {
  return {
    list: asyncHandler(async (_req, res) => {
      const rows = await categories.list();
      const sorted = [...rows].sort(
        (a, b) => URUTAN.indexOf(a.slug) - URUTAN.indexOf(b.slug),
      );
      return sendData(res, sorted);
    }),
  };
}
