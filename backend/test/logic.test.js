const test = require('node:test');
const assert = require('node:assert/strict');

const {
  addDaysISO,
  diffDaysISO,
  isDateISO,
  lateDays,
  todayISO,
} = require('../src/lib/dates');
const {
  buatKodePinjam,
  hitungDenda,
  parseScanCode,
  statusPinjaman,
} = require('../src/lib/loans');

test('todayISO memakai zona waktu Asia/Jakarta', () => {
  assert.equal(todayISO(new Date('2026-11-13T16:59:00.000Z')), '2026-11-13');
  assert.equal(todayISO(new Date('2026-11-13T17:00:00.000Z')), '2026-11-14');
  assert.equal(todayISO(new Date('2026-11-14T16:59:59.000Z')), '2026-11-14');
  assert.equal(todayISO(new Date('2026-11-14T17:00:00.000Z')), '2026-11-15');
});

test('isDateISO menolak tanggal yang tidak ada', () => {
  assert.equal(isDateISO('2026-11-14'), true);
  assert.equal(isDateISO('2024-02-29'), true);
  assert.equal(isDateISO('2026-02-29'), false);
  assert.equal(isDateISO('14-11-2026'), false);
  assert.equal(isDateISO(''), false);
});

test('addDaysISO melewati batas bulan dan tahun', () => {
  assert.equal(addDaysISO('2026-11-14', 3), '2026-11-17');
  assert.equal(addDaysISO('2026-11-30', 1), '2026-12-01');
  assert.equal(addDaysISO('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysISO('2024-02-28', 1), '2024-02-29');
  assert.equal(addDaysISO('2026-03-01', -1), '2026-02-28');
});

test('diffDaysISO menghitung selisih hari kalender', () => {
  assert.equal(diffDaysISO('2026-11-14', '2026-11-17'), 3);
  assert.equal(diffDaysISO('2026-11-17', '2026-11-14'), -3);
  assert.equal(diffDaysISO('2026-11-14', '2026-11-14'), 0);
  assert.equal(diffDaysISO('2026-12-31', '2027-01-01'), 1);
});

test('lateDays tidak pernah negatif', () => {
  assert.equal(lateDays('2026-11-14', '2026-11-14'), 0);
  assert.equal(lateDays('2026-11-14', '2026-11-13'), 0);
  assert.equal(lateDays('2026-11-14', '2026-11-16'), 2);
});

test('hitungDenda memakai tarif per hari', () => {
  assert.equal(hitungDenda('2026-11-14', '2026-11-14'), 0);
  assert.equal(hitungDenda('2026-11-14', '2026-11-13'), 0);
  assert.equal(hitungDenda('2026-11-14', '2026-11-15'), 2000);
  assert.equal(hitungDenda('2026-11-14', '2026-11-16'), 4000);
  assert.equal(hitungDenda('2026-11-14', '2026-11-16', 5000), 10000);
});

test('statusPinjaman membedakan aktif, terlambat, dan selesai', () => {
  const today = '2026-11-14';
  const dasar = {
    status: 'dipinjam',
    tanggal_kembali_rencana: '2026-11-15',
  };
  assert.equal(statusPinjaman(dasar, today), 'dipinjam');
  assert.equal(
    statusPinjaman({ ...dasar, tanggal_kembali_rencana: '2026-11-14' }, today),
    'dipinjam',
    'jatuh tempo hari ini belum dihitung terlambat',
  );
  assert.equal(
    statusPinjaman({ ...dasar, tanggal_kembali_rencana: '2026-11-13' }, today),
    'terlambat',
  );
  assert.equal(
    statusPinjaman({ ...dasar, status: 'dikembalikan', tanggal_kembali_rencana: '2026-11-01' }, today),
    'dikembalikan',
  );
});

test('buatKodePinjam memakai format PJM-YYMMDD-XXX', () => {
  assert.equal(buatKodePinjam('2026-11-14', 1), 'PJM-261114-001');
  assert.equal(buatKodePinjam('2026-11-14', 27), 'PJM-261114-027');
  assert.equal(buatKodePinjam('2027-01-03', 100), 'PJM-270103-100');
});

test('parseScanCode menerima QR SiPinjam dan kode polos', () => {
  assert.equal(parseScanCode('SIPINJAM:TOOL:ALT-001'), 'ALT-001');
  assert.equal(parseScanCode('sipinjam:tool:alt-001'), 'ALT-001');
  assert.equal(parseScanCode('SIPINJAM:LOAN:PJM-261114-001'), 'PJM-261114-001');
  assert.equal(parseScanCode('ALT-001'), 'ALT-001');
  assert.equal(parseScanCode('PJM-261114-001'), 'PJM-261114-001');
  assert.equal(parseScanCode('  ALT-002  '), 'ALT-002');
});

test('parseScanCode menolak prefix dan tipe yang salah', () => {
  assert.equal(parseScanCode('HTTPS://CONTOH.COM'), null);
  assert.equal(parseScanCode('SIPINJAM:TOOL:ALT-001', 'loan'), null);
  assert.equal(parseScanCode('SIPINJAM:LOAN:PJM-261114-001', 'tool'), null);
  assert.equal(parseScanCode('ALT-1'), null);
  assert.equal(parseScanCode('PJM-26111-001'), null);
  assert.equal(parseScanCode(''), null);
});
