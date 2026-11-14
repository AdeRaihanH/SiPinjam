const config = require('../config');
const { diffDaysISO, todayISO } = require('./dates');
const { statusPinjaman } = require('./loans');

function serializeUser(user) {
  return {
    id: user.id,
    nama: user.nama,
    nim: user.nim,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url || null,
  };
}

function serializeLoan(row, items = [], today = todayISO()) {
  const statusEfektif = statusPinjaman(row, today);
  const hariTerlambat = row.status === 'dikembalikan'
    ? Math.max(0, diffDaysISO(row.tanggal_kembali_rencana, row.tanggal_kembali_aktual))
    : statusEfektif === 'terlambat'
      ? diffDaysISO(row.tanggal_kembali_rencana, today)
      : 0;

  const dendaBerjalan = row.status === 'dipinjam'
    ? hariTerlambat * config.dendaPerHari
    : 0;
  const dendaFinal = row.status === 'dikembalikan' ? Number(row.denda || 0) : dendaBerjalan;

  const daftarItem = items.map((item) => ({
    id: item.id,
    tool_id: item.tool_id,
    jumlah: Number(item.jumlah),
    kode: item.kode,
    nama: item.nama,
    kategori_id: item.kategori_id,
    kategori_nama: item.kategori_nama,
    kategori_slug: item.kategori_slug,
    kategori_icon: item.kategori_icon,
  }));

  const ringkasan = daftarItem.length
    ? daftarItem.map((item) => `${item.nama} ×${item.jumlah}`).join(', ')
    : (row.ringkasan_alat || '');

  const jumlahItem = row.jumlah_item != null ? Number(row.jumlah_item) : daftarItem.length;
  const totalUnit = row.total_unit != null
    ? Number(row.total_unit)
    : daftarItem.reduce((total, item) => total + item.jumlah, 0);

  return {
    id: row.id,
    kode: row.kode,
    status: row.status,
    status_efektif: statusEfektif,
    tanggal_pinjam: row.tanggal_pinjam,
    tanggal_kembali_rencana: row.tanggal_kembali_rencana,
    tanggal_kembali_aktual: row.tanggal_kembali_aktual || null,
    denda: Number(row.denda || 0),
    denda_berjalan: dendaBerjalan,
    total_denda: dendaFinal,
    hari_terlambat: hariTerlambat,
    catatan: row.catatan || null,
    created_at: row.created_at,
    jumlah_item: jumlahItem,
    total_unit: totalUnit,
    ringkasan_alat: ringkasan,
    kategori_icon: row.kategori_icon || daftarItem[0]?.kategori_icon || 'cube-outline',
    kategori_slug: row.kategori_slug || daftarItem[0]?.kategori_slug || 'lainnya',
    kategori_nama: row.kategori_nama || daftarItem[0]?.kategori_nama || 'Alat laboratorium',
    bisa_dikembalikan: row.status === 'dipinjam',
    items: daftarItem,
  };
}

function serializeNotification(row) {
  return {
    id: row.id,
    tipe: row.tipe,
    judul: row.judul,
    pesan: row.pesan,
    ref_type: row.ref_type || null,
    ref_id: row.ref_id || null,
    show_at: row.show_at,
    dibaca: Boolean(Number(row.dibaca)),
    created_at: row.created_at,
  };
}

module.exports = { serializeUser, serializeLoan, serializeNotification };
