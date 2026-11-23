import { neon, types } from '@neondatabase/serverless';
import { env } from './env.js';

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL wajib diisi di backend/.env');
}

// Date/timestamp dikembalikan sebagai string apa adanya (mis. "2026-11-16"),
// sama seperti respons PostgREST sebelumnya. Tanpa ini driver mengubahnya
// menjadi objek Date dan perhitungan tanggal di lib/dates.js rusak.
const DATE_OIDS = new Set([1082, 1083, 1114, 1184, 1266]);

const queryTypes = {
  getTypeParser(id, format) {
    if (DATE_OIDS.has(id)) return (value) => value;
    return types.getTypeParser(id, format);
  },
};

// Driver HTTP Neon: satu query = satu request, cocok untuk Vercel/serverless.
const sql = neon(env.databaseUrl);

export const db = {
  query(text, params = []) {
    return sql.query(text, params, { types: queryTypes });
  },
};
