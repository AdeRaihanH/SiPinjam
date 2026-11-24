import { env } from '../config/env.js';
import { LOAN_MAX_DAYS } from '../lib/constants.js';
import {
  addDaysISO,
  atJakartaMorning,
  formatTanggal,
  todayISO,
} from '../lib/dates.js';
import { ApiError, asyncHandler, validationError } from '../lib/errors.js';
import {
  buatKodePinjam,
  hitungDenda,
  parseScanCode,
} from '../lib/loanRules.js';
import { sendData, sendList } from '../lib/response.js';
import { serializeLoan } from '../lib/serializers.js';
import { createLoanSchema, loanListSchema } from '../validators/loanValidator.js';
import { kodeParamSchema, uuidParamSchema } from '../validators/toolValidator.js';
import { validate } from '../validators/validate.js';

function assertOwner(loan, member) {
  if (loan.member_id !== member.id && member.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'Anda tidak berhak mengakses pinjaman ini');
  }
}

async function findLoanOrThrow(loans, id) {
  const loan = await loans.findById(id);
  if (!loan) throw new ApiError(404, 'NOT_FOUND', 'Pinjaman tidak ditemukan');
  return loan;
}

function assertReturnDate(returnDate, today) {
  if (returnDate <= today) {
    const message = 'Tanggal kembali minimal besok (durasi 1 hari)';
    throw validationError('tanggal_kembali_rencana', message);
  }

  const lastDate = addDaysISO(today, LOAN_MAX_DAYS);
  if (returnDate > lastDate) {
    throw validationError(
      'tanggal_kembali_rencana',
      `Durasi peminjaman maksimal ${LOAN_MAX_DAYS} hari`,
    );
  }
}

function buildLoanNotifications(loan, memberId, dueDate) {
  const hMinusSatu = addDaysISO(dueDate, -1);
  return [
    {
      member_id: memberId,
      tipe: 'jatuh_tempo',
      judul: 'Pengingat pengembalian',
      pesan: `Pinjaman ${loan.kode} harus dikembalikan besok (${formatTanggal(dueDate)}).`,
      ref_type: 'loan',
      ref_id: loan.id,
      show_at: atJakartaMorning(hMinusSatu),
      dibaca: false,
    },
    {
      member_id: memberId,
      tipe: 'jatuh_tempo',
      judul: 'Jatuh tempo hari ini',
      pesan: `Pinjaman ${loan.kode} jatuh tempo hari ini (${formatTanggal(dueDate)}).`,
      ref_type: 'loan',
      ref_id: loan.id,
      show_at: atJakartaMorning(dueDate),
      dibaca: false,
    },
  ];
}

export function createLoanController({ loans, tools, notifications }) {
  return {
    list: asyncHandler(async (req, res) => {
      const query = validate(loanListSchema, req.query);
      const today = todayISO();
      const isAdmin = req.auth.role === 'admin';
      const { rows, count } = isAdmin
        ? await loans.listAll(query)
        : await loans.listByMember(req.auth.id, query);

      return sendList(res, rows.map((row) => serializeLoan(row, today, { member: true })), {
        total: count,
        limit: query.limit,
        offset: query.offset,
      });
    }),

    detail: asyncHandler(async (req, res) => {
      const { id } = validate(uuidParamSchema, req.params);
      const loan = await findLoanOrThrow(loans, id);
      assertOwner(loan, req.auth);
      return sendData(res, serializeLoan(loan, todayISO(), { member: true }));
    }),

    byKode: asyncHandler(async (req, res) => {
      const params = validate(kodeParamSchema, req.params);
      const kode = parseScanCode(params.kode, 'loan');
      if (!kode) throw new ApiError(404, 'NOT_FOUND', 'Pinjaman tidak ditemukan');

      const loan = await loans.findByKode(kode);
      if (!loan) throw new ApiError(404, 'NOT_FOUND', 'Pinjaman tidak ditemukan');
      assertOwner(loan, req.auth);
      return sendData(res, serializeLoan(loan, todayISO()));
    }),

    create: asyncHandler(async (req, res) => {
      const body = validate(createLoanSchema, req.body);
      const today = todayISO();
      assertReturnDate(body.tanggal_kembali_rencana, today);

      const overdue = await loans.countOverdue(req.auth.id, today);
      if (overdue > 0) {
        throw new ApiError(
          409,
          'CONFLICT',
          'Selesaikan pinjaman yang terlambat terlebih dahulu',
        );
      }

      const toolIds = body.items.map((item) => item.tool_id);
      const toolRows = await tools.findByIds(toolIds);
      if (toolRows.length !== toolIds.length) {
        throw new ApiError(404, 'NOT_FOUND', 'Salah satu alat tidak ditemukan');
      }

      const toolMap = new Map(toolRows.map((tool) => [tool.id, tool]));

      for (const item of body.items) {
        const tool = toolMap.get(item.tool_id);
        if (item.jumlah > Number(tool.stok_tersedia)) {
          throw new ApiError(
            409,
            'STOK_TIDAK_CUKUP',
            `Stok ${tool.nama} tinggal ${Math.max(0, Number(tool.stok_tersedia))}`,
            [{ field: 'items', message: `Stok ${tool.nama} tidak mencukupi` }],
          );
        }
      }

      // Alat yang sama boleh dipinjam lagi di transaksi terpisah selama stok
      // tersedia masih cukup. Stok sudah memperhitungkan seluruh pinjaman aktif.
      const prefix = `PJM-${today.slice(2).replace(/-/g, '')}-`;
      const lastCode = await loans.lastCode(prefix);
      const urutan = lastCode ? Number(lastCode.slice(prefix.length)) + 1 : 1;
      const kode = buatKodePinjam(today, urutan);

      const header = await loans.createHeader({
        kode,
        memberId: req.auth.id,
        tanggalPinjam: today,
        tanggalKembaliRencana: body.tanggal_kembali_rencana,
        catatan: body.catatan,
      });

      try {
        await loans.insertItems(body.items.map((item) => ({
          loan_id: header.id,
          tool_id: item.tool_id,
          jumlah: item.jumlah,
        })));
      } catch (error) {
        await loans.deleteHeader(header.id).catch(() => {});
        throw error;
      }

      try {
        await notifications.insertMany(
          buildLoanNotifications(header, req.auth.id, body.tanggal_kembali_rencana),
        );
      } catch (error) {
        console.error('[sipinjam] gagal membuat notifikasi pinjaman:', error.message);
      }

      const loan = await loans.findById(header.id);
      return sendData(res, serializeLoan(loan, today), 201);
    }),

    returnLoan: asyncHandler(async (req, res) => {
      const { id } = validate(uuidParamSchema, req.params);
      const loan = await findLoanOrThrow(loans, id);
      assertOwner(loan, req.auth);

      if (loan.status === 'dikembalikan') {
        throw new ApiError(409, 'CONFLICT', 'Pinjaman sudah dikembalikan');
      }

      const today = todayISO();
      const denda = hitungDenda(loan.tanggal_kembali_rencana, today, env.dendaPerHari);
      const updated = await loans.updateReturn(id, { actualDate: today, denda });

      if (!updated) {
        throw new ApiError(409, 'CONFLICT', 'Pinjaman sudah dikembalikan');
      }

      // Admin/laboran boleh memproses pengembalian; notifikasi tetap untuk peminjam.
      const ownerId = loan.member_id;
      await notifications.markReadForLoan(ownerId, id).catch(() => {});
      await notifications.insertMany([{
        member_id: ownerId,
        tipe: 'pengembalian',
        judul: 'Pengembalian diterima',
        pesan: denda > 0
          ? `Pinjaman ${loan.kode} dikembalikan terlambat. Denda Rp${denda.toLocaleString('id-ID')} dicatat.`
          : `Pinjaman ${loan.kode} dikembalikan tepat waktu.`,
        ref_type: 'loan',
        ref_id: id,
        show_at: new Date().toISOString(),
        dibaca: false,
      }]).catch(() => {});

      const detail = await loans.findById(id);
      return sendData(res, serializeLoan(detail, today, { member: true }));
    }),
  };
}
