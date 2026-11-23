-- SiPinjam - data contoh untuk PostgreSQL (Neon)
-- Jalankan setelah schema.sql.
-- Tanggal dibuat relatif terhadap hari ini agar status aktif/terlambat selalu relevan.
-- Akun Ade memiliki 2 pinjaman aktif tanpa keterlambatan agar alur pinjam baru bisa didemokan.
-- Akun admin dipakai untuk mengelola alat dan QR.

set time zone 'Asia/Jakarta';

begin;

truncate table notifications, loan_items, loans, tools, categories, members restart identity cascade;

insert into categories (id, nama, slug, icon) values
  ('11111111-1111-4111-8111-111111111111', 'Elektronika', 'elektronika', 'hardware-chip-outline'),
  ('22222222-2222-4222-8222-222222222222', 'Jaringan', 'jaringan', 'git-network-outline'),
  ('33333333-3333-4333-8333-333333333333', 'Alat Ukur', 'alat-ukur', 'speedometer-outline'),
  ('44444444-4444-4444-8444-444444444444', 'Komponen', 'komponen', 'construct-outline');

insert into members (id, nama, nim, email, password_hash, role) values
  ('a0000001-0000-4000-8000-000000000001', 'Ade Raihan Hanafi', '21120124140118', 'demo@sipinjam.id',
   '$2b$10$wxhtvUvn78p.7jjQr4MpaeUZvKzZVKVlw7MVKEQTb2g0QYm32tade', 'praktikan'),
  ('a0000004-0000-4000-8000-000000000004', 'Admin Laboratorium', '2112012414000', 'admin@sipinjam.id',
   '$2b$10$rbcWrFfH8/RHCre1mhusFeJbfumcOjxtpdba/Jj8B7OqV1i/Qqlba', 'admin');


insert into tools (id, kode, nama, category_id, deskripsi, stok_total, kondisi, foto_url) values
  ('b0000001-0000-4000-8000-000000000001', 'ELK-001', 'Laptop Lenovo ThinkPad T14',
   '11111111-1111-4111-8111-111111111111',
   'Laptop 14 inci untuk praktikum pemrograman, pengolahan data, dan presentasi. Sudah terpasang editor kode dan browser.',
   5, 'baik', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'),

  ('b0000002-0000-4000-8000-000000000002', 'ELK-002', 'Proyektor Epson EB-X06',
   '11111111-1111-4111-8111-111111111111',
   'Proyektor portabel 3LCD 3600 lumen. Termasuk kabel HDMI dan remote untuk presentasi kelompok.',
   2, 'baik', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/6/6b/BenQ_DLP_projector_MP515_20101213.jpg&w=900&h=600&fit=cover'),

  ('b0000003-0000-4000-8000-000000000003', 'ELK-003', 'Papan Arduino Uno R3',
   '11111111-1111-4111-8111-111111111111',
   'Board mikrokontroler ATmega328P untuk praktikum embedded system dan prototipe IoT.',
   8, 'baik', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Arduino_Uno_006.jpg/960px-Arduino_Uno_006.jpg&w=900&h=600&fit=cover'),

  ('b0000004-0000-4000-8000-000000000004', 'ELK-004', 'Raspberry Pi 4 Model B 4GB',
   '11111111-1111-4111-8111-111111111111',
   'Single-board computer untuk proyek IoT, server mini, dan pengolahan citra. Termasuk casing dan adaptor.',
   4, 'baik', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/1/10/Raspberry_Pi_4_Model_B_-_Top.jpg&w=900&h=600&fit=cover'),

  ('b0000005-0000-4000-8000-000000000005', 'JAR-001', 'Router Cisco 1941',
   '22222222-2222-4222-8222-222222222222',
   'Router modular untuk praktikum routing statis, dinamis, dan konfigurasi VLAN. Termasuk kabel konsol.',
   3, 'baik', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'),

  ('b0000006-0000-4000-8000-000000000006', 'JAR-002', 'Switch TP-Link 24 Port',
   '22222222-2222-4222-8222-222222222222',
   'Switch manageable 24 port Gigabit untuk praktikum topologi jaringan dan konfigurasi port.',
   2, 'baik', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/e5/Network_switches.jpg&w=900&h=600&fit=cover'),

  ('b0000007-0000-4000-8000-000000000007', 'JAR-003', 'Tang Crimping RJ45',
   '22222222-2222-4222-8222-222222222222',
   'Tang crimping untuk kabel UTP RJ45 dan RJ11. Dipakai pada praktikum instalasi jaringan.',
   8, 'baik', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'),

  ('b0000008-0000-4000-8000-000000000008', 'JAR-004', 'LAN Tester',
   '22222222-2222-4222-8222-222222222222',
   'Alat uji kabel jaringan yang menampilkan urutan pin 1-8 pada dua unit pengirim dan penerima.',
   5, 'baik', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'),

  ('b0000009-0000-4000-8000-000000000009', 'ALK-001', 'Multimeter Digital Sanwa CD800a',
   '33333333-3333-4333-8333-333333333333',
   'Multimeter digital untuk mengukur tegangan, arus, hambatan, dan uji kontinuitas. Termasuk probe merah dan hitam.',
   3, 'baik', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/2/24/Multimeter_Gossen_Metra_Hit.jpg&w=900&h=600&fit=cover'),

  ('b0000010-0000-4000-8000-000000000010', 'ALK-002', 'Osiloskop Hantek DSO2D10',
   '33333333-3333-4333-8333-333333333333',
   'Osiloskop 2 kanal 100 MHz dengan generator sinyal. Kanal 2 perlu kalibrasi ulang sebelum digunakan.',
   2, 'rusak_ringan', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/0/0e/Tektronix_Oscilloscope_475A.jpg&w=900&h=600&fit=cover'),

  ('b0000011-0000-4000-8000-000000000011', 'ALK-003', 'Power Supply Variable 30V 5A',
   '33333333-3333-4333-8333-333333333333',
   'Catu daya DC yang dapat diatur 0-30V dan 0-5A untuk pengujian rangkaian elektronika.',
   4, 'baik', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80'),

  ('b0000012-0000-4000-8000-000000000012', 'ALK-004', 'Sensor Kit 37 in 1',
   '33333333-3333-4333-8333-333333333333',
   'Paket 37 modul sensor untuk eksperimen mikrokontroler: suhu, jarak, cahaya, gerak, dan lainnya.',
   6, 'baik', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80'),

  ('b0000013-0000-4000-8000-000000000013', 'KOM-001', 'Solder Station Yihua 937D',
   '44444444-4444-4444-8444-444444444444',
   'Stasiun solder dengan pengatur suhu digital, stand besi, dan spons pembersih. Timah solder disediakan terpisah.',
   6, 'baik', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/5/50/Soldering_station.JPG&w=900&h=600&fit=cover'),

  ('b0000014-0000-4000-8000-000000000014', 'KOM-002', 'Obeng Set 32 in 1',
   '44444444-4444-4444-8444-444444444444',
   'Set obeng presisi dengan 32 mata bit untuk membongkar perangkat komputer dan elektronika.',
   10, 'baik', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/2/24/Precision_Screwdriver_Set_2.jpg/960px-Precision_Screwdriver_Set_2.jpg&w=900&h=600&fit=cover'),

  ('b0000015-0000-4000-8000-000000000015', 'KOM-003', 'Bor Listrik Bosch GBM 350',
   '44444444-4444-4444-8444-444444444444',
   'Bor listrik 350 watt untuk pekerjaan perakitan perangkat dan instalasi laboratorium.',
   2, 'baik', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80');

insert into loans
  (id, kode, member_id, tanggal_pinjam, tanggal_kembali_rencana,
   tanggal_kembali_aktual, status, denda, catatan, created_at)
values
  ('d0000001-0000-4000-8000-000000000001',
   concat('PJM-', to_char(current_date - 14, 'YYMMDD'), '-001'),
   'a0000001-0000-4000-8000-000000000001',
   current_date - 14, current_date - 11, current_date - 11, 'dikembalikan', 0,
   'Praktikum pemrograman mobile.', now() - interval '14 days'),

  ('d0000002-0000-4000-8000-000000000002',
   concat('PJM-', to_char(current_date - 12, 'YYMMDD'), '-001'),
   'a0000001-0000-4000-8000-000000000001',
   current_date - 12, current_date - 9, current_date - 10, 'dikembalikan', 0,
   'Praktikum pengukuran rangkaian.', now() - interval '12 days'),

  ('d0000003-0000-4000-8000-000000000003',
   concat('PJM-', to_char(current_date - 20, 'YYMMDD'), '-001'),
   'a0000001-0000-4000-8000-000000000001',
   current_date - 20, current_date - 16, current_date - 14, 'dikembalikan', 4000,
   'Praktikum konfigurasi routing.', now() - interval '20 days'),

  ('d0000004-0000-4000-8000-000000000004',
   concat('PJM-', to_char(current_date - 8, 'YYMMDD'), '-001'),
   'a0000001-0000-4000-8000-000000000001',
   current_date - 8, current_date - 5, current_date - 5, 'dikembalikan', 0,
   'Perbaikan rangkaian kelompok.', now() - interval '8 days'),

  ('d0000005-0000-4000-8000-000000000005',
   concat('PJM-', to_char(current_date - 1, 'YYMMDD'), '-001'),
   'a0000001-0000-4000-8000-000000000001',
   current_date - 1, current_date + 1, null, 'dipinjam', 0,
   'Persiapan presentasi proyek akhir.', now() - interval '1 day'),

  ('d0000006-0000-4000-8000-000000000006',
   concat('PJM-', to_char(current_date, 'YYMMDD'), '-001'),
   'a0000001-0000-4000-8000-000000000001',
   current_date, current_date + 2, null, 'dipinjam', 0,
   'Eksperimen sensor suhu ruang server.', now());


insert into loan_items (id, loan_id, tool_id, jumlah) values
  ('e0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001', 'b0000001-0000-4000-8000-000000000001', 1),
  ('e0000002-0000-4000-8000-000000000002', 'd0000002-0000-4000-8000-000000000002', 'b0000009-0000-4000-8000-000000000009', 1),
  ('e0000003-0000-4000-8000-000000000003', 'd0000003-0000-4000-8000-000000000003', 'b0000005-0000-4000-8000-000000000005', 1),
  ('e0000004-0000-4000-8000-000000000004', 'd0000004-0000-4000-8000-000000000004', 'b0000013-0000-4000-8000-000000000013', 2),
  ('e0000005-0000-4000-8000-000000000005', 'd0000005-0000-4000-8000-000000000005', 'b0000001-0000-4000-8000-000000000001', 1),
  ('e0000006-0000-4000-8000-000000000006', 'd0000006-0000-4000-8000-000000000006', 'b0000012-0000-4000-8000-000000000012', 1);


insert into notifications
  (id, member_id, tipe, judul, pesan, ref_type, ref_id, show_at, dibaca)
values
  ('f0000001-0000-4000-8000-000000000001',
   'a0000001-0000-4000-8000-000000000001', 'jatuh_tempo', 'Pengingat pengembalian',
   concat('Pinjaman ', (select kode from loans where id = 'd0000005-0000-4000-8000-000000000005'),
     ' harus dikembalikan besok. Jangan lupa bawa alatnya.'),
   'loan', 'd0000005-0000-4000-8000-000000000005', now() - interval '2 hours', false),

  ('f0000002-0000-4000-8000-000000000002',
   'a0000001-0000-4000-8000-000000000001', 'jatuh_tempo', 'Pengingat pengembalian',
   concat('Pinjaman ', (select kode from loans where id = 'd0000006-0000-4000-8000-000000000006'),
     ' jatuh tempo dalam dua hari.'),
   'loan', 'd0000006-0000-4000-8000-000000000006', now() + interval '1 day', false),

  ('f0000003-0000-4000-8000-000000000003',
   'a0000001-0000-4000-8000-000000000001', 'pengembalian', 'Pengembalian diterima',
   'Solder Station Yihua 937D dikembalikan tepat waktu. Terima kasih!',
   'loan', 'd0000004-0000-4000-8000-000000000004', now() - interval '3 days', true),

  ('f0000004-0000-4000-8000-000000000004',
   'a0000001-0000-4000-8000-000000000001', 'sistem', 'Selamat datang di SiPinjam',
   'Pinjam alat laboratorium cukup dari ponsel. Pindai QR alat untuk melihat detail dan mengajukan peminjaman.',
   null, null, now() - interval '20 days', true);


commit;
