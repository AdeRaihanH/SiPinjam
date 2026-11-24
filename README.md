# SiPinjam

Aplikasi peminjaman alat laboratorium berbasis React Native (Expo) dengan pemindaian QR Code, REST API Express, dan database PostgreSQL (Neon). Keluaran utama adalah **APK Android**; dari basis kode React Native yang sama, Expo juga mengekspor **versi web (React Native Web)** sebagai keluaran tambahan.

**Tugas Akhir Praktikum Pemrograman Perangkat Bergerak 2026**  
Ade Raihan Hanafi - NIM 21120124140118

## Aplikasi live

| Bentuk | Alamat | Catatan |
| --- | --- | --- |
| Web (React Native Web, PC dan Android) | <https://sipinjam-web.vercel.app> | Build web dari kode React Native yang sama; opsional dipasang sebagai PWA lewat **Install app** di Chrome/Edge |
| APK Android | [Unduh APK](https://expo.dev/artifacts/eas/yZKSU9Ud03O6qGysK9tfH1i4ZC4gHAVnzTOOxjvGw3U.apk) · [halaman build](https://expo.dev/accounts/aderaihanhanafi/projects/sipinjam/builds/0256482b-9221-40d3-adbd-157da0aae0b8) | Profil `preview`, build type `apk`, versi 1.0.0 (versionCode 3), redesign Forest & Sage |
| API produksi | <https://sipinjam-api.vercel.app> | Cek <https://sipinjam-api.vercel.app/health> |

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
- Admin melihat seluruh pinjaman praktikan (nama/NIM peminjam tampil di daftar dan detail) serta bisa memproses pengembalian.
- Empat keadaan layar: loading, kosong, error dengan tombol coba lagi, dan berisi.
- Dialog konfirmasi dan pesan memakai modal in-app yang konsisten di web dan Android (bukan alert browser).
- Registrasi mandiri praktikan: nama lengkap, NIM, kata sandi, konfirmasi sandi, lalu auto-login sebagai `praktikan`.

## Arah desain

Redesign 2026 memakai arah **“Forest & Sage”**: hijau pinus dalam sebagai warna utama, sage muted sebagai aksen kecil, dan kanvas cool-mist. Tidak ada gradient neon atau glow berlebihan; CTA utama memakai forest, sedangkan sage hanya muncul pada status, ikon, dan detail kecil.

- Token warna, tipografi, spacing, radius, shadow, dan status ada di `app/src/theme/tokens.js`.
- Navigasi bawah berbentuk dock gelap dengan tombol Scan di tengah; tab aktif ditandai pill terang, bukan warna menyala.
- Home memprioritaskan status laboratorium, pencarian, kategori, pinjaman aktif, alat populer, lalu katalog grid dua kolom.
- Komponen baru: `ToolCard`, `PopularCard`, `LoanRow` (kartu jatuh tempo), `QRCodeCard`, `SheetModal`, `SegmentedControl`, `PressableScale`, dan `Reveal`.
- Interaksi: press scale, fade/slide antar layar, segmented control animasi, skeleton, pull-to-refresh, haptics, dan sheet modal.
- Ikon aplikasi, adaptive icon Android, splash, favicon, dan ikon web ikut diperbarui ke palet baru.
- Layout responsif: padding 20, grid 48% + gap 12, dan frame web maksimal 520 px.

## Akun dan peran

Tidak ada akun demo atau kata sandi bawaan di repo ini.

- **Praktikan** mendaftar sendiri dari layar Login → **Daftar praktikan**; perannya otomatis `praktikan`.
- **Admin/laboran** dibuat oleh pengelola. Jalankan SQL berikut di SQL Editor Neon dengan NIM dan sandi pilihan Anda (`pgcrypto` sudah aktif dari `schema.sql`):

```sql
insert into members (nama, nim, password_hash, role)
values ('Admin Laboratorium', '<NIM_ADMIN>', crypt('<SANDI_ADMIN>', gen_salt('bf')), 'admin')
on conflict (nim) do update
  set nama = excluded.nama,
      password_hash = excluded.password_hash,
      role = 'admin';
```

Admin dipakai untuk menambah, mengedit, menghapus alat, membuat QR alat, dan memantau semua pinjaman praktikan.

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
    public/             template index.html, manifest web, service worker, ikon
    src/
      api/              client.js + satu modul per endpoint
      components/       Screen, Button, Card, StatusPill, StockBadge, dll.
      context/          AuthProvider, NotificationProvider
      hooks/            useAuth, useTools, useLoans, useNotifications, useStats
      lib/              format tanggal/rupiah, aturan pinjam, parser QR, info aplikasi
      navigation/       root stack, bottom tabs, tab bar
      screens/
        auth/           Login, Register
        catalog/        Katalog, Detail Alat, komponen katalog
        loans/          Pinjaman, Form, Detail, Sukses, komponen pinjaman
        scan/           Scan dan hasil pemindaian
        notifications/  Notifikasi
        profile/        Profil, Tentang
        admin/          Kelola Alat, Form Alat, QR Alat
      theme/tokens.js   token warna, spasi, radius, tipografi
  backend/
    api/index.js        entry point Vercel
    src/
      config/           env + koneksi Neon (db.js)
      controllers/      auth, category, tool, loan, notification, stats
      lib/              tanggal, denda, serializer, error, konstanta aturan
      middleware/       JWT, error handler
      models/           query SQL per entitas
      routes/           router Express
      validators/       skema zod
    vercel.json
  database/
    schema.sql          skema tabel dan view
    bootstrap.sql       kategori dasar + petunjuk admin pertama
  docs/
    API.md
    PANDUAN-TA.md
    postman_collection.json
  LICENSE
  README.md
```

## Setup database (Neon)

1. Buat proyek baru di [Neon](https://neon.tech), lalu salin **connection string** (pakai host `-pooler`).
2. Buka **SQL Editor** Neon, jalankan isi `database/schema.sql`. **Perhatian:** file ini menghapus tabel SiPinjam yang sudah ada lalu membuatnya ulang.
3. Masih di SQL Editor, jalankan `database/bootstrap.sql` untuk mengisi kategori dasar. File ini tidak membuat akun, alat, pinjaman, atau notifikasi contoh.
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

Setelah itu buat akun admin pertama memakai SQL pada bagian **Akun dan peran**. Praktikan cukup mendaftar dari aplikasi.

Catatan: database hanya diakses backend. Tidak ada PostgREST/anon key maupun RLS; otorisasi dilakukan Express lewat JWT dan pengecekan pemilik data.

### Catatan database Neon

Semua environment development dan QA memakai database **Neon** yang sama melalui `DATABASE_URL`. Tidak ada database lokal (PostgreSQL/SQLite) di repo ini — backend yang berjalan di laptop hanya proses Express yang terhubung ke Neon. Untuk mengosongkan seluruh data dan memulai dari awal, jalankan `database/schema.sql` lalu `database/bootstrap.sql` di SQL Editor Neon. Keduanya bersifat destruktif terhadap tabel SiPinjam.

## Menjalankan aplikasi

```bash
cd app
npm install
npx expo start -c
```

Buka Expo Go di HP (satu Wi-Fi dengan laptop) atau emulator. Di development, alamat API **dideteksi otomatis** dari host Metro/browser: web memakai `localhost`, HP memakai IP laptop dari Metro. `EXPO_PUBLIC_API_URL` hanya diperlukan untuk build APK/production.

## Menjalankan versi web di PC

### Versi web (React Native Web, tanpa build tambahan)

Versi ini bukan proyek web terpisah: Expo mengekspor kode React Native yang sama ke web. Build tersebut menyertakan manifest dan service worker, sehingga opsional bisa dipasang seperti aplikasi.

1. Buka <https://sipinjam-web.vercel.app> di Chrome atau Edge.
2. Klik ikon **Install** di address bar, lalu **Install**. SiPinjam muncul di Start Menu dan berjalan di jendela sendiri.
3. Pemindaian QR memakai webcam. Browser meminta izin kamera; ini berfungsi karena situs sudah HTTPS.

## Label QR alat

QR alat dibuat dari data di database, bukan dari daftar statis. Login sebagai admin, buka **Kelola alat**, lalu pilih **QR** pada alat yang diinginkan untuk menyimpan PNG atau mencetak label. Endpoint `GET /api/v1/tools/:id/qr.png` juga menghasilkan PNG dari data alat yang tersimpan.

QR pinjaman tidak perlu dicetak: nilainya `SIPINJAM:LOAN:PJM-YYMMDD-NNN` dan dibuat otomatis saat pinjaman diajukan.

## API

Base path `/api/v1`, autentikasi `Authorization: Bearer <token>`.

| Method | Path | Keterangan |
| --- | --- | --- |
| POST | `/auth/login` | Body `{ nim, password }`; balas `{ token, member }` |
| POST | `/auth/register` | Body `{ nama, nim, password }`; daftar praktikan + auto-login |
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
| GET | `/loans` | `status=aktif` / `selesai` / `semua`; admin melihat semua praktikan, praktikan hanya miliknya |
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

`VALIDATION_ERROR` (422), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `STOK_TIDAK_CUKUP` (409).

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
| Alat sama | Boleh dipinjam lagi di transaksi terpisah selama stok tersedia |
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

File `.vercelignore` di root mencegah `node_modules`, `dist`, dan cache build ikut terunggah.

## Deploy versi web (React Native Web)

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

Hasilnya adalah build web dari kode React Native yang sama. File `app/public/index.html`, `manifest.webmanifest`, `sw.js`, dan `icons/` disalin Expo ke `dist/`, sehingga build tersebut juga bisa dipasang sebagai PWA.

## Build APK

```bash
cd app
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Profil `preview` memakai `android.buildType: apk`, `autoIncrement: true`, dan `EXPO_PUBLIC_API_URL` produksi. Build terakhir: versi 1.0.0 (versionCode 3), commit `96c386d` — [unduh APK](https://expo.dev/artifacts/eas/yZKSU9Ud03O6qGysK9tfH1i4ZC4gHAVnzTOOxjvGw3U.apk).

Pasang di HP dengan membuka tautan APK, atau di emulator dengan:

```bash
npx eas-cli build:run -p android --latest
```

## Batasan

- Layar admin sudah tersedia untuk CRUD alat dan QR; layar khusus laboran belum dibuat.
- Notifikasi bersifat in-app, bukan push notification.
- Denda belum terhubung ke pembayaran.
- Foto alat diisi lewat URL pada form admin; tidak ada foto contoh bawaan di repo.
- APK memakai keystore preview EAS dan belum diunggah ke Play Store.
- Pemindaian QR di PC memerlukan webcam dan izin kamera browser/Windows.

## Lisensi

MIT - lihat [`LICENSE`](LICENSE).
