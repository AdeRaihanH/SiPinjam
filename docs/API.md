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
| `SUDAH_DIPINJAM` | 409 | Alat masih ada di pinjaman aktif member |
| `DATABASE_UNAVAILABLE` | 503 | Database tidak dapat diakses |
| `INTERNAL_ERROR` | 500 | Kesalahan server |

## Status

| Nilai | Asal | Arti |
| --- | --- | --- |
| `dipinjam` | kolom `loans.status` | Belum dikembalikan |
| `dikembalikan` | kolom `loans.status` | Sudah dikembalikan |
| `terlambat` | dihitung | `dipinjam` dan `tanggal_kembali_rencana < hari ini` (WIB) |

`denda` diisi saat pengembalian. `denda_berjalan` dihitung untuk pinjaman aktif yang lewat tenggat. `total_denda` = denda final (jika selesai) atau denda berjalan (jika aktif).

## QR

- Alat: `SIPINJAM:TOOL:ELK-001`
- Pinjaman: `SIPINJAM:LOAN:PJM-261115-001`

Endpoint lookup menerima QR lengkap maupun kode polos. Prefix lain ditolak `404 NOT_FOUND`.

---

## Auth

### POST `/auth/login`

```json
{ "nim": "2112012414011", "password": "praktikum123" }
```

`200`:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "member": {
      "id": "a0000001-0000-4000-8000-000000000001",
      "nama": "Ade Raihan",
      "nim": "2112012414011",
      "email": "demo@sipinjam.id",
      "role": "praktikan",
      "avatar_url": null
    }
  }
}
```

### GET `/auth/me`

Header Bearer. Respons `{ "data": { "member": { ... } } }`.

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
      "member_nama": "Rina Pratama"
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
- Ditolak `SUDAH_DIPINJAM` bila alat sama masih aktif di pinjaman member.
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

Item ringkas berisi `tool_id`, `jumlah`, dan objek `tool`.

### GET `/loans/:id`

Detail milik sendiri. `403` jika bukan pemilik.

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
    "member": { "id": "...", "nama": "Rina Pratama", "nim": "2112012414099" }
  }
}
```

### GET `/loans/kode/:kode`

Menerima kode polos atau QR lengkap. Hanya milik sendiri.

### POST `/loans/:id/return`

Tanpa body. Efek:

- `status = dikembalikan`
- `tanggal_kembali_aktual = hari ini`
- `denda = jumlah hari terlambat × Rp2.000`
- Notifikasi pengembalian dibuat; pengingat lama ditandai dibaca.

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
