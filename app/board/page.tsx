import { getCurrentWeekRange, formatWeekLabel } from "@/lib/week";
import { getBoardData } from "@/lib/board";
import { WeeklyBoard } from "@/components/WeeklyBoard";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const range = getCurrentWeekRange();
  const entries = await getBoardData(range);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold">이번 주 현황판</h1>
        <p className="text-sm text-gray-500">{formatWeekLabel(range)}</p>
      </div>
      <WeeklyBoard entries={entries} />
    </div>
  );
}
