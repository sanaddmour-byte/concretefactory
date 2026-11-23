/**
 * Calendar-date rules shared by the visit picker (browser) and the server action, so both always agree.
 * Business time is Asia/Amman: "today" is the calendar day in Amman, whatever the visitor's or server's own timezone is.
 * No imports on purpose: this file is unit-tested directly by Node.
 */
export const BUSINESS_TZ = "Asia/Amman";

/** Calendar date (YYYY-MM-DD) of `now` in Amman. */
export function ammanToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** True only for a real calendar date written YYYY-MM-DD (rejects 2026-02-30, 2026-13-01, 2026-00-10...). */
export function isRealDate(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = Sunday ... 6 = Saturday (the weekday of that calendar date, timezone independent). */
export const weekdayOf = (iso: string): number => new Date(`${iso}T00:00:00Z`).getUTCDay();

/** Earliest bookable visit: tomorrow in Amman. At 00:30 on 24 November in Amman this is 25 November. */
export const earliestVisitDate = (now: Date = new Date()): string => addDays(ammanToday(now), 1);

export type VisitDateCheck = "ok" | "invalid" | "past" | "closed";

/** `closedDays` null means the owner has not supplied them yet: nothing is rejected for that reason. */
export function checkVisitDate(iso: string, closedDays: readonly number[] | null, now: Date = new Date()): VisitDateCheck {
  if (!isRealDate(iso)) return "invalid";
  if (iso < earliestVisitDate(now)) return "past";
  if (closedDays && closedDays.includes(weekdayOf(iso))) return "closed";
  return "ok";
}
