const API = 'http://localhost:5000/api/v1';

async function req(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const type = res.headers.get('content-type') || '';
  const json = type.includes('application/json') ? await res.json() : null;
  return { status: res.status, json, type, buffer: type.includes('image/png') ? await res.arrayBuffer() : null };
}

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });

const admin = await req('/auth/login', { method: 'POST', body: { nim: '2112012414000', password: 'admin123' } });
const adminToken = admin.json?.data?.token;
check('Login admin', admin.status === 200 && admin.json?.data?.member?.role === 'admin', admin.json?.data?.member?.nama);

const ade = await req('/auth/login', { method: 'POST', body: { nim: '21120124140118', password: 'praktikum123' } });
const adeToken = ade.json?.data?.token;
check('Login Ade NIM baru', ade.status === 200 && ade.json?.data?.member?.nim === '21120124140118');

const categories = await req('/categories');
const elektronika = categories.json?.data?.find((item) => item.slug === 'elektronika');
check('Kategori tersedia', Boolean(elektronika?.id));

const forbiddenCreate = await req('/tools', {
  method: 'POST', token: adeToken,
  body: { nama: 'Tidak Boleh', category_id: elektronika?.id, stok_total: 1 },
});
check('Praktikan tidak bisa create -> 403', forbiddenCreate.status === 403 && forbiddenCreate.json?.error?.code === 'FORBIDDEN');

const created = await req('/tools', {
  method: 'POST', token: adminToken,
  body: {
    nama: 'Alat Audit Admin',
    category_id: elektronika?.id,
    stok_total: 2,
    kondisi: 'baik',
    deskripsi: 'Dibuat oleh audit',
  },
});
const tool = created.json?.data;
check('Admin create alat + kode otomatis', created.status === 201 && /^ELK-\d{3}$/.test(tool?.kode || ''), tool?.kode);
check('Stok alat baru', tool?.stok_total === 2 && tool?.stok_tersedia === 2);

const qr = await req(`/tools/${tool?.id}/qr.png`);
check('QR PNG terbuat', qr.status === 200 && qr.type.includes('image/png') && qr.buffer?.byteLength > 100, `${qr.type} ${qr.buffer?.byteLength}`);

const updated = await req(`/tools/${tool?.id}`, {
  method: 'PATCH', token: adminToken,
  body: { nama: 'Alat Audit Admin Updated', stok_total: 3 },
});
check('Admin update alat', updated.status === 200 && updated.json?.data?.nama.includes('Updated') && updated.json?.data?.stok_total === 3);

const forbiddenUpdate = await req(`/tools/${tool?.id}`, {
  method: 'PATCH', token: adeToken, body: { nama: 'Nope' },
});
check('Praktikan tidak bisa update -> 403', forbiddenUpdate.status === 403);

const deleted = await req(`/tools/${tool?.id}`, { method: 'DELETE', token: adminToken });
check('Admin hapus alat baru', deleted.status === 200 && deleted.json?.data?.dihapus === true);
const afterDelete = await req(`/tools/${tool?.id}`);
check('Alat baru sudah tidak ada', afterDelete.status === 404);

const usedTool = await req('/tools/kode/ELK-001');
const usedDelete = await req(`/tools/${usedTool.json?.data?.id}`, { method: 'DELETE', token: adminToken });
check('Hapus alat ber-riwayat -> 409', usedDelete.status === 409 && usedDelete.json?.error?.code === 'CONFLICT');

const forbiddenDelete = await req(`/tools/${usedTool.json?.data?.id}`, { method: 'DELETE', token: adeToken });
check('Praktikan tidak bisa hapus -> 403', forbiddenDelete.status === 403);

for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'} | ${result.name}${result.detail ? ` | ${result.detail}` : ''}`);
}
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} PASS`);
if (results.some((r) => !r.ok)) process.exitCode = 1;
