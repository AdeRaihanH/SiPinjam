const QR_PATTERN = /^SIPINJAM:(TOOL|LOAN):([A-Za-z0-9-]+)$/i;
const TOOL_PATTERN = /^(ELK|JAR|ALK|KOM)-\d{3}$/i;
const LOAN_PATTERN = /^PJM-\d{6}-\d{3}$/i;

export function toLoanQr(kode) {
  return `SIPINJAM:LOAN:${kode}`;
}

export function parseQr(value) {
  const raw = String(value || '').trim();
  const match = raw.match(QR_PATTERN);
  if (match) {
    return { type: match[1].toLowerCase(), code: match[2].toUpperCase() };
  }
  return parseKode(raw);
}

export function parseKode(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (TOOL_PATTERN.test(raw)) return { type: 'tool', code: raw };
  if (LOAN_PATTERN.test(raw)) return { type: 'loan', code: raw };
  return null;
}
