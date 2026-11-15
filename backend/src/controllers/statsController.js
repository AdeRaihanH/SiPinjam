import { z } from 'zod';
import { todayISO } from '../lib/dates.js';
import { asyncHandler } from '../lib/errors.js';
import { sendData } from '../lib/response.js';
import { kategoriDari } from '../lib/serializers.js';
import { validate } from '../validators/validate.js';

const populerSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export function createStatsController({ stats }) {
  return {
    summary: asyncHandler(async (req, res) => {
      return sendData(res, await stats.summary(req.auth.id, todayISO()));
    }),

    populer: asyncHandler(async (req, res) => {
      const { limit } = validate(populerSchema, req.query);
      const rows = await stats.populer(limit);
      return sendData(res, rows.map((row) => ({
        id: row.id,
        kode: row.kode,
        nama: row.nama,
        foto_url: row.foto_url || null,
        kondisi: row.kondisi,
        kategori: kategoriDari(row),
        total_dipinjam: Number(row.total_dipinjam),
      })));
    }),
  };
}
