import { todayISO } from '../lib/dates.js';
import { ApiError, asyncHandler } from '../lib/errors.js';
import { parseScanCode, statusEfektif } from '../lib/loanRules.js';
import { sendData, sendList } from '../lib/response.js';
import { serializeTool } from '../lib/serializers.js';
import {
  kodeParamSchema,
  toolListSchema,
  uuidParamSchema,
} from '../validators/toolValidator.js';
import { validate } from '../validators/validate.js';

function serializeRiwayat(row, today) {
  return {
    kode: row.kode,
    tanggal_pinjam: row.tanggal_pinjam,
    tanggal_kembali_rencana: row.tanggal_kembali_rencana,
    tanggal_kembali_aktual: row.tanggal_kembali_aktual || null,
    status: row.status,
    status_efektif: statusEfektif(row, today),
    jumlah: (row.loan_items || []).reduce((total, item) => total + Number(item.jumlah), 0),
    member_nama: row.members?.nama || null,
  };
}

async function detailDenganRiwayat(tools, tool, today) {
  const riwayat = await tools.recentLoans(tool.id, 5);
  return {
    ...serializeTool(tool),
    riwayat: riwayat.map((row) => serializeRiwayat(row, today)),
  };
}

export function createToolController({ tools }) {
  return {
    list: asyncHandler(async (req, res) => {
      const query = validate(toolListSchema, req.query);
      const { rows, count } = await tools.list({
        search: query.search,
        categoryId: query.category_id,
        tersedia: query.tersedia,
        limit: query.limit,
        offset: query.offset,
      });

      return sendList(res, rows.map((row) => serializeTool(row)), {
        total: count,
        limit: query.limit,
        offset: query.offset,
      });
    }),

    detail: asyncHandler(async (req, res) => {
      const { id } = validate(uuidParamSchema, req.params);
      const tool = await tools.findById(id);
      if (!tool) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');
      return sendData(res, await detailDenganRiwayat(tools, tool, todayISO()));
    }),

    byKode: asyncHandler(async (req, res) => {
      const params = validate(kodeParamSchema, req.params);
      const kode = parseScanCode(params.kode, 'tool');
      if (!kode) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');

      const tool = await tools.findByKode(kode);
      if (!tool) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');
      return sendData(res, await detailDenganRiwayat(tools, tool, todayISO()));
    }),
  };
}
