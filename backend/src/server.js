const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`[sipinjam] API berjalan di http://localhost:${config.port}`);
  console.log(`[sipinjam] Health check: http://localhost:${config.port}/health`);
});

function shutdown(signal) {
  console.log(`[sipinjam] ${signal} diterima, menutup server...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 8000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
