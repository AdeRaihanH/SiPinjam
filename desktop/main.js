const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow, session, shell } = require('electron');

const WEB_ROOT = path.join(__dirname, 'web');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json; charset=utf-8',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isShell = ext === '.html' || path.basename(filePath) === 'sw.js';
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': isShell ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(filePath).pipe(res);
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    try {
      const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.normalize(path.join(WEB_ROOT, rawPath));

      if (filePath !== WEB_ROOT && !filePath.startsWith(WEB_ROOT + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      // SPA fallback: rute apa pun dilayani index.html.
      if (!fs.existsSync(filePath)) filePath = path.join(WEB_ROOT, 'index.html');

      serveFile(res, filePath);
    } catch {
      res.writeHead(500).end('Internal Server Error');
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function createWindow() {
  const port = await startStaticServer();

  const win = new BrowserWindow({
    width: 1180,
    height: 860,
    minWidth: 420,
    minHeight: 640,
    title: 'SiPinjam',
    backgroundColor: '#E6EAF2',
    autoHideMenuBar: true,
    icon: path.join(WEB_ROOT, 'icons', 'icon-512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Kamera untuk pemindaian QR (hanya untuk halaman lokal aplikasi).
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'media' || permission === 'camera');
  });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === 'media' || permission === 'camera');

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      win.webContents.reload();
      event.preventDefault();
    }
    if (input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });

  win.loadURL(`http://127.0.0.1:${port}/`);
  return win;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
