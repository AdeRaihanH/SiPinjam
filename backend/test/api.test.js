process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { createApp } = await import('../src/app.js');
const { createMemoryModels, createMemoryStore } = await import('./support/memoryStore.js');
const { addDaysISO, todayISO } = await import('../src/lib/dates.js');

const DEMO_NIM = '2112012414011';
const RINA_NIM = '2112012414099';
const PASSWORD = 'praktikum123';

async function setup() {
  const store = createMemoryStore();
  const app = createApp(createMemoryModels(store));
  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ nim: DEMO_NIM, password: PASSWORD });

  return {
    app,
    store,
    token: login.body.data.token,
    auth: (req) => req.set('Authorization', `Bearer ${login.body.data.token}`),
  };
}

async function loginAs(app, nim) {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ nim, password: PASSWORD });
  return response.body.data.token;
}

test('health check dan login', async () => {
  const { app } = await setup();

  const health = await request(app).get('/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.data.status, 'ok');

  const salah = await request(app)
    .post('/api/v1/auth/login')
    .send({ nim: DEMO_NIM, password: 'salah' });
  assert.equal(salah.status, 401);
  assert.equal(salah.body.error.code, 'UNAUTHORIZED');

  const benar = await request(app)
    .post('/api/v1/auth/login')
    .send({ nim: DEMO_NIM, password: PASSWORD });
  assert.equal(benar.status, 200);
  assert.equal(benar.body.data.member.nim, DEMO_NIM);
  assert.ok(benar.body.data.token);

  const me = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${benar.body.data.token}`);
  assert.equal(me.status, 200);
  assert.equal(me.body.data.member.nama, 'Ade Raihan');
});

test('katalog, pencarian, filter, detail, dan riwayat', async () => {
  const { app, token } = await setup();

  const list = await request(app)
    .get('/api/v1/tools')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(list.status, 200);
  assert.equal(list.body.meta.total, 15);
  assert.equal(list.body.data[0].kategori.nama, 'Komponen');

  const search = await request(app)
    .get('/api/v1/tools?search=osilo')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(search.status, 200);
  assert.equal(search.body.meta.total, 1);
  assert.equal(search.body.data[0].kode, 'ALK-002');
  assert.equal(search.body.data[0].stok_tersedia, 1);

  const filter = await request(app)
    .get('/api/v1/tools?category_id=22222222-2222-4222-8222-222222222222')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(filter.status, 200);
  assert.equal(filter.body.meta.total, 4);

  const tersedia = await request(app)
    .get('/api/v1/tools?tersedia=1')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(tersedia.status, 200);
  assert.ok(tersedia.body.data.every((tool) => tool.stok_tersedia > 0));

  const detail = await request(app)
    .get(`/api/v1/tools/${search.body.data[0].id}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(detail.status, 200);
  assert.ok(Array.isArray(detail.body.data.riwayat));
  assert.ok(detail.body.data.riwayat.length >= 1);
  assert.ok(detail.body.data.riwayat.length <= 5);
});

test('validasi tanggal dan jumlah alat', async () => {
  const { app, token, store } = await setup();
  const tool = store.tools.find((row) => row.kode === 'ALK-002');

  const kemarin = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      tanggal_kembali_rencana: addDaysISO(todayISO(), -1),
      items: [{ tool_id: tool.id, jumlah: 1 }],
    });
  assert.equal(kemarin.status, 422);
  assert.equal(kemarin.body.error.code, 'VALIDATION_ERROR');
  assert.ok(kemarin.body.error.fields.length > 0);

  const hariIni = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      tanggal_kembali_rencana: todayISO(),
      items: [{ tool_id: tool.id, jumlah: 1 }],
    });
  assert.equal(hariIni.status, 422);

  const terlaluLama = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      tanggal_kembali_rencana: addDaysISO(todayISO(), 4),
      items: [{ tool_id: tool.id, jumlah: 1 }],
    });
  assert.equal(terlaluLama.status, 422);

  const empatAlat = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      tanggal_kembali_rencana: addDaysISO(todayISO(), 1),
      items: [
        { tool_id: 'b0000001-0000-4000-8000-000000000001', jumlah: 1 },
        { tool_id: 'b0000002-0000-4000-8000-000000000002', jumlah: 1 },
        { tool_id: 'b0000003-0000-4000-8000-000000000003', jumlah: 1 },
        { tool_id: 'b0000004-0000-4000-8000-000000000004', jumlah: 1 },
      ],
    });
  assert.equal(empatAlat.status, 422);
});

test('buat pinjaman, stok berkurang, dan pengembalian', async () => {
  const { app, token } = await setup();
  const toolId = 'b0000010-0000-4000-8000-000000000010';

  const created = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      tanggal_kembali_rencana: addDaysISO(todayISO(), 1),
      catatan: 'Uji dari test',
      items: [{ tool_id: toolId, jumlah: 1 }],
    });

  assert.equal(created.status, 201);
  assert.match(created.body.data.kode, /^PJM-\d{6}-\d{3}$/);
  assert.equal(created.body.data.status, 'dipinjam');

  const after = await request(app)
    .get(`/api/v1/tools/${toolId}`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(after.body.data.stok_tersedia, 0);

  const duplicate = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      tanggal_kembali_rencana: addDaysISO(todayISO(), 1),
      items: [{ tool_id: 'b0000001-0000-4000-8000-000000000001', jumlah: 1 }],
    });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, 'SUDAH_DIPINJAM');

  const returned = await request(app)
    .post(`/api/v1/loans/${created.body.data.id}/return`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(returned.status, 200);
  assert.equal(returned.body.data.status, 'dikembalikan');
  assert.equal(returned.body.data.denda, 0);

  const secondReturn = await request(app)
    .post(`/api/v1/loans/${created.body.data.id}/return`)
    .set('Authorization', `Bearer ${token}`);
  assert.equal(secondReturn.status, 409);
  assert.equal(secondReturn.body.error.code, 'CONFLICT');
});

test('stok kurang dan blokir pinjaman terlambat', async () => {
  const { app, token } = await setup();
  const toolId = 'b0000010-0000-4000-8000-000000000010';

  const stokKurang = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${token}`)
    .send({
      tanggal_kembali_rencana: addDaysISO(todayISO(), 1),
      items: [{ tool_id: toolId, jumlah: 2 }],
    });
  assert.equal(stokKurang.status, 409);
  assert.equal(stokKurang.body.error.code, 'STOK_TIDAK_CUKUP');

  const rinaToken = await loginAs(app, RINA_NIM);
  const blocked = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${rinaToken}`)
    .send({
      tanggal_kembali_rencana: addDaysISO(todayISO(), 1),
      items: [{ tool_id: 'b0000002-0000-4000-8000-000000000002', jumlah: 1 }],
    });
  assert.equal(blocked.status, 409);
  assert.equal(blocked.body.error.code, 'CONFLICT');
});

test('filter pinjaman dan batas kepemilikan', async () => {
  const { app, token } = await setup();
  const rinaToken = await loginAs(app, RINA_NIM);

  const selesai = await request(app)
    .get('/api/v1/loans?status=selesai')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(selesai.status, 200);
  assert.equal(selesai.body.meta.total, 4);

  const semua = await request(app)
    .get('/api/v1/loans?status=semua')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(semua.status, 200);
  assert.equal(semua.body.meta.total, 6);

  const demoLoan = semua.body.data[0];
  const forbidden = await request(app)
    .get(`/api/v1/loans/${demoLoan.id}`)
    .set('Authorization', `Bearer ${rinaToken}`);
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.body.error.code, 'FORBIDDEN');

  const forbiddenReturn = await request(app)
    .post(`/api/v1/loans/${demoLoan.id}/return`)
    .set('Authorization', `Bearer ${rinaToken}`);
  assert.equal(forbiddenReturn.status, 403);
});

test('pengembalian terlambat menghitung denda per hari', async () => {
  const { app } = await setup();
  const rinaToken = await loginAs(app, RINA_NIM);

  const loans = await request(app)
    .get('/api/v1/loans?status=aktif')
    .set('Authorization', `Bearer ${rinaToken}`);
  const late = loans.body.data.find((loan) => (
    loan.status_efektif === 'terlambat' && loan.hari_terlambat === 2
  ));
  assert.ok(late);
  assert.equal(late.denda_berjalan, 4000);

  const returned = await request(app)
    .post(`/api/v1/loans/${late.id}/return`)
    .set('Authorization', `Bearer ${rinaToken}`);
  assert.equal(returned.status, 200);
  assert.equal(returned.body.data.denda, 4000);
  assert.equal(returned.body.data.status_efektif, 'dikembalikan');
});

test('notifikasi hanya menampilkan show_at yang sudah lewat', async () => {
  const { app, token } = await setup();
  const rinaToken = await loginAs(app, RINA_NIM);

  const demoList = await request(app)
    .get('/api/v1/notifications')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(demoList.status, 200);
  assert.equal(demoList.body.data.length, 3);
  assert.ok(demoList.body.data.every((item) => new Date(item.show_at) <= new Date()));

  const list = await request(app)
    .get('/api/v1/notifications')
    .set('Authorization', `Bearer ${rinaToken}`);
  assert.equal(list.status, 200);
  assert.equal(list.body.meta.belum_dibaca, 2);
  assert.ok(list.body.data.length >= 2);

  const target = list.body.data.find((item) => !item.dibaca);
  const read = await request(app)
    .patch(`/api/v1/notifications/${target.id}/read`)
    .set('Authorization', `Bearer ${rinaToken}`);
  assert.equal(read.status, 200);

  const readAll = await request(app)
    .patch('/api/v1/notifications/read-all')
    .set('Authorization', `Bearer ${rinaToken}`);
  assert.equal(readAll.status, 200);

  const after = await request(app)
    .get('/api/v1/notifications')
    .set('Authorization', `Bearer ${rinaToken}`);
  assert.equal(after.body.meta.belum_dibaca, 0);
});

test('statistik ringkasan dan alat populer', async () => {
  const { app, token } = await setup();

  const summary = await request(app)
    .get('/api/v1/stats/summary')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(summary.status, 200);
  assert.equal(summary.body.data.total_alat, 15);
  assert.equal(summary.body.data.aktif, 2);
  assert.equal(summary.body.data.selesai, 4);
  assert.equal(summary.body.data.terlambat, 0);

  const populer = await request(app)
    .get('/api/v1/stats/populer?limit=5')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(populer.status, 200);
  assert.equal(populer.body.data.length, 5);
  assert.ok(populer.body.data[0].total_dipinjam >= 1);
});
