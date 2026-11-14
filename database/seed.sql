-- Data awal SiPinjam untuk demo dan pengujian.
-- Tanggal dibuat relatif terhadap CURDATE() supaya status pinjaman
-- (aktif, jatuh tempo hari ini, terlambat) tetap masuk akal kapan pun seed
-- dijalankan.

SET time_zone = '+07:00';

INSERT INTO users (id, nama, nim, email, password_hash, role, avatar_url) VALUES
  (1, 'Ade Raihan', '2112012414011', 'demo@sipinjam.id',
   '$2b$10$BFYsd6XbaREFsh2eeG5OMOh2DgvNthqRRy.atuxiiTpPy/blYj9ju',
   'peminjam', NULL),
  -- Akun uji tanpa pinjaman, berguna untuk mencoba alur pinjam dari nol.
  (2, 'Rina Pratama', '2112012414099', 'uji@sipinjam.id',
   '$2b$10$BFYsd6XbaREFsh2eeG5OMOh2DgvNthqRRy.atuxiiTpPy/blYj9ju',
   'peminjam', NULL);

INSERT INTO categories (id, nama, slug, icon) VALUES
  (1, 'Elektronika & Komputer', 'elektronika', 'hardware-chip-outline'),
  (2, 'Alat Ukur', 'alat-ukur', 'speedometer-outline'),
  (3, 'Jaringan', 'jaringan', 'git-network-outline'),
  (4, 'Perkakas', 'perkakas', 'construct-outline');

INSERT INTO tools (id, kode, nama, category_id, deskripsi, stok_total, kondisi, foto_url) VALUES
  (1, 'ALT-001', 'Laptop Lenovo ThinkPad T14', 1,
   'Laptop 14 inci untuk praktikum pemrograman, pengolahan data, dan presentasi. Sudah terpasang editor kode dan browser.', 5, 'baik', NULL),
  (2, 'ALT-002', 'Proyektor Epson EB-X06', 1,
   'Proyektor portabel 3LCD 3600 lumen. Termasuk kabel HDMI dan remote. Cocok untuk presentasi kelompok.', 2, 'baik', NULL),
  (3, 'ALT-003', 'Papan Arduino Uno R3', 1,
   'Board mikrokontroler ATmega328P untuk praktikum embedded system dan prototipe IoT.', 8, 'baik', NULL),
  (4, 'ALT-004', 'Raspberry Pi 4 Model B 4GB', 1,
   'Single-board computer untuk proyek IoT, server mini, dan pengolahan citra. Termasuk casing dan adaptor.', 4, 'baik', NULL),
  (5, 'ALT-005', 'Multimeter Digital Sanwa CD800a', 2,
   'Multimeter digital untuk mengukur tegangan, arus, hambatan, dan uji kontinuitas. Termasuk probe merah dan hitam.', 3, 'baik', NULL),
  (6, 'ALT-006', 'Osiloskop Hantek DSO2D10', 2,
   'Osiloskop 2 kanal 100 MHz dengan generator sinyal. Kanal 2 perlu kalibrasi ulang sebelum digunakan.', 2, 'rusak_ringan', NULL),
  (7, 'ALT-007', 'Power Supply Variable 30V 5A', 2,
   'Catu daya DC yang dapat diatur 0-30V dan 0-5A untuk pengujian rangkaian elektronika.', 4, 'baik', NULL),
  (8, 'ALT-008', 'Solder Station Yihua 937D', 4,
   'Stasiun solder dengan pengatur suhu digital, stand besi, dan spons pembersih. Timah solder disediakan terpisah.', 6, 'baik', NULL),
  (9, 'ALT-009', 'Tang Crimping RJ45', 3,
   'Tang crimping untuk kabel UTP RJ45 dan RJ11. Dipakai pada praktikum instalasi jaringan.', 8, 'baik', NULL),
  (10, 'ALT-010', 'LAN Tester', 3,
   'Alat uji kabel jaringan yang menampilkan urutan pin 1-8 pada dua unit pengirim dan penerima.', 5, 'baik', NULL),
  (11, 'ALT-011', 'Router Cisco 1941', 3,
   'Router modular untuk praktikum routing statis, dinamis, dan konfigurasi VLAN. Termasuk kabel konsol.', 3, 'baik', NULL),
  (12, 'ALT-012', 'Switch TP-Link 24 Port', 3,
   'Switch manageable 24 port Gigabit untuk praktikum topologi jaringan dan konfigurasi port.', 2, 'baik', NULL),
  (13, 'ALT-013', 'Bor Listrik Bosch GBM 350', 4,
   'Bor listrik 350 watt untuk pekerjaan perakitan perangkat dan instalasi laboratorium.', 2, 'baik', NULL),
  (14, 'ALT-014', 'Obeng Set 32 in 1', 4,
   'Set obeng presisi dengan 32 mata bit untuk membongkar perangkat komputer dan elektronika.', 10, 'baik', NULL),
  (15, 'ALT-015', 'Sensor Kit 37 in 1', 1,
   'Paket 37 modul sensor untuk eksperimen mikrokontroler: suhu, jarak, cahaya, gerak, dan lainnya.', 6, 'baik', NULL);

INSERT INTO loans
  (id, kode, user_id, tanggal_pinjam, tanggal_kembali_rencana,
   tanggal_kembali_aktual, status, denda, catatan, created_at)
VALUES
  (1,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%y%m%d'), '-001'),
   1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY),
   NULL, 'dipinjam', 0, 'Untuk praktikum pemrograman mobile.',
   DATE_SUB(NOW(), INTERVAL 1 DAY)),

  (2,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%y%m%d'), '-002'),
   1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY),
   NULL, 'dipinjam', 0, 'Presentasi proposal proyek akhir.',
   DATE_SUB(NOW(), INTERVAL 1 DAY)),

  (3,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 DAY), '%y%m%d'), '-001'),
   1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), CURDATE(),
   NULL, 'dipinjam', 0, 'Praktikum pengukuran rangkaian.',
   DATE_SUB(NOW(), INTERVAL 2 DAY)),

  (4,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 4 DAY), '%y%m%d'), '-001'),
   1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(CURDATE(), INTERVAL 1 DAY),
   NULL, 'dipinjam', 0, 'Proyek akhir mata kuliah sistem tertanam.',
   DATE_SUB(NOW(), INTERVAL 4 DAY)),

  (5,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 DAY), '%y%m%d'), '-001'),
   1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY),
   NULL, 'dipinjam', 0, 'Instalasi jaringan laboratorium.',
   DATE_SUB(NOW(), INTERVAL 6 DAY)),

  (6,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 10 DAY), '%y%m%d'), '-001'),
   1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY),
   DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'dikembalikan', 0, 'Praktikum sinyal analog.',
   DATE_SUB(NOW(), INTERVAL 10 DAY)),

  (7,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 14 DAY), '%y%m%d'), '-001'),
   1, DATE_SUB(CURDATE(), INTERVAL 14 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY),
   DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'dikembalikan', 4000,
   'Praktikum konfigurasi routing.',
   DATE_SUB(NOW(), INTERVAL 14 DAY)),

  (8,
   CONCAT('PJM-', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 12 DAY), '%y%m%d'), '-001'),
   1, DATE_SUB(CURDATE(), INTERVAL 12 DAY), DATE_SUB(CURDATE(), INTERVAL 9 DAY),
   DATE_SUB(CURDATE(), INTERVAL 11 DAY), 'dikembalikan', 0,
   'Perbaikan rangkaian kelompok.',
   DATE_SUB(NOW(), INTERVAL 12 DAY)),

  (9,
   CONCAT('PJM-', DATE_FORMAT(CURDATE(), '%y%m%d'), '-001'),
   1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY),
   NULL, 'dipinjam', 0, 'Praktikum instalasi jaringan.',
   NOW()),

  (10,
   CONCAT('PJM-', DATE_FORMAT(CURDATE(), '%y%m%d'), '-002'),
   1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY),
   NULL, 'dipinjam', 0, 'Proyek monitoring suhu ruang server.',
   NOW());

INSERT INTO loan_items (loan_id, tool_id, jumlah) VALUES
  (1, 1, 1),
  (2, 2, 1),
  (3, 5, 2),
  (4, 3, 2),
  (5, 9, 3),
  (6, 6, 1),
  (7, 11, 1),
  (8, 8, 2),
  (9, 10, 1),
  (10, 4, 1),
  (10, 15, 1);

INSERT INTO notifications
  (id, user_id, tipe, judul, pesan, ref_type, ref_id, show_at, dibaca)
VALUES
  (1, 1, 'sistem', 'Selamat datang di SiPinjam',
   'Pinjam alat laboratorium cukup dari ponsel. Pindai QR alat untuk melihat detail dan ajukan peminjaman.',
   NULL, NULL, DATE_SUB(NOW(), INTERVAL 20 DAY), 1),

  (2, 1, 'pengembalian', 'Pengembalian diterima',
   'Router Cisco 1941 dikembalikan terlambat 2 hari. Denda keterlambatan Rp4.000 dicatat.',
   'loan', 7, DATE_SUB(NOW(), INTERVAL 8 DAY), 1),

  (3, 1, 'jatuh_tempo', 'Jatuh tempo hari ini',
   CONCAT((SELECT kode FROM loans WHERE id = 3),
     ' · Multimeter Digital Sanwa CD800a ×2 jatuh tempo hari ini. Kembalikan sebelum laboratorium tutup.'),
   'loan', 3, TIMESTAMP(CURDATE(), '08:00:00'), 0),

  (4, 1, 'terlambat', 'Pinjaman terlambat',
   CONCAT('Pinjaman ', (SELECT kode FROM loans WHERE id = 4),
     ' terlambat 1 hari. Denda berjalan Rp2.000. Segera kembalikan alat ke laboratorium.'),
   'loan', 4, DATE_SUB(NOW(), INTERVAL 1 DAY), 0),

  (5, 1, 'terlambat', 'Pinjaman terlambat',
   CONCAT('Pinjaman ', (SELECT kode FROM loans WHERE id = 5),
     ' terlambat 3 hari. Denda berjalan Rp6.000. Segera kembalikan alat ke laboratorium.'),
   'loan', 5, DATE_SUB(NOW(), INTERVAL 3 DAY), 0),

  (6, 1, 'jatuh_tempo', 'Pengingat pengembalian',
   CONCAT('Laptop Lenovo ThinkPad T14 ×1 harus dikembalikan besok. Kode pinjaman ',
     (SELECT kode FROM loans WHERE id = 1), '.'),
   'loan', 1, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00'), 0),

  (7, 1, 'sistem', 'Pinjaman berhasil dibuat',
   CONCAT('Pinjaman ', (SELECT kode FROM loans WHERE id = 9),
     ' berhasil dibuat. Tunjukkan QR pinjaman saat mengambil alat di laboratorium.'),
   'loan', 9, NOW(), 0),

  (8, 1, 'pengembalian', 'Pengembalian diterima',
   'Solder Station Yihua 937D ×2 dikembalikan lebih awal. Terima kasih!',
   'loan', 8, DATE_SUB(NOW(), INTERVAL 11 DAY), 1);
