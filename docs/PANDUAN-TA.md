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
| API sendiri | Express 5, 21 endpoint, JWT, Neon PostgreSQL | `backend/src`, `docs/API.md` |
| API berjalan publik | Konfigurasi Vercel + `api/index.js` | langkah deploy di README |
| Bottom navigation 5 tab | Katalog, Pinjaman, Scan, Notifikasi, Profil | `TabBar.js` |
| Minimal 5 halaman | 14 layar | daftar di bawah |
| 2 list ke detail | Katalog ke Detail Alat; Pinjaman ke Detail Pinjaman | layar Katalog dan Pinjaman |
| Profil + Tentang | Profil, kebijakan, Tentang | layar Profil dan Tentang |
| QR Code | Kamera, input manual, QR alat/pinjaman | `ScanScreen.js` |
| Source code GitHub | Repo publik | tautan di atas |
| APK | Profil EAS `preview` buildType `apk` | `app/eas.json` |
| Basis data | PostgreSQL (Neon), tabel UUID, `members`, view `tool_stok` | `database/schema.sql` |

### 14 layar

Login, Katalog, Detail Alat, Form Pinjam, Sukses Pinjam, Pinjaman, Detail Pinjaman, Scan, Notifikasi, Profil, Tentang, Kelola Alat, Form Alat, QR Alat.

## Akun demo

| Akun | NIM | Sandi | Keperluan |
| --- | --- | --- | --- |
| Ade Raihan Hanafi | `21120124140118` | `praktikum123` | Alur pinjam normal; 2 pinjaman aktif |
| Admin Laboratorium | `2112012414000` | `admin123` | Kelola alat (CRUD) dan QR |

Ade dipakai untuk alur peminjaman. Admin dipakai untuk mengelola alat dan mencetak/menyimpan QR.

## Persiapan responsi

1. Proyek Neon sudah dibuat dan di-seed (23 November 2026); connection string ada di `backend/.env`.
2. Jalankan `database/schema.sql` lalu `database/seed.sql` di SQL Editor Neon hanya jika ingin mengulang dari awal. `schema.sql` menghapus tabel SiPinjam lama; jangan jalankan di database yang menyimpan data lain.
3. Isi `backend/.env` dari `.env.example` (`DATABASE_URL`, `JWT_SECRET`).
4. `cd backend && npm install && npm run dev`.
5. `cd app && npm install`, lalu `npx expo start -c`. Di development, URL API dideteksi otomatis dari host Metro/browser; `EXPO_PUBLIC_API_URL` hanya wajib untuk build APK/production.
6. Uji login Ade dan admin di HP.

## Alur responsi 7 menit

### Akun demo - alur utama

1. **Login** dengan NIM `21120124140118` dan sandi `praktikum123`.
2. **Katalog**: tunjukkan ringkasan stok, pencarian, chip kategori, filter "Tersedia", dan foto alat.
3. Cari **"osilo"**, buka **Osiloskop Hantek DSO2D10**. Tunjukkan stok 1/2, kondisi rusak ringan, deskripsi, dan riwayat pinjam.
4. **Pinjam alat** -> atur jumlah -> pilih tanggal (1-3 hari) -> isi catatan -> **Ajukan peminjaman**.
5. Tunjukkan halaman sukses + QR `SIPINJAM:LOAN:...`.
6. **Lihat detail pinjaman** -> tunjukkan status, item, linimasa, QR, dan tombol kembali.
7. **Kembalikan alat** -> konfirmasi -> tunjukkan banner berhasil dan status "Dikembalikan".
8. **Notifikasi** -> tunjukkan pengingat dan tombol **Tandai semua**.
9. **Scan** -> izinkan kamera, pindai QR alat; jika tidak memungkinkan, ketik `ALK-002` di input manual -> hasil scan.
10. **Profil -> Tentang aplikasi** -> tunjukkan versi, base URL API, kredit, dan lisensi.

### Akun admin - kelola alat dan QR

1. Keluar, login NIM `2112012414000` dan sandi `admin123`.
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

1. **Database Neon sudah aktif dan di-seed.** Schema, seed, dan pengujian endpoint/UI lolos pada 23 November 2026.
2. **Vercel sudah live.** API <https://sipinjam-api.vercel.app> dan web/PWA <https://sipinjam-web.vercel.app> dideploy 23 November 2026; login produksi sudah diuji lewat browser.
3. **APK sudah dibangun.** Profil `preview`, versi 1.0.0 (versionCode 1): [unduh APK](https://expo.dev/artifacts/eas/uYVmw-ydpPC1GTMHpa-_wwwg2vnKFCBNVmkLTKg0ekw.apk).
4. **Aplikasi Windows sudah dibangun** dengan Electron (`desktop/release/SiPinjam-1.0.0-Windows.exe`); exe tidak di-commit dan belum ditandatangani.
5. **Kamera perlu diuji di perangkat nyata.** Pemindaian kamera belum diuji di HP; di PC memakai webcam.
6. **Layar admin sudah ada.** CRUD alat dan QR tersedia untuk role admin; layar khusus laboran belum dibuat.
6. **Notifikasi in-app**, bukan push notification.
7. **Denda belum terhubung pembayaran.**
8. **Foto alat memakai URL eksternal** (Unsplash/Wikimedia melalui proxy). Butuh internet; kredit ada di `docs/PHOTO-CREDITS.md`.

## Troubleshooting

| Gejala | Penyebab | Solusi |
| --- | --- | --- |
| `DATABASE_URL wajib diisi di backend/.env` | `.env` belum diisi | Salin `.env.example`, isi connection string Neon |
| `database tidak dapat diakses` | Schema belum dijalankan / URL salah | Jalankan `schema.sql`, cek `DATABASE_URL` |
| Aplikasi tidak bisa login | API host/backend | Pastikan backend port 5000 berjalan; di APK cek `EXPO_PUBLIC_API_URL` |
| `CONFLICT` saat pinjam | Akun punya pinjaman lewat tenggat | Gunakan akun demo, atau kembalikan dulu |
| `STOK_TIDAK_CUKUP` | Jumlah > stok tersedia | Kurangi jumlah; detail otomatis dimuat ulang |
| QR tidak dikenali | Prefix bukan SiPinjam | Gunakan `ELK-001`, `JAR-001`, `ALK-001`, `KOM-001`, atau QR pinjaman |
| Izin kamera ditolak permanen | Izin perangkat | Buka pengaturan atau pakai input manual |
| Date picker tidak muncul di web | Web memakai pemilih tanggal pengganti | Gunakan pilihan tanggal di bottom sheet |
| Koneksi database ditolak | URL salah atau host bukan `-pooler` | Salin ulang connection string dari dashboard Neon |

## Checklist sebelum mengumpulkan

- [ ] `schema.sql` dan `seed.sql` sudah dijalankan di Neon.
- [ ] `/health` mengembalikan `database: connected`.
- [ ] Login Ade dan admin berhasil.
- [ ] Alur pinjam + kembali diuji di HP.
- [ ] Scan kamera diuji di HP.
- [ ] QR halaman sukses bisa dipindai.
- [ ] `expo-doctor` 20/20.
- [ ] Repo GitHub publik dan commit terbaru di-push.
- [ ] APK/tautan EAS siap.
- [ ] Web/PWA dan APK bisa login ke API produksi.
- [ ] Exe Windows dijalankan minimal sekali (opsional).
- [ ] README menjelaskan setup Neon, Vercel, dan akun demo.
