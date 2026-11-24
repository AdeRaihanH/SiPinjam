-- SiPinjam - data dasar PostgreSQL (Neon)
-- Jalankan setelah schema.sql.
--
-- File ini hanya mengisi kategori master yang dibutuhkan formulir alat.
-- Tidak ada akun, alat, pinjaman, atau notifikasi contoh.
--
-- Membuat admin pertama:
-- Jalankan SQL berikut di SQL Editor Neon, ganti NIM dan sandi sesuai kebutuhan.
-- pgcrypto sudah diaktifkan oleh schema.sql.
--
-- insert into members (nama, nim, password_hash, role)
-- values (
--   'Admin Laboratorium',
--   '0000000000',
--   crypt('ganti-sandi-ini', gen_salt('bf')),
--   'admin'
-- )
-- on conflict (nim) do update
--   set nama = excluded.nama,
--       password_hash = excluded.password_hash,
--       role = 'admin';
--
-- Praktikan mendaftar sendiri lewat layar Login -> Daftar praktikan.

begin;

insert into categories (id, nama, slug, icon) values
  ('11111111-1111-4111-8111-111111111111', 'Elektronika', 'elektronika', 'hardware-chip-outline'),
  ('22222222-2222-4222-8222-222222222222', 'Jaringan', 'jaringan', 'git-network-outline'),
  ('33333333-3333-4333-8333-333333333333', 'Alat Ukur', 'alat-ukur', 'speedometer-outline'),
  ('44444444-4444-4444-8444-444444444444', 'Komponen', 'komponen', 'construct-outline')
on conflict (slug) do update
  set nama = excluded.nama,
      icon = excluded.icon;

commit;
