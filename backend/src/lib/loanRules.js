import { DEFAULT_FINE_PER_DAY } from './constants.js';
import { diffDaysISO, hariTerlambat } from './dates.js';

export function hitungDenda(dueISO, actualISO, tarif = DEFAULT_FINE_PER_DAY) {
  return hariTerlambat(dueISO, actualISO) * tarif;
}

export function statusEfektif(loan, today) {
  if (loan.status === 'dikembalikan') return 'dikembalikan';
  return diffDaysISO(loan.tanggal_kembali_rencana, today) > 0 ? 'terlambat' : 'dipinjam';
}

export function buatKodePinjam(today, urutan) {
  const tanggal = String(today).slice(2).replace(/-/g, '');
  return `PJM-${tanggal}-${String(urutan).padStart(3, '0')}`;
}

export function parseScanCode(raw, jenis) {
  const value = String(raw || '').trim();
  if (!value) return null;

  const qr = value.match(/^SIPINJAM:(TOOL|LOAN):([A-Za-z0-9-]+)$/i);
  if (qr) {
    const tipe = qr[1].toUpperCase();
    if (jenis && tipe !== String(jenis).toUpperCase()) return null;
    return qr[2].toUpperCase();
  }

  const prefix = jenis === 'loan'
    ? /^PJM-\d{6}-\d{3}$/i
    : jenis === 'tool'
      ? /^(ELK|JAR|ALK|KOM)-\d{3}$/i
      : /^(PJM-\d{6}-\d{3}|(ELK|JAR|ALK|KOM)-\d{3})$/i;

  return prefix.test(value) ? value.toUpperCase() : null;
}
