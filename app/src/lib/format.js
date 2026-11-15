import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function safeParse(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = String(value);
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const date = normalized.includes('T') ? new Date(normalized) : parseISO(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTanggal(value, pattern = 'd MMM yyyy') {
  const date = safeParse(value);
  return date ? format(date, pattern, { locale: localeId }) : '-';
}

export function formatTanggalPanjang(value) {
  return formatTanggal(value, 'EEEE, d MMMM yyyy');
}

export function waktuLalu(value) {
  const date = safeParse(value);
  return date ? formatDistanceToNow(date, { addSuffix: true, locale: localeId }) : '-';
}

export function formatRupiah(value) {
  return `Rp${Number(value || 0).toLocaleString('id-ID')}`;
}

export function inisial(nama = '') {
  const parts = String(nama).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function namaDepan(nama = '') {
  return String(nama).trim().split(/\s+/)[0] || 'Praktikan';
}

export function labelKondisi(kondisi) {
  const map = {
    baik: 'Baik',
    rusak_ringan: 'Rusak ringan',
    rusak_berat: 'Rusak berat',
  };
  return map[kondisi] || 'Tidak diketahui';
}
