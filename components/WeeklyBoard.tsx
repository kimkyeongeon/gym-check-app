"use client";

import { useState } from "react";
import type { BoardEntry, BoardLog } from "@/lib/board";
import { PhotoModal } from "@/components/PhotoModal";

export function WeeklyBoard({
  entries,
  targetMultiplier = 1,
  showPhotos = true,
}: {
  entries: BoardEntry[];
  targetMultiplier?: number;
  showPhotos?: boolean;
}) {
  const [openLog, setOpenLog] = useState<BoardLog | null>(null);

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">등록된 멤버가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(({ member, achieved, logs }) => {
        const target = member.weeklyGoal * targetMultiplier;
        const pct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;
        const done = achieved >= target;

        return (
          <div key={member.id} className="rounded-xl border border-black/10 p-3 dark:border-white/10">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{member.name}</span>
              <span className={`text-sm font-semibold ${done ? "text-green-600" : "text-gray-500"}`}>
                {achieved}/{target} {done ? "완료" : "진행중"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div
                className={`h-full rounded-full ${done ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {showPhotos && logs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {logs.map((log) => (
                  <button
                    key={log.id}
                    type="button"
                    onClick={() => setOpenLog(log)}
                    className="h-12 w-12 overflow-hidden rounded-lg border border-black/10 dark:border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/photo/${log.id}`}
                      alt={`${member.name} ${log.date}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {showPhotos && openLog && <PhotoModal log={openLog} onClose={() => setOpenLog(null)} />}
    </div>
  );
}
