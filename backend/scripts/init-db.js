/**
 * Menyiapkan database dari nol:
 *   npm run db:init
 *
 * Membaca database/schema.sql lalu database/seed.sql. Peringatan: skrip ini
 * menghapus tabel yang sudah ada.
 */
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const config = require('../src/config');

async function main() {
  const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
  const seedPath = path.resolve(__dirname, '..', '..', 'database', 'seed.sql');

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const seed = fs.readFileSync(seedPath, 'utf8');

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    ssl: config.db.ssl,
    multipleStatements: true,
    charset: 'utf8mb4',
    dateStrings: true,
  });

  const database = config.db.database;
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error('DB_NAME hanya boleh berisi huruf, angka, dan garis bawah');
  }

  try {
    console.log(`[db] Menyiapkan database \`${database}\` di ${config.db.host}:${config.db.port}...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.changeUser({ database });

    console.log('[db] Membuat tabel...');
    await connection.query(schema);
    console.log('[db] Mengisi data awal...');
    await connection.query(seed);
    const [[users]] = await connection.query('SELECT COUNT(*) AS total FROM users');
    const [[tools]] = await connection.query('SELECT COUNT(*) AS total FROM tools');
    const [[loans]] = await connection.query('SELECT COUNT(*) AS total FROM loans');

    console.log('[db] Selesai.');
    console.log(`[db] ${users.total} pengguna, ${tools.total} alat, ${loans.total} pinjaman.`);
    console.log('[db] Akun demo: demo@sipinjam.id / sipinjam123');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('[db] Gagal menyiapkan database:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('[db] Pastikan MySQL sudah berjalan (XAMPP Control Panel > MySQL > Start).');
  }
  process.exit(1);
});
