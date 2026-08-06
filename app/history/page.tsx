import Link from "next/link";
import { addDaysUTC, formatDateOnly } from "@/lib/date";
import { formatWeekLabel, getCurrentWeekRange, getWeekRangeByKey } from "@/lib/week";
import { getBoardData } from "@/lib/board";
import { WeeklyBoard } from "@/components/WeeklyBoard";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const range = week ? getWeekRangeByKey(week) : getCurrentWeekRange();
  const entries = await getBoardData(range);

  const prevKey = formatDateOnly(addDaysUTC(range.start, -7));
  const nextKey = formatDateOnly(addDaysUTC(range.start, 7));
  const isCurrentWeek = range.key === getCurrentWeekRange().key;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/history?week=${prevKey}`}
          className="rounded px-3 py-2 text-sm text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ‹ 이전 주
        </Link>
        <div className="text-center">
          <h1 className="text-base font-bold">{formatWeekLabel(range)}</h1>
          {isCurrentWeek && <p className="text-xs text-blue-600">이번 주</p>}
        </div>
        {isCurrentWeek ? (
          <span className="px-3 py-2 text-sm text-gray-300">다음 주 ›</span>
        ) : (
          <Link
            href={`/history?week=${nextKey}`}
            className="rounded px-3 py-2 text-sm text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            다음 주 ›
          </Link>
        )}
      </div>
      <WeeklyBoard entries={entries} />
    </div>
  );
}
