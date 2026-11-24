import QRCode from 'qrcode';

import { TOOL_CODE_PREFIX_BY_CATEGORY_SLUG } from '../lib/constants.js';
import { todayISO } from '../lib/dates.js';
import { ApiError, asyncHandler, validationError } from '../lib/errors.js';
import { parseScanCode, statusEfektif } from '../lib/loanRules.js';
import { sendData, sendList } from '../lib/response.js';
import { serializeTool } from '../lib/serializers.js';
import {
  createToolSchema,
  kodeParamSchema,
  toolListSchema,
  updateToolSchema,
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

async function findToolOrThrow(tools, id) {
  const tool = await tools.findById(id);
  if (!tool) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');
  return tool;
}

async function findToolByKodeOrThrow(tools, kode) {
  const tool = await tools.findByKode(kode);
  if (!tool) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');
  return tool;
}

async function resolveCategoryPrefix(categories, categoryId) {
  const category = await categories.findById(categoryId);
  if (!category) throw validationError('category_id', 'Kategori tidak ditemukan');

  const prefix = TOOL_CODE_PREFIX_BY_CATEGORY_SLUG[category.slug];
  if (!prefix) throw validationError('category_id', 'Kategori tidak mendukung kode alat');

  return prefix;
}

function assertKodePrefix(kode, prefix) {
  if (!kode.startsWith(`${prefix}-`)) {
    throw validationError('kode', `Kode alat harus berawalan ${prefix}-`);
  }
}

export function createToolController({ tools, categories }) {
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
      const tool = await findToolOrThrow(tools, id);
      return sendData(res, await detailDenganRiwayat(tools, tool, todayISO()));
    }),

    byKode: asyncHandler(async (req, res) => {
      const params = validate(kodeParamSchema, req.params);
      const kode = parseScanCode(params.kode, 'tool');
      if (!kode) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');

      const tool = await findToolByKodeOrThrow(tools, kode);
      return sendData(res, await detailDenganRiwayat(tools, tool, todayISO()));
    }),

    create: asyncHandler(async (req, res) => {
      const body = validate(createToolSchema, req.body);
      const prefix = await resolveCategoryPrefix(categories, body.category_id);
      if (body.kode) assertKodePrefix(body.kode, prefix);

      const kode = body.kode || await tools.nextKode(prefix);
      const id = await tools.create({
        ...body,
        kode,
        deskripsi: body.deskripsi || null,
        foto_url: body.foto_url || null,
      });
      const tool = await tools.findById(id);
      return sendData(res, serializeTool(tool), 201);
    }),

    update: asyncHandler(async (req, res) => {
      const { id } = validate(uuidParamSchema, req.params);
      const body = validate(updateToolSchema, req.body);
      const existing = await findToolOrThrow(tools, id);

      const categoryId = body.category_id ?? existing.category_id;
      const prefix = await resolveCategoryPrefix(categories, categoryId);
      const kode = body.kode ?? existing.kode;
      assertKodePrefix(kode, prefix);

      await tools.update(id, {
        kode,
        nama: body.nama ?? existing.nama,
        category_id: categoryId,
        deskripsi: body.deskripsi === undefined ? existing.deskripsi : body.deskripsi,
        stok_total: body.stok_total ?? existing.stok_total,
        kondisi: body.kondisi ?? existing.kondisi,
        foto_url: body.foto_url === undefined ? existing.foto_url : body.foto_url,
      });

      const updated = await tools.findById(id);
      return sendData(res, serializeTool(updated));
    }),

    remove: asyncHandler(async (req, res) => {
      const { id } = validate(uuidParamSchema, req.params);
      await findToolOrThrow(tools, id);

      const used = await tools.countLoanItems(id);
      if (used > 0) {
        throw new ApiError(
          409,
          'CONFLICT',
          'Alat sudah memiliki riwayat peminjaman dan tidak dapat dihapus',
        );
      }

      await tools.remove(id);
      return sendData(res, { id, dihapus: true });
    }),

    qr: asyncHandler(async (req, res) => {
      const { id } = validate(uuidParamSchema, req.params);
      const tool = await findToolOrThrow(tools, id);

      const buffer = await QRCode.toBuffer(`SIPINJAM:TOOL:${tool.kode}`, {
        type: 'png',
        width: 640,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });

      res.set('Content-Type', 'image/png');
      const download = String(req.query.download || '') === '1';
      res.set('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${tool.kode}.png"`);
      res.set('Cache-Control', 'public, max-age=3600');
      return res.send(buffer);
    }),
  };
}
