import { CATEGORY_SLUG_ORDER } from '../lib/constants.js';
import { asyncHandler } from '../lib/errors.js';
import { sendData } from '../lib/response.js';

const ORDER = new Map(CATEGORY_SLUG_ORDER.map((slug, index) => [slug, index]));

export function createCategoryController({ categories }) {
  return {
    list: asyncHandler(async (_req, res) => {
      const rows = await categories.list();
      const sorted = [...rows].sort(
        (a, b) => (ORDER.get(a.slug) ?? ORDER.size) - (ORDER.get(b.slug) ?? ORDER.size),
      );
      return sendData(res, sorted);
    }),
  };
}
