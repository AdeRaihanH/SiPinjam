import { createApp } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { createMemoryModels, createMemoryStore } from './memoryStore.js';

const app = createApp(createMemoryModels(createMemoryStore()));
const port = Number(process.env.MOCK_PORT || env.port);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[sipinjam:mock] API mock berjalan di http://localhost:${port}`);
  console.log('[sipinjam:mock] Data in-memory; restart untuk mengembalikan seed.');
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
