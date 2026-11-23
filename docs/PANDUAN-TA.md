# Panduan Tugas Akhir SiPinjam

Dokumen ini memetakan syarat tugas akhir ke implementasi, menyiapkan alur responsi, dan mencatat batas pengujian secara jujur.

## Identitas

| Item | Isi |
| --- | --- |
| Judul | SiPinjam: Aplikasi Peminjaman Alat Laboratorium Berbasis React Native dengan Pemindaian QR Code |
| Platform | React Native - Expo SDK 58 |
| Backend | Express 5 - Neon PostgreSQL - Vercel |
| Nama | Ade Raihan |
| NIM | 2112012414011 |
| Repositori | https://github.com/AdeRaihanH/SiPinjam |

## Pemetaan syarat

| Syarat | Implementasi | Bukti |
| --- | --- | --- |
| API sendiri | Express 5, 17 endpoint, JWT, Neon PostgreSQL | `backend/src`, `docs/API.md` |
| API berjalan publik | Konfigurasi Vercel + `api/index.js` | langkah deploy di README |
| Bottom navigation 5 tab | Katalog, Pinjaman, Scan, Notifikasi, Profil | `TabBar.js` |
| Minimal 5 halaman | 11 layar | daftar di bawah |
| 2 list ke detail | Katalog ke Detail Alat; Pinjaman ke Detail Pinjaman | layar Katalog dan Pinjaman |
| Profil + Tentang | Profil, kebijakan, Tentang | layar Profil dan Tentang |
| QR Code | Kamera, input manual, QR alat/pinjaman | `ScanScreen.js` |
| Source code GitHub | Repo publik | tautan di atas |
| APK | Profil EAS `preview` buildType `apk` | `app/eas.json` |
| Basis data | PostgreSQL (Neon), tabel UUID, `members`, view `tool_stok` | `database/schema.sql` |

### 11 layar

Login, Katalog, Detail Alat, Form Pinjam, Sukses Pinjam, Pinjaman, Detail Pinjaman, Scan, Notifikasi, Profil, Tentang.

## Akun demo

| Akun | NIM | Sandi | Keperluan |
| --- | --- | --- | --- |
| Demo | `2112012414011` | `praktikum123` | Alur pinjam normal; 2 pinjaman aktif |
| Rina | `2112012414099` | `praktikum123` | 2 pinjaman terlambat untuk denda |
| Bagas | `2112012414088` | `praktikum123` | Riwayat selesai |

Akun demo tidak punya pinjaman terlambat agar langkah "pinjam alat baru" pada skrip demo tidak terblokir. Keterlambatan diperagakan dengan akun Rina.

## Persiapan responsi

1. Proyek Neon sudah dibuat dan di-seed (23 November 2026); connection string ada di `backend/.env`.
2. Jalankan `database/schema.sql` lalu `database/seed.sql` di SQL Editor Neon hanya jika ingin mengulang dari awal. `schema.sql` menghapus tabel SiPinjam lama; jangan jalankan di database yang menyimpan data lain.
3. Isi `backend/.env` dari `.env.example` (`DATABASE_URL`, `JWT_SECRET`).
4. `cd backend && npm install && npm run dev`.
5. `cd app && npm install`, lalu `npx expo start -c`. Di development, URL API dideteksi otomatis dari host Metro/browser; `EXPO_PUBLIC_API_URL` hanya wajib untuk build APK/production.
6. Uji login demo di HP.

## Alur responsi 7 menit

### Akun demo - alur utama

1. **Login** dengan NIM `2112012414011` dan sandi `praktikum123`.
2. **Katalog**: tunjukkan ringkasan stok, pencarian, chip kategori, filter "Tersedia", dan foto alat.
3. Cari **"osilo"**, buka **Osiloskop Hantek DSO2D10**. Tunjukkan stok 1/2, kondisi rusak ringan, deskripsi, dan riwayat pinjam.
4. **Pinjam alat** -> atur jumlah -> pilih tanggal (1-3 hari) -> isi catatan -> **Ajukan peminjaman**.
5. Tunjukkan halaman sukses + QR `SIPINJAM:LOAN:...`.
6. **Lihat detail pinjaman** -> tunjukkan status, item, linimasa, QR, dan tombol kembali.
7. **Kembalikan alat** -> konfirmasi -> tunjukkan banner berhasil dan status "Dikembalikan".
8. **Notifikasi** -> tunjukkan pengingat dan tombol **Tandai semua**.
9. **Scan** -> izinkan kamera, pindai QR alat; jika tidak memungkinkan, ketik `ALK-002` di input manual -> hasil scan.
10. **Profil -> Tentang aplikasi** -> tunjukkan versi, base URL API, kredit, dan lisensi.

### Akun Rina - keterlambatan dan denda

1. Keluar, login NIM `2112012414099`.
2. **Pinjaman -> Aktif**: dua kartu berlabel **Terlambat**.
3. Buka pinjaman **PJM-261111-001** (Tang Crimping): tunjukkan denda berjalan Rp2.000, rincian tarif, linimasa, dan QR.
4. Tekan **Kembalikan alat** -> tunjukkan modal denda -> **Ya, kembalikan**.
5. Tunjukkan denda final tercatat dan status berubah.

## Pemeriksaan build

| Pemeriksaan | Hasil |
| --- | --- |
| `npx expo lint` | bersih |
| `npx expo-doctor` | 20/20 |
| Export Android & web | berhasil |

## Yang belum diverifikasi / batasan

1. **Database Neon sudah aktif dan di-seed.** Schema, seed, dan pengujian endpoint/UI lolos pada 23 November 2026.
2. **Vercel belum di-deploy.** Konfigurasi `backend/vercel.json` dan `api/index.js` sudah siap.
3. **APK belum dibangun.** `eas.json` sudah siap; build memerlukan akun Expo/EAS.
4. **Kamera hanya di perangkat.** Pemindaian kamera perlu diuji di HP.
5. **Layar admin/laboran belum ada.** Role tersedia di database; antarmuka admin tidak termasuk cakupan.
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
- [ ] Login demo dan Rina berhasil.
- [ ] Alur pinjam + kembali diuji di HP.
- [ ] Scan kamera diuji di HP.
- [ ] QR halaman sukses bisa dipindai.
- [ ] `expo-doctor` 20/20.
- [ ] Repo GitHub publik dan commit terbaru di-push.
- [ ] APK/tautan EAS siap.
- [ ] README menjelaskan setup Neon, Vercel, dan akun demo.
