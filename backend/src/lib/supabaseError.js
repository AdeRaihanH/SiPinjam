import { ApiError } from './errors.js';

export function throwIfSupabaseError(error) {
  if (!error) return;

  if (error.code === '23505') {
    throw new ApiError(409, 'CONFLICT', 'Data yang sama sudah ada');
  }
  if (error.code === 'PGRST116') {
    throw new ApiError(404, 'NOT_FOUND', 'Data tidak ditemukan');
  }
  if (error.code === '23503') {
    throw new ApiError(409, 'CONFLICT', 'Data masih dipakai oleh tabel lain');
  }
  throw new ApiError(500, 'INTERNAL_ERROR', 'Terjadi kesalahan pada database');
}
