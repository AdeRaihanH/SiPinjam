# Dokumentasi API SiPinjam

Base URL lokal: `http://localhost:5000/api/v1`  
Format: JSON (`Content-Type: application/json`)  
Autentikasi: `Authorization: Bearer <JWT>`  
Masa berlaku token: 7 hari.

## Envelope respons

Sukses:

```json
{
  "data": {}
}
```

Daftar dengan pagination:

```json
{
  "data": [],
  "meta": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

Error:

```json
{
  "error": {
    "code": "STOK_TIDAK_CUKUP",
    "message": "Stok tidak mencukupi: Laptop Lenovo ThinkPad T14 tersisa 4",
    "details": [
      { "tool_id": 1, "nama": "Laptop Lenovo ThinkPad T14", "diminta": 5, "tersedia": 4 }
    ]
  }
}
```

| Kode | HTTP | Arti |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Body/query tidak valid |
| `INVALID_JSON` | 400 | Body bukan JSON |
| `UNAUTHORIZED` | 401 | Token tidak ada/kedaluwarsa, kredensial salah |
| `FORBIDDEN` | 403 | Objek milik pengguna lain |
| `NOT_FOUND` | 404 | Data/endpoint tidak ditemukan |
| `CONFLICT` | 409 | Duplikasi data |
| `STOK_TIDAK_CUKUP` | 409 | Unit tersedia kurang dari permintaan |
| `SUDAH_DIPINJAM` | 409 | Alat masih ada di pinjaman aktif pengguna |
| `PINJAMAN_TERLAMBAT` | 409 | Masih punya pinjaman terlambat |
| `SUDAH_DIKEMBALIKAN` | 409 | Pinjaman sudah selesai |
| `INVALID_CODE` | 400 | QR/kode bukan format SiPinjam |
| `DATABASE_UNAVAILABLE` | 503 | Database tidak dapat diakses |
| `INTERNAL_ERROR` | 500 | Kesalahan server |

## Arti status

| Nilai | Asal | Arti |
| --- | --- | --- |
| `dipinjam` | kolom `loans.status` | Sedang dipinjam, belum melewati jatuh tempo |
| `dikembalikan` | kolom `loans.status` | Sudah dikembalikan |
| `terlambat` | dihitung | `status=dipinjam` dan `tanggal_kembali_rencana < hari ini` |

`tanggal_kembali_aktual`, `denda`, dan `total_denda` diisi saat pengembalian. `denda_berjalan` dihitung untuk pinjaman aktif yang terlambat.

## Format QR

- Alat: `SIPINJAM:TOOL:ALT-001`
- Pinjaman: `SIPINJAM:LOAN:PJM-261114-001`

Endpoint menerima QR lengkap maupun kode polos (`ALT-001`, `PJM-261114-001`). Prefix lain ditolak dengan `INVALID_CODE`.

---

## Auth

### POST `/auth/login`

```json
{
  "email": "demo@sipinjam.id",
  "password": "sipinjam123"
}
```

Respons `200`:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 604800,
    "user": {
      "id": 1,
      "nama": "Ade Raihan",
      "nim": "2112012414011",
      "email": "demo@sipinjam.id",
      "role": "peminjam",
      "avatar_url": null
    }
  }
}
```

Kredensial salah menghasilkan `401 UNAUTHORIZED`.

### GET `/auth/me`

Header: `Authorization: Bearer <token>`.

```json
{
  "data": {
    "user": {
      "id": 1,
      "nama": "Ade Raihan",
      "nim": "2112012414011",
      "email": "demo@sipinjam.id",
      "role": "peminjam",
      "avatar_url": null
    }
  }
}
```

---

## Kategori

### GET `/categories`

Publik.

```json
{
  "data": [
    {
      "id": 1,
      "nama": "Elektronika & Komputer",
      "slug": "elektronika",
      "icon": "hardware-chip-outline",
      "jumlah_alat": 6,
      "total_unit": 30
    }
  ]
}
```

---

## Alat

### GET `/tools`

Query opsional:

| Parameter | Tipe | Contoh | Keterangan |
| --- | --- | --- | --- |
| `search` | string | `laptop` | Cari nama alat, kode, atau kategori |
| `category_id` | int | `1` | Filter kategori |
| `tersedia` | `1`/`true` | `1` | Hanya stok tersedia |
| `limit` | int 1–100 | `50` | Default 50 |
| `offset` | int ≥ 0 | `0` | Default 0 |

Contoh respons:

```json
{
  "data": [
    {
      "id": 1,
      "kode": "ALT-001",
      "nama": "Laptop Lenovo ThinkPad T14",
      "deskripsi": "Laptop 14 inci untuk praktikum...",
      "stok_total": 5,
      "stok_tersedia": 4,
      "kondisi": "baik",
      "foto_url": null,
      "kategori_id": 1,
      "kategori_nama": "Elektronika & Komputer",
      "kategori_slug": "elektronika",
      "kategori_icon": "hardware-chip-outline"
    }
  ],
  "meta": { "total": 1, "limit": 50, "offset": 0, "has_more": false }
}
```

Stok tersedia = `stok_total - SUM(jumlah)` dari semua `loan_items` yang pinjamannya masih `dipinjam`.

### GET `/tools/:id`

Sama seperti item di atas, ditambah:

```json
{
  "dipinjam_oleh_saya": true
}
```

Field ini bernilai `true` bila alat ada di pinjaman aktif pengguna yang sedang login.

### GET `/tools/kode/:kode`

Menerima `ALT-001` atau `SIPINJAM:TOOL:ALT-001` (URL-encode jika perlu). `404` bila tidak ada, `400 INVALID_CODE` bila format salah.

---

## Pinjaman

### POST `/loans`

Header: Bearer token.

```json
{
  "items": [
    { "tool_id": 1, "jumlah": 1 }
  ],
  "durasi_hari": 2,
  "catatan": "Praktikum pemrograman mobile"
}
```

Aturan:

- `items` 1–3 baris, `tool_id` unik.
- `jumlah` 1–99 dan tidak boleh melebihi stok tersedia.
- `durasi_hari` 1–3.
- Ditolak `PINJAMAN_TERLAMBAT` bila pengguna masih punya pinjaman aktif yang lewat jatuh tempo.
- Ditolak `SUDAH_DIPINJAM` bila alat yang sama masih ada di pinjaman aktif pengguna.
- `tanggal_pinjam = hari ini (WIB)`, `tanggal_kembali_rencana = hari ini + durasi`.
- Kode dibuat otomatis: `PJM-YYMMDD-XXX`, urut per hari.

Respons `201`:

```json
{
  "data": {
    "id": 11,
    "kode": "PJM-261114-003",
    "status": "dipinjam",
    "status_efektif": "dipinjam",
    "tanggal_pinjam": "2026-11-14",
    "tanggal_kembali_rencana": "2026-11-16",
    "tanggal_kembali_aktual": null,
    "denda": 0,
    "denda_berjalan": 0,
    "total_denda": 0,
    "hari_terlambat": 0,
    "catatan": "Praktikum pemrograman mobile",
    "created_at": "2026-11-14 14:02:11",
    "jumlah_item": 1,
    "total_unit": 1,
    "ringkasan_alat": "Laptop Lenovo ThinkPad T14 ×1",
    "kategori_icon": "hardware-chip-outline",
    "kategori_slug": "elektronika",
    "kategori_nama": "Elektronika & Komputer",
    "bisa_dikembalikan": true,
    "items": [
      {
        "id": 12,
        "tool_id": 1,
        "jumlah": 1,
        "kode": "ALT-001",
        "nama": "Laptop Lenovo ThinkPad T14",
        "kategori_id": 1,
        "kategori_nama": "Elektronika & Komputer",
        "kategori_slug": "elektronika",
        "kategori_icon": "hardware-chip-outline"
      }
    ],
    "peminjam": { "id": 1, "nama": "Ade Raihan", "nim": "2112012414011" }
  }
}
```

Notifikasi yang dibuat otomatis:

1. `sistem` — pinjaman berhasil dibuat, tampil saat itu juga.
2. `jatuh_tempo` — H-1 pukul 08.00.
3. `jatuh_tempo` — hari jatuh tempo pukul 08.00.

### GET `/loans`

Query:

| Parameter | Nilai | Keterangan |
| --- | --- | --- |
| `status` | `semua` (default), `berjalan`, `aktif`, `terlambat`, `selesai` | `berjalan` = semua `dipinjam`; `aktif` = belum lewat jatuh tempo |
| `limit` | 1–100 | Default 50 |
| `offset` | ≥ 0 | Default 0 |

Respons berisi array pinjaman (tanpa `items`) beserta `meta`.

### GET `/loans/:id`

Detail pinjaman milik sendiri (admin boleh semua). `403` bila bukan pemilik.

### GET `/loans/kode/:kode`

Menerima `PJM-261114-001` atau `SIPINJAM:LOAN:PJM-261114-001`; hanya pinjaman milik sendiri (admin boleh semua).

### POST `/loans/:id/return`

Tanpa body. Hanya pemilik/admin. Efek:

- `status = dikembalikan`
- `tanggal_kembali_aktual = hari ini`
- `denda = max(0, hari ini - jatuh tempo) × Rp2.000`
- Notifikasi pengembalian dibuat; pengingat lama ditandai dibaca.

Respons `200` berisi detail pinjaman terbaru.

```json
{
  "data": {
    "kode": "PJM-261110-001",
    "status": "dikembalikan",
    "status_efektif": "dikembalikan",
    "tanggal_kembali_aktual": "2026-11-14",
    "hari_terlambat": 1,
    "denda": 2000,
    "total_denda": 2000,
    "bisa_dikembalikan": false
  }
}
```

---

## Notifikasi

### GET `/notifications`

Query `limit` (default 50) dan `offset`. Hanya baris dengan `show_at <= NOW()` yang ditampilkan.

Saat endpoint dipanggil, server memeriksa pinjaman aktif yang terlambat dan membuat satu notifikasi `terlambat` per pinjaman bila belum ada. Tidak ada cron.

```json
{
  "data": [
    {
      "id": 3,
      "tipe": "jatuh_tempo",
      "judul": "Jatuh tempo hari ini",
      "pesan": "Multimeter Digital Sanwa CD800a ×2 jatuh tempo hari ini...",
      "ref_type": "loan",
      "ref_id": 3,
      "show_at": "2026-11-14 08:00:00",
      "dibaca": false,
      "created_at": "2026-11-12 10:00:00"
    }
  ],
  "meta": {
    "total": 7,
    "belum_dibaca": 4,
    "limit": 50,
    "offset": 0
  }
}
```

### PATCH `/notifications/:id/read`

Menandai satu notifikasi milik sendiri sebagai dibaca.

```json
{ "data": { "id": 3, "dibaca": true } }
```

### PATCH `/notifications/read-all`

```json
{ "data": { "diubah": 4 } }
```

---

## Statistik

### GET `/stats/summary`

```json
{
  "data": {
    "total_pinjaman": 10,
    "aktif": 7,
    "terlambat": 2,
    "selesai": 3,
    "total_denda": 4000,
    "denda_berjalan": 8000,
    "alat": {
      "total_judul": 15,
      "total_unit": 70,
      "tersedia_unit": 58,
      "dipinjam_unit": 12
    },
    "notifikasi_belum_dibaca": 4,
    "denda_per_hari": 2000
  }
}
```

`total_denda` = denda final pinjaman selesai. `denda_berjalan` = estimasi denda pinjaman aktif yang terlambat.

### GET `/stats/populer`

Query `limit` 1–20 (default 5). Publik. Menghitung total unit yang pernah dipinjam per alat.

---

## Health

### GET `/health`

Tidak memakai prefix `/api/v1`.

```json
{
  "data": {
    "status": "ok",
    "database": "connected",
    "time": "2026-11-14T06:38:17.140Z"
  }
}
```
