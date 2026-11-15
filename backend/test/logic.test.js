import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addDaysISO,
  atJakartaMorning,
  diffDaysISO,
  isDateISO,
  todayISO,
} from '../src/lib/dates.js';
import {
  buatKodePinjam,
  hitungDenda,
  parseScanCode,
  statusEfektif,
} from '../src/lib/loanRules.js';

test('todayISO memakai zona waktu Asia/Jakarta', () => {
  assert.equal(todayISO(new Date('2026-11-14T16:59:00.000Z')), '2026-11-14');
  assert.equal(todayISO(new Date('2026-11-14T17:00:00.000Z')), '2026-11-15');
});

test('isDateISO menolak tanggal yang tidak ada', () => {
  assert.equal(isDateISO('2026-11-15'), true);
  assert.equal(isDateISO('2024-02-29'), true);
  assert.equal(isDateISO('2026-02-29'), false);
  assert.equal(isDateISO('15-11-2026'), false);
});

test('addDaysISO dan diffDaysISO bekerja lintas bulan', () => {
  assert.equal(addDaysISO('2026-11-30', 1), '2026-12-01');
  assert.equal(addDaysISO('2026-12-31', 1), '2027-01-01');
  assert.equal(diffDaysISO('2026-11-15', '2026-11-18'), 3);
  assert.equal(diffDaysISO('2026-11-18', '2026-11-15'), -3);
});

test('atJakartaMorning menghasilkan pukul 08.00 WIB', () => {
  assert.equal(atJakartaMorning('2026-11-18'), '2026-11-18T01:00:00.000Z');
});

test('hitungDenda memakai hari kalender dan tarif', () => {
  assert.equal(hitungDenda('2026-11-15', '2026-11-15'), 0);
  assert.equal(hitungDenda('2026-11-15', '2026-11-15', 2000), 0);
  assert.equal(hitungDenda('2026-11-15', '2026-11-17', 2000), 4000);
  assert.equal(hitungDenda('2026-11-15', '2026-11-18', 2500), 7500);
});

test('statusEfektif membedakan dipinjam, terlambat, selesai', () => {
  const today = '2026-11-15';
  const dasar = { status: 'dipinjam', tanggal_kembali_rencana: '2026-11-16' };
  assert.equal(statusEfektif(dasar, today), 'dipinjam');
  assert.equal(statusEfektif({ ...dasar, tanggal_kembali_rencana: today }, today), 'dipinjam');
  assert.equal(statusEfektif({ ...dasar, tanggal_kembali_rencana: '2026-11-14' }, today), 'terlambat');
  assert.equal(statusEfektif({ ...dasar, status: 'dikembalikan' }, today), 'dikembalikan');
});

test('buatKodePinjam memakai PJM-YYMMDD-NNN', () => {
  assert.equal(buatKodePinjam('2026-11-15', 1), 'PJM-261115-001');
  assert.equal(buatKodePinjam('2026-11-15', 12), 'PJM-261115-012');
  assert.equal(buatKodePinjam('2027-01-03', 100), 'PJM-270103-100');
});

test('parseScanCode menerima QR dan kode alat baru', () => {
  assert.equal(parseScanCode('SIPINJAM:TOOL:ELK-001'), 'ELK-001');
  assert.equal(parseScanCode('SIPINJAM:LOAN:PJM-261115-001'), 'PJM-261115-001');
  assert.equal(parseScanCode('JAR-003'), 'JAR-003');
  assert.equal(parseScanCode('  ALK-002  '), 'ALK-002');
  assert.equal(parseScanCode('KOM-003'), 'KOM-003');
});

test('parseScanCode menolak prefix dan tipe yang salah', () => {
  assert.equal(parseScanCode('ALT-001'), null);
  assert.equal(parseScanCode('SIPINJAM:TOOL:ELK-001', 'loan'), null);
  assert.equal(parseScanCode('SIPINJAM:LOAN:PJM-261115-001', 'tool'), null);
  assert.equal(parseScanCode('ELK-1'), null);
  assert.equal(parseScanCode(''), null);
});
