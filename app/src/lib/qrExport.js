import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { API_BASE_URL } from '../api/client';

function toolQrUrl(toolId) {
  return `${API_BASE_URL}/tools/${toolId}/qr.png`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function saveToolQr(tool) {
  const url = toolQrUrl(tool.id);

  if (Platform.OS === 'web') {
    const link = document.createElement('a');
    link.href = `${url}?download=1`;
    link.download = `${tool.kode}.png`;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  const target = `${FileSystem.cacheDirectory}${tool.kode}.png`;
  const result = await FileSystem.downloadAsync(`${url}?download=1`, target);
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Penyimpanan tidak tersedia di perangkat ini');
  }
  await Sharing.shareAsync(result.uri, {
    mimeType: 'image/png',
    dialogTitle: `Simpan QR ${tool.kode}`,
  });
}

export async function printToolQr(tool) {
  const url = toolQrUrl(tool.id);
  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 14mm; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; text-align: center; color: #0F172A; }
  img { width: 72mm; height: 72mm; display: block; margin: 0 auto 8mm; }
  h1 { font-size: 24pt; margin: 0 0 2mm; letter-spacing: 1px; }
  p { font-size: 12pt; margin: 0 0 4mm; }
  small { font-size: 9pt; color: #64748B; letter-spacing: .8px; }
</style>
</head>
<body>
  <img src="${url}" onload="window.print()" />
  <h1>${escapeHtml(tool.kode)}</h1>
  <p>${escapeHtml(tool.nama)}</p>
  <small>SIPINJAM:TOOL:${escapeHtml(tool.kode)}</small>
</body>
</html>`;

  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (!win) throw new Error('Popup diblokir browser');
    win.document.open();
    win.document.write(html);
    win.document.close();
    return;
  }

  await Print.printAsync({ html });
}
