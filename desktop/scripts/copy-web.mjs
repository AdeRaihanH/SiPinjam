import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(here, '..');
const source = join(desktopRoot, '..', 'app', 'dist');
const target = join(desktopRoot, 'web');

if (!existsSync(join(source, 'index.html'))) {
  console.error('Build web belum ada. Jalankan `npx expo export --platform web` di folder app dulu.');
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log(`Web build disalin ke ${target}`);
