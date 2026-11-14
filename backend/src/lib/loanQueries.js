const { ApiError } = require('./http');
const { serializeLoan } = require('./serializers');

async function getLoanDetail(executor, loanId, user) {
  const [rows] = await executor.query(
    `SELECT l.*, u.nama AS user_nama, u.nim AS user_nim
     FROM loans l
     JOIN users u ON u.id = l.user_id
     WHERE l.id = ? LIMIT 1`,
    [loanId],
  );

  if (!rows.length) {
    throw new ApiError(404, 'NOT_FOUND', 'Pinjaman tidak ditemukan');
  }

  const loan = rows[0];
  const isAdmin = user && user.role === 'admin';
  if (loan.user_id !== user?.id && !isAdmin) {
    throw new ApiError(403, 'FORBIDDEN', 'Anda tidak berhak melihat pinjaman ini');
  }

  const [items] = await executor.query(
    `SELECT li.id, li.tool_id, li.jumlah,
            t.kode, t.nama,
            c.id AS kategori_id, c.nama AS kategori_nama,
            c.slug AS kategori_slug, c.icon AS kategori_icon
     FROM loan_items li
     JOIN tools t ON t.id = li.tool_id
     JOIN categories c ON c.id = t.category_id
     WHERE li.loan_id = ?
     ORDER BY li.id ASC`,
    [loanId],
  );

  return {
    ...serializeLoan(loan, items),
    peminjam: {
      id: loan.user_id,
      nama: loan.user_nama,
      nim: loan.user_nim,
    },
  };
}

module.exports = { getLoanDetail };
