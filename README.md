# SiPinjam

Aplikasi peminjaman alat laboratorium berbasis React Native (Expo) dengan pemindaian QR Code, REST API Express, dan database PostgreSQL (Neon). Satu basis kode menghasilkan **APK Android**, **PWA untuk PC/HP**, dan **aplikasi Windows**.

**Tugas Akhir Praktikum Pemrograman Perangkat Bergerak 2026**  
Ade Raihan Hanafi - NIM 21120124140118

## Aplikasi live

| Bentuk | Alamat | Catatan |
| --- | --- | --- |
| Web / PWA (PC dan Android) | <https://sipinjam-web.vercel.app> | Buka di Chrome/Edge, lalu **Install app** untuk memasangnya seperti aplikasi desktop |
| APK Android | [Unduh APK](https://expo.dev/artifacts/eas/cnhzBGzjVDpaiPKB1YFJgt6mAOwNNV0E2s4RhUA_t7I.apk) · [halaman build](https://expo.dev/accounts/aderaihanhanafi/projects/sipinjam/builds/9658091b-9c2a-4c93-84c4-e0018ec06d6b) | Profil `preview`, build type `apk`, versi 1.0.0 (versionCode 2) |
| API produksi | <https://sipinjam-api.vercel.app> | Cek <https://sipinjam-api.vercel.app/health> |
| Desktop Windows | `desktop/release/SiPinjam-1.0.0-Windows.exe` | Dibangun lokal dengan Electron; tidak di-commit karena berukuran ±107 MB |

## Fitur

- Katalog alat dengan pencarian, filter kategori, filter stok, dan foto alat.
- Detail alat: stok real-time, kondisi, deskripsi, dan 5 riwayat peminjaman terakhir.
- Pengajuan pinjaman dengan stepper jumlah, pemilih tanggal (1-3 hari), dan catatan.
- QR Code alat (`SIPINJAM:TOOL:ELK-001`) dan pinjaman (`SIPINJAM:LOAN:PJM-...`), bisa dipindai atau diketik manual.
- Daftar pinjaman dengan tab Aktif, Selesai, dan Semua; keterlambatan dihitung otomatis.
- Detail pinjaman: status, daftar alat, linimasa, denda berjalan, QR, dan pengembalian.
- Notifikasi pengingat H-1, hari jatuh tempo, keterlambatan, dan pengembalian.
- Profil, kebijakan peminjaman, Tentang aplikasi, versi, base URL API, kredit, dan lisensi.
- Admin: tambah, edit, dan hapus alat; QR alat otomatis; simpan PNG atau cetak.
- Empat keadaan layar: loading, kosong, error dengan tombol coba lagi, dan berisi.

## Akun

| Akun | NIM | Kata sandi | Peran / isi seed |
| --- | --- | --- | --- |
| Ade Raihan Hanafi | `21120124140118` | `praktikum123` | Praktikan; 2 pinjaman aktif |
| Admin Laboratorium | `2112012414000` | `admin123` | Admin; kelola alat dan QR |

Ade dipakai untuk alur peminjaman. Admin dipakai untuk menambah, mengedit, menghapus alat, dan membuat QR alat.

## Tumpukan

- **App**: React Native 0.88, Expo SDK 58, React Navigation 7, `expo-camera`, `expo-print`, `expo-sharing`, `expo-file-system`, `react-native-qrcode-svg`, `@react-native-community/datetimepicker`, AsyncStorage, axios, date-fns.
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
    .env.production     EXPO_PUBLIC_API_URL untuk build APK/web
    public/             template index.html, manifest PWA, service worker, ikon
    src/
      api/              client.js + satu modul per endpoint
      components/       Screen, Button, Card, StatusPill, StockBadge, dll.
      context/          AuthProvider, NotificationProvider
      hooks/            useAuth, useTools, useLoans, useNotifications, useStats
      lib/              format tanggal/rupiah, parser QR, info aplikasi
      navigation/       root stack, bottom tabs, tab bar
      screens/          14 layar
      theme/tokens.js   token warna, spasi, radius, tipografi
  desktop/
    main.js             jendela Electron + server statis lokal
    scripts/copy-web.mjs  menyalin app/dist ke desktop/web
    icon.ico
    release/            hasil build .exe (diabaikan git)
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

## Menjalankan aplikasi di PC

### PWA (tanpa build tambahan)

1. Buka <https://sipinjam-web.vercel.app> di Chrome atau Edge.
2. Klik ikon **Install** di address bar, lalu **Install**. SiPinjam muncul di Start Menu dan berjalan di jendela sendiri.
3. Pemindaian QR memakai webcam. Browser meminta izin kamera; ini berfungsi karena situs sudah HTTPS.

### Aplikasi Windows (Electron)

```bash
cd app
npx expo export --platform web
cd ../desktop
npm install
npm run build
```

Hasil build: `desktop/release/SiPinjam-1.0.0-Windows.exe` (portable, tanpa installer). `npm start` menjalankan versi dev. Exe belum ditandatangani, jadi SmartScreen bisa menampilkan **More info → Run anyway**.

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
| GET | `/tools/:id/qr.png` | PNG QR alat untuk simpan/cetak |
| POST | `/tools` | **Admin**: tambah alat; kode kosong dibuat otomatis |
| PATCH | `/tools/:id` | **Admin**: ubah alat |
| DELETE | `/tools/:id` | **Admin**: hapus alat (409 jika sudah punya riwayat) |
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

Proyek produksi: `sipinjam-api` → <https://sipinjam-api.vercel.app>.

1. Root directory proyek Vercel: `backend`.
2. Environment production:
   - `DATABASE_URL` (connection string Neon, host `-pooler`)
   - `JWT_SECRET` (acak, minimal 32 byte)
   - `CORS_ORIGIN=*`
3. Push ke `main`, atau jalankan dari root repo:

   ```bash
   npx vercel --prod --project sipinjam-api
   ```

4. `backend/vercel.json` mengarahkan semua request ke `api/index.js`.
5. Uji `https://sipinjam-api.vercel.app/health` dan login.

File `.vercelignore` di root mencegah `node_modules`, `dist`, dan hasil build desktop ikut terunggah.

## Deploy web / PWA

Proyek produksi: `sipinjam-web` → <https://sipinjam-web.vercel.app>.

Setting proyek Vercel:

| Setting | Nilai |
| --- | --- |
| Root Directory | `app` |
| Framework Preset | Other |
| Build Command | `npx expo export --platform web` |
| Output Directory | `dist` |
| Environment | `EXPO_PUBLIC_API_URL=https://sipinjam-api.vercel.app/api/v1` |

Deploy manual dari root repo:

```bash
npx vercel --prod --project sipinjam-web
```

File `app/public/index.html`, `manifest.webmanifest`, `sw.js`, dan `icons/` disalin Expo ke `dist/`, sehingga hasilnya bisa di-install sebagai PWA.

## Build APK

```bash
cd app
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Profil `preview` memakai `android.buildType: apk`, `autoIncrement: true`, dan `EXPO_PUBLIC_API_URL` produksi. Build terakhir: versi 1.0.0 (versionCode 2), commit `40ef63d` — [unduh APK](https://expo.dev/artifacts/eas/cnhzBGzjVDpaiPKB1YFJgt6mAOwNNV0E2s4RhUA_t7I.apk).

Pasang di HP dengan membuka tautan APK, atau di emulator dengan:

```bash
npx eas-cli build:run -p android --latest
```

## Batasan

- Layar admin sudah tersedia untuk CRUD alat dan QR; layar khusus laboran belum dibuat.
- Notifikasi bersifat in-app, bukan push notification.
- Denda belum terhubung ke pembayaran.
- Foto contoh memakai URL eksternal (Unsplash/Wikimedia via proxy); kredit di [`docs/PHOTO-CREDITS.md`](docs/PHOTO-CREDITS.md).
- APK memakai keystore preview EAS dan belum diunggah ke Play Store; exe Windows belum ditandatangani.
- Pemindaian QR di PC memerlukan webcam dan izin kamera browser/Windows.

## Lisensi

MIT - lihat [`LICENSE`](LICENSE).
