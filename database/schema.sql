-- SiPinjam - skema PostgreSQL (Neon)
-- Jalankan seluruh file ini di database Neon SEBELUM bootstrap.sql.
--
-- Catatan keamanan:
-- - Database hanya diakses backend Express lewat DATABASE_URL; tidak ada akses langsung dari app.
-- - Tidak ada PostgREST/anon key, jadi tidak ada grant khusus yang diperlukan.
-- - RLS tidak dipakai karena otorisasi dilakukan di Express (JWT + pengecekan pemilik).

create extension if not exists pgcrypto;

drop view if exists tool_stok;
drop table if exists notifications cascade;
drop table if exists loan_items cascade;
drop table if exists loans cascade;
drop table if exists tools cascade;
drop table if exists categories cascade;
drop table if exists members cascade;

set time zone 'Asia/Jakarta';

create table categories (
  id    uuid primary key default gen_random_uuid(),
  nama  text not null,
  slug  text unique not null,
  icon  text
);

create table members (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  nim           text unique not null,
  email         text,
  password_hash text not null,
  role          text not null default 'praktikan'
                check (role in ('praktikan', 'laboran', 'admin')),
  avatar_url    text,
  created_at    timestamptz not null default now()
);

create table tools (
  id          uuid primary key default gen_random_uuid(),
  kode        text unique not null,
  nama        text not null,
  category_id uuid references categories(id) on delete set null,
  deskripsi   text,
  stok_total  integer not null default 0 check (stok_total >= 0),
  kondisi     text not null default 'baik'
              check (kondisi in ('baik', 'rusak_ringan', 'rusak_berat')),
  foto_url    text,
  created_at  timestamptz not null default now()
);

create table loans (
  id                      uuid primary key default gen_random_uuid(),
  kode                    text unique not null,
  member_id               uuid not null references members(id),
  tanggal_pinjam          date not null default current_date,
  tanggal_kembali_rencana date not null,
  tanggal_kembali_aktual  date,
  status                  text not null default 'dipinjam'
                          check (status in ('dipinjam', 'dikembalikan')),
  denda                   integer not null default 0,
  catatan                 text,
  created_at              timestamptz not null default now(),
  check (tanggal_kembali_rencana >= tanggal_pinjam)
);

create table loan_items (
  id      uuid primary key default gen_random_uuid(),
  loan_id uuid not null references loans(id) on delete cascade,
  tool_id uuid not null references tools(id),
  jumlah  integer not null default 1 check (jumlah > 0),
  unique (loan_id, tool_id)
);

create table notifications (
  id        uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  tipe      text not null,
  judul     text not null,
  pesan     text,
  ref_type  text,
  ref_id    uuid,
  show_at   timestamptz not null default now(),
  dibaca    boolean not null default false
);

create index loans_member_status_idx on loans (member_id, status);
create index loan_items_tool_idx on loan_items (tool_id);
create index notifications_member_idx on notifications (member_id, show_at);
create index tools_category_idx on tools (category_id);

create or replace view tool_stok as
select
  t.*,
  t.stok_total - coalesce((
    select sum(li.jumlah)
    from loan_items li
    join loans l on l.id = li.loan_id
    where li.tool_id = t.id and l.status = 'dipinjam'
  ), 0) as stok_tersedia
from tools t;
