// DOB helpers. The app has no date-picker library, so DOB is entered/edited as a
// `DD/MM/YYYY` string and stored as an ISO `YYYY-MM-DD` date in `profiles.date_of_birth`.

/** Insert slashes as the user types digits: "01021990" -> "01/02/1990". */
export function maskDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join('/');
}

/** "DD/MM/YYYY" -> "YYYY-MM-DD", or null if not a valid calendar date. */
export function parseDobInput(input: string): string | null {
  const m = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const now = new Date().getFullYear();
  if (year < 1900 || year > now) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return `${yyyy}-${mm}-${dd}`;
}

/** "YYYY-MM-DD" -> "DD/MM/YYYY" for display in a text field. */
export function formatDobDisplay(iso: string | null | undefined): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const [, yyyy, mm, dd] = m;
  return `${dd}/${mm}/${yyyy}`;
}

/** True when the stored ISO DOB falls on today's month + day. */
export function isBirthdayToday(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return false;
  const [, , mm, dd] = m;
  const today = new Date();
  const tMonth = String(today.getMonth() + 1).padStart(2, '0');
  const tDay = String(today.getDate()).padStart(2, '0');
  return mm === tMonth && dd === tDay;
}
