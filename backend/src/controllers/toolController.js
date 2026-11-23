import QRCode from 'qrcode';

import { todayISO } from '../lib/dates.js';
import { ApiError, asyncHandler } from '../lib/errors.js';
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

const PREFIX_BY_SLUG = {
  elektronika: 'ELK',
  jaringan: 'JAR',
  'alat-ukur': 'ALK',
  komponen: 'KOM',
};

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

    create: asyncHandler(async (req, res) => {
      const body = validate(createToolSchema, req.body);
      const category = await categories.findById(body.category_id);
      if (!category) {
        throw new ApiError(422, 'VALIDATION_ERROR', 'Kategori tidak ditemukan', [
          { field: 'category_id', message: 'Kategori tidak ditemukan' },
        ]);
      }

      const prefix = PREFIX_BY_SLUG[category.slug];
      if (!prefix) {
        throw new ApiError(422, 'VALIDATION_ERROR', 'Kategori tidak mendukung kode alat', [
          { field: 'category_id', message: 'Kategori tidak mendukung kode alat' },
        ]);
      }

      if (body.kode && !body.kode.startsWith(`${prefix}-`)) {
        throw new ApiError(422, 'VALIDATION_ERROR', `Kode alat harus berawalan ${prefix}-`, [
          { field: 'kode', message: `Kode alat harus berawalan ${prefix}-` },
        ]);
      }

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
      const existing = await tools.findById(id);
      if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');

      const categoryId = body.category_id ?? existing.category_id;
      const category = categoryId ? await categories.findById(categoryId) : null;
      if (!category) {
        throw new ApiError(422, 'VALIDATION_ERROR', 'Kategori tidak ditemukan', [
          { field: 'category_id', message: 'Kategori tidak ditemukan' },
        ]);
      }

      const kode = body.kode ?? existing.kode;
      const prefix = PREFIX_BY_SLUG[category.slug];
      if (prefix && !kode.startsWith(`${prefix}-`)) {
        throw new ApiError(422, 'VALIDATION_ERROR', `Kode alat harus berawalan ${prefix}-`, [
          { field: 'kode', message: `Kode alat harus berawalan ${prefix}-` },
        ]);
      }

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
      const existing = await tools.findById(id);
      if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');

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
      const tool = await tools.findById(id);
      if (!tool) throw new ApiError(404, 'NOT_FOUND', 'Alat tidak ditemukan');

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
