const { diffDaysISO, lateDays } = require('./dates');
const config = require('../config');

function hitungDenda(tanggalKembaliRencana, tanggalKembaliAktual, tarif = config.dendaPerHari) {
  const hari = Math.max(0, diffDaysISO(tanggalKembaliRencana, tanggalKembaliAktual));
  return hari * tarif;
}

function statusPinjaman(loan, today) {
  if (loan.status === 'dikembalikan') return 'dikembalikan';
  return diffDaysISO(loan.tanggal_kembali_rencana, today) > 0 ? 'terlambat' : 'dipinjam';
}

function buatKodePinjam(todayISO, urutan) {
  const tanggal = String(todayISO).slice(2).replace(/-/g, '');
  return `PJM-${tanggal}-${String(urutan).padStart(3, '0')}`;
}

/**
 * Menerima isi QR (SIPINJAM:TOOL:ALT-001) maupun kode polos (ALT-001).
 * Prefix asing sengaja ditolak supaya aplikasi tidak bereaksi pada QR
 * sembarang.
 */
function parseScanCode(raw, jenis) {
  const value = String(raw || '').trim();
  if (!value) return null;

  const qr = value.match(/^SIPINJAM:(TOOL|LOAN):([A-Za-z0-9-]+)$/i);
  if (qr) {
    const tipe = qr[1].toUpperCase();
    if (jenis && tipe !== String(jenis).toUpperCase()) return null;
    return qr[2].toUpperCase();
  }

  if (jenis) {
    const prefix = jenis === 'loan' ? /^PJM-\d{6}-\d{3}$/i : /^ALT-\d{3}$/i;
    return prefix.test(value) ? value.toUpperCase() : null;
  }

  if (/^(PJM-\d{6}-\d{3}|ALT-\d{3})$/i.test(value)) return value.toUpperCase();
  return null;
}

module.exports = {
  hitungDenda,
  statusPinjaman,
  buatKodePinjam,
  parseScanCode,
  lateDays,
};
