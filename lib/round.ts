import { addDaysUTC, parseDateOnly, todayKST } from "@/lib/date";
import { getSetting, setSetting } from "@/lib/settings";

const ROUND_LENGTH_DAYS = 28;
const DEFAULT_ROUND_ANCHOR = "2026-08-10";
export const ROUND_ANCHOR_SETTING_KEY = "roundAnchorDate";

export type RoundRange = {
  start: Date;
  end: Date;
  key: string;
  roundNumber: number;
};

export async function getRoundAnchor(): Promise<Date> {
  const stored = await getSetting(ROUND_ANCHOR_SETTING_KEY);
  return parseDateOnly(stored ?? DEFAULT_ROUND_ANCHOR);
}

export async function setRoundAnchor(dateStr: string): Promise<void> {
  parseDateOnly(dateStr); // validate format
  await setSetting(ROUND_ANCHOR_SETTING_KEY, dateStr);
}

function roundNumberFor(reference: Date, anchor: Date): number {
  const diffDays = Math.floor((reference.getTime() - anchor.getTime()) / 86_400_000);
  return Math.floor(diffDays / ROUND_LENGTH_DAYS) + 1;
}

function buildRange(anchor: Date, roundNumber: number): RoundRange {
  const start = addDaysUTC(anchor, (roundNumber - 1) * ROUND_LENGTH_DAYS);
  const end = addDaysUTC(start, ROUND_LENGTH_DAYS - 1);
  return { start, end, key: String(roundNumber), roundNumber };
}

export async function getCurrentRoundRange(): Promise<RoundRange> {
  const anchor = await getRoundAnchor();
  return buildRange(anchor, roundNumberFor(todayKST(), anchor));
}

export async function getRoundRangeByKey(key: string): Promise<RoundRange> {
  const anchor = await getRoundAnchor();
  const roundNumber = Number(key);
  return buildRange(anchor, Number.isInteger(roundNumber) ? roundNumber : roundNumberFor(todayKST(), anchor));
}

export function formatRoundLabel(range: RoundRange): string {
  const fmt = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${range.roundNumber}회차 (${fmt(range.start)}~${fmt(range.end)})`;
}
