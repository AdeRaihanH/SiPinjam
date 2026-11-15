import { createApp } from './app.js';
import { env } from './config/env.js';
import { supabase } from './config/supabaseClient.js';
import { createModels } from './models/index.js';

const app = createApp(createModels(supabase));

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`[sipinjam] API berjalan di http://localhost:${env.port}`);
  console.log(`[sipinjam] Health check: http://localhost:${env.port}/health`);
});

function shutdown(signal) {
  console.log(`[sipinjam] ${signal} diterima, menutup server...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 8000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
