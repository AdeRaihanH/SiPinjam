import { todayISO } from '../lib/dates.js';
import { asyncHandler } from '../lib/errors.js';
import { sendData } from '../lib/response.js';
import { serializePopularTool } from '../lib/serializers.js';
import { popularToolsSchema } from '../validators/statsValidator.js';
import { validate } from '../validators/validate.js';

export function createStatsController({ stats }) {
  return {
    summary: asyncHandler(async (req, res) => {
      const semua = req.auth.role === 'admin';
      return sendData(res, await stats.summary(req.auth.id, todayISO(), semua));
    }),

    populer: asyncHandler(async (req, res) => {
      const { limit } = validate(popularToolsSchema, req.query);
      const rows = await stats.populer(limit);
      return sendData(res, rows.map(serializePopularTool));
    }),
  };
}
