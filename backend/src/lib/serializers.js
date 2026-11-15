import { env } from '../config/env.js';
import { diffDaysISO } from './dates.js';
import { statusEfektif } from './loanRules.js';

export function memberPublic(member) {
  return {
    id: member.id,
    nama: member.nama,
    nim: member.nim,
    email: member.email || null,
    role: member.role,
    avatar_url: member.avatar_url || null,
  };
}

export function kategoriDari(row) {
  const kategori = row.categories || row.category || null;
  return kategori
    ? {
      id: kategori.id,
      nama: kategori.nama,
      slug: kategori.slug,
      icon: kategori.icon || 'cube-outline',
    }
    : null;
}

export function serializeTool(row, { riwayat } = {}) {
  const tool = {
    id: row.id,
    kode: row.kode,
    nama: row.nama,
    deskripsi: row.deskripsi || '',
    stok_total: Number(row.stok_total),
    stok_tersedia: Number(row.stok_tersedia ?? row.stok_total ?? 0),
    kondisi: row.kondisi,
    foto_url: row.foto_url || null,
    kategori: kategoriDari(row),
  };
  if (riwayat) tool.riwayat = riwayat;
  return tool;
}

function serializeItem(item) {
  const tool = item.tools || item.tool || null;
  return {
    id: item.id,
    tool_id: item.tool_id,
    jumlah: Number(item.jumlah),
    tool: tool
      ? {
        id: tool.id,
        kode: tool.kode,
        nama: tool.nama,
        foto_url: tool.foto_url || null,
        kondisi: tool.kondisi,
        kategori: kategoriDari(tool),
      }
      : null,
  };
}

export function serializeLoan(row, today, { items = true, member = false } = {}) {
  const daftarItem = items ? (row.loan_items || []).map(serializeItem) : [];
  const totalUnit = daftarItem.length
    ? daftarItem.reduce((total, item) => total + item.jumlah, 0)
    : Number(row.total_unit || 0);
  const ringkasan = daftarItem.length
    ? daftarItem.map((item) => `${item.tool?.nama || 'Alat'} ×${item.jumlah}`).join(', ')
    : (row.ringkasan_alat || '');
  const status = statusEfektif(row, today);
  const hariTelat = row.status === 'dikembalikan'
    ? Math.max(0, diffDaysISO(
      row.tanggal_kembali_rencana,
      row.tanggal_kembali_aktual || row.tanggal_kembali_rencana,
    ))
    : status === 'terlambat'
      ? diffDaysISO(row.tanggal_kembali_rencana, today)
      : 0;
  const dendaBerjalan = row.status === 'dipinjam' ? hariTelat * env.dendaPerHari : 0;
  const totalDenda = row.status === 'dikembalikan' ? Number(row.denda || 0) : dendaBerjalan;

  const loan = {
    id: row.id,
    kode: row.kode,
    status: row.status,
    status_efektif: status,
    tanggal_pinjam: row.tanggal_pinjam,
    tanggal_kembali_rencana: row.tanggal_kembali_rencana,
    tanggal_kembali_aktual: row.tanggal_kembali_aktual || null,
    denda: Number(row.denda || 0),
    denda_berjalan: dendaBerjalan,
    total_denda: totalDenda,
    hari_terlambat: hariTelat,
    catatan: row.catatan || '',
    jumlah_item: daftarItem.length || Number(row.jumlah_item || 0),
    total_unit: totalUnit,
    ringkasan_alat: ringkasan,
    bisa_dikembalikan: row.status === 'dipinjam',
  };

  if (items) loan.items = daftarItem;
  if (member && row.members) {
    loan.member = { id: row.members.id, nama: row.members.nama, nim: row.members.nim };
  }
  return loan;
}

export function serializeNotification(row) {
  return {
    id: row.id,
    tipe: row.tipe,
    judul: row.judul,
    pesan: row.pesan || '',
    ref_type: row.ref_type || null,
    ref_id: row.ref_id || null,
    show_at: row.show_at,
    dibaca: Boolean(row.dibaca),
  };
}
