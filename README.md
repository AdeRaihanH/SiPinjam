# SiPinjam

Aplikasi peminjaman alat laboratorium berbasis React Native (Expo) dengan pemindaian QR Code, REST API Express, dan database Supabase/PostgreSQL.

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
- **Backend**: Express 5, `@supabase/supabase-js`, JWT, bcryptjs, zod, cors, dotenv, morgan. Deploy Vercel.
- **Database**: Supabase/PostgreSQL, UUID, view `tool_stok`, RLS tidak diaktifkan (sesuai ketentuan tugas).

Aplikasi **hanya** memanggil Express. Tidak ada `@supabase/supabase-js` di folder `app/` dan tidak ada `service_role` key di repo.

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
      config/           env + supabaseClient
      controllers/      auth, category, tool, loan, notification, stats
      lib/              tanggal, denda, serializer, error
      middleware/       JWT, error handler
      models/           query Supabase per entitas
      routes/           router Express
      validators/       skema zod
    vercel.json
  database/
    schema.sql          jalankan di SQL Editor Supabase
    seed.sql
  docs/
    API.md
    PANDUAN-TA.md
    PHOTO-CREDITS.md
    postman_collection.json
  LICENSE
  README.md
```

## Setup Supabase

1. Buat proyek baru di [Supabase](https://supabase.com).
2. Buka **SQL Editor**, jalankan isi `database/schema.sql`. **Perhatian:** file ini menghapus tabel SiPinjam yang sudah ada lalu membuatnya ulang.
3. Masih di SQL Editor, jalankan `database/seed.sql` untuk mengisi data contoh.
4. Salin `backend/.env.example` menjadi `backend/.env`, lalu isi:
   - `SUPABASE_URL` dari Project Settings > API.
   - `SUPABASE_KEY` dengan **anon/public key**. Jangan memakai `service_role`.
   - `JWT_SECRET` dengan string acak panjang.
5. Jalankan backend:

```bash
cd backend
npm install
npm run dev
```

Cek `http://localhost:5000/health` sampai muncul `{ "data": { "status": "ok", "database": "connected" } }`.

Catatan: **RLS sengaja tidak diaktifkan**. Autentikasi dilakukan Express; jangan mengaktifkan RLS tanpa menulis policy karena aplikasi akan kehilangan akses.

## Menjalankan aplikasi

```bash
cd app
npm install
$env:EXPO_PUBLIC_API_URL="http://<IP-komputer>:5000/api/v1"
npx expo start -c
```

Buka Expo Go di HP (satu Wi-Fi dengan laptop) atau emulator. Untuk Android emulator, gunakan `http://10.0.2.2:5000/api/v1`.

`EXPO_PUBLIC_API_URL` wajib diisi saat build APK karena aplikasi tidak menebak alamat backend.

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
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (anon key)
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
- APK dan deployment belum dibuat dari mesin ini; konfigurasi sudah disiapkan.

## Lisensi

MIT - lihat [`LICENSE`](LICENSE).
