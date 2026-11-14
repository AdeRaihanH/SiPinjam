const QR_PATTERN = /^SIPINJAM:(TOOL|LOAN):([A-Za-z0-9-]+)$/i;

export function toToolQr(kode) {
  return `SIPINJAM:TOOL:${kode}`;
}

export function toLoanQr(kode) {
  return `SIPINJAM:LOAN:${kode}`;
}

/**
 * Mengembalikan { type: 'tool' | 'loan', code } atau null bila isi QR bukan
 * milik SiPinjam.
 */
export function parseQr(value) {
  const raw = String(value || '').trim();
  const match = raw.match(QR_PATTERN);
  if (match) {
    return {
      type: match[1].toLowerCase(),
      code: match[2].toUpperCase(),
    };
  }
  return parseKode(raw);
}

export function parseKode(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (/^ALT-\d{3}$/.test(raw)) return { type: 'tool', code: raw };
  if (/^PJM-\d{6}-\d{3}$/.test(raw)) return { type: 'loan', code: raw };
  return null;
}
