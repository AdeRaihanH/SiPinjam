import dotenv from 'dotenv';
import { DEFAULT_FINE_PER_DAY } from '../lib/constants.js';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'sipinjam-dev-secret-jangan-dipakai-di-produksi';

if (nodeEnv === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET wajib diisi saat NODE_ENV=production');
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dendaPerHari: Number(process.env.DENDA_PER_HARI || DEFAULT_FINE_PER_DAY),
};
