import { z } from 'zod';

const optionalUuid = z.preprocess(
  (value) => (value === '' || value == null ? undefined : value),
  z.string().uuid('ID kategori tidak valid').optional(),
);

const optionalSearch = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().max(80, 'Kata kunci maksimal 80 karakter').optional(),
);

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
