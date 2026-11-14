-- Skema database SiPinjam
-- MySQL 8 / MariaDB 10.4+
--
-- Cara termudah: `npm run db:init` di folder backend (membuat database dari
-- DB_NAME lalu menjalankan schema.sql dan seed.sql).
--
-- Impor manual: buat/pilih database terlebih dahulu (mis. `sipinjam`), baru
-- jalankan file ini. File ini tidak membuat database agar bisa dipakai pada
-- layanan cloud yang tidak memberikan izin CREATE DATABASE.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS loan_items;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS tools;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama          VARCHAR(100) NOT NULL,
  nim           VARCHAR(20) NOT NULL,
  email         VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('peminjam', 'admin') NOT NULL DEFAULT 'peminjam',
  avatar_url    VARCHAR(255) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_nim (nim),
  UNIQUE KEY uq_users_email (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE categories (
  id    TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama  VARCHAR(60) NOT NULL,
  slug  VARCHAR(60) NOT NULL,
  icon  VARCHAR(60) NOT NULL DEFAULT 'cube-outline',
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE tools (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  kode        VARCHAR(20) NOT NULL,
  nama        VARCHAR(120) NOT NULL,
  category_id TINYINT UNSIGNED NOT NULL,
  deskripsi   TEXT NULL,
  stok_total  SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  kondisi     ENUM('baik', 'rusak_ringan', 'rusak_berat') NOT NULL DEFAULT 'baik',
  foto_url    VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tools_kode (kode),
  KEY idx_tools_category (category_id),
  KEY idx_tools_nama (nama),
  CONSTRAINT fk_tools_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE loans (
  id                       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  kode                     VARCHAR(20) NOT NULL,
  user_id                  INT UNSIGNED NOT NULL,
  tanggal_pinjam           DATE NOT NULL,
  tanggal_kembali_rencana  DATE NOT NULL,
  tanggal_kembali_aktual   DATE NULL,
  status                   ENUM('dipinjam', 'dikembalikan') NOT NULL DEFAULT 'dipinjam',
  denda                    INT UNSIGNED NOT NULL DEFAULT 0,
  catatan                  VARCHAR(255) NULL,
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_loans_kode (kode),
  KEY idx_loans_user_status (user_id, status),
  KEY idx_loans_due (tanggal_kembali_rencana),
  CONSTRAINT fk_loans_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE loan_items (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  loan_id  INT UNSIGNED NOT NULL,
  tool_id  INT UNSIGNED NOT NULL,
  jumlah   SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_loan_items (loan_id, tool_id),
  KEY idx_loan_items_tool (tool_id),
  CONSTRAINT fk_loan_items_loan FOREIGN KEY (loan_id)
    REFERENCES loans (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_loan_items_tool FOREIGN KEY (tool_id)
    REFERENCES tools (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id   INT UNSIGNED NOT NULL,
  tipe      ENUM('jatuh_tempo', 'terlambat', 'pengembalian', 'sistem') NOT NULL DEFAULT 'sistem',
  judul     VARCHAR(120) NOT NULL,
  pesan     VARCHAR(500) NOT NULL,
  ref_type  ENUM('loan', 'tool') NULL,
  ref_id    INT UNSIGNED NULL,
  show_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dibaca    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_user_show (user_id, show_at),
  KEY idx_notif_unread (user_id, dibaca),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
