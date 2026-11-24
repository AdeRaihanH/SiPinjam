# Dokumentasi API SiPinjam

Base URL lokal: `http://localhost:5000/api/v1`  
Autentikasi: `Authorization: Bearer <JWT>` (masa berlaku 7 hari)
Format: JSON.

## Envelope

Sukses:

```json
{ "data": {} }
```

Daftar:

```json
{
  "data": [],
  "meta": { "total": 15, "limit": 20, "offset": 0 }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tanggal kembali minimal besok (durasi 1 hari)",
    "fields": [
      { "field": "tanggal_kembali_rencana", "message": "Tanggal kembali minimal besok (durasi 1 hari)" }
    ]
  }
}
```

| Kode | HTTP | Arti |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Body/query tidak valid |
| `INVALID_JSON` | 400 | Body bukan JSON |
| `UNAUTHORIZED` | 401 | Token tidak ada/kedaluwarsa, NIM atau sandi salah |
| `FORBIDDEN` | 403 | Objek milik member lain |
| `NOT_FOUND` | 404 | Data/endpoint tidak ditemukan |
| `CONFLICT` | 409 | Duplikasi, pinjaman terlambat, atau pengembalian kedua |
| `STOK_TIDAK_CUKUP` | 409 | Jumlah melebihi `stok_tersedia` |
| `DATABASE_UNAVAILABLE` | 503 | Database tidak dapat diakses |
| `INTERNAL_ERROR` | 500 | Kesalahan server |

## Status

| Nilai | Asal | Arti |
| --- | --- | --- |
| `dipinjam` | kolom `loans.status` | Belum dikembalikan |
| `dikembalikan` | kolom `loans.status` | Sudah dikembalikan |
| `terlambat` | dihitung | `dipinjam` dan `tanggal_kembali_rencana < hari ini` (WIB) |

`denda` diisi saat pengembalian. `denda_berjalan` dihitung untuk pinjaman aktif yang lewat tenggat. `total_denda` = denda final (jika selesai) atau denda berjalan (jika aktif). `denda_per_hari` adalah tarif yang dipakai server.

## QR

- Alat: `SIPINJAM:TOOL:ELK-001`
- Pinjaman: `SIPINJAM:LOAN:PJM-261115-001`

Endpoint lookup menerima QR lengkap maupun kode polos. Prefix lain ditolak `404 NOT_FOUND`.

---

## Auth

### POST `/auth/register`

Pendaftaran mandiri **khusus praktikan**. Nama lengkap, NIM, dan kata sandi wajib diisi; role selalu `praktikan` dan email boleh kosong.

```json
{
  "nama": "Nama Praktikan",
  "nim": "1234567890",
  "password": "kata-sandi-anda"
}
```

Aturan: nama 3–100 karakter, NIM 8–20 digit angka dan unik, kata sandi 8–72 karakter. `201` membuat akun sekaligus mengembalikan token (auto-login):

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "member": {
      "id": "...",
      "nama": "Nama Praktikan",
      "nim": "1234567890",
      "email": null,
      "role": "praktikan",
      "avatar_url": null
    }
  }
}
```

NIM yang sudah dipakai menghasilkan `409 CONFLICT`. Body tidak valid menghasilkan `422 VALIDATION_ERROR` dengan `fields`.

### POST `/auth/login`

```json
{ "nim": "1234567890", "password": "kata-sandi-anda" }
```

`200`:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "member": {
      "id": "...",
      "nama": "Nama Praktikan",
      "nim": "1234567890",
      "email": null,
      "role": "praktikan",
      "avatar_url": null
    }
  }
}
```

### GET `/auth/me`

Header Bearer. Respons `{ "data": { "member": { ... } } }`.

Akun admin dibuat lewat SQL (lihat README) dan token-nya membawa `role: "admin"`. Endpoint tulis alat wajib memakai token admin.

## Alat (admin)

Endpoint berikut memerlukan Bearer token dengan role `admin`; selain admin mendapat `403 FORBIDDEN`.

### POST `/tools`

Body:

```json
{
  "nama": "Osiloskop Digital",
  "category_id": "22222222-2222-4222-8222-222222222222",
  "kode": "ELK-005",
  "stok_total": 2,
  "kondisi": "baik",
  "deskripsi": "Opsional",
  "foto_url": "https://..."
}
```

`kode` opsional — jika kosong, server membuat kode berikutnya sesuai kategori (`ELK-`, `JAR-`, `ALK-`, `KOM-`). Respons `201` berisi alat yang dibuat.

### PATCH `/tools/:id`

Body sama dengan create; semua field opsional. Jika kategori diubah dan kode tidak diberikan, kode lama dipertahankan (pastikan tetap sesuai prefix kategori).

### DELETE `/tools/:id`

`200` jika berhasil. `409 CONFLICT` jika alat sudah memiliki riwayat `loan_items` — alat tidak dihapus agar riwayat tetap utuh.

### GET `/tools/:id/qr.png`

Mengembalikan PNG QR `SIPINJAM:TOOL:<kode>` (640px). Dipakai tombol **Simpan PNG** dan **Cetak QR** di aplikasi.

---

## Kategori

### GET `/categories`

```json
{
  "data": [
    { "id": "1111...", "nama": "Elektronika", "slug": "elektronika", "icon": "hardware-chip-outline" }
  ]
}
```

---

## Alat

### GET `/tools`

| Query | Tipe | Keterangan |
| --- | --- | --- |
| `search` | string | Nama atau kode |
| `category_id` | uuid | Filter kategori |
| `tersedia` | `1`/`true` | Hanya `stok_tersedia > 0` |
| `limit` | 1–50 | Default 20 |
| `offset` | ≥0 | Default 0 |

Respons:

```json
{
  "data": [
    {
      "id": "b0000010-0000-4000-8000-000000000010",
      "kode": "ALK-002",
      "nama": "Osiloskop Hantek DSO2D10",
      "deskripsi": "Osiloskop 2 kanal 100 MHz...",
      "stok_total": 2,
      "stok_tersedia": 1,
      "kondisi": "rusak_ringan",
      "foto_url": "https://...",
      "kategori": {
        "id": "33333333-3333-4333-8333-333333333333",
        "nama": "Alat Ukur",
        "slug": "alat-ukur",
        "icon": "speedometer-outline"
      }
    }
  ],
  "meta": { "total": 1, "limit": 20, "offset": 0 }
}
```

Stok dihitung oleh view `tool_stok`, bukan kolom tersimpan.

### GET `/tools/:id`

Sama seperti item di atas, ditambah:

```json
{
  "riwayat": [
    {
      "kode": "PJM-261109-001",
      "tanggal_pinjam": "2026-11-09",
      "tanggal_kembali_rencana": "2026-11-13",
      "tanggal_kembali_aktual": null,
      "status": "dipinjam",
      "status_efektif": "terlambat",
      "jumlah": 1,
      "member_nama": "Ade Raihan Hanafi"
    }
  ]
}
```

Maksimal 5 riwayat terakhir.

### GET `/tools/kode/:kode`

Menerima `ALK-002` atau `SIPINJAM:TOOL:ALK-002`. URL-encode jika memakai prefix.

---

## Pinjaman

### POST `/loans`

Header Bearer. Body:

```json
{
  "tanggal_kembali_rencana": "2026-11-16",
  "catatan": "Praktikum jaringan",
  "items": [
    { "tool_id": "b0000010-0000-4000-8000-000000000010", "jumlah": 1 }
  ]
}
```

Aturan:

- `items` 1–3 baris, `tool_id` unik.
- `jumlah` 1–99 dan ≤ `stok_tersedia`.
- `tanggal_kembali_rencana` minimal besok, maksimal 3 hari dari hari ini.
- Ditolak `CONFLICT` bila member masih punya pinjaman lewat tenggat.
- Alat yang sama boleh dipinjam lagi di transaksi terpisah selama `stok_tersedia` masih mencukupi. Dalam satu transaksi, `tool_id` tetap harus unik.
- `tanggal_pinjam` dan kode dibuat server (WIB).
- Setelah header dibuat, item dimasukkan. Jika insert item gagal, header dihapus sebagai kompensasi.
- Dua notifikasi dibuat: H-1 pukul 08.00 WIB dan hari tenggat pukul 08.00 WIB.

`201` mengembalikan detail pinjaman (id, kode, status, tanggal, denda, items, dll.).

### GET `/loans`

| Query | Nilai | Keterangan |
| --- | --- | --- |
| `status` | `aktif` (default), `selesai`, `semua` | `aktif` = semua `dipinjam`, termasuk yang lewat tenggat |
| `limit` | 1–50 | Default 20 |
| `offset` | ≥0 | Default 0 |

Praktikan hanya menerima pinjaman miliknya. Admin menerima **semua pinjaman** dari seluruh praktikan, dan setiap item menyertakan objek `member` berisi nama/NIM peminjam. Item ringkas berisi `tool_id`, `jumlah`, dan objek `tool`.

### GET `/loans/:id`

Praktikan hanya boleh membuka pinjaman miliknya; admin boleh membuka semua. `403` jika praktikan bukan pemilik.

```json
{
  "data": {
    "id": "...",
    "kode": "PJM-261115-001",
    "status": "dipinjam",
    "status_efektif": "terlambat",
    "tanggal_pinjam": "2026-11-14",
    "tanggal_kembali_rencana": "2026-11-15",
    "tanggal_kembali_aktual": null,
    "denda": 0,
    "denda_berjalan": 2000,
    "total_denda": 2000,
    "denda_per_hari": 2000,
    "hari_terlambat": 1,
    "catatan": "",
    "jumlah_item": 1,
    "total_unit": 1,
    "ringkasan_alat": "Tang Crimping RJ45 ×3",
    "bisa_dikembalikan": true,
    "items": [
      {
        "id": "...",
        "tool_id": "...",
        "jumlah": 3,
        "tool": {
          "id": "...",
          "kode": "JAR-003",
          "nama": "Tang Crimping RJ45",
          "foto_url": "https://...",
          "kondisi": "baik",
          "kategori": { "id": "...", "nama": "Jaringan", "slug": "jaringan", "icon": "git-network-outline" }
        }
      }
    ],
    "member": { "id": "...", "nama": "Nama Praktikan", "nim": "1234567890" }
  }
}
```

### GET `/loans/kode/:kode`

Menerima kode polos atau QR lengkap. Praktikan hanya milik sendiri; admin boleh memindai QR pinjaman praktikan mana pun.

### POST `/loans/:id/return`

Tanpa body. Efek:

- `status = dikembalikan`
- `tanggal_kembali_aktual = hari ini`
- `denda = jumlah hari terlambat × Rp2.000`
- Notifikasi pengembalian dibuat untuk **peminjam**; pengingat lama ditandai dibaca.
- Praktikan hanya bisa mengembalikan pinjaman sendiri; admin/laboran boleh memproses pinjaman praktikan mana pun.

Pengembalian kedua:

```json
{ "error": { "code": "CONFLICT", "message": "Pinjaman sudah dikembalikan" } }
```

---

## Notifikasi

### GET `/notifications`

Query `limit` (1–50, default 20) dan `offset`. Hanya `show_at <= now()`.

```json
{
  "data": [
    {
      "id": "f0000001-0000-4000-8000-000000000001",
      "tipe": "jatuh_tempo",
      "judul": "Pengingat pengembalian",
      "pesan": "Pinjaman PJM-... harus dikembalikan besok.",
      "ref_type": "loan",
      "ref_id": "...",
      "show_at": "2026-11-15T01:00:00.000Z",
      "dibaca": false
    }
  ],
  "meta": { "total": 3, "belum_dibaca": 1, "limit": 20, "offset": 0 }
}
```

### PATCH `/notifications/:id/read`

`{ "data": { "id": "...", "dibaca": true } }`. `404` jika bukan milik member.

### PATCH `/notifications/read-all`

`{ "data": { "diubah": 3 } }`. Hanya baris yang sudah `show_at <= now()`.

---

## Statistik

### GET `/stats/summary`

```json
{
  "data": {
    "total_alat": 15,
    "total_unit": 70,
    "tersedia_unit": 64,
    "dipinjam_unit": 6,
    "total_pinjaman": 6,
    "aktif": 2,
    "selesai": 4,
    "terlambat": 0,
    "denda_berjalan": 0,
    "denda_selesai": 4000,
    "notifikasi_belum_dibaca": 1,
    "denda_per_hari": 2000
  }
}
```

### GET `/stats/populer`

Query `limit` 1–20 (default 5). Menghitung total unit yang pernah dipinjam per alat.

```json
{
  "data": [
    {
      "id": "...",
      "kode": "KOM-001",
      "nama": "Solder Station Yihua 937D",
      "foto_url": "https://...",
      "kondisi": "baik",
      "kategori": { "id": "...", "nama": "Komponen", "slug": "komponen", "icon": "construct-outline" },
      "total_dipinjam": 2
    }
  ]
}
```

---

## Health

### GET `/health`

```json
{
  "data": { "status": "ok", "database": "connected", "time": "2026-11-15T06:38:17.140Z" }
}
```

## Catatan database

- Semua ID `uuid` (default `gen_random_uuid()`).
- Nama tabel member adalah `members`, bukan `users`.
- View `tool_stok` menghitung `stok_tersedia`.
- Database Neon hanya diakses backend lewat `DATABASE_URL`; tidak ada PostgREST maupun anon key.
- Otorisasi dilakukan Express (JWT + pengecekan pemilik); RLS tidak dipakai.
