import { z } from 'zod';

export const loginSchema = z.object({
  nim: z.string().trim().min(1, 'NIM wajib diisi').max(20, 'NIM terlalu panjang'),
  password: z.string().min(1, 'Kata sandi wajib diisi').max(100),
});
