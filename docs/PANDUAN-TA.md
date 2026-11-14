# Panduan Tugas Akhir SiPinjam

Dokumen ini memetakan syarat tugas akhir ke implementasi, menyiapkan alur responsi, dan mencatat batas pengujian secara jujur.

## Identitas

| Item | Isi |
| --- | --- |
| Judul | SiPinjam: Aplikasi Peminjaman Alat Laboratorium Berbasis React Native dengan Pemindaian QR Code |
| Platform | React Native (Expo SDK 58) |
| Nama | Ade Raihan |
| NIM | 2112012414011 |
| Repositori | https://github.com/AdeRaihanH/SiPinjam |
| Asisten | Gavrila Samana Ahmad |

## Pemetaan syarat TA

| Syarat | Implementasi | Bukti |
| --- | --- | --- |
| API sendiri | Express + MySQL, 17 endpoint, JWT, transaksi stok | `backend/src/routes/`, `docs/API.md` |
| Bottom navigation | 5 tab: Katalog, Pinjaman, Scan, Notifikasi, Profil | `app/src/navigation/TabBar.js`, `02-katalog.png` |
| Minimal 5 halaman | 11 layar | daftar di bawah |
| 2 list → detail | Katalog → Detail Alat; Pinjaman → Detail Pinjaman | `03-detail-alat.png`, `05-detail-pinjaman.png` |
| Halaman profil/about | Profil dan Tentang SiPinjam | `10-profil.png`, `11-tentang.png` |
| QR Code | Scan kamera, input manual, QR alat & pinjaman | `ScanScreen.js`, `08-scan.png`, `09-hasil-scan.png` |
| Source code GitHub | Repo publik | tautan di atas |
| Judul unik per platform | SiPinjam | — |
| Bonus APK | Profil EAS `preview` buildType `apk` | `app/eas.json` |

### 11 layar

1. Login
2. Katalog
3. Detail Alat
4. Form Pinjam
5. Sukses Pinjam + QR
6. Pinjaman
7. Detail Pinjaman
8. Scan QR
9. Notifikasi
10. Profil
11. Tentang

## Alur responsi 5 menit

### Persiapan

1. Nyalakan MySQL dan jalankan `npm run db:init` di folder `backend` agar data demo kembali bersih.
2. Jalankan `npm run dev` di `backend`.
3. Jalankan `npx expo start` di `app`; buka di Expo Go.
4. Pastikan HP dan laptop satu jaringan. Jika gagal konek, restart Metro dengan `npx expo start -c`.
5. Siapkan akun demo dan akun uji.

### Skenario A — akun demo (menunjukkan aturan dan denda)

1. **Login** `demo@sipinjam.id` / `sipinjam123`.
2. **Katalog**: tunjukkan sapaan, ringkasan 58 unit tersedia, 2 pinjaman terlambat, pencarian, chip kategori, filter “Tersedia”.
3. Buka **Bor Listrik** atau **Laptop**. Tunjukkan QR alat, kondisi, stok, dan aturan denda. Karena ada pinjaman terlambat, CTA berbunyi “Selesaikan pinjaman dulu” — jelaskan blokir ini disengaja.
4. **Pinjaman** → buka pinjaman **PJM-261110-001** (Arduino, terlambat 1 hari). Tunjukkan status merah, denda berjalan, QR, rincian denda, dan linimasa.
5. Tekan **Kembalikan alat** untuk memperlihatkan sheet konfirmasi dan denda, lalu **Batal** agar data demo tidak berubah. (Kalau ingin mendemokan pengembalian, tekan “Ya, kembalikan”; denda final tercatat.)
6. **Notifikasi**: tunjukkan pengingat jatuh tempo, keterlambatan, dan tombol “Tandai semua”.
7. **Scan**: di perangkat, izinkan kamera lalu pindai QR alat. Jika kamera tidak memungkinkan, gunakan “Masukkan kode manual” → `ALT-001`; hasil scan membuka detail alat.
8. **Profil → Tentang aplikasi**: tunjukkan ringkasan, aturan, teknologi, dan identitas pembuat.

### Skenario B — akun uji (alur pinjam dari nol)

1. Keluar dari akun demo, login `uji@sipinjam.id` / `sipinjam123`.
2. Katalog → Laptop → **Pinjam alat**.
3. Pilih jumlah unit, durasi 1–3 hari, isi catatan, lalu **Ajukan peminjaman**.
4. Tunjukkan halaman sukses + QR pinjaman.
5. **Lihat detail pinjaman** → tunjukkan QR, status, dan tombol kembali.
6. **Kembalikan alat** → konfirmasi → tunjukkan banner “Pengembalian berhasil dicatat” dan status berubah menjadi “Dikembalikan”.
7. Kembali ke **Pinjaman → Selesai** untuk menunjukkan riwayat.

> Jika waktu responsi terbatas, cukup Skenario A untuk menjelaskan aturan, lalu Skenario B sampai halaman sukses QR.

## Bukti pengujian

| Uji | Hasil |
| --- | --- |
| Unit test logika tanggal, denda, kode, QR | `npm test` — lihat output terbaru |
| Bundle Android | `npx expo export --platform android` berhasil |
| Bundle web | `npx expo export --platform web` berhasil |
| Login + auto-login token | Berhasil |
| Stok real-time | Laptop 5 → 4 setelah satu unit dipinjam |
| Stok kurang | `409 STOK_TIDAK_CUKUP` dengan detail unit tersisa |
| Alat ganda | `409 SUDAH_DIPINJAM` |
| Pinjaman terlambat | `409 PINJAMAN_TERLAMBAT` untuk akun demo |
| Denda | 1 hari → Rp2.000; 2 hari → Rp4.000 |
| Scan QR | `ALT-001`, `PJM-...`, dan prefix asing ditolak |
| Notifikasi tanpa cron | Hanya baris `show_at <= NOW()` yang tampil; notifikasi terlambat dibuat saat daftar dibuka |
| Tangkapan layar | 15 gambar 390×844 di `docs/screenshots/` |

Contoh hasil unit test:

```
$ npm test
# tests 10
# pass 10
# fail 0
```

## Batas yang perlu disebutkan

Bagian ini penting agar klaim tidak berlebihan saat ditanya asisten.

1. **Layar admin belum ada.** Skema mengenal role `admin`, dan API mengizinkan admin melihat/mengembalikan pinjaman, tetapi tidak ada antarmuka admin. Ini berada di P2.
2. **Notifikasi in-app, bukan push notification.** Tidak memakai FCM/APNs dan tidak ada cron. Pengingat H-1 dan hari-H ditulis saat pinjaman dibuat dengan kolom `show_at`.
3. **Pembayaran denda tidak terintegrasi.** Denda hanya dicatat di database.
4. **Tangkapan layar dibuat di web** (Chrome headless 390×844) karena kamera tidak tersedia di lingkungan build. Tampilan kamera pada Scan harus diuji di HP Android/iOS. Layout, tipografi, dan komponen lain identik; rasio perangkat asli bisa sedikit berbeda.
5. **APK belum dibangun di mesin ini.** Konfigurasi EAS sudah siap, tetapi build memerlukan akun Expo dan koneksi ke EAS.
6. **Belum ada dark mode, i18n, atau grafik statistik.** Semua itu P2 dan tidak dijanjikan pada rancangan awal.
7. **Pengujian concurrency** stok mengandalkan `SELECT ... FOR UPDATE`, tetapi belum diuji dengan ribuan permintaan paralel. Untuk skala laboratorium, pendekatan ini memadai.

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL mati | Start MySQL di XAMPP Control Panel |
| `Tidak dapat terhubung ke server` di HP | IP API salah / firewall | Pastikan satu Wi-Fi, izinkan port 5000, cek alamat di bawah form login (`__DEV__`) |
| Perubahan `app.json` tidak terbaca | Metro cache | `npx expo start -c` |
| Kamera hitam | Izin belum diberikan | Izinkan kamera, atau gunakan input manual |
| `PINJAMAN_TERLAMBAT` saat mau pinjam | Akun demo punya 2 pinjaman terlambat | Kembalikan dulu, atau login akun uji |
| Data demo berubah setelah responsi | Sudah ada pinjaman/pengembalian baru | Jalankan ulang `npm run db:init` |
| `eas build` minta login | Belum masuk akun Expo | `npx eas-cli login` |

## Checklist sebelum mengumpulkan

- [ ] `npm test` lulus.
- [ ] `npm run db:init` berhasil dan data demo sesuai.
- [ ] Backend jalan di port 5000 dan `/health` mengembalikan `database: connected`.
- [ ] Aplikasi bisa login di HP.
- [ ] Scan kamera diuji di HP.
- [ ] Alur pinjam + kembali diuji dengan akun uji.
- [ ] QR pada halaman sukses dipindai dari tab Scan.
- [ ] Screenshot terbaru tersedia di `docs/screenshots/`.
- [ ] Repo GitHub publik dan commit terbaru sudah di-push.
- [ ] APK/tautan EAS siap (opsional).
- [ ] `README.md` menjelaskan cara menjalankan.
