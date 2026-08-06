import { addDaysUTC, parseDateOnly, todayKST } from "@/lib/date";

const ROUND_LENGTH_DAYS = 28;
const ROUND_ANCHOR = parseDateOnly("2026-08-03");

export type RoundRange = {
  start: Date;
  end: Date;
  key: string;
  roundNumber: number;
};

function roundNumberFor(reference: Date): number {
  const diffDays = Math.floor((reference.getTime() - ROUND_ANCHOR.getTime()) / 86_400_000);
  return Math.floor(diffDays / ROUND_LENGTH_DAYS) + 1;
}

export function getRoundRangeByNumber(roundNumber: number): RoundRange {
  const start = addDaysUTC(ROUND_ANCHOR, (roundNumber - 1) * ROUND_LENGTH_DAYS);
  const end = addDaysUTC(start, ROUND_LENGTH_DAYS - 1);
  return { start, end, key: String(roundNumber), roundNumber };
}

export function getCurrentRoundRange(): RoundRange {
  return getRoundRangeByNumber(roundNumberFor(todayKST()));
}

export function getRoundRangeByKey(key: string): RoundRange {
  const roundNumber = Number(key);
  return getRoundRangeByNumber(Number.isInteger(roundNumber) ? roundNumber : roundNumberFor(todayKST()));
}

export function formatRoundLabel(range: RoundRange): string {
  const fmt = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${range.roundNumber}회차 (${fmt(range.start)}~${fmt(range.end)})`;
}
