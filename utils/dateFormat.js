// Small hand-rolled date/time helpers — avoids relying on RN's
// toLocaleDateString (Intl support varies by platform/Hermes build) and
// avoids pulling in a date library for something this small.

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const WEEKDAY_FULL_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Returns an array of weeks, each an array of 7 cells:
// { inMonth: false } for leading/trailing padding, or { inMonth: true, day }.
export function getMonthMatrix(year, month) {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ inMonth: false });
  for (let day = 1; day <= daysInMonth; day++) cells.push({ inMonth: true, day });
  while (cells.length % 7 !== 0) cells.push({ inMonth: false });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// e.g. "Thursday, Oct 26, 2026"
export function formatFullDate(date) {
  if (!date) return '';
  const weekday = WEEKDAY_FULL_NAMES[date.getDay()];
  const month = MONTH_NAMES[date.getMonth()].slice(0, 3);
  return `${weekday}, ${month} ${date.getDate()}, ${date.getFullYear()}`;
}

// time is { hour: 1-12, minute: 0-59, ampm: 'AM' | 'PM' } -> "02:30 PM"
export function formatTime12h(time) {
  if (!time) return '';
  const hh = String(time.hour).padStart(2, '0');
  const mm = String(time.minute).padStart(2, '0');
  return `${hh}:${mm} ${time.ampm}`;
}

// ---- Conversions between the app's { hour: 1-12, minute, ampm } / Date
// values and the plain "YYYY-MM-DD" / "HH:MM:00" strings Postgres date/time
// columns expect. Kept here so both EntryScreen (saving) and the conflict
// checker (comparing) use the exact same rules.

// Date -> "YYYY-MM-DD"
export function dateToPgDate(date) {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// { hour: 1-12, minute, ampm } -> "HH:MM:00" (24-hour)
export function timeObjToPgTime(time) {
  if (!time) return null;
  let hour24 = time.hour % 12;
  if (time.ampm === 'PM') hour24 += 12;
  const hh = String(hour24).padStart(2, '0');
  const mm = String(time.minute).padStart(2, '0');
  return `${hh}:${mm}:00`;
}

// "HH:MM:00" (24-hour, as read back from Postgres) -> { hour: 1-12, minute, ampm }
export function pgTimeToTimeObj(pgTime) {
  if (!pgTime) return null;
  const [hh, mm] = pgTime.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  let hour = hh % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: mm, ampm };
}

// "YYYY-MM-DD" -> Date (local midnight)
export function pgDateToDate(pgDate) {
  if (!pgDate) return null;
  const [y, m, d] = pgDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// "YYYY-MM-DD" + "HH:MM:00" (either or both may be missing) -> a Date
// timestamp, or null if there's no date at all to anchor on.
export function pgDateTimeToTimestamp(pgDate, pgTime) {
  if (!pgDate) return null;
  const [y, m, d] = pgDate.split('-').map(Number);
  if (!pgTime) return new Date(y, m - 1, d);
  const [hh, mm] = pgTime.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0);
}

// Date + { hour, minute, ampm } -> a single Date timestamp (local time).
export function combineDateAndTime(date, time) {
  if (!date) return null;
  if (!time) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let hour24 = time.hour % 12;
  if (time.ampm === 'PM') hour24 += 12;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour24, time.minute, 0);
}
