const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Returns "today" in Korea (UTC+9) as a UTC-midnight Date, matching how
 * Prisma stores/reads `@db.Date` columns. Never use `new Date()` directly
 * for week/date-only comparisons — the server's process timezone (UTC on
 * Vercel) does not match Korean wall-clock days near midnight KST.
 */
export function todayKST(): Date {
  const shifted = new Date(Date.now() + KST_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

/** Parses a "yyyy-MM-dd" string into the same UTC-midnight representation. */
export function parseDateOnly(dateStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) throw new Error("Invalid date string: " + dateStr);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysUTC(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
