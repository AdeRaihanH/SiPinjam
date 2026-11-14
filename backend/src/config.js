const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const env = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'sipinjam-dev-secret-jangan-dipakai-di-produksi';

if (env === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET wajib diisi saat NODE_ENV=production');
}

const toBool = (value) => String(value || '').toLowerCase() === 'true';

module.exports = {
  env,
  isProduction: env === 'production',
  port: Number(process.env.PORT || 5000),
  jwtSecret,
  jwtExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dendaPerHari: Number(process.env.DENDA_PER_HARI || 2000),
  maxDurasiHari: 3,
  maxItemPerPinjaman: 3,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sipinjam',
    ssl: toBool(process.env.DB_SSL) ? { rejectUnauthorized: false } : undefined,
  },
};
