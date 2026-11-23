import { z } from 'zod';

export const loginSchema = z.object({
  nim: z.string().trim().min(1, 'NIM wajib diisi').max(20, 'NIM terlalu panjang'),
  password: z.string().min(1, 'Kata sandi wajib diisi').max(100),
});

export const registerSchema = z.object({
  nama: z.string()
    .trim()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter')
    .transform((value) => value.replace(/\s+/g, ' ')),
  nim: z.string()
    .trim()
    .regex(/^\d{8,20}$/, 'NIM harus berupa 8–20 digit angka'),
  password: z.string()
    .min(8, 'Kata sandi minimal 8 karakter')
    .max(72, 'Kata sandi maksimal 72 karakter'),
});
