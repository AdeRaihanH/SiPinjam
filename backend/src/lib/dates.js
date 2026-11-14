const DAY_MS = 24 * 60 * 60 * 1000;
const TIME_ZONE = 'Asia/Jakarta';

function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function isDateISO(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function addDaysISO(isoDate, amount) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Tanggal tidak valid: ${isoDate}`);
  date.setUTCDate(date.getUTCDate() + Number(amount));
  return date.toISOString().slice(0, 10);
}

function diffDaysISO(fromISO, toISO) {
  const from = Date.parse(`${fromISO}T00:00:00Z`);
  const to = Date.parse(`${toISO}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) throw new Error('Tanggal tidak valid');
  return Math.round((to - from) / DAY_MS);
}

function lateDays(dueISO, today = todayISO()) {
  return Math.max(0, diffDaysISO(dueISO, today));
}

function formatTanggal(isoDate) {
  if (!isoDate) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

module.exports = {
  DAY_MS,
  TIME_ZONE,
  todayISO,
  isDateISO,
  addDaysISO,
  diffDaysISO,
  lateDays,
  formatTanggal,
};
