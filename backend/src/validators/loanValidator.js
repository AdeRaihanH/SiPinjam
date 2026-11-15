import { z } from 'zod';
import { isDateISO } from '../lib/dates.js';

const tanggalSchema = z.string().refine(isDateISO, 'Format tanggal harus YYYY-MM-DD');

export const createLoanSchema = z.object({
  tanggal_kembali_rencana: tanggalSchema,
  catatan: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(500, 'Catatan maksimal 500 karakter').optional(),
  ),
  items: z.array(
    z.object({
      tool_id: z.string().uuid('ID alat tidak valid'),
      jumlah: z.coerce.number().int().min(1, 'Jumlah minimal 1').max(99, 'Jumlah maksimal 99'),
    }),
  )
    .min(1, 'Pilih minimal satu alat')
    .max(3, 'Maksimal 3 alat per pinjaman')
    .superRefine((items, ctx) => {
      const ids = items.map((item) => item.tool_id);
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Alat yang sama tidak boleh dipilih dua kali',
        });
      }
    }),
});

export const loanListSchema = z.object({
  status: z.enum(['aktif', 'selesai', 'semua']).default('aktif'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
