import { z } from 'zod';
import { TOOL_CODE_PREFIX_BY_CATEGORY_SLUG } from '../lib/constants.js';

const optionalUuid = z.preprocess(
  (value) => (value === '' || value == null ? undefined : value),
  z.string().uuid('ID kategori tidak valid').optional(),
);

const optionalSearch = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().max(80, 'Kata kunci maksimal 80 karakter').optional(),
);

const KODE_PREFIXES = Object.values(TOOL_CODE_PREFIX_BY_CATEGORY_SLUG).join('|');
const KODE_PATTERN = new RegExp(`^(${KODE_PREFIXES})-\\d{3}$`);

const optionalKode = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
  z.string()
    .regex(KODE_PATTERN, 'Format kode harus ELK/JAR/ALK/KOM-000')
    .max(10, 'Kode maksimal 10 karakter')
    .optional(),
);

const optionalText = (max) => z.union([
  z.string().trim().max(max),
  z.literal(''),
  z.null(),
]).optional();

const optionalUrl = z.union([
  z.string().trim().url('URL tidak valid').max(500),
  z.literal(''),
  z.null(),
]).optional();

const kondisi = z.enum(['baik', 'rusak_ringan', 'rusak_berat']);

export const toolListSchema = z.object({
  search: optionalSearch,
  category_id: optionalUuid,
  tersedia: z.enum(['0', '1', 'true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('ID tidak valid'),
});

export const kodeParamSchema = z.object({
  kode: z.string().trim().min(1, 'Kode wajib diisi').max(30),
});

export const createToolSchema = z.object({
  kode: optionalKode,
  nama: z.string().trim().min(1, 'Nama alat wajib diisi').max(120),
  category_id: z.string().uuid('ID kategori tidak valid'),
  deskripsi: optionalText(1000),
  stok_total: z.coerce.number().int().min(0, 'Stok minimal 0').max(9999).default(0),
  kondisi: kondisi.default('baik'),
  foto_url: optionalUrl,
});

export const updateToolSchema = z.object({
  kode: optionalKode,
  nama: z.string().trim().min(1, 'Nama alat wajib diisi').max(120).optional(),
  category_id: z.string().uuid('ID kategori tidak valid').optional(),
  deskripsi: optionalText(1000),
  stok_total: z.coerce.number().int().min(0, 'Stok minimal 0').max(9999).optional(),
  kondisi: kondisi.optional(),
  foto_url: optionalUrl,
});
