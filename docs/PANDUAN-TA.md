# Panduan Tugas Akhir SiPinjam

Dokumen ini memetakan syarat tugas akhir ke implementasi, menyiapkan alur responsi, dan mencatat batas pengujian secara jujur.

## Identitas

| Item | Isi |
| --- | --- |
| Judul | SiPinjam: Aplikasi Peminjaman Alat Laboratorium Berbasis React Native dengan Pemindaian QR Code |
| Platform | React Native - Expo SDK 58 |
| Backend | Express 5 - Neon PostgreSQL - Vercel |
| Nama | Ade Raihan Hanafi |
| NIM | 21120124140118 |
| Repositori | https://github.com/AdeRaihanH/SiPinjam |

## Pemetaan syarat

| Syarat | Implementasi | Bukti |
| --- | --- | --- |
| API sendiri | Express 5, 22 endpoint, JWT, Neon PostgreSQL | `backend/src`, `docs/API.md` |
| Registrasi praktikan | Nama lengkap + NIM + sandi, auto-login role praktikan | layar Register |
| API berjalan publik | Konfigurasi Vercel + `api/index.js` | langkah deploy di README |
| Bottom navigation 5 tab | Katalog, Pinjaman, Scan, Notifikasi, Profil | `app/src/navigation/TabBar.js` |
| Minimal 5 halaman | 15 layar | daftar di bawah |
| 2 list ke detail | Katalog ke Detail Alat; Pinjaman ke Detail Pinjaman | layar Katalog dan Pinjaman |
| Profil + Tentang | Profil, kebijakan, Tentang | layar Profil dan Tentang |
| QR Code | Kamera, input manual, QR alat/pinjaman | `app/src/screens/scan/ScanScreen.js` |
| Source code GitHub | Repo publik | tautan di atas |
| APK | Profil EAS `preview` buildType `apk` | `app/eas.json` |
| Basis data | PostgreSQL (Neon), tabel UUID, `members`, view `tool_stok` | `database/schema.sql` |

### 15 layar

Login, Register, Katalog, Detail Alat, Form Pinjam, Sukses Pinjam, Pinjaman, Detail Pinjaman, Scan, Notifikasi, Profil, Tentang, Kelola Alat, Form Alat, QR Alat.

### Arah desain

Redesign 2026 memakai **Forest & Sage**: forest `#0E2A20`, sage `#B9CD9A`, kanvas `#F4F5F2`. Semua warna, tipografi, spacing, radius, dan shadow berada di `app/src/theme/tokens.js`. Navigasi memakai dock gelap dengan Scan di tengah, Home memakai katalog grid dua kolom, dan seluruh konfirmasi/pesan memakai modal in-app (`DialogProvider`) — bukan alert browser.

## Akun dan peran

Tidak ada akun demo atau kata sandi bawaan. Sebelum responsi, siapkan akun berikut:

| Peran | Cara membuat |
| --- | --- |
| Praktikan | Daftar lewat layar Login → **Daftar praktikan** |
| Admin | Jalankan SQL berikut di Neon dengan NIM dan sandi pilihan Anda |

```sql
insert into members (nama, nim, password_hash, role)
values ('Admin Laboratorium', '<NIM_ADMIN>', crypt('<SANDI_ADMIN>', gen_salt('bf')), 'admin')
on conflict (nim) do update
  set nama = excluded.nama,
      password_hash = excluded.password_hash,
      role = 'admin';
```

Admin dipakai untuk mengelola alat, mencetak/menyimpan QR, dan memantau seluruh pinjaman praktikan beserta nama/NIM peminjam.

## Persiapan responsi

1. Proyek Neon sudah dibuat; connection string ada di `backend/.env`.
2. Jalankan `database/schema.sql` lalu `database/bootstrap.sql` di SQL Editor Neon hanya jika ingin mengulang dari awal. `schema.sql` menghapus tabel SiPinjam lama; jangan jalankan di database yang menyimpan data lain. `bootstrap.sql` hanya mengisi kategori dasar, bukan data demo.
3. Isi `backend/.env` dari `.env.example` (`DATABASE_URL`, `JWT_SECRET`).
4. `cd backend && npm install && npm run dev`.
5. `cd app && npm install`, lalu `npx expo start -c`. Di development, URL API dideteksi otomatis dari host Metro/browser; `EXPO_PUBLIC_API_URL` hanya wajib untuk build APK/production.
6. Uji login akun praktikan dan admin yang sudah dibuat di HP.

## Alur responsi 7 menit

### Akun praktikan - alur utama

1. **Login** dengan akun praktikan yang sudah didaftarkan.
2. **Katalog**: tunjukkan ringkasan stok, pencarian, chip kategori, filter "Tersedia", dan foto alat.
3. Buka salah satu alat yang sudah ditambahkan admin. Tunjukkan stok, kondisi, deskripsi, dan riwayat pinjam.
4. **Pinjam alat** -> atur jumlah -> pilih tanggal (1-3 hari) -> isi catatan -> **Ajukan peminjaman**.
5. Tunjukkan halaman sukses + QR `SIPINJAM:LOAN:...`.
6. **Lihat detail pinjaman** -> tunjukkan status, item, linimasa, QR, dan tombol kembali.
7. **Kembalikan alat** -> konfirmasi -> tunjukkan banner berhasil dan status "Dikembalikan".
8. **Notifikasi** -> tunjukkan pengingat dan tombol **Tandai semua**.
9. **Scan** -> izinkan kamera, pindai QR alat; jika tidak memungkinkan, ketik kode alat yang terdaftar di input manual -> hasil scan.
10. **Profil -> Tentang aplikasi** -> tunjukkan versi, base URL API, dan lisensi.

### Akun admin - kelola alat dan QR

1. Keluar, login dengan akun admin yang sudah dibuat.
2. **Profil -> Kelola alat**.
3. Tunjukkan daftar alat, tombol **Tambah alat**, edit, hapus, dan QR.
4. Tambah alat baru: isi nama, kategori, stok, kondisi, lalu simpan.
5. Tunjukkan QR otomatis, lalu **Simpan PNG** atau **Cetak**.
6. Kembali ke daftar dan tunjukkan alat baru sudah muncul.

## Pemeriksaan build

| Pemeriksaan | Hasil |
| --- | --- |
| `npx expo lint` | bersih |
| `npx expo-doctor` | 20/20 |
| Export Android & web | berhasil |

## Yang belum diverifikasi / batasan

1. **Database Neon sudah aktif.** Schema dan bootstrap tersedia di repo; data uji diisi sendiri, tidak ada data demo. Pengujian endpoint/UI lolos pada 23 November 2026.
2. **Vercel sudah live.** API <https://sipinjam-api.vercel.app> dan versi web (React Native Web) <https://sipinjam-web.vercel.app> dideploy 23 November 2026; login produksi sudah diuji lewat browser. Versi web ini hanya keluaran tambahan; aplikasi utamanya tetap React Native/APK.
3. **APK sudah dibangun.** Profil `preview`, versi 1.0.0 (versionCode 3, redesign + dialog in-app): [unduh APK](https://expo.dev/artifacts/eas/yZKSU9Ud03O6qGysK9tfH1i4ZC4gHAVnzTOOxjvGw3U.apk).
4. **Kamera perlu diuji di perangkat nyata.** Pemindaian kamera belum diuji di HP; di PC memakai webcam.
5. **Layar admin sudah ada.** CRUD alat dan QR tersedia untuk role admin; layar khusus laboran belum dibuat.
6. **Notifikasi in-app**, bukan push notification.
7. **Denda belum terhubung pembayaran.**
8. **Foto alat diisi lewat URL** pada form admin. Tidak ada foto contoh bawaan.

## Troubleshooting

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| `DATABASE_URL wajib diisi di backend/.env` | `.env` belum diisi | Salin `.env.example`, isi connection string Neon |
| `database tidak dapat diakses` | Schema belum dijalankan / URL salah | Jalankan `schema.sql`, cek `DATABASE_URL` |
| Aplikasi tidak bisa login | API host/backend | Pastikan backend port 5000 berjalan; di APK cek `EXPO_PUBLIC_API_URL` |
| `CONFLICT` saat pinjam | Akun punya pinjaman lewat tenggat | Gunakan akun praktikan lain, atau kembalikan dulu |
| `STOK_TIDAK_CUKUP` | Jumlah > stok tersedia | Kurangi jumlah; detail otomatis dimuat ulang |
| QR tidak dikenali | Prefix bukan SiPinjam | Gunakan `ELK-001`, `JAR-001`, `ALK-001`, `KOM-001`, atau QR pinjaman |
| Izin kamera ditolak permanen | Izin perangkat | Buka pengaturan atau pakai input manual |
| Date picker tidak muncul di web | Web memakai pemilih tanggal pengganti | Gunakan pilihan tanggal di bottom sheet |
| Koneksi database ditolak | URL salah atau host bukan `-pooler` | Salin ulang connection string dari dashboard Neon |

## Checklist sebelum mengumpulkan

- [ ] `schema.sql` dan `bootstrap.sql` sudah dijalankan di Neon.
- [ ] `/health` mengembalikan `database: connected`.
- [ ] Login akun praktikan dan admin berhasil.
- [ ] Tidak ada akun/data demo di database produksi.
- [ ] Alur pinjam + kembali diuji di HP.
- [ ] Scan kamera diuji di HP.
- [ ] QR halaman sukses bisa dipindai.
- [ ] `expo-doctor` 20/20.
- [ ] Repo GitHub publik dan commit terbaru di-push.
- [ ] APK/tautan EAS siap.
- [ ] Versi web dan APK bisa login ke API produksi.
- [ ] Registrasi praktikan baru (nama lengkap + NIM + sandi) berhasil dan auto-login.
- [ ] Praktikan tidak bisa membuka pinjaman praktikan lain (`403`).
- [ ] Admin melihat semua pinjaman + nama/NIM peminjam.
- [ ] Dialog Keluar/Hapus tampil sebagai modal in-app, bukan alert browser.
- [ ] README menjelaskan setup Neon, Vercel, dan pembuatan akun admin.
