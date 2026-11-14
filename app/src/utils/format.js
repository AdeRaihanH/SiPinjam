import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  parseISO,
  startOfDay,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function safeParse(isoDate) {
  if (!isoDate) return null;
  if (isoDate instanceof Date) {
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }
  const value = String(isoDate);
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = normalized.includes('T') ? new Date(normalized) : parseISO(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTanggal(isoDate, pattern = 'd MMM yyyy') {
  const date = safeParse(isoDate);
  return date ? format(date, pattern, { locale: localeId }) : '-';
}

export function formatTanggalPanjang(isoDate) {
  return formatTanggal(isoDate, 'EEEE, d MMMM yyyy');
}

export function formatTanggalPendek(isoDate) {
  return formatTanggal(isoDate, 'd MMM');
}

export function formatDateTime(value) {
  const date = safeParse(value);
  if (!date) return '-';
  return format(date, 'd MMM yyyy, HH.mm', { locale: localeId });
}

export function selisihHari(isoDate) {
  const date = safeParse(isoDate);
  if (!date) return 0;
  return differenceInCalendarDays(date, startOfDay(new Date()));
}

export function hariTerlambat(isoDate) {
  return Math.max(0, -selisihHari(isoDate));
}

export function waktuLalu(value) {
  const date = safeParse(value);
  if (!date) return '-';
  return formatDistanceToNow(date, { addSuffix: true, locale: localeId });
}

export function formatRupiah(value) {
  const number = Number(value || 0);
  return `Rp${number.toLocaleString('id-ID')}`;
}

export function inisial(nama = '') {
  const parts = String(nama).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function namaDepan(nama = '') {
  return String(nama).trim().split(/\s+/)[0] || 'Peminjam';
}

export function labelKondisi(kondisi) {
  const map = {
    baik: 'Baik',
    rusak_ringan: 'Rusak ringan',
    rusak_berat: 'Rusak berat',
  };
  return map[kondisi] || 'Kondisi tidak diketahui';
}

export function labelTipeNotifikasi(tipe) {
  const map = {
    jatuh_tempo: 'Pengingat',
    terlambat: 'Keterlambatan',
    pengembalian: 'Pengembalian',
    sistem: 'Informasi',
  };
  return map[tipe] || 'Informasi';
}

export function dueLabel(loan) {
  if (loan?.status === 'dikembalikan' && loan.tanggal_kembali_aktual) {
    return `Dikembalikan ${formatTanggal(loan.tanggal_kembali_aktual)}`;
  }
  const sisa = selisihHari(loan?.tanggal_kembali_rencana);
  if (sisa < 0) return `Terlambat ${Math.abs(sisa)} hari`;
  if (sisa === 0) return 'Jatuh tempo hari ini';
  if (sisa === 1) return 'Jatuh tempo besok';
  return `Jatuh tempo ${formatTanggal(loan?.tanggal_kembali_rencana)}`;
}
