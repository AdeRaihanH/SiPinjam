# SiPinjam

Aplikasi peminjaman alat laboratorium berbasis React Native (Expo) dengan pemindaian QR Code, REST API Express, dan database PostgreSQL (Neon).

**Tugas Akhir Praktikum Pemrograman Perangkat Bergerak 2026**  
Ade Raihan - NIM 2112012414011

## Fitur

- Katalog alat dengan pencarian, filter kategori, filter stok, dan foto alat.
- Detail alat: stok real-time, kondisi, deskripsi, dan 5 riwayat peminjaman terakhir.
- Pengajuan pinjaman dengan stepper jumlah, pemilih tanggal (1-3 hari), dan catatan.
- QR Code alat (`SIPINJAM:TOOL:ELK-001`) dan pinjaman (`SIPINJAM:LOAN:PJM-...`), bisa dipindai atau diketik manual.
- Daftar pinjaman dengan tab Aktif, Selesai, dan Semua; keterlambatan dihitung otomatis.
- Detail pinjaman: status, daftar alat, linimasa, denda berjalan, QR, dan pengembalian.
- Notifikasi pengingat H-1, hari jatuh tempo, keterlambatan, dan pengembalian.
- Profil, kebijakan peminjaman, Tentang aplikasi, versi, base URL API, kredit, dan lisensi.
- Empat keadaan layar: loading, kosong, error dengan tombol coba lagi, dan berisi.

## Akun

| Akun | NIM | Kata sandi | Isi seed |
| --- | --- | --- | --- |
| Demo | `2112012414011` | `praktikum123` | 2 pinjaman aktif, tanpa keterlambatan |
| Rina | `2112012414099` | `praktikum123` | 2 pinjaman terlambat, 1 selesai |
| Bagas | `2112012414088` | `praktikum123` | 1 pinjaman selesai |

Akun demo sengaja tidak punya pinjaman terlambat agar alur pinjam baru bisa didemokan. Gunakan akun **Rina** untuk memperagakan status terlambat dan denda.

## Tumpukan

- **App**: React Native 0.88, Expo SDK 58, React Navigation 7, `expo-camera`, `react-native-qrcode-svg`, `@react-native-community/datetimepicker`, AsyncStorage, axios, date-fns.
- **Backend**: Express 5, `@neondatabase/serverless` (driver HTTP), JWT, bcryptjs, zod, cors, dotenv, morgan. Deploy Vercel.
- **Database**: Neon PostgreSQL, UUID, view `tool_stok`.

Aplikasi **hanya** memanggil Express; folder `app/` tidak mengakses database secara langsung.

## Struktur

```
SiPinjam/
  app/
    App.js
    app.json
    eas.json
    src/
      api/              client.js + satu modul per endpoint
      components/       Screen, Button, Card, StatusPill, StockBadge, dll.
      context/          AuthProvider, NotificationProvider
      hooks/            useAuth, useTools, useLoans, useNotifications, useStats
      lib/              format tanggal/rupiah, parser QR, info aplikasi
      navigation/       root stack, bottom tabs, tab bar
      screens/          11 layar
      theme/tokens.js   token warna, spasi, radius, tipografi
  backend/
    api/index.js        entry point Vercel
    src/
      config/           env + koneksi Neon (db.js)
      controllers/      auth, category, tool, loan, notification, stats
      lib/              tanggal, denda, serializer, error
      middleware/       JWT, error handler
      models/           query SQL per entitas
      routes/           router Express
      validators/       skema zod
    vercel.json
  database/
    schema.sql          jalankan di SQL Editor Neon
    seed.sql
  docs/
    API.md
    PANDUAN-TA.md
    PHOTO-CREDITS.md
    postman_collection.json
  LICENSE
  README.md
```

## Setup database (Neon)

1. Buat proyek baru di [Neon](https://neon.tech), lalu salin **connection string** (pakai host `-pooler`).
2. Buka **SQL Editor** Neon, jalankan isi `database/schema.sql`. **Perhatian:** file ini menghapus tabel SiPinjam yang sudah ada lalu membuatnya ulang.
3. Masih di SQL Editor, jalankan `database/seed.sql` untuk mengisi data contoh.
4. Salin `backend/.env.example` menjadi `backend/.env`, lalu isi:
   - `DATABASE_URL` dengan connection string Neon (`...?sslmode=require`).
   - `JWT_SECRET` dengan string acak panjang.
5. Jalankan backend:

```bash
cd backend
npm install
npm run dev
```

Cek `http://localhost:5000/health` sampai muncul `{ "data": { "status": "ok", "database": "connected" } }`.

Catatan: database hanya diakses backend. Tidak ada PostgREST/anon key maupun RLS; otorisasi dilakukan Express lewat JWT dan pengecekan pemilik data.

### Catatan database Neon

Semua environment development dan QA memakai database **Neon** yang sama melalui `DATABASE_URL`. Tidak ada database lokal (PostgreSQL/SQLite) di repo ini — backend yang berjalan di laptop hanya proses Express yang terhubung ke Neon. Untuk mereset data QA, jalankan `database/seed.sql` di SQL Editor Neon.

## Menjalankan aplikasi

```bash
cd app
npm install
npx expo start -c
```

Buka Expo Go di HP (satu Wi-Fi dengan laptop) atau emulator. Di development, alamat API **dideteksi otomatis** dari host Metro/browser: web memakai `localhost`, HP memakai IP laptop dari Metro. `EXPO_PUBLIC_API_URL` hanya diperlukan untuk build APK/production.

## Label QR alat

Label QR siap cetak untuk 15 alat ada di [`docs/qr-alat.html`](docs/qr-alat.html). Buka di Chrome, pilih **Print**, ukuran A4, skala 100%. Setiap label berisi `SIPINJAM:TOOL:<kode>` (mis. `SIPINJAM:TOOL:ELK-001`), dan versi PNG per alat tersedia di `docs/qr-alat/`.

QR pinjaman tidak perlu dicetak: nilainya `SIPINJAM:LOAN:PJM-YYMMDD-NNN` dan dibuat otomatis saat pinjaman diajukan.

## API

Base path `/api/v1`, autentikasi `Authorization: Bearer <token>`.

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/auth/login` | Body `{ nim, password }`; balas `{ token, member }` |
| GET | `/auth/me` | Profil dari token |
| GET | `/categories` | Daftar kategori |
| GET | `/tools` | Baca view `tool_stok`; `search`, `category_id`, `tersedia`, `limit`, `offset` |
| GET | `/tools/:id` | Detail + 5 riwayat pinjam |
| GET | `/tools/kode/:kode` | Lookup QR alat |
| POST | `/loans` | Body `{ tanggal_kembali_rencana, catatan, items[] }` |
| GET | `/loans` | `status=aktif` / `selesai` / `semua` |
| GET | `/loans/:id` | Detail + item + denda berjalan |
| GET | `/loans/kode/:kode` | Lookup QR pinjaman |
| POST | `/loans/:id/return` | Kembalikan + hitung denda |
| GET | `/notifications` | Hanya `show_at <= now()` |
| PATCH | `/notifications/:id/read` | Tandai satu |
| PATCH | `/notifications/read-all` | Tandai semua |
| GET | `/stats/summary` | Ringkasan stok dan pinjaman |
| GET | `/stats/populer` | 5 alat paling sering dipinjam |

Envelope sukses: `{ "data": ... }`. Daftar: `{ "data": [...], "meta": { "total", "limit", "offset" } }`. Error: `{ "error": { "code", "message", "fields" } }`.

Dokumentasi lengkap: [`docs/API.md`](docs/API.md). Koleksi Postman: [`docs/postman_collection.json`](docs/postman_collection.json). Panduan responsi: [`docs/PANDUAN-TA.md`](docs/PANDUAN-TA.md).

### Kode error

`VALIDATION_ERROR` (422), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `STOK_TIDAK_CUKUP` (409), `SUDAH_DIPINJAM` (409).

## Aturan bisnis

| Aturan | Nilai |
| --- | --- |
| Durasi | 1-3 hari kalender |
| Baris alat per pinjaman | 1-3 |
| Jumlah per alat | 1 sampai `stok_tersedia` |
| Denda | Rp2.000 per hari per pinjaman |
| Status tersimpan | `dipinjam`, `dikembalikan` |
| Terlambat | Dihitung dari tanggal, bukan disimpan |
| Pengembalian | Hanya pemilik, hanya sekali; kedua kali `409 CONFLICT` |
| Pinjaman baru | Diblokir selama ada pinjaman lewat tenggat |
| Kode pinjaman | `PJM-YYMMDD-NNN`, urut per hari |
| Notifikasi | Dua baris saat pinjaman dibuat: H-1 dan hari jatuh tempo |

## Pemeriksaan build

- `npx expo lint`
- `npx expo-doctor`
- `npx expo export --platform android`
- `npx expo export --platform web`

## Deploy backend ke Vercel

1. Import repo ke Vercel.
2. Root directory: `backend`.
3. Environment:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGIN=*`
4. Deploy. `backend/vercel.json` mengarahkan request ke `api/index.js`.
5. Uji `https://<domain>/health` dan login.
6. Set `EXPO_PUBLIC_API_URL=https://<domain>/api/v1` saat build aplikasi.

## Build APK

```bash
cd app
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Profil `preview` memakai `android.buildType: apk`. Isi `EXPO_PUBLIC_API_URL` dengan URL backend Vercel di environment EAS.

## Batasan

- Layar admin/laboran belum dibuat; role tersedia di database.
- Notifikasi bersifat in-app, bukan push notification.
- Denda belum terhubung ke pembayaran.
- Foto contoh memakai URL eksternal (Unsplash/Wikimedia via proxy); kredit di [`docs/PHOTO-CREDITS.md`](docs/PHOTO-CREDITS.md).
- Database Neon sudah dibuat dan di-seed; APK dan deployment Vercel belum dibuat dari mesin ini.

## Lisensi

MIT - lihat [`LICENSE`](LICENSE).
