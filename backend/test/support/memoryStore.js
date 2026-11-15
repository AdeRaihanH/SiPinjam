import { randomUUID } from 'node:crypto';
import { env } from '../../src/config/env.js';
import { addDaysISO, diffDaysISO, todayISO } from '../../src/lib/dates.js';
import { ApiError } from '../../src/lib/errors.js';
import { buatKodePinjam } from '../../src/lib/loanRules.js';

const PASSWORD_HASH = '$2b$10$wxhtvUvn78p.7jjQr4MpaeUZvKzZVKVlw7MVKEQTb2g0QYm32tade';

const CATEGORIES = [
  { id: '11111111-1111-4111-8111-111111111111', nama: 'Elektronika', slug: 'elektronika', icon: 'hardware-chip-outline' },
  { id: '22222222-2222-4222-8222-222222222222', nama: 'Jaringan', slug: 'jaringan', icon: 'git-network-outline' },
  { id: '33333333-3333-4333-8333-333333333333', nama: 'Alat Ukur', slug: 'alat-ukur', icon: 'speedometer-outline' },
  { id: '44444444-4444-4444-8444-444444444444', nama: 'Komponen', slug: 'komponen', icon: 'construct-outline' },
];

const MEMBERS = [
  { id: 'a0000001-0000-4000-8000-000000000001', nama: 'Ade Raihan', nim: '2112012414011', email: 'demo@sipinjam.id', role: 'praktikan', avatar_url: null },
  { id: 'a0000002-0000-4000-8000-000000000002', nama: 'Rina Pratama', nim: '2112012414099', email: 'rina@sipinjam.id', role: 'praktikan', avatar_url: null },
  { id: 'a0000003-0000-4000-8000-000000000003', nama: 'Bagas Nugraha', nim: '2112012414088', email: 'bagas@sipinjam.id', role: 'praktikan', avatar_url: null },
];

const PHOTO = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80';

const TOOLS = [
  ['b0000001-0000-4000-8000-000000000001', 'ELK-001', 'Laptop Lenovo ThinkPad T14', 0, 5, 'baik', 'Laptop 14 inci untuk praktikum pemrograman, pengolahan data, dan presentasi.', PHOTO],
  ['b0000002-0000-4000-8000-000000000002', 'ELK-002', 'Proyektor Epson EB-X06', 0, 2, 'baik', 'Proyektor portabel 3LCD 3600 lumen untuk presentasi kelompok.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/6/6b/BenQ_DLP_projector_MP515_20101213.jpg&w=900&h=600&fit=cover'],
  ['b0000003-0000-4000-8000-000000000003', 'ELK-003', 'Papan Arduino Uno R3', 0, 8, 'baik', 'Board mikrokontroler ATmega328P untuk praktikum embedded system.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Arduino_Uno_006.jpg/960px-Arduino_Uno_006.jpg&w=900&h=600&fit=cover'],
  ['b0000004-0000-4000-8000-000000000004', 'ELK-004', 'Raspberry Pi 4 Model B 4GB', 0, 4, 'baik', 'Single-board computer untuk proyek IoT dan server mini.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/1/10/Raspberry_Pi_4_Model_B_-_Top.jpg&w=900&h=600&fit=cover'],
  ['b0000005-0000-4000-8000-000000000005', 'JAR-001', 'Router Cisco 1941', 1, 3, 'baik', 'Router modular untuk praktikum routing statis, dinamis, dan VLAN.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'],
  ['b0000006-0000-4000-8000-000000000006', 'JAR-002', 'Switch TP-Link 24 Port', 1, 2, 'baik', 'Switch manageable 24 port Gigabit untuk praktikum topologi jaringan.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/e5/Network_switches.jpg&w=900&h=600&fit=cover'],
  ['b0000007-0000-4000-8000-000000000007', 'JAR-003', 'Tang Crimping RJ45', 1, 8, 'baik', 'Tang crimping untuk kabel UTP RJ45 dan RJ11.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'],
  ['b0000008-0000-4000-8000-000000000008', 'JAR-004', 'LAN Tester', 1, 5, 'baik', 'Alat uji kabel jaringan yang menampilkan urutan pin 1-8.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'],
  ['b0000009-0000-4000-8000-000000000009', 'ALK-001', 'Multimeter Digital Sanwa CD800a', 2, 3, 'baik', 'Multimeter digital untuk mengukur tegangan, arus, dan hambatan.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/2/24/Multimeter_Gossen_Metra_Hit.jpg&w=900&h=600&fit=cover'],
  ['b0000010-0000-4000-8000-000000000010', 'ALK-002', 'Osiloskop Hantek DSO2D10', 2, 2, 'rusak_ringan', 'Osiloskop 2 kanal 100 MHz. Kanal 2 perlu kalibrasi ulang.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/0/0e/Tektronix_Oscilloscope_475A.jpg&w=900&h=600&fit=cover'],
  ['b0000011-0000-4000-8000-000000000011', 'ALK-003', 'Power Supply Variable 30V 5A', 2, 4, 'baik', 'Catu daya DC 0-30V dan 0-5A untuk pengujian rangkaian.', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80'],
  ['b0000012-0000-4000-8000-000000000012', 'ALK-004', 'Sensor Kit 37 in 1', 2, 6, 'baik', 'Paket 37 modul sensor untuk eksperimen mikrokontroler.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80'],
  ['b0000013-0000-4000-8000-000000000013', 'KOM-001', 'Solder Station Yihua 937D', 3, 6, 'baik', 'Stasiun solder dengan pengatur suhu digital dan stand besi.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/5/50/Soldering_station.JPG&w=900&h=600&fit=cover'],
  ['b0000014-0000-4000-8000-000000000014', 'KOM-002', 'Obeng Set 32 in 1', 3, 10, 'baik', 'Set obeng presisi dengan 32 mata bit untuk perangkat elektronika.', 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/2/24/Precision_Screwdriver_Set_2.jpg/960px-Precision_Screwdriver_Set_2.jpg&w=900&h=600&fit=cover'],
  ['b0000015-0000-4000-8000-000000000015', 'KOM-003', 'Bor Listrik Bosch GBM 350', 3, 2, 'baik', 'Bor listrik 350 watt untuk perakitan perangkat dan instalasi.', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80'],
];

function createSeed() {
  const today = todayISO();
  const day = (offset) => addDaysISO(today, offset);
  const at = (offset) => new Date(Date.now() + offset * 86400000).toISOString();

  const tools = TOOLS.map(([id, kode, nama, categoryIndex, stok, kondisi, deskripsi, foto]) => ({
    id,
    kode,
    nama,
    category_id: CATEGORIES[categoryIndex].id,
    deskripsi,
    stok_total: stok,
    kondisi,
    foto_url: foto,
    created_at: at(-30),
  }));

  const members = MEMBERS.map((member) => ({
    ...member,
    password_hash: PASSWORD_HASH,
    created_at: at(-30),
  }));

  const loans = [
    ['d0000001', -14, -11, -11, 'dikembalikan', 0, 0, 'Praktikum pemrograman mobile.'],
    ['d0000002', -12, -9, -10, 'dikembalikan', 0, 0, 'Praktikum pengukuran rangkaian.'],
    ['d0000003', -20, -16, -14, 'dikembalikan', 0, 4000, 'Praktikum konfigurasi routing.'],
    ['d0000004', -8, -5, -5, 'dikembalikan', 0, 0, 'Perbaikan rangkaian kelompok.'],
    ['d0000005', -1, 1, null, 'dipinjam', 0, 0, 'Persiapan presentasi proyek akhir.'],
    ['d0000006', 0, 2, null, 'dipinjam', 0, 0, 'Eksperimen sensor suhu ruang server.'],
    ['d0000007', -6, -2, null, 'dipinjam', 1, 0, 'Praktikum sinyal analog.'],
    ['d0000008', -4, -1, null, 'dipinjam', 1, 0, 'Instalasi jaringan laboratorium.'],
    ['d0000009', -10, -7, -7, 'dikembalikan', 1, 0, 'Presentasi proposal.'],
    ['d0000010', -9, -6, -6, 'dikembalikan', 2, 0, 'Praktikum catu daya.'],
  ].map(([shortId, pinjam, due, actual, status, memberIndex, denda, catatan], index) => ({
    id: `${shortId}-0000-4000-8000-0000000000${String(index + 1).padStart(2, '0')}`,
    kode: buatKodePinjam(day(pinjam), 1),
    member_id: MEMBERS[memberIndex].id,
    tanggal_pinjam: day(pinjam),
    tanggal_kembali_rencana: day(due),
    tanggal_kembali_aktual: actual == null ? null : day(actual),
    status,
    denda,
    catatan,
    created_at: at(pinjam),
  }));

  const items = [
    ['d0000001', 'b0000001', 1],
    ['d0000002', 'b0000009', 1],
    ['d0000003', 'b0000005', 1],
    ['d0000004', 'b0000013', 2],
    ['d0000005', 'b0000001', 1],
    ['d0000006', 'b0000012', 1],
    ['d0000007', 'b0000010', 1],
    ['d0000008', 'b0000007', 3],
    ['d0000009', 'b0000002', 1],
    ['d0000010', 'b0000011', 1],
  ].map(([loanShort, toolShort, jumlah], index) => ({
    id: `e000000${index + 1}-0000-4000-8000-00000000000${index + 1}`,
    loan_id: `${loanShort}-0000-4000-8000-0000000000${String(loans.findIndex((loan) => loan.id.startsWith(loanShort)) + 1).padStart(2, '0')}`,
    tool_id: `${toolShort}-0000-4000-8000-0000000000${toolShort.slice(-2)}`,
    jumlah,
  }));

  const notifications = [
    ['f1', 0, 'jatuh_tempo', 'Pengingat pengembalian', 'Pinjaman harus dikembalikan besok. Jangan lupa bawa alatnya.', 'loan', 'd0000005', -0.1, false],
    ['f2', 0, 'jatuh_tempo', 'Pengingat pengembalian', 'Pinjaman jatuh tempo dalam dua hari.', 'loan', 'd0000006', 1, false],
    ['f3', 0, 'pengembalian', 'Pengembalian diterima', 'Solder Station Yihua 937D dikembalikan tepat waktu.', 'loan', 'd0000004', -3, true],
    ['f4', 0, 'sistem', 'Selamat datang di SiPinjam', 'Pinjam alat laboratorium cukup dari ponsel.', null, null, -20, true],
    ['f5', 1, 'terlambat', 'Pinjaman terlambat', 'Pinjaman terlambat 2 hari. Denda berjalan Rp4.000.', 'loan', 'd0000007', -2, false],
    ['f6', 1, 'terlambat', 'Pinjaman terlambat', 'Pinjaman terlambat 1 hari. Denda berjalan Rp2.000.', 'loan', 'd0000008', -1, false],
    ['f7', 1, 'jatuh_tempo', 'Jatuh tempo terlewat', 'Pinjaman sudah melewati jatuh tempo.', 'loan', 'd0000007', -3, true],
    ['f8', 2, 'pengembalian', 'Pengembalian diterima', 'Power Supply Variable dikembalikan tepat waktu.', 'loan', 'd0000010', -6, true],
  ].map(([shortId, memberIndex, tipe, judul, pesan, refType, loanShort, dayOffset, dibaca], index) => ({
    id: `f000000${index + 1}-0000-4000-8000-00000000000${index + 1}`,
    member_id: MEMBERS[memberIndex].id,
    tipe,
    judul,
    pesan,
    ref_type: refType,
    ref_id: loanShort
      ? `${loanShort}-0000-4000-8000-0000000000${String(loans.findIndex((loan) => loan.id.startsWith(loanShort)) + 1).padStart(2, '0')}`
      : null,
    show_at: at(dayOffset),
    dibaca,
  }));

  return {
    categories: CATEGORIES.map((row) => ({ ...row })),
    members,
    tools,
    loans,
    loanItems: items,
    notifications,
  };
}

function makeId(prefix) {
  return `${prefix}-${randomUUID()}`;
}

export function createMemoryStore() {
  return createSeed();
}

export function createMemoryModels(store) {
  const today = todayISO();

  function categoryFor(tool) {
    return store.categories.find((category) => category.id === tool.category_id) || null;
  }

  function toolView(tool) {
    const active = store.loanItems
      .filter((item) => item.tool_id === tool.id)
      .filter((item) => {
        const loan = store.loans.find((row) => row.id === item.loan_id);
        return loan?.status === 'dipinjam';
      })
      .reduce((total, item) => total + item.jumlah, 0);
    return {
      ...tool,
      stok_tersedia: Math.max(0, tool.stok_total - active),
      categories: categoryFor(tool),
    };
  }

  function toolRows() {
    return store.tools.map(toolView);
  }

  function loanItems(loanId) {
    return store.loanItems
      .filter((item) => item.loan_id === loanId)
      .map((item) => {
        const tool = store.tools.find((row) => row.id === item.tool_id);
        return {
          ...item,
          tools: tool ? { ...tool, categories: categoryFor(tool) } : null,
        };
      });
  }

  function loanRow(loan) {
    return {
      ...loan,
      members: store.members.find((member) => member.id === loan.member_id) || null,
      loan_items: loanItems(loan.id),
    };
  }

  function loanRows(filter = () => true) {
    return store.loans
      .filter(filter)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map(loanRow);
  }

  const members = {
    async findByNim(nim) {
      return store.members.find((member) => member.nim === nim) || null;
    },
    async findById(id) {
      return store.members.find((member) => member.id === id) || null;
    },
  };

  const categories = {
    async list() {
      return [...store.categories].sort((a, b) => a.nama.localeCompare(b.nama));
    },
  };

  const tools = {
    async list({ search, categoryId, tersedia, limit, offset }) {
      const term = search?.toLowerCase();
      let rows = toolRows().filter((tool) => {
        if (term && !tool.nama.toLowerCase().includes(term) && !tool.kode.toLowerCase().includes(term)) {
          return false;
        }
        if (categoryId && tool.category_id !== categoryId) return false;
        if ((tersedia === '1' || tersedia === 'true') && tool.stok_tersedia <= 0) return false;
        return true;
      });
      rows = rows.sort((a, b) => a.nama.localeCompare(b.nama));
      return { rows: rows.slice(offset, offset + limit), count: rows.length };
    },
    async findById(id) {
      const tool = store.tools.find((row) => row.id === id);
      return tool ? toolView(tool) : null;
    },
    async findByKode(kode) {
      const tool = store.tools.find((row) => row.kode === kode);
      return tool ? toolView(tool) : null;
    },
    async findByIds(ids) {
      return toolRows().filter((tool) => ids.includes(tool.id));
    },
    async recentLoans(toolId, limit = 5) {
      return loanRows((loan) => store.loanItems.some(
        (item) => item.loan_id === loan.id && item.tool_id === toolId,
      ))
        .map((loan) => ({
          ...loan,
          loan_items: loan.loan_items.filter((item) => item.tool_id === toolId),
        }))
        .sort((a, b) => b.tanggal_pinjam.localeCompare(a.tanggal_pinjam))
        .slice(0, limit);
    },
  };

  const loans = {
    async listByMember(memberId, { status, limit, offset }) {
      const rows = loanRows((loan) => {
        if (loan.member_id !== memberId) return false;
        if (status === 'aktif') return loan.status === 'dipinjam';
        if (status === 'selesai') return loan.status === 'dikembalikan';
        return true;
      });
      return { rows: rows.slice(offset, offset + limit), count: rows.length };
    },
    async findById(id) {
      const loan = store.loans.find((row) => row.id === id);
      return loan ? loanRow(loan) : null;
    },
    async findByKode(kode) {
      const loan = store.loans.find((row) => row.kode === kode);
      return loan ? loanRow(loan) : null;
    },
    async countOverdue(memberId, date) {
      return store.loans.filter((loan) => (
        loan.member_id === memberId
        && loan.status === 'dipinjam'
        && loan.tanggal_kembali_rencana < date
      )).length;
    },
    async activeToolIds(memberId, toolIds) {
      const activeLoanIds = new Set(store.loans
        .filter((loan) => loan.member_id === memberId && loan.status === 'dipinjam')
        .map((loan) => loan.id));
      return [...new Set(store.loanItems
        .filter((item) => activeLoanIds.has(item.loan_id) && toolIds.includes(item.tool_id))
        .map((item) => item.tool_id))];
    },
    async lastCode(prefix) {
      const codes = store.loans
        .map((loan) => loan.kode)
        .filter((kode) => kode.startsWith(prefix))
        .sort();
      return codes.at(-1) || null;
    },
    async createHeader(payload) {
      const row = {
        id: randomUUID(),
        kode: payload.kode,
        member_id: payload.memberId,
        tanggal_pinjam: payload.tanggalPinjam,
        tanggal_kembali_rencana: payload.tanggalKembaliRencana,
        tanggal_kembali_aktual: null,
        status: 'dipinjam',
        denda: 0,
        catatan: payload.catatan || null,
        created_at: new Date().toISOString(),
      };
      store.loans.push(row);
      return row;
    },
    async insertItems(rows) {
      for (const row of rows) {
        store.loanItems.push({ id: randomUUID(), ...row });
      }
    },
    async deleteHeader(id) {
      store.loans = store.loans.filter((loan) => loan.id !== id);
      store.loanItems = store.loanItems.filter((item) => item.loan_id !== id);
    },
    async updateReturn(id, { actualDate, denda }) {
      const loan = store.loans.find((row) => row.id === id);
      if (!loan || loan.status === 'dikembalikan') return null;
      loan.status = 'dikembalikan';
      loan.tanggal_kembali_aktual = actualDate;
      loan.denda = denda;
      return { id };
    },
  };

  const notifications = {
    async list(memberId, { limit, offset }) {
      const now = new Date().toISOString();
      const rows = store.notifications
        .filter((row) => row.member_id === memberId && row.show_at <= now)
        .sort((a, b) => b.show_at.localeCompare(a.show_at));
      return { rows: rows.slice(offset, offset + limit), count: rows.length };
    },
    async unreadCount(memberId) {
      const now = new Date().toISOString();
      return store.notifications.filter((row) => (
        row.member_id === memberId && !row.dibaca && row.show_at <= now
      )).length;
    },
    async markRead(id, memberId) {
      const row = store.notifications.find((item) => item.id === id && item.member_id === memberId);
      if (!row) return false;
      row.dibaca = true;
      return true;
    },
    async markAll(memberId) {
      const now = new Date().toISOString();
      const rows = store.notifications.filter((row) => (
        row.member_id === memberId && !row.dibaca && row.show_at <= now
      ));
      rows.forEach((row) => { row.dibaca = true; });
      return rows.length;
    },
    async insertMany(rows) {
      for (const row of rows) {
        store.notifications.push({ id: randomUUID(), ...row });
      }
    },
    async markReadForLoan(memberId, loanId) {
      store.notifications
        .filter((row) => (
          row.member_id === memberId
          && row.ref_type === 'loan'
          && row.ref_id === loanId
          && ['jatuh_tempo', 'terlambat'].includes(row.tipe)
        ))
        .forEach((row) => { row.dibaca = true; });
    },
  };

  const stats = {
    async summary(memberId, date) {
      const rows = toolRows();
      const totalUnit = rows.reduce((total, row) => total + row.stok_total, 0);
      const tersediaUnit = rows.reduce((total, row) => total + row.stok_tersedia, 0);
      const memberLoans = store.loans.filter((loan) => loan.member_id === memberId);
      let aktif = 0;
      let selesai = 0;
      let terlambat = 0;
      let dendaBerjalan = 0;
      let dendaSelesai = 0;

      for (const loan of memberLoans) {
        if (loan.status === 'dikembalikan') {
          selesai += 1;
          dendaSelesai += loan.denda;
          continue;
        }
        aktif += 1;
        const hari = Math.max(0, diffDaysISO(loan.tanggal_kembali_rencana, date));
        if (hari > 0) {
          terlambat += 1;
          dendaBerjalan += hari * env.dendaPerHari;
        }
      }

      return {
        total_alat: rows.length,
        total_unit: totalUnit,
        tersedia_unit: tersediaUnit,
        dipinjam_unit: totalUnit - tersediaUnit,
        total_pinjaman: memberLoans.length,
        aktif,
        selesai,
        terlambat,
        denda_berjalan: dendaBerjalan,
        denda_selesai: dendaSelesai,
        notifikasi_belum_dibaca: await notifications.unreadCount(memberId),
        denda_per_hari: env.dendaPerHari,
      };
    },
    async populer(limit = 5) {
      const map = new Map();
      for (const item of store.loanItems) {
        const tool = toolRows().find((row) => row.id === item.tool_id);
        if (!tool) continue;
        const current = map.get(tool.id) || { ...tool, total_dipinjam: 0 };
        current.total_dipinjam += item.jumlah;
        map.set(tool.id, current);
      }
      return [...map.values()]
        .sort((a, b) => b.total_dipinjam - a.total_dipinjam)
        .slice(0, limit);
    },
  };

  return { members, categories, tools, loans, notifications, stats };
}

export { PASSWORD_HASH };
