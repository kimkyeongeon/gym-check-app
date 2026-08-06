import { addDaysUTC, formatDateOnly, parseDateOnly, todayKST } from "@/lib/date";

export type WeekRange = {
  start: Date;
  end: Date;
  key: string;
};

/** Builds the Mon-Sun range (UTC-midnight anchored) containing `reference`. */
export function getWeekRange(reference: Date): WeekRange {
  const day = reference.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = (day + 6) % 7; // Mon->0, Tue->1, ..., Sun->6
  const start = addDaysUTC(reference, -diffToMonday);
  const end = addDaysUTC(start, 6);
  return { start, end, key: formatDateOnly(start) };
}

export function getCurrentWeekRange(): WeekRange {
  return getWeekRange(todayKST());
}

export function getWeekRangeByOffset(offset: number): WeekRange {
  return getWeekRange(addDaysUTC(todayKST(), offset * 7));
}

export function getWeekRangeByKey(key: string): WeekRange {
  return getWeekRange(parseDateOnly(key));
}

export function formatWeekLabel(range: WeekRange): string {
  const fmt = (d: Date) => `${d.getUTCMonth() + 1}.${d.getUTCDate()}`;
  return `${fmt(range.start)} - ${fmt(range.end)}`;
}
