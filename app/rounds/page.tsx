import Link from "next/link";
import { formatRoundLabel, getCurrentRoundRange, getRoundRangeByKey } from "@/lib/round";
import { getBoardData } from "@/lib/board";
import { WeeklyBoard } from "@/components/WeeklyBoard";

export const dynamic = "force-dynamic";

export default async function RoundsPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const { round } = await searchParams;
  const [range, currentRange] = await Promise.all([
    round ? getRoundRangeByKey(round) : getCurrentRoundRange(),
    getCurrentRoundRange(),
  ]);
  const entries = await getBoardData(range);

  const isCurrentRound = range.roundNumber === currentRange.roundNumber;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/rounds?round=${range.roundNumber - 1}`}
          className="rounded px-3 py-2 text-sm text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          ‹ 이전 회차
        </Link>
        <div className="text-center">
          <h1 className="text-base font-bold">{formatRoundLabel(range)}</h1>
          {isCurrentRound && <p className="text-xs text-blue-600">진행중인 회차</p>}
        </div>
        {isCurrentRound ? (
          <span className="px-3 py-2 text-sm text-gray-300">다음 회차 ›</span>
        ) : (
          <Link
            href={`/rounds?round=${range.roundNumber + 1}`}
            className="rounded px-3 py-2 text-sm text-gray-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            다음 회차 ›
          </Link>
        )}
      </div>
      <WeeklyBoard entries={entries} targetMultiplier={4} />
    </div>
  );
}
