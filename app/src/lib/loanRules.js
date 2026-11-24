import { formatRupiah } from './format';

// Samakan dengan aturan backend di `backend/src/config/env.js` dan
// `backend/src/controllers/loanController.js`.
export const LOAN_MAX_DAYS = 3;
export const LOAN_FINE_PER_DAY = 2000;

const LOAN_MAX_TOOLS = 3;

export const LOAN_RULES_TEXT =
  `Maksimal ${LOAN_MAX_TOOLS} jenis alat dan ${LOAN_MAX_DAYS} hari per transaksi. `
  + `Denda ${formatRupiah(LOAN_FINE_PER_DAY)} per hari keterlambatan.`;
