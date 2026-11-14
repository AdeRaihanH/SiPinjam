const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // DATE dikembalikan sebagai string 'YYYY-MM-DD' agar tidak bergeser
  // satu hari karena konversi zona waktu JavaScript.
  dateStrings: true,
  decimalNumbers: true,
  enableKeepAlive: true,
});

// Semua perhitungan tanggal (CURDATE, NOW) memakai WIB, bukan zona waktu
// server database yang bisa saja UTC.
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+07:00'");
});

async function withTransaction(fn) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, withTransaction };
